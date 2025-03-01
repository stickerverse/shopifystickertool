import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';

const ProductPreview = ({ canvasState }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const previewCanvasRef = React.useRef(null);

    useEffect(() => {
        if (canvasState) {
            const previewCanvas = new fabric.StaticCanvas(previewCanvasRef.current, {
                width: 200,  //Smaller preview size
                height: 200,
            });

            previewCanvas.loadFromJSON(canvasState, () => {
                previewCanvas.renderAll.bind(previewCanvas)();
                const url = previewCanvas.toDataURL();
                setPreviewUrl(url);
            });

            return () => previewCanvas.dispose();  // Clean up on unmount
        }
    }, [canvasState]);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Product Preview</h2>
            {previewUrl ? (
                <img src={previewUrl} alt="Product Preview" className="max-w-full h-auto" />
            ) : (
                <p>No design to preview.</p>
            )}
            <canvas ref={previewCanvasRef} style={{ display: 'none' }}/>
        </div>
    );
};

export default ProductPreview;