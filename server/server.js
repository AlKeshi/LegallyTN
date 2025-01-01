// server.js

require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');
const db = require('./config/db'); // Ensure this path is correct
const initializePassport = require('./config/passport-config'); // Ensure this path is correct
const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const { swaggerUi, swaggerDocs } = require('./swagger'); // Ensure this path is correct

// Initialize Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize Passport.js
initializePassport(
  passport,
  async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
);

// Middleware Setup
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Update this if your frontend is hosted elsewhere
  credentials: true 
}));
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

// Initialize Google Generative AI (if needed on the server side)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Constants
const BOT_USER_EMAIL = 'bot@houyemai.com';
const BOT_USER_FIRST_NAME = 'HouyemAI';
const BOT_USER_LAST_NAME = 'Assistant';
const BOT_USER_PASSWORD = 'botpassword'; // Ensure this is secure or handled appropriately

let BOT_USER_ID = null;

// Function to ensure bot user exists
const ensureBotUserExists = async () => {
  try {
    // Check if bot user already exists
    const result = await db.query('SELECT * FROM users WHERE email = $1', [BOT_USER_EMAIL]);
    if (result.rows.length === 0) {
      // Hash the bot's password
      const hashedPassword = await bcrypt.hash(BOT_USER_PASSWORD, 10);
      
      // Insert bot user into the database
      const insertResult = await db.query(
        `INSERT INTO users (first_name, last_name, email, password, user_type, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [BOT_USER_FIRST_NAME, BOT_USER_LAST_NAME, BOT_USER_EMAIL, hashedPassword, 'chatbot', new Date()]
      );
      
      BOT_USER_ID = insertResult.rows[0].id;
      console.log(`Bot user created with ID: ${BOT_USER_ID}`);
    } else {
      BOT_USER_ID = result.rows[0].id;
      console.log(`Bot user exists with ID: ${BOT_USER_ID}`);
    }
  } catch (error) {
    console.error('Error ensuring bot user exists:', error);
    process.exit(1); // Exit the application if bot user cannot be ensured
  }
};

// Call the function to ensure bot user exists
ensureBotUserExists();

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

// Authentication Endpoints

// Get Authentication Status
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        userType: req.user.user_type
      },
      botUser: {
        id: BOT_USER_ID,
        email: BOT_USER_EMAIL,
        firstName: BOT_USER_FIRST_NAME,
        lastName: BOT_USER_LAST_NAME,
        userType: 'chatbot'
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Signup Endpoint
/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *               phoneNumber:
 *                 type: string
 *                 example: "123-456-7890"
 *               userType:
 *                 type: string
 *                 example: lawyer
 *               barNumber:
 *                 type: string
 *                 example: BAR12345
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.post('/api/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      barNumber,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Validate lawyer registration
    if (userType.toLowerCase() === 'lawyer' && !barNumber) {
      return res.status(400).json({ message: 'Bar number is required for lawyers' });
    }

    // Check if user already exists
    const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password and insert user into the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, user_type, bar_number, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, first_name, last_name, email, user_type`,
      [firstName, lastName, email, hashedPassword, phoneNumber, userType.toLowerCase(), barNumber, new Date()]
    );

    const newUser = result.rows[0];

    // Log in the user automatically
    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after registration' });
      }
      res.status(201).json({
        message: 'Registration successful',
        user: newUser,
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Endpoint
app.post('/api/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    } 
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type
        },
        botUser: {
          id: BOT_USER_ID,
          email: BOT_USER_EMAIL,
          firstName: BOT_USER_FIRST_NAME,
          lastName: BOT_USER_LAST_NAME,
          userType: 'chatbot'
        }
      });
    });
  })(req, res, next);
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Protected Route Example
app.get('/api/protected', checkAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Conversations API

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Sample Conversation
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 user_id:
 *                   type: integer
 *                   example: 42
 *                 title:
 *                   type: string
 *                   example: Sample Conversation
 *                 status:
 *                   type: string
 *                   example: active
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-12-07T19:35:12.000Z
 *       400:
 *         description: Bad request (e.g., missing title)
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal Server Error
 */
app.post('/api/conversations', checkAuthenticated, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const userId = req.user.id; // Use authenticated user's ID

    const result = await db.query(
      `INSERT INTO conversations (user_id, title, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, 'active', new Date()]
    );

    const newConversation = result.rows[0];
    console.log('Conversation created:', newConversation);
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error inserting conversation into DB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Retrieve all conversations for the authenticated user
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 42
 *                   title:
 *                     type: string
 *                     example: Sample Conversation
 *                   status:
 *                     type: string
 *                     example: active
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-12-07T19:35:12.000Z
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
app.get('/api/conversations', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   put:
 *     summary: Update conversation's title or status
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Conversation Title
 *               status:
 *                 type: string
 *                 example: inactive
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found or not authorized
 *       500:
 *         description: Internal server error
 */
app.put('/api/conversations/:id', checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    // Ensure at least one field is provided for update
    if (!title && !status) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const fields = [];
    const values = [];
    let query = 'UPDATE conversations SET ';

    if (title) {
      fields.push('title');
      values.push(title);
    }

    if (status) {
      fields.push('status');
      values.push(status);
    }

    fields.forEach((field, index) => {
      query += `${field} = $${index + 1}`;
      if (index < fields.length - 1) {
        query += ', ';
      }
    });

    query += ` WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`;
    values.push(id, req.user.id); // Ensure the conversation belongs to the user

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or not authorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found or not authorized
 *       500:
 *         description: Internal server error
 */
app.delete('/api/conversations/:id', checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the conversation belongs to the authenticated user
    const convCheck = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or not authorized' });
    }

    await db.query('DELETE FROM conversations WHERE id = $1', [id]);

    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Messages API

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Add a message to a conversation
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - messageContent
 *               - senderRole
 *             properties:
 *               conversationId:
 *                 type: integer
 *                 example: 1
 *               messageType:
 *                 type: string
 *                 example: text
 *               messageContent:
 *                 type: string
 *                 example: Hello, how can I help you?
 *               senderRole:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: Message added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 conversation_id:
 *                   type: integer
 *                 sender_id:
 *                   type: integer
 *                 message_type:
 *                   type: string
 *                 message_content:
 *                   type: string
 *                 sender_role:
 *                   type: string
 *                 sent_at:
 *                   type: string
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found or not authorized
 *       500:
 *         description: Internal server error
 */
app.post('/api/messages', checkAuthenticated, async (req, res) => {
  try {
    const { conversationId, messageType, messageContent, senderRole } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !messageContent || !senderRole) {
      return res.status(400).json({ message: 'Conversation ID, message content, and sender role are required' });
    }

    // Validate senderRole
    if (!['user', 'chatbot'].includes(senderRole.toLowerCase())) {
      return res.status(400).json({ message: 'senderRole must be either "user" or "chatbot"' });
    }

    let actualSenderId = senderId;

    if (senderRole.toLowerCase() === 'chatbot') {
      actualSenderId = BOT_USER_ID; // Assign bot's user ID
    }

    // Ensure the conversation belongs to the authenticated user
    const convCheck = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, senderId]
    );

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or not authorized' });
    }

    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, message_type, message_content, sender_role, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [conversationId, actualSenderId, messageType || 'text', messageContent, senderRole.toLowerCase(), new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Retrieve all messages for a specific conversation
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []  # Use this if authentication is required
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   conversation_id:
 *                     type: integer
 *                   sender_id:
 *                     type: integer
 *                   message_type:
 *                     type: string
 *                   message_content:
 *                     type: string
 *                   sender_role:
 *                     type: string
 *                   sent_at:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   user_type:
 *                     type: string
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Conversation not found or not authorized
 *       500:
 *         description: Internal server error
 */
app.get('/api/messages/:conversationId', checkAuthenticated, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Ensure the conversation belongs to the authenticated user
    const convCheck = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, req.user.id]
    );

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or not authorized' });
    }

    const result = await db.query(
      `SELECT m.*, u.first_name, u.last_name, u.user_type
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.sent_at ASC`,
      [conversationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});