import Journal from '../models/Journal.js';
import Article from '../models/Article.js';
import JournalIssue from '../models/JournalIssue.js';
import { asyncHandler, ok } from '../utils/http.js';
import { pick } from '../utils/input.js';

export const journals = asyncHandler(async (_,res)=>ok(res,await Journal.find({status:'active'}).sort({name:1})));
export const articles = asyncHandler(async (req,res)=>{
  const filter={status:{$ne:'inactive'}}; if(req.query.journal) filter.journal=req.query.journal;
  return ok(res,await Article.find(filter).populate('journal','name shortName').sort({createdAt:-1}));
});
export const issues = asyncHandler(async (req,res)=>{
  const filter={active:true}; if(req.query.journal) filter.journal=req.query.journal;
  return ok(res,await JournalIssue.find(filter).populate('journal','name').sort({publicationDate:-1}));
});
export const createJournal = asyncHandler(async (req,res)=>ok(res,await Journal.create(pick(req.body,['name','shortName','issn','indexing','publisher','authorCategories','status'])),'Journal created',201));
export const createArticle = asyncHandler(async (req,res)=>ok(res,await Article.create(pick(req.body,['title','journal','availablePOS','totalPOS','pricePerAuthor','status'])),'Article created',201));
export const createIssue = asyncHandler(async (req,res)=>ok(res,await JournalIssue.create(pick(req.body,['journal','issueType','volume','issue','month','year','publicationDate','active'])),'Issue created',201));
