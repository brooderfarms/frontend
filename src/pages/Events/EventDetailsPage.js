import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  Divider,
  Avatar,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  ShoppingCart,
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestCart } from '../../context/GuestCartContext';
import toast from 'react-hot-toast';
import SeatMapComponent from '../../components/VenueManager/SeatMapComponent';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, isAuthenticated, user } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { createGuestCart, addToGuestCart, getGuestCart, guestCartId } = useGuestCart();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seasonalTickets, setSeasonalTickets] = useState([]);
  const [loadingSeasonalTickets, setLoadingSeasonalTickets] = useState(false);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    ticket_type: 'standard',
    ticket_format: 'digital',
    quantity: 1,
    selected_seats: [],
  });

  // Define fetch functions BEFORE useEffects
  const fetchPricingTiers = async () => {
    try {
      const response = await Promise.race([
        apiRequest(`${API_BASE_URL}/seats/event/${id}/pricing`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      const data = await response.json();
      
      if (response.ok && data.data?.pricingTiers && data.data.pricingTiers.length > 0) {
        setPricingTiers(data.data.pricingTiers);
      } else {
        console.log('No pricing tiers from API, using fallback default tiers');
        setPricingTiers([
          { id: '1', name: 'Standard', color: '#2196F3', price: 25, seats: 100, section: 'General' },
          { id: '2', name: 'Premium', color: '#FFD700', price: 50, seats: 50, section: 'Premium' },
          { id: '3', name: 'VIP', color: '#FF1493', price: 100, seats: 20, section: 'VIP' },
        ]);
      }
    } catch (err) {
      console.log('Pricing tiers unavailable, using fallback');
      setPricingTiers([
        { id: '1', name: 'Standard', color: '#2196F3', price: 25, seats: 100, section: 'General' },
        { id: '2', name: 'Premium', color: '#FFD700', price: 50, seats: 50, section: 'Premium' },
        { id: '3', name: 'VIP', color: '#FF1493', price: 100, seats: 20, section: 'VIP' },
      ]);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await Promise.race([
        apiRequest(`${API_BASE_URL}/events/${id}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
      ]);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }

      const data = await response.json();
      setEvent(data.data);
    } catch (err) {
      console.error('Fetch event details error:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonalTickets = async () => {
    try {
      setLoadingSeasonalTickets(true);
      // Add a timeout so it doesn't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets?eventId=${id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const tickets = Array.isArray(data.data) ? data.data : [];
        setSeasonalTickets(tickets);
      }
    } catch (err) {
      // Silently fail - seasonal tickets are optional
      console.log('Fetch seasonal tickets skipped or timed out');
      setSeasonalTickets([]);
    } finally {
      setLoadingSeasonalTickets(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    fetchPricingTiers();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSeasonalTickets();
    }
  }, [id]);

  // Refetch event details when page regains focus (after checkout)
  useEffect(() => {
    const handleFocus = () => {
      fetchEventDetails();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const getAvailableTicketTypeCount = (ticketType) => {
    if (!event?.ticket_quantities) return 'Available';
    
    const totalAvailable = event.ticket_quantities[ticketType] || 0;
    // Note: In a real app, you'd calculate sold count from the backend
    // For now, just show the total available from the event config
    
    if (totalAvailable === 0) return 'Sold Out';
    if (totalAvailable > 0) return `${totalAvailable} left`;
    return 'Available';
  };

  const handlePurchase = () => {
    setPurchaseDialog(true);
  };

  const handleAddToCart = () => {
    if (!event) return;

    // Ensure quantity matches selected seats if seating is required
    if (event?.has_seating && selectedSeats.length > 0) {
      // Add one cart item per selected seat
      selectedSeats.forEach((seatId) => {
        addToCart(event, {
          ...purchaseData,
          quantity: 1,
          selected_seats: [seatId],
        });
      });
    } else {
      // No seating or no seats selected, use quantity
      addToCart(event, {
        ...purchaseData,
        selected_seats: selectedSeats,
      });
    }
    setPurchaseDialog(false);
    navigate('/checkout');
  };

  const handleBuyAsGuest = async () => {
    if (!event) return;

    // Check if user is authenticated - if so, show login reminder
    if (isAuthenticated()) {
      setShowLoginReminder(true);
      return;
    }

    try {
      let cartId = guestCartId;

      // Create a new guest cart if one doesn't exist
      if (!cartId) {
        console.log('Creating guest cart...');
        try {
          cartId = await Promise.race([
            createGuestCart(apiRequest, API_BASE_URL),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Cart creation timeout')), 10000))
          ]);
          console.log('Guest cart created:', cartId);
        } catch (err) {
          throw new Error('Failed to create cart: ' + err.message);
        }
      }

      // Find the price for the selected ticket type
      let ticketPrice = 0;
      
      if (pricingTiers && pricingTiers.length > 0) {
        const selectedTier = pricingTiers.find(
          tier => tier.name?.toLowerCase() === purchaseData.ticket_type?.toLowerCase()
        );
        ticketPrice = selectedTier?.price || 0;
        
        if (ticketPrice === 0) {
          const minPriced = pricingTiers.reduce((min, tier) => 
            (tier.price && (!min.price || tier.price < min.price)) ? tier : min
          );
          ticketPrice = minPriced?.price || 0;
        }
      }
      
      console.log('DEBUG - final ticketPrice:', ticketPrice);

      // Add items to guest cart
      if (event?.has_seating && selectedSeats.length > 0) {
        for (const seatId of selectedSeats) {
          console.log('Adding item to cart for seat:', seatId);
          try {
            await Promise.race([
              addToGuestCart(
                cartId,
                event.id,
                1,
                purchaseData.ticket_type,
                ticketPrice,
                apiRequest,
                API_BASE_URL
              ),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Add to cart timeout')), 10000))
            ]);
          } catch (err) {
            console.error('Failed to add item:', err);
            throw new Error('Failed to add item to cart');
          }
        }
      } else {
        console.log('Adding item to cart with quantity:', purchaseData.quantity);
        try {
          await Promise.race([
            addToGuestCart(
              cartId,
              event.id,
              purchaseData.quantity,
              purchaseData.ticket_type,
              ticketPrice,
              apiRequest,
              API_BASE_URL
            ),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Add to cart timeout')), 10000))
          ]);
        } catch (err) {
          console.error('Failed to add item:', err);
          throw new Error('Failed to add item to cart');
        }
      }

      // Fetch the updated cart to ensure items are loaded
      try {
        console.log('Fetching updated guest cart');
        await getGuestCart(cartId, apiRequest, API_BASE_URL);
      } catch (err) {
        console.warn('Failed to fetch cart details, proceeding anyway:', err);
      }

      // Navigate to checkout
      console.log('Navigating to checkout');
      setPurchaseDialog(false);
      navigate('/checkout');
      toast.success('Added to guest cart!');
    } catch (err) {
      console.error('Guest checkout error:', err);
      toast.error('Failed to add to cart: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      concert: 'secondary',
      sports: 'primary',
      theater: 'warning',
      conference: 'info',
      festival: 'success',
      exhibition: 'error',
      bus_trip: 'default',
      flight: 'default',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getPricingInfo = () => {
    if (!event) return null;

    const basePrice = event.base_price || 0;
    return {
      standard: basePrice,
      vip: basePrice * 2,
      premium: basePrice * 1.5,
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={30} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Event not found'}
        </Alert>
      </Container>
    );
  }

  const pricing = getPricingInfo();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Event Image */}
          <Card sx={{ mb: 3 }}>
            {event.event_image_url ? (
              <CardMedia
                component="img"
                height="400"
                image={event.event_image_url}
                alt={event.title}
              />
            ) : (
              <CardMedia
                component="div"
                sx={{
                  height: 400,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Event sx={{ fontSize: 120, color: 'grey.400' }} />
              </CardMedia>
            )}
          </Card>

          {/* Event Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={event.event_type.replace('_', ' ')}
                color={getEventTypeColor(event.event_type)}
                sx={{ mr: 1 }}
              />
              <Chip
                label={event.category.replace('_', ' ')}
                variant="outlined"
              />
            </Box>

            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {event.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {event.organizer_first_name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Organized by {event.organizer_first_name} {event.organizer_last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Event Organizer
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Event Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Event Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Start Date & Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.start_date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(event.start_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        End Date & Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(event.end_date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(event.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {event.venue_name && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          Venue
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.venue_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.venue_address}, {event.venue_city}, {event.venue_state}, {event.venue_country}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Description */}
          {event.description && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  About This Event
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Terms and Conditions */}
          {event.terms_and_conditions && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Terms & Conditions
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.terms_and_conditions}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Part of Season Passes */}
          {seasonalTickets.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Part of Season Passes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This event is included in the following season passes:
                </Typography>
                <Grid container spacing={2}>
                  {seasonalTickets.map((ticket) => (
                    <Grid item xs={12} key={ticket.id}>
                      <Card variant="outlined" sx={{ p: 2, '&:hover': { boxShadow: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {ticket.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Price
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  ${parseFloat(ticket.season_price).toFixed(2)}
                                </Typography>
                              </Box>
                              {ticket.discount_percentage && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Discount
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {ticket.discount_percentage}% OFF
                                  </Typography>
                                </Box>
                              )}
                              {ticket.available_quantity !== undefined && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Remaining
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {ticket.available_quantity}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/seasonal-tickets/${ticket.id}/checkout`)}
                          disabled={ticket.available_quantity === 0}
                        >
                          {ticket.available_quantity === 0 ? 'Sold Out' : 'Get Season Pass'}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Get Tickets
              </Typography>

              {/* Availability */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available Tickets
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {event.available_tickets || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  out of {event.total_capacity || 0} total
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Available Ticket Types */}
              {event?.available_ticket_types && Array.isArray(event.available_ticket_types) && event.available_ticket_types.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Available Ticket Types
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {event.available_ticket_types.map((type) => {
                      const availableCount = event?.ticket_quantities?.[type] || 0;
                      const isSoldOut = availableCount === 0;
                      
                      return (
                        <Chip
                          key={type}
                          label={`${type.charAt(0).toUpperCase() + type.slice(1)} (${availableCount})`}
                          variant={isSoldOut ? 'outlined' : 'filled'}
                          color={isSoldOut ? 'default' : 'primary'}
                          size="small"
                          sx={{
                            opacity: isSoldOut ? 0.5 : 1,
                            textDecoration: isSoldOut ? 'line-through' : 'none'
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Pricing Tiers - Modern Card Design */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Ticket Pricing
                </Typography>
                <Grid container spacing={2}>
                  {Array.isArray(pricingTiers) && pricingTiers.length > 0 ? pricingTiers.map((tier, idx) => (
                    <Grid item xs={12} sm={pricingTiers.length <= 2 ? 6 : 4} key={tier.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: `linear-gradient(135deg, ${tier.color}08 0%, ${tier.color}04 100%)`,
                          border: `2px solid ${tier.color}`,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: `0 8px 24px ${tier.color}30`,
                            transform: 'translateY(-4px)',
                          }
                        }}
                      >
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                bgcolor: tier.color,
                                borderRadius: '50%',
                              }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: tier.color }}>
                              {tier.name}
                            </Typography>
                          </Box>
                          
                          {tier.section && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {tier.section}
                            </Typography>
                          )}
                          
                          <Box sx={{ flex: 1 }} />
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            gap: 1,
                            pt: 1,
                            borderTop: `1px solid ${tier.color}33`
                          }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: tier.color }}>
                              ${tier.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ pb: 0.5 }}>
                              per ticket
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (pricing && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(135deg, #3B82F608 0%, #3B82F604 100%)',
                            border: '2px solid #3B82F6',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px #3B82F630',
                              transform: 'translateY(-4px)',
                            }
                          }}
                        >
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Box sx={{ width: 16, height: 16, bgcolor: '#3B82F6', borderRadius: '50%' }} />
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                                Standard
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, pt: 1, borderTop: '1px solid #3B82F633' }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                                ${pricing.standard}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ pb: 0.5 }}>
                                per ticket
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(135deg, #F59E0B08 0%, #F59E0B04 100%)',
                            border: '2px solid #F59E0B',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px #F59E0B30',
                              transform: 'translateY(-4px)',
                            }
                          }}
                        >
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Box sx={{ width: 16, height: 16, bgcolor: '#F59E0B', borderRadius: '50%' }} />
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                                Premium
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, pt: 1, borderTop: '1px solid #F59E0B33' }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                                ${pricing.premium}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ pb: 0.5 }}>
                                per ticket
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'linear-gradient(135deg, #EF444408 0%, #EF444404 100%)',
                            border: '2px solid #EF4444',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 8px 24px #EF444430',
                              transform: 'translateY(-4px)',
                            }
                          }}
                        >
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Box sx={{ width: 16, height: 16, bgcolor: '#EF4444', borderRadius: '50%' }} />
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                                VIP
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, pt: 1, borderTop: '1px solid #EF444433' }}>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                                ${pricing.vip}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ pb: 0.5 }}>
                                per ticket
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </>
                  ))}
                </Grid>
              </Box>

              {/* Purchase Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handlePurchase}
                disabled={event.available_tickets === 0}
                sx={{ py: 1.5 }}
              >
                {event.available_tickets === 0 ? 'Sold Out' : 'Add to Cart'}
              </Button>

              {/* Share Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Share />}
                sx={{ mt: 1 }}
                onClick={() => {
                  navigator.share?.({
                    title: event.title,
                    text: event.short_description,
                    url: window.location.href,
                  }) || navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
              >
                Share Event
              </Button>

              {/* Organizer Actions */}
              {user && (user.role === 'organizer' || user.role === 'admin') && event?.organizer_id === user?.id && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/events/${id}/edit`)}
                  >
                    Edit Event
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/events/${id}/check-in`)}
                  >
                    Check-In
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Login Reminder Modal */}
      <Dialog open={showLoginReminder} onClose={() => setShowLoginReminder(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          Login Required
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You are not currently logged in. To purchase tickets, please log in to your account first.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              If you don't have an account, you can create one on the login page.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Logging in allows you to:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">Save your billing information
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">Track your ticket orders
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">Manage your profile and preferences
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginReminder(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowLoginReminder(false);
              navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
            }}
            variant="contained"
            color="primary"
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Your Tickets</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Only show manual ticket type selector for events WITHOUT seating */}
              {!event?.has_seating && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ticket Type</InputLabel>
                    <Select
                      value={purchaseData.ticket_type}
                      label="Ticket Type"
                      onChange={(e) => setPurchaseData(prev => ({ ...prev, ticket_type: e.target.value }))}
                    >
                      <MenuItem value="economy">Economy - ${pricing?.standard || 25}</MenuItem>
                      <MenuItem value="standard">Standard - ${pricing?.standard || 25}</MenuItem>
                      <MenuItem value="premium">Premium - ${pricing?.premium || 50}</MenuItem>
                      <MenuItem value="vip">VIP - ${pricing?.vip || 100}</MenuItem>
                      <MenuItem value="business">Business - ${(pricing?.premium || 50) * 1.5}</MenuItem>
                      <MenuItem value="first_class">First Class - ${(pricing?.vip || 100) * 1.5}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={event?.has_seating ? 12 : 6}>
                <FormControl fullWidth>
                  <InputLabel>Ticket Format</InputLabel>
                  <Select
                    value={purchaseData.ticket_format}
                    label="Ticket Format"
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, ticket_format: e.target.value }))}
                  >
                    <MenuItem value="digital">Digital (QR Code)</MenuItem>
                    <MenuItem value="physical">Physical Ticket</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Only show quantity selector for events WITHOUT seating */}
              {!event?.has_seating && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    value={purchaseData.quantity}
                    onChange={(e) => setPurchaseData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1, max: 10 }}
                  />
                </Grid>
              )}

              {/* Seat Selector - Beautiful Interactive Seat Map */}
              {event?.has_seating && (
                <Grid item xs={12}>
                  <SeatMapComponent
                    zones={Array.isArray(pricingTiers) ? pricingTiers : []}
                    eventId={event?.id}
                    apiRequest={apiRequest}
                    API_BASE_URL={API_BASE_URL}
                    onSeatsSelected={(seatData) => {
                      setSelectedSeats(seatData.seats || []);
                      // Optionally update ticket type based on zone
                      if (seatData.ticketType) {
                        setPurchaseData(prev => ({
                          ...prev,
                          ticket_type: seatData.ticketType,
                        }));
                      }
                    }}
                  />
                </Grid>
              )}

              {/* Pricing Summary */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Order Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Ticket Type:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {purchaseData.ticket_type}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Quantity:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {event?.has_seating ? selectedSeats.length : purchaseData.quantity}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Total:
                      </Typography>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        ${((pricing?.[purchaseData.ticket_type] || pricing?.standard || 25) * (event?.has_seating ? selectedSeats.length : purchaseData.quantity)).toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPurchaseDialog(false);
            setSelectedSeats([]);
          }}>Cancel</Button>
          {isAuthenticated() ? (
            <Button onClick={handleAddToCart} variant="contained" disabled={event?.has_seating ? selectedSeats.length === 0 : false}>
              Add to Cart
            </Button>
          ) : (
            <Button onClick={handleBuyAsGuest} variant="contained" disabled={event?.has_seating ? selectedSeats.length === 0 : false}>
              Buy as Guest
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetailsPage;
