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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Skeleton,
  Alert,
  Fab,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  Add,
  Search,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const { apiRequest, API_BASE_URL, hasRole } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    event_type: '',
    sort_by: 'start_date',
    sort_order: 'desc',
  });

  const categories = [
    'music',
    'sports_soccer',
    'sports_cricket',
    'sports_other',
    'arts',
    'business',
    'travel_bus',
    'travel_flight',
    'entertainment',
    'other',
  ];

  const eventTypes = [
    'concert',
    'sports',
    'theater',
    'conference',
    'festival',
    'exhibition',
    'bus_trip',
    'flight',
    'other',
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiRequest(`${API_BASE_URL}/events?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      // Only show current and future events
      const now = new Date();
      const filteredEvents = Array.isArray(data.data.events)
        ? data.data.events.filter(e => {
            const eventEnd = e.end_date ? new Date(e.end_date) : new Date(e.start_date);
            return eventEnd >= now;
          })
        : [];
      setEvents(filteredEvents);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const EventCard = ({ event }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      {event.event_image_url ? (
        <CardMedia
          component="img"
          height="200"
          image={event.event_image_url}
          alt={event.title}
        />
      ) : (
        <CardMedia
          component="div"
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Event sx={{ fontSize: 80, color: 'grey.400' }} />
        </CardMedia>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={event.event_type.replace('_', ' ')}
            size="small"
            color={getEventTypeColor(event.event_type)}
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={event.category.replace('_', ' ')}
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          
          {/* Available Ticket Types */}
          {event.available_ticket_types && Array.isArray(event.available_ticket_types) && event.available_ticket_types.length > 0 && (
            <>
              {event.available_ticket_types.slice(0, 2).map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
              {event.available_ticket_types.length > 2 && (
                <Chip
                  label={`+${event.available_ticket_types.length - 2} more`}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}
            </>
          )}
        </Box>

        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {event.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.short_description || event.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTime sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2">
              {formatDate(event.start_date)}
            </Typography>
          </Box>

          {event.venue_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">
                {event.venue_name}, {event.venue_city}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2">
              {event.available_tickets || 0} tickets available
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ${event.base_price || 'TBD'}
          </Typography>
          <Button
            component={RouterLink}
            to={`/events/${event.id}`}
            variant="contained"
            size="small"
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton variant="text" width={60} height={30} />
                <Skeleton variant="rectangular" width={100} height={30} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Discover Events
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find concerts, sports events, conferences, and more near you
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search events"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={filters.event_type}
                  label="Event Type"
                  onChange={(e) => handleFilterChange('event_type', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ height: 56 }}
              >
                Search
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({
                  page: 1,
                  limit: 12,
                  search: '',
                  category: '',
                  event_type: '',
                  sort_by: 'start_date',
                  sort_order: 'asc',
                })}
                sx={{ height: 56 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Events Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Event sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Try adjusting your search criteria or check back later for new events.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setFilters({
              page: 1,
              limit: 12,
              search: '',
              category: '',
              event_type: '',
              sort_by: 'start_date',
              sort_order: 'asc',
            })}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={(e, page) => handleFilterChange('page', page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button for Organizers */}
      {hasRole(['organizer', 'admin']) && (
        <Fab
          color="primary"
          aria-label="add event"
          component={RouterLink}
          to="/events/create"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default EventsPage;
