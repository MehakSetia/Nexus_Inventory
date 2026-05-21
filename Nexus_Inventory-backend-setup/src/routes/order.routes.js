const express=require('express');
const router=express.Router();
const {placeOrder,cancelOrder,getMyOrders,getVendorOrders,updateOrderStatus}=require('../controllers/order.controller');
const {verify}=require('../middleware/authMiddleware');

router.post('/add',verify,placeOrder);
router.get('/',verify,getMyOrders);
router.get('/vendor',verify,getVendorOrders);
router.patch('/:id/status',verify,updateOrderStatus);
router.patch('/:id/cancel',verify,cancelOrder);

module.exports=router;