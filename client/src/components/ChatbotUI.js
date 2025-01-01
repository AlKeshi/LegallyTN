// ChatbotUI.js

import React, { useState, useRef, useEffect } from 'react';
import DocumentsDrawer from './DocumentsDrawer';
import ArticleIcon from '@mui/icons-material/Article';
import { GoogleGenerativeAI } from '@google/generative-ai';

import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  AppBar,
  Toolbar,
  Tooltip,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy,
  Person,
  DeleteOutline,
  ContentCopy,
  Add as AddIcon,
  Menu as MenuIcon,
  ExitToApp,
  AccountCircle,
  Home,
} from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { useNavigate } from 'react-router-dom';

const genAI = new GoogleGenerativeAI('AIzaSyABdg1rJTUE01cBRvxbdSo9bXCfn6p4Quw'); // Use environment variable for API key

const DRAWER_WIDTH = 400;


const ChatbotUI = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [botUser, setBotUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievedJson, setRetrievedJson] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [jsonDrawerOpen, setJsonDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [retrievedDocuments, setRetrievedDocuments] = useState([]);

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setSnackbar({ open: true, message: 'Copied to clipboard', severity: 'success' });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Function to render message content with code blocks and LaTeX
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') {
      console.warn('Message content is not a string:', content);
      return 'No content available.';
    }

    const segments = content.split(/(```[\s\S]*?```)/g);

    return segments.map((segment, index) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        return (
          <Box key={index} sx={{ position: 'relative', my: 2 }}>
            <Paper
              sx={{
                backgroundColor: '#1e1e1e',
                color: '#fff',
                p: 2,
                borderRadius: 1,
                overflowX: 'auto',
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{segment.slice(3, -3)}</pre>
            </Paper>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(segment.slice(3, -3))}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        );
      }
      return <Latex key={index}>{segment}</Latex>;
    });
  };

  // Fetch user data and conversations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch authentication status
        const authResponse = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include',
        });
        const authData = await authResponse.json();
        if (authData.isAuthenticated) {
          setUser(authData.user);
          setBotUser(authData.botUser); // Store bot user data
          // Fetch user's conversations
          const convResponse = await fetch('http://localhost:5000/api/conversations', {
            credentials: 'include',
          });
          const convData = await convResponse.json();
          // Initialize conversations with empty messages
          const initializedConversations = convData.map((conv) => ({
            ...conv,
            messages: [],
          }));
          setConversations(initializedConversations);
          if (initializedConversations.length > 0) {
            setCurrentConversationId(initializedConversations[0].id);
            // Fetch messages for the first conversation
            await fetchMessages(initializedConversations[0].id);
          } else {
            // If no conversations, create a default one
            await createNewChat();
          }
        } else {
          navigate('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({ open: true, message: 'Error fetching data', severity: 'error' });
      }
    };

    fetchData();
  }, [navigate]);

  // Scroll to the latest message when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, currentConversationId]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        setBotUser(null);
        setConversations([]);
        setCurrentConversationId(null);
        setAnchorEl(null);
        navigate('/login'); // Redirect to login after logout
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Logout failed', severity: 'error' });
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setSnackbar({ open: true, message: 'Error logging out', severity: 'error' });
    }
  };

  // Function to create a new chat
  const createNewChat = async () => {
    if (!user) {
      setSnackbar({ open: true, message: 'User not authenticated', severity: 'error' });
      return;
    }

    const newConversation = {
      title: 'New Chat',
    };

    try {
      const response = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newConversation),
      });

      if (response.ok) {
        const data = await response.json();
        // Initialize the conversation with the default assistant message
        const assistantMessage = {
          sender_role: 'chatbot', // Use sender_role as 'chatbot'
          message_content: 'Mar7ba! I am your AI legal assistant. How can I help you today?',
          timestamp: new Date(),
          liked: false,
          disliked: false,
        };
        const initializedConversation = {
          ...data,
          messages: [assistantMessage],
        };
        setConversations([initializedConversation, ...conversations]);
        setCurrentConversationId(initializedConversation.id);
        setSnackbar({ open: true, message: 'New conversation created', severity: 'success' });

        // Persist the assistant message to the backend
        await addAssistantMessage(initializedConversation.id, assistantMessage.message_content);
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Failed to create conversation', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setSnackbar({ open: true, message: 'Error creating conversation', severity: 'error' });
    }
  };

  // Function to fetch messages for a specific conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const messages = await response.json();
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: messages }
              : conv
          )
        );
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Failed to fetch messages', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setSnackbar({ open: true, message: 'Error fetching messages', severity: 'error' });
    }
  };

  // Function to clear the current chat
  const clearCurrentChat = async () => {
    if (!currentConversationId) return;

    try {
      // Reset the messages locally
      const updatedConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [
                {
                  sender_role: 'chatbot',
                  message_content: 'Mar7ba! I am your AI legal assistant. How can I help you today?',
                  timestamp: new Date(),
                  liked: false,
                  disliked: false,
                },
              ],
              title: 'New Chat',
            }
          : conv
      );

      setConversations(updatedConversations);
      setSnackbar({ open: true, message: 'Chat cleared', severity: 'info' });

      // Persist the cleared assistant message to the backend
      await addAssistantMessage(currentConversationId, 'Mar7ba! I am your AI legal assistant. How can I help you today?');

      // Optionally, update the conversation title on the backend
      await updateConversationTitle(currentConversationId, 'New Chat');
    } catch (error) {
      console.error('Error clearing chat:', error);
      setSnackbar({ open: true, message: 'Error clearing chat', severity: 'error' });
    }
  };

  // Function to add assistant message to the backend
  const addAssistantMessage = async (conversationId, messageContent) => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: conversationId,
          messageType: 'text',
          messageContent: messageContent,
          senderRole: 'chatbot', // Set senderRole to 'chatbot'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add assistant message:', errorData.message || 'Unknown error');
        setSnackbar({ open: true, message: 'Failed to save assistant message', severity: 'error' });
      }
    } catch (error) {
      console.error('Error adding assistant message:', error);
      setSnackbar({ open: true, message: 'Error saving assistant message', severity: 'error' });
    }
  };

  // Function to update conversation title on the backend
  const updateConversationTitle = async (conversationId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update conversation title:', errorData.message || 'Unknown error');
        setSnackbar({ open: true, message: 'Failed to update conversation title', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
      setSnackbar({ open: true, message: 'Error updating conversation title', severity: 'error' });
    }
  };

  // Function to generate a title for the conversation
  const generateTitle = async (userMessage, assistantResponse) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate a very brief (max 4-5 words) title for a chat conversation that starts with this message: "${userMessage}" and includes this response: "${assistantResponse}". The title should capture the main topic or intent. Just return the title itself without any additional text or punctuation.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().slice(0, 30); // Limit to 30 characters for UI
    } catch (error) {
      console.error('Error generating title:', error);
      return userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
    }
  };

  // Function to handle sending a message
  const handleSend = async () => {
    if (!input.trim() || !currentConversationId) return;

    const userMessage = {
      sender_role: 'user', // Use sender_role as 'user'
      message_content: input.trim(),
      timestamp: new Date(),
    };

    // Optimistically update the UI
    const updatedConversations = conversations.map((conv) =>
      conv.id === currentConversationId
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    );
    setConversations(updatedConversations);
    setInput('');
    setLoading(true);
    inputRef.current?.focus();

    try {
      // Send the user message to the server
      const messageResponse = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversationId: currentConversationId,
          messageType: 'text',
          messageContent: userMessage.message_content,
          senderRole: userMessage.sender_role, // Include senderRole
        }),
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      // Get the last 10 messages from the conversation
      const getLastMessages = (conv) => {
        if (!conv || !conv.messages) return [];
        return conv.messages.slice(-10).map(msg => ({
          role: msg.sender_role === 'chatbot' ? 'assistant' : 'user',
          content: msg.message_content
        }));
      };

      // In your handleSend function, modify the FastAPI request
      const queryResponse = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input.trim(),
          top_k: 30,
          memory: getLastMessages(currentConversation)
        }),
      });

      if (!queryResponse.ok) {
        throw new Error('Failed to get response from AI');
      }

      const apiResponse = await queryResponse.json();

      setRetrievedDocuments(apiResponse.retrieved_documents || []);

      const assistantMessage = {
        sender_role: 'chatbot',
        message_content: apiResponse.answer,  // Using apiResponse.answer instead of aiText
        timestamp: new Date(),
        liked: false,
        disliked: false,
      };

      // **Corrected Part: Use updatedConversations to include userMessage**
      const finalConversations = updatedConversations.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      );

      setConversations(finalConversations);

      // Persist the assistant message to the backend
      await addAssistantMessage(currentConversationId, assistantMessage.message_content);

