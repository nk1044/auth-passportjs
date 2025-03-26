import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import passport from '../config/auth.js';

const router = express.Router();

// Helper function to generate tokens
const generateTokens = (user) => {
  // Create payload for tokens
  const payload = {
    _id: user._id,
    email: user.email
  };

  // Generate access token - short lived (15 minutes)
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token - longer lived (7 days)
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Helper function to set cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set access token as HTTP-only cookie
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure in production
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  });

  // Set refresh token as HTTP-only cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh', // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword
    });
    
    // Save user to database
    await newUser.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser);
    
    // Store refresh token in user document
    newUser.refreshToken = refreshToken;
    await newUser.save();
    
    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();
    
    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    // Extract refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user with matching refresh token
    const user = await User.findOne({ 
      _id: decoded._id,
      refreshToken: refreshToken
    });
    
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user);
    
    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();
    
    // Set new cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    
    res.json({ message: 'Token refreshed successfully' });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Clear cookies
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  
  res.json({ message: 'Logged out successfully' });
});

// Protected route example
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});

export default router;