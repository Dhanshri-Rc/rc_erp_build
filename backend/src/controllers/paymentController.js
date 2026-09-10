import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyUser, notifyRoles } from '../utils/audit.js';
import mongoose from 'mongoose';
import crypto from 'crypto';

const receiptNo=()=>`REC/${new Date().getFullYear()}/${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

async function syncSource(payment, session) {
  const Model=payment.sourceType==='authorship'?AuthorshipSale:PublicationService;
  const source=await Model.findById(payment.sourceId).session(session);
  if(!source)return;
  const [{verified=0}={}] = await Payment.aggregate([
    {$match:{sourceType:payment.sourceType,sourceId:payment.sourceId,status:'verified'}},
    {$group:{_id:null,verified:{$sum:'$amount'}}}
  ]).session(session);
  const total=payment.sourceType==='authorship'?source.totalPrice:source.totalAmount;
  const accepted=Math.min(verified,total);
  if(payment.sourceType==='authorship') source.advancePayment=accepted; else source.advanceAmount=accepted;
  source.remainingAmount=Math.max(total-accepted,0);
  source.paymentStatus=accepted>=total?'paid':accepted>0?'partial':'pending';
  await source.save({session});
}

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
  const session=await mongoose.startSession();
  try{
    let payment,receipt;
    await session.withTransaction(async()=>{
      payment=await Payment.findOneAndUpdate({_id:req.params.id,status:'pending'},{$set:{status:'verified',notes:req.body.notes||'',verifiedBy:req.user._id,verifiedAt:new Date()}},{new:true,runValidators:true,session});
      if(!payment){const error=new Error('Pending payment not found');error.status=404;throw error;}
      await syncSource(payment,session);
      [receipt]=await Receipt.create([{receiptNo:receiptNo(),payment:payment._id,vendor:payment.vendor,amount:payment.amount,paymentMode:payment.paymentMode,transactionId:payment.transactionId,transactionDate:payment.transactionDate,generatedBy:req.user._id}],{session});
      await logActivity(req,{action:'PAYMENT_VERIFIED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Verified payment ${payment.paymentNo}`,metadata:{receiptNo:receipt.receiptNo,amount:payment.amount}},{session});
      await notifyUser(payment.submittedBy,{title:'Payment verified',message:`Payment ${payment.paymentNo} has been verified. Receipt ${receipt.receiptNo} generated.`,type:'success',link:'/sales/activities'},{session});
      await notifyRoles(['admin'],{title:'Payment verified',message:`${payment.paymentNo} verified for ₹${payment.amount.toLocaleString('en-IN')}.`,type:'success',link:'/admin/accounting'},{session});
    });
    return ok(res,{payment,receipt},'Payment verified successfully');
  }finally{await session.endSession();}
});
export const rejectPayment=asyncHandler(async(req,res)=>{
  const session=await mongoose.startSession();
  try{
    let payment;
    await session.withTransaction(async()=>{
      payment=await Payment.findOneAndUpdate({_id:req.params.id,status:'pending'},{$set:{status:'rejected',notes:req.body.notes||'Rejected during finance verification',verifiedBy:req.user._id,verifiedAt:new Date()}},{new:true,runValidators:true,session});
      if(!payment){const error=new Error('Pending payment not found');error.status=404;throw error;}
      await syncSource(payment,session);
      await logActivity(req,{action:'PAYMENT_REJECTED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Rejected payment ${payment.paymentNo}`},{session});
      await notifyUser(payment.submittedBy,{title:'Payment rejected',message:`Payment ${payment.paymentNo} was rejected. ${payment.notes}`,type:'danger',link:'/sales/activities'},{session});
    });
    return ok(res,payment,'Payment rejected');
  }finally{await session.endSession();}
});
export const receipts=asyncHandler(async(req,res)=>ok(res,await Receipt.find().populate('vendor','vendorName').populate('payment').populate('generatedBy','fullName').sort({createdAt:-1}).limit(100)));
