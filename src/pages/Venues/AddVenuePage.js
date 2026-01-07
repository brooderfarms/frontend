import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GooglePlacesAutocomplete from '../../components/Common/GooglePlacesAutocomplete';
import toast from 'react-hot-toast';

const venueTypes = [
  'stadium',
  'theater',
  'arena',
  'concert_hall',
  'sports_complex',
  'conference_center',
  'airport',
  'bus_station',
  'other',
];

const AddVenuePage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [venueImageUrl, setVenueImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Zimbabwe',
    postal_code: '',
    latitude: '',
    longitude: '',
    capacity: '',
    venue_type: '',
    description: '',
    facilities: '', // comma separated
    layout: '', // JSON string
    has_seating: true,
    is_active: true,
    contact_phone: '',
    contact_email: '',
    operating_hours: '',
    manager_id: user?.id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const steps = ['Basic Info', 'Location & Details', 'Amenities & Hours', 'Review'];

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

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
      
      if (!response.ok) {
        throw new Error(data.message || 'Image upload failed');
      }
      
      setVenueImageUrl(data.fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // parse facilities into array
      const facilitiesArr = form.facilities && form.facilities.trim() !== ''
        ? form.facilities.split(',').map(f => f.trim()).filter(Boolean)
        : null;

      // parse layout JSON if provided
      let layoutObj = null;
      if (form.layout && form.layout.trim() !== '') {
        try {
          layoutObj = JSON.parse(form.layout);
        } catch (err) {
          toast.error('Layout must be valid JSON');
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        name: form.name,
        description: form.description,
        address: form.address,
        city: form.city,
        state: form.state || null,
        country: form.country || null,
        postal_code: form.postal_code || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        venue_type: form.venue_type || null,
        facilities: facilitiesArr,
        layout: layoutObj,
        has_seating: !!form.has_seating,
        is_active: !!form.is_active,
        manager_id: form.manager_id || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        operating_hours: form.operating_hours || null,
      };

      const res = await apiRequest(`${API_BASE_URL}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create venue');
      }

      const data = await res.json();
      toast.success('Venue created');
      const newId = data?.data?.id;
      navigate(newId ? `/venues/${newId}` : '/venues');
    } catch (err) {
      console.error('Create venue error:', err);
      toast.error(err.message || 'Failed to create venue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Add Venue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the venue details step by step. Administrators and venue managers can add new venues.
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

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
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
                    <TextField 
                      fullWidth
                      label="Venue Name" 
                      value={form.name} 
                      onChange={handleChange('name')} 
                      required 
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField 
                      fullWidth
                      label="Description" 
                      value={form.description} 
                      onChange={handleChange('description')} 
                      multiline 
                      rows={4}
                      placeholder="Detailed description of the venue"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Capacity" 
                      value={form.capacity} 
                      onChange={handleChange('capacity')} 
                      type="number"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      select 
                      label="Venue Type" 
                      value={form.venue_type} 
                      onChange={handleChange('venue_type')}
                      required
                    >
                      <MenuItem value="">Select type</MenuItem>
                      {venueTypes.map((t) => (
                        <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              {/* STEP 1: Location & Details */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Venue Image & Location
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
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
                              🏢 Upload Venue Image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click to select an image or drag and drop
                            </Typography>
                          </>
                        )}
                      </label>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Location Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <GooglePlacesAutocomplete
                      value={form.address}
                      onChange={(value) => setForm({ ...form, address: value })}
                      label="Address"
                      placeholder="Search for a venue address"
                      required
                      onAddressSelect={(addressData) => {
                        setForm({
                          ...form,
                          address: addressData.address,
                          city: addressData.city,
                          state: addressData.state,
                          country: addressData.country,
                          latitude: addressData.lat,
                          longitude: addressData.lng,
                        });
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="City" 
                      value={form.city} 
                      onChange={handleChange('city')} 
                      required 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="State" 
                      value={form.state} 
                      onChange={handleChange('state')} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Country" 
                      value={form.country} 
                      onChange={handleChange('country')} 
                      required 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Postal Code" 
                      value={form.postal_code} 
                      onChange={handleChange('postal_code')} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Latitude" 
                      value={form.latitude} 
                      onChange={handleChange('latitude')} 
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Longitude" 
                      value={form.longitude} 
                      onChange={handleChange('longitude')} 
                      disabled
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Amenities & Hours */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Amenities & Hours
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField 
                      fullWidth
                      label="Facilities (comma separated)" 
                      value={form.facilities} 
                      onChange={handleChange('facilities')} 
                      placeholder="e.g. Parking, Wheelchair Access, WiFi"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField 
                      fullWidth
                      label="Operating Hours" 
                      value={form.operating_hours} 
                      onChange={handleChange('operating_hours')} 
                      multiline 
                      rows={2}
                      placeholder="Mon-Fri: 09:00-17:00, Sat: 10:00-16:00"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Contact Phone" 
                      value={form.contact_phone} 
                      onChange={handleChange('contact_phone')} 
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      label="Contact Email" 
                      value={form.contact_email} 
                      onChange={handleChange('contact_email')} 
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Configuration
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField 
                      fullWidth
                      label="Layout (JSON)" 
                      value={form.layout} 
                      onChange={handleChange('layout')} 
                      multiline 
                      rows={3}
                      placeholder='{"sections": [...]} (optional)'
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          checked={form.has_seating} 
                          onChange={(e) => setForm(prev => ({ ...prev, has_seating: e.target.checked }))} 
                        />
                      } 
                      label="Has Seating" 
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          checked={form.is_active} 
                          onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))} 
                        />
                      } 
                      label="Is Active" 
                    />
                  </Grid>
                </>
              )}

              {/* STEP 3: Review */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Venue Details
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
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Venue Name</Typography>
                        <Typography variant="body2">{form.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Location</Typography>
                        <Typography variant="body2">{form.city}, {form.state}, {form.country}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Capacity & Type</Typography>
                        <Typography variant="body2">{form.capacity} • {form.venue_type?.replace('_', ' ')}</Typography>
                      </Box>
                    </Box>
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
                      onClick={() => navigate('/venues')}
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
                        {submitting ? 'Creating Venue...' : 'Create Venue'}
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

export default AddVenuePage;
