const user=require('../models/user');
const order=require('../models/order');
const product = require('../models/product');

const getAllUsers=async(req,res,next)=>{
    try{
        const allUsers=await user.find({});
        
        return res.status(200).json(allUsers);
    }
    catch(err){
        return next(err);
    }
};

const getUsersByRole=async(req,res,next)=>{
    try{
        const {role}=req.query;
        const allUsers=await user.find({role:role});
        
        return res.status(200).json(allUsers);
        
    }
    catch(err){
        return next(err);
    }
};

const getAllOrders=async(req,res,next)=>{
    try{
        const allOrders=await order.find({});
        
        return res.status(200).json(allOrders);
    }
    catch(err){
        return next(err);
    }
};

const getOrdersByUser=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const userOrders=await order.find({buyer:id});
        
        return res.status(200).json(userOrders);
    }
    catch(err){
        return next(err);
    }
};

const getProductsByVendor=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const vendorProducts=await product.find({vendor:id});
        
        return res.status(200).json(vendorProducts);
    }
    catch(err){
        return next(err);
    }
};

module.exports={
    getAllUsers,getAllOrders,getOrdersByUser,getProductsByVendor,getUsersByRole
};

