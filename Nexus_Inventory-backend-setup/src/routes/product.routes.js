const express=require('express');
const router=express.Router();
const {addProduct,getAllProducts,getProductById,deleteProduct,updateQuantity,getMyProduct}=require('../controllers/product.controller');
const {verify}=require('../middleware/authMiddleware');

router.post('/add',verify,addProduct);
router.get('/',getAllProducts);
router.get('/my-products',verify,getMyProduct);
router.get('/:id',getProductById);
router.patch('/:id/update',verify,updateQuantity);
router.delete('/:id/delete',verify,deleteProduct);

module.exports=router;