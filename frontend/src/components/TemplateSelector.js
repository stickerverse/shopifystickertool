import React from 'react';

const TemplateSelector = ({ onTemplateSelect }) => {
  const templates = [
    { id: 1, name: 'Template 1', imageUrl: 'template1.jpg' }, // Replace with actual image URLs
    { id: 2, name: 'Template 2', imageUrl: 'template2.jpg' },
    { id: 3, name: 'Template 3', imageUrl: 'template3.jpg' },
  ];

  const handleTemplateSelect = (template) => {
    //Load template to canvas using Fabric.js
    onTemplateSelect(template);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Select a Template</h2>
      <div className="flex flex-wrap">
        {templates.map(template => (
          <div
            key={template.id}
            className="w-1/3 p-2 cursor-pointer"
            onClick={() => handleTemplateSelect(template)}
          >
            <img src={template.imageUrl} alt={template.name} className="w-full h-auto" />
            <p className="text-center">{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;