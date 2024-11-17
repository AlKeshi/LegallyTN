require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');

// Add express.json middleware for parsing JSON requests
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // React app origin
  credentials: true // Allow cookies
}));

const users = []; // In production, this should be replaced with a database

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// API Endpoints

// Check auth status
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      isAuthenticated: true, 
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        userType: req.user.userType
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Login endpoint
app.post('/api/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        }
      });
    });
  })(req, res, next);
});

// Signup endpoint
// In server.js - Update the signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        userType,
        barNumber
      } = req.body;
  
      // Check if user already exists
      if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // Validate required fields
      if (!firstName || !lastName || !email || !password || !userType) {
        return res.status(400).json({ message: 'All required fields must be filled' });
      }
  
      // Validate lawyer registration
      if (userType === 'lawyer' && !barNumber) {
        return res.status(400).json({ message: 'Bar number is required for lawyers' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userType,
        barNumber,
        createdAt: new Date()
      };
  
      users.push(newUser);
      console.log('New user registered:', {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userType: newUser.userType
      });
  
      // Log in the user automatically after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        res.status(201).json({
          message: 'Registration successful',
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            userType: newUser.userType
          }
        });
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Protected route example
app.get('/api/protected', checkAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Middleware functions
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.status(403).json({ message: 'Already authenticated' });
  }
  next();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});