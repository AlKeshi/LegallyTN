import React, { useState } from 'react';
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
} from '@mui/material';
import { Send as SendIcon, SmartToy, Person } from '@mui/icons-material';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBYANsp9wOZYg9zq-B0h0ZEN_pInj1n2sk"); // Replace with your API key

const ChatbotUI = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Mar7ba! I am your AI legal assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get response from Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Add context about being a Tunisian legal assistant
      const prompt = `You are a Tunisian legal assistant. Please help with the following question: ${input.trim()}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const assistantMessage = {
        role: 'assistant',
        content: text
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 2 }}>
        <Toolbar>
          <Box
            component="img"
            src="/adhebi.png"
            alt="Logo"
            sx={{ height: 60, mr: 2 }}
          />
          <Typography variant="h6" color="error" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            محامي الذكاء الاصطناعي
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 3 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(100vh - 160px)',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {messages.map((message, index) => (
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
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.role === 'user' ? '#ef4444' : 'white',
                    color: message.role === 'user' ? 'white' : 'inherit',
                    borderRadius: 2,
                    '& pre': {
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflow: 'auto',
                      maxHeight: '300px',
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      margin: '8px 0'
                    }
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{message.content}</Typography>
                </Paper>
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
          </Box>

          <Box sx={{ p: 2, backgroundColor: 'white' }}>
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
        </Paper>
      </Container>
    </Box>
  );
};

export default ChatbotUI;