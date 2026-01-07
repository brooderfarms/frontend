import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Card,
  Paper,
  Button,
  Chip,
  Divider,
  CardContent,
  InputBase,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import Flight from '@mui/icons-material/Flight';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import ArrowForward from '@mui/icons-material/ArrowForward';
import LocationOn from '@mui/icons-material/LocationOn';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import ConfirmationNumber from '@mui/icons-material/ConfirmationNumber';
import PhoneAndroid from '@mui/icons-material/PhoneAndroid';
import Star from '@mui/icons-material/Star';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Security from '@mui/icons-material/Security';
import Support from '@mui/icons-material/Support';
import LocalOffer from '@mui/icons-material/LocalOffer';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

  const HomePage = () => {
    const navigate = useNavigate();
    const [searchTab, setSearchTab] = useState('travel');
    const [searchQuery, setSearchQuery] = useState('');
    const isAuthenticated = () => false;
    const handleTabChange = (_, newVal) => {
      if (newVal !== null) setSearchTab(newVal);
    };
  
    // Dynamic featured events (fetched from backend)
    const { apiRequest, API_BASE_URL } = useAuth();
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [seasonalTickets, setSeasonalTickets] = useState([]);
    const [seasonalLoading, setSeasonalLoading] = useState(true);

    useEffect(() => {
      const fetchFeatured = async () => {
        try {
          setFeaturedLoading(true);
          const response = await apiRequest(`${API_BASE_URL}/events?is_featured=true&status=published&limit=3`);
          if (response && response.ok) {
            const data = await response.json();
            // Only show current and future events
            const now = new Date();
            const eventsArr = data.data?.events || data.data || [];
            const filteredEvents = Array.isArray(eventsArr)
              ? eventsArr.filter(e => {
                  const eventEnd = e.end_date ? new Date(e.end_date) : new Date(e.start_date);
                  return eventEnd >= now;
                })
              : [];
            setFeaturedEvents(filteredEvents);
          } else {
            setFeaturedEvents([]);
          }
        } catch (err) {
          console.error('Fetch featured events error:', err);
          setFeaturedEvents([]);
        } finally {
          setFeaturedLoading(false);
        }
      };

      fetchFeatured();
    }, [apiRequest, API_BASE_URL]);

    useEffect(() => {
      const fetchSeasonalTickets = async () => {
        try {
          setSeasonalLoading(true);
          const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets?status=published&limit=3`);
          if (response && response.ok) {
            const data = await response.json();
            setSeasonalTickets(data.data?.seasonalTickets || data.data || []);
          } else {
            setSeasonalTickets([]);
          }
        } catch (err) {
          console.error('Fetch seasonal tickets error:', err);
          setSeasonalTickets([]);
        } finally {
          setSeasonalLoading(false);
        }
      };

      fetchSeasonalTickets();
    }, [apiRequest, API_BASE_URL]);
  
    const categories = [
      { label: 'Concerts', color: '#ff0080', icon: <Flight /> },
      { label: 'Sports', color: '#00bcd4', icon: <SportsSoccer /> },
      { label: 'Theatre', color: '#8e44ad', icon: <ArrowForward /> },
      { label: 'Travel', color: '#4caf50', icon: <LocationOn /> },
      { label: 'Family', color: '#ffa726', icon: <Flight /> },
      { label: 'Food', color: '#f44336', icon: <SportsSoccer /> },
    ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '720px', md: '800px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            filter: 'brightness(0.55) saturate(1.05) contrast(1.02)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(2,6,23,0.6) 0%, rgba(0,45,104,0.42) 55%, rgba(0,0,0,0.28) 100%)',
            zIndex: 1,
            pointerEvents: 'none'
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: { xs: 2, md: 3 } }}>
          {/* Main Hero Content */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 900,
                textShadow: '0 6px 20px rgba(0,0,0,0.45)',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Your Next Adventure
              <br />
              <Box component="span" sx={{ 
                background: 'linear-gradient(135deg, #ff0080 0%, #ff4da6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}>
                Starts Here
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: alpha('#fff', 0.95),
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 500,
                lineHeight: 1.6,
                mb: 4,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              Discover and book the best events, sports, and travel experiences across Zimbabwe.
            </Typography>

            {/* Hero CTAs */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/events"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ 
                  px: 5, 
                  py: 1.75, 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(255, 0, 128, 0.4)',
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(255, 0, 128, 0.5)',
                  }
                }}
                aria-label="Browse Events"
              >
                Browse Events
              </Button>

              <Button
                component={RouterLink}
                to="/venues"
                variant="outlined"
                size="large"
                sx={{ 
                  px: 5, 
                  py: 1.75, 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  borderWidth: 2,
                  bgcolor: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    bgcolor: alpha('#ffffff', 0.15),
                    borderWidth: 2,
                  }
                }}
                aria-label="Explore Venues"
              >
                Explore Venues
              </Button>

            </Box>
          </Box>

          {/* Categories in Hero */}
          <Paper
            elevation={0}
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              p: 4,
              borderRadius: 4,
              bgcolor: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(2, 6, 23, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: alpha('#fff', 0.7), 
                fontWeight: 700, 
                letterSpacing: 2,
                display: 'block',
                mb: 3,
              }}
            >
              BROWSE BY CATEGORY
            </Typography>
            <Grid container spacing={3}>
              {categories.map((category, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <Card
                    component={RouterLink}
                    to={`/events?category=${category.label}`}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2.5,
                      textDecoration: 'none',
                      bgcolor: alpha('#ffffff', 0.12),
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(2, 6, 23, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        bgcolor: alpha('#ffffff', 0.22),
                        boxShadow: `0 20px 40px ${alpha(category.color, 0.25)}, inset 0 1px 1px rgba(255, 255, 255, 0.25)`,
                        borderColor: alpha(category.color, 0.4),
                        backdropFilter: 'blur(15px)',
                        '& .icon-box': {
                          bgcolor: category.color,
                          color: 'white',
                          transform: 'scale(1.15) rotate(5deg)',
                          boxShadow: `0 8px 20px ${alpha(category.color, 0.4)}`,
                        },
                        '& .category-label': {
                          color: category.color,
                        },
                      },
                    }}
                  >
                    <Box
                      className="icon-box"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: alpha(category.color, 0.15),
                        color: category.color,
                        mb: 1.5,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${alpha(category.color, 0.3)}`,
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography 
                      className="category-label" 
                      variant="body2" 
                      fontWeight="700" 
                      color="white" 
                      sx={{ 
                        transition: 'color 0.3s',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {category.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* How It Works Section - White Background */}
      <Box 
        sx={{ 
          py: 10, 
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,45,104,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,0,128,0.08) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: 2 }}>
              SIMPLE & EASY
            </Typography>
            <Typography variant="h3" fontWeight="900" color="primary.main" gutterBottom>
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Get your tickets in three simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { icon: <Search />, title: 'Browse Events', desc: 'Explore thousands of events across Zimbabwe', step: '01' },
              { icon: <ConfirmationNumber />, title: 'Select Tickets', desc: 'Choose your seats and ticket types', step: '02' },
              { icon: <PhoneAndroid />, title: 'Get Instant Access', desc: 'Receive your digital tickets immediately', step: '03' },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    bgcolor: alpha('#ffffff', 0.8),
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 45, 104, 0.1)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 45, 104, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      bgcolor: alpha('#ffffff', 0.95),
                      boxShadow: '0 16px 48px rgba(0, 45, 104, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                      borderColor: alpha('#ff0080', 0.2),
                    },
                  }}
                >
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 900,
                      color: alpha('#002d68', 0.05),
                      fontSize: '4rem',
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha('#ff0080', 0.1),
                      color: '#ff0080',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      border: '3px solid rgba(255, 0, 128, 0.2)',
                      '& .MuiSvgIcon-root': { fontSize: 36 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="700" color="primary.main" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Box sx={{ py: 10, position: 'relative', bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              mb: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(0, 45, 104, 0.03) 0%, rgba(255, 0, 128, 0.02) 100%)',
              border: '1px solid rgba(0, 45, 104, 0.08)',
              textAlign: 'center',
            }}
          >
            <Typography variant="overline" color="secondary" fontWeight="bold" letterSpacing={2}>
              DON'T MISS OUT
            </Typography>
            <Typography variant="h2" fontWeight="900" color="primary.main" gutterBottom sx={{ mb: 2 }}>
              Featured Events
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
              Discover the hottest events happening right now across Zimbabwe
            </Typography>
            <Button
              component={RouterLink}
              to="/events"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForward />}
              size="large"
              sx={{ 
                fontWeight: 700, 
                px: 4,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              View All Events
            </Button>
          </Paper>

          <Grid container spacing={4}>
            {featuredEvents.map((event) => {
            const startDate = event.start_date || event.sales_start_date || event.published_at || event.date;
            const d = startDate ? new Date(startDate) : null;
            const month = d ? d.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
            const day = d ? d.getDate() : '';
            const imageUrl = event.image || event.event_image_url || '';
            const priceLabel = event.price || (event.base_price ? `From $${event.base_price}` : 'From $0');
            const locationLabel = event.location || event.venue_name || '';

              return (
              <Grid item xs={12} md={4} key={event.id}>
                <Card
                  component={RouterLink}
                  to={`/events/${event.id}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 26px rgba(2, 6, 23, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: alpha('#ffffff', 0.9),
                    backdropFilter: 'blur(16px)',
                    textDecoration: 'none',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      bgcolor: alpha('#ffffff', 0.98),
                      boxShadow: '0 32px 64px rgba(2, 6, 23, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                      borderColor: alpha('#ff0080', 0.2),
                      backdropFilter: 'blur(20px)',
                      '& .event-image': {
                        transform: 'scale(1.08)',
                      },
                      '& .book-button': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 20px rgba(0, 45, 104, 0.3)',
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden', height: 240 }}>
                    <Box
                      className="event-image"
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.6s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: alpha('#ffffff', 0.98),
                        backdropFilter: 'blur(12px)',
                        borderRadius: 2.5,
                        p: 1.5,
                        textAlign: 'center',
                        minWidth: 64,
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <Typography variant="caption" display="block" fontWeight="bold" color="secondary" sx={{ lineHeight: 1, fontSize: '0.7rem' }}>
                        {month}
                      </Typography>
                      <Typography variant="h4" fontWeight="900" color="primary.main" sx={{ lineHeight: 1 }}>
                        {day}
                      </Typography>
                    </Box>
                    <Chip
                      label={event.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 700,
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 6px 16px rgba(255, 0, 128, 0.4)',
                        bgcolor: alpha('#ff0080', 0.95),
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3.5 }}>
                    <Typography variant="h5" fontWeight="800" gutterBottom sx={{ lineHeight: 1.3, mb: 2.5, height: 64, overflow: 'hidden', color: 'text.primary' }}>
                      {event.title}
                    </Typography>
                  
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                      <LocationOn sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="600">{locationLabel}</Typography>
                    </Box>

                    <Divider sx={{ my: 2.5, borderColor: alpha('#000000', 0.08) }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Starting from
                        </Typography>
                        <Typography variant="h5" color="secondary.main" fontWeight="900">
                          {priceLabel}
                        </Typography>
                      </Box>
                      <Button
                        className="book-button"
                        variant="contained"
                        color="primary"
                        sx={{ 
                          borderRadius: 2.5, 
                          px: 3.5, 
                          py: 1.25,
                          fontWeight: 700,
                          transition: 'all 0.3s ease',
                        }}
                        onClick={() => navigate('/checkout', { state: { eventId: event.id } })}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ); })}
          </Grid>
        </Container>
      </Box>

      {/* Season Passes Section */}
      {seasonalTickets.length > 0 && (
        <Box sx={{ py: 8, bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)' }}>
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'transparent',
                mb: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h2"
                  fontWeight={900}
                  gutterBottom
                  sx={{ mb: 1, color: 'text.primary' }}
                >
                  🎭 Season Passes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get unlimited access to multiple events with our exclusive season passes
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/seasonal-tickets"
                endIcon={<ArrowForward />}
              >
                View All Season Passes
              </Button>
            </Paper>

            <Grid container spacing={4}>
              {seasonalTickets.map((ticket) => {
                const discountAmount = ((ticket.base_price - ticket.season_price) / ticket.base_price * 100).toFixed(0);
                const isSoldOut = ticket.sold_quantity >= ticket.available_quantity;

                return (
                  <Grid item xs={12} md={4} key={ticket.id}>
                    <Card
                      component={RouterLink}
                      to={`/seasonal-tickets/${ticket.id}`}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 8px 26px rgba(2, 6, 23, 0.1)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: alpha('#ffffff', 0.9),
                        textDecoration: 'none',
                        position: 'relative',
                        '&:hover': {
                          transform: isSoldOut ? 'none' : 'translateY(-8px)',
                          boxShadow: isSoldOut ? 2 : '0 32px 64px rgba(2, 6, 23, 0.2)',
                        },
                        opacity: isSoldOut ? 0.7 : 1,
                      }}
                    >
                      {ticket.image_url ? (
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            backgroundImage: `url(${ticket.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LocalOffer sx={{ fontSize: 80, color: 'white', opacity: 0.7 }} />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 1 }}>
                          {ticket.name}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${ticket.season_year}`}
                            size="small"
                            color="primary"
                          />
                          {discountAmount > 0 && (
                            <Chip
                              label={`Save ${discountAmount}%`}
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {ticket.total_events} Events Included
                        </Typography>

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

                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          disabled={isSoldOut}
                        >
                          {isSoldOut ? 'Sold Out' : 'Get Pass'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      )}

      {/* Promo Banner - Enhanced Glassmorphism */}
      <Box 
        sx={{ 
          py: 12, 
          position: 'relative', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #002d68 0%, #1e40af 50%, #002d68 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255, 0, 128, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip 
                label="FOR ORGANIZERS" 
                size="medium"
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  bgcolor: alpha('#ff0080', 0.95),
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.8rem',
                  px: 2,
                  py: 2.5,
                }} 
              />
              <Typography variant="h2" color="white" fontWeight="900" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 3 }}>
                Host Your Event With Us
              </Typography>
              <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), mb: 5, lineHeight: 1.8, fontSize: '1.15rem' }}>
                Join the fastest growing ticketing platform in Zimbabwe. Get access to real-time analytics, secure payments, and 24/7 support.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/organizer/register"
                  sx={{ 
                    px: 5, 
                    py: 2, 
                    fontSize: '1.1rem', 
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(255, 0, 128, 0.4)',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(255, 0, 128, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Start Selling
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: alpha('#ffffff', 0.4),
                    borderWidth: 2,
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    bgcolor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                      borderColor: alpha('#ffffff', 0.6), 
                      bgcolor: alpha('#ffffff', 0.15),
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  component={RouterLink}
                  to="/organizer/learn-more"
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  p: 5,
                  bgcolor: alpha('#ffffff', 0.1),
                  borderRadius: 4,
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 0, 128, 0.2) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: alpha('#ff0080', 0.2),
                          color: '#ff0080',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          border: '3px solid rgba(255, 0, 128, 0.3)',
                        }}
                      >
                        <CalendarMonth sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h2" fontWeight="900" color="white" gutterBottom>500+</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ color: alpha('#fff', 0.85) }}>Events Hosted</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: alpha('#ff0080', 0.2),
                          color: '#ff0080',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          border: '3px solid rgba(255, 0, 128, 0.3)',
                        }}
                      >
                        <ConfirmationNumber sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h2" fontWeight="900" color="white" gutterBottom>50k+</Typography>
                      <Typography variant="body1" fontWeight="600" sx={{ color: alpha('#fff', 0.85) }}>Tickets Sold</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ borderColor: alpha('#ffffff', 0.15), my: 3 }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight="900" color="white" gutterBottom>Zero Setup Fees</Typography>
                      <Typography variant="h6" sx={{ color: alpha('#fff', 0.85) }}>Get started in minutes</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            bgcolor: alpha('#ffffff', 0.7),
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="overline" color="secondary" fontWeight="bold" letterSpacing={2}>
            STAY UPDATED
          </Typography>
          <Typography variant="h3" fontWeight="900" gutterBottom color="primary.main" sx={{ mb: 2 }}>
            Never Miss an Event
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Subscribe to our newsletter for exclusive offers, early bird tickets, and the latest event news delivered straight to your inbox.
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 500,
              mx: 'auto',
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <InputBase
              placeholder="Enter your email address"
              sx={{
                flex: 1,
                bgcolor: alpha('#ffffff', 0.6),
                backdropFilter: 'blur(10px)',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#000000', 0.1),
                fontSize: '1rem',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 0 3px rgba(0, 45, 104, 0.1)',
                  bgcolor: alpha('#ffffff', 0.9),
                  backdropFilter: 'blur(15px)',
                },
                transition: 'all 0.2s',
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 2, px: 4, fontWeight: 700, boxShadow: '0 4px 15px rgba(0, 45, 104, 0.2)' }}
            >
              Subscribe
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Features Section - Blue Glassmorphism */}
      <Box 
        sx={{ 
          py: 10,
          position: 'relative',
          background: 'linear-gradient(180deg, #001b3a 0%, #002d68 100%)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#ff0080', fontWeight: 700, letterSpacing: 2 }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h3" fontWeight="900" color="white" gutterBottom>
              Built For Your Convenience
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { 
                icon: <Security />, 
                title: 'Secure Payments', 
                desc: 'Bank-level encryption and secure payment gateways',
                color: '#10b981'
              },
              { 
                icon: <CalendarMonth />, 
                title: 'Real-time Updates', 
                desc: 'Get instant notifications about your events',
                color: '#3b82f6'
              },
              { 
                icon: <Support />, 
                title: '24/7 Support', 
                desc: 'Our team is here to help you anytime',
                color: '#f59e0b'
              },
              { 
                icon: <TrendingUp />, 
                title: 'Best Prices', 
                desc: 'Competitive pricing with no hidden fees',
                color: '#ff0080'
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    bgcolor: alpha('#ffffff', 0.08),
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      bgcolor: alpha('#ffffff', 0.12),
                      borderColor: alpha(item.color, 0.3),
                      boxShadow: `0 12px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)`,
                      '& .feature-icon': {
                        bgcolor: item.color,
                        color: 'white',
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <Box
                    className="feature-icon"
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: alpha(item.color, 0.15),
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.3s ease',
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="700" color="white" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
