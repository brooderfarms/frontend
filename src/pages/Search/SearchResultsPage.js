import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, FilterList } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: 'all',
    location: '',
    date: '',
  });

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query, filters]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.date && { date: filters.date }),
      });

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3800'}/api/events?${params}`
      );
      const data = await response.json();
      setResults(data.events || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Search Results
        </Typography>
        {query && (
          <Typography variant="subtitle1" color="textSecondary">
            Found {results.length} results for "{query}"
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList /> Filters
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Category"
                select
                fullWidth
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="comedy">Comedy</MenuItem>
                <MenuItem value="theater">Theater</MenuItem>
                <MenuItem value="conference">Conference</MenuItem>
              </TextField>

              <TextField
                label="Price Range"
                select
                fullWidth
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="under50">Under $50</MenuItem>
                <MenuItem value="50to100">$50 - $100</MenuItem>
                <MenuItem value="100to200">$100 - $200</MenuItem>
                <MenuItem value="over200">Over $200</MenuItem>
              </TextField>

              <TextField
                label="Location"
                fullWidth
                placeholder="City or venue"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                size="small"
              />

              <TextField
                label="Date"
                type="date"
                fullWidth
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Results Grid */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : results.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No events found. Try adjusting your search criteria.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {results.map((event) => (
                <Grid item xs={12} sm={6} key={event.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {event.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={event.image}
                        alt={event.title}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {event.title}
                      </Typography>

                      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {event.category && (
                          <Chip
                            label={event.category}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {event.is_featured && (
                          <Chip
                            label="Featured"
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {event.venue_name}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {new Date(event.event_date).toLocaleDateString()}
                      </Typography>

                      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                        ${parseFloat(event.base_price || 0).toFixed(2)}
                      </Typography>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchResultsPage;
