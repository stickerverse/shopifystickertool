const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Link to User, add index
    name: { type: String, required: true, trim: true }, // Trim whitespace
    designData: { type: Object, required: true }, // Store Fabric.js JSON
    previewImageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    shopifyProductId: { type: String, index: true } // Reference to Shopify product, add index
});

module.exports = mongoose.model('Design', designSchema);