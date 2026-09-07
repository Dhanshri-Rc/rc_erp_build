import Notification from '../models/Notification.js';
import { asyncHandler, ok } from '../utils/http.js';
export const list=asyncHandler(async(req,res)=>ok(res,{items:await Notification.find({user:req.user._id}).sort({createdAt:-1}).limit(30),unread:await Notification.countDocuments({user:req.user._id,read:false})}));
export const readOne=asyncHandler(async(req,res)=>ok(res,await Notification.findOneAndUpdate({_id:req.params.id,user:req.user._id},{read:true},{new:true}),'Notification marked read'));
export const readAll=asyncHandler(async(req,res)=>{await Notification.updateMany({user:req.user._id,read:false},{read:true});return ok(res,null,'All notifications marked read');});
