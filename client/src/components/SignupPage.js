import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Container,
  Divider,
  Link,
  FormControlLabel,
  Checkbox,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SignupPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userType: '',
    barNumber: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
  };

  // In SignupPage.js - Update the handleSubmit function
const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms and Conditions');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          userType: formData.userType,
          barNumber: formData.barNumber,
        }),
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        // Navigate to home page after successful registration and auto-login
        navigate('/');
      } else {
        const { message } = await response.json();
        setError(message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #ef4444, #b91c1c)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -80,
              right: -80,
              width: 256,
              height: 256,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 200, 200, 0.2)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -160,
              left: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 200, 200, 0.2)',
            }
          }}
        >
          <CardHeader
            title={
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error" gutterBottom>
                  التسجيل
                </Typography>
                <Typography variant="h5">
                  Create Your Account
                </Typography>
                <Divider sx={{ width: 64, margin: '16px auto', backgroundColor: '#ef4444' }} />
              </Box>
            }
          />

          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  select
                  label="User Type"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                  variant="outlined"
                >
                  <MenuItem value="lawyer">Lawyer</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="student">Law Student</MenuItem>
                </TextField>

                {formData.userType === 'lawyer' && (
                  <TextField
                    fullWidth
                    label="Bar Number"
                    name="barNumber"
                    value={formData.barNumber}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                )}

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" color="error">
                        Terms and Conditions
                      </Link>
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create Account
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  color="error"
                  onClick={() => navigate('/login')}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="white" align="center" sx={{ mt: 4 }}>
          © 2024 Tunisian Legal Assistant. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default SignupPage;