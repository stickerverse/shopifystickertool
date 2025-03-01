const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const helmet = require('helmet'); // Security HTTP headers
const rateLimit = require('express-rate-limit');  // Rate limiting

// Import Route Files
const designRoutes = require('./routes/designs.routes');
const shopifyRoutes = require('./routes/shopify.routes');
const imageRoutes = require('./routes/images.routes');
const authRoutes = require('./routes/auth.routes'); //Authentication

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- Security Middleware ---
app.use(helmet()); // Set security-related HTTP headers

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); //Increase limit for large designs
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev')); //Log HTTP Requests

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on fatal MongoDB connection error
  });

// --- Initialize Firebase Admin SDK ---
try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Firebase initialization error:", error);
  process.exit(1); // Exit process on fatal Firebase initialization error
}

// --- Routes ---
app.use('/api/designs', designRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes); // Use authentication routes

// --- Error Handling Middleware (Catch-all) ---
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack to console
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});