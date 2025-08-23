// server/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // This will be null for platform support payments
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String, // Our unique ID for the transaction, will be generated on the backend
        required: true,
        unique: true,
    },
    esewaTransactionCode: {
        type: String, // The unique code provided by eSewa on a successful transaction
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    purpose: {
        type: String,
        enum: ['support', 'publisher_payment'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', PaymentSchema);