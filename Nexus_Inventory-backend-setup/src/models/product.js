const mongoose=require('mongoose');
const {Schema}=mongoose;

const ProductSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    imageUrl: String,
    description:String,
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    dimensions:{
        length:Number,
        width:Number,
        height:Number,
        unit:String
    }
});

ProductSchema.index({vendor:1});
module.exports=mongoose.model('Product',ProductSchema);