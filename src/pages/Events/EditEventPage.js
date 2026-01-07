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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import AutocompleteField from '../../components/Common/AutocompleteField';
import VirtualEventConfig from '../../components/Events/VirtualEventConfig';
import { ArrowBack } from '@mui/icons-material';

const schema = yup.object({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  short_description: yup.string().max(500, 'Short description must be less than 500 characters'),
  event_type: yup.string().required('Event type is required'),
  category: yup.string().required('Category is required'),
  organizer_id: yup.string().required('Organizer is required'),
  venue_id: yup.string().required('Venue is required'),
  start_date: yup.date().required('Start date is required').typeError('Start date must be valid'),
  end_date: yup.date().required('End date is required').typeError('End date must be valid'),
  base_price: yup.number().min(0, 'Price must be positive'),
  total_capacity: yup.number().required('Total capacity is required').min(1, 'Capacity must be at least 1'),
  min_age: yup.number().min(0, 'Minimum age cannot be negative'),
  digital_format: yup.string(),
});

const EditEventPage = () => {
  const { eventId } = useParams();
  const { apiRequest, API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const [virtualEventData, setVirtualEventData] = useState({
    event_mode: 'in_person',
    virtual_event_type: '',
    meeting_platform: '',
    meeting_link: '',
    meeting_id: '',
    meeting_password: '',
    max_attendees: '',
    access_instructions: '',
    technical_requirements: '',
    requires_registration: true,
    sends_reminder_email: true,
    reminder_hours_before: 24,
    chat_enabled: false,
    screen_share_enabled: false,
    breakout_rooms_enabled: false,
    q_and_a_enabled: false,
    polling_enabled: false,
    recording_available_after_event: false,
    auto_record: false,
    allow_virtual_attendees: false,
    virtual_ticket_price: '',
    virtual_capacity: '',
    host_name: '',
    host_email: '',
    host_bio: '',
    host_image_url: '',
    additional_speakers: [],
    learning_objectives: [],
    provides_certificate: false,
    certificate_template_url: '',
    certificate_text: '',
    issuing_organization: '',
  });

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

  const steps = ['Event Mode', 'Basic Info', 'Media & Details', 'Pricing & Tickets', 'Review'];

  const { control, handleSubmit, watch, reset, setValue: formSetValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      event_type: '',
      category: '',
      organizer_id: '',
      venue_id: '',
      start_date: '',
      end_date: '',
      base_price: 0,
      total_capacity: 0,
      min_age: 0,
      digital_format: 'qr_code',
    }
  });

  // Load event data on mount
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`${API_BASE_URL}/events/${eventId}`, {
          method: 'GET',
        });

        const data = await response.json();
        
        if (response.ok && data.data) {
          const eventData = data.data;
          setEvent(eventData);
          setEventImageUrl(eventData.event_image_url || '');
          setIsStreamingEvent(eventData.is_streaming || false);
          setTicketFormat(eventData.digital_format || 'digital');
          
          // Set virtual event data
          setVirtualEventData({
            event_mode: eventData.event_mode || 'in_person',
            virtual_event_type: eventData.virtual_event_type || '',
            meeting_platform: eventData.meeting_platform || '',
            meeting_link: eventData.meeting_link || '',
            meeting_id: eventData.meeting_id || '',
            meeting_password: eventData.meeting_password || '',
            max_attendees: eventData.max_attendees || '',
            access_instructions: eventData.access_instructions || '',
            technical_requirements: eventData.technical_requirements || '',
            requires_registration: eventData.requires_registration !== false,
            sends_reminder_email: eventData.sends_reminder_email !== false,
            reminder_hours_before: eventData.reminder_hours_before || 24,
            chat_enabled: eventData.chat_enabled || false,
            screen_share_enabled: eventData.screen_share_enabled || false,
            breakout_rooms_enabled: eventData.breakout_rooms_enabled || false,
            q_and_a_enabled: eventData.q_and_a_enabled || false,
            polling_enabled: eventData.polling_enabled || false,
            recording_available_after_event: eventData.recording_available_after_event || false,
            auto_record: eventData.auto_record || false,
            allow_virtual_attendees: eventData.allow_virtual_attendees || false,
            virtual_ticket_price: eventData.virtual_ticket_price || '',
            virtual_capacity: eventData.virtual_capacity || '',
            host_name: eventData.host_name || '',
            host_email: eventData.host_email || '',
            host_bio: eventData.host_bio || '',
            host_image_url: eventData.host_image_url || '',
            additional_speakers: eventData.additional_speakers || [],
            learning_objectives: eventData.learning_objectives || [],
            provides_certificate: eventData.provides_certificate || false,
            certificate_template_url: eventData.certificate_template_url || '',
            certificate_text: eventData.certificate_text || '',
            issuing_organization: eventData.issuing_organization || '',
          });
          
          // Reset form with event data
          reset({
            title: eventData.title || '',
            description: eventData.description || '',
            short_description: eventData.short_description || '',
            event_type: eventData.event_type || '',
            category: eventData.category || '',
            organizer_id: eventData.organizer_id || '',
            venue_id: eventData.venue_id || '',
            start_date: eventData.start_date ? new Date(eventData.start_date).toISOString().slice(0, 16) : '',
            end_date: eventData.end_date ? new Date(eventData.end_date).toISOString().slice(0, 16) : '',
            base_price: eventData.base_price || 0,
            total_capacity: eventData.total_capacity || 0,
            min_age: eventData.min_age || 0,
            digital_format: eventData.digital_format || 'qr_code',
          });
          // Also populate virtual event fields into the form so components using react-hook-form can read them
          const ve = {
            event_mode: eventData.event_mode || 'in_person',
            virtual_event_type: eventData.virtual_event_type || '',
            meeting_platform: eventData.meeting_platform || '',
            meeting_link: eventData.meeting_link || '',
            meeting_id: eventData.meeting_id || '',
            meeting_password: eventData.meeting_password || '',
            max_attendees: eventData.max_attendees || '',
            access_instructions: eventData.access_instructions || '',
            technical_requirements: eventData.technical_requirements || '',
            requires_registration: eventData.requires_registration !== false,
            sends_reminder_email: eventData.sends_reminder_email !== false,
            reminder_hours_before: eventData.reminder_hours_before || 24,
            chat_enabled: eventData.chat_enabled || false,
            screen_share_enabled: eventData.screen_share_enabled || false,
            breakout_rooms_enabled: eventData.breakout_rooms_enabled || false,
            q_and_a_enabled: eventData.q_and_a_enabled || false,
            polling_enabled: eventData.polling_enabled || false,
            recording_available_after_event: eventData.recording_available_after_event || false,
            auto_record: eventData.auto_record || false,
            allow_virtual_attendees: eventData.allow_virtual_attendees || false,
            virtual_ticket_price: eventData.virtual_ticket_price || '',
            virtual_capacity: eventData.virtual_capacity || '',
            host_name: eventData.host_name || '',
            host_email: eventData.host_email || '',
            host_bio: eventData.host_bio || '',
            host_image_url: eventData.host_image_url || '',
            additional_speakers: eventData.additional_speakers || [],
            learning_objectives: eventData.learning_objectives || [],
            provides_certificate: eventData.provides_certificate || false,
            certificate_template_url: eventData.certificate_template_url || '',
            certificate_text: eventData.certificate_text || '',
            issuing_organization: eventData.issuing_organization || '',
          };
          Object.keys(ve).forEach((k) => {
            try {
              formSetValue(k, ve[k]);
            } catch (err) {
              // ignore if formSetValue can't set (defensive)
            }
          });
        } else {
          throw new Error('Event not found');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        toast.error('Failed to load event');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    const loadVenues = async () => {
      try {
        const response = await apiRequest(`${API_BASE_URL}/venues`, { method: 'GET' });
        const data = await response.json();
        setVenues(data.data || []);
      } catch (err) {
        console.error('Error loading venues:', err);
      }
    };

    const loadOrganizers = async () => {
      try {
        const response = await apiRequest(`${API_BASE_URL}/users?role=organizer`, { method: 'GET' });
        const data = await response.json();
        setOrganizers(data.data || []);
      } catch (err) {
        console.error('Error loading organizers:', err);
      }
    };

    loadEventData();
    loadVenues();
    loadOrganizers();
  }, [eventId, apiRequest, API_BASE_URL, navigate, reset]);

  // Load ticket templates
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
          // Set selected template if event has one
          if (event?.ticket_template_id) {
            setSelectedTemplate(event.ticket_template_id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, [apiRequest, API_BASE_URL, event?.ticket_template_id]);

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
        setEventImageUrl(data.fileUrl);
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

      const payload = {
        ...formData,
        event_image_url: eventImageUrl,
        is_streaming: isStreamingEvent,
        digital_format: ticketFormat,
        ticket_template_id: selectedTemplate || null,
        ...virtualEventData,
      };

      const response = await apiRequest(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event updated successfully!');
        navigate(`/events/${eventId}`);
      } else {
        setError(data.error || 'Failed to update event');
        toast.error('Failed to update event');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Error updating event');
      toast.error('Error updating event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading event...
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
          onClick={() => navigate(`/events/${eventId}`)}
          variant="text"
        >
          Back
        </Button>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Edit Event
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update event details step by step
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
              
              {/* STEP 0: Event Mode */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Event Mode & Virtual Configuration
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <VirtualEventConfig
                      control={control}
                      watch={watch}
                      setValue={(name, value) => {
                        try { formSetValue(name, value); } catch (e) {}
                        setVirtualEventData((prev) => ({ ...prev, [name]: value }));
                      }}
                      formData={virtualEventData}
                      onFormDataChange={setVirtualEventData}
                    />
                  </Grid>
                </>
              )}

              {/* STEP 1: Basic Info */}
              {activeStep === 1 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Event Title"
                          error={!!errors.title}
                          helperText={errors.title?.message}
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
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="short_description"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Short Description"
                          multiline
                          rows={2}
                          helperText="Optional brief description"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="event_type"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          select
                          label="Event Type"
                          error={!!errors.event_type}
                          helperText={errors.event_type?.message}
                          required
                        >
                          <MenuItem value="">Select type</MenuItem>
                          {eventTypes.map((t) => (
                            <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          select
                          label="Category"
                          error={!!errors.category}
                          helperText={errors.category?.message}
                          required
                        >
                          <MenuItem value="">Select category</MenuItem>
                          {categories.map((c) => (
                            <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <AutocompleteField
                      name="venue_id"
                      control={control}
                      label="Venue"
                      options={venues}
                      getOptionLabel={(option) => option.name || ''}
                      isOptionEqualToValue={(option, value) => option.id === value}
                      required
                      error={errors.venue_id}
                      helperText={errors.venue_id?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="total_capacity"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Total Capacity"
                          type="number"
                          error={!!errors.total_capacity}
                          helperText={errors.total_capacity?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="min_age"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Minimum Age"
                          type="number"
                          helperText="Leave blank if no age restriction"
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* STEP 2: Media & Details */}
              {activeStep === 2 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Media & Event Details
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
                        id="event-image-input"
                      />
                      <label htmlFor="event-image-input" style={{ cursor: 'pointer', display: 'block' }}>
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
                              🎬 Upload Event Image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Click to select an image
                            </Typography>
                          </>
                        )}
                      </label>
                    </Paper>
                  </Grid>

                  {user?.role === 'organizer' ? (
                    <Grid item xs={12} sm={6}>
                      <Alert severity="info">
                        You are editing as: <strong>{user.first_name} {user.last_name}</strong>
                      </Alert>
                    </Grid>
                  ) : (
                    <Grid item xs={12} sm={6}>
                      <AutocompleteField
                        name="organizer_id"
                        control={control}
                        label="Organizer"
                        options={organizers}
                        getOptionLabel={(option) => option.full_name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value}
                        required
                        error={errors.organizer_id}
                        helperText={errors.organizer_id?.message}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isStreamingEvent}
                          onChange={(e) => setIsStreamingEvent(e.target.checked)}
                        />
                      }
                      label="This is a streaming event"
                    />
                  </Grid>
                </>
              )}

              {/* STEP 3: Pricing & Tickets */}
              {activeStep === 3 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Pricing & Ticket Configuration
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Start Date & Time"
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.start_date}
                          helperText={errors.start_date?.message}
                          required
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
                          fullWidth
                          label="End Date & Time"
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.end_date}
                          helperText={errors.end_date?.message}
                          required
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="base_price"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          label="Base Price"
                          type="number"
                          inputProps={{ step: '0.01' }}
                          error={!!errors.base_price}
                          helperText={errors.base_price?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth
                      select
                      label="Ticket Format"
                      value={ticketFormat}
                      onChange={(e) => setTicketFormat(e.target.value)}
                    >
                      <MenuItem value="digital">Digital</MenuItem>
                      <MenuItem value="physical">Physical</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="digital_format"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field}
                          fullWidth
                          select
                          label="Digital Ticket Format"
                          disabled={ticketFormat === 'physical'}
                        >
                          {digitalFormats.map((df) => (
                            <MenuItem key={df.value} value={df.value}>{df.label}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>

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

              {/* STEP 4: Review */}
              {activeStep === 4 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Review Event Changes
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  {eventImageUrl && (
                    <Grid item xs={12}>
                      <Box
                        component="img"
                        src={eventImageUrl}
                        alt="Event preview"
                        sx={{ maxHeight: 300, width: '100%', objectFit: 'cover', borderRadius: 1, mb: 3 }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Alert severity="info">
                      Please review all changes before submitting. You can go back to edit any section.
                    </Alert>
                  </Grid>
                  {/* Full Live Preview */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, mt: 2 }} elevation={1}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {watch('title') || event?.title || 'Untitled Event'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {watch('short_description') || event?.short_description}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Date:</strong>{' '}
                          {watch('start_date') ? new Date(watch('start_date')).toLocaleString() : event?.start_date ? new Date(event.start_date).toLocaleString() : 'TBD'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ends:</strong>{' '}
                          {watch('end_date') ? new Date(watch('end_date')).toLocaleString() : event?.end_date ? new Date(event.end_date).toLocaleString() : 'TBD'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Price:</strong>{' '}${(watch('base_price') ?? event?.base_price ?? 0).toFixed ? (Number(watch('base_price') ?? event?.base_price ?? 0)).toFixed(2) : (watch('base_price') ?? event?.base_price ?? 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Capacity:</strong>{' '}{watch('total_capacity') ?? event?.total_capacity ?? 'N/A'}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {watch('description') || event?.description || 'No description provided.'}
                        </Typography>
                      </Box>

                      {/* Venue & Organizer */}
                      <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Venue:</strong>{' '}
                          {(() => {
                            const vid = watch('venue_id') || event?.venue_id;
                            const v = venues.find((x) => String(x.id) === String(vid));
                            return v ? v.name : (event?.venue_name || 'TBA');
                          })()}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          <strong>Organizer:</strong>{' '}
                          {(() => {
                            const oid = watch('organizer_id') || event?.organizer_id;
                            const o = organizers.find((x) => String(x.id) === String(oid));
                            return o ? (o.full_name || `${o.first_name} ${o.last_name}`) : (event?.organizer_name || 'TBA');
                          })()}
                        </Typography>
                      </Box>

                      {/* Virtual Info */}
                      { (watch('event_mode') === 'virtual' || watch('event_mode') === 'hybrid' || virtualEventData.event_mode === 'virtual' || virtualEventData.event_mode === 'hybrid') && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Virtual Details</Typography>
                          <Typography variant="body2" color="text.secondary">Platform: {watch('meeting_platform') || virtualEventData.meeting_platform || 'N/A'}</Typography>
                          <Typography variant="body2" color="text.secondary">Meeting Link: {watch('meeting_link') || virtualEventData.meeting_link || 'N/A'}</Typography>
                          <Typography variant="body2" color="text.secondary">Max Attendees: {watch('max_attendees') || virtualEventData.max_attendees || 'Unlimited'}</Typography>
                        </Box>
                      )}

                      {/* Speakers & Objectives */}
                      <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ minWidth: 240 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Speakers</Typography>
                          {(watch('additional_speakers') || virtualEventData.additional_speakers || []).length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No additional speakers</Typography>
                          ) : (
                            (watch('additional_speakers') || virtualEventData.additional_speakers || []).map((s, i) => (
                              <Typography key={i} variant="body2">{s.name} — {s.bio}</Typography>
                            ))
                          )}
                        </Box>

                        <Box sx={{ minWidth: 240 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Learning Objectives</Typography>
                          {(watch('learning_objectives') || virtualEventData.learning_objectives || []).length === 0 ? (
                            <Typography variant="body2" color="text.secondary">None</Typography>
                          ) : (
                            (watch('learning_objectives') || virtualEventData.learning_objectives || []).map((o, i) => (
                              <Typography key={i} variant="body2">• {o}</Typography>
                            ))
                          )}
                        </Box>
                      </Box>

                      {/* Ticket Summary */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ticket Summary</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          {selectedTicketTypes.map((tt) => (
                            <Paper key={tt} sx={{ p: 1, minWidth: 160 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{tt}</Typography>
                              <Typography variant="caption">Quantity: {ticketTypeQuantities[tt] ?? 'N/A'}</Typography>
                              <Typography variant="caption" sx={{ display: 'block' }}>Price: ${(ticketTypeQuantities[tt] ? (Number(watch('base_price') || event?.base_price || 0)).toFixed(2) : (Number(watch('base_price') || event?.base_price || 0)).toFixed(2))}</Typography>
                            </Paper>
                          ))}
                        </Box>
                      </Box>

                    </Paper>
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
                      onClick={() => navigate(`/events/${eventId}`)}
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
                        {submitting ? 'Updating...' : 'Update Event'}
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

export default EditEventPage;
