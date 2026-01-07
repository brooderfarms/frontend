import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PublicIcon from '@mui/icons-material/Public';
import StoreIcon from '@mui/icons-material/Store';

const PaymentForm = ({ amount, orderId, onPaymentSuccess, onPaymentError }) => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('ecocash');
  const [methodsByCategory, setMethodsByCategory] = useState({
    local: [],
    international: [],
    card: []
  });
  const [phoneDialog, setPhoneDialog] = useState({
    open: false,
    phone: '',
    method: null
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/payments/methods`);

      if (!response.ok) throw new Error('Failed to fetch payment methods');

      const { data } = await response.json();
      setMethods(data);

      // Group by category
      const grouped = {
        local: data.filter(m => m.category === 'local'),
        international: data.filter(m => m.category === 'international'),
        card: data.filter(m => m.category === 'card')
      };
      setMethodsByCategory(grouped);

      // Set default method
      if (grouped.local.length > 0) {
        setSelectedMethod(grouped.local[0].code);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (category) => {
    switch (category) {
      case 'local':
        return <StoreIcon sx={{ mr: 1, color: '#00AA4F' }} />;
      case 'international':
        return <PublicIcon sx={{ mr: 1, color: '#003366' }} />;
      case 'card':
        return <CreditCardIcon sx={{ mr: 1, color: '#FF5F00' }} />;
      default:
        return <PaymentIcon sx={{ mr: 1 }} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'local':
        return '#E8F5E9';
      case 'international':
        return '#E3F2FD';
      case 'card':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneDialog.phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      setProcessing(true);
      const reference = `ORD_${orderId}_${Date.now()}`;

      const response = await apiRequest(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.round(amount),
          method_code: phoneDialog.method,
          reference: reference,
          description: `Ticket order ${orderId}`,
          order_id: orderId,
          phone_number: phoneDialog.phone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const { data } = await response.json();

      toast.success(`Payment initiated via ${phoneDialog.method.toUpperCase()}`);
      setPhoneDialog({ open: false, phone: '', method: null });

      // Call success callback with transaction data
      if (onPaymentSuccess) {
        onPaymentSuccess(data);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.message);
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const initiatePayment = async (method) => {
    try {
      // Check if method requires phone number
      if (['ecocash', 'zipit', 'zimswitch', 'innbucks'].includes(method)) {
        setPhoneDialog({ open: true, phone: '', method });
        return;
      }

      // For card and PayPal, process directly
      setProcessing(true);
      const reference = `ORD_${orderId}_${Date.now()}`;

      const response = await apiRequest(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Math.round(amount),
          method_code: method,
          reference: reference,
          description: `Ticket order ${orderId}`,
          order_id: orderId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const { data } = await response.json();

      // If there's a payment URL (PayPal, Card), redirect
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.success(`Payment initiated via ${method.toUpperCase()}`);
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error.message);
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const selectedMethodData = methods.find(m => m.code === selectedMethod);

  return (
    <Box sx={{ py: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PaymentIcon sx={{ mr: 2, fontSize: 32, color: '#1976d2' }} />
            <Typography variant="h5">Select Payment Method</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Amount Display */}
              <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Amount to Pay
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    ZWL {amount.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>

              {/* Payment Method Categories */}
              {Object.entries(methodsByCategory).map(([category, categoryMethods]) =>
                categoryMethods.length > 0 ? (
                  <Box key={category} sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        textTransform: 'capitalize',
                        fontWeight: 'bold'
                      }}
                    >
                      {getMethodIcon(category)}
                      {category} Payments
                    </Typography>

                    <RadioGroup value={selectedMethod}>
                      <Grid container spacing={2}>
                        {categoryMethods.map(method => (
                          <Grid item xs={12} sm={6} md={4} key={method.code}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                border:
                                  selectedMethod === method.code ? '2px solid #1976d2' : '1px solid #ddd',
                                backgroundColor: getCategoryColor(category),
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  boxShadow: 3,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                              onClick={() => setSelectedMethod(method.code)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <FormControlLabel
                                    control={
                                      <Radio checked={selectedMethod === method.code} />
                                    }
                                    label={method.name}
                                    sx={{ flex: 1 }}
                                  />
                                  {selectedMethod === method.code && (
                                    <CheckCircleIcon sx={{ color: '#1976d2' }} />
                                  )}
                                </Box>

                                <Typography variant="caption" color="textSecondary" display="block">
                                  {method.description}
                                </Typography>

                                {method.fees && (
                                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#d32f2f' }}>
                                    Fee: {JSON.parse(method.fees).percentage}%
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  sx={{ mt: 1, display: 'block', color: '#666' }}
                                >
                                  Processing: {method.processing_time_minutes} min
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>

                    {category !== Object.keys(methodsByCategory)[Object.keys(methodsByCategory).length - 1] && (
                      <Divider sx={{ my: 3 }} />
                    )}
                  </Box>
                ) : null
              )}

              {/* Method Details */}
              {selectedMethodData && (
                <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {selectedMethodData.name} Payment
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedMethodData.description}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Currency: {selectedMethodData.currency}
                  </Typography>
                </Alert>
              )}

              {/* Payment Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => initiatePayment(selectedMethod)}
                disabled={processing || !selectedMethod}
                sx={{
                  mt: 2,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc'
                  }
                }}
              >
                {processing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 2, color: 'white' }} />
                    Processing...
                  </>
                ) : (
                  `Pay ZWL ${amount.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}`
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Dialog for Mobile Money */}
      <Dialog
        open={phoneDialog.open}
        onClose={() => setPhoneDialog({ open: false, phone: '', method: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Enter Phone Number for {phoneDialog.method?.toUpperCase()}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            label="Phone Number"
            placeholder="e.g., 0773123456"
            fullWidth
            value={phoneDialog.phone}
            onChange={(e) => setPhoneDialog({ ...phoneDialog, phone: e.target.value })}
            helperText="Enter your mobile money phone number"
            disabled={processing}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPhoneDialog({ open: false, phone: '', method: null })}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePhoneSubmit}
            variant="contained"
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Proceed'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentForm;
