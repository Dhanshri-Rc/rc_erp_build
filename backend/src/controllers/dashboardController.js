import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import Lead from '../models/Lead.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';
import Receipt from '../models/Receipt.js';
import { asyncHandler, ok } from '../utils/http.js';

const startOfDay=(d)=>new Date(new Date(d).setHours(0,0,0,0));
const dateMatch=(query, field='createdAt')=>{
  const q={};
  if(query.from||query.to){q[field]={}; if(query.from)q[field].$gte=startOfDay(query.from); if(query.to){const t=new Date(query.to);t.setHours(23,59,59,999);q[field].$lte=t;}}
  return q;
};
const monthly = async(Model, match={}, amountField=null)=> Model.aggregate([
  {$match:match}, {$group:{_id:{y:{$year:'$createdAt'},m:{$month:'$createdAt'}},count:{$sum:1},value:{$sum:amountField?`$${amountField}`:0}}}, {$sort:{'_id.y':1,'_id.m':1}}, {$limit:12}
]);

export const adminDashboard=asyncHandler(async(req,res)=>{
  const range=dateMatch(req.query);
  const [totalUsers,salesUsers,financeUsers,activeUsers,totalVendors,activeVendors,authorship,publications,payments,recentUsers,recentPayments,activities,vendorAgg,userRoles]=await Promise.all([
    User.countDocuments(),User.countDocuments({role:'sales'}),User.countDocuments({role:'finance'}),User.countDocuments({status:'active'}),Vendor.countDocuments(),Vendor.countDocuments({status:'active'}),AuthorshipSale.countDocuments(range),PublicationService.countDocuments(range),Payment.find(range),
    User.find().select('fullName username role status createdAt').sort({createdAt:-1}).limit(5),
    Payment.find().populate('submittedBy','fullName').populate('vendor','vendorName').sort({createdAt:-1}).limit(6),
    ActivityLog.find().populate('user','fullName').sort({createdAt:-1}).limit(6),
    Vendor.aggregate([{$group:{_id:'$assignedTo',total:{$sum:1},active:{$sum:{$cond:[{$eq:['$status','active']},1,0]}},inactive:{$sum:{$cond:[{$eq:['$status','inactive']},1,0]}}}},{$sort:{total:-1}},{$limit:5},{$lookup:{from:'users',localField:'_id',foreignField:'_id',as:'user'}},{$unwind:'$user'}]),
    User.aggregate([{$group:{_id:'$role',value:{$sum:1}}}])
  ]);
  const totalPayments=payments.reduce((s,p)=>s+p.amount,0), verifiedPayments=payments.filter(p=>p.status==='verified').reduce((s,p)=>s+p.amount,0);
  return ok(res,{metrics:{totalUsers,salesUsers,financeUsers,activeUsers,totalVendors,activeVendors,accountingLogs:await ActivityLog.countDocuments({module:'accounting'})},usersByRole:userRoles.map(x=>({name:x._id,value:x.value})),recentUsers,
    accountingOverview:[{name:'Submitted',value:totalPayments},{name:'Verified',value:verifiedPayments}],vendorByEmployee:vendorAgg.map(v=>({employee:v.user.fullName,total:v.total,active:v.active,inactive:v.inactive})),recentPayments,activities,summary:{authorship,publications}});
});

export const salesDashboard=asyncHandler(async(req,res)=>{
  const owner={createdBy:req.user._id,...dateMatch(req.query)}; const vendorFilter={assignedTo:req.user._id};
  const [totalVendors,activeVendors,authorshipSales,publicationCount,authorshipDocs,pubDocs,recentActivities,topVendors,tasks,monthAuth,monthPub]=await Promise.all([
    Vendor.countDocuments(vendorFilter),Vendor.countDocuments({...vendorFilter,status:'active'}),AuthorshipSale.countDocuments(owner),PublicationService.countDocuments(owner),
    AuthorshipSale.find(owner).populate('vendor','vendorName').sort({createdAt:-1}),PublicationService.find(owner).populate('vendor','vendorName').sort({createdAt:-1}),
    ActivityLog.find({user:req.user._id}).sort({createdAt:-1}).limit(6),
    AuthorshipSale.aggregate([{$match:{createdBy:req.user._id}},{$group:{_id:'$vendor',count:{$sum:1},value:{$sum:'$totalPrice'}}},{$sort:{value:-1}},{$limit:5},{$lookup:{from:'vendors',localField:'_id',foreignField:'_id',as:'vendor'}},{$unwind:'$vendor'}]),
    Lead.find({assignedTo:req.user._id,status:{$nin:['converted','closed']}}).sort({nextFollowUpDate:1}).limit(5),
    monthly(AuthorshipSale,{createdBy:req.user._id},'totalPrice'),monthly(PublicationService,{createdBy:req.user._id},'totalAmount')
  ]);
  const authorshipValue=authorshipDocs.reduce((s,x)=>s+x.totalPrice,0); const publicationValue=pubDocs.reduce((s,x)=>s+x.totalAmount,0); const totalValue=authorshipValue+publicationValue;
  const leads=await Lead.countDocuments({createdBy:req.user._id}); const converted=await Lead.countDocuments({createdBy:req.user._id,status:'converted'}); const conversionRate=leads?Math.round((converted/leads)*100):0;
  const keys=[...new Set([...monthAuth,...monthPub].map(x=>`${x._id.y}-${x._id.m}`))];
  const salesOverview=keys.map(k=>{const [y,m]=k.split('-').map(Number); const a=monthAuth.find(x=>x._id.y===y&&x._id.m===m);const p=monthPub.find(x=>x._id.y===y&&x._id.m===m);return {name:new Date(y,m-1,1).toLocaleString('en',{month:'short'}),authorship:a?.value||0,publication:p?.value||0};});
  return ok(res,{metrics:{totalVendors,activeVendors,authorshipSales,publicationCount,totalValue,conversionRate},salesOverview,serviceDistribution:[{name:'Authorship Sale',value:authorshipSales},{name:'Direct Publication',value:publicationCount}],tasks,recentActivities,topVendors:topVendors.map(x=>({vendor:x.vendor.vendorName,totalSales:x.count,totalValue:x.value}))});
});

export const financeDashboard=asyncHandler(async(req,res)=>{
  const range=dateMatch(req.query); const payments=await Payment.find(range).populate('vendor','vendorName').populate('submittedBy','fullName').sort({createdAt:-1});
  const received=payments.filter(p=>p.status==='verified').reduce((s,p)=>s+p.amount,0),pending=payments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0),rejected=payments.filter(p=>p.status==='rejected').reduce((s,p)=>s+p.amount,0);
  const [outA,outP,receiptsCount]=await Promise.all([
    AuthorshipSale.aggregate([{$match:{remainingAmount:{$gt:0}}},{$group:{_id:null,total:{$sum:'$remainingAmount'}}}]),PublicationService.aggregate([{$match:{remainingAmount:{$gt:0}}},{$group:{_id:null,total:{$sum:'$remainingAmount'}}}]),Receipt.countDocuments(range)
  ]);
  const monthlyVerified=await Payment.aggregate([{$match:{status:'verified'}},{$group:{_id:{y:{$year:'$createdAt'},m:{$month:'$createdAt'}},revenue:{$sum:'$amount'}}},{$sort:{'_id.y':1,'_id.m':1}},{$limit:12}]);
  return ok(res,{metrics:{totalRevenue:received,amountReceived:received,outstandingAmount:(outA[0]?.total||0)+(outP[0]?.total||0),pendingVerifications:payments.filter(p=>p.status==='pending').length,verifiedPayments:payments.filter(p=>p.status==='verified').length,rejectedPayments:payments.filter(p=>p.status==='rejected').length,receipts:receiptsCount},revenueOverview:monthlyVerified.map(x=>({name:new Date(x._id.y,x._id.m-1,1).toLocaleString('en',{month:'short'}),revenue:x.revenue})),paymentStatus:[{name:'Verified',value:received},{name:'Pending',value:pending},{name:'Rejected',value:rejected}],recentTransactions:payments.slice(0,8),pendingPayments:payments.filter(p=>p.status==='pending').slice(0,6)});
});
