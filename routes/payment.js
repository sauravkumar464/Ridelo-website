// // routes/payment.js
// const express = require('express');
// const router = express.Router();
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // Route to create a new order
// router.post('/razorpay-order', async (req, res) => {
//     // Add this line to log the incoming request body
//     console.log('Received request body for order:', req.body);

//     try {
//         const amount = req.body.amount;
//         if (!amount || amount <= 0) {
//             return res.status(400).json({ error: 'Amount is required and must be a positive number.' });
//         }

//         const options = {
//             amount: amount * 100, // Amount in paise
//             currency: 'INR',
//             receipt: `receipt_order_${Date.now()}`,
//             payment_capture: 1, // Auto-capture payment
//         };
//         const order = await razorpay.orders.create(options);
//         res.status(200).json({
//             id: order.id,
//             currency: order.currency,
//             amount: order.amount,
//         });
//     } catch (err) {
//         console.error('Error creating Razorpay order:', err.message); // Log the specific error
//         res.status(500).send("Something went wrong!");
//     }
// });

// // Route to verify the payment signature
// router.post('/razorpay-verify', (req, res) => {
//     // ... (This part of the code is likely fine)
//     // ...
// });

// module.exports = router;