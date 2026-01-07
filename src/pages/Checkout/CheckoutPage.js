import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Payment,
  CheckCircle,
  Event,
  LocationOn,
  AccessTime,
  CreditCard,
  Lock,
  Delete,
  EventSeat,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useGuestCart } from '../../context/GuestCartContext';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import TicketPreview from '../../components/TicketTemplateBuilder/TicketPreview';
import GuestRegistrationModal from '../../components/Guest/GuestRegistrationModal';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, cartTotal, cartCount, clearCart, removeFromCart } = useCart();
  const { apiRequest, API_BASE_URL, isAuthenticated, user } = useAuth();
  const { guestCartId, guestCart, getGuestCart, removeFromGuestCart, completeGuestCheckout } = useGuestCart();
  const navigate = useNavigate();

  const isGuest = !isAuthenticated() && guestCartId;
  const isAuthenticatedUser = isAuthenticated();
  
  // Normalize guest cart items to use standard field names
  const normalizeGuestItem = (item) => ({
    ...item,
    id: item.id,
    event_id: item.event_id,
    event_title: item.event_title,
    event_date: item.event_date,
    venueName: item.venueName || item.venue_name || '',
    ticketType: item.ticket_type || 'Standard',
    ticketFormat: item.ticket_format || 'digital',
    quantity: item.quantity || 1,
    basePrice: Number(item.unit_price || 0),
    totalPrice: Number(item.total_price || 0),
    seatNumbers: item.seat_numbers || [],
  });

  // Use guest cart items if guest, otherwise use authenticated cart items
  const displayItems = isGuest && guestCart?.items 
    ? guestCart.items.map(normalizeGuestItem) 
    : cartItems;
  const displayTotal = isGuest && guestCart?.total_amount ? guestCart.total_amount : cartTotal;

  console.log('CheckoutPage render:', { isGuest, guestCartId, guestCart, displayItems: displayItems?.length });

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templateData, setTemplateData] = useState({});
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestConfirmationCode, setGuestConfirmationCode] = useState('');

  // Checkout form data
  const [checkoutData, setCheckoutData] = useState({
    paymentMethod: 'stripe',
    zimGateway: 'ecocash',
    phoneNumber: '',
    nfcCardId: null,
    purchaseNFCCard: false,
    nfcCardType: 'nfc',
    billingAddress: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Zimbabwe',
    },
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
    },
  });

  const steps = ['Review Order', 'Payment Details', 'Confirmation'];

  // Track if we've already fetched the guest cart to avoid infinite loops
  const [guestCartFetched, setGuestCartFetched] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    // Allow both authenticated users and guest checkout
    if (!isAuthenticatedUser && !isGuest) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    // For authenticated users, check cart items
    if (isAuthenticatedUser && cartItems.length === 0) {
      navigate('/events');
      return;
    }

    // For guest users, fetch cart data only once
    if (isGuest && guestCartId && !guestCartFetched) {
      setGuestCartFetched(true);
      console.log('Fetching guest cart on checkout page:', guestCartId);
      getGuestCart(guestCartId, apiRequest, API_BASE_URL).catch(err => {
        console.error('Failed to load guest cart:', err);
        setError('Failed to load cart');
      });
    }
  }, [isAuthenticatedUser, isGuest, cartItems.length, guestCartId, guestCartFetched, navigate]);

  // Auto-load billing info from user profile for authenticated users
  useEffect(() => {
    if (isAuthenticatedUser && user && !profileLoaded) {
      setProfileLoaded(true);
      setCheckoutData(prevData => ({
        ...prevData,
        billingAddress: {
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          country: user.country || 'Zimbabwe',
        },
      }));
    }
  }, [isAuthenticatedUser, user, profileLoaded]);

  // Fetch ticket templates for items in cart
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!displayItems || displayItems.length === 0) return;

      setTemplatesLoading(true);
      try {
        // Fetch templates for each item that has a template_id
        const templates = {};
        
        for (const item of displayItems) {
          if (item.template_id) {
            try {
              const response = await apiRequest(`${API_BASE_URL}/ticket-templates/${item.template_id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });
              const result = await response.json();
              if (response.ok && result.success && result.data) {
                templates[item.event_id || item.eventId] = result.data;
              }
            } catch (err) {
              console.error(`Failed to fetch template for event ${item.event_id || item.eventId}:`, err);
            }
          }
        }
        
        setTemplateData(templates);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [displayItems?.length]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate cart
      const validationErrors = validateCart();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }
    }

    if (activeStep === 1) {
      // Validate payment details
      const paymentErrors = validatePaymentDetails();
      if (paymentErrors.length > 0) {
        setError(paymentErrors.join(', '));
        return;
      }
    }

    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateCart = () => {
    const errors = [];
    // Add validation logic here
    return errors;
  };

  const validatePaymentDetails = () => {
    const errors = [];
    const { paymentMethod, billingAddress, cardDetails } = checkoutData;

    if (!billingAddress.firstName || !billingAddress.lastName) {
      errors.push('Billing name is required');
    }

    if (!billingAddress.email) {
      errors.push('Email is required');
    }

    if (!billingAddress.phone) {
      errors.push('Phone number is required');
    }

    if (checkoutData.paymentMethod === 'zim_gateway') {
      if (!checkoutData.phoneNumber) errors.push('Phone number is required for Zimbabwe payment');
      // Validate Zimbabwe phone format: +263 or 07xx followed by 9 digits
      const zimPhoneRegex = /^(\+263|0)[0-9]{9}$/;
      if (checkoutData.phoneNumber && !zimPhoneRegex.test(checkoutData.phoneNumber)) {
        errors.push('Invalid phone format. Use +263xxxxxxxxx or 07xxxxxxxx');
      }
    }

    if (checkoutData.paymentMethod !== 'cash' && checkoutData.paymentMethod !== 'zim_gateway') {
      if (!cardDetails.cardNumber) errors.push('Card number is required');
      if (!cardDetails.expiryDate) errors.push('Expiry date is required');
      if (!cardDetails.cvv) errors.push('CVV is required');
      if (!cardDetails.cardholderName) errors.push('Cardholder name is required');
    }

    return errors;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Handle guest checkout
      if (isGuest) {
        // Validate billing information
        const { email, phone } = checkoutData.billingAddress;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }

        // Validate Zimbabwe phone number (263 or 0 prefix)
        const phoneRegex = /^(?:\+263|0)[\d\s\-()]{7,}$/;
        if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
          throw new Error('Please enter a valid Zimbabwe phone number (starting with +263 or 0)');
        }

        const response = await completeGuestCheckout(
          guestCartId,
          checkoutData.billingAddress,
          apiRequest,
          API_BASE_URL
        );

        if (response && response.email && response.confirmation_code) {
          setGuestEmail(response.email);
          setGuestConfirmationCode(response.confirmation_code);
        }

        setActiveStep(2); // Go to confirmation
        toast.success('Guest checkout completed successfully!');
        return;
      }

      // Handle authenticated checkout
      // If NFC card purchase is selected, purchase NFC card first
      if (checkoutData.paymentMethod === 'nfc' && checkoutData.purchaseNFCCard) {
        const nfcResponse = await apiRequest(`${API_BASE_URL}/nfc/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card_type: checkoutData.nfcCardType === 'both' ? 'nfc' : checkoutData.nfcCardType,
            initial_balance: displayTotal + 15, // Add card cost
          }),
        });

        const nfcData = await nfcResponse.json();

        if (!nfcResponse.ok) {
          throw new Error(nfcData.error || 'Failed to purchase NFC card');
        }

        setCheckoutData(prev => ({ ...prev, nfcCardId: nfcData.card.id }));
        toast.success(`${nfcData.card.card_type.toUpperCase()} card purchased successfully!`);
      }

      // Process each cart item
      const purchasePromises = displayItems.map(async (item) => {
        // Handle guest cart items vs authenticated cart items
        const eventId = item.event_id || item.eventId;
        const ticketType = item.ticket_type || item.ticketType;
        const ticketFormat = item.ticketFormat || 'digital';
        const quantity = item.quantity;
        const seatNumbers = item.seat_numbers || item.seatNumbers || [];

        const purchasePayload = {
          event_id: eventId,
          ticket_type: ticketType,
          ticket_format: ticketFormat,
          quantity: quantity,
          seat_numbers: seatNumbers && seatNumbers.length > 0 ? seatNumbers : [],
        };

        // Add session_id if available
        if (item.sessionId) {
          purchasePayload.session_id = item.sessionId;
        }

        console.log('Sending purchase request for:', purchasePayload);

        const response = await apiRequest(`${API_BASE_URL}/tickets/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchasePayload),
        });

        const data = await response.json();
        console.log('Purchase response:', { status: response.status, data });

        if (!response.ok) {
          throw new Error(data.message || `Purchase failed with status ${response.status}`);
        }

        return data;
      });

      const results = await Promise.all(purchasePromises);

      // Process payments for each purchase
      const paymentPromises = results.map(async (result, index) => {
        const cartItem = cartItems[index];

        const paymentResponse = await apiRequest(`${API_BASE_URL}/tickets/${result.data.tickets[0].id}/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method: checkoutData.paymentMethod,
            nfc_card_id: checkoutData.nfcCardId,
            gateway_response: {
              // Mock payment gateway response
              transaction_id: `txn_${Date.now()}_${index}`,
              status: 'approved',
              amount: cartItem.totalPrice,
            },
          }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'Payment failed');
        }

        return paymentData;
      });

      await Promise.all(paymentPromises);

      // Clear cart and go to confirmation step
      clearCart();
      toast.success('Purchase completed successfully!');
      setActiveStep(2); // Go to confirmation page instead of redirecting

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticatedUser && !isGuest) {
    return null;
  }

  // For guest users without items yet, show empty state or redirect
  if (!isAuthenticatedUser && isGuest && (!displayItems || displayItems.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          Your guest checkout session is active. Add items to your cart to continue.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/events')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Checkout
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAuthenticatedUser ? `Complete your purchase for ${cartCount} ticket${cartCount > 1 ? 's' : ''}` : 'Guest Checkout - No account needed'}
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

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Review Your Order
            </Typography>

            {displayItems.map((item) => (
              <Box key={item.id}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                          {item.event_title || item.eventTitle}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime sx={{ mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            {formatDate(item.event_date || item.eventDate)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">
                            {item.venueName}
                          </Typography>
                        </Box>

                        {(item.seat_numbers || item.seatNumbers) && (item.seat_numbers || item.seatNumbers).length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EventSeat sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Seat: {(item.seat_numbers || item.seatNumbers).join(', ')}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={item.ticketType} size="small" />
                          <Chip label={item.ticketFormat} size="small" variant="outlined" />
                          <Chip label={`Qty: ${item.quantity}`} size="small" color="primary" />
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${(Number(item.totalPrice) || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          ${(Number(item.basePrice) || 0).toFixed(2)} × {item.quantity} + fees
                        </Typography>
                        <Button
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => {
                            if (isGuest) {
                              removeFromGuestCart(guestCartId, item.id, apiRequest, API_BASE_URL);
                            } else {
                              removeFromCart(item.id);
                            }
                          }}
                          sx={{ mt: 1 }}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Ticket Template Preview */}
                {templateData[item.eventId] && (
                  <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper', border: '2px solid', borderColor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Ticket Preview - Your Ticket Will Look Like This:
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', py: 2 }}>
                        <TicketPreview
                          template={templateData[item.eventId]}
                          elements={templateData[item.eventId]?.elements || []}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                        Template: {templateData[item.eventId]?.name}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total: ${(Number(displayTotal) || 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayItems.length} item{displayItems.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Grid container spacing={4}>
          {/* Billing Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Billing Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={checkoutData.billingAddress.firstName}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, firstName: e.target.value }
                      }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={checkoutData.billingAddress.lastName}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, lastName: e.target.value }
                      }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={checkoutData.billingAddress.email}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, email: e.target.value }
                      }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={checkoutData.billingAddress.phone}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, phone: e.target.value }
                      }))}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <GooglePlacesAutocomplete
                      value={checkoutData.billingAddress.address}
                      onChange={(value) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, address: value }
                      }))}
                      label="Address"
                      onAddressSelect={(addressData) => {
                        setCheckoutData(prev => ({
                          ...prev,
                          billingAddress: {
                            ...prev.billingAddress,
                            address: addressData.address,
                            city: addressData.city,
                            country: addressData.country
                          }
                        }));
                      }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="City"
                      value={checkoutData.billingAddress.city}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, city: e.target.value }
                      }))}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={checkoutData.billingAddress.country}
                      onChange={(e) => setCheckoutData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, country: e.target.value }
                      }))}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Payment Method
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={checkoutData.paymentMethod}
                    label="Payment Method"
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <MenuItem value="stripe">Credit/Debit Card</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="zim_gateway">Zimbabwe Mobile Money</MenuItem>
                    <MenuItem value="nfc">NFC/RFID Card</MenuItem>
                    <MenuItem value="cash">Cash on Delivery</MenuItem>
                  </Select>
                </FormControl>

                {/* Zimbabwe Payment Gateways */}
                {checkoutData.paymentMethod === 'zim_gateway' && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Select Payment Method
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Zimbabwe Gateway</InputLabel>
                      <Select
                        value={checkoutData.zimGateway}
                        label="Zimbabwe Gateway"
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, zimGateway: e.target.value }))}
                      >
                        <MenuItem value="ecocash">Ecocash (Econet) - 5% fee</MenuItem>
                        <MenuItem value="innbucks">Innbucks - 4% fee</MenuItem>
                        <MenuItem value="telecash">Telecash (Telecel) - 6% fee</MenuItem>
                        <MenuItem value="zimswitch">ZimSwitch - 3% fee</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Enter your phone number
                    </Typography>

                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="+263 or 07xx format"
                      value={checkoutData.phoneNumber}
                      onChange={(e) => setCheckoutData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      helperText="Format: +263712345678 or 0712345678"
                      sx={{ mb: 2 }}
                    />

                    <Alert severity="info" sx={{ mb: 2 }}>
                      You will receive a prompt on your {checkoutData.zimGateway.toUpperCase()} account to confirm the payment.
                    </Alert>
                  </>
                )}

                {checkoutData.paymentMethod !== 'cash' && checkoutData.paymentMethod !== 'zim_gateway' && (
                  <>
                    {checkoutData.paymentMethod === 'paypal' ? (
                      <>
                        <Typography variant="h6" gutterBottom>
                          PayPal Payment
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                          You will be redirected to PayPal to complete your payment securely.
                        </Alert>
                        <TextField
                          fullWidth
                          label="PayPal Email"
                          type="email"
                          placeholder="your-email@example.com"
                          helperText="The email associated with your PayPal account"
                          sx={{ mb: 2 }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" gutterBottom>
                          Card Details
                        </Typography>

                        <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          value={checkoutData.cardDetails.cardNumber}
                          onChange={(e) => setCheckoutData(prev => ({
                            ...prev,
                            cardDetails: { ...prev.cardDetails, cardNumber: e.target.value }
                          }))}
                          InputProps={{
                            startAdornment: <CreditCard sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Expiry Date"
                          placeholder="MM/YY"
                          value={checkoutData.cardDetails.expiryDate}
                          onChange={(e) => setCheckoutData(prev => ({
                            ...prev,
                            cardDetails: { ...prev.cardDetails, expiryDate: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="CVV"
                          placeholder="123"
                          value={checkoutData.cardDetails.cvv}
                          onChange={(e) => setCheckoutData(prev => ({
                            ...prev,
                            cardDetails: { ...prev.cardDetails, cvv: e.target.value }
                          }))}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Cardholder Name"
                          value={checkoutData.cardDetails.cardholderName}
                          onChange={(e) => setCheckoutData(prev => ({
                            ...prev,
                            cardDetails: { ...prev.cardDetails, cardholderName: e.target.value }
                          }))}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Lock sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Your payment information is secure and encrypted
                      </Typography>
                    </Box>
                      </>
                    )}
                  </>
                )}

                {checkoutData.paymentMethod === 'cash' && (
                  <Alert severity="info">
                    You will pay in cash when collecting your tickets at the venue.
                  </Alert>
                )}

                {checkoutData.paymentMethod === 'nfc' && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      🏷️ NFC/RFID Card Payment
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Use your NFC/RFID card balance to purchase tickets. The amount will be deducted from your card's balance.
                    </Alert>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Card Type</InputLabel>
                      <Select
                        value={checkoutData.nfcCardType}
                        label="Card Type"
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, nfcCardType: e.target.value }))}
                      >
                        <MenuItem value="nfc">NFC Card</MenuItem>
                        <MenuItem value="rfid">RFID Wristband</MenuItem>
                        <MenuItem value="both">NFC + RFID Bundle</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                      Don't have an NFC card yet?
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => setCheckoutData(prev => ({ ...prev, purchaseNFCCard: !prev.purchaseNFCCard }))}
                      sx={{ mb: 2 }}
                    >
                      {checkoutData.purchaseNFCCard ? '✓ Add NFC Card to Order' : 'Purchase NFC Card with This Order'}
                    </Button>

                    {checkoutData.purchaseNFCCard && (
                      <Alert severity="success">
                        NFC Card ($15) will be added to your order total.
                      </Alert>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Order Confirmed!
            </Typography>
            <Typography variant="body1" paragraph>
              Your tickets have been reserved and payment has been processed.
            </Typography>
            {checkoutData.purchaseNFCCard && (
              <Typography variant="body2" color="success.main" paragraph sx={{ fontWeight: 'bold' }}>
                ✓ NFC/RFID Card has been added to your order!
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" paragraph>
              You will receive email confirmations with your digital tickets shortly.
            </Typography>
            {isGuest && (
              <Alert severity="info" sx={{ my: 2 }}>
                <strong>Tip:</strong> Create an account to track your tickets and access them anytime!
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isGuest && (
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large" 
                  onClick={() => setShowRegistrationModal(true)}
                >
                  Create Account
                </Button>
              )}
              <Button variant="contained" size="large" onClick={() => navigate('/')}>
                Back to Home
              </Button>
              {checkoutData.purchaseNFCCard && (
                <Button variant="contained" color="success" size="large" onClick={() => navigate('/my-nfc-cards')}>
                  View My NFC Cards
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handlePayment}
              disabled={loading}
              startIcon={<Payment />}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 1 && !checkoutData.billingAddress.email}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Guest Registration Modal */}
      <GuestRegistrationModal
        open={showRegistrationModal}
        guestEmail={guestEmail}
        confirmationCode={guestConfirmationCode}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={(data) => {
          navigate('/');
          toast.success('Account created! You can now log in.');
        }}
        apiRequest={apiRequest}
        API_BASE_URL={API_BASE_URL}
      />
    </Container>
  );
};

export default CheckoutPage;
