const express = require('express');
const router = express.Router();
const shopifyController = require('../controllers/shopify.controller');
const { verifyToken } = require('./auth.routes');

router.post('/sync/:designId',verifyToken, shopifyController.syncDesignToShopify); //Sync design
router.post('/calculate-price', verifyToken, shopifyController.calculatePrice); //Calculate Price
router.post('/webhook/orders', shopifyController.handleOrderWebhook); // Webhook endpoint (no token verification - Shopify signs webhooks)

module.exports = router;