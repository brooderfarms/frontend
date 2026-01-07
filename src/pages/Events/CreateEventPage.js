import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import AutocompleteField from '../../components/Common/AutocompleteField';
import EventTicketTemplatesManager from '../../components/Events/EventTicketTemplatesManager';
import VirtualEventConfig from '../../components/Events/VirtualEventConfig';

const schema = yup.object({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  short_description: yup.string().max(500, 'Short description must be less than 500 characters'),
  event_type: yup.string().required('Event type is required'),
  category: yup.string().required('Category is required'),
  // organizer_id: optional because for organizers/venue_managers it's auto-filled from user.id
  // For admins, they must select from dropdown - backend will validate if missing
  organizer_id: yup.string().optional(),
  venue_id: yup.string().required('Venue is required'),
  start_date: yup.date().required('Start date is required').typeError('Start date must be valid'),
  end_date: yup.date().required('End date is required').typeError('End date must be valid'),
  base_price: yup.number().min(0, 'Price must be positive'),
  total_capacity: yup.number().required('Total capacity is required').min(1, 'Capacity must be at least 1'),
  min_age: yup.number().min(0, 'Minimum age cannot be negative'),
  digital_format: yup.string(),
});

const CreateEventPage = () => {
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStreamingEvent, setIsStreamingEvent] = useState(false);
  const [ticketFormat, setTicketFormat] = useState('digital');
  const [selectedTicketTypes, setSelectedTicketTypes] = useState(['standard', 'vip', 'premium']);
  const [ticketTypeQuantities, setTicketTypeQuantities] = useState({
    standard: 100,
    vip: 50,
    premium: 30,
  });
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const availableTicketTypeOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'vip', label: 'VIP' },
    { value: 'premium', label: 'Premium' },
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first_class', label: 'First Class' },
  ];

  const categories = [
    'music', 'sports_soccer', 'sports_cricket', 'sports_other',
    'arts', 'business', 'travel_bus', 'travel_flight', 'entertainment', 'other'
  ];

  const eventTypes = [
    'concert', 'sports', 'theater', 'conference', 'festival',
    'exhibition', 'bus_trip', 'flight', 'other'
  ];

  const digitalFormats = [
    { value: 'qr_code', label: 'QR Code' },
    { value: 'nfc', label: 'NFC' },
    { value: 'rfid', label: 'RFID' },
    { value: 'barcode', label: 'Barcode' }
  ];

  const steps = ['Event Mode', 'Basic Info', 'Media & Details', 'Pricing & Tickets', 'Review', 'Ticket Templates (Optional)'];

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
      
      setEventImageUrl(data.fileUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      event_type: 'concert',
      category: 'music',
      organizer_id: user?.role === 'organizer' ? user.id : '',
      min_age: 0,
    },
  });

  const fetchVenues = useCallback(async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/venues?limit=100`);
      if (response.ok) {
        const data = await response.json();
        setVenues(data.data.venues);
      }
    } catch (err) {
      console.error('Fetch venues error:', err);
    }
  }, [apiRequest, API_BASE_URL]);

  const fetchOrganizers = useCallback(async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/users/organizers?limit=100`);
      if (response.ok) {
        const data = await response.json();
        // Handle both response structures
        const organizersList = data.data || [];
        setOrganizers(Array.isArray(organizersList) ? organizersList : []);
      }
    } catch (err) {
      console.error('Fetch organizers error:', err);
      setOrganizers([]);
    }
  }, [apiRequest, API_BASE_URL]);

  useEffect(() => {
    fetchVenues();
    fetchOrganizers();
  }, [fetchVenues, fetchOrganizers]);

  // Fetch available ticket templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await apiRequest(`${API_BASE_URL}/ticket-templates`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setTemplates(result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, [apiRequest, API_BASE_URL]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Only include fields that exist in the database schema
      const allowedFields = [
        'title', 'description', 'short_description', 'event_type', 'category',
        'venue_id', 'organizer_id', 'start_date', 'end_date', 'base_price',
        'currency', 'total_capacity', 'status', 'event_image_url', 'tags',
        'terms_and_conditions', 'refund_policy', 'is_featured', 'requires_approval',
        'min_age', 'has_seating', 'ticket_template_id', 'event_mode', 'virtual_event_type', 
        'meeting_platform', 'meeting_link', 'meeting_id', 'meeting_password',
        'recording_url', 'max_attendees', 'technical_requirements', 'access_instructions',
        'requires_registration', 'sends_reminder_email', 'reminder_hours_before',
        'chat_enabled', 'screen_share_enabled', 'breakout_rooms_enabled', 'q_and_a_enabled',
        'polling_enabled', 'recording_available_after_event', 'auto_record',
        'allow_virtual_attendees', 'virtual_ticket_price', 'virtual_capacity',
        'host_name', 'host_email', 'host_bio', 'host_image_url', 'additional_speakers',
        'learning_objectives', 'provides_certificate', 'certificate_template_url',
        'certificate_text', 'issuing_organization', 'is_streaming_event'
      ];

      const eventData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
        is_streaming_event: isStreamingEvent,
        event_image_url: eventImageUrl,
        ticket_template_id: selectedTemplate || null,
      };

      // Clean: only keep allowed fields and remove undefined/null/empty values
      const cleanedData = Object.entries(eventData).reduce((acc, [key, value]) => {
        if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await apiRequest(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          response: result
        });
        throw new Error(result.message || 'Failed to create event');
      }

      if (!result.data || !result.data.id) {
        console.error('Invalid response data:', result);
        throw new Error('Event was created but response data is invalid');
      }

      console.log('Event created successfully:', result.data);
      toast.success('Event created successfully!');
      setCreatedEvent(result.data);
      
      // Redirect to event details or dashboard
      setTimeout(() => {
        if (user?.role === 'organizer') {
          navigate('/organizer');
        } else if (user?.role === 'admin') {
          navigate('/admin-dashboard?tab=events');
        }
      }, 1500);
    } catch (err) {
      console.error('Create event error:', err);
      setError(err.message || 'Failed to create event');
      toast.error(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create New Event
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill in the details to create your event. This is a step-by-step process.
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

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              
              {/* STEP 0: Event Mode (Virtual/In-Person) */}
              {activeStep === 0 && (
                <Grid item xs={12}>
                  <VirtualEventConfig control={control} watch={watch} setValue={setValue} />
                </Grid>
              )}

              {/* STEP 1: Basic Information */}
              {activeStep === 1 && (
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
                      label="Event Title"
                      {...register('title')}
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Short Description"
                      multiline
                      rows={2}
                      {...register('short_description')}
                      error={!!errors.short_description}
                      helperText={errors.short_description?.message}
                      placeholder="Brief description for event listings"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Description"
                      multiline
                      rows={4}
                      {...register('description')}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      required
                      placeholder="Detailed description of the event"
                    />
                  </Grid>

                  {/* Event Classification */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Event Classification
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="event_type"
                      control={control}
                      defaultValue="concert"
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.event_type}>
                          <InputLabel>Event Type</InputLabel>
                          <Select {...field} label="Event Type">
                            {eventTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type.replace('_', ' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="category"
                      control={control}
                      defaultValue="music"
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.category}>
                          <InputLabel>Category</InputLabel>
                          <Select {...field} label="Category">
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category.replace('_', ' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Venue Selection */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Venue & Capacity
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <AutocompleteField
                      name="venue_id"
                      control={control}
                      options={venues}
                      label="Venue"
                      placeholder="Select a venue"
                      error={errors.venue_id}
                      required
                      loading={venues.length === 0}
                      getOptionLabel={(option) => `${option.name} - ${option.city} (${option.capacity} capacity)`}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.city} • Capacity: {option.capacity} • {option.venue_type?.replace('_', ' ')}
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Total Capacity"
                      type="number"
                      {...register('total_capacity')}
                      error={!!errors.total_capacity}
                      helperText={errors.total_capacity?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Minimum Age"
                      type="number"
                      {...register('min_age')}
                      error={!!errors.min_age}
                      helperText={errors.min_age?.message}
                      defaultValue={0}
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Media & Details */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Event Image & Media
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
                        id="image-input"
                      />
                      <label htmlFor="image-input" style={{ cursor: 'pointer', display: 'block' }}>
                        {imageUploading ? (
                          <>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>Uploading image...</Typography>
                          </>
                        ) : eventImageUrl ? (
                          <>
                            <Box
                              component="img"
                              src={eventImageUrl}
                              alt="Event preview"
                              sx={{ maxHeight: 300, mb: 2, borderRadius: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Click to change image
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              📷 Upload Event Image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click to select an image or drag and drop
                            </Typography>
                          </>
                        )}
                      </label>
                    </Paper>
                  </Grid>

                  {/* Organizer Selection */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Organizer Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {user?.role === 'organizer' || user?.role === 'venue_manager' ? (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          You are creating this event as: <strong>{user.first_name} {user.last_name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Email: {user.email}
                        </Typography>
                      </Alert>
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <AutocompleteField
                        name="organizer_id"
                        control={control}
                        options={organizers}
                        label="Event Organizer"
                        placeholder="Select an organizer"
                        error={errors.organizer_id}
                        required
                        loading={organizers.length === 0}
                        getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {option.first_name} {option.last_name}
                              </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.email} • {option.phone || 'No phone'}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      />
                    </Grid>
                  )}

                  {/* Streaming Event Toggle */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Streaming Options
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isStreamingEvent}
                          onChange={(e) => setIsStreamingEvent(e.target.checked)}
                        />
                      }
                      label="This is a streaming event (pay-per-view)"
                    />
                  </Grid>

                  {isStreamingEvent && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="stream_provider"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.stream_provider}>
                              <InputLabel>Stream Provider</InputLabel>
                              <Select {...field} label="Stream Provider">
                                <MenuItem value="youtube">YouTube</MenuItem>
                                <MenuItem value="twitch">Twitch</MenuItem>
                                <MenuItem value="vimeo">Vimeo</MenuItem>
                                <MenuItem value="zoom">Zoom</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Streaming Price (USD)"
                          type="number"
                          step="0.01"
                          {...register('streaming_price')}
                          error={!!errors.streaming_price}
                          helperText={errors.streaming_price?.message}
                          placeholder="Leave empty to use base price"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Stream URL"
                          {...register('stream_url')}
                          error={!!errors.stream_url}
                          helperText={errors.stream_url?.message}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Stream Embed Code"
                          multiline
                          rows={3}
                          {...register('stream_embed_code')}
                          error={!!errors.stream_embed_code}
                          helperText={errors.stream_embed_code?.message}
                          placeholder="<iframe>...</iframe>"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register('allow_replay')}
                            />
                          }
                          label="Allow viewers to watch replay after live stream"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Stream Description"
                          multiline
                          rows={2}
                          {...register('stream_description')}
                          error={!!errors.stream_description}
                          helperText={errors.stream_description?.message}
                          placeholder="Additional information about the streaming setup"
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}

              {/* STEP 3: Pricing & Tickets */}
              {activeStep === 3 && (
                <>
                  {/* Date & Time */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Date & Time
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date & Time"
                      type="datetime-local"
                      {...register('start_date')}
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date & Time"
                      type="datetime-local"
                      {...register('end_date')}
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  {/* Pricing */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Pricing
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Base Price (USD)"
                      type="number"
                      step="0.01"
                      {...register('base_price')}
                      error={!!errors.base_price}
                      helperText={errors.base_price?.message}
                      placeholder="0.00"
                    />
                  </Grid>

                  {/* Ticket Format Selection */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Ticket Format
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Ticket Format</InputLabel>
                      <Select
                        value={ticketFormat}
                        label="Ticket Format"
                        onChange={(e) => setTicketFormat(e.target.value)}
                      >
                        <MenuItem value="digital">Digital</MenuItem>
                        <MenuItem value="physical">Physical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {ticketFormat === 'digital' && (
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="digital_format"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.digital_format}>
                            <InputLabel>Digital Format</InputLabel>
                            <Select {...field} label="Digital Format">
                              {digitalFormats.map((format) => (
                                <MenuItem key={format.value} value={format.value}>
                                  {format.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.digital_format && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                                {errors.digital_format.message}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}

                  {/* Available Ticket Types */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Ticket Types
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Available Ticket Types</InputLabel>
                      <Select
                        multiple
                        label="Available Ticket Types"
                        value={selectedTicketTypes}
                        onChange={(e) => setSelectedTicketTypes(e.target.value)}
                      >
                        {availableTicketTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Ticket Type Quantities */}
                  {selectedTicketTypes.length > 0 && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2, mb: 2 }}>
                          Quantity for Each Ticket Type
                        </Typography>
                      </Grid>
                      <Grid container spacing={2} sx={{ pl: 1, pr: 1 }}>
                        {selectedTicketTypes.map((type) => (
                          <Grid item xs={12} sm={6} key={type}>
                            <TextField
                              fullWidth
                              label={`${type.charAt(0).toUpperCase() + type.slice(1)} - Quantity`}
                              type="number"
                              value={ticketTypeQuantities[type] || 0}
                              onChange={(e) =>
                                setTicketTypeQuantities(prev => ({
                                  ...prev,
                                  [type]: parseInt(e.target.value) || 0
                                }))
                              }
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}

                  {/* Ticket Template Selection */}
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Ticket Template (Optional)
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      Select a pre-designed ticket template for this event. You can also add or modify templates later.
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Ticket Template</InputLabel>
                      <Select
                        value={selectedTemplate}
                        label="Ticket Template"
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        disabled={templatesLoading}
                      >
                        <MenuItem value="">
                          <em>None - Use Default</em>
                        </MenuItem>
                        {templates.map((template) => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.name} ({template.ticket_format})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              {activeStep === 4 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Event Details
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                   {/* Event Preview Card */}
                   <Grid item xs={12}>
                     <Card sx={{ overflow: 'hidden' }}>
                       {eventImageUrl && (
                         <Box
                           component="img"
                           src={eventImageUrl}
                           alt="Event preview"
                           sx={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                         />
                       )}
                       <CardContent>
                         {/* Title and Status */}
                         <Box sx={{ mb: 3 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                             <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                               {getValues('title')}
                             </Typography>
                             <Chip
                               label={getValues('event_type') || 'Event'}
                               color="primary"
                               size="small"
                             />
                           </Box>
                           <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                             {getValues('short_description') || getValues('description')}
                           </Typography>
                         </Box>

                         <Divider sx={{ my: 2 }} />

                         {/* Event Details Grid */}
                         <Grid container spacing={3}>
                           {/* Date and Time */}
                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               Start Date & Time
                             </Typography>
                             <Typography variant="body1">
                               {getValues('start_date') ? new Date(getValues('start_date')).toLocaleDateString('en-US', {
                                 weekday: 'long',
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit'
                               }) : 'Not set'}
                             </Typography>
                           </Grid>

                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               End Date & Time
                             </Typography>
                             <Typography variant="body1">
                               {getValues('end_date') ? new Date(getValues('end_date')).toLocaleDateString('en-US', {
                                 weekday: 'long',
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit'
                               }) : 'Not set'}
                             </Typography>
                           </Grid>

                           {/* Venue */}
                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               Venue
                             </Typography>
                             <Typography variant="body1">
                               {venues.find(v => v.id === getValues('venue_id'))?.name || 'Not selected'}
                             </Typography>
                           </Grid>

                           {/* Category */}
                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               Category
                             </Typography>
                             <Typography variant="body1">
                               {getValues('category') || 'Not set'}
                             </Typography>
                           </Grid>

                           {/* Capacity */}
                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               Total Capacity
                             </Typography>
                             <Typography variant="body1">
                               {getValues('total_capacity') || 'Not set'} seats
                             </Typography>
                           </Grid>

                           {/* Base Price */}
                           <Grid item xs={12} sm={6}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary' }}>
                               Base Price
                             </Typography>
                             <Typography variant="body1">
                               ${parseFloat(getValues('base_price') || 0).toFixed(2)}
                             </Typography>
                           </Grid>

                           {/* Event Type Details */}
                           {getValues('is_streaming') && (
                             <Grid item xs={12}>
                               <Alert severity="info" sx={{ mb: 2 }}>
                                 <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                   Virtual Event Configuration
                                 </Typography>
                                 <Typography variant="body2">
                                   Streaming Link: {getValues('streaming_url') ? 'Configured' : 'Not configured'}
                                 </Typography>
                               </Alert>
                             </Grid>
                           )}

                           {/* Full Description */}
                           <Grid item xs={12}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'textSecondary', mb: 1 }}>
                               Full Description
                             </Typography>
                             <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                               {getValues('description')}
                             </Typography>
                           </Grid>
                         </Grid>
                       </CardContent>
                     </Card>
                   </Grid>

                   {/* Event Status */}
                   <Grid item xs={12}>
                     <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                       Publish Event
                     </Typography>
                     <Controller
                       name="status"
                       control={control}
                       defaultValue="draft"
                       render={({ field }) => (
                         <FormControl fullWidth>
                           <InputLabel>Event Status</InputLabel>
                           <Select {...field} label="Event Status">
                             <MenuItem value="draft">
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Chip label="Draft" size="small" color="warning" variant="outlined" />
                                 <Typography variant="body2">Save as draft (not visible to customers)</Typography>
                               </Box>
                             </MenuItem>
                             <MenuItem value="published">
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Chip label="Published" size="small" color="success" variant="outlined" />
                                 <Typography variant="body2">Publish immediately (visible to customers)</Typography>
                               </Box>
                             </MenuItem>
                           </Select>
                         </FormControl>
                       )}
                     />
                   </Grid>

                   <Grid item xs={12}>
                     <Alert severity="success" sx={{ mt: 3 }}>
                       ✓ All details look good! Click the submit button to create your event.
                     </Alert>
                   </Grid>
                 </>
               )}

               {/* STEP 5: Ticket Templates */}
               {activeStep === 5 && createdEvent && (
                 <>
                   <Grid item xs={12}>
                     <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      Attach ticket templates to define ticket types and pricing for your event. You can skip this and add templates later.
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <EventTicketTemplatesManager
                      eventId={createdEvent.id}
                      apiRequest={apiRequest}
                      API_BASE_URL={API_BASE_URL}
                    />
                  </Grid>
                </>
              )}

              {/* Navigation Buttons */}
              <Grid item xs={12} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    type="button"
                    disabled={activeStep === 0 || activeStep === 1}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/events')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    {activeStep === 4 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ px: 4 }}
                      >
                        {loading ? 'Creating Event...' : 'Create Event'}
                      </Button>
                    ) : activeStep === steps.length - 1 ? (
                      <Button
                        type="button"
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/events')}
                        sx={{ px: 4 }}
                      >
                        Complete & Go to Events
                      </Button>
                    ) : (
                      <Button
                        type="button"
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

export default CreateEventPage;
