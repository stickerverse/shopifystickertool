const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopifyProductId: {
    type: String,
    required: true,
    unique: true, // Ensures each Shopify product is only synced once
    index: true // Index the product ID
  },
  designId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design', //Reference to the Design Model
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true // Trim whitespace
  },
  // Add other relevant fields like variants, images, etc.
});

module.exports = mongoose.model('Product', productSchema);