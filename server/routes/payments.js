// server/routes/payments.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment'); 
const User = require('../models/User'); 
const crypto = require('crypto'); // We need this for signature generation

// @desc    Initiate a payment transaction and generate a signature
// @route   POST /api/payments/initiate
// @access  Private
router.post('/initiate', auth(), async (req, res) => {
    try {
        const { amount, purpose, publisherId, articleId } = req.body;
        const total_amount = amount;
        const product_code = 'EPAYTEST';
        const transaction_uuid = new mongoose.Types.ObjectId().toString();
        
        // This is the secret key for the V2 API testing environment
        const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"; 
        
        // The message string for the signature must be in a specific order as per eSewa documentation
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        // Add this console.log to see the message you are hashing
        console.log('Backend Signature Message:', message);
        
        // Generate the HMAC-SHA256 hash and encode it in Base64
        const hash = crypto.createHmac('sha256', secretKey).update(message).digest();
        const signature = hash.toString('base64');
        
        // Add this console.log to see the signature you are sending to the frontend
        console.log('Backend Generated Signature:', signature);
        
        // Create a pending payment record in the database
        const newPayment = await Payment.create({
            user: req.user.id,
            publisher: publisherId,
            article: articleId,
            amount: total_amount,
            status: 'pending',
            transactionId: transaction_uuid,
            purpose: purpose 
        });

        // Send all necessary details to the frontend
        res.status(200).json({ 
            success: true, 
            paymentDetails: {
                amount: total_amount,
                product_code,
                transaction_uuid,
                signature
            }
        });

    } catch (err) {
        console.error('Error initiating eSewa payment:', err.message);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
});


// @desc    Verify a completed payment
// @route   GET /api/payments/verify
// @access  Public (Called by eSewa's server)
router.get('/verify', async (req, res) => {
    try {
        const { data } = req.query;

        if (!data) {
            return res.status(400).send('Verification failed: Missing data parameter');
        }

        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const transactionDetails = JSON.parse(decodedData);

        const { status, total_amount, transaction_code, transaction_uuid } = transactionDetails;

        if (status !== 'COMPLETE') {
            return res.redirect('http://localhost:5173/payment-failed?reason=payment_not_complete');
        }

        // --- NEW VERIFICATION API CALL ---
        const verificationResponse = await axios.get('https://rc.esewa.com.np/api/epay/transaction/status/', {
            params: {
                'product_code': 'EPAYTEST',
                'total_amount': total_amount,
                'transaction_uuid': transaction_uuid
            }
        });

        if (verificationResponse.data.status === 'COMPLETE') {
            // Find the payment record using the unique transaction_uuid
            const paymentRecord = await Payment.findOne({ transactionId: transaction_uuid });

            if (!paymentRecord || paymentRecord.status === 'completed') {
                return res.redirect('http://localhost:5173/payment-success');
            }

            paymentRecord.status = 'completed';
            paymentRecord.esewaTransactionCode = transaction_code;
            await paymentRecord.save();

            const publisher = await User.findById(paymentRecord.publisher);
            if (publisher) {
                publisher.balance = (publisher.balance || 0) + paymentRecord.amount;
                await publisher.save();
            }

            res.redirect(`http://localhost:5173/payment-success?amount=${total_amount}`);

        } else {
            res.redirect('http://localhost:5173/payment-failed?reason=verification_failed');
        }

    } catch (err) {
        console.error('Error verifying eSewa payment:', err.response?.data || err.message);
        res.status(500).redirect('http://localhost:5173/payment-failed?reason=server_error');
    }
});

module.exports = router;