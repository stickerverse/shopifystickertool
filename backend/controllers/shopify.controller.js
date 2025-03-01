const { Shopify } = require('@shopify/shopify-api');
const crypto = require('crypto'); // Import Node.js crypto module
const Design = require('../models/design.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// --- Sync design to Shopify (Refined) ---
exports.syncDesignToShopify = async (req, res) => {
    try {
        const { designId } = req.params;
        const design = await Design.findById(designId);

        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        //Check the ownership
        const user = await User.findOne({ uid: req.user.uid });
        if (!user || design.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this design' });
        }

        const shopify = new Shopify.Shopify({
            apiKey: process.env.SHOPIFY_API_KEY,
            apiSecretKey: process.env.SHOPIFY_API_SECRET,
            shop: process.env.SHOPIFY_SHOP_DOMAIN,
            accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
        });

        let product_response;
        if (design.shopifyProductId) {
            // Product exists, update it
            const session = shopify.session;
            const client = new Shopify.Clients.Rest(session);

            const updatedProductData = {
                id: design.shopifyProductId,
                title: design.name,
                body_html: `<p>Custom design: ${design.name}</p>`,
                images: [
                    {
                        src: design.previewImageUrl,
                    },
                ],
            };
             try {
                const response = await client.put({
                    path: `products/${design.shopifyProductId}`,
                    data: {product: updatedProductData},
                    type: Shopify.DataType.JSON
                });
                 product_response = response.body.product;

             } catch (error) {
                console.error("Error updating product:", error);
                 return res.status(500).json({ message: 'Failed to update design to Shopify', error: error.message });
             }

            res.status(200).json({
                message: 'Design updated in Shopify successfully!',
                shopifyProductId: product_response.id,
                product: product_response
            });
            return; // Exit after updating

        } else {
            // Product doesn't exist, create a new one
            const productData = {
                title: design.name,
                body_html: `<p>Custom design: ${design.name}</p>`,
                vendor: 'Your Vendor',
                product_type: 'Custom Product',
                status: 'draft', //Start as draft
                images: [{ src: design.previewImageUrl }],
                //Add variants as needed
            };
            const session = shopify.session;
            const client = new Shopify.Clients.Rest(session);
             try {
                const response = await client.post({
                    path: 'products',
                    data: {product:productData},
                    type: Shopify.DataType.JSON,
                });
                 product_response = response.body.product;
             } catch (error) {
                console.error("Error creating product:", error);
                return res.status(500).json({ message: 'Failed to create design to Shopify', error: error.message });
             }

            //Save Product to Database
            const newProduct = new Product({
                shopifyProductId: product_response.id,
                designId: designId,
                title: product_response.title,
            });

            await newProduct.save();

            // Update design with the Shopify product ID
            design.shopifyProductId = product_response.id;
            await design.save();

            res.status(201).json({
                message: 'Design synced to Shopify successfully!',
                shopifyProductId: product_response.id,
                product: product_response
            });
        }

    } catch (error) {
        console.error("Error syncing to Shopify:", error);
        res.status(500).json({ message: 'Failed to sync design to Shopify', error: error.message });
    }
};

// --- Webhook Handler for Order Creation (with Verification) ---
exports.handleOrderWebhook = async (req, res) => {
    try {
        // 1. Verify the webhook signature
        const hmac = req.get('X-Shopify-Hmac-Sha256');
        const rawBody = JSON.stringify(req.body);

        const generatedHash = crypto
            .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
            .update(rawBody)
            .digest('base64');

        if (generatedHash !== hmac) {
            console.error('Webhook signature verification failed!');
            return res.status(401).send('Unauthorized: Webhook signature verification failed');
        }

        // 2. Process the webhook payload
        const shopifyOrderId = req.body.id;
        const totalPrice = req.body.total_price;
        const lineItems = req.body.line_items;

        console.log(`Received order webhook for order ID: ${shopifyOrderId}`);

        for (const item of lineItems) {
            if (item.product_id) {
                try {
                    const relatedProduct = await Product.findOne({ shopifyProductId: item.product_id.toString() });

                    if (relatedProduct) {
                        const designId = relatedProduct.designId;
                        const design = await Design.findById(designId);

                        if (design) {
                            const user = await User.findById(design.userId);

                            if (user) {
                                const newOrder = new Order({
                                    shopifyOrderId,
                                    userId: user._id,
                                    designId: design._id,
                                    orderStatus: 'pending',
                                    totalPrice,
                                });

                                await newOrder.save();
                                console.log(`Saved order ${shopifyOrderId} for design ${designId}`);
                            } else {
                                console.warn(`No user found for design ID: ${designId}`);
                            }
                        } else {
                            console.warn(`No design found for design ID: ${designId}`);
                        }
                    }
                } catch (dbError) {
                    console.error("Database error during webhook processing:", dbError);
                }
            }
        }

        res.status(200).send('Webhook received and processed successfully');

    } catch (error) {
        console.error("Error handling order webhook:", error);
        res.status(500).send('Webhook error');
    }
};

// --- Calculate Price (Placeholder - needs full implementation) ---
exports.calculatePrice = async (req, res) => {
     //  Implement your pricing logic here.
    const basePrice = 20;
    const designElements = req.body.designElements || 0;
    const complexityFactor = designElements * 0.5;
    const totalPrice = basePrice + complexityFactor;

    res.json({ price: totalPrice });
};