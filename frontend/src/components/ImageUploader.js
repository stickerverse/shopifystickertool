import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ onImageUpload }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);

        // Create a preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            alert("Please select an image.");
            return;
        }

        //Convert image to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1]; // Extract base64 data

            try {
                // Upload the image (base64 encoded) to your backend
                const response = await axios.post('/api/images/upload', { image: `data:${selectedImage.type};base64,${base64Image}` });

                if (response.status === 200) {
                    console.log("Image uploaded successfully");
                    onImageUpload(response.data.imageData); // Pass the image URL or data to the parent component
                } else {
                    console.error("Upload failed:", response.data.message);
                    alert("Upload failed. Please try again.");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Error uploading image. Please try again.");
            }
        };

        reader.readAsDataURL(selectedImage);
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
                Upload Image:
            </label>
            <input
                type="file"
                onChange={handleImageChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {previewUrl && (
                <img src={previewUrl} alt="Preview" className="mt-2 max-w-full h-auto" />
            )}
            <button
                onClick={handleUpload}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
            >
                Upload
            </button>
        </div>
    );
};

export default ImageUploader;