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
  Pagination,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Event,
  Search,
  Group,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VenuesPage = () => {
  const { apiRequest, API_BASE_URL } = useAuth();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    city: '',
    venue_type: '',
    sort_by: 'name',
    sort_order: 'asc',
  });

  const venueTypes = [
    'stadium',
    'theater',
    'arena',
    'concert_hall',
    'sports_complex',
    'conference_center',
    'airport',
    'bus_station',
    'other',
  ];

  useEffect(() => {
    fetchVenues();
  }, [filters]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiRequest(`${API_BASE_URL}/venues?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const data = await response.json();
      setVenues(data.data.venues);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Fetch venues error:', err);
      setError('Failed to load venues. Please try again.');
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
    fetchVenues();
  };

  const getVenueTypeColor = (type) => {
    const colors = {
      stadium: 'primary',
      theater: 'secondary',
      arena: 'success',
      concert_hall: 'warning',
      sports_complex: 'info',
      conference_center: 'error',
      airport: 'default',
      bus_station: 'default',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const VenueCard = ({ venue }) => (
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
      {venue.image_url ? (
        <CardMedia
          component="img"
          height="200"
          image={venue.image_url}
          alt={venue.name}
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
          <Business sx={{ fontSize: 80, color: 'grey.400' }} />
        </CardMedia>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={venue.venue_type.replace('_', ' ')}
            size="small"
            color={getVenueTypeColor(venue.venue_type)}
          />
        </Box>

        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {venue.name}
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
          {venue.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2">
              {venue.city}, {venue.state}, {venue.country}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Group sx={{ mr: 1, fontSize: 18 }} />
            <Typography variant="body2">
              Capacity: {venue.capacity?.toLocaleString() || 'N/A'}
            </Typography>
          </Box>

          {venue.upcoming_events && venue.upcoming_events.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ mr: 1, fontSize: 18 }} />
              <Typography variant="body2">
                {venue.upcoming_events.length} upcoming event{venue.upcoming_events.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          component={RouterLink}
          to={`/venues/${venue.id}`}
          variant="contained"
          fullWidth
          sx={{ mt: 'auto' }}
        >
          View Details
        </Button>
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
              <Skeleton variant="rectangular" height={36} />
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
          Event Venues
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover amazing venues for your next event experience
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search venues"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="e.g. Harare"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Venue Type"
                value={filters.venue_type}
                onChange={(e) => handleFilterChange('venue_type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {venueTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ height: 56 }}
              >
                Search
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({
                  page: 1,
                  limit: 12,
                  search: '',
                  city: '',
                  venue_type: '',
                  sort_by: 'name',
                  sort_order: 'asc',
                })}
                sx={{ height: 56 }}
              >
                Clear
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

      {/* Venues Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : venues.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Business sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No venues found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Try adjusting your search criteria or check back later for new venues.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setFilters({
              page: 1,
              limit: 12,
              search: '',
              city: '',
              venue_type: '',
              sort_by: 'name',
              sort_order: 'asc',
            })}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {venues.map((venue) => (
              <Grid item xs={12} sm={6} md={4} key={venue.id}>
                <VenueCard venue={venue} />
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
    </Container>
  );
};

export default VenuesPage;
