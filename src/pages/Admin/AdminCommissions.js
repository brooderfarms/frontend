import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Download,
  Payment,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminCommissions = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [payoutData, setPayoutData] = useState({
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: 'pending',
    vendorId: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCommissions();
      fetchVendors();
    }
  }, []);

  const fetchCommissions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      params.append('limit', '100');

      const response = await apiRequest(`${API_BASE_URL}/commissions/admin/all?${params}`);
      const data = await response.json();
      if (data.success) {
        setCommissions(data.data.commissions);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/vendors?limit=1000`);
      const data = await response.json();
      if (data.success) {
        setVendors(data.data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleCreatePayout = async () => {
    if (!selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/commissions/vendor/${selectedVendor}/payout`,
        {
          method: 'POST',
          body: JSON.stringify({
            periodStart: payoutData.periodStart,
            periodEnd: payoutData.periodEnd,
            paymentMethod: payoutData.paymentMethod,
            notes: payoutData.notes
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Payout created successfully');
        setShowPayoutDialog(false);
        setSelectedVendor(null);
        fetchCommissions();
      } else {
        toast.error(data.message || 'Failed to create payout');
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      toast.error('Failed to create payout');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchCommissions();
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.vendor_name || `Vendor #${vendorId}`;
  };

  const totalCommissionAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0);

  const totalSalesAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.sale_amount || 0), 0);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            💰 Commission Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track vendor commissions and process payouts
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Payment />}
          onClick={() => setShowPayoutDialog(true)}
        >
          Create Payout
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Pending Commission
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                ${totalCommissionAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Pending Sales
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ${totalSalesAmount.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Pending Transactions
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {commissions.filter(c => c.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Total Vendors
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {vendors.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Vendor</InputLabel>
              <Select
                value={filters.vendorId}
                onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                label="Vendor"
              >
                <MenuItem value="">All Vendors</MenuItem>
                {vendors.map(vendor => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.vendor_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Commissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell align="right"><strong>Sale Amount</strong></TableCell>
              <TableCell align="right"><strong>Commission Rate</strong></TableCell>
              <TableCell align="right"><strong>Commission Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">
                    {filters.status === 'pending' ? 'No pending commissions' : 'No commissions found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              commissions.map(commission => (
                <TableRow key={commission.id} hover>
                  <TableCell>
                    <strong>{getVendorName(commission.vendor_id)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    ${Number(commission.sale_amount).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {commission.commission_rate}%
                  </TableCell>
                  <TableCell align="right">
                    <strong>${Number(commission.commission_amount).toFixed(2)}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={commission.status}
                      size="small"
                      color={commission.status === 'paid' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onClose={() => setShowPayoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Vendor Payout</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Vendor</InputLabel>
            <Select
              value={selectedVendor || ''}
              onChange={(e) => setSelectedVendor(e.target.value)}
              label="Select Vendor"
            >
              {vendors.map(vendor => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.vendor_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Period Start"
            type="date"
            value={payoutData.periodStart}
            onChange={(e) => setPayoutData({ ...payoutData, periodStart: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Period End"
            type="date"
            value={payoutData.periodEnd}
            onChange={(e) => setPayoutData({ ...payoutData, periodEnd: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={payoutData.paymentMethod}
              onChange={(e) => setPayoutData({ ...payoutData, paymentMethod: e.target.value })}
              label="Payment Method"
            >
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="stripe">Stripe</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={payoutData.notes}
            onChange={(e) => setPayoutData({ ...payoutData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePayout} variant="contained">
            Create Payout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCommissions;
