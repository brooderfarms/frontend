import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Event,
  LocalOffer,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SeasonalTicketsPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, isAuthenticated } = useAuth();
  const [seasonalTickets, setSeasonalTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    season_year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchSeasonalTickets();
  }, [filters]);

  const fetchSeasonalTickets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'published');
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch seasonal tickets');

      const data = await response.json();
      // Handle both array and object responses
      const tickets = Array.isArray(data.data) ? data.data : data.data?.seasonalTickets || [];
      setSeasonalTickets(tickets);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch seasonal tickets error:', err);
      setError('Failed to load seasonal tickets');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (ticketId) => {
    if (!isAuthenticated()) {
      toast.error('Please login to purchase');
      navigate('/login', { state: { from: { pathname: `/seasonal-tickets/${ticketId}/purchase` } } });
      return;
    }

    navigate(`/seasonal-tickets/${ticketId}/purchase`);
  };

  const getSeasonTypeLabel = (type) => {
    const labels = {
      'spring': '🌸 Spring Season',
      'summer': '☀️ Summer Season',
      'fall': '🍂 Fall Season',
      'winter': '❄️ Winter Season',
      'full-year': '🎭 Full Year Pass',
      'custom': 'Custom Season',
    };
    return labels[type] || type;
  };

  const SeasonalTicketCard = ({ ticket }) => {
    const discountAmount = ((ticket.base_price - ticket.season_price) / ticket.base_price * 100).toFixed(0);
    const isSoldOut = ticket.sold_quantity >= ticket.available_quantity;

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: isSoldOut ? 'none' : 'translateY(-8px)',
            boxShadow: isSoldOut ? 1 : 6,
          },
          opacity: isSoldOut ? 0.7 : 1,
        }}
      >
        {ticket.image_url ? (
          <CardMedia
            component="img"
            height="200"
            image={ticket.image_url}
            alt={ticket.name}
          />
        ) : (
          <CardMedia
            component="div"
            sx={{
              height: 200,
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Event sx={{ fontSize: 80, color: 'white', opacity: 0.7 }} />
          </CardMedia>
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={getSeasonTypeLabel(ticket.season_type)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${ticket.season_year}`}
              size="small"
              color="primary"
            />
            {!isSoldOut && discountAmount > 0 && (
              <Chip
                label={`Save ${discountAmount}%`}
                size="small"
                color="success"
                icon={<LocalOffer />}
              />
            )}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            {ticket.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {ticket.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {ticket.total_events} Events Included
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {isSoldOut ? 'Sold Out' : `${ticket.available_quantity - ticket.sold_quantity} passes left`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ${ticket.season_price}
            </Typography>
            {ticket.discount_percentage > 0 && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.secondary',
                }}
              >
                ${ticket.base_price}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              component={RouterLink}
              to={`/seasonal-tickets/${ticket.id}`}
              fullWidth
            >
              View Details
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => handlePurchase(ticket.id)}
              disabled={isSoldOut}
              fullWidth
            >
              {isSoldOut ? 'Sold Out' : 'Get Pass'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Season Passes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get unlimited access to events with our exclusive season passes
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Season Year"
          value={filters.season_year}
          onChange={(e) => setFilters({ ...filters, season_year: e.target.value, page: 1 })}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value={new Date().getFullYear()}>{new Date().getFullYear()}</MenuItem>
          <MenuItem value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : seasonalTickets && seasonalTickets.length === 0 ? (
        <Alert severity="info">No season passes available</Alert>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {seasonalTickets.map((ticket) => (
              <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                <SeasonalTicketCard ticket={ticket} />
              </Grid>
            ))}
          </Grid>

          {pagination && pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(e, page) => setFilters({ ...filters, page })}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SeasonalTicketsPage;
