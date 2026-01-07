import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Pagination,
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
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People,
  Event,
  LocationOn,
  Payment,
  TrendingUp,
  Security,
  AdminPanelSettings,
  Block,
  CheckCircle,
  LocalOffer,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import UnifiedApprovals from './UnifiedApprovals';

const AdminDashboard = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [venuesList, setVenuesList] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const eventsPerPage = 500;
  const [venuesPage, setVenuesPage] = useState(1);
  const [venuesTotalPages, setVenuesTotalPages] = useState(1);
  const venuesPerPage = 500;
  const [payments, setPayments] = useState([]);
  const [seasonalTickets, setSeasonalTickets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [seasonalPassFilter, setSeasonalPassFilter] = useState('all'); // 'all', 'draft', 'published'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchVenues = async (page = 1) => {
    try {
      const resp = await apiRequest(`${API_BASE_URL}/venues?page=${page}&limit=${venuesPerPage}`);
      if (!resp.ok) {
        console.warn('Venues fetch failed:', resp.status);
        setVenuesList([]);
        setVenuesTotalPages(1);
        return;
      }

      const vd = await resp.json();
      const items = vd.data?.venues || vd.data || [];
      const meta = vd.meta || vd.data?.meta || vd.pagination || {};
      const totalItems = meta.total || meta.count || vd.total || (Array.isArray(items) ? items.length : 0);
      const totalPages = meta.total_pages || meta.pages || (venuesPerPage ? Math.max(1, Math.ceil(totalItems / venuesPerPage)) : 1);

      setVenuesList(Array.isArray(items) ? items : []);
      setVenuesTotalPages(totalPages);
      setVenuesPage(page);
    } catch (err) {
      console.error('Fetch venues error:', err);
      setVenuesList([]);
      setVenuesTotalPages(1);
    }
  };

  const fetchEvents = async (page = 1) => {
    try {
      const resp = await apiRequest(`${API_BASE_URL}/events?page=${page}&limit=${eventsPerPage}&status=`);
      if (!resp.ok) {
        console.warn('Events fetch failed:', resp.status);
        setEvents([]);
        setEventsTotalPages(1);
        return;
      }

      const ed = await resp.json();
      const items = ed.data?.events || ed.data || [];
      const meta = ed.meta || ed.data?.meta || ed.data?.pagination || ed.pagination || {};
      const totalItems = meta.total || meta.count || ed.total || (Array.isArray(items) ? items.length : 0);
      const totalPages = meta.total_pages || meta.pages || (eventsPerPage ? Math.max(1, Math.ceil(totalItems / eventsPerPage)) : 1);

      setEvents(Array.isArray(items) ? items : []);
      setEventsTotalPages(totalPages);
      setEventsPage(page);
    } catch (err) {
      console.error('Fetch events error:', err);
      setEvents([]);
      setEventsTotalPages(1);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await apiRequest(`${API_BASE_URL}/users/stats/overview`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Fetch recent users
      const usersResponse = await apiRequest(`${API_BASE_URL}/users?page=1&limit=10`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.data.users);
      }

      // Fetch recent events (first page)
      await fetchEvents(1);

      // Fetch recent payments
      // Fetch recent venues (first page)
      await fetchVenues(1);

      
      const paymentsResponse = await apiRequest(`${API_BASE_URL}/payments?page=1&limit=10`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        // Handle different response structures
        const paymentsList = paymentsData.data?.payments || paymentsData.data || paymentsData.payments || [];
        setPayments(Array.isArray(paymentsList) ? paymentsList : []);
      }

      // Fetch ALL seasonal tickets (including drafts) - admin view
      const seasonalResponse = await apiRequest(`${API_BASE_URL}/seasonal-tickets?limit=100&include_drafts=true`);
      if (seasonalResponse.ok) {
        const seasonalData = await seasonalResponse.json();
        setSeasonalTickets(Array.isArray(seasonalData.data) ? seasonalData.data : []);
      } else {
        console.warn('Seasonal tickets fetch failed:', seasonalResponse.status);
        setSeasonalTickets([]);
      }

      // Fetch pending vendors
      const vendorsResponse = await apiRequest(`${API_BASE_URL}/vendors?status=pending&limit=100`);
      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData.data.vendors || []);
      }

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.ok) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        fetchDashboardData(); // Refresh data
      } else {
        toast.error('Failed to update user status');
      }
    } catch (err) {
      console.error('Update user status error:', err);
      toast.error('Failed to update user status');
    }
  };

  const handleEventPublish = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      const response = await apiRequest(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Event ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchDashboardData(); // Refresh data
      } else {
        toast.error('Failed to update event status');
      }
    } catch (err) {
      console.error('Update event status error:', err);
      toast.error('Failed to update event status');
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
              {value || 0}
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

  const getRoleColor = (role) => {
    const colors = {
      customer: 'primary',
      organizer: 'secondary',
      venue_manager: 'success',
      admin: 'error',
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      failed: 'error',
      completed: 'success',
      cancelled: 'error',
      published: 'success',
      draft: 'warning',
      active: 'success',
      inactive: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center">
          Loading admin dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, events, venues, and system settings
        </Typography>
      </Box>

      {/* Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon={<People />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Events"
              value={stats.total_events}
              icon={<Event />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Venues"
              value={stats.active_venues}
              icon={<LocationOn />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`$${stats.total_revenue || 0}`}
              icon={<Payment />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Users" />
          <Tab label="Events" />
          <Tab label="Venues" />
          <Tab label="Seasonal Passes" />
          <Tab label="Payments" />
          <Tab label="User Approvals" />
          <Tab label="RBAC Management" />
          <Tab label="Data Recovery" />
          <Tab label="System" />
        </Tabs>
      </Box>

      {/* Users Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Users
              </Typography>
              <Button variant="outlined" size="small">
                View All Users
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={getRoleColor(user.role)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.is_active ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color={user.is_active ? 'error' : 'success'}
                            onClick={() => handleUserStatusChange(user.id, !user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Events Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Events
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => navigate('/events/create')}
                >
                  + Add Event
                </Button>
                <Button variant="outlined" size="small">
                  View All Events
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ py: 3 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} />
              </Box>
            ) : events.length === 0 ? (
              <Alert severity="info">
                No events found. <Button size="small" onClick={() => navigate('/events/create')}>Create one now</Button>
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {event.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {event.event_type} • {event.category}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {event.organizer_first_name && event.organizer_last_name 
                              ? `${event.organizer_first_name} ${event.organizer_last_name}`
                              : 'N/A'}
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
                            <Button size="small" variant="outlined" onClick={() => navigate(`/events/${event.id}`)}>
                              View
                            </Button>
                            <Button size="small" variant="contained" sx={{ ml: 1 }} onClick={() => navigate(`/events/${event.id}/edit`)}>
                              Edit
                            </Button>
                            <Button 
                              size="small" 
                              variant="contained" 
                              color={event.status === 'draft' ? 'success' : 'warning'}
                              sx={{ ml: 1 }}
                              onClick={() => handleEventPublish(event.id, event.status)}
                            >
                              {event.status === 'draft' ? 'Publish' : 'Unpublish'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </TableContainer>
              )}
            {eventsTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={eventsTotalPages}
                  page={eventsPage}
                  onChange={(e, p) => fetchEvents(p)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Venues Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Venues
              </Typography>
              <Box>
                <Button variant="contained" size="small" onClick={() => navigate('/venues/create')}>+ Add Venue</Button>
                <Button variant="outlined" size="small" sx={{ ml: 1 }}>View All Venues</Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ py: 3 }}>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} />
              </Box>
            ) : venuesList.length === 0 ? (
              <Alert severity="info">No venues found.</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Venue</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {venuesList && venuesList.length > 0 ? (
                      venuesList.map((venue) => (
                        <TableRow key={venue.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{venue.name || venue.venue_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{venue.description?.substring(0, 60)}</Typography>
                          </TableCell>
                          <TableCell>{venue.city}, {venue.state}</TableCell>
                          <TableCell>{venue.capacity || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={venue.is_active ? 'Active' : 'Inactive'} size="small" color={venue.is_active ? 'success' : 'error'} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" onClick={() => navigate(`/venues/${venue.id}`)}>View</Button>
                            <Button size="small" variant="contained" sx={{ ml: 1 }} onClick={() => navigate(`/venues/${venue.id}/edit`)}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No venues found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {venuesTotalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={venuesTotalPages}
                  page={venuesPage}
                  onChange={(e, p) => fetchVenues(p)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

      )}

      {/* Seasonal Passes Tab (shifted index) */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Seasonal Passes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="All"
                    onClick={() => setSeasonalPassFilter('all')}
                    variant={seasonalPassFilter === 'all' ? 'filled' : 'outlined'}
                    color={seasonalPassFilter === 'all' ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Draft"
                    onClick={() => setSeasonalPassFilter('draft')}
                    variant={seasonalPassFilter === 'draft' ? 'filled' : 'outlined'}
                    color={seasonalPassFilter === 'draft' ? 'warning' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Published"
                    onClick={() => setSeasonalPassFilter('published')}
                    variant={seasonalPassFilter === 'published' ? 'filled' : 'outlined'}
                    color={seasonalPassFilter === 'published' ? 'success' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </Box>
              <Button variant="contained" size="small" onClick={() => navigate('/create-seasonal-ticket')}>
                Create Season Pass
              </Button>
            </Box>

            {seasonalTickets.filter(t => seasonalPassFilter === 'all' || (t.status || 'draft') === seasonalPassFilter).length === 0 ? (
              <Alert severity="info">
                No {seasonalPassFilter !== 'all' ? seasonalPassFilter : ''} seasonal passes found
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Season Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Events</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seasonalTickets
                      .filter(t => seasonalPassFilter === 'all' || (t.status || 'draft') === seasonalPassFilter)
                      .map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{ticket.season_type || 'N/A'}</TableCell>
                        <TableCell>${parseFloat(ticket.season_price).toFixed(2)}</TableCell>
                        <TableCell>{ticket.event_count || 0}</TableCell>
                        <TableCell>{ticket.available_quantity || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status || 'draft'}
                            size="small"
                            color={getStatusColor(ticket.status || 'draft')}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/seasonal-tickets/${ticket.id}/edit`)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/seasonal-tickets/${ticket.id}/checkout`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Payments
              </Typography>
              <Button variant="outlined" size="small">
                View All Payments
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments && payments.length > 0 ? (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {payment.reference_number}
                          </Typography>
                        </TableCell>
                        <TableCell>User #{payment.user_id.slice(0, 8)}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            size="small"
                            color={getStatusColor(payment.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No recent payments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* User Approvals Tab */}
      {activeTab === 5 && (
        <UnifiedApprovals />
      )}

      {/* RBAC Management Tab */}
      {activeTab === 6 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Role-Based Access Control (RBAC)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/admin/rbac')}
              >
                Manage RBAC
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Manage system roles, permissions, and user role assignments. Configure granular access control for all resources.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="textSecondary">Permissions</Typography>
                    <Typography variant="h6">
                      {permissions?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="textSecondary">Roles</Typography>
                    <Typography variant="h6">
                      {roles?.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Soft-Delete Recovery Tab */}
      {activeTab === 7 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
                Soft-Deleted Items Recovery
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/admin/soft-delete-recovery')}
              >
                View Deleted Items
              </Button>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Recover soft-deleted items or permanently remove them. All deletions maintain an audit trail.
            </Typography>
            <Alert severity="info">
              Items are soft-deleted by default, allowing recovery. Use permanent deletion only when necessary.
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === 8 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  System Health
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  All systems operational
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Database</Typography>
                    <Chip label="Connected" size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">API Server</Typography>
                    <Chip label="Running" size="small" color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Gateway</Typography>
                    <Chip label="Active" size="small" color="success" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Security />}
                    onClick={() => navigate('/admin/security')}
                  >
                    Security Settings
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<TrendingUp />}
                    onClick={() => navigate('/admin/analytics')}
                  >
                    Analytics Dashboard
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin/configuration')}
                  >
                    System Configuration
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<Inventory />}
                    onClick={() => navigate('/admin/merchandise')}
                  >
                    Manage Merchandise Items
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<Payment />}
                    onClick={() => navigate('/admin/merchandise-sales')}
                  >
                    View Merchandise Sales
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard;
