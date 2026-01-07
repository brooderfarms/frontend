import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';

/**
 * GuestRegistrationModal
 * Allows guests to convert their order to an authenticated account
 * after completing checkout
 */
const GuestRegistrationModal = ({
  open,
  guestEmail,
  confirmationCode,
  onClose,
  onSuccess,
  apiRequest,
  API_BASE_URL,
}) => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Validation
    if (!password || !passwordConfirm) {
      setError('Both password fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`${API_BASE_URL}/guest/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail,
          confirmation_code: confirmationCode,
          password,
          password_confirm: passwordConfirm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const data = await response.json();
      toast.success('Account created successfully! You can now log in.');
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Close modal after success
      handleClose();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account');
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setPasswordConfirm('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Your Account</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Your order has been completed! Create an account to track your tickets and
            manage future purchases.
          </Typography>

          <TextField
            label="Email"
            value={guestEmail}
            disabled
            fullWidth
            variant="outlined"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={loading}
          />

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          <Typography variant="caption" color="textSecondary">
            Password must be at least 6 characters long.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Skip for Now
        </Button>
        <Button
          onClick={handleRegister}
          variant="contained"
          disabled={loading || !password || !passwordConfirm}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestRegistrationModal;
