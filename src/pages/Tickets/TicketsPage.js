import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ConfirmationNumber,
  Event,
  LocationOn,
  AccessTime,
  Cancel,
  QrCode,
  Download,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import QRCodeDisplay from '../../components/Tickets/QRCodeDisplay';
import NFCDisplay from '../../components/Tickets/NFCDisplay';
import RFIDDisplay from '../../components/Tickets/RFIDDisplay';

const TicketsPage = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [seasonalPasses, setSeasonalPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('regular');
  const [cancelDialog, setCancelDialog] = useState({ open: false, ticket: null });
  const [refundDialog, setRefundDialog] = useState({ open: false, ticket: null, reason: '' });
  const [ticketDialog, setTicketDialog] = useState({ open: false, ticket: null });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    event_id: '',
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  useEffect(() => {
    fetchSeasonalPasses();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await apiRequest(`${API_BASE_URL}/tickets?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.data.tickets);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonalPasses = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets/user/my-season-passes`);
      if (!response.ok) {
        throw new Error('Failed to fetch seasonal passes');
      }

      const data = await response.json();
      setSeasonalPasses(data.data || []);
    } catch (err) {
      console.error('Fetch seasonal passes error:', err);
      // Don't fail the whole page if seasonal passes fetch fails
      setSeasonalPasses([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const handleCancelTicket = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/${cancelDialog.ticket.id}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel ticket');
      }

      toast.success('Ticket cancelled successfully. Refund will be processed.');
      setCancelDialog({ open: false, ticket: null });
      fetchTickets(); // Refresh the list
    } catch (err) {
      console.error('Cancel ticket error:', err);
      toast.error(err.message || 'Failed to cancel ticket');
    }
  };

  const handleRequestRefund = async () => {
    if (!refundDialog.reason) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/${refundDialog.ticket.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundDialog.reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request refund');
      }

      toast.success('Refund request submitted! You will be notified once it is processed.');
      setRefundDialog({ open: false, ticket: null, reason: '' });
      fetchTickets();
    } catch (err) {
      console.error('Refund request error:', err);
      toast.error(err.message || 'Failed to request refund');
    }
  };

  const handleViewTicket = async (ticket) => {
    // For digital tickets, show the ticket display dialog
    if (ticket.ticket_format === 'digital') {
      setTicketDialog({ open: true, ticket });
    } else {
      // For physical tickets, show basic info
      toast.success('Physical ticket - Please bring your printed ticket to the event');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      reserved: 'warning',
      used: 'info',
      cancelled: 'error',
      refunded: 'secondary',
      expired: 'default',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelTicket = (ticket) => {
    const eventDate = new Date(ticket.event_start_date);
    const now = new Date();
    return ticket.status === 'confirmed' && eventDate > now;
  };

  const LoadingSkeleton = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={36} />
                  <Skeleton variant="rectangular" width={80} height={36} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          My Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your event tickets and reservations
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Event ID (optional)"
              value={filters.event_id}
              onChange={(e) => handleFilterChange('event_id', e.target.value)}
              placeholder="Filter by specific event"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setFilters({
                page: 1,
                limit: 10,
                status: '',
                event_id: '',
              })}
              sx={{ height: 56 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Regular Tickets" value="regular" />
          <Tab label={`Season Passes (${seasonalPasses.length})`} value="seasonal" />
        </Tabs>
      </Box>

      {/* Regular Tickets Tab */}
      {activeTab === 'regular' && (
        <>
          {loading ? (
            <LoadingSkeleton />
          ) : tickets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ConfirmationNumber sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No tickets found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't purchased any tickets yet. Browse events to get started.
              </Typography>
              <Button variant="contained" href="/events">
                Browse Events
              </Button>
            </Box>
          ) : (
            <>
              {/* Mobile View */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {tickets.map((ticket) => (
              <Card key={ticket.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ticket.ticket_number}
                      </Typography>
                      <Chip
                        label={ticket.status}
                        size="small"
                        color={getStatusColor(ticket.status)}
                      />
                    </Box>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${ticket.total_amount}
                    </Typography>
                  </Box>

                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {ticket.event_title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">
                      {formatDate(ticket.event_start_date)}
                    </Typography>
                  </Box>

                  {ticket.seat_number && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">
                        Seat: {ticket.seat_row}{ticket.seat_number}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {ticket.has_streaming_access && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<QrCode />}
                        onClick={() => navigate(`/stream/${ticket.id}`)}
                      >
                        Watch Stream
                      </Button>
                    )}

                    {ticket.status === 'confirmed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<QrCode />}
                        onClick={() => handleViewTicket(ticket)}
                      >
                        QR Code
                      </Button>
                    )}

                    {canCancelTicket(ticket) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => setCancelDialog({ open: true, ticket })}
                      >
                        Cancel
                      </Button>
                    )}

                    {(ticket.status === 'confirmed' || ticket.status === 'used') && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => setRefundDialog({ ...refundDialog, open: true, ticket })}
                      >
                        Request Refund
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={() => {
                        navigator.share?.({
                          title: `Ticket: ${ticket.ticket_number}`,
                          text: `My ticket for ${ticket.event_title}`,
                          url: window.location.href,
                        }) || navigator.clipboard.writeText(window.location.href);
                        toast.success('Ticket link copied');
                      }}
                    >
                      Share
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Desktop View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket Number</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Seat</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {ticket.ticket_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{ticket.event_title}</TableCell>
                      <TableCell>{formatDate(ticket.event_start_date)}</TableCell>
                      <TableCell>
                        {ticket.seat_number ? `${ticket.seat_row}${ticket.seat_number}` : 'N/A'}
                      </TableCell>
                      <TableCell>${ticket.total_amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          size="small"
                          color={getStatusColor(ticket.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {ticket.status === 'confirmed' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<QrCode />}
                              onClick={() => handleViewTicket(ticket)}
                            >
                              QR
                            </Button>
                          )}

                          {ticket.has_streaming_access && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<QrCode />}
                              onClick={() => navigate(`/stream/${ticket.id}`)}
                            >
                              Watch Stream
                            </Button>
                          )}

                          {canCancelTicket(ticket) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => setCancelDialog({ open: true, ticket })}
                            >
                              Cancel
                            </Button>
                          )}

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Share />}
                            onClick={() => {
                              navigator.share?.({
                                title: `Ticket: ${ticket.ticket_number}`,
                                text: `My ticket for ${ticket.event_title}`,
                                url: window.location.href,
                              }) || navigator.clipboard.writeText(window.location.href);
                              toast.success('Ticket link copied');
                            }}
                          >
                            Share
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                >
                  Previous
                </Button>
                <Typography sx={{ alignSelf: 'center', mx: 2 }}>
                  Page {pagination.page} of {pagination.pages}
                </Typography>
                <Button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </>
        )}
      </>
      )}
      {/* Seasonal Passes Tab */}
      {activeTab === 'seasonal' && (
        <>
          {seasonalPasses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Event sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No season passes yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Get unlimited access to your favorite events with season passes.
              </Typography>
              <Button variant="contained" href="/seasonal-tickets">
                Browse Season Passes
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {seasonalPasses.map((pass) => (
                <Grid item xs={12} sm={6} md={4} key={pass.purchase_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {pass.image_url && (
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          backgroundImage: `url(${pass.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    )}
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {pass.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        {pass.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`${pass.season_type.replace('-', ' ').toUpperCase()} ${pass.season_year}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={`${pass.total_events} Events`}
                          size="small"
                          color="primary"
                        />
                      </Box>

                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Purchase Reference
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {pass.reference_code}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/seasonal-tickets/${pass.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Cancel Ticket Dialog */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, ticket: null })}>
        <DialogTitle>Cancel Ticket</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to cancel this ticket? This action cannot be undone.
          </Typography>
          {cancelDialog.ticket && (
            <Box>
              <Typography variant="body2">
                <strong>Ticket:</strong> {cancelDialog.ticket.ticket_number}
              </Typography>
              <Typography variant="body2">
                <strong>Event:</strong> {cancelDialog.ticket.event_title}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> ${cancelDialog.ticket.total_amount}
              </Typography>
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            Refund will be processed according to the event's refund policy.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, ticket: null })}>
            Keep Ticket
          </Button>
          <Button onClick={handleCancelTicket} variant="contained" color="error">
            Cancel Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ ...refundDialog, open: false, reason: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {refundDialog.ticket && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Ticket:</strong> {refundDialog.ticket.ticket_number}
                  <br />
                  <strong>Amount:</strong> ${refundDialog.ticket.total_amount}
                </Alert>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Refund"
                  placeholder="Please explain why you are requesting a refund..."
                  value={refundDialog.reason}
                  onChange={(e) => setRefundDialog({ ...refundDialog, reason: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Alert severity="warning">
                  Refund requests are reviewed by our team and processed according to the event's refund policy. You will receive an email notification with the decision.
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog({ ...refundDialog, open: false, reason: '' })}>
            Cancel
          </Button>
          <Button onClick={handleRequestRefund} variant="contained" color="warning">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={ticketDialog.open} onClose={() => setTicketDialog({ open: false, ticket: null })} maxWidth="sm">
        <DialogTitle>
          {ticketDialog.ticket?.ticket_format === 'digital'
            ? `${ticketDialog.ticket?.digital_format?.replace('_', ' ').toUpperCase()} Ticket`
            : 'Physical Ticket'
          } - {ticketDialog.ticket?.ticket_number}
        </DialogTitle>
        <DialogContent>
          {ticketDialog.ticket && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {ticketDialog.ticket.ticket_number}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {ticketDialog.ticket.event_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatDate(ticketDialog.ticket.event_start_date)}
              </Typography>

              {/* Display appropriate ticket format component */}
              {ticketDialog.ticket.digital_format === 'qr_code' && (
                <QRCodeDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'nfc' && (
                <NFCDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'rfid' && (
                <RFIDDisplay ticket={ticketDialog.ticket} />
              )}

              {ticketDialog.ticket.digital_format === 'barcode' && (
                <Paper sx={{ p: 3, textAlign: 'center', mt: 2, mx: 'auto', maxWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Barcode Ticket
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '1.5rem',
                      letterSpacing: 2,
                      fontWeight: 'bold',
                      bgcolor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {ticketDialog.ticket.qr_code_data || ticketDialog.ticket.ticket_number}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Show this barcode at the event entrance for validation.
                  </Alert>
                </Paper>
              )}

              {ticketDialog.ticket.ticket_format === 'physical' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Physical Ticket</strong>
                  </Typography>
                  <Typography variant="body2">
                    Your physical ticket has been mailed to your registered address.
                    Please bring it to the event for validation.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog({ open: false, ticket: null })}>
            Close
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketsPage;
