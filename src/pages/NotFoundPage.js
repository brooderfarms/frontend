import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search } from '@mui/icons-material';

const NotFoundPage = () => {
  const { isAuthenticated, user } = useAuth();
  const homeTarget = isAuthenticated() ? (
    user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : user?.role === 'venue_manager' ? '/venue-manager' : user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard'
  ) : '/';
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '8rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Page Not Found
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to={homeTarget}
              startIcon={<Home />}
              sx={{ px: 4, py: 1.5 }}
            >
              Go Home
            </Button>

            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/events"
              startIcon={<Search />}
              sx={{ px: 4, py: 1.5 }}
            >
              Browse Events
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
