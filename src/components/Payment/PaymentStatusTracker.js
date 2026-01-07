import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
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
  DialogActions
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

const PaymentStatusTracker = ({ transactionId, autoRefresh = true }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    data: null
  });

  useEffect(() => {
    fetchTransaction();

    // Auto-refresh every 5 seconds if status is pending
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (transaction?.status === 'pending' || transaction?.status === 'processing') {
          fetchTransaction(true);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transactionId, transaction?.status]);

  const fetchTransaction = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await apiRequest(
        `${API_BASE_URL}/payments/${transactionId}`
      );

      if (!response.ok) throw new Error('Failed to fetch transaction');

      const { data } = await response.json();
      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      if (!isRefresh) {
        toast.error('Failed to load transaction details');
      }
    } finally {
      if (!isRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'info';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ mr: 1, color: 'green' }} />;
      case 'processing':
        return <ScheduleIcon sx={{ mr: 1, color: 'orange' }} />;
      case 'pending':
        return <ScheduleIcon sx={{ mr: 1, color: 'blue' }} />;
      case 'failed':
        return <ErrorIcon sx={{ mr: 1, color: 'red' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Payment Completed';
      case 'processing':
        return 'Processing...';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Alert severity="error">
        Transaction not found
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Payment Status</Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchTransaction(true)}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getStatusIcon(transaction.status)}
            <Chip
              label={getStatusText(transaction.status)}
              color={getStatusColor(transaction.status)}
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Status Timeline */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Timeline
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ✓ Transaction Created: {new Date(transaction.created_at).toLocaleString()}
            </Typography>
            {transaction.completed_at && (
              <Typography variant="body2" color="textSecondary">
                ✓ Transaction Completed: {new Date(transaction.completed_at).toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Error Message */}
          {transaction.failure_reason && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Failure Reason
              </Typography>
              <Typography variant="body2">
                {transaction.failure_reason}
              </Typography>
            </Alert>
          )}

          {/* Success Message */}
          {transaction.status === 'completed' && (
            <Alert severity="success">
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Payment Successful! 🎉
              </Typography>
              <Typography variant="body2">
                Your transaction has been processed successfully. Your tickets will be sent to your email.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {transaction.id}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reference Number</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {transaction.reference_number || '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Payment Method</TableCell>
              <TableCell>
                {transaction.payment_method_code?.toUpperCase() || '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {transaction.currency} {transaction.amount?.toLocaleString('en-ZW', { minimumFractionDigits: 2 }) || '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(transaction.status)}
                  color={getStatusColor(transaction.status)}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Gateway Transaction ID</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {transaction.gateway_transaction_id || '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>
                {new Date(transaction.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
            {transaction.completed_at && (
              <TableRow>
                <TableCell>Completed</TableCell>
                <TableCell>
                  {new Date(transaction.completed_at).toLocaleString()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Details Button */}
      <Box sx={{ mt: 2 }}>
        <Button
          size="small"
          onClick={() => setDetailsDialog({
            open: true,
            data: transaction.gateway_response ? JSON.parse(transaction.gateway_response) : null
          })}
        >
          View Full Details
        </Button>
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() => setDetailsDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gateway Response Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {detailsDialog.data ? (
              JSON.stringify(detailsDialog.data, null, 2)
            ) : (
              'No gateway response data available'
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog({ open: false, data: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentStatusTracker;
