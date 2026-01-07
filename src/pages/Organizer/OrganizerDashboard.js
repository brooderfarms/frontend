import React, { useState, useEffect } from 'react';
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
  Event,
  Add,
  People,
  Payment,
  TrendingUp,
  Edit,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch organizer's events
      const eventsResponse = await apiRequest(`${API_BASE_URL}/events?organizer_id=${user.id}&limit=20`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        // Handle different response structures
        const eventsList = eventsData.data?.events || eventsData.data || [];
        setEvents(Array.isArray(eventsList) ? eventsList : []);

        // Calculate basic stats
        const totalEvents = eventsList.length;
        const publishedEvents = eventsList.filter(e => e.status === 'published').length;
        const upcomingEvents = eventsList.filter(e =>
          e.status === 'published' && new Date(e.start_date) > new Date()
        ).length;

        // Get ticket sales data for each event (non-blocking)
        let totalTicketsSold = 0;
        let totalRevenue = 0;

        for (const event of eventsList) {
          try {
            const statsResponse = await apiRequest(`${API_BASE_URL}/events/${event.id}/stats`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              totalTicketsSold += parseInt(statsData.data.total_tickets_sold) || 0;
              totalRevenue += parseFloat(statsData.data.total_revenue) || 0;
            }
          } catch (statsError) {
            console.warn('Could not fetch stats for event:', event.id, statsError);
          }
        }

        setStats({
          totalEvents,
          publishedEvents,
          upcomingEvents,
          totalTicketsSold,
          totalRevenue,
        });
      } else {
        console.warn('Events fetch failed:', eventsResponse.status);
        setEvents([]);
      }

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
      toast.error('Failed to load dashboard data');
      setEvents([]);
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

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      published: 'success',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`); // This route might need to be added
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center">
          Loading organizer dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Organizer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your events and track performance
        </Typography>
      </Box>

      {/* Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              icon={<Event />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Published Events"
              value={stats.publishedEvents}
              icon={<Event />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tickets Sold"
              value={stats.totalTicketsSold}
              icon={<People />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
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
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateEvent}
              sx={{ py: 1.5 }}
            >
              Create Event
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => navigate('/organizer/ticket-templates')}
              sx={{ py: 1.5 }}
            >
              Ticket Templates
            </Button>
          </Grid>
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

      {/* Events Management */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              My Events
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateEvent}
            >
              Create Event
            </Button>
          </Box>

          {events.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Event sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No events yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Create your first event to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateEvent}
              >
                Create Your First Event
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tickets Sold</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {event.event_type} • {event.venue_name}
                        </Typography>
                        {event.available_ticket_types && Array.isArray(event.available_ticket_types) && event.available_ticket_types.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {event.available_ticket_types.slice(0, 2).map((type) => (
                              <Chip
                                key={type}
                                label={type.charAt(0).toUpperCase() + type.slice(1)}
                                size="small"
                                variant="filled"
                                color="primary"
                              />
                            ))}
                            {event.available_ticket_types.length > 2 && (
                              <Chip
                                label={`+${event.available_ticket_types.length - 2}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
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
                      <TableCell>
                        {/* This would need to be fetched separately */}
                        0
                      </TableCell>
                      <TableCell>
                        $0.00
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewEvent(event.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEditEvent(event.id)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

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
              onClick={handleCreateEvent}
              fullWidth
            >
              Create Event
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              fullWidth
            >
              View Analytics
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<People />}
              fullWidth
            >
              Manage Attendees
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<Payment />}
              fullWidth
            >
              Payment History
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="create event"
        onClick={handleCreateEvent}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default OrganizerDashboard;
