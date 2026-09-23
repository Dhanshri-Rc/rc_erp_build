import Client from '../models/Client.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { pick } from '../utils/input.js';
import { logActivity } from '../utils/audit.js';

const fields = ['clientName','businessType','contactPerson','email','mobile','department','college','address','notes','status'];

export const listClients = asyncHandler(async (req,res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { createdBy:req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.businessType) filter.businessType = req.query.businessType;
  if (req.query.search) {
    const re = new RegExp(req.query.search.replace(/[.*+?^$()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{clientName:re},{contactPerson:re},{email:re},{mobile:re},{college:re}];
  }
  const [items,total] = await Promise.all([
    Client.find(filter).sort({createdAt:-1}).skip(skip).limit(limit),
    Client.countDocuments(filter)
  ]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});

export const createClient = asyncHandler(async (req,res) => {
  if (!req.body.clientName || !['B-B','B-C'].includes(req.body.businessType)) return res.status(422).json({success:false,message:'Client name and a valid business type (B-B or B-C) are required',errors:[]});
  const client = await Client.create({...pick(req.body,fields),createdBy:req.user._id});
  await logActivity(req,{action:'CLIENT_CREATED',module:'clients',entityType:'Client',entityId:client._id,description:`Added client ${client.clientName}`});
  return ok(res,client,'Client created successfully',201);
});

export const getClient = asyncHandler(async (req,res) => {
  const client = await Client.findOne({_id:req.params.id,createdBy:req.user._id});
  if (!client) return res.status(404).json({success:false,message:'Client not found',errors:[]});
  return ok(res,client);
});

export const updateClient = asyncHandler(async (req,res) => {
  const changes = pick(req.body,fields);
  if (changes.businessType && !['B-B','B-C'].includes(changes.businessType)) return res.status(422).json({success:false,message:'Business type must be B-B or B-C',errors:[]});
  const client = await Client.findOneAndUpdate({_id:req.params.id,createdBy:req.user._id},changes,{new:true,runValidators:true});
  if (!client) return res.status(404).json({success:false,message:'Client not found',errors:[]});
  return ok(res,client,'Client updated successfully');
});

export const deleteClient = asyncHandler(async (req,res) => {
  const client = await Client.findOneAndDelete({_id:req.params.id,createdBy:req.user._id});
  if (!client) return res.status(404).json({success:false,message:'Client not found',errors:[]});
  await logActivity(req,{action:'CLIENT_DELETED',module:'clients',entityType:'Client',entityId:client._id,description:`Deleted client ${client.clientName}`});
  return ok(res,null,'Client deleted successfully');
});
