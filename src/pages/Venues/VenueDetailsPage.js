import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const VenueDetailsPage = () => {
  const { id } = useParams();
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiRequest(`${API_BASE_URL}/venues/${id}`);
        if (!response.ok) throw new Error('Venue not found');
        const data = await response.json();
        setVenue(data.data);
      } catch (err) {
        setError('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id, apiRequest, API_BASE_URL]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!venue) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={RouterLink} to="/venues" variant="outlined" sx={{ mb: 2 }}>Back to Venues</Button>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Details" />
        <Tab label="Events" />
        {(user && (user.role === 'admin' || user.role === 'venue_manager')) && (
          <Tab label="Edit" />
        )}
      </Tabs>
      <Card>
        {tab === 2 && (user && (user.role === 'admin' || user.role === 'venue_manager')) ? (
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => navigate(`/venues/${id}/edit`)}>Edit Venue</Button>
              <Button variant="outlined" component={RouterLink} to={`/venues/${id}`}>View Public</Button>
            </Box>
          </CardContent>
        ) : null}
        {venue.image_url && (
          <Box
            component="img"
            src={venue.image_url}
            alt={venue.name}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              display: 'block'
            }}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom>{venue.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>{venue.city}, {venue.state}, {venue.country}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{venue.description}</Typography>
          <Typography variant="body2">Type: {venue.venue_type}</Typography>
          <Typography variant="body2">Capacity: {venue.capacity?.toLocaleString() || 'N/A'}</Typography>
          {/* Add more venue details as needed */}
        </CardContent>
      </Card>
    </Container>
  );
};

export default VenueDetailsPage;
