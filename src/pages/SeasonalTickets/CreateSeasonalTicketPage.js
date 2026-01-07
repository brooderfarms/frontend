import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { ArrowBack, CloudUpload, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const seasonPassSchema = yup.object({
  name: yup.string().required('Season pass name is required'),
  description: yup.string().max(500, 'Description must be under 500 characters'),
  season_year: yup.number().required('Season year is required').positive().integer(),
  season_type: yup.string().required('Season type is required'),
  start_date: yup.string().required('Start date is required'),
  end_date: yup.string().required('End date is required'),
  base_price: yup.number().required('Base price is required').positive(),
  season_price: yup.number().required('Season price is required').positive(),
  available_quantity: yup.number().required('Quantity is required').positive().integer(),
  status: yup.string().required('Status is required'),
});

const CreateSeasonalTicketPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [seasonalTicketImage, setSeasonalTicketImage] = useState(null);
  const [seasonalTicketImageUrl, setSeasonalTicketImageUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(seasonPassSchema),
    defaultValues: {
      name: '',
      description: '',
      season_year: new Date().getFullYear(),
      season_type: 'custom',
      start_date: '',
      end_date: '',
      base_price: '',
      season_price: '',
      available_quantity: '',
      status: 'draft',
    },
  });

  const formValues = watch();
  const discountPercent = formValues.base_price && formValues.season_price
    ? (((formValues.base_price - formValues.season_price) / formValues.base_price) * 100).toFixed(0)
    : 0;

  React.useEffect(() => {
    fetchAvailableEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/events?status=published&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setAvailableEvents(data.data.events || []);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Image upload failed');

      setSeasonalTicketImageUrl(data.fileUrl);
      setSeasonalTicketImage(file);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError('');

      const payload = {
        ...data,
        image_url: seasonalTicketImageUrl,
        discount_percentage: parseFloat(discountPercent),
      };

      const response = await apiRequest(`${API_BASE_URL}/seasonal-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create season pass');
      }

      const seasonalTicketId = result.data.id;

      // Add selected events to the season pass
      for (const eventId of selectedEvents) {
        await apiRequest(`${API_BASE_URL}/seasonal-tickets/${seasonalTicketId}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId }),
        });
      }

      toast.success('Season pass created successfully!');
      navigate(`/organizer#season-passes`);
    } catch (err) {
      console.error('Create season pass error:', err);
      setError(err.message || 'Failed to create season pass');
      toast.error(err.message || 'Failed to create season pass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info
      if (!formValues.name || !formValues.season_year) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const steps = ['Basic Info', 'Pricing', 'Events', 'Review'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/organizer')}
          variant="text"
        >
          Back to Dashboard
        </Button>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
          Create Season Pass
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

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
              {/* Step 0: Basic Info */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                          label="Season Pass Name"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          placeholder="e.g., Summer Concert Series 2026"
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
                          label="Description"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          placeholder="Describe your season pass..."
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_year"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Season Year"
                          type="number"
                          fullWidth
                          error={!!errors.season_year}
                          helperText={errors.season_year?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_type"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.season_type}>
                          <InputLabel>Season Type</InputLabel>
                          <Select
                            {...field}
                            label="Season Type"
                          >
                            <MenuItem value="spring">Spring</MenuItem>
                            <MenuItem value="summer">Summer</MenuItem>
                            <MenuItem value="fall">Fall</MenuItem>
                            <MenuItem value="winter">Winter</MenuItem>
                            <MenuItem value="full-year">Full Year</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Start Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.start_date}
                          helperText={errors.start_date?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="End Date"
                          type="date"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.end_date}
                          helperText={errors.end_date?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Image Upload */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Season Pass Image
                    </Typography>
                    <Box
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: '#f9f9f9',
                        '&:hover': { bgcolor: '#f0f0f0' },
                      }}
                      component="label"
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2">
                        {seasonalTicketImage?.name || 'Click to upload image'}
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}

              {/* Step 1: Pricing */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Pricing Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="base_price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Regular Price"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          fullWidth
                          error={!!errors.base_price}
                          helperText={errors.base_price?.message}
                          startAdornment="$"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="season_price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Season Pass Price"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          fullWidth
                          error={!!errors.season_price}
                          helperText={errors.season_price?.message}
                          startAdornment="$"
                        />
                      )}
                    />
                  </Grid>

                  {/* Discount Preview */}
                  {formValues.base_price && formValues.season_price && (
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: 'success.light' }}>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Discount Summary
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Regular Price
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                ${formValues.base_price}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Season Price
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                ${formValues.season_price}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Savings
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {discountPercent}% off
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Controller
                      name="available_quantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Number of Passes to Sell"
                          type="number"
                          fullWidth
                          error={!!errors.available_quantity}
                          helperText={errors.available_quantity?.message}
                          placeholder="e.g., 100"
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Step 2: Add Events */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Include Events
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Select which events this season pass includes
                    </Typography>

                    {eventsLoading ? (
                      <CircularProgress />
                    ) : availableEvents.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {availableEvents.map((event) => (
                          <Card
                            key={event.id}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: selectedEvents.includes(event.id) ? 'primary.light' : 'white',
                              border: selectedEvents.includes(event.id) ? '2px solid' : '1px solid',
                              borderColor: selectedEvents.includes(event.id) ? 'primary.main' : 'divider',
                              p: 2,
                              transition: 'all 0.2s',
                              '&:hover': { boxShadow: 2 },
                            }}
                            onClick={() =>
                              setSelectedEvents((prev) =>
                                prev.includes(event.id)
                                  ? prev.filter((id) => id !== event.id)
                                  : [...prev, event.id]
                              )
                            }
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {selectedEvents.includes(event.id) && (
                                <CheckCircle sx={{ color: 'primary.main' }} />
                              )}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(event.start_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info">No published events available</Alert>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Selected Events: {selectedEvents.length}
                    </Typography>
                    {selectedEvents.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {selectedEvents.map((id) => {
                          const event = availableEvents.find((e) => e.id === id);
                          return (
                            <Chip
                              key={id}
                              label={event?.title}
                              onDelete={() =>
                                setSelectedEvents((prev) => prev.filter((eid) => eid !== id))
                              }
                              sx={{ mr: 1, mb: 1 }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Grid>
                </>
              )}

              {/* Step 3: Review */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Your Season Pass
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formValues.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Season
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formValues.season_type} {formValues.season_year}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Regular Price
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ${formValues.base_price}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Season Price
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              ${formValues.season_price} ({discountPercent}% off)
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Passes to Sell
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {formValues.available_quantity}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary">
                              Events Included
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {selectedEvents.length}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    Back
                  </Button>

                  {activeStep === steps.length - 1 ? (
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <FormControl sx={{ minWidth: 200 }}>
                          <InputLabel>Publish Status</InputLabel>
                          <Select
                            {...field}
                            label="Publish Status"
                          >
                            <MenuItem value="draft">Save as Draft</MenuItem>
                            <MenuItem value="published">Publish Now</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  ) : null}

                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <CircularProgress size={24} />
                    ) : activeStep === steps.length - 1 ? (
                      'Create Season Pass'
                    ) : (
                      'Next'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateSeasonalTicketPage;
