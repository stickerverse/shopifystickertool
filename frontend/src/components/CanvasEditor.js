import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { CirclePicker } from 'react-color'; // For color selection
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { saveAs } from 'file-saver'; //To download Image
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrash, faImage, faTextHeight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

//Add Fontawesome Icons
library.add(faTrash, faImage, faTextHeight);

const CanvasEditor = ({ onUpdate }) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [textColor, setTextColor] = useState('#000000');
    const [strokeColor, setStrokeColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(0);
    const [textInput, setTextInput] = useState("Your text here");
    const [fontFamily, setFontFamily] = useState('Arial'); // Add fontFamily state
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // For displaying uploaded images

    //Font Styles
    const googleFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway'];

    const [canvasWidth, setCanvasWidth] = useState(800);
    const [canvasHeight, setCanvasHeight] = useState(600);

    useEffect(() => {
        fabricRef.current = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true
        });

        fabricRef.current.on('selection:cleared', () => {
            setSelectedObject(null); // Reset selected object on deselection
        });

        const handleObjectSelection = () => {
            const activeObject = fabricRef.current.getActiveObject();
            setSelectedObject(activeObject);

            if (activeObject && activeObject.type === 'text') {
                //Update the font family state
                setFontFamily(activeObject.fontFamily || 'Arial');
            }
        };

        fabricRef.current.on('selection:created', handleObjectSelection);
        fabricRef.current.on('selection:updated', handleObjectSelection);

        fabricRef.current.on('object:modified', () => {
            onUpdate(fabricRef.current);
        });
        fabricRef.current.on('object:added', () => {
            onUpdate(fabricRef.current);
        });
        fabricRef.current.on('object:removed', () => {
            onUpdate(fabricRef.current);
        });


        return () => {
            fabricRef.current.dispose();
        };
    }, [onUpdate]);

    //Remove Background of the image
    const handleRemoveBackground = async () => {
        if (!selectedObject