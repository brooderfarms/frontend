import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  SendToMobile,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TicketTransferPage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [transferDialog, setTransferDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's tickets
      const ticketsRes = await apiRequest(`${API_BASE_URL}/tickets`);
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.data || []);

      // Fetch transfer history
      const transfersRes = await apiRequest(`${API_BASE_URL}/tickets/${tickets[0]?.id}/transfer-history`);
      const transfersData = await transfersRes.json();
      setTransfers(transfersData.data || []);

      // Fetch pending transfers
      const pendingRes = await apiRequest(`${API_BASE_URL}/tickets/transfers/pending`);
      const pendingData = await pendingRes.json();
      setPendingTransfers(pendingData.data || []);
    } catch (err) {
      console.error('Fetch transfers error:', err);
      toast.error('Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = async () => {
    if (!selectedTicket || !recipientEmail) {
      toast.error('Please select a ticket and enter recipient email');
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/transfer/initiate`, {
        method: 'POST',
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          recipient_email: recipientEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success('Transfer initiated! Waiting for recipient to accept.');
      setTransferDialog(false);
      setRecipientEmail('');
      setSelectedTicket(null);
      fetchData();
    } catch (err) {
      console.error('Transfer error:', err);
      toast.error(err.message || 'Failed to initiate transfer');
    }
  };

  const handleAcceptTransfer = async (transferId) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/transfer/${transferId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success('Transfer accepted!');
      fetchData();
    } catch (err) {
      console.error('Accept transfer error:', err);
      toast.error(err.message || 'Failed to accept transfer');
    }
  };

  const handleDeclineTransfer = async (transferId) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/tickets/transfer/${transferId}/decline`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success('Transfer declined');
      fetchData();
    } catch (err) {
      console.error('Decline transfer error:', err);
      toast.error(err.message || 'Failed to decline transfer');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      accepted: 'success',
      declined: 'error',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Pending />,
      accepted: <CheckCircle />,
      declined: <Cancel />,
      completed: <CheckCircle />,
    };
    return icons[status];
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
        Transfer Tickets
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Transfer your tickets to friends or family
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Transfer Ticket" />
        <Tab label="Incoming Transfers" icon={<Pending />} />
        <Tab label="Transfer History" />
      </Tabs>

      {/* Tab 1: Transfer Ticket */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Your Tickets ({tickets.length})
          </Typography>
          <Grid container spacing={2}>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Grid item xs={12} md={6} key={ticket.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {ticket.event_title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ticket #{ticket.ticket_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Type: <Chip label={ticket.ticket_type} size="small" />
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Status: <Chip label={ticket.status} size="small" color={getStatusColor(ticket.status)} />
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<SendToMobile />}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setTransferDialog(true);
                          }}
                          disabled={ticket.status !== 'confirmed'}
                        >
                          Transfer
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Alert severity="info">You don't have any tickets yet.</Alert>
            )}
          </Grid>
        </Box>
      )}

      {/* Tab 2: Incoming Transfers */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Pending Transfers ({pendingTransfers.length})
          </Typography>
          {pendingTransfers.length > 0 ? (
            <List>
              {pendingTransfers.map((transfer, idx) => (
                <React.Fragment key={transfer.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <ListItemText
                        primary={transfer.event_title}
                        secondary={`From: ${transfer.from_user_email} | Ticket: ${transfer.ticket_number}`}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAcceptTransfer(transfer.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeclineTransfer(transfer.id)}
                      >
                        Decline
                      </Button>
                    </Box>
                  </ListItem>
                  {idx < pendingTransfers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">No pending transfers.</Alert>
          )}
        </Box>
      )}

      {/* Tab 3: Transfer History */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Transfer History
          </Typography>
          {transfers.length > 0 ? (
            <List>
              {transfers.map((transfer, idx) => (
                <React.Fragment key={transfer.id}>
                  <ListItem sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {getStatusIcon(transfer.status)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1">
                          {transfer.from_user_email} → {transfer.to_user_email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transfer.event_title} | {new Date(transfer.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip label={transfer.status} color={getStatusColor(transfer.status)} />
                    </Box>
                  </ListItem>
                  {idx < transfers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">No transfer history.</Alert>
          )}
        </Box>
      )}

      {/* Transfer Dialog */}
      <Dialog open={transferDialog} onClose={() => setTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedTicket && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Transferring: <strong>{selectedTicket.event_title}</strong>
                </Alert>
                <TextField
                  fullWidth
                  label="Recipient Email Address"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog(false)}>Cancel</Button>
          <Button onClick={handleInitiateTransfer} variant="contained">
            Send Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TicketTransferPage;
