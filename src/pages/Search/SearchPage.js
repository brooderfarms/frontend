import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  LocationOn,
  Event,
  AttachMoney,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetchFilters();
    performSearch();
  }, []);

  const fetchFilters = async () => {
    try {
      const [categoriesRes, venuesRes] = await Promise.all([
        apiRequest(`${API_BASE_URL}/search/events/filters`),
        apiRequest(`${API_BASE_URL}/search/venues/filters`),
      ]);

      const categoriesData = await categoriesRes.json();
      const venuesData = await venuesRes.json();

      setCategories(categoriesData.data?.categories || []);
      setVenues(venuesData.data?.cities || []);
    } catch (err) {
      console.error('Fetch filters error:', err);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (date) params.append('start_date', date);
      params.append('min_price', priceRange[0]);
      params.append('max_price', priceRange[1]);
      params.append('sort', sortBy);

      const response = await apiRequest(
        `${API_BASE_URL}/search/events?${params.toString()}`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setEvents(data.data || []);

      if (data.data.length === 0) {
        toast.success('No events found matching your criteria');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setPriceRange([0, 500]);
    setDate('');
    setLocation('');
    setSortBy('date');
    performSearch();
  };

  const EventCard = ({ event }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
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
        <Event sx={{ fontSize: 60, color: 'grey.400' }} />
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, minHeight: 50 }}>
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={event.category} size="small" color="primary" />
          {event.has_streaming_access && (
            <Chip label="📺 Streaming" size="small" color="secondary" />
          )}
        </Box>

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.venue_name || event.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ${event.base_price || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {event.available_tickets} tickets left
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
        Search Events
      </Typography>

      {/* Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search events, artists, venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={<SearchIcon sx={{ mr: 1 }} />}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ px: 4 }}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterList />}
          >
            Filters
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        {showFilters && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Filters
              </Typography>

              {/* Category Filter */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Location Filter */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={location}
                    label="Location"
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <MenuItem value="">All Locations</MenuItem>
                    {venues.map((venue) => (
                      <MenuItem key={venue} value={venue}>
                        {venue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Date Filter */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Price Range Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  min={0}
                  max={500}
                  step={10}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 500, label: '$500' },
                  ]}
                />
              </Box>

              {/* Sort By */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="date">Date (Nearest)</MenuItem>
                    <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                    <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                    <MenuItem value="popularity">Most Popular</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Paper>
          </Grid>
        )}

        {/* Results */}
        <Grid item xs={12} md={showFilters ? 9 : 12}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : events.length > 0 ? (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No events found. Try adjusting your filters or search term.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;
