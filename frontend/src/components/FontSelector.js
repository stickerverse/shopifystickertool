import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FontSelector = ({ onFontSelect }) => {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_FONTS_API_KEY;
    const apiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;

    const fetchFonts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(apiUrl);
        setFonts(response.data.items.slice(0, 10));
      } catch (err) {
        console.error("Error fetching fonts:", err);
        setError("Failed to load fonts. Please check your API key and network connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, []);

  const handleFontChange = (event) => {
    const selectedFont = event.target.value;
    onFontSelect(selectedFont);

    // Load the selected font in the document head
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${selectedFont}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select Font:
      </label>
      {loading && <p>Loading fonts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <select
        onChange={handleFontChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={loading || error}
      >
        <option value="">Select a Font</option>
        {fonts.map(font => (
          <option key={font.family} value={font.family}>
            {font.family}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontSelector;