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
const assignedVendor = (req,id) => Vendor.findOne({_id:id,status:'active',...(req.user.role==='sales'?{assignedTo:req.user._id}:{})});

const parsePositions = (value) => {
  let positions = value;
  if (typeof positions === 'string') {
    try { positions = JSON.parse(positions); } catch { positions = null; }
  }
  if (!Array.isArray(positions) || !positions.length) return null;
  const cleaned = positions.map((x) => ({
    position:Number(x.position),
    authorName:String(x.authorName || '').trim(),
    department:String(x.department || '').trim(),
    college:String(x.college || '').trim()
  }));
  if (cleaned.some((x) => !Number.isInteger(x.position) || x.position < 1 || !x.authorName)) return null;
  if (new Set(cleaned.map((x) => x.position)).size !== cleaned.length) return null;
  return cleaned;
};

export const listAuthorship = asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter=ownership(req,{});
  const [items,total]=await Promise.all([
    AuthorshipSale.find(filter).populate('journal','name shortName').populate('article','title issn webUrl totalPOS').populate('vendor','vendorName').populate('createdBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),
    AuthorshipSale.countDocuments(filter)
  ]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});

export const getAuthorship = asyncHandler(async(req,res)=>{
  const sale=await AuthorshipSale.findOne(ownership(req,{_id:req.params.id})).populate('journal','name shortName').populate('article','title issn webUrl totalPOS').populate('vendor','vendorName').populate('createdBy','fullName');
  if(!sale)return res.status(404).json({success:false,message:'Authorship sale not found',errors:[]});
  return ok(res,sale);
});

export const createAuthorship = asyncHandler(async(req,res)=>{
  const { journal, article, vendor, remarks } = req.body;
  const positions = parsePositions(req.body.positions);
  if(!journal||!article||!vendor||!positions) {
    await removeUploadedFile(req.file);
    return res.status(422).json({success:false,message:'Select a journal, article, vendor and complete at least one author position',errors:[]});
  }
  const ownedVendor=await assignedVendor(req,vendor);
  if(!ownedVendor) {
    await removeUploadedFile(req.file);
    return res.status(403).json({success:false,message:'Vendor is not assigned to your account',errors:[]});
  }
  const positionNumbers = positions.map((x) => x.position);
  const maxPosition = Math.max(...positionNumbers);
  const saleId = new mongoose.Types.ObjectId();
  let reserved = false;
  try {
    const available = await Article.findOne({
      _id:article,
      journal,
      totalPOS:{$gte:maxPosition},
      status:{$ne:'inactive'},
      positionBookings:{$not:{$elemMatch:{position:{$in:positionNumbers},status:'booked'}}}
    });
    if(!available){
      const error=new Error('One or more selected positions are already booked or outside the article position range');
      error.status=409;
      throw error;
    }
    const currentBooked = available.positionBookings.filter((x) => x.status==='booked');
    const knownPositions = new Set(currentBooked.map((x) => x.position));
    const legacyCount = Math.max(available.totalPOS - Number(available.availablePOS ?? available.totalPOS) - currentBooked.length,0);
    const legacyPositions = Array.from({length:available.totalPOS},(_,i)=>i+1).filter((position)=>!knownPositions.has(position)).slice(0,legacyCount);
    if(positionNumbers.some((position)=>legacyPositions.includes(position))){
      const error=new Error('One or more selected positions belong to an earlier booking and are unavailable');
      error.status=409;
      throw error;
    }
    const saleNo = refNo('AS');
    const authors = positions.map((x) => `${x.position}. ${x.authorName} — ${[x.department,x.college].filter(Boolean).join(', ')}`).join('\n');
    const bookings = positions.map((x) => ({...x,sale:saleId,bookedBy:req.user._id,bookedAt:new Date(),status:'booked'}));
    const updated = await Article.findOneAndUpdate({
      _id:article,
      journal,
      totalPOS:{$gte:maxPosition},
      availablePOS:{$gte:positions.length},
      status:{$ne:'inactive'},
      positionBookings:{$not:{$elemMatch:{position:{$in:positionNumbers},status:'booked'}}}
    },{
      $push:{positionBookings:{$each:bookings}},
      $inc:{availablePOS:-positions.length}
    },{new:true,runValidators:true});
    if(!updated){
      const error=new Error('A selected position was booked by another user. Refresh the article and choose another position');
      error.status=409;
      throw error;
    }
    reserved = true;
    if(updated.availablePOS===0) await Article.updateOne({_id:article,availablePOS:0},{$set:{status:'full'}});
    const sale=await AuthorshipSale.create({
      _id:saleId,saleNo,journal,article,vendor,
      availablePOSAtSale:Number(available.availablePOS ?? available.totalPOS),
      numberOfAuthors:positions.length,positions,authors,remarks,createdBy:req.user._id,
      totalPrice:0,pricePerAuthor:0,advancePayment:0,remainingAmount:0,paymentStatus:'pending'
    });
    await Promise.allSettled([
      logActivity(req,{action:'AUTHORSHIP_SALE_CREATED',module:'sales',entityType:'AuthorshipSale',entityId:sale._id,description:`Booked article positions ${positionNumbers.join(', ')} in ${sale.saleNo}`})
    ]);
    return ok(res,sale,'Authorship positions booked successfully',201);
  } catch(err) {
    if(reserved){
      await Promise.allSettled([
        Article.updateOne(
          {_id:article,'positionBookings.sale':saleId},
          {$pull:{positionBookings:{sale:saleId}},$inc:{availablePOS:positions.length},$set:{status:'available'}}
        ),
        AuthorshipSale.deleteOne({_id:saleId})
      ]);
    }
    await removeUploadedFile(req.file);
    throw err;
  }
});

