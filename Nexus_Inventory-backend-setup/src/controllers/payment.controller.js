const razorpay = require('../config/razorpay.config');
const order = require('../models/order');
const crypto=require('crypto');

const createPayment = async (req, res, next) => {
    try {
        const { orderId, amount } = req.body;

        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId
        });

        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount
        });
    } catch (err) {
        return next(err);
    }
};


const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId } = req.body;

        const crypto = require('crypto');
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            await order.findByIdAndUpdate(OrderId, {
                status: 'Confirmed',
                razorpayPaymentId: razorpay_payment_id 
            });
            return res.status(200).json({ success: true });
        }

        await order.findByIdAndUpdate(OrderId, {
            status: 'Payment Failed'
        });
        return res.status(400).json({ success: false });
    } catch (err) {
        return next(err);
    }
};


module.exports = {
    createPayment,
    verifyPayment
};
