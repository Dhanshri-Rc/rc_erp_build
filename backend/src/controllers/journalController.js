import Journal from '../models/Journal.js';
import Article from '../models/Article.js';
import JournalIssue from '../models/JournalIssue.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import { asyncHandler, ok } from '../utils/http.js';
import { pick } from '../utils/input.js';

const cleanUrl = (value) => {
  const url = String(value || '').trim();
  if (!/^https?:\/\//i.test(url)) {
    const error = new Error('Web URL must start with http:// or https://');
    error.status = 422;
    throw error;
  }
  return url;
};

const articleView = (article) => {
  const raw = article.toObject ? article.toObject() : article;
  const booked = (raw.positionBookings || []).filter((x) => x.status === 'booked');
  const knownPositions = new Set(booked.map((x) => x.position));
  const legacyCount = Math.max(Number(raw.totalPOS || 0) - Number(raw.availablePOS ?? raw.totalPOS ?? 0) - booked.length, 0);
  const legacyPositions = Array.from({length:Number(raw.totalPOS || 0)},(_,i)=>i+1).filter((position)=>!knownPositions.has(position)).slice(0,legacyCount);
  const allBookedPositions = [...booked.map((x)=>x.position),...legacyPositions].sort((a,b)=>a-b);
  const bookingsByPosition = Object.fromEntries(booked.map((x) => [String(x.position), {
    position: x.position,
    authorName: x.authorName,
    department: x.department || '',
    college: x.college || '',
    bookedAt: x.bookedAt
  }]));
  legacyPositions.forEach((position) => {
    bookingsByPosition[String(position)] = { position, authorName:'Previously booked', department:'Legacy record', college:'', bookedAt:null };
  });
  return {
    ...raw,
    availablePOS: Math.max(Number(raw.totalPOS || 0) - allBookedPositions.length, 0),
    bookedPositions: allBookedPositions,
    bookingsByPosition,
    positionBookings: undefined
  };
};

export const journals = asyncHandler(async (req,res) => {
  const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { status:'active' };
  return ok(res, await Journal.find(filter).sort({ name:1 }));
});

export const articles = asyncHandler(async (req,res) => {
  const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { status:{ $ne:'inactive' } };
  if (req.query.journal) filter.journal = req.query.journal;
  const docs = await Article.find(filter).populate('journal','name shortName issn webUrl').sort({ createdAt:-1 });
  return ok(res, docs.map(articleView));
});

export const issues = asyncHandler(async (req,res) => {
  const filter={active:true}; if(req.query.journal) filter.journal=req.query.journal;
  return ok(res,await JournalIssue.find(filter).populate('journal','name').sort({publicationDate:-1}));
});

export const createJournal = asyncHandler(async (req,res) => {
  const name = String(req.body.name || req.body.title || '').trim();
  const issn = String(req.body.issn || '').trim();
  if (!name || !issn || !req.body.webUrl) return res.status(422).json({ success:false, message:'Journal title, ISSN number and web URL are required', errors:[] });
  const doc = await Journal.create({
    ...pick(req.body,['shortName','indexing','publisher','authorCategories','status']),
    name, issn, webUrl: cleanUrl(req.body.webUrl)
  });
  return ok(res, doc, 'Journal created successfully', 201);
});

export const updateJournal = asyncHandler(async (req,res) => {
  const changes = pick(req.body,['name','issn','webUrl','shortName','indexing','publisher','authorCategories','status']);
  if (changes.name !== undefined) changes.name = String(changes.name).trim();
  if (changes.issn !== undefined) changes.issn = String(changes.issn).trim();
  if (changes.webUrl !== undefined) changes.webUrl = cleanUrl(changes.webUrl);
  if ((changes.name !== undefined && !changes.name) || (changes.issn !== undefined && !changes.issn)) {
    return res.status(422).json({success:false,message:'Journal title and ISSN number cannot be empty',errors:[]});
  }
  const journal = await Journal.findByIdAndUpdate(req.params.id,changes,{new:true,runValidators:true});
  if (!journal) return res.status(404).json({success:false,message:'Journal not found',errors:[]});
  return ok(res,journal,'Journal updated successfully');
});

export const deleteJournal = asyncHandler(async (req,res) => {
  const linked = await Promise.all([
    Article.exists({journal:req.params.id}), JournalIssue.exists({journal:req.params.id}),
    AuthorshipSale.exists({journal:req.params.id}), PublicationService.exists({journal:req.params.id})
  ]);
  if (linked.some(Boolean)) return res.status(409).json({success:false,message:'This journal is already in use. Set it to inactive instead of deleting it.',errors:[]});
  const journal = await Journal.findByIdAndDelete(req.params.id);
  if (!journal) return res.status(404).json({success:false,message:'Journal not found',errors:[]});
  return ok(res,null,'Journal deleted successfully');
});

