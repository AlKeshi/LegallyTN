import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ContactUs from './components/ContactUs';
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
  TextField,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Balance,
  Gavel,
  MenuBook,
  AccessTime,
  Security,
  Menu as MenuIcon,
  ExpandMore,
} from '@mui/icons-material';
import ChatbotUI from './components/ChatbotUI';
import './App.css'; // Import the CSS file for animations
import LoadingPage from './LoadingPage';
// Additional CSS for beautification
import AboutPage from './components/AboutPage';
import { ArticlesSection, TeamSection } from './components/EnhancedSections';
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

  const testimonials = [
    {
      name: "Amal A.",
      quote: "LegallyTN helped me understand my rights so easily. Highly recommend!",
    },
    {
      name: "Yassine K.",
      quote: "Great service with 24/7 availability. It provided me with timely legal support!",
    },
    {
      name: "Fatma H.",
      quote: "I loved the experience! Everything was clear, and I got the help I needed instantly.",
    },
  ];

  const articles = [
    {
      title: "5 Things You Should Know About Tunisian Labor Law",
      snippet: "A quick summary of the top five things every employee should know about labor laws in Tunisia...",
      link: "/articles/labor-law",
    },
    {
      title: "Understanding Your Rights as a Whistleblower in Tunisia",
      snippet: "The Tunisian government has specific provisions to protect whistleblowers. Learn what these are...",
      link: "/articles/whistleblower-rights",
    },
    {
      title: "Navigating Divorce in Tunisia: What You Need to Know",
      snippet: "Divorce can be complex, but Tunisian law ensures both parties are protected. Here are some key insights...",
      link: "/articles/divorce-in-tunisia",
    },
  ];

  const teamMembers = [
    {
      name: "Oussema Jebali",
      role: "Lead Developer",
      description: "Oussema is the visionary lead developer behind LegallyTN.",
    },
    {
      name: "Salem Fradi",
      role: "UI/UX Designer",
      description: "Salem designs user-friendly experiences for every user of our platform.",
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
              LegallyTN
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
        className="animated-background-deep"
        sx={{
          minHeight: '100vh',
          pt: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <Box
          className="decorative-circle"
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
          className="decorative-circle"
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
              <Box className="hero-text" sx={{ color: 'white', mt: 8 }}>
                <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Mar7aba {user ? `${user.firstName}` : ''}
                </Typography>
                <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', color: '#fff8dc' }}>
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
                    className="hero-button"
                    sx={{
                      backgroundColor: 'white',
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: '#fafafa',
                      },
                    }}
                    onClick={() => user ? navigate('/chat') : navigate('/login')}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    className="hero-button-outline"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => navigate('/about')}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                className="hero-illustration"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Balance sx={{ fontSize: 300, color: 'white', opacity: 0.9 }} />
              </Box>
            </Grid>
          </Grid>

          {/* Features Section */}
          <Grid container spacing={4} sx={{ mt: 4, mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className="feature-card"
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

          {/* Testimonials Section */}
          <Box className="testimonials-section" sx={{ backgroundColor: '#f8f8f8', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
              Testimonials
            </Typography>
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ p: 3, boxShadow: 3 }}>
                      <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                        "{testimonial.quote}"
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                        - {testimonial.name}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Articles Section */}
          <ArticlesSection />

          {/* Team Section */}
          <TeamSection />


        </Container>
      </Box>
      {/* Contact Form Section */}
      <ContactUs />
      {/* Footer Section */}
      <Box
        className="footer-section"
        sx={{
          backgroundColor: 'black',
          color: 'white',
          py: 4,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                About Us
              </Typography>
              <Typography variant="body2">
                LegallyTN is committed to providing accessible and reliable legal guidance, leveraging AI technology to support the community.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Typography variant="body2" className="footer-link"><Button onClick={() => navigate('/login')}>Login</Button></Typography>
              <Typography variant="body2" className="footer-link"><Button onClick={() => navigate('/register')}>Sign Up</Button></Typography>
              <Typography variant="body2" className="footer-link"><Button onClick={() => navigate('/about')}> Learn More</Button></Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Us
              </Typography>
              <Typography variant="body2">
                Email: salemaziz.fradi@supcom.tn
              </Typography>
              <Typography variant="body2">
                Email: oussema.jebali@supcom.tn
              </Typography>
              <Typography variant="body2">
                Phone: +216 99 144 778
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
            &copy; 2024 LegallyTN. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Live Chat Button */}
      <IconButton
        className="live-chat-button"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: 'grey',
          color: 'white',
          '&:hover': { backgroundColor: '#d32f2f' },
        }}
        onClick={() => navigate('/chat')}
      >
        <AccountCircle />
      </IconButton>
    </Box>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay, e.g., 2 seconds.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingPage />;
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/chat" element={<ChatbotUI />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>

  );
};

export default App;
