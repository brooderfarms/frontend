import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Event as EventIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * GuestOrderHistory
 * Allows guests to view their orders without authentication
 * using email and confirmation code
 */
const GuestOrderHistory = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearchOrders = async () => {
    // Validation
    if (!email || !confirmationCode) {
      setError('Email and confirmation code are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/guest/orders?email=${encodeURIComponent(email)}&code=${encodeURIComponent(confirmationCode)}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No orders found');
      }

      const data = await response.json();
      setOrders(data.data?.orders || []);
      setSearched(true);
      
      if (data.data?.orders?.length > 0) {
        toast.success(`Found ${data.data.orders.length} order(s)`);
      } else {
        toast.info('No orders found for this email');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error(err.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmail('');
    setConfirmationCode('');
    setOrders([]);
    setError('');
    setSearched(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Track Your Orders
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Enter your email and confirmation code to view your guest orders
        </Typography>
      </Box>

      {/* Search Section */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirmation Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Enter your confirmation code"
              disabled={loading}
              InputProps={{
                startAdornment: <CodeIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            onClick={handleSearchOrders}
            disabled={loading || !email || !confirmationCode}
          >
            {loading ? 'Searching...' : 'Search Orders'}
          </Button>
          <Button variant="outlined" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        </Box>
      </Card>

      {/* Orders List */}
      {searched && (
        <>
          {orders.length === 0 ? (
            <Alert severity="info">
              No orders found for the provided email and confirmation code.
            </Alert>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
              </Typography>

              {orders.map((order, idx) => (
                <Card key={idx} sx={{ mb: 2 }}>
                  <CardContent>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {order.event_name || 'Event'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Order ID: {order.id}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status?.toUpperCase() || 'COMPLETED'}
                        color={order.status === 'completed' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Order Details */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Order Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(order.created_at)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Total Amount
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Tickets
                        </Typography>
                        <Typography variant="body2">
                          {order.ticket_count || 0} ticket{order.ticket_count !== 1 ? 's' : ''}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Payment Status
                        </Typography>
                        <Typography variant="body2">
                          {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'Completed'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Event Details */}
                    {order.event_date && (
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <EventIcon fontSize="small" />
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Event Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(order.event_date)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Info Box */}
      {!searched && (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Need help?</strong> Check your email confirmation message for your confirmation code.
            You can access your orders anytime using your email and code.
          </Typography>
        </Alert>
      )}
    </Container>
  );
};

export default GuestOrderHistory;
