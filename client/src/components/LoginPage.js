import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  Container,
  Divider,
  Link
} from '@mui/material';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
      } else {
        const { message } = await response.json();
        setError(message || 'Invalid email or password!');
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
                  مرحبا بكم
                </Typography>
                <Typography variant="h5">
                  Legal Assistant Login
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  variant="outlined"
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Remember me"
                  />
                  <Link
                    component="button"
                    variant="body2"
                    color="error"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Sign In
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  color="error"
                  onClick={() => navigate('/register')}
                >
                  Register here
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

export default LoginPage;