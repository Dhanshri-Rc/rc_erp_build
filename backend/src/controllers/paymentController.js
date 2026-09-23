import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyUser, notifyRoles } from '../utils/audit.js';
import crypto from 'crypto';

const receiptNo=()=>`REC/${new Date().getFullYear()}/${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

async function syncSource(payment) {
  const Model=payment.sourceType==='authorship'?AuthorshipSale:PublicationService;
  const source=await Model.findById(payment.sourceId);
  if(!source)return;
  const [{verified=0}={}] = await Payment.aggregate([
    {$match:{sourceType:payment.sourceType,sourceId:payment.sourceId,status:'verified'}},
    {$group:{_id:null,verified:{$sum:'$amount'}}}
  ]);
  const total=payment.sourceType==='authorship'?source.totalPrice:source.totalAmount;
  const accepted=Math.min(verified,total);
  if(payment.sourceType==='authorship') source.advancePayment=accepted; else source.advanceAmount=accepted;
  source.remainingAmount=Math.max(total-accepted,0);
  source.paymentStatus=accepted>=total?'paid':accepted>0?'partial':'pending';
  await source.save();
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
  const payment=await Payment.findOneAndUpdate(
    {_id:req.params.id,status:'pending'},
    {$set:{status:'verified',notes:req.body.notes||'',verifiedBy:req.user._id,verifiedAt:new Date()}},
    {new:true,runValidators:true}
  );
  if(!payment){const error=new Error('Pending payment not found');error.status=404;throw error;}
  let receipt;
  try{
    await syncSource(payment);
    receipt=await Receipt.create({receiptNo:receiptNo(),payment:payment._id,vendor:payment.vendor,amount:payment.amount,paymentMode:payment.paymentMode,transactionId:payment.transactionId,transactionDate:payment.transactionDate,generatedBy:req.user._id});
  }catch(error){
    await Payment.updateOne(
      {_id:payment._id,status:'verified'},
      {$set:{status:'pending',notes:''},$unset:{verifiedBy:1,verifiedAt:1}}
    ).catch(()=>{});
    await Receipt.deleteOne({payment:payment._id}).catch(()=>{});
    await syncSource(payment).catch(()=>{});
    throw error;
  }
  await Promise.allSettled([
    logActivity(req,{action:'PAYMENT_VERIFIED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Verified payment ${payment.paymentNo}`,metadata:{receiptNo:receipt.receiptNo,amount:payment.amount}}),
    notifyUser(payment.submittedBy,{title:'Payment verified',message:`Payment ${payment.paymentNo} has been verified. Receipt ${receipt.receiptNo} generated.`,type:'success',link:'/sales/activities'}),
    notifyRoles(['admin'],{title:'Payment verified',message:`${payment.paymentNo} verified for ${payment.currency||'INR'} ${payment.amount.toLocaleString('en-IN')}.`,type:'success',link:'/admin/accounting'})
  ]);
  return ok(res,{payment,receipt},'Payment verified successfully');
});
export const rejectPayment=asyncHandler(async(req,res)=>{
  const payment=await Payment.findOneAndUpdate(
    {_id:req.params.id,status:'pending'},
    {$set:{status:'rejected',notes:req.body.notes||'Rejected during finance verification',verifiedBy:req.user._id,verifiedAt:new Date()}},
    {new:true,runValidators:true}
  );
  if(!payment){const error=new Error('Pending payment not found');error.status=404;throw error;}
  try{
    await syncSource(payment);
  }catch(error){
    await Payment.updateOne(
      {_id:payment._id,status:'rejected'},
      {$set:{status:'pending',notes:''},$unset:{verifiedBy:1,verifiedAt:1}}
    ).catch(()=>{});
    await syncSource(payment).catch(()=>{});
    throw error;
  }
  await Promise.allSettled([
    logActivity(req,{action:'PAYMENT_REJECTED',module:'accounting',entityType:'Payment',entityId:payment._id,description:`Rejected payment ${payment.paymentNo}`}),
    notifyUser(payment.submittedBy,{title:'Payment rejected',message:`Payment ${payment.paymentNo} was rejected. ${payment.notes}`,type:'danger',link:'/sales/activities'})
  ]);
  return ok(res,payment,'Payment rejected');
});
export const receipts=asyncHandler(async(req,res)=>ok(res,await Receipt.find().populate('vendor','vendorName').populate('payment').populate('generatedBy','fullName').sort({createdAt:-1}).limit(100)));
