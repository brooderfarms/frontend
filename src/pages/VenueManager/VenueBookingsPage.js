import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  Download,
  FilterList,
  Search,
  Receipt,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3800/api';

const VenueBookingsPage = () => {
  const { apiRequest, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    fetchVenuesAndBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedVenue, selectedStatus, searchTerm]);

  const fetchVenuesAndBookings = async () => {
    try {
      setLoading(true);

      // Fetch venues managed by this user
      const venuesResponse = await apiRequest(`${API_BASE_URL}/venues?manager_id=${user.id}`);
      if (venuesResponse.ok) {
        const venuesData = await venuesResponse.json();
        const managedVenues = venuesData.data.venues || [];
        setVenues(managedVenues);

        // Fetch bookings for all managed venues
        const allBookings = [];
        let totalRevenue = 0;
        let confirmedCount = 0;
        let pendingCount = 0;

        for (const venue of managedVenues) {
          try {
            const bookingsResponse = await apiRequest(
              `${API_BASE_URL}/venues/${venue.id}/bookings`
            );
            if (bookingsResponse.ok) {
              const bookingsData = await bookingsResponse.json();
              const venueBookings = (bookingsData.data || []).map(booking => ({
                ...booking,
                venue_name: venue.name,
                venue_id: venue.id,
              }));
              allBookings.push(...venueBookings);

              // Calculate stats
              venueBookings.forEach(booking => {
                totalRevenue += booking.total_price || 0;
                if (booking.status === 'confirmed') confirmedCount++;
                if (booking.status === 'pending') pendingCount++;
              });
            }
          } catch (err) {
            console.error(`Failed to fetch bookings for venue ${venue.id}:`, err);
          }
        }

        setBookings(allBookings);
        setStats({
          totalBookings: allBookings.length,
          totalRevenue,
          confirmedBookings: confirmedCount,
          pendingBookings: pendingCount,
        });
      } else {
        toast.error('Failed to fetch venues');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedVenue) {
      filtered = filtered.filter(b => b.venue_id === selectedVenue);
    }

    if (selectedStatus) {
      filtered = filtered.filter(b => b.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.customer_name?.toLowerCase().includes(term) ||
          b.customer_email?.toLowerCase().includes(term) ||
          b.booking_id?.toLowerCase().includes(term) ||
          b.event_title?.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsDialogOpen(true);
  };

  const handleDownloadReceipt = (bookingId) => {
    window.open(`${API_BASE_URL}/venues/bookings/${bookingId}/receipt`, '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      refunded: 'info',
    };
    return colors[status] || 'default';
  };

  const StatCard = ({ title, value, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {typeof value === 'number' && title.includes('Revenue')
            ? `$${value.toFixed(2)}`
            : value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Venue Bookings Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all bookings across your venues
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Bookings" value={stats.totalBookings} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Confirmed Bookings"
            value={stats.confirmedBookings}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              label="Search"
              placeholder="Booking ID, customer name, event..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Venue</InputLabel>
              <Select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                label="Venue"
              >
                <MenuItem value="">All Venues</MenuItem>
                {venues.map(venue => (
                  <MenuItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSelectedVenue('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      {filteredBookings.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Venue</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map(booking => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.booking_id || booking.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {booking.customer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.customer_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{booking.event_title || 'N/A'}</TableCell>
                  <TableCell>{booking.venue_name}</TableCell>
                  <TableCell align="right">
                    ${(booking.total_price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.payment_status || 'pending'}
                      color={getPaymentStatusColor(booking.payment_status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(booking)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Receipt />}
                      onClick={() => handleDownloadReceipt(booking.id)}
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No bookings found</Alert>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Booking ID
                </Typography>
                <Typography variant="body2">{selectedBooking.booking_id || selectedBooking.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Customer
                </Typography>
                <Typography variant="body2">{selectedBooking.customer_name}</Typography>
                <Typography variant="caption">{selectedBooking.customer_email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Event
                </Typography>
                <Typography variant="body2">{selectedBooking.event_title}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Venue
                </Typography>
                <Typography variant="body2">{selectedBooking.venue_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Booking Date
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedBooking.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${(selectedBooking.total_price || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedBooking.status}
                  color={getStatusColor(selectedBooking.status)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  label={selectedBooking.payment_status || 'pending'}
                  color={getPaymentStatusColor(selectedBooking.payment_status)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VenueBookingsPage;
