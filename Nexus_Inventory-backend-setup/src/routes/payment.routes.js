const express=require('express');
const router=express.Router();
const {createPayment,verifyPayment}=require('../controllers/payment.controller');
const {verify}=require('../middleware/authMiddleware');

router.post('/create',verify,createPayment);
router.post('/verify',verify,verifyPayment);

module.exports=router;