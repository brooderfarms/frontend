import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  MoreVert,
  Edit,
  Visibility,
  LocalShipping,
  CheckCircle,
  Pending,
  TrendingUp,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MerchandiseSales = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/merchandise/orders?limit=100`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await apiRequest(url);
      if (response.ok) {
        const data = await response.json();
        // Admin can see all orders
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/merchandise/orders?limit=1000`);
      if (response.ok) {
        const data = await response.json();
        const allOrders = data.data || [];

        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const pendingCount = allOrders.filter(o => o.status === 'pending').length;
        const deliveredCount = allOrders.filter(o => o.status === 'delivered').length;
        const replacementCount = allOrders.filter(o => o.original_order_id).length;

        setStats({
          totalRevenue,
          totalOrders: allOrders.length,
          pendingOrders: pendingCount,
          deliveredOrders: deliveredCount,
          replacementRequests: replacementCount,
          penaltyRevenue: allOrders.reduce((sum, order) => sum + (order.penalty_cost || 0), 0)
        });
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await apiRequest(
        `${API_BASE_URL}/merchandise/orders/${selectedOrder.id}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        toast.success('Order status updated');
        setOpenStatusDialog(false);
        fetchOrders();
        fetchStats();
        setOpenDetailsDialog(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Error updating order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'info',
      production: 'primary',
      ready: 'secondary',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const statuses = ['pending', 'approved', 'production', 'ready', 'shipped', 'delivered', 'cancelled'];

  if (loading && !stats) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Merchandise Sales
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage all merchandise orders from organizers and venue managers
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Inventory />}
          onClick={() => navigate('/admin/merchandise')}
          sx={{ mt: 1 }}
        >
          Manage Items
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Total Revenue
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${stats.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Total Orders
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {stats.totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Delivered
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {stats.deliveredOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Pending sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {stats.pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Replacements
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                  {stats.replacementRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="body2" color="textSecondary">
                    Penalty Fees
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${stats.penaltyRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Status</MenuItem>
            {statuses.map(status => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
            <Typography color="textSecondary">
              No orders found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {order.order_number}
                    {order.original_order_id && (
                      <Chip label="REPLACEMENT" size="small" color="warning" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.user_id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.metadata?.item_count || '?'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(order)}
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

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedOrder && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Order Information
                </Typography>
                <Typography variant="body2">Order #: {selectedOrder.order_number}</Typography>
                <Typography variant="body2">Status: {selectedOrder.status}</Typography>
                <Typography variant="body2">
                  Created: {new Date(selectedOrder.created_at).toLocaleDateString()}
                </Typography>
                {selectedOrder.original_order_id && (
                  <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                    ⚠️ This is a REPLACEMENT order
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">${selectedOrder.subtotal.toFixed(2)}</Typography>
                </Box>
                {selectedOrder.penalty_cost > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'error.main' }}>Penalty Fee:</Typography>
                    <Typography variant="body2" sx={{ color: 'error.main' }}>${selectedOrder.penalty_cost.toFixed(2)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">${selectedOrder.shipping_cost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #ddd' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${selectedOrder.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Delivery Address
                </Typography>
                <Typography variant="body2">{selectedOrder.delivery_address}</Typography>
                <Typography variant="body2">
                  {selectedOrder.delivery_city}, {selectedOrder.delivery_country}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          <Button
            onClick={() => {
              setNewStatus(selectedOrder.status);
              setOpenStatusDialog(true);
            }}
            variant="contained"
            color="primary"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statuses.map(status => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MerchandiseSales;
