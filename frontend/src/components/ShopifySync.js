import React, { useState } from 'react';
import axios from 'axios';
import { Spinner } from '@shopify/polaris';

const ShopifySync = ({ canvasState }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [shopifyProductData, setShopifyProductData] = useState(null);

    const handleSyncToShopify = async () => {
        if (!canvasState) {
            alert("No design to sync.");
            return;
        }

        setLoading(true);
        setError(null); // Clear any previous errors
        setSuccess(false); // Reset success state
        setShopifyProductData(null); // Clear previous product data

        try {
            // 1. Save the design to your backend
            const designResponse = await axios.post('/api/designs', {
                name: 'Custom Design - ' + new Date().toLocaleString(), //Better Naming
                designData: canvasState,
                previewImageUrl: null, // Let the backend generate this if needed
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Include JWT
                }
            });


            if (designResponse.status !== 201) {
                console.error("Failed to save design:", designResponse);
                setError("Failed to save design. Please try again.");
                setLoading(false);
                return;
            }

            const designId = designResponse.data._id;

            // 2. Sync the saved design to Shopify
            const syncResponse = await axios.post(`/api/shopify/sync/${designId}`, {}, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Include JWT for Shopify sync
              }
            });

            if (syncResponse.status === 200 || syncResponse.status === 201) {
                setSuccess(true);
                setShopifyProductData(syncResponse.data.product); // Store product data
                setLoading(false);
            } else {
                console.error("Failed to sync to Shopify:", syncResponse);
                setError("Failed to sync to Shopify. Please try again.");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error syncing to Shopify:", error);
             let errorMessage = "An unexpected error occurred.";
            if (error.response) {
                // The request was made and the server responded with a status code
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                 // The request was made but no response was received
                errorMessage = "No response received from the server. Please check your network connection.";
            }
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleSyncToShopify}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
            >
                {loading ? <Spinner size="small" color="white"/> : 'Sync to Shopify'}
            </button>

            {success && (
                <div className="mt-2 text-green-600">
                    Design synced successfully!
                    {shopifyProductData && (
                        <div>
                            <p>Shopify Product ID: {shopifyProductData.id}</p>
                            <p>Title: {shopifyProductData.title}</p>
                            {/* Display other product details as needed */}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-2 text-red-600">
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default ShopifySync;