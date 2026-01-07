import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Cancel,
  WarningAmber,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MerchandiseOrders = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openReplacementDialog, setOpenReplacementDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [replacementReason, setReplacementReason] = useState('Lost item');
  const [penaltyMultiplier, setPenaltyMultiplier] = useState(1.15);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/merchandise/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/merchandise/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.data);
        setOpenDetailsDialog(true);
      }
    } catch (err) {
      console.error('Fetch order details error:', err);
      toast.error('Failed to load order details');
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await apiRequest(
        `${API_BASE_URL}/merchandise/orders/${selectedOrder.id}/cancel`,
        { method: 'POST' }
      );

      if (response.ok) {
        toast.success('Order cancelled successfully');
        setOpenCancelDialog(false);
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error('Error cancelling order');
    }
  };

  const handleRequestReplacement = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to replace');
      return;
    }

    try {
      const items = selectedItems.map(itemId => ({
        item_id: itemId,
        quantity: 1
      }));

      const response = await apiRequest(
        `${API_BASE_URL}/merchandise/orders/${selectedOrder.id}/request-replacement`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            reason: replacementReason,
            penalty_multiplier: penaltyMultiplier
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Replacement order created successfully');
        setOpenReplacementDialog(false);
        setSelectedItems([]);
        setReplacementReason('Lost item');
        setPenaltyMultiplier(1.15);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to create replacement order');
      }
    } catch (err) {
      console.error('Replacement request error:', err);
      toast.error('Error creating replacement order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'warning',
      approved: 'info',
      production: 'primary',
      ready: 'success',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Merchandise Orders
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your merchandise orders and shipments
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCart />}
          onClick={() => navigate('/merchandise/store')}
        >
          Order More
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingCart sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              No orders yet. Start ordering merchandise for your events!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/merchandise/store')}
            >
              Browse Merchandise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Order Number</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Items</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{order.order_number}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.metadata?.item_count || '?'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      color={getStatusColor(order.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(order.id)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    {['draft', 'pending'].includes(order.status) && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpenCancelDialog(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order Details Dialog */}
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
              </Box>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Items ({selectedOrder.items.length})
                  </Typography>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Unit Price: ${item.unit_price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Subtotal: ${(item.quantity * item.unit_price).toFixed(2)}
                      </Typography>
                      {item.custom_text && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          Custom Text: {item.custom_text}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Delivery Address
                </Typography>
                <Typography variant="body2">{selectedOrder.delivery_address}</Typography>
                <Typography variant="body2">
                  {selectedOrder.delivery_city}, {selectedOrder.delivery_country} {selectedOrder.delivery_postal_code}
                </Typography>
              </Box>

              <Box sx={{ mb: 3, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">${selectedOrder.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Customization:</Typography>
                  <Typography variant="body2">${selectedOrder.customization_cost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">${selectedOrder.shipping_cost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">${selectedOrder.tax.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #ddd' }}>
                  <Typography sx={{ fontWeight: 'bold' }}>Total:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${selectedOrder.total_amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {selectedOrder.shipping_tracking_number && (
                <Alert severity="info">
                  Tracking Number: {selectedOrder.shipping_tracking_number}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          {selectedOrder?.status === 'delivered' && !selectedOrder?.metadata?.is_replacement && (
            <Button 
              onClick={() => {
                setSelectedItems(selectedOrder?.items?.map(item => item.id) || []);
                setOpenReplacementDialog(true);
              }}
              color="warning"
              variant="contained"
              startIcon={<WarningAmber />}
            >
              Request Replacement
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Replacement Request Dialog */}
      <Dialog open={openReplacementDialog} onClose={() => setOpenReplacementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber color="warning" />
          Request Item Replacement
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedOrder && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                A penalty fee of {((penaltyMultiplier - 1) * 100).toFixed(0)}% will be added to the replacement cost.
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Select Items to Replace:
                </Typography>
                {selectedOrder.items?.map((item) => (
                  <Box 
                    key={item.id}
                    sx={{ 
                      p: 1.5, 
                      border: '1px solid #ddd', 
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedItems.includes(item.id) ? '#fff3e0' : '#f9f9f9',
                      borderColor: selectedItems.includes(item.id) ? '#ff9800' : '#ddd'
                    }}
                    onClick={() => {
                      setSelectedItems(prev => 
                        prev.includes(item.id) 
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)}
                        onChange={() => {}}
                        style={{ cursor: 'pointer' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qty: {item.quantity} × ${item.unit_price.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Reason for Replacement:
                </Typography>
                <select 
                  value={replacementReason} 
                  onChange={(e) => setReplacementReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="Lost item">Lost item</option>
                  <option value="Damaged item">Damaged item</option>
                  <option value="Defective item">Defective item</option>
                  <option value="Worn out">Worn out</option>
                  <option value="Other">Other</option>
                </select>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Penalty Multiplier:
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  1.0 = No penalty | 1.15 (Default) = 15% penalty
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.0" 
                    step="0.05"
                    value={penaltyMultiplier}
                    onChange={(e) => setPenaltyMultiplier(parseFloat(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '60px' }}>
                    {(penaltyMultiplier * 100 - 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplacementDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRequestReplacement} 
            variant="contained"
            color="warning"
          >
            Create Replacement Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel order {selectedOrder?.order_number}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep Order</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MerchandiseOrders;
