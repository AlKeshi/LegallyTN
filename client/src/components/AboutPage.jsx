// AboutPage.jsx

import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';

const AboutPage = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          About LegallyTN
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, textAlign: 'center' }}>
          LegallyTN is an advanced legal consulting chatbot designed to provide accessible and reliable guidance on Tunisian law. Our platform is powered by cutting-edge AI technology to offer 24/7 assistance for users in understanding various legal queries. Learn more about how LegallyTN can empower you with the knowledge you need.
        </Typography>
        
        {/* Features Section */}
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-10px)' } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#ef4444' }}>
                  Expert Legal Guidance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access professional legal advice and consultation services for various Tunisian legal matters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {/* Add more feature cards here as needed */}
        </Grid>

        {/* Team Section */}
        <Box className="team-section" sx={{ py: 8 }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
            Meet Our Team
          </Typography>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ p: 3, boxShadow: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Oussema Jebali
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#e53935' }}>
                    Lead Developer
                  </Typography>
                  <Typography variant="body2">
                    Oussema is the visionary lead developer behind LegallyTN.
                  </Typography>
                </Card>
              </Grid>
              {/* Add more team members here as needed */}
            </Grid>
          </Container>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
