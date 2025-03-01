import React, { useState, useEffect } from 'react';
import CanvasEditor from '../components/CanvasEditor';
import ImageUploader from '../components/ImageUploader';
import FontSelector from '../components/FontSelector';
import ShopifySync from '../components/ShopifySync';
import ProductPreview from '../components/ProductPreview';
import TemplateSelector from '../components/TemplateSelector';
import io from 'socket.io-client';
import {Page} from '@shopify/polaris';

const DesignerPage = () => {
    const [canvasState, setCanvasState] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize WebSocket connection (replace with your backend URL)
        const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');
        setSocket(newSocket);

        //Simulate getting token after login (Replace with actual authentication flow)
        const simulateLogin = async () => {
            //In a real app, you would make an API call to your backend to authenticate the user.
            //Here, we just simulate a successful login.
            const token = "SIMULATED_JWT_TOKEN";  //Replace with a real token
            localStorage.setItem('token', token);
        };

        simulateLogin();

        return () => newSocket.close(); // Clean up on unmount
    }, []);

      useEffect(() => {
        //Listen for real-time updates from the server
        if(socket){
            socket.on('designUpdate', (updatedCanvasState) => {
                //Update the local canvas state with the server data
                setCanvasState(updatedCanvasState);
            });
        }
      }, [socket]);

    const handleCanvasUpdate = (canvas) => {
        const jsonState = canvas.toJSON();
        setCanvasState(jsonState);

        //Emit canvas changes to the server
        if(socket){
            socket.emit('canvasChange', jsonState);
        }
    };

    return (
        <Page fullWidth>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Product Designer</h1>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 p-2">
                        <ImageUploader onImageUpload={(url) => console.log('Uploaded:', url)} />
                        <FontSelector onFontSelect={(font) => console.log('Selected:', font)} />
                        <TemplateSelector onTemplateSelect={(template) => console.log('Template:', template)} />
                        <ShopifySync canvasState={canvasState} />
                    </div>

                    <div className="col-span-1 p-2">
                        <CanvasEditor onUpdate={handleCanvasUpdate} />
                    </div>

                    <div className="col-span-1 p-2">
                        <ProductPreview canvasState={canvasState} />
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default DesignerPage;