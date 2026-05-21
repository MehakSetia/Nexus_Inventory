const mongoose =require('mongoose');
const { required } = require('zod/mini');
const {Schema}=mongoose;

const OrderSchema=new Schema({
    buyer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    products:[
        {
            product:{type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
            quantity:{type:Number,required:true,min:1}
        }
    ],
    totalPrice:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['Pending','Confirmed','Delivered','Cancelled'],
        default:'Pending',
        required:true
    },
    deliveryDate:{
        type:Date,
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    refundId: {
        type: String,
        default: null
    },
    refundStatus: {
        type: String,
        enum: ['Pending', 'Processed'],
        default: null
    }
},{ timestamps: true });

OrderSchema.index({buyer:1,createdAt:-1});
OrderSchema.index({'products.product':1});
OrderSchema.index({status:1});

module.exports=mongoose.model('Order',OrderSchema);