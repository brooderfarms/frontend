import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Alert,
  Fab,
} from '@mui/material';
import {
  LocationOn,
  Business,
  Event,
  Edit,
  Visibility,
  People,
  Payment,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VenueManagerDashboard = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch venues managed by this user
      const venuesResponse = await apiRequest(`${API_BASE_URL}/venues?manager_id=${user.id}`);
      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json();
        setVenues(venuesData.data.venues);

        // Get events for all managed venues
        const allEvents = [];
        let totalEvents = 0;
        let totalRevenue = 0;
        let totalCapacity = 0;

        for (const venue of venuesData.data.venues) {
          // Get events at this venue
          const eventsResponse = await apiRequest(`${API_BASE_URL}/venues/${venue.id}/events`);
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            allEvents.push(...eventsData.data.map(event => ({ ...event, venue_name: venue.name })));
          }

          // Get venue stats
          const statsResponse = await apiRequest(`${API_BASE_URL}/venues/${venue.id}/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            totalEvents += statsData.data.total_events;
            totalRevenue += statsData.data.total_revenue;
          }

          totalCapacity += venue.capacity;
        }

        setEvents(allEvents.slice(0, 20)); // Limit to 20 recent events

        setStats({
          totalVenues: venuesData.data.venues.length,
          totalEvents,
          totalCapacity,
          totalRevenue,
        });
      }

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

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

  const getStatusColor = (status) => {
    const colors = {
      published: 'success',
      draft: 'warning',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const handleViewVenue = (venueId) => {
    navigate(`/venues/${venueId}`);
  };

  const handleEditVenue = (venueId) => {
    navigate(`/venues/${venueId}/edit`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center">
          Loading venue manager dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Venue Manager Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your venues and oversee hosted events
        </Typography>
      </Box>

      {/* Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="My Venues"
              value={stats.totalVenues}
              icon={<LocationOn />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              icon={<Event />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Capacity"
              value={stats.totalCapacity}
              icon={<People />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue?.toFixed(2) || '0.00'}`}
              icon={<Payment />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => navigate('/merchandise/bulk-order')}
              sx={{ py: 1.5 }}
            >
              Bulk Order Merchandise
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/merchandise/orders')}
              sx={{ py: 1.5 }}
            >
              My Orders
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Venues Management */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  My Venues
                </Typography>
              </Box>

              {venues.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Business sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No venues assigned to you yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Contact an administrator to assign venues
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {venues.map((venue) => (
                    <Card key={venue.id} variant="outlined">
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {venue.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {venue.city}, {venue.state}
                            </Typography>
                          </Box>
                          <Chip
                            label={venue.venue_type.replace('_', ' ')}
                            size="small"
                            color={getVenueTypeColor(venue.venue_type)}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Typography variant="body2">
                            Capacity: {venue.capacity?.toLocaleString() || 'N/A'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewVenue(venue.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEditVenue(venue.id)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Recent Events
                </Typography>
              </Box>

              {events.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Event sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No events at your venues yet
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {events.slice(0, 10).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.venue_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(event.start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={event.status}
                              size="small"
                              color={getStatusColor(event.status)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Event />}
              fullWidth
            >
              View All Events
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<People />}
              fullWidth
              onClick={() => navigate('/venue-manager/bookings')}
            >
              Manage Bookings
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              fullWidth
            >
              Revenue Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Business />}
              fullWidth
            >
              Venue Settings
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VenueManagerDashboard;