export const updateAuthorship = asyncHandler(async(req,res)=>{
  const sale=await AuthorshipSale.findOne(ownership(req,{_id:req.params.id}));
  if(!sale)return res.status(404).json({success:false,message:'Authorship sale not found',errors:[]});
  const positions=parsePositions(req.body.positions);
  if(!positions)return res.status(422).json({success:false,message:'Complete all booked author positions',errors:[]});
  const before=[...sale.positions].map((x)=>({position:x.position,authorName:x.authorName,department:x.department||'',college:x.college||''}));
  const oldNumbers=before.map((x)=>x.position).sort((a,b)=>a-b).join(',');
  const newNumbers=positions.map((x)=>x.position).sort((a,b)=>a-b).join(',');
  if(oldNumbers!==newNumbers)return res.status(409).json({success:false,message:'Booked position numbers cannot be changed. Delete the sale and create a new booking if required.',errors:[]});
  const article=await Article.findById(sale.article);
  if(!article)return res.status(409).json({success:false,message:'The linked article no longer exists',errors:[]});
  const originalBookings=article.positionBookings.map((x)=>x.toObject());
  const details=Object.fromEntries(positions.map((x)=>[x.position,x]));
  article.positionBookings.forEach((booking)=>{
    if(String(booking.sale)===String(sale._id)&&details[booking.position]){
      booking.authorName=details[booking.position].authorName;
      booking.department=details[booking.position].department;
      booking.college=details[booking.position].college;
    }
  });
  await article.save();
  try{
    sale.positions=positions;
    sale.authors=positions.map((x)=>`${x.position}. ${x.authorName} — ${[x.department,x.college].filter(Boolean).join(', ')}`).join('\n');
    sale.remarks=String(req.body.remarks||'');
    await sale.save();
  }catch(error){
    article.positionBookings=originalBookings;
    await article.save().catch(()=>{});
    throw error;
  }
  await logActivity(req,{action:'AUTHORSHIP_SALE_UPDATED',module:'sales',entityType:'AuthorshipSale',entityId:sale._id,description:`Updated ${sale.saleNo}`});
  return ok(res,sale,'Authorship sale updated successfully');
});

