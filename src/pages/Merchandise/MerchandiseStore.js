import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  Add,
  LocalShipping,
  Palette,
  ShoppingCart,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MerchandiseStore = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [merchandiseTypes, setMerchandiseTypes] = useState([]);
  const [selectedMerchandise, setSelectedMerchandise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [orderData, setOrderData] = useState({
    items: [],
    delivery_address: '',
    delivery_city: '',
    delivery_country: '',
    delivery_postal_code: '',
    requested_delivery_date: '',
    special_instructions: ''
  });

  const [currentItem, setCurrentItem] = useState({
    merchandise_type_id: '',
    quantity: 100,
    custom_text: '',
    logo_url: '',
    customizations: [],
    design_data: null
  });

  useEffect(() => {
    fetchMerchandiseTypes();
  }, []);

  const fetchMerchandiseTypes = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/merchandise/types`);
      if (response.ok) {
        const data = await response.json();
        setMerchandiseTypes(data.data);
      }
    } catch (err) {
      console.error('Fetch merchandise error:', err);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMerchandise = (merchandise) => {
    setSelectedMerchandise(merchandise);
    setCurrentItem({
      ...currentItem,
      merchandise_type_id: merchandise.id
    });
  };

  const handleAddItem = () => {
    if (!currentItem.merchandise_type_id || !currentItem.quantity) {
      toast.error('Please select merchandise and quantity');
      return;
    }

    const merchandise = merchandiseTypes.find(m => m.id === currentItem.merchandise_type_id);
    if (!merchandise) {
      toast.error('Invalid merchandise selected');
      return;
    }

    if (currentItem.quantity < merchandise.min_quantity || currentItem.quantity > merchandise.max_quantity) {
      toast.error(`Quantity must be between ${merchandise.min_quantity} and ${merchandise.max_quantity}`);
      return;
    }

    setOrderData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { ...currentItem }
      ]
    }));

    setCurrentItem({
      merchandise_type_id: '',
      quantity: 100,
      custom_text: '',
      logo_url: '',
      customizations: [],
      design_data: null
    });

    setSelectedMerchandise(null);
    toast.success('Item added to order');
  };

  const handleRemoveItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (orderData.items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!orderData.delivery_address || !orderData.delivery_city) {
        toast.error('Please fill in delivery address');
        return;
      }

      const response = await apiRequest(`${API_BASE_URL}/merchandise/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Order placed successfully!');
        navigate('/organizer/merchandise-orders');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Place order error:', err);
      toast.error('Error placing order');
    }
  };

  const steps = ['Select Items', 'Customize', 'Delivery Info', 'Review & Submit'];

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
          Merchandise Store
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Order custom cards, tags, bands, and more for your events
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Select Items */}
      {activeStep === 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Select Merchandise
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {merchandiseTypes.map(merchandise => (
              <Grid item xs={12} sm={6} md={4} key={merchandise.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedMerchandise?.id === merchandise.id ? '3px solid primary' : 'none',
                    borderColor: 'primary.main',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={() => handleSelectMerchandise(merchandise)}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {merchandise.name}
                    </Typography>
                    <Chip
                      label={merchandise.category}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {merchandise.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${merchandise.base_price.toFixed(2)} each
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Min: {merchandise.min_quantity}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {merchandise.material} • {merchandise.color}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Current Item Selection */}
          {selectedMerchandise && (
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Customize {selectedMerchandise.name}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    inputProps={{
                      min: selectedMerchandise.min_quantity,
                      max: selectedMerchandise.max_quantity
                    }}
                    helperText={`Min: ${selectedMerchandise.min_quantity}, Max: ${selectedMerchandise.max_quantity}`}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Text (Optional)"
                    value={currentItem.custom_text}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, custom_text: e.target.value }))}
                    placeholder="e.g., Event Name, Date"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Logo/Image URL (Optional)"
                    value={currentItem.logo_url}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Design Description (Optional)"
                    multiline
                    rows={2}
                    value={currentItem.design_data?.description || ''}
                    onChange={(e) => setCurrentItem(prev => ({
                      ...prev,
                      design_data: { ...prev.design_data, description: e.target.value }
                    }))}
                    placeholder="Describe your design"
                  />
                </Grid>

                {/* Customization Options */}
                {selectedMerchandise.customizations && selectedMerchandise.customizations.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Add-ons:
                    </Typography>
                    {selectedMerchandise.customizations.map(custom => (
                      <FormControlLabel
                        key={custom.id}
                        control={
                          <Checkbox
                            checked={currentItem.customizations.includes(custom.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentItem(prev => ({
                                  ...prev,
                                  customizations: [...prev.customizations, custom.id]
                                }));
                              } else {
                                setCurrentItem(prev => ({
                                  ...prev,
                                  customizations: prev.customizations.filter(c => c !== custom.id)
                                }));
                              }
                            }}
                          />
                        }
                        label={`${custom.option_name} (+$${custom.additional_cost})`}
                      />
                    ))}
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddItem}
                    startIcon={<ShoppingCart />}
                  >
                    Add to Order
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Items in Cart */}
          {orderData.items.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Items in Order ({orderData.items.length})
              </Typography>
              {orderData.items.map((item, index) => {
                const merchandise = merchandiseTypes.find(m => m.id === item.merchandise_type_id);
                return (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #ddd' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {merchandise?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Qty: {item.quantity}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                );
              })}
            </Paper>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={handleNext} variant="contained" disabled={orderData.items.length === 0}>
              Continue to Customization
            </Button>
          </Box>
        </>
      )}

      {/* Step 1: Customize */}
      {activeStep === 1 && (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            Review and adjust customizations for your items. You can add custom text, logos, and design preferences.
          </Alert>

          {orderData.items.length > 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {orderData.items.length} items selected. Customization details can be provided in the final step.
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
            <Button onClick={handleNext} variant="contained">
              Continue to Delivery
            </Button>
          </Box>
        </>
      )}

      {/* Step 2: Delivery Info */}
      {activeStep === 2 && (
        <>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Delivery Information
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Address"
                value={orderData.delivery_address}
                onChange={(e) => setOrderData(prev => ({ ...prev, delivery_address: e.target.value }))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={orderData.delivery_city}
                onChange={(e) => setOrderData(prev => ({ ...prev, delivery_city: e.target.value }))}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={orderData.delivery_country}
                onChange={(e) => setOrderData(prev => ({ ...prev, delivery_country: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={orderData.delivery_postal_code}
                onChange={(e) => setOrderData(prev => ({ ...prev, delivery_postal_code: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Requested Delivery Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={orderData.requested_delivery_date}
                onChange={(e) => setOrderData(prev => ({ ...prev, requested_delivery_date: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={orderData.special_instructions}
                onChange={(e) => setOrderData(prev => ({ ...prev, special_instructions: e.target.value }))}
                placeholder="Any special requests or instructions..."
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
            <Button onClick={handleNext} variant="contained">
              Review Order
            </Button>
          </Box>
        </>
      )}

      {/* Step 3: Review */}
      {activeStep === 3 && (
        <>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Review Your Order
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Items ({orderData.items.length})
            </Typography>
            {orderData.items.map((item, index) => {
              const merchandise = merchandiseTypes.find(m => m.id === item.merchandise_type_id);
              return (
                <Box key={index} sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {merchandise?.name}
                  </Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>
                  {item.custom_text && <Typography variant="body2">Text: {item.custom_text}</Typography>}
                </Box>
              );
            })}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Delivery Details
            </Typography>
            <Typography variant="body2">{orderData.delivery_address}</Typography>
            <Typography variant="body2">{orderData.delivery_city}, {orderData.delivery_country} {orderData.delivery_postal_code}</Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
            <Button onClick={handlePlaceOrder} variant="contained" color="success">
              Place Order
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default MerchandiseStore;
