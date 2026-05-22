const { mongoose } = require('mongoose');
const product=require('../models/product');
const {productSchema}=require('../validators/product.validator');


const addProduct=async(req,res,next)=>{
    try{
        const {name,category,quantity,price,description,dimensions,imageUrl}=req.body;
        productSchema.parse({name,category,quantity,price,description,dimensions,imageUrl});
        const vendorId=req.user.userId;
        const role=req.user.role;
        if(role!=="Vendor"){
            const error=new Error("not authorised");
            error.statusCode=403;
            return next(error);
        }
        const newP=await product.create({name,category,quantity,price,description,dimensions,imageUrl,vendor:vendorId});
        return res.status(201).json({message:"product added",product:newP});
    }
    catch(err){
        next(err);
    }
};

const getAllProducts=async(req,res,next)=>{
    try{
     const query={}
     const page=parseInt(req.query.page) || 1;
     const limit=parseInt(req.query.limit) || 10;
     
    if(req.query.category) query.category={$regex: new RegExp(req.query.category, 'i')};

    if(req.query.minPrice || req.query.maxPrice){
        query.price={};
        if(req.query.minPrice) query.price.$gte=parseFloat(req.query.minPrice);
        if(req.query.maxPrice) query.price.$lte=parseFloat(req.query.maxPrice);
    }

    if(req.query.search) query.name={$regex:req.query.search,$options:'i'};

    if(req.query.vendor) query.vendor=req.query.vendor;

    const sortOptions={};
    if(req.query.sort === 'price_asc') sortOptions.price=1;
    if(req.query.sort === 'price_desc') sortOptions.price=-1;
    if(req.query.sort === 'newest') sortOptions.createdAt=-1;

    const prods=await product.find(query).sort(sortOptions).limit(limit).skip((page-1)*limit).populate('vendor', 'name email');
    const total=await product.countDocuments(query);

    return res.status(200).json({
        products:prods,
        page,
        limit,
        total,
        pages:Math.ceil(total/limit)
    });
    }
    catch(err){
        return next(err);
    }
};

const updateQuantity=async(req,res,next)=>{
    const session= await mongoose.startSession();
    
    try{
        session.startTransaction();
        const {id}=req.params;
        const {quantity}=req.body;

        if(quantity < 0){
            const err=new Error("Quantity can not be negative");
            err.statusCode=400;
            await session.abortTransaction();
            return next(err);
        }

    const prod=await product.findOneAndUpdate(
        { _id:id},
        {$inc:{quantity:quantity}},
        { returnDocument: 'after' ,session}

    );
    if(!prod){
        const err=new Error("product does not exist");
        err.statusCode=404;
        return next(err);
    }
    if(prod.vendor.toString()!==req.user.userId){
        const err=new Error("not authorised");
        err.statusCode=403;
        return next(err);
    }
    await prod.save({session});

    await session.commitTransaction();
    return res.status(200).json({message:"updated quantity to: ",quantity});
    }
    catch(err){
        session.abortTransaction();
        return next(err);
    }
    finally{
        session.endSession();
    }
};

const getProductById=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const prod=await product.findById(id).populate('vendor', 'name email');
        if(prod===null){
            const err=new Error("product not found");
            err.statusCode=404;
            return next(err);
        }
        return res.status(200).json(prod);
    }
    catch(err){
        return next(err);
    }
};

const getMyProduct=async(req,res,next)=>{
    try{
        const vendorId=req.user.userId;
        const products=await product.find({vendor:vendorId});
        
        return res.status(200).json(products);
    }
    catch(err){
        return next(err);
    }
};

const deleteProduct=async(req,res,next)=>{
    try{
        const {id}=req.params;
        const prod=await product.findById(id);
        if(prod===null){
            const err=new Error("product not found");
            err.statusCode=404;
            return next(err);
        }
        if(prod.vendor.toString()!==req.user.userId){
            const err=new Error("not authoried");
            err.statusCode=403;
            return next(err);
        }
        await prod.deleteOne();
        return res.status(200).json("product deleted");
    }
    catch(err){
        return next(err);
    }
}

module.exports={
    addProduct,getAllProducts,getProductById,deleteProduct,updateQuantity,getMyProduct
};