const express=require('express');
const router=express.Router();
const {getAllUsers,getAllOrders,getOrdersByUser,getProductsByVendor, getUsersByRole}=require('../controllers/admin.controller');
const {verify,isAdmin}=require('../middleware/authMiddleware');

router.get('/users',verify,isAdmin,getAllUsers);
router.get('/users/role',verify,isAdmin,getUsersByRole);
router.get('/orders',verify,isAdmin,getAllOrders);
router.get('/users/:id/orders',verify,isAdmin,getOrdersByUser);
router.get('/vendor/:id/products',verify,isAdmin,getProductsByVendor);

module.exports=router;