export const createArticle = asyncHandler(async (req,res) => {
  const totalPOS = Number(req.body.totalPOS);
  const title = String(req.body.title || '').trim();
  const issn = String(req.body.issn || '').trim();
  if (!title || !issn || !req.body.webUrl || !req.body.journal || !Number.isInteger(totalPOS) || totalPOS < 1 || totalPOS > 100) {
    return res.status(422).json({ success:false, message:'Article title, journal, ISSN, web URL and total positions (1-100) are required', errors:[] });
  }
  if (!await Journal.exists({ _id:req.body.journal, status:'active' })) return res.status(422).json({ success:false, message:'Select an active journal', errors:[] });
  const doc = await Article.create({
    title, journal:req.body.journal, issn, webUrl:cleanUrl(req.body.webUrl),
    totalPOS, availablePOS:totalPOS, pricePerAuthor:Number(req.body.pricePerAuthor || 0), status:'available'
  });
  return ok(res, articleView(await doc.populate('journal','name shortName issn webUrl')), 'Article created successfully', 201);
});

export const updateArticle = asyncHandler(async (req,res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({success:false,message:'Article not found',errors:[]});
  const changes = pick(req.body,['title','journal','issn','webUrl','status']);
  if (changes.title !== undefined) changes.title = String(changes.title).trim();
  if (changes.issn !== undefined) changes.issn = String(changes.issn).trim();
  if (changes.webUrl !== undefined) changes.webUrl = cleanUrl(changes.webUrl);
  if (changes.journal !== undefined && !await Journal.exists({_id:changes.journal,status:'active'})) {
    return res.status(422).json({success:false,message:'Select an active journal',errors:[]});
  }
  if ((changes.title !== undefined && !changes.title) || (changes.issn !== undefined && !changes.issn)) {
    return res.status(422).json({success:false,message:'Article title and ISSN number cannot be empty',errors:[]});
  }
  Object.assign(article,changes);
  if (req.body.totalPOS !== undefined) {
    const totalPOS = Number(req.body.totalPOS);
    if (!Number.isInteger(totalPOS) || totalPOS < 1 || totalPOS > 100) return res.status(422).json({success:false,message:'Total positions must be a whole number between 1 and 100',errors:[]});
    const booked = article.positionBookings.filter((x)=>x.status==='booked');
    const highest = booked.reduce((max,x)=>Math.max(max,x.position),0);
    const legacyCount = Math.max(article.totalPOS-Number(article.availablePOS ?? article.totalPOS)-booked.length,0);
    if (totalPOS < highest || totalPOS < booked.length + legacyCount) return res.status(409).json({success:false,message:`Total positions cannot be below booked position ${highest}`,errors:[]});
    article.totalPOS = totalPOS;
    article.availablePOS = totalPOS - booked.length - legacyCount;
    if (article.status !== 'inactive') article.status = article.availablePOS === 0 ? 'full' : 'available';
  }
  await article.save();
  return ok(res,articleView(await article.populate('journal','name shortName issn webUrl')),'Article updated successfully');
});

export const deleteArticle = asyncHandler(async (req,res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({success:false,message:'Article not found',errors:[]});
  if (article.positionBookings.some((x)=>x.status==='booked') || await AuthorshipSale.exists({article:article._id})) {
    return res.status(409).json({success:false,message:'This article has authorship bookings. Set it to inactive instead of deleting it.',errors:[]});
  }
  await article.deleteOne();
  return ok(res,null,'Article deleted successfully');
});

export const updateArticlePositions = asyncHandler(async (req,res) => {
  const totalPOS = Number(req.body.totalPOS);
  if (!Number.isInteger(totalPOS) || totalPOS < 1 || totalPOS > 100) return res.status(422).json({ success:false, message:'Total positions must be a whole number between 1 and 100', errors:[] });
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ success:false, message:'Article not found', errors:[] });
  const booked = article.positionBookings.filter((x) => x.status === 'booked');
  const knownPositions = new Set(booked.map((x)=>x.position));
  const legacyCount = Math.max(article.totalPOS-Number(article.availablePOS ?? article.totalPOS)-booked.length,0);
  const legacyPositions = Array.from({length:article.totalPOS},(_,i)=>i+1).filter((position)=>!knownPositions.has(position)).slice(0,legacyCount);
  const highest = [...booked.map((x)=>x.position),...legacyPositions].reduce((max,position)=>Math.max(max,position),0);
  if (totalPOS < highest || totalPOS < booked.length + legacyCount) return res.status(409).json({ success:false, message:`Total positions cannot be below booked position ${highest}`, errors:[] });
  article.totalPOS = totalPOS;
  article.availablePOS = totalPOS - booked.length - legacyCount;
  article.status = article.availablePOS === 0 ? 'full' : 'available';
  await article.save();
  return ok(res, articleView(await article.populate('journal','name shortName issn webUrl')), 'Authorship positions updated successfully');
});

export const createIssue = asyncHandler(async (req,res)=>ok(res,await JournalIssue.create(pick(req.body,['journal','issueType','volume','issue','month','year','publicationDate','active'])),'Issue created',201));
