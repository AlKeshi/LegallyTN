import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';

import { AccountCircle, ExitToApp } from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import {
  AppBar,
  Box,
  Button,
  Container,
  Typography,
  Toolbar,
  Card,
  CardContent,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Balance,
  Gavel,
  MenuBook,
  Public,
  Menu as MenuIcon,
  AccessTime,
  Security,
  Support,
} from '@mui/icons-material';
import ChatbotUI from './components/ChatbotUI';


const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const features = [
    {
      icon: <Gavel sx={{ fontSize: 40, color: '#e53935' }} />,
      title: 'Expert Legal Guidance',
      description: 'Access to professional legal advice and consultation services',
    },
    {
      icon: <MenuBook sx={{ fontSize: 40, color: '#e53935' }} />,
      title: 'Legal Resources',
      description: 'Comprehensive database of Tunisian laws and regulations',
    },
    {
      icon: <AccessTime sx={{ fontSize: 40, color: '#e53935' }} />,
      title: '24/7 Availability',
      description: 'Round-the-clock access to legal information and support',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#e53935' }} />,
      title: 'Secure & Confidential',
      description: 'Your information is protected with advanced security measures',
    },
  ];
  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/status', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
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
  return (
    <Box>
      <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: 2 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="error"
              onClick={() => setMobileMenu(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box
              component="img"
              src="/adhebi.png"
              alt="Tunisian Flag"
              sx={{ height: 100, mr: 2 }}
            />
            <Typography variant="h6" color="error" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              محامي الذكاء الاصطناعي
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {user ? (
                <>
                  <Button
                    color="error"
                    startIcon={<AccountCircle />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
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
              ) : (
                <>
                  <Button color="error" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Update mobile menu to include user info */}
      <Drawer
        anchor="left"
        open={mobileMenu}
        onClose={() => setMobileMenu(false)}
      >
        <List sx={{ width: 250 }}>
          {user ? (
            <>
              <ListItem>
                <ListItemText 
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={user.email}
                />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => { navigate('/login'); setMobileMenu(false); }}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button onClick={() => { navigate('/register'); setMobileMenu(false); }}>
                <ListItemText primary="Sign Up" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(to bottom right, #ef4444, #b91c1c)',
          minHeight: '100vh',
          pt: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        <Container maxWidth="lg">
          {/* Main Content */}
          <Grid container spacing={4} sx={{ pt: 8 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ color: 'white', mt: 8 }}>
                <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Mar7aba {user ? `${user.firstName}` : ''}
                </Typography>
                <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#ffd700' }}>
                  مستشارك القانوني الذكي
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }}>
                  Access expert legal guidance powered by artificial intelligence.
                  Available 24/7 to help you understand and navigate Tunisian law.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: 'white',
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: '#fafafa',
                      },
                    }}
                    // Replace the existing onClick handler for the "Get Started" button with this:
                    onClick={() => user ? navigate('/chat') : navigate('/login')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => navigate('/login')}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {/* Replace with your actual logo/illustration */}
                <Balance sx={{ fontSize: 300, color: 'white', opacity: 0.9 }} />
              </Box>
            </Grid>
          </Grid>

          {/* Features Section */}
          <Grid container spacing={4} sx={{ mt: 4, mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#ef4444' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/chat" element={<ChatbotUI />} />
      </Routes>
    </Router>
  );
};

export default App;