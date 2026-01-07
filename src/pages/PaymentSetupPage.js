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
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PaymentSetupPage = () => {
  const { user, apiRequest, API_BASE_URL, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [paymentInfo, setPaymentInfo] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountHolderName: '',
    ecocashNumber: '',
    innbucksNumber: '',
    cashPickupLocation: '',
    cashPickupDetails: ''
  });
  const [fetchedInfo, setFetchedInfo] = useState(null);
  const [errors, setErrors] = useState({});

  // Helper function to ensure numeric values
  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const num = toNumber(value);
    return num.toFixed(2);
  };

  // Fetch existing payment info on load
  useEffect(() => {
    // Refresh user data to check if approval status has changed
    refreshUser();
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/payouts/info`);

      if (!response.ok) throw new Error('Failed to fetch payment info');

      const { data } = await response.json();
      // Ensure all numeric fields are actually numbers
      const paymentData = {
        ...data,
        total_earnings: toNumber(data?.total_earnings),
        pending_balance: toNumber(data?.pending_balance),
        commission_percentage: toNumber(data?.commission_percentage),
      };
      setFetchedInfo(paymentData);
      
      // Pre-fill form if info exists
      if (data.bank_account_number) {
        setPaymentMethod('bank');
        setPaymentInfo({
          accountNumber: data.bank_account_number || '',
          bankCode: data.bank_code || '',
          bankName: data.bank_name || '',
          accountHolderName: data.account_holder_name || '',
          ecocashNumber: data.ecocash_number || '',
          innbucksNumber: data.innbucks_number || '',
          cashPickupLocation: data.cash_pickup_location || '',
          cashPickupDetails: data.cash_pickup_details || ''
        });
      } else if (data.ecocash_number) {
        setPaymentMethod('ecocash');
        setPaymentInfo(prev => ({
          ...prev,
          ecocashNumber: data.ecocash_number || ''
        }));
      } else if (data.innbucks_number) {
        setPaymentMethod('innbucks');
        setPaymentInfo(prev => ({
          ...prev,
          innbucksNumber: data.innbucks_number || ''
        }));
      } else if (data.cash_pickup_location) {
        setPaymentMethod('cash');
        setPaymentInfo(prev => ({
          ...prev,
          cashPickupLocation: data.cash_pickup_location || '',
          cashPickupDetails: data.cash_pickup_details || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'bank') {
      if (!paymentInfo.accountNumber?.trim() || paymentInfo.accountNumber.length < 8) {
        newErrors.accountNumber = 'Account number must be at least 8 characters';
      }
      if (!paymentInfo.bankCode?.trim() || paymentInfo.bankCode.length < 2) {
        newErrors.bankCode = 'Bank code is required';
      }
      if (!paymentInfo.bankName?.trim() || paymentInfo.bankName.length < 3) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!paymentInfo.accountHolderName?.trim() || paymentInfo.accountHolderName.length < 3) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
    } else if (paymentMethod === 'ecocash') {
      if (!paymentInfo.ecocashNumber?.trim() || paymentInfo.ecocashNumber.length < 10) {
        newErrors.ecocashNumber = 'Valid Ecocash phone number is required (10+ digits)';
      }
    } else if (paymentMethod === 'innbucks') {
      if (!paymentInfo.innbucksNumber?.trim() || paymentInfo.innbucksNumber.length < 10) {
        newErrors.innbucksNumber = 'Valid Innbucks phone number is required (10+ digits)';
      }
    } else if (paymentMethod === 'cash') {
      if (!paymentInfo.cashPickupLocation?.trim() || paymentInfo.cashPickupLocation.length < 3) {
        newErrors.cashPickupLocation = 'Pickup location is required';
      }
      if (!paymentInfo.cashPickupDetails?.trim() || paymentInfo.cashPickupDetails.length < 5) {
        newErrors.cashPickupDetails = 'Pickup details/instructions are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload based on payment method
      let payload = { payment_method: paymentMethod };
      
      if (paymentMethod === 'bank') {
        payload = {
          ...payload,
          accountNumber: paymentInfo.accountNumber,
          bankCode: paymentInfo.bankCode,
          bankName: paymentInfo.bankName,
          accountHolderName: paymentInfo.accountHolderName
        };
      } else if (paymentMethod === 'ecocash') {
        payload = {
          ...payload,
          ecocashNumber: paymentInfo.ecocashNumber
        };
      } else if (paymentMethod === 'innbucks') {
        payload = {
          ...payload,
          innbucksNumber: paymentInfo.innbucksNumber
        };
      } else if (paymentMethod === 'cash') {
        payload = {
          ...payload,
          cashPickupLocation: paymentInfo.cashPickupLocation,
          cashPickupDetails: paymentInfo.cashPickupDetails
        };
      }
      
      const response = await apiRequest(`${API_BASE_URL}/payouts/info`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment info');
      }

      const { data } = await response.json();
      setFetchedInfo(data);
      toast.success('Payment information updated successfully. Awaiting admin verification.');
    } catch (error) {
      console.error('Error updating payment info:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getVerificationStatus = (status) => {
    const statusConfig = {
      'unverified': { color: 'default', label: 'Not Started' },
      'pending': { color: 'warning', label: 'Pending Verification' },
      'verified': { color: 'success', label: 'Verified' },
      'failed': { color: 'error', label: 'Verification Failed' }
    };

    const config = statusConfig[status] || statusConfig['unverified'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (!['organizer', 'venue_manager'].includes(user?.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          Payment setup is only available for organizers and venue managers.
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
            Your account is still pending admin approval. You'll be able to set up payment information once approved.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
            Current Status: <strong>{user?.approval_status || 'pending'}</strong>
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Payment Information
      </Typography>

      {/* Verification Status Card */}
      {fetchedInfo && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Verification Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Payment Verification
                  </Typography>
                </Box>
                {getVerificationStatus(fetchedInfo.payment_verification_status)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Commission Rate
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {fetchedInfo.commission_percentage}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total Earnings
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ${formatCurrency(fetchedInfo?.total_earnings)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Pending Balance
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${formatCurrency(fetchedInfo?.pending_balance)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Payment Information Form */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Select Payment Method
          </Typography>
          
          <RadioGroup
            row
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{ mb: 4 }}
          >
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label="Bank Transfer"
              disabled={loading}
            />
            <FormControlLabel
              value="ecocash"
              control={<Radio />}
              label="Ecocash"
              disabled={loading}
            />
            <FormControlLabel
              value="innbucks"
              control={<Radio />}
              label="Innbucks"
              disabled={loading}
            />
            <FormControlLabel
              value="cash"
              control={<Radio />}
              label="Cash Pickup"
              disabled={loading}
            />
          </RadioGroup>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Bank Transfer Fields */}
            {paymentMethod === 'bank' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your bank account details for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Account Number"
                    name="accountNumber"
                    value={paymentInfo.accountNumber}
                    onChange={handleChange}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Code"
                    name="bankCode"
                    value={paymentInfo.bankCode}
                    onChange={handleChange}
                    error={!!errors.bankCode}
                    helperText={errors.bankCode}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bank Name"
                    name="bankName"
                    value={paymentInfo.bankName}
                    onChange={handleChange}
                    error={!!errors.bankName}
                    helperText={errors.bankName}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={paymentInfo.accountHolderName}
                    onChange={handleChange}
                    error={!!errors.accountHolderName}
                    helperText={errors.accountHolderName}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Ecocash Fields */}
            {paymentMethod === 'ecocash' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your Ecocash phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ecocash Phone Number"
                    name="ecocashNumber"
                    placeholder="+263..."
                    value={paymentInfo.ecocashNumber}
                    onChange={handleChange}
                    error={!!errors.ecocashNumber}
                    helperText={errors.ecocashNumber || 'Your registered Ecocash phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Innbucks Fields */}
            {paymentMethod === 'innbucks' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Provide your Innbucks phone number for payouts
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Innbucks Phone Number"
                    name="innbucksNumber"
                    placeholder="+263..."
                    value={paymentInfo.innbucksNumber}
                    onChange={handleChange}
                    error={!!errors.innbucksNumber}
                    helperText={errors.innbucksNumber || 'Your registered Innbucks phone number'}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            {/* Cash Pickup Fields */}
            {paymentMethod === 'cash' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info">
                    Specify where and how payments should be picked up
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pickup Location"
                    name="cashPickupLocation"
                    placeholder="e.g., Harare CBD, Avondale"
                    value={paymentInfo.cashPickupLocation}
                    onChange={handleChange}
                    error={!!errors.cashPickupLocation}
                    helperText={errors.cashPickupLocation}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Pickup Details/Instructions"
                    name="cashPickupDetails"
                    placeholder="e.g., Available Monday-Friday 9am-5pm at [Address]. Contact: [Phone]"
                    value={paymentInfo.cashPickupDetails}
                    onChange={handleChange}
                    error={!!errors.cashPickupDetails}
                    helperText={errors.cashPickupDetails}
                    disabled={loading}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Saving...' : 'Save Payment Method'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info">
        Your payment information will be verified by an administrator before you can request payouts.
        Ensure all details are accurate.
      </Alert>
    </Container>
  );
};

export default PaymentSetupPage;