export const deleteAuthorship = asyncHandler(async(req,res)=>{
  const sale=await AuthorshipSale.findOne(ownership(req,{_id:req.params.id}));
  if(!sale)return res.status(404).json({success:false,message:'Authorship sale not found',errors:[]});
  if(await Payment.exists({sourceType:'authorship',sourceId:sale._id})) return res.status(409).json({success:false,message:'This authorship sale has payment records and cannot be deleted.',errors:[]});
  const article=await Article.findById(sale.article);
  const bookings=article?.positionBookings.filter((x)=>String(x.sale)===String(sale._id)&&x.status==='booked').map((x)=>x.toObject())||[];
  if(article&&bookings.length){
    await Article.updateOne({_id:article._id},{$pull:{positionBookings:{sale:sale._id}},$inc:{availablePOS:bookings.length},$set:{status:'available'}});
  }
  try{await sale.deleteOne();}
  catch(error){
    if(article&&bookings.length) await Article.updateOne({_id:article._id},{$push:{positionBookings:{$each:bookings}},$inc:{availablePOS:-bookings.length}}).catch(()=>{});
    throw error;
  }
  await logActivity(req,{action:'AUTHORSHIP_SALE_DELETED',module:'sales',entityType:'AuthorshipSale',entityId:sale._id,description:`Deleted ${sale.saleNo} and released positions`});
  return ok(res,null,'Authorship sale deleted and positions released');
});

export const listPublications = asyncHandler(async(req,res)=>{
  const {page,limit,skip}=pagination(req.query); const filter=ownership(req,{});
  const [items,total]=await Promise.all([
    PublicationService.find(filter).populate('journal','name shortName').populate('vendor','vendorName').populate('createdBy','fullName').sort({createdAt:-1}).skip(skip).limit(limit),
    PublicationService.countDocuments(filter)
  ]);
  return ok(res,{items,pagination:paginateMeta(page,limit,total)});
});

export const getPublication = asyncHandler(async(req,res)=>{
  const pub=await PublicationService.findOne(ownership(req,{_id:req.params.id})).populate('journal','name shortName').populate('vendor','vendorName').populate('createdBy','fullName');
  if(!pub)return res.status(404).json({success:false,message:'Publication service not found',errors:[]});
  return ok(res,pub);
});

export const createPublication = asyncHandler(async(req,res)=>{
  const {journal,issueType,issueVolume,paperTitle,vendor,authorCategory,currency='INR',exchangeRate=1,totalAmount,advanceAmount=0,paymentMode,transactionId,transactionDate,remarks}=req.body;
  const total=Number(totalAmount), advance=Number(advanceAmount||0);
  if(!journal||!paperTitle||!vendor||!String(issueVolume||'').trim()||!Number.isFinite(total)||total<=0) {
    await removeUploadedFile(req.file);
    return res.status(422).json({success:false,message:'Journal, manual issue/volume, paper title, vendor and a positive amount are required',errors:[]});
  }
  if(!['INR','USD'].includes(currency)) {
    await removeUploadedFile(req.file);
    return res.status(422).json({success:false,message:'Currency must be INR or USD',errors:[]});
  }
  if(!Number.isFinite(advance)||advance<0||advance>total) {
    await removeUploadedFile(req.file);
    return res.status(422).json({success:false,message:'Advance amount must be between 0 and total amount',errors:[]});
  }
  if(advance>0 && !req.file) return res.status(422).json({success:false,message:'Payment screenshot is required when an advance is entered',errors:[]});
  if(advance>0 && currency==='INR' && (!paymentMode||!transactionId||!transactionDate)) {
    await removeUploadedFile(req.file);
    return res.status(422).json({success:false,message:'Payment mode, UTR/transaction ID and transaction date are required for INR payments',errors:[]});
  }
  const ownedVendor=await assignedVendor(req,vendor);
  if(!ownedVendor) {
    await removeUploadedFile(req.file);
    return res.status(403).json({success:false,message:'Vendor is not assigned to your account',errors:[]});
  }
  const publicationId = new mongoose.Types.ObjectId();
  try {
    const pub=await PublicationService.create({
      _id:publicationId,publicationNo:refNo('DP'),journal,issueType,issueVolume:String(issueVolume).trim(),paperTitle,vendor,authorCategory,currency,
      exchangeRate:Number(exchangeRate||1),totalAmount:total,advanceAmount:advance,remainingAmount:Math.max(total-advance,0),
      paymentMode:advance>0&&currency==='INR'?paymentMode:'',transactionId:advance>0&&currency==='INR'?transactionId:'',
      transactionDate:advance>0&&currency==='INR'?transactionDate:undefined,paymentProof:advance>0?req.file.path:'',
      remarks,createdBy:req.user._id,paymentStatus:'pending'
    });
    if(advance>0){
      await Payment.create({
        paymentNo:refNo('PAY'),sourceType:'publication',sourceId:pub._id,vendor,amount:advance,currency,
        paymentMode:currency==='INR'?paymentMode:'USD Proof',transactionId:currency==='INR'?transactionId:'',
        transactionDate:currency==='INR'?transactionDate:undefined,proof:req.file.path,submittedBy:req.user._id,status:'pending'
      });
    }
    const sideEffects=[
      logActivity(req,{action:'PUBLICATION_CREATED',module:'sales',entityType:'PublicationService',entityId:pub._id,description:`Created publication service ${pub.publicationNo}`})
    ];
    if(advance>0) sideEffects.push(notifyRoles(['finance'],{
      title:'Publication payment pending',
      message:`New direct-publication payment of ${currency} ${advance.toLocaleString('en-IN')} needs verification.`,
      type:'warning',link:'/finance/payments'
    }));
    await Promise.allSettled(sideEffects);
    return ok(res,pub,'Publication service saved successfully',201);
  } catch(err) {
    await Promise.allSettled([
      Payment.deleteMany({sourceType:'publication',sourceId:publicationId}),
      PublicationService.deleteOne({_id:publicationId})
    ]);
    await removeUploadedFile(req.file);
    throw err;
  }
});

