import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  AppBar,
  Toolbar,
  Chip,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Divider,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy,
  Person,
  DeleteOutline,
  ContentCopy,
  RestartAlt,
  ChatBubbleOutline,
  Add as AddIcon,
  Menu as MenuIcon,
  ExitToApp,
  AccountCircle,
  Home
} from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { useNavigate } from 'react-router-dom';
const genAI = new GoogleGenerativeAI("AIzaSyBYANsp9wOZYg9zq-B0h0ZEN_pInj1n2sk");

const DRAWER_WIDTH = 280;

const ChatbotUI = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([
    {
      id: 'default',
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: 'Mar7ba! I am your AI legal assistant. How can I help you today?',
          timestamp: new Date(),
          lied: false,
          disliked: false
        }
      ]
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || conversations[0];
  const generateTitle = async (userMessage) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate a very brief (max 4-5 words) title for a chat conversation that starts with this message: "${userMessage}". The title should capture the main topic or intent. Just return the title itself without any additional text or punctuation.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().slice(0, 30); // Limit to 30 characters for UI
    } catch (error) {
      console.error('Error generating title:', error);
      return userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setAnchorEl(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: 'Mar7ba! I am your AI legal assistant. How can I help you today?',
          timestamp: new Date(),
          liked: false,
          disliked: false
        }
      ]
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
  };
  const inputRef = useRef(null);
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Update conversation title with first user message if it's "New Chat"
    if (currentConversation.title === 'New Chat') {
      const generatedTitle = await generateTitle(input.trim());
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, title: generatedTitle }
          : conv
      );
      setConversations(updatedConversations);
    }

    // Add user message to current conversation
    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? { ...conv, messages: [...conv.messages, userMessage] }
        : conv
    );
    setConversations(updatedConversations);
    setInput('');
    setLoading(true);
    inputRef.current?.focus();
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `${input.trim()}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        liked: false,
        disliked: false
      };

      const finalConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, userMessage, assistantMessage] }
          : conv
      );
      setConversations(finalConversations);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      const errorConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      );
      setConversations(errorConversations);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearCurrentChat = () => {
    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? {
          ...conv,
          messages: [{
            role: 'assistant',
            content: 'Mar7ba! I am your AI legal assistant. How can I help you today?',
            timestamp: new Date(),
            liked: false,
            disliked: false
          }],
          title: 'New Chat'
        }
        : conv
    );
    setConversations(updatedConversations);
  };

  const deleteChat = (chatId) => {
    const updatedConversations = conversations.filter(conv => conv.id !== chatId);
    if (chatId === currentConversationId) {
      setCurrentConversationId(updatedConversations[0]?.id || 'default');
    }
    setConversations(updatedConversations);
  };

  const renderMessageContent = (content) => {
    const segments = content.split(/(```[\s\S]*?```)/g);

    return segments.map((segment, index) => {
      if (segment.startsWith('```') && segment.endsWith('```')) {
        return (
          <Box key={index} sx={{ position: 'relative', my: 2 }}>
            <Paper sx={{
              backgroundColor: '#1e1e1e',
              color: '#fff',
              p: 2,
              borderRadius: 1
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {segment.slice(3, -3)}
              </pre>
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

  const formatTimestamp = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (

    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Appbar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          boxShadow: 2,
          zIndex: (theme) => theme.zIndex.drawer + 1  // Make AppBar appear above drawer
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
          <Box
            component="img"
            src="/adhebi.png"
            alt="Logo"
            sx={{ height: 60, mr: 2 }}
          />
          <Typography variant="h6" color="error" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            محامي الذكاء الاصطناعي
          </Typography>
          {/* User section */}
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
          <Tooltip title="Home">
            <IconButton color="primary" onClick={() => navigate('/')}>
              <Home />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {/* Sidebar */}
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
            paddingTop: '80px'
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
                onClick={() => setCurrentConversationId(conv.id)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: '#fee2e2',
                    '&:hover': {
                      backgroundColor: '#fecaca',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <ChatBubbleOutline color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={conv.title}
                  secondary={formatTimestamp(conv.messages[conv.messages.length - 1].timestamp)}
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          marginLeft: drawerOpen ? `${DRAWER_WIDTH}px` : 0,
          transition: theme => theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />

        <Box sx={{
          flexGrow: 1,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          {currentConversation.messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#ef4444' }}>
                  <SmartToy />
                </Avatar>
              )}
              <Box>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#ef4444' : 'white',
                    color: message.role === 'user' ? 'white' : 'inherit',
                    borderRadius: 2
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {renderMessageContent(message.content)}
                  </Typography>
                </Paper>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.5,
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                  {message.role === 'assistant' && (
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress color="error" size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
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
                  color="error"
                >
                  <SendIcon />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#ef4444',
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatbotUI;