const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shopifyOrderId: { type: String, required: true, unique: true, index: true }, // Index order ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Index user ID
    designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true, index: true },  // Index design ID
    orderStatus: { type: String, default: 'pending', trim: true }, // Trim whitespace
    totalPrice: { type: Number, required: true },
    // Add other relevant order details (shipping address, items, etc.)
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);