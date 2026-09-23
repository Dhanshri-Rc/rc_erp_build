import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Client from '../models/Client.js';
import Journal from '../models/Journal.js';
import Article from '../models/Article.js';
import JournalIssue from '../models/JournalIssue.js';
import AuthorshipSale from '../models/AuthorshipSale.js';
import PublicationService from '../models/PublicationService.js';
import Lead from '../models/Lead.js';
import Payment from '../models/Payment.js';
import Receipt from '../models/Receipt.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import Session from '../models/Session.js';

if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_RESET !== 'I_UNDERSTAND_THIS_DELETES_ALL_DATA') {
  throw new Error('Demo reset blocked. It is forbidden in production and requires explicit ALLOW_DEMO_RESET confirmation.');
}

await connectDB();
for (const M of [Session,Notification,ActivityLog,Receipt,Payment,Lead,PublicationService,AuthorshipSale,Client,Article,JournalIssue,Vendor,Journal,User]) await M.deleteMany({});

const admin=await User.create({username:process.env.SEED_ADMIN_USERNAME||'admin',email:process.env.SEED_ADMIN_EMAIL||'admin@rcerp.local',password:process.env.SEED_ADMIN_PASSWORD||'Admin@123',fullName:'Admin User',contactNumber:'9876543210',role:'admin'});
const sales=await User.create({username:'marketing.user',email:'sales@rcerp.local',password:'Sales@123',fullName:'Marketing User',contactNumber:'9876543211',role:'sales',createdBy:admin._id});
const finance=await User.create({username:'accounting.user',email:'finance@rcerp.local',password:'Finance@123',fullName:'Accounting User',contactNumber:'9876543212',role:'finance',createdBy:admin._id});
await User.create({username:'rahul.sharma',email:'rahul@rcerp.local',password:'Sales@123',fullName:'Rahul Sharma',contactNumber:'9988776655',role:'sales',createdBy:admin._id});

