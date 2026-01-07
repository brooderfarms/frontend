import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
} from '@mui/material';
import {
  Event,
  ConfirmationNumber,
  Payment,
  TrendingUp,
  AccessTime,
  LocationOn,
  Person,
  Dashboard as DashboardIcon,
  ShoppingCart,
  Receipt,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  const { user, apiRequest, API_BASE_URL } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user statistics
      const statsResponse = await apiRequest(`${API_BASE_URL}/users/${user.id}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch recent tickets
      const ticketsResponse = await apiRequest(`${API_BASE_URL}/users/${user.id}/tickets?page=1&limit=5`);
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setRecentTickets(ticketsData.data.tickets);
      }

      // Fetch upcoming events (user might be interested in)
      const eventsResponse = await apiRequest(`${API_BASE_URL}/events?status=published&limit=3`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setUpcomingEvents(eventsData.data.events);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      customer: 'Customer',
      organizer: 'Event Organizer',
      venue_manager: 'Venue Manager',
      admin: 'Administrator',
    };
    return roleMap[role] || role;
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {value || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center">
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {user.first_name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your {getRoleDisplay(user.role)} dashboard. Here's what's happening with your account.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={stats?.totalTickets}
            icon={<ConfirmationNumber />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tickets"
            value={stats?.activeTickets}
            icon={<Event />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spent"
            value={stats?.totalSpent ? `$${stats.totalSpent}` : '$0'}
            icon={<Payment />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Events Attended"
            value={stats?.eventsAttended}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Tickets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Tickets
              </Typography>
              <Button
                component={RouterLink}
                to="/tickets"
                size="small"
                endIcon={<ConfirmationNumber />}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {recentTickets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ConfirmationNumber sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No tickets yet
                </Typography>
                <Button
                  component={RouterLink}
                  to="/events"
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Browse Events
                </Button>
              </Box>
            ) : (
              <List>
                {recentTickets.map((ticket) => (
                  <ListItem key={ticket.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ConfirmationNumber />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={ticket.event_title}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            Ticket #{ticket.ticket_number}
                          </Typography>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={ticket.status === 'confirmed' ? 'success' : 'default'}
                            sx={{ ml: 1 }}
                          />
                          <br />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(ticket.event_start_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Upcoming Events
              </Typography>
              <Button
                component={RouterLink}
                to="/events"
                size="small"
                endIcon={<Event />}
              >
                Browse More
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {upcomingEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Event sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No upcoming events
                </Typography>
              </Box>
            ) : (
              <List>
                {upcomingEvents.map((event) => (
                  <ListItem key={event.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <Event />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {new Date(event.start_date).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Typography variant="body2" color="text.secondary">
                            {event.venue_name || 'Venue TBA'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      component={RouterLink}
                      to={`/events/${event.id}`}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/events"
              variant="contained"
              fullWidth
              startIcon={<Event />}
              sx={{ py: 2 }}
            >
              Browse Events
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/tickets"
              variant="outlined"
              fullWidth
              startIcon={<ConfirmationNumber />}
              sx={{ py: 2 }}
            >
              My Tickets
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/merchandise/store"
              variant="outlined"
              fullWidth
              startIcon={<Inventory />}
              sx={{ py: 2 }}
            >
              Buy Merchandise
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/merchandise/orders"
              variant="outlined"
              fullWidth
              startIcon={<ShoppingCart />}
              sx={{ py: 2 }}
            >
              My Orders
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/profile"
              variant="outlined"
              fullWidth
              startIcon={<Person />}
              sx={{ py: 2 }}
            >
              Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/venues"
              variant="outlined"
              fullWidth
              startIcon={<LocationOn />}
              sx={{ py: 2 }}
            >
              Venues
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;
