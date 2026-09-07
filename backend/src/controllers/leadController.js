import Lead from '../models/Lead.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyUser } from '../utils/audit.js';

const refNo=()=>`LEAD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
const baseFilter=(req)=>req.user.role==='sales'?{$or:[{createdBy:req.user._id},{assignedTo:req.user._id}]}:{};
export const listLeads=asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter=baseFilter(req);
  if(req.query.status) filter.status=req.query.status; if(req.query.priority) filter.priority=req.query.priority;
  if(req.query.search){const re=new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'); filter.$and=[{$or:[{leadTitle:re},{contactName:re},{organization:re},{email:re}]}];}
  const [items,total]=await Promise.all([Lead.find(filter).populate('assignedTo','fullName').populate('createdBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),Lead.countDocuments(filter)]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});
export const createLead=asyncHandler(async(req,res)=>{
  const assignedTo=req.user.role==='sales'?req.user._id:(req.body.assignedTo||req.user._id);
  if(!req.body.leadTitle||!req.body.contactName) return res.status(422).json({success:false,message:'Lead title and contact name are required',errors:[]});
  const lead=await Lead.create({...req.body,leadNo:refNo(),attachment:req.file?.path||'',assignedTo,createdBy:req.user._id});
  await logActivity(req,{action:'LEAD_CREATED',module:'leads',entityType:'Lead',entityId:lead._id,description:`Created lead ${lead.leadNo}`});
  if(String(assignedTo)!==String(req.user._id)) await notifyUser(assignedTo,{title:'New lead assigned',message:`${lead.leadTitle} has been assigned to you.`,type:'info',link:'/sales/leads'});
  return ok(res,lead,'Lead created successfully',201);
});
export const updateLead=asyncHandler(async(req,res)=>{
  const lead=await Lead.findOneAndUpdate({_id:req.params.id,...(req.user.role==='sales'?{assignedTo:req.user._id}:{})},req.body,{new:true,runValidators:true});
  if(!lead)return res.status(404).json({success:false,message:'Lead not found',errors:[]});
  await logActivity(req,{action:'LEAD_UPDATED',module:'leads',entityType:'Lead',entityId:lead._id,description:`Updated lead ${lead.leadNo}`});
  return ok(res,lead,'Lead updated successfully');
});
