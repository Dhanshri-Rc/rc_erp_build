import Vendor from '../models/Vendor.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity } from '../utils/audit.js';

function ownership(req, filter = {}) {
  if (req.user.role === 'sales') filter.assignedTo = req.user._id;
  return filter;
}
export const listVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = ownership(req, {});
  if (req.query.employee && req.user.role === 'admin') filter.assignedTo = req.query.employee;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.businessType) filter.businessType = req.query.businessType;
  if (req.query.search) {
    const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ vendorName: re }, { email: re }, { mobile: re }, { contactPerson: re }];
  }
  const [items, total] = await Promise.all([
    Vendor.find(filter).populate('assignedTo','fullName username').populate('createdBy','fullName').sort({ createdAt:-1 }).skip(skip).limit(limit),
    Vendor.countDocuments(filter)
  ]);
  return ok(res, { items, pagination: paginateMeta(page, limit, total) });
});
export const createVendor = asyncHandler(async (req, res) => {
  const required = ['vendorName','businessType','address','city','state','country','postalCode','mobile','email'];
  if (required.some((k) => !req.body[k])) return res.status(422).json({ success:false, message:'Please complete all required vendor fields', errors:[] });
  const assignedTo = req.user.role === 'sales' ? req.user._id : (req.body.assignedTo || req.user._id);
  const vendor = await Vendor.create({ ...req.body, createdBy:req.user._id, assignedTo });
  await logActivity(req, { action:'VENDOR_CREATED', module:'vendors', entityType:'Vendor', entityId:vendor._id, description:`Added vendor ${vendor.vendorName}` });
  return ok(res, vendor, 'Vendor created successfully', 201);
});
export const getVendor = asyncHandler(async (req, res) => {
  const filter = ownership(req, { _id:req.params.id });
  const vendor = await Vendor.findOne(filter).populate('assignedTo','fullName username');
  if (!vendor) return res.status(404).json({ success:false, message:'Vendor not found', errors:[] });
  return ok(res, vendor);
});
export const updateVendor = asyncHandler(async (req,res) => {
  const filter = ownership(req,{_id:req.params.id});
  const vendor = await Vendor.findOneAndUpdate(filter, req.body, {new:true, runValidators:true});
  if (!vendor) return res.status(404).json({success:false,message:'Vendor not found',errors:[]});
  await logActivity(req,{action:'VENDOR_UPDATED',module:'vendors',entityType:'Vendor',entityId:vendor._id,description:`Updated vendor ${vendor.vendorName}`});
  return ok(res,vendor,'Vendor updated successfully');
});
