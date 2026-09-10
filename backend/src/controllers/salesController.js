import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import Article from '../models/Article.js';
import Vendor from '../models/Vendor.js';
import Payment from '../models/Payment.js';
import { asyncHandler, ok, pagination, paginateMeta } from '../utils/http.js';
import { logActivity, notifyRoles } from '../utils/audit.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs/promises';

const refNo = (prefix) => `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
const ownership = (req, filter={}) => { if(req.user.role==='sales') filter.createdBy=req.user._id; return filter; };
const removeUploadedFile = async (file) => { if (file?.path) await fs.unlink(file.path).catch(() => {}); };

export const listAuthorship = asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter=ownership(req,{});
  const [items,total]=await Promise.all([
    AuthorshipSale.find(filter).populate('journal','name shortName').populate('article','title').populate('vendor','vendorName').populate('createdBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),
    AuthorshipSale.countDocuments(filter)
  ]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});

export const createAuthorship = asyncHandler(async(req,res)=>{
  const { journal, article, vendor, numberOfAuthors, advancePayment=0, authors, paymentAccount, paymentMode, transactionId, transactionDate, remarks }=req.body;
  const n=Number(numberOfAuthors), advance=Number(advancePayment||0);
  if(!journal||!article||!vendor||!authors||!Number.isInteger(n)||n<1) { await removeUploadedFile(req.file); return res.status(422).json({success:false,message:'Please complete all required authorship sale fields',errors:[]}); }
  const ownedVendor=await Vendor.findOne({_id:vendor,...(req.user.role==='sales'?{assignedTo:req.user._id}:{})});
  if(!ownedVendor) { await removeUploadedFile(req.file); return res.status(403).json({success:false,message:'Vendor is not available to this user',errors:[]}); }
  const session=await mongoose.startSession();
  try {
    let sale;
    await session.withTransaction(async()=>{
      const updatedArticle=await Article.findOneAndUpdate({_id:article,journal,availablePOS:{$gte:n},status:{$ne:'inactive'},pricePerAuthor:{$gt:0}},{$inc:{availablePOS:-n}},{new:false,session});
      if(!updatedArticle){const error=new Error('The requested author positions are no longer available or pricing is not configured');error.status=409;throw error;}
      const total=updatedArticle.pricePerAuthor*n;
      if(!Number.isFinite(advance)||advance<0||advance>total){const error=new Error('Advance payment must be between 0 and the server-calculated total price');error.status=422;throw error;}
      [sale]=await AuthorshipSale.create([{ saleNo:refNo('AS'),journal,article,vendor,availablePOSAtSale:updatedArticle.availablePOS,numberOfAuthors:n,totalPrice:total,pricePerAuthor:updatedArticle.pricePerAuthor,advancePayment:advance,remainingAmount:total,authors,paymentAccount,paymentMode,transactionId,transactionDate,paymentProof:req.file?.path||'',remarks,createdBy:req.user._id,paymentStatus:'pending' }],{session});
      if(advance>0){
        await Payment.create([{paymentNo:refNo('PAY'),sourceType:'authorship',sourceId:sale._id,vendor,amount:advance,paymentMode,transactionId,transactionDate,proof:req.file?.path||'',submittedBy:req.user._id,status:'pending'}],{session});
        await notifyRoles(['finance'],{title:'Payment verification required',message:`New authorship payment of ₹${advance.toLocaleString('en-IN')} submitted.`,type:'warning',link:'/finance/payments'},{session});
      }
      await logActivity(req,{action:'AUTHORSHIP_SALE_CREATED',module:'sales',entityType:'AuthorshipSale',entityId:sale._id,description:`Created authorship sale ${sale.saleNo}`},{session});
    });
    return ok(res,sale,'Authorship sale saved successfully',201);
  } catch(err) {
    await removeUploadedFile(req.file);
    throw err;
  } finally {
    await session.endSession();
  }
});

export const listPublications = asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter=ownership(req,{});
  const [items,total]=await Promise.all([
    PublicationService.find(filter).populate('journal','name shortName').populate('vendor','vendorName').populate('createdBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),
    PublicationService.countDocuments(filter)
  ]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});

export const createPublication = asyncHandler(async(req,res)=>{
  const {journal,issueType,journalIssue,paperTitle,vendor,authorCategory,currency='INR',exchangeRate=1,totalAmount,advanceAmount=0,paymentAccount,paymentMode,transactionId,transactionDate,expectedPublicationDate,doi,manuscriptStatus,numberOfAuthors,correspondingAuthor,remarks}=req.body;
  const total=Number(totalAmount), advance=Number(advanceAmount||0);
  if(!journal||!paperTitle||!vendor||!Number.isFinite(total)||total<=0) { await removeUploadedFile(req.file); return res.status(422).json({success:false,message:'Please complete all required publication fields with a positive amount',errors:[]}); }
  if(!Number.isFinite(advance)||advance<0||advance>total) { await removeUploadedFile(req.file); return res.status(422).json({success:false,message:'Advance amount must be between 0 and total amount',errors:[]}); }
  const ownedVendor=await Vendor.findOne({_id:vendor,...(req.user.role==='sales'?{assignedTo:req.user._id}:{})});
  if(!ownedVendor) { await removeUploadedFile(req.file); return res.status(403).json({success:false,message:'Vendor is not available to this user',errors:[]}); }
  const session=await mongoose.startSession();
  try {
    let pub;
    await session.withTransaction(async()=>{
      [pub]=await PublicationService.create([{publicationNo:refNo('DP'),journal,issueType,journalIssue:journalIssue||undefined,paperTitle,vendor,authorCategory,currency,exchangeRate:Number(exchangeRate||1),totalAmount:total,advanceAmount:advance,remainingAmount:total,paymentAccount,paymentMode,transactionId,transactionDate,paymentProof:req.file?.path||'',expectedPublicationDate,doi,manuscriptStatus,numberOfAuthors:Number(numberOfAuthors||0),correspondingAuthor,remarks,createdBy:req.user._id,paymentStatus:'pending'}],{session});
      if(advance>0){
        await Payment.create([{paymentNo:refNo('PAY'),sourceType:'publication',sourceId:pub._id,vendor,amount:advance,paymentMode,transactionId,transactionDate,proof:req.file?.path||'',submittedBy:req.user._id,status:'pending'}],{session});
        await notifyRoles(['finance'],{title:'Publication payment pending',message:`New direct-publication payment of ₹${advance.toLocaleString('en-IN')} needs verification.`,type:'warning',link:'/finance/payments'},{session});
      }
      await logActivity(req,{action:'PUBLICATION_CREATED',module:'sales',entityType:'PublicationService',entityId:pub._id,description:`Created publication service ${pub.publicationNo}`},{session});
    });
    return ok(res,pub,'Publication service saved successfully',201);
  } catch(err) {
    await removeUploadedFile(req.file);
    throw err;
  } finally {
    await session.endSession();
  }
});
