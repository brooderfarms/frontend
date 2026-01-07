import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BulkOrderPage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [merchandiseTypes, setMerchandiseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [selectedMerchandise, setSelectedMerchandise] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [customText, setCustomText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [deliveryData, setDeliveryData] = useState({
    delivery_address: '',
    delivery_city: '',
    delivery_country: 'Zimbabwe',
    delivery_postal_code: '',
    requested_delivery_date: '',
    special_instructions: ''
  });

  const steps = ['Select Items', 'Review Order', 'Delivery Info', 'Confirmation'];

  useEffect(() => {
    fetchMerchandiseTypes();
  }, []);

  const fetchMerchandiseTypes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/merchandise/types`);
      if (response.ok) {
        const data = await response.json();
        setMerchandiseTypes(data.data || []);
      }
    } catch (err) {
      console.error('Fetch merchandise error:', err);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedMerchandise || quantity < selectedMerchandise.min_quantity) {
      toast.error(`Minimum quantity is ${selectedMerchandise?.min_quantity}`);
      return;
    }

    if (quantity > selectedMerchandise.max_quantity) {
      toast.error(`Maximum quantity is ${selectedMerchandise.max_quantity}`);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      merchandise_type_id: selectedMerchandise.id,
      merchandise_name: selectedMerchandise.name,
      base_price: selectedMerchandise.base_price,
      quantity,
      custom_text: customText,
      logo_url: logoUrl,
      subtotal: selectedMerchandise.base_price * quantity
    };

    setCartItems([...cartItems, newItem]);
    resetForm();
    toast.success(`${selectedMerchandise.name} added to bulk order`);
  };

  const resetForm = () => {
    setSelectedMerchandise(null);
    setQuantity(100);
    setCustomText('');
    setLogoUrl('');
    setOpenAddDialog(false);
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = subtotal > 500 ? 0 : 25;
    const tax = (subtotal + shipping) * 0.1;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const handleSubmitBulkOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (!deliveryData.delivery_address || !deliveryData.delivery_city) {
      toast.error('Please fill in delivery address');
      return;
    }

    try {
      const items = cartItems.map(item => ({
        merchandise_type_id: item.merchandise_type_id,
        quantity: item.quantity,
        custom_text: item.custom_text,
        logo_url: item.logo_url,
        customizations: []
      }));

      const response = await apiRequest(`${API_BASE_URL}/merchandise/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          ...deliveryData
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Bulk order placed successfully!');
        setActiveStep(3);
        setCartItems([]);
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Bulk order error:', err);
      toast.error('Error placing bulk order');
    }
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Bulk Merchandise Order
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Order merchandise in bulk for your event or venue. Minimum quantities apply.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Available Merchandise
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddDialog(true)}
                  >
                    Add Item
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {merchandiseTypes.map((merch) => (
                    <Grid item xs={12} sm={6} md={4} key={merch.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-4px)'
                          }
                        }}
                        onClick={() => {
                          setSelectedMerchandise(merch);
                          setOpenAddDialog(true);
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {merch.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {merch.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip label={`$${merch.base_price}`} color="primary" size="small" />
                            <Chip label={`Min: ${merch.min_quantity}`} variant="outlined" size="small" />
                            <Chip label={`Max: ${merch.max_quantity}`} variant="outlined" size="small" />
                          </Box>
                          <Button
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={() => {
                              setSelectedMerchandise(merch);
                              setOpenAddDialog(true);
                            }}
                          >
                            Add to Order
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Order Summary
                </Typography>

                {cartItems.length === 0 ? (
                  <Alert severity="info">
                    No items added yet. Click "Add Item" to get started.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Items ({cartItems.length})
                      </Typography>
                      {cartItems.map((item) => (
                        <Box key={item.id} sx={{ p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                {item.merchandise_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Qty: {item.quantity}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                ${item.subtotal.toFixed(2)}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Delete fontSize="small" />
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">${shipping.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Tax (10%):</Typography>
                        <Typography variant="body2">${tax.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #ddd' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          ${total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setActiveStep(1)}
                    >
                      Continue →
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Review Your Order
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {item.merchandise_name}
                              </Typography>
                              {item.custom_text && (
                                <Typography variant="caption" color="textSecondary">
                                  Custom: {item.custom_text}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${item.base_price.toFixed(2)}</TableCell>
                          <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>${shipping.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>${tax.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #ddd' }}>
                    <Typography sx={{ fontWeight: 'bold' }}>Total:</Typography>
                    <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.2rem' }}>
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(0)}>
                    ← Back
                  </Button>
                  <Button variant="contained" onClick={() => setActiveStep(2)} sx={{ flex: 1 }}>
                    Proceed to Delivery →
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Delivery Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Delivery Address *"
                      value={deliveryData.delivery_address}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        delivery_address: e.target.value
                      })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City *"
                      value={deliveryData.delivery_city}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        delivery_city: e.target.value
                      })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={deliveryData.delivery_country}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        delivery_country: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      value={deliveryData.delivery_postal_code}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        delivery_postal_code: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Requested Delivery Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={deliveryData.requested_delivery_date}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        requested_delivery_date: e.target.value
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Special Instructions"
                      multiline
                      rows={4}
                      value={deliveryData.special_instructions}
                      onChange={(e) => setDeliveryData({
                        ...deliveryData,
                        special_instructions: e.target.value
                      })}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setActiveStep(1)}>
                    ← Back
                  </Button>
                  <Button variant="contained" onClick={() => setActiveStep(3)} sx={{ flex: 1 }}>
                    Review & Submit →
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Bulk Order Submitted!
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                  Your bulk order has been submitted successfully. You will receive a confirmation email shortly.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/merchandise/orders')}
                  sx={{ mr: 2 }}
                >
                  View Orders
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                >
                  Place Another Order
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Item Dialog */}
      <Dialog open={openAddDialog} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {selectedMerchandise?.name || 'Item'} to Order
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedMerchandise && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  {selectedMerchandise.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Price: $${selectedMerchandise.base_price}`} />
                  <Chip label={`Min: ${selectedMerchandise.min_quantity}`} />
                  <Chip label={`Max: ${selectedMerchandise.max_quantity}`} />
                </Box>
              </Box>

              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                inputProps={{
                  min: selectedMerchandise.min_quantity,
                  max: selectedMerchandise.max_quantity
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Custom Text (Optional)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Logo URL (Optional)"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained">
            Add to Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BulkOrderPage;
