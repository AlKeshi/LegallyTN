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


const genAI = new GoogleGenerativeAI('AIzaSyBYANsp9wOZYg9zq-B0h0ZEN_pInj1n2sk');

const DRAWER_WIDTH = 280;

const ChatbotUI = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [conversations, setConversations] = useState([
    {
      id: 'default',
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content:
            'Mar7ba! I am your AI legal assistant. How can I help you today?',
          timestamp: new Date(),
          liked: false,
          disliked: false,
        },
      ],
    },
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievedJson, setRetrievedJson] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [jsonDrawerOpen, setJsonDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const currentConversation =
    conversations.find((conv) => conv.id === currentConversationId) ||
    conversations[0];

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include',
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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation.messages]);

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
          content:
            'Mar7ba! I am your AI legal assistant. How can I help you today?',
          timestamp: new Date(),
          liked: false,
          disliked: false,
        },
      ],
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setJsonDrawerOpen(false);
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
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  const generateTitle = async (userMessage, assistantResponse) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate a very brief (max 4-5 words) title for a chat conversation that starts with this message: "${userMessage}" and includes this response: "${assistantResponse}". The title should capture the main topic or intent. Just return the title itself without any additional text or punctuation.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().slice(0, 30); // Limit to 30 characters for UI
    } catch (error) {
      console.error('Error generating title:', error);
      return (
        userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '')
      );
    }
  };

  const inputRef = useRef(null);
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message to current conversation
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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `${input.trim()}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract metadata from the response
      const metadata = {
        prompt_feedback: response.prompt_feedback,
        candidates: response.candidates,
        // Add other relevant fields as needed
      };
      setRetrievedJson(metadata);
      setJsonDrawerOpen(true);
      setDrawerOpen(false);

      const assistantMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        liked: false,
        disliked: false,
      };

      const finalConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? {
            ...conv,
            messages: [...conv.messages, userMessage, assistantMessage],
          }
          : conv
      );

      setConversations(finalConversations);

      // Generate a title for the conversation if it's "New Chat"
      if (currentConversation.title === 'New Chat') {
        const generatedTitle = await generateTitle(
          userMessage.content,
          assistantMessage.content
        );
        const updatedConversationsWithTitle = finalConversations.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, title: generatedTitle }
            : conv
        );
        setConversations(updatedConversationsWithTitle);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      const errorConversations = conversations.map((conv) =>
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

  const deleteChat = (chatId) => {
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== chatId
    );
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
          <Box
            component="img"
            src="/adhebi.png"
            alt="Logo"
            sx={{ height: 60, mr: 2 }}
          />
          <Typography
            variant="h6"
            color="red"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            HouyemAI
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
            <IconButton onClick={clearCurrentChat} color="red">
              <DeleteOutline />
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
                onClick={() => setCurrentConversationId(conv.id)}
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
                  primary={conv.title}
                  secondary={new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(
                    conv.messages[conv.messages.length - 1].timestamp
                  )}
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
          height: '90vh',
          width: '200vh',
          justifyContent: 'center',
          marginLeft: drawerOpen ? -`30` : -50,
          marginRight: jsonDrawerOpen ? `${DRAWER_WIDTH}px` : 10,
          padding: '20px',
          transition: (theme) =>
            theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflowY: '',
            backgroundColor: '#f8f9fa',
            witdth: '200vh',
          }}
        >
          {currentConversation.messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                alignSelf:
                  message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: 1,
              }}
            >
              {message.role === 'assistant' && (
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
                      message.role === 'user'
                        ? 'grey.200'
                        : 'grey.200',
                    color:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {renderMessageContent(message.content)}
                  </Typography>
                </Paper>
              </Box>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: 'red' }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box
              sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
            >
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
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatbotUI;
