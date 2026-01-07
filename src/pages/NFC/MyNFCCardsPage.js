import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  CreditCard,
  Add,
  Delete,
  Refresh,
  History,
  TrendingDown,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MyNFCCardsPage = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addBalanceDialog, setAddBalanceDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/nfc/my-cards`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        setCards(data.cards || []);
      } else {
        toast.error(data.error || 'Failed to load cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Error loading NFC cards');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCard = async (cardId) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/nfc/${cardId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Card activated successfully!');
        fetchCards();
        setDialogOpen(false);
      } else {
        toast.error(data.error || 'Failed to activate card');
      }
    } catch (error) {
      console.error('Error activating card:', error);
      toast.error('Error activating card');
    }
  };

  const handleAddBalance = async () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await apiRequest(`${API_BASE_URL}/nfc/${selectedCard.id}/add-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(balanceAmount) }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Balance added successfully!');
        setBalanceAmount('');
        setAddBalanceDialog(false);
        fetchCards();
      } else {
        toast.error(data.error || 'Failed to add balance');
      }
    } catch (error) {
      console.error('Error adding balance:', error);
      toast.error('Error adding balance');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle fontSize="small" />;
      case 'inactive':
        return <Refresh fontSize="small" />;
      default:
        return <Error fontSize="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            My NFC/RFID Cards
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your reusable NFC and RFID cards for events and venues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          href="/checkout?product=nfc-card"
        >
          Purchase Card
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : cards.length === 0 ? (
        <Alert severity="info">
          You don't have any NFC/RFID cards yet. Purchase one to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} md={6} key={card.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                {/* Card Status Badge */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                  <Chip
                    icon={getStatusIcon(card.status)}
                    label={card.status.toUpperCase()}
                    color={getStatusColor(card.status)}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <CardContent>
                  {/* Card Number & Type */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <CreditCard sx={{ color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', textMonoSpace: true }}>
                        {card.card_number}
                      </Typography>
                    </Box>
                    <Chip
                      label={card.card_type.toUpperCase()}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Balance Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Available Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                      ${Number(card.balance).toFixed(2)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((card.balance / 100) * 100, 100)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedCard(card);
                        setAddBalanceDialog(true);
                      }}
                      fullWidth
                    >
                      Add Balance
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Times Used
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {card.times_used || 0}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Spent
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          ${Number(card.total_spent || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Created Date */}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created: {new Date(card.created_at).toLocaleDateString()}
                  </Typography>
                  {card.activated_at && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Activated: {new Date(card.activated_at).toLocaleDateString()}
                    </Typography>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    {card.status === 'inactive' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedCard(card);
                          handleActivateCard(card.id);
                        }}
                        fullWidth
                      >
                        Activate Card
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<History />}
                      onClick={() => {
                        setSelectedCard(card);
                        setDialogOpen(true);
                      }}
                    >
                      History
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Transaction History Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transaction History</DialogTitle>
        <DialogContent>
          {selectedCard?.recent_transactions && selectedCard.recent_transactions.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCard.recent_transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.transaction_type}</TableCell>
                      <TableCell align="right">${Number(tx.amount).toFixed(2)}</TableCell>
                      <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No transactions yet
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Balance Dialog */}
      <Dialog open={addBalanceDialog} onClose={() => setAddBalanceDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Balance to {selectedCard?.card_number}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current balance: ${Number(selectedCard?.balance || 0).toFixed(2)}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Amount"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            placeholder="0.00"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBalanceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBalance} variant="contained">
            Add Balance
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyNFCCardsPage;