export const updatePublication = asyncHandler(async(req,res)=>{
  const changes={};
  ['paperTitle','issueType','issueVolume','authorCategory','remarks'].forEach((key)=>req.body[key]!==undefined&&(changes[key]=String(req.body[key]).trim()));
  if(changes.paperTitle!==undefined&&!changes.paperTitle)return res.status(422).json({success:false,message:'Paper title cannot be empty',errors:[]});
  if(changes.issueVolume!==undefined&&!changes.issueVolume)return res.status(422).json({success:false,message:'Issue / volume cannot be empty',errors:[]});
  const pub=await PublicationService.findOneAndUpdate(ownership(req,{_id:req.params.id}),changes,{new:true,runValidators:true}).populate('journal','name shortName').populate('vendor','vendorName');
  if(!pub)return res.status(404).json({success:false,message:'Publication service not found',errors:[]});
  await logActivity(req,{action:'PUBLICATION_UPDATED',module:'sales',entityType:'PublicationService',entityId:pub._id,description:`Updated ${pub.publicationNo}`});
  return ok(res,pub,'Publication service updated successfully');
});

export const deletePublication = asyncHandler(async(req,res)=>{
  const pub=await PublicationService.findOne(ownership(req,{_id:req.params.id}));
  if(!pub)return res.status(404).json({success:false,message:'Publication service not found',errors:[]});
  const payments=await Payment.find({sourceType:'publication',sourceId:pub._id});
  if(payments.some((x)=>x.status==='verified')) return res.status(409).json({success:false,message:'A verified payment exists for this publication. It cannot be deleted.',errors:[]});
  await Payment.deleteMany({sourceType:'publication',sourceId:pub._id});
  await pub.deleteOne();
  const paths=new Set([pub.paymentProof,...payments.map((x)=>x.proof)].filter(Boolean));
  await Promise.allSettled([...paths].map((path)=>fs.unlink(path)));
  await logActivity(req,{action:'PUBLICATION_DELETED',module:'sales',entityType:'PublicationService',entityId:pub._id,description:`Deleted ${pub.publicationNo}`});
  return ok(res,null,'Publication service deleted successfully');
});
