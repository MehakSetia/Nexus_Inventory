require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function test() {
    try {
        console.log("Fetching payment...");
        const payment = await razorpay.payments.fetch('pay_SonibQEKYU7nvd');
        console.log("Payment status:", payment.status);
        console.log("Payment details:", payment);

        if (payment.status === 'authorized') {
            console.log("Payment is authorized, attempting to capture...");
            await razorpay.payments.capture('pay_SonibQEKYU7nvd', payment.amount, payment.currency);
            console.log("Captured successfully!");
        }

        console.log("Attempting to refund...");
        console.log("Attempting to refund via Axios...");
        const axios = require('axios');
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
        const res = await axios.post(`https://api.razorpay.com/v1/payments/pay_SonibQEKYU7nvd/refund`, {}, {
            headers: { Authorization: `Basic ${auth}` }
        });
        console.log("Refund success!", res.data);
    } catch (e) {
        console.error("Razorpay Error:", e.response ? e.response.data : e.message);
    }
}
test();
