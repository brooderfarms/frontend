import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Business } from '@mui/icons-material';

const VendorRegistration = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  const [formData, setFormData] = useState({
    vendor_name: '',
    description: '',
    event_id: '',
    category: 'merchandise',
    contact_phone: '',
    contact_email: '',
    booth_location: '',
    website: '',
    commission_agreed: false,
  });

  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    account_number: '',
    routing_number: '',
    bank_name: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/events?limit=100&status=active`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.vendor_name || !formData.event_id) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.contact_email || !formData.contact_phone) {
        toast.error('Please provide contact information');
        return;
      }
    } else if (activeStep === 2) {
      if (!bankDetails.account_holder || !bankDetails.account_number) {
        toast.error('Please provide bank details');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.commission_agreed) {
      toast.error('You must agree to the commission terms');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest(
        `${API_BASE_URL}/vendors`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            bank_details: bankDetails,
            status: 'pending'
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Vendor application submitted successfully!');
        navigate('/vendor/dashboard');
      } else {
        toast.error(data.message || 'Failed to create vendor account');
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({
      ...bankDetails,
      [name]: value
    });
  };

  const steps = ['Basic Info', 'Contact Details', 'Bank Information', 'Review'];

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <TextField
              fullWidth
              label="Vendor Name *"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              placeholder="Your business name"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
              placeholder="Describe your business and products"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Event *</InputLabel>
              <Select
                name="event_id"
                value={formData.event_id}
                onChange={handleInputChange}
                label="Select Event *"
              >
                {events.map(event => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Vendor Category *</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Vendor Category *"
              >
                <MenuItem value="food">Food & Beverages</MenuItem>
                <MenuItem value="merchandise">Merchandise</MenuItem>
                <MenuItem value="crafts">Crafts & Handmade</MenuItem>
                <MenuItem value="technology">Technology & Gadgets</MenuItem>
                <MenuItem value="services">Services</MenuItem>
                <MenuItem value="health">Health & Wellness</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <TextField
              fullWidth
              label="Email *"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              defaultValue={user?.email}
            />
            <TextField
              fullWidth
              label="Phone Number *"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              placeholder="+1 (555) 123-4567"
            />
            <TextField
              fullWidth
              label="Booth Location"
              name="booth_location"
              value={formData.booth_location}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              placeholder="e.g., Section A, Booth 12"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Bank Information
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Secure banking information is required for payouts. All data is encrypted.
            </Alert>
            <TextField
              fullWidth
              label="Account Holder Name *"
              name="account_holder"
              value={bankDetails.account_holder}
              onChange={handleBankChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Account Number *"
              name="account_number"
              value={bankDetails.account_number}
              onChange={handleBankChange}
              sx={{ mb: 2 }}
              type="password"
            />
            <TextField
              fullWidth
              label="Routing Number *"
              name="routing_number"
              value={bankDetails.routing_number}
              onChange={handleBankChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Bank Name *"
              name="bank_name"
              value={bankDetails.bank_name}
              onChange={handleBankChange}
              placeholder="e.g., Chase Bank"
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Review Your Application
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      VENDOR NAME
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {formData.vendor_name}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      CATEGORY
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {formData.category}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      CONTACT EMAIL
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {formData.contact_email}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      PHONE
                    </Typography>
                    <Typography>
                      {formData.contact_phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="commission_agreed"
                      checked={formData.commission_agreed}
                      onChange={handleInputChange}
                    />
                  }
                  label="I agree to the 15% commission rate and terms of service"
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Business sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Become a Vendor
        </Typography>
        <Typography color="textSecondary">
          Sell your products at events
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {renderStep()}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default VendorRegistration;
