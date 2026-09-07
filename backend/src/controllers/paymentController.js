import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyUser, notifyRoles } from '../utils/audit.js';

export const listPayments=asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter={};
  if(req.user.role==='sales') filter.submittedBy=req.user._id;
  if(req.query.status) filter.status=req.query.status;
  const [items,total]=await Promise.all([Payment.find(filter).populate('vendor','vendorName contactPerson').populate('submittedBy','fullName').populate('verifiedBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),Payment.countDocuments(filter)]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});
export const getPayment=asyncHandler(async(req,res)=>{
  const filter={_id:req.params.id}; if(req.user.role==='sales') filter.submittedBy=req.user._id;
  const payment=await Payment.findOne(filter).populate('vendor').populate('submittedBy','fullName email').populate('verifiedBy','fullName');
  if(!payment)return res.status(404).json({success:false,message:'Payment not found',errors:[]});
  return ok(res,payment);
});
export const verifyPayment=asyncHandler(async(req,res)=>{
  const payment=await Payment.findOne({_id:req.params.id,status:'pending'});
  if(!payment)return res.status(404).json({success:false,message:'Pending payment not found',errors:[]});
  payment.status='verified'; payment.notes=req.body.notes||''; payment.verifiedBy=req.user._id; payment.verifiedAt=new Date(); await payment.save();
  const source=payment.sourceType==='authorship'?await AuthorshipSale.findById(payment.sourceId):await PublicationService.findById(payment.sourceId);
  if(source){
    const total=payment.sourceType==='authorship'?source.totalPrice:source.totalAmount;
    const currentAdvance=payment.sourceType==='authorship'?source.advancePayment:source.advanceAmount;
    source.paymentStatus=currentAdvance>=total?'paid':'partial'; await source.save();
  }
  const year=new Date().getFullYear(); const seq=await Receipt.countDocuments({createdAt:{$gte:new Date(`${year}-01-01`)}})+1;
  const receipt=await Receipt.create({receiptNo:`REC/${year}/${String(seq).padStart(4,'0')}`,payment:payment._id,vendor:payment.vendor,amount:payment.amount,paymentMode:payment.paymentMode,transactionId:payment.transactionId,transactionDate:payment.transactionDate,generatedBy:req.user._id});
  await logActivity(req,{action:'PAYMENT_VERIFIED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Verified payment ${payment.paymentNo}`,metadata:{receiptNo:receipt.receiptNo,amount:payment.amount}});
  await notifyUser(payment.submittedBy,{title:'Payment verified',message:`Payment ${payment.paymentNo} has been verified. Receipt ${receipt.receiptNo} generated.`,type:'success',link:'/sales/activities'});
  await notifyRoles(['admin'],{title:'Payment verified',message:`${payment.paymentNo} verified for ₹${payment.amount.toLocaleString('en-IN')}.`,type:'success',link:'/admin/accounting'});
  return ok(res,{payment,receipt},'Payment verified successfully');
});
export const rejectPayment=asyncHandler(async(req,res)=>{
  const payment=await Payment.findOne({_id:req.params.id,status:'pending'}); if(!payment)return res.status(404).json({success:false,message:'Pending payment not found',errors:[]});
  payment.status='rejected'; payment.notes=req.body.notes||'Rejected during finance verification'; payment.verifiedBy=req.user._id; payment.verifiedAt=new Date(); await payment.save();
  await logActivity(req,{action:'PAYMENT_REJECTED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Rejected payment ${payment.paymentNo}`});
  await notifyUser(payment.submittedBy,{title:'Payment rejected',message:`Payment ${payment.paymentNo} was rejected. ${payment.notes}`,type:'danger',link:'/sales/activities'});
  return ok(res,payment,'Payment rejected');
});
export const receipts=asyncHandler(async(req,res)=>ok(res,await Receipt.find().populate('vendor','vendorName').populate('payment').populate('generatedBy','fullName').sort({createdAt:-1}).limit(100)));
