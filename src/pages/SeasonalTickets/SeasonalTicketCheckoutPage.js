import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  stepper,
} from '@mui/material';
import { ArrowBack, CheckCircle, LocalOffer } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SeasonalTicketCheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, user, isAuthenticated } = useAuth();
  const [seasonalTicket, setSeasonalTicket] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to purchase');
      navigate('/login', { state: { from: { pathname: `/seasonal-tickets/${id}/purchase` } } });
      return;
    }
    fetchSeasonalTicket();
  }, [id, isAuthenticated]);

  const fetchSeasonalTicket = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/${id}`);
      if (!response.ok) throw new Error('Season pass not found');

      const data = await response.json();
      setSeasonalTicket(data.data);
      setEvents(data.data.events || []);
    } catch (err) {
      console.error('Fetch seasonal ticket error:', err);
      setError('Failed to load season pass details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      setError('');

      // In a real scenario, this would integrate with payment gateway
      // For now, we'll create the purchase directly
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: null, // Would be set after payment processing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase season pass');
      }

      toast.success('Season pass purchased successfully!');
      setPurchaseSuccess(true);
      
      // Wait 3 seconds then redirect to tickets
      setTimeout(() => {
        navigate('/tickets', { state: { purchased: true, passId: id } });
      }, 3000);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to complete purchase');
      toast.error(err.message || 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading season pass details...
        </Typography>
      </Container>
    );
  }

  if (!seasonalTicket) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Season pass not found</Alert>
      </Container>
    );
  }

  // Show success screen after purchase
  if (purchaseSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 60, color: 'success.main' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Purchase Successful! 🎉
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your season pass has been purchased successfully
          </Typography>

          <Card sx={{ bgcolor: 'grey.50', p: 3, mb: 4 }}>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Season Pass
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {seasonalTicket.name}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Price
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                ${seasonalTicket.season_price}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Purchased by
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Card>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your season pass has been added to your account. You can view and manage your passes on your dashboard.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/tickets')}
            sx={{ mb: 2 }}
          >
            View My Season Passes
          </Button>

          <Typography variant="caption" color="text.secondary" display="block">
            Redirecting to your passes in a moment...
          </Typography>
        </Box>
      </Container>
    );
  }

  const discountAmount = ((seasonalTicket.base_price - seasonalTicket.season_price) / seasonalTicket.base_price * 100).toFixed(0);
  const totalSavings = seasonalTicket.base_price - seasonalTicket.season_price;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/seasonal-tickets')}
          variant="text"
        >
          Back to Season Passes
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Side - Season Pass Details */}
        <Grid item xs={12} md={7}>
          <Card>
            {seasonalTicket.image_url && (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  backgroundImage: `url(${seasonalTicket.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {seasonalTicket.name}
                </Typography>
                {discountAmount > 0 && (
                  <Chip
                    label={`Save ${discountAmount}%`}
                    color="success"
                    icon={<LocalOffer />}
                  />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {seasonalTicket.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Included Events */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                🎭 {seasonalTicket.total_events} Events Included
              </Typography>

              {events.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  {events.map((event, index) => (
                    <Box
                      key={event.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <CheckCircle sx={{ color: 'success.main', mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.start_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No events currently added to this season pass
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Season Details */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Season
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {seasonalTicket.season_type.replace('-', ' ').toUpperCase()} {seasonalTicket.season_year}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Available Passes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {seasonalTicket.available_quantity - seasonalTicket.sold_quantity} left
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Purchase Summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Order Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary">Regular Price</Typography>
                  <Typography>${seasonalTicket.base_price}</Typography>
                </Box>

                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">Discount ({discountAmount}%)</Typography>
                    <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      -${totalSavings.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>Season Pass Price</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${seasonalTicket.season_price}
                  </Typography>
                </Box>

                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      You Save
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 'bold', color: 'success.main' }}
                    >
                      ${totalSavings.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Customer Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Purchasing as
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              {/* Purchase Button */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handlePurchase}
                disabled={purchasing || seasonalTicket.sold_quantity >= seasonalTicket.available_quantity}
                sx={{ mb: 2 }}
              >
                {purchasing ? 'Processing...' : 'Complete Purchase'}
              </Button>

              {seasonalTicket.sold_quantity >= seasonalTicket.available_quantity && (
                <Alert severity="warning">
                  This season pass is sold out
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                By completing this purchase, you agree to our Terms of Service
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SeasonalTicketCheckoutPage;
