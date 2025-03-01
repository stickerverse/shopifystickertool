const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// --- Middleware to Verify Firebase ID Token ---
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Add the decoded user information to the request
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// --- Register (Create User in Firebase) ---
router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const userRecord = await admin.auth().createUser({
        email,
        password,
        emailVerified: false, // You might want to implement email verification
        disabled: false,
      });

      res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });

    } catch (error) {
      console.error('Error creating user:', error);
      // Handle specific Firebase error codes
      if (error.code === 'auth/email-already-exists') {
          return res.status(409).json({message: 'Email already in use'});
      }
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  });

// --- Login (Get JWT using Firebase ID Token) ---
router.post('/login', async (req, res) => {
  const idToken = req.body.idToken; // Expect Firebase ID token from the client

  if (!idToken) {
    return res.status(400).json({ message: 'ID Token is required' });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Create a JWT for your own API's use
    const customToken = jwt.sign(
      {
        uid: decodedToken.uid, // Include the user ID
        email: decodedToken.email, // And email
      },
      process.env.JWT_SECRET, // Your secret key
      { expiresIn: '1h' } // Set expiration (adjust as needed)
    );

    res.status(200).json({ message: 'Login successful', token: customToken });

  } catch (error) {
    console.error('Error during login:', error);
     if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Invalid or expired ID Token' });
    }
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// --- Example of a Protected Route ---
router.get('/protected', verifyToken, (req, res) => {
  // If the `verifyToken` middleware succeeds, `req.user` will be available
  res.json({ message: 'This is a protected route!', user: req.user });
});

// --- Logout (Client-side only) ---
// Logout is handled client-side by simply discarding the JWT. There's no server-side
// invalidation needed for JWTs, as they have a built-in expiration.

module.exports = router;