const journals=await Journal.insertMany([
 {name:'International Journal of Advanced Research & Innovation',shortName:'IJARI',issn:'2456-9012',webUrl:'https://example.test/ijari',indexing:['Scopus'],publisher:'RC Publications',authorCategories:['Indian','International']},
 {name:'Journal of Engineering Research and Technology',shortName:'JERT',issn:'2348-778X',webUrl:'https://example.test/jert',indexing:['Scopus','Crossref'],publisher:'RC Publications',authorCategories:['Indian','International']},
 {name:'Global Journal of Management Studies',shortName:'GJMS',issn:'2582-1234',webUrl:'https://example.test/gjms',indexing:['Google Scholar'],publisher:'RC Publications',authorCategories:['Indian','International']}
]);
const articles=await Article.insertMany([
 {title:'AI-Driven Decision Support Systems for Smart Enterprises',journal:journals[0]._id,issn:'2456-9012',webUrl:'https://example.test/ijari/ai-decision',availablePOS:6,totalPOS:6},
 {title:'Sustainable Digital Transformation in Modern Organizations',journal:journals[0]._id,issn:'2456-9012',webUrl:'https://example.test/ijari/digital-transformation',availablePOS:5,totalPOS:5},
 {title:'Energy Efficient Networks for Connected Infrastructure',journal:journals[1]._id,issn:'2348-778X',webUrl:'https://example.test/jert/energy-networks',availablePOS:5,totalPOS:5}
]);
await JournalIssue.insertMany([
 {journal:journals[0]._id,issueType:'Regular Issue',volume:'12',issue:'4',month:'September',year:2026,publicationDate:new Date('2026-09-30')},
 {journal:journals[1]._id,issueType:'Special Issue',volume:'9',issue:'2',month:'October',year:2026,publicationDate:new Date('2026-10-30')}
]);
const vendorDocs=await Vendor.insertMany([
 {vendorName:'Tech Source India',businessType:'Supplier',vendorCategory:'Academic',address:'Hinjewadi',city:'Pune',state:'Maharashtra',country:'India',postalCode:'411057',mobile:'9823001001',email:'contact@techsource.test',contactPerson:'Amit Verma',designation:'Director',vendorSince:new Date('2025-01-05'),paymentTerms:'30 Days',preferredPaymentMode:'Bank Transfer',status:'active',createdBy:admin._id,assignedTo:sales._id},
 {vendorName:'Prime Research Services',businessType:'Service Provider',vendorCategory:'Research',address:'Baner',city:'Pune',state:'Maharashtra',country:'India',postalCode:'411045',mobile:'9823001002',email:'hello@primeresearch.test',contactPerson:'Sneha Patil',designation:'Manager',vendorSince:new Date('2025-06-12'),paymentTerms:'Advance',preferredPaymentMode:'UPI',status:'active',createdBy:admin._id,assignedTo:sales._id},
 {vendorName:'Scholar Bridge',businessType:'Publisher',vendorCategory:'Publication',address:'Sitabuldi',city:'Nagpur',state:'Maharashtra',country:'India',postalCode:'440012',mobile:'9823001003',email:'office@scholarbridge.test',contactPerson:'Rohan Mehta',designation:'Owner',vendorSince:new Date('2026-01-01'),paymentTerms:'15 Days',preferredPaymentMode:'Bank Transfer',status:'inactive',createdBy:admin._id,assignedTo:sales._id}
]);
await Client.insertMany([{clientName:'Example Engineering College',businessType:'B-B',contactPerson:'Dr. A. Kumar',department:'Computer Science',college:'Example Engineering College',email:'client@example.test',createdBy:sales._id}]);
const auth1=await AuthorshipSale.create({saleNo:'AS-2026-10001',journal:journals[0]._id,article:articles[0]._id,vendor:vendorDocs[0]._id,availablePOSAtSale:6,numberOfAuthors:1,positions:[{position:4,authorName:'Dr. A. Kumar',department:'Computer Science',college:'Example Engineering College'}],authors:'4. Dr. A. Kumar — Computer Science, Example Engineering College',createdBy:sales._id});
await Article.updateOne({_id:articles[0]._id},{$push:{positionBookings:{position:4,authorName:'Dr. A. Kumar',department:'Computer Science',college:'Example Engineering College',sale:auth1._id,bookedBy:sales._id,status:'booked'}},$set:{availablePOS:5}});
const pub1=await PublicationService.create({publicationNo:'DP-2026-10001',journal:journals[1]._id,issueType:'Regular Issue',issueVolume:'Volume 9, Issue 2',paperTitle:'IoT Enabled Smart Monitoring Framework',vendor:vendorDocs[1]._id,authorCategory:'Indian',currency:'INR',totalAmount:35000,advanceAmount:15000,remainingAmount:20000,paymentMode:'Bank Transfer',transactionId:'UTR-DEMO-1002',transactionDate:new Date('2026-09-02'),createdBy:sales._id,paymentStatus:'partial'});
await Payment.insertMany([
 {paymentNo:'PAY-2026-10002',sourceType:'publication',sourceId:pub1._id,vendor:vendorDocs[1]._id,amount:15000,paymentMode:'Bank Transfer',transactionId:'UTR-DEMO-1002',transactionDate:new Date('2026-09-02'),submittedBy:sales._id,status:'verified',verifiedBy:finance._id,verifiedAt:new Date('2026-09-02')}
]);
await Lead.insertMany([
 {leadNo:'LEAD-2026-001',leadTitle:'Scopus Journal Publication Requirement',leadType:'New Requirement',priority:'high',leadFor:'Journal Publication',expectedDealType:'Low Cost',targetBudget:45000,description:'Client needs Scopus publication options.',contactName:'Nitin Joshi',email:'nitin@example.test',mobile:'9000000001',organization:'Example Institute',country:'India',leadSource:'Website',assignedTo:sales._id,nextFollowUpDate:new Date('2026-09-05'),followUpStatus:'Scheduled',status:'contacted',createdBy:sales._id},
 {leadNo:'LEAD-2026-002',leadTitle:'Authorship Positions for Engineering Paper',leadType:'Authorship',priority:'medium',leadFor:'Authorship',expectedDealType:'Standard',targetBudget:30000,description:'Requires 2 author positions.',contactName:'Priya Nair',email:'priya@example.test',mobile:'9000000002',country:'India',leadSource:'Referral',assignedTo:sales._id,nextFollowUpDate:new Date('2026-09-06'),followUpStatus:'Pending',status:'new',createdBy:sales._id}
]);
await ActivityLog.insertMany([
 {user:admin._id,role:'admin',action:'USER_CREATED',module:'users',entityType:'User',entityId:sales._id,description:'Created Marketing User'},
 {user:sales._id,role:'sales',action:'VENDOR_CREATED',module:'vendors',entityType:'Vendor',entityId:vendorDocs[0]._id,description:'Added vendor Tech Source India'},
 {user:sales._id,role:'sales',action:'AUTHORSHIP_SALE_CREATED',module:'sales',entityType:'AuthorshipSale',entityId:auth1._id,description:'Created authorship sale AS-2026-10001'},
 {user:finance._id,role:'finance',action:'PAYMENT_VERIFIED',module:'accounting',entityType:'Payment',description:'Verified publication payment'}
]);
await Notification.insertMany([
 {user:sales._id,title:'Payment verified',message:'Publication payment PAY-2026-10002 has been verified.',type:'success',link:'/sales/activities'},
 {user:finance._id,title:'Payment verification required',message:'Authorship payment PAY-2026-10001 is pending verification.',type:'warning',link:'/finance/payments'}
]);
console.log('\nSeed complete. Demo credentials:');
console.log(`Admin   : ${process.env.SEED_ADMIN_EMAIL||'admin@rcerp.local'} / ${process.env.SEED_ADMIN_PASSWORD||'Admin@123'}`);
console.log('Sales   : sales@rcerp.local / Sales@123');
console.log('Finance : finance@rcerp.local / Finance@123');
process.exit(0);
