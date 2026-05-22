const express=require('express');
const rateLimit=require('express-rate-limit');
const cors=require('cors');
const errorHandler = require('./middleware/errorHandler');
const app=express();

// Trust the first proxy (Render load balancers)
app.set('trust proxy', 1);

const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100
});
app.use(express.json());
app.use(limiter);
app.use(cors());

const authRoutes=require('./routes/auth.routes');
const productRoutes=require('./routes/product.routes');
const orderRoutes=require('./routes/order.routes');
const adminRoutes=require('./routes/admin.routes');
const paymentRoutes=require('./routes/payment.routes');

app.use('/api/auth',authRoutes);
app.use('/api/product',productRoutes);
app.use('/api/order',orderRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/payment',paymentRoutes);

app.use(errorHandler);
module.exports=app;