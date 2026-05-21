const { mongoose } = require('mongoose');
const order=require('../models/order');
const product=require('../models/product');
const {orderSchema}=require('../validators/order.validator');
const razorpay=require('../config/razorpay.config');


const placeOrder=async(req,res,next)=>{
    const session=await mongoose.startSession();
    

    try{
        session.startTransaction();
        const {productId,quantity}=req.body;
        orderSchema.parse({productId,quantity});
        const buyerId=req.user.userId;

        const prod=await product.findOneAndUpdate(
            { _id:productId ,
               quantity:{$gte:quantity}
            },
            {
                $inc:{quantity:-quantity}
            },
            { returnDocument: 'after' ,session}
        );
        if(!prod){
            const err=new Error("product not found or insufficinet stock");
            err.statusCode=400;
            await session.abortTransaction();
            return next(err);
        }
        
        const totalPrice=quantity*prod.price;
        const [newOrder]=await order.create([{
            buyer:buyerId,
            vendor:prod.vendor,
            products:[{product:productId,quantity}],
            totalPrice,
            status:"Pending",
            deliveryDate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }], {session});

        await session.commitTransaction();
        return res.status(201).json({message:"Order created",order:newOrder});
    }
    catch(err){
        if(session.inTransaction()){
        await session.abortTransaction();
        }
        return next(err);
    }
    finally{
        session.endSession();
    }
};

const getMyOrders=async(req,res,next)=>{
    try{
        const buyerId=req.user.userId;
        const {status,page=1,limit=10}=req.query;

        const filter={buyer:buyerId};

        if(status){
            filter.status=status;
        }
    
        const orders=await order.find(filter)
        .populate('vendor','name email')
        .populate('products.product', 'name price')
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(parseInt(limit));

        const total=await order.countDocuments(filter);
        return res.status(200).json({
            orders,
            pagination:{
                page:parseInt(page),
                limit:parseInt(limit),
                total,
                pages:Math.ceil(total/limit)
            }
        });
    }
    catch(err){
        return next(err);
    }
};

const getVendorOrders=async(req,res,next)=>{
    try{
        const vendorId=req.user.userId;
        const {status,page=1,limit=10}=req.query;

        const filter={vendor:vendorId};

        if(status){
            filter.status=status;
        }

        const orders=await order.find(filter)
        .populate('buyer','name email')
        .populate('products.product','name price')
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(parseInt(limit));

        const total=await order.countDocuments(filter);
        return res.status(200).json({
            orders,
            pagination:{
                page:parseInt(page),
                limit:parseInt(limit),
                total,
                pages:Math.ceil(total/limit)
            }
        });
        
    }
    catch(err){
        return next(err);
    }
};

const updateOrderStatus=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const {status}=req.body;
        const foundOrder=await order.findById(id);
        if(!foundOrder){
            const err=new Error("order does not exist");
            err.statusCode=404;
            return next(err);
        }
        if(foundOrder.vendor.toString()!==req.user.userId){
            const err=new Error("not authorised");
            err.statusCode=403;
            return next(err);
        }
        const validTransitions={
            'Confirmed':['Delivered','Cancelled']
        };

        if(!validTransitions[foundOrder.status].includes(status)){
            const err=new Error(`Cannot transition from '${foundOrder.status}' to '${status}'`);
            err.statusCode=400;
            return next(err);
        }
        foundOrder.status=status;
        await foundOrder.save();
        return res.status(200).json({message:"status changed",status});
    }
    catch(err){
        return next(err);
    }
};

const cancelOrder=async(req,res,next)=>{
    const session=await mongoose.startSession();
    
    try{
        session.startTransaction();
        const {id}=req.params;
        const foundOrder=await order.findById(id).session(session);
        if(!foundOrder){
            const err=new Error("Order not found");
            err.statusCode=404;
            return next(err);
        }
        if(foundOrder.buyer.toString()!==req.user.userId){
            const err=new Error("not authorised");
            err.statusCode=403;
            return next(err);
        }
        if(!['Pending','Confirmed'].includes(foundOrder.status)){
            const err=new Error(`Cannot cancel order with status: ${foundOrder.status}`);
            err.statusCode=400;
            await session.abortTransaction();
            return next(err);
        }
        const bulkOps=foundOrder.products.map(item=>({
            updateOne:{
                filter:{_id:item.product},
                update:{$inc:{quantity:item.quantity}}
            }
        }));
        await product.bulkWrite(bulkOps,{session});

        if (foundOrder.status === 'Confirmed' && foundOrder.razorpayPaymentId) {
            try {
                // Razorpay expects the amount in paise (multiply by 100)
                const refund = await razorpay.payments.refund(foundOrder.razorpayPaymentId, {
                    amount: foundOrder.totalPrice * 100
                });
                foundOrder.refundId = refund.id;
                foundOrder.refundStatus = 'Processed';
            } catch (rzpErr) {
                console.error("Razorpay refund failed:", rzpErr.error || rzpErr);
                // In test mode or on gateway error, we still want to cancel the order.
                // We mark refund status as pending manual review.
                foundOrder.refundStatus = 'Pending';
            }
        }

        foundOrder.status="Cancelled";
        await foundOrder.save({session});

        await session.commitTransaction();
        return res.status(200).json({message:"Order Cancelled",order:foundOrder});
    }
    catch(err){
        await session.abortTransaction();
        return res.status(500).json({ message: err.message || "Unknown error", details: err });
    }
    finally{
        session.endSession();
    }
};

module.exports={
    placeOrder,cancelOrder,getMyOrders,getVendorOrders,updateOrderStatus
};