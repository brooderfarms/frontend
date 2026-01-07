import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import { ArrowBack } from '@mui/icons-material';

const schema = yup.object({
  name: yup.string().required('Venue name is required').min(3, 'Name must be at least 3 characters'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  country: yup.string().required('Country is required'),
  postal_code: yup.string(),
  latitude: yup.number(),
  longitude: yup.number(),
  capacity: yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1'),
  contact_phone: yup.string(),
  contact_email: yup.string().email('Invalid email'),
  description: yup.string(),
  address: yup.string(),
});

const EditVenuePage = () => {
  const { venueId } = useParams();
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [operatingHours, setOperatingHours] = useState({
    monday_open: '09:00',
    monday_close: '22:00',
    tuesday_open: '09:00',
    tuesday_close: '22:00',
    wednesday_open: '09:00',
    wednesday_close: '22:00',
    thursday_open: '09:00',
    thursday_close: '22:00',
    friday_open: '09:00',
    friday_close: '22:00',
    saturday_open: '09:00',
    saturday_close: '23:00',
    sunday_open: '10:00',
    sunday_close: '22:00',
  });

  const amenitiesOptions = [
    'Parking', 'WiFi', 'Accessible', 'Food & Beverages',
    'First Aid', 'Security', 'Restrooms', 'Information Desk'
  ];

  const steps = ['Basic Info', 'Location & Details', 'Amenities & Hours', 'Review'];

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      latitude: 0,
      longitude: 0,
      capacity: 0,
      contact_phone: '',
      contact_email: '',
      description: '',
      address: '',
    }
  });

  // Load venue data on mount
  useEffect(() => {
    const loadVenueData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`${API_BASE_URL}/venues/${venueId}`, {
          method: 'GET',
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          const venueData = data.data;
          setVenue(venueData);
          setVenueImageUrl(venueData.venue_image_url || '');
          setSelectedAmenities(venueData.amenities || []);
          
          // Parse operating hours from metadata or set defaults
          const hours = venueData.operating_hours || operatingHours;
          setOperatingHours(hours);
          
          // Reset form with venue data
          reset({
            name: venueData.name || '',
            city: venueData.city || '',
            state: venueData.state || '',
            country: venueData.country || '',
            zipcode: venueData.zipcode || '',
            latitude: venueData.latitude || 0,
            longitude: venueData.longitude || 0,
            capacity: venueData.capacity || 0,
            phone: venueData.phone || '',
            email: venueData.email || '',
            website: venueData.website || '',
            description: venueData.description || '',
          });
        } else {
          throw new Error('Venue not found');
        }
      } catch (err) {
        console.error('Error loading venue:', err);
        toast.error('Failed to load venue');
        navigate('/venues');
      } finally {
        setLoading(false);
      }
    };

    loadVenueData();
  }, [venueId, apiRequest, API_BASE_URL, navigate, reset]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setVenueImageUrl(data.fileUrl);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddressSelect = (address) => {
    reset((prev) => ({
      ...prev,
      city: address.city || prev.city,
      state: address.state || prev.state,
      country: address.country || prev.country,
      latitude: address.latitude || prev.latitude,
      longitude: address.longitude || prev.longitude,
    }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError('');

      // Build payload with only fields that exist in the database
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        latitude: formData.latitude,
        longitude: formData.longitude,
        capacity: formData.capacity,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
      };

      // Add image URL if it was uploaded
      if (venueImageUrl) {
        payload.image_url = venueImageUrl;
      }

      // Store amenities as JSON if provided
      if (selectedAmenities.length > 0) {
        payload.facilities = selectedAmenities;
      }

      const response = await apiRequest(`${API_BASE_URL}/venues/${venueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Venue updated successfully!');
        navigate(`/venues/${venueId}`);
      } else {
        setError(data.error || 'Failed to update venue');
        toast.error('Failed to update venue');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Error updating venue');
      toast.error('Error updating venue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading venue...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/venues/${venueId}`)}
          variant="text"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Edit Venue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update venue details step by step
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>

              {/* STEP 0: Basic Info */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Venue Name"
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Description"
                          multiline
                          rows={4}
                          helperText="Describe the venue features and attractions"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="capacity"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Total Capacity"
                          type="number"
                          error={!!errors.capacity}
                          helperText={errors.capacity?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="contact_phone"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Phone Number"
                          type="tel"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="contact_email"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={!!errors.contact_email}
                          helperText={errors.contact_email?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Website"
                          type="url"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        style={{ display: 'none' }}
                        id="venue-image-input"
                      />
                      <label htmlFor="venue-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                        {imageUploading ? (
                          <>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>Uploading image...</Typography>
                          </>
                        ) : venueImageUrl ? (
                          <>
                            <Box
                              component="img"
                              src={venueImageUrl}
                              alt="Venue preview"
                              sx={{ maxHeight: 300, mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Click to change image
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              📸 Upload Venue Image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click to select an image
                            </Typography>
                          </>
                        )}
                      </label>
                    </Paper>
                  </Grid>
                </>
              )}

              {/* STEP 1: Location & Details */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Location & Contact Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <GooglePlacesAutocomplete
                      value={watch('address')}
                      onChange={(value) => setValue('address', value)}
                      label="Address"
                      placeholder="Search for venue location"
                      required
                      onAddressSelect={handleAddressSelect}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="City"
                          error={!!errors.city}
                          helperText={errors.city?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="State/Province"
                          error={!!errors.state}
                          helperText={errors.state?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Country"
                          error={!!errors.country}
                          helperText={errors.country?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="postal_code"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Postal Code"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="latitude"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Latitude"
                          type="number"
                          inputProps={{ step: '0.00001' }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="longitude"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Longitude"
                          type="number"
                          inputProps={{ step: '0.00001' }}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Amenities & Hours */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Amenities & Operating Hours
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Amenities
                    </Typography>
                    <Grid container spacing={2}>
                      {amenitiesOptions.map((amenity) => (
                        <Grid item xs={12} sm={6} md={4} key={amenity}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedAmenities.includes(amenity)}
                                onChange={() => handleAmenityChange(amenity)}
                              />
                            }
                            label={amenity}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Operating Hours
                    </Typography>
                  </Grid>

                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <Grid item xs={12} sm={6} key={day}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography sx={{ minWidth: 80, fontWeight: '500', textTransform: 'capitalize' }}>
                          {day}
                        </Typography>
                        <TextField
                          type="time"
                          size="small"
                          value={operatingHours[`${day}_open`]}
                          onChange={(e) => setOperatingHours({
                            ...operatingHours,
                            [`${day}_open`]: e.target.value
                          })}
                          sx={{ width: 120 }}
                        />
                        <Typography>to</Typography>
                        <TextField
                          type="time"
                          size="small"
                          value={operatingHours[`${day}_close`]}
                          onChange={(e) => setOperatingHours({
                            ...operatingHours,
                            [`${day}_close`]: e.target.value
                          })}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </>
              )}

              {/* STEP 3: Review */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Venue Changes
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {venueImageUrl && (
                    <Grid item xs={12}>
                      <Box
                        component="img"
                        src={venueImageUrl}
                        alt="Venue preview"
                        sx={{ maxHeight: 300, width: '100%', objectFit: 'cover', borderRadius: 1, mb: 3 }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity="info">
                      Please review all changes before submitting. You can go back to edit any section.
                    </Alert>
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/venues/${venueId}`)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ px: 4 }}
                      >
                        {submitting ? 'Updating...' : 'Update Venue'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ px: 4 }}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditVenuePage;
