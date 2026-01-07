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
  Chip,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Videocam,
  LocationOn,
  DateRange,
  Group,
  School,
  VideoCall,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VIRTUAL_EVENT_TYPES = [
  { value: 'workshop', label: '🛠️ Workshop' },
  { value: 'training', label: '📚 Training' },
  { value: 'webinar', label: '🎤 Webinar' },
  { value: 'seminar', label: '💼 Seminar' },
  { value: 'conference', label: '🏢 Conference' },
  { value: 'business_conference', label: '📊 Business Conference' },
  { value: 'cultural_festival', label: '🎭 Cultural Festival' },
  { value: 'health_camp', label: '🏥 Health Camp' },
  { value: 'bootcamp', label: '⚡ Bootcamp' },
  { value: 'masterclass', label: '👑 Masterclass' },
  { value: 'networking_event', label: '🤝 Networking Event' },
  { value: 'product_launch', label: '🚀 Product Launch' },
  { value: 'panel_discussion', label: '🎙️ Panel Discussion' },
  { value: 'expo', label: '🏛️ Virtual Expo' },
  { value: 'virtual_tour', label: '🗺️ Virtual Tour' },
  { value: 'online_course', label: '📖 Online Course' },
  { value: 'class', label: '🎓 Class' },
  { value: 'lecture', label: '🎯 Lecture' },
];

const EVENT_MODES = [
  { value: '', label: 'All Events' },
  { value: 'virtual', label: '💻 Virtual Only' },
  { value: 'hybrid', label: '🔀 Hybrid' },
];

const VirtualEventsBrowse = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    event_mode: 'virtual',
    virtual_event_type: '',
    status: 'published',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, [filters, pagination.page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        ...filters,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.event_mode) params.append('event_mode', filters.event_mode);
      if (filters.virtual_event_type) params.append('virtual_event_type', filters.virtual_event_type);

      const response = await apiRequest(`${API_BASE_URL}/events?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events);
        setPagination(prev => ({ ...prev, total: data.data.pagination.total }));
      }
    } catch (err) {
      console.error('Fetch events error:', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventModeIcon = (mode) => {
    switch (mode) {
      case 'virtual':
        return '💻';
      case 'hybrid':
        return '🔀';
      default:
        return '📍';
    }
  };

  const getVirtualTypeLabel = (type) => {
    const found = VIRTUAL_EVENT_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Videocam sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            Virtual Events & Workshops
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Discover and join online events including workshops, training, conferences, seminars, bootcamps, and more
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Events"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title..."
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Event Mode</InputLabel>
              <Select
                value={filters.event_mode}
                label="Event Mode"
                onChange={(e) => handleFilterChange('event_mode', e.target.value)}
              >
                {EVENT_MODES.map(mode => (
                  <MenuItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={filters.virtual_event_type}
                label="Event Type"
                onChange={(e) => handleFilterChange('virtual_event_type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {VIRTUAL_EVENT_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchEvents}
              disabled={loading}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Alert severity="info">
          No virtual events found. Try adjusting your filters.
        </Alert>
      ) : (
        <>
          {/* Events Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {events.map(event => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  {event.event_image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.event_image_url}
                      alt={event.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Event Mode Badge */}
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        icon={<Videocam />}
                        label={`${getEventModeIcon(event.event_mode)} ${event.event_mode.replace('_', ' ')}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* Title */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {event.title}
                    </Typography>

                    {/* Virtual Event Type */}
                    {event.virtual_event_type && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={getVirtualTypeLabel(event.virtual_event_type)}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </Box>
                    )}

                    {/* Host */}
                    {event.host_name && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        <School sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        Host: {event.host_name}
                      </Typography>
                    )}

                    {/* Date & Time */}
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                      <DateRange sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {formatDate(event.start_date)}
                    </Typography>

                    {/* Organizer */}
                    {event.organizer_first_name && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                        <Group sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                        By {event.organizer_first_name} {event.organizer_last_name}
                      </Typography>
                    )}

                    {/* Price */}
                    {event.base_price && (
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}
                      >
                        ${event.base_price}
                      </Typography>
                    )}

                    {/* Platform Badge */}
                    {event.meeting_platform && (
                      <Chip
                        icon={<VideoCall />}
                        label={event.meeting_platform.replace('_', ' ')}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}

                    {/* Short Description */}
                    {event.short_description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {event.short_description.substring(0, 100)}...
                      </Typography>
                    )}
                  </CardContent>

                  {/* View Details Button */}
                  <CardContent sx={{ pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Info */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
            </Typography>

            {pagination.total > pagination.limit && (
              <Box sx={{ mt: 2 }}>
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default VirtualEventsBrowse;
