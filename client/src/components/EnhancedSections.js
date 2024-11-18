import React, { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, 
  Button, IconButton, Avatar, Chip, Grow, Zoom, CardActionArea,
  CardActions, Divider
} from '@mui/material';
import { 
  ArrowForward, LinkedIn, GitHub, Mail,
  AccessTime, BookmarkBorder, Share,
  Person
} from '@mui/icons-material';

// Enhanced Articles Section
const ArticlesSection = () => {
  const articles = [
    {
      title: "5 Things You Should Know About Tunisian Labor Law",
      snippet: "A quick summary of the top five things every employee should know about labor laws in Tunisia...",
      link: "/articles/labor-law",
      readTime: "5 min read",
      category: "Labor Law"
    },
    {
      title: "Understanding Your Rights as a Whistleblower in Tunisia",
      snippet: "The Tunisian government has specific provisions to protect whistleblowers. Learn what these are...",
      link: "/articles/whistleblower-rights",
      readTime: "8 min read",
      category: "Rights"
    },
    {
      title: "Navigating Divorce in Tunisia: What You Need to Know",
      snippet: "Divorce can be complex, but Tunisian law ensures both parties are protected. Here are some key insights...",
      link: "/articles/divorce-in-tunisia",
      readTime: "6 min read",
      category: "Family Law"
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ef4444 30%, #ff8c00 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Recent Articles
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Stay updated with the latest legal insights and analysis
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {articles.map((article, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, #ef4444 30%, #ff8c00 90%)',
                        opacity: 0.9
                      }
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        fontWeight: 700,
                        textAlign: 'center',
                        px: 2
                      }}
                    >
                      {article.category}
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip 
                      label={article.category}
                      size="small"
                      sx={{ 
                        mb: 2,
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {article.snippet}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {article.readTime}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button 
                      size="small" 
                      endIcon={<ArrowForward />}
                      sx={{ 
                        color: '#ef4444',
                        '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' }
                      }}
                    >
                      Read More
                    </Button>
                    <Box>
                      <IconButton size="small">
                        <BookmarkBorder />
                      </IconButton>
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Enhanced Team Section
const TeamSection = () => {
  const teamMembers = [
    {
      name: "Oussema Jebali",
      role: "Lead Developer",
      description: "Oussema is the visionary lead developer behind HouyemAI, bringing extensive experience in AI and machine learning to create innovative legal tech solutions.",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "mailto:oussema.jebali@supcom.tn",
      expertise: ["AI Development", "Machine Learning", "Legal Tech"]
    },
    {
      name: "Houyem",
      role: "Legal Expert",
      description: "Houyem provides the crucial legal knowledge that ensures the AI system is up-to-date with the latest Tunisian laws and regulations.",
      linkedin: "https://linkedin.com",
      email: "mailto:contact@houyemai.com",
      expertise: ["Tunisian Law", "Legal Consultation", "AI Training"]
    },
    {
      name: "Salem Fradi",
      role: "UI/UX Designer",
      description: "Salem designs user-friendly experiences that make legal information accessible and engaging for everyone using our platform.",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "mailto:salemaziz.fradi@supcom.tn",
      expertise: ["UI/UX Design", "Frontend Development", "User Research"]
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ef4444 30%, #ff8c00 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Meet Our Team
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            The brilliant minds behind HouyemAI
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={1000 + index * 200}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}>
                  <Box
                    sx={{
                      height: 300,
                      backgroundColor: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, #ef4444 30%, #ff8c00 90%)',
                        opacity: 0.9
                      }
                    }}
                  >
                    <Person sx={{ fontSize: 120, color: 'white', position: 'relative', zIndex: 1 }} />
                  </Box>
                  <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {member.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: '#ef4444',
                        fontWeight: 500,
                        mb: 2 
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {member.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {member.expertise.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{ 
                            mr: 1, 
                            mb: 1,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444'
                          }}
                        />
                      ))}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        href={member.linkedin}
                        sx={{ 
                          color: '#0077b5',
                          '&:hover': { backgroundColor: 'rgba(0, 119, 181, 0.1)' }
                        }}
                      >
                        <LinkedIn />
                      </IconButton>
                      {member.github && (
                        <IconButton 
                          size="small"
                          href={member.github}
                          sx={{ 
                            color: '#333',
                            '&:hover': { backgroundColor: 'rgba(51, 51, 51, 0.1)' }
                          }}
                        >
                          <GitHub />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small"
                        href={member.email}
                        sx={{ 
                          color: '#ef4444',
                          '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                      >
                        <Mail />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export { ArticlesSection, TeamSection };