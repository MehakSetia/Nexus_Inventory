const z=require('zod');

const orderSchema=z.object({
    productId:z.string(),
    quantity:z.number().gt(0)
});
module.exports={orderSchema};