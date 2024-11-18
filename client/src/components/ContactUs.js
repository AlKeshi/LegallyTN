import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Fade,
} from '@mui/material';
import emailjs from 'emailjs-com';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use EmailJS to send an email (you need to set up EmailJS and replace 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', and 'YOUR_USER_ID')
    emailjs.send('service_2kpeiro', 'template_tjpezfi', formData, 'ha4lMvUyccRpEZz6n')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setSubmitted(true);
      })
      .catch((err) => {
        console.error('FAILED...', err);
      });
  };

  return (
    <Box className="contact-section" sx={{ backgroundColor: '#f8f8f8', py: 8 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          Contact Us
        </Typography>
        <Fade in={!submitted} timeout={600}>
          <Box
            component="form"
            sx={{ display: submitted ? 'none' : 'flex', flexDirection: 'column', gap: 3 }}
            onSubmit={handleSubmit}
          >
            <TextField
              label="Name"
              name="name"
              variant="outlined"
              fullWidth
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              required
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              label="Message"
              name="message"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              required
              value={formData.message}
              onChange={handleInputChange}
            />
            <Button
              variant="contained"
              color="error"
              size="large"
              sx={{ alignSelf: 'center' }}
              type="submit"
            >
              Send Message
            </Button>
          </Box>
        </Fade>
        <Fade in={submitted} timeout={600}>
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'green' }}>
            Sent! Thanks for your question.
          </Typography>
        </Fade>
      </Container>
    </Box>
  );
};

export default ContactUs;
