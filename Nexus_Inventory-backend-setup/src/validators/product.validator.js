
const z=require('zod');


const productSchema=z.object({
    name:z.string().min(2),
    category:z.string().min(4),
    quantity:z.number().gt(0),
    price:z.number().gt(0),
    description:z.string().optional(),
    imageUrl:z.string().optional(),
    dimensions:z.object({
        length:z.number().gt(0),
        width:z.number().gt(0),
        height:z.number().gt(0),
        unit:z.string()
    })
});

module.exports={productSchema};