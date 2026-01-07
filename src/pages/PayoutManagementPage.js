import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SendIcon from '@mui/icons-material/Send';

const PayoutManagementPage = () => {
  const { user, apiRequest, API_BASE_URL, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [requestDialog, setRequestDialog] = useState({
    open: false,
    amount: '',
    notes: ''
  });

  // Refresh user once on mount (avoid causing a user-state loop)
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user's role or approval status changes, fetch payment data
  useEffect(() => {
    if (['organizer', 'venue_manager'].includes(user?.role) && user?.approval_status === 'approved') {
      fetchPaymentInfo();
      fetchPayoutHistory();
    }
    // Only depend on role and approval_status to avoid unnecessary loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, user?.approval_status]);

  // Helper function to ensure numeric values
  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/payouts/info`);

      if (!response.ok) throw new Error('Failed to fetch payment info');

      const { data } = await response.json();
      // Ensure all numeric fields are actually numbers
      const paymentData = {
        ...data,
        total_earnings: toNumber(data?.total_earnings),
        pending_balance: toNumber(data?.pending_balance),
        total_payouts: toNumber(data?.total_payouts),
        minimum_payout_amount: toNumber(data?.minimum_payout_amount),
      };
      setPaymentInfo(paymentData);
    } catch (error) {
      console.error('Error fetching payment info:', error);
      toast.error('Failed to fetch payment information');
    }
  };

  const fetchPayoutHistory = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/payouts/history`);

      if (!response.ok) throw new Error('Failed to fetch payout history');

      const { data } = await response.json();
      // Ensure all amounts are numbers
      const historyData = data?.map(payout => ({
        ...payout,
        amount: toNumber(payout?.amount),
      })) || [];
      setPayoutHistory(historyData);
    } catch (error) {
      console.error('Error fetching payout history:', error);
      toast.error('Failed to fetch payout history');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestDialog = () => {
    setRequestDialog({ open: true, amount: '', notes: '' });
  };

  const handleCloseRequestDialog = () => {
    setRequestDialog({ open: false, amount: '', notes: '' });
  };

  const handleRequestPayout = async () => {
    if (!requestDialog.amount || parseFloat(requestDialog.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/payouts/request`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(requestDialog.amount),
          notes: requestDialog.notes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request payout');
      }

      toast.success('Payout request submitted successfully');
      handleCloseRequestDialog();
      fetchPayoutHistory();
      fetchPaymentInfo();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'info',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error',
      'rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  };

  if (!['organizer', 'venue_manager'].includes(user?.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          Payout management is only available for organizers and venue managers.
        </Alert>
      </Container>
    );
  }

  // Check if user has been approved
  if (user?.approval_status !== 'approved') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Approval Pending
          </Typography>
          <Typography variant="body2">
            Your account is still pending admin approval. You'll be able to manage payouts once approved.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
            Current Status: <strong>{user?.approval_status || 'pending'}</strong>
          </Typography>
        </Alert>
      </Container>
    );
  }

  const canRequestPayout = paymentInfo?.payment_verification_status === 'verified';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Payout Management
      </Typography>

      {/* Financial Overview Cards */}
      {paymentInfo && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Earnings
                    </Typography>
                    <Typography variant="h6">
                      ${paymentInfo.total_earnings?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Pending Balance
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      ${paymentInfo.pending_balance?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  <MonetizationOnIcon sx={{ color: 'success.main', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      Total Payouts
                    </Typography>
                    <Typography variant="h6">
                      ${paymentInfo.total_payouts?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                  <AccountBalanceIcon sx={{ color: 'info.main', fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Verification Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={
                        paymentInfo.payment_verification_status === 'verified'
                          ? 'Verified'
                          : paymentInfo.payment_verification_status === 'pending'
                          ? 'Pending'
                          : 'Not Verified'
                      }
                      color={
                        paymentInfo.payment_verification_status === 'verified'
                          ? 'success'
                          : paymentInfo.payment_verification_status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Payment Not Verified Alert */}
      {paymentInfo?.payment_verification_status !== 'verified' && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Your payment information must be verified before you can request payouts.
          Go to <strong>Payment Information</strong> to set up your bank details.
        </Alert>
      )}

      {/* Request Payout Button */}
      {canRequestPayout && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleOpenRequestDialog}
            disabled={paymentInfo.pending_balance < paymentInfo.minimum_payout_amount}
          >
            Request Payout
          </Button>
          {paymentInfo.pending_balance < paymentInfo.minimum_payout_amount && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'textSecondary' }}>
              Minimum payout amount: ${paymentInfo.minimum_payout_amount?.toFixed(2)}
            </Typography>
          )}
        </Box>
      )}

      {/* Payout History */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Payout History
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : payoutHistory.length === 0 ? (
        <Alert severity="info">No payout history yet</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Requested</strong></TableCell>
                <TableCell><strong>Completed</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payoutHistory.map(payout => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${payout.amount?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(payout.status)}
                      color={getStatusColor(payout.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payout.payment_method?.replace('_', ' ') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {payout.created_at ? new Date(payout.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {payout.completed_at ? new Date(payout.completed_at).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Payout Dialog */}
      <Dialog open={requestDialog.open} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={requestDialog.amount}
            onChange={(e) => setRequestDialog({ ...requestDialog, amount: e.target.value })}
            inputProps={{ step: '0.01', min: '0' }}
            helperText={
              paymentInfo
                ? `Minimum: $${paymentInfo.minimum_payout_amount}, Available: $${paymentInfo.pending_balance?.toFixed(2)}`
                : ''
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={requestDialog.notes}
            onChange={(e) => setRequestDialog({ ...requestDialog, notes: e.target.value })}
            placeholder="Add any notes about this payout request..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog}>Cancel</Button>
          <Button
            onClick={handleRequestPayout}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Request Payout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PayoutManagementPage;