const currentConv = finalConversations.find((conv) => conv.id === currentConversationId);
if (currentConv.title === 'New Chat') {
  try {
    const generatedTitle = await generateTitle(userMessage.message_content, assistantMessage.message_content);
    // Update the title on the server
    await updateConversationTitle(currentConversationId, generatedTitle);
    
    // Update the title in the local state immediately
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, title: generatedTitle }
          : conv
      )
    );
  } catch (titleError) {
    console.error('Error generating/updating title:', titleError);
    // Continue with the conversation even if title update fails
  }
}
    
} catch (error) {
  console.error('Error:', error);
  setSnackbar({ open: true, message: error.message, severity: 'error' });

      // Optionally, revert the optimistic UI update
      const revertedConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: conv.messages.filter((msg) => msg !== userMessage) }
          : conv
      );
      setConversations(revertedConversations);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle pressing Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to delete a conversation
  const deleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedConversations = conversations.filter((conv) => conv.id !== chatId);
        setConversations(updatedConversations);
        if (chatId === currentConversationId && updatedConversations.length > 0) {
          setCurrentConversationId(updatedConversations[0].id);
          await fetchMessages(updatedConversations[0].id);
        } else if (updatedConversations.length === 0) {
          setCurrentConversationId(null);
        }
        setSnackbar({ open: true, message: 'Conversation deleted', severity: 'info' });
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.message || 'Failed to delete conversation', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setSnackbar({ open: true, message: 'Error deleting conversation', severity: 'error' });
    }
  };

  // Get the current conversation
  const currentConversation =
    conversations.find((conv) => conv.id === currentConversationId) || {
      messages: [],
      title: 'No Conversations',
    };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          boxShadow: 1,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="error"
            onClick={() => setDrawerOpen(!drawerOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box component="img" src="/adhebi.png" alt="Logo" sx={{ height: 60, mr: 2 }} />
          <Typography variant="h6" color="red" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            LegallyTN
          </Typography>
          {user && (
            <>
              <Button
                color="error"
                startIcon={<AccountCircle />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ mr: 2 }}
              >
                {user.firstName} {user.lastName}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
          <Tooltip title="Clear chat">
            <IconButton onClick={clearCurrentChat} color="error">
              <DeleteOutline />
            </IconButton>
          </Tooltip>
          {/* Add the new documents toggle button here */}
          <Tooltip title="Toggle Documents">
            <IconButton 
              color="error" 
              onClick={() => setDocumentsOpen(!documentsOpen)}
            >
              <ArticleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Home">
            <IconButton color="error" onClick={() => navigate('/')}>
              <Home />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Left Drawer for Chat History */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#f8f9fa',
            borderRight: '1px solid #e0e0e0',
            paddingTop: '10px',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            onClick={createNewChat}
            sx={{ mb: 2 }}
          >
            New Chat
          </Button>
          <List>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={conv.id === currentConversationId}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  fetchMessages(conv.id);
                }}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'grey.100',
                    '&:hover': {
                      backgroundColor: 'grey.300',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <SmartToy color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={conv.title || 'Untitled Conversation'}
                  secondary={conv.created_at
                    ? new Date(conv.created_at).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : 'No Date'}
                />
                {conversations.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(conv.id);
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Right Drawer for JSON Files */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={jsonDrawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#f1f1f1',
            borderLeft: '1px solid #e0e0e0',
            paddingTop: '0px',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" color="black" gutterBottom>
            Retrieved JSON Data
          </Typography>
          <Paper
            elevation={2}
            sx={{ p: 2, backgroundColor: '#fff', borderRadius: 1 }}
          >
            <pre
              style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
            >
              {retrievedJson
                ? JSON.stringify(retrievedJson, null, 2)
                : 'No JSON data available'}
            </pre>
          </Paper>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Home />}
            onClick={() => {
              setJsonDrawerOpen(false);
            }}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
           component="main"
           sx={{
             flexGrow: 1,
             display: 'flex',
             flexDirection: 'column',
             height: '100vh',
             padding: '80px 0px 0px 0px',
             marginRight: documentsOpen ? '200px' : 0,
             marginLeft: '-350px',
             width: '100%',  
             transition: 'margin 0.2s ease',
             overflow: 'hidden',
           }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
          }}
        >
          {currentConversation.messages && currentConversation.messages.length > 0 ? (
            currentConversation.messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignSelf: message.sender_role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: 1,
                }}
              >
                {message.sender_role === 'chatbot' && (
                  <Avatar sx={{ bgcolor: 'red' }}>
                    <SmartToy />
                  </Avatar>
                )}
                <Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor:
                        message.sender_role === 'user' ? 'grey.200' : 'grey.300',
                      borderRadius: 2,
                    }}
                  >
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {renderMessageContent(message.message_content)}
                    </Typography>
                  </Paper>
                </Box>
                {message.sender_role === 'user' && (
                  <Avatar sx={{ bgcolor: 'blue' }}>
                    <Person />
                  </Avatar>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">
              No messages yet. Start the conversation!
            </Typography>
          )}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress color="primary" size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your legal question here..."
            variant="outlined"
            disabled={loading}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  color="primary"
                >
                  <SendIcon />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            inputRef={inputRef}
          />
        </Box>
      </Box>
      {/* Add the DocumentsDrawer here, before the Snackbar */}
      <DocumentsDrawer 
        open={documentsOpen}
        onClose={() => setDocumentsOpen(false)}
        documents={retrievedDocuments}
      />
      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatbotUI;
