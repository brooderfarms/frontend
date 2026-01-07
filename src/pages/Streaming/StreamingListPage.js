import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  CardActionArea,
} from '@mui/material';
import {
  PlayCircle,
  Schedule,
  Videocam,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StreamingListPage = () => {
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();
  
  const [liveEvents, setLiveEvents] = useState([]);
  const [replayEvents, setReplayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStreamingEvents();
  }, []);

  const fetchStreamingEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest(`${API_BASE_URL}/streaming/events`);
      if (!response.ok) throw new Error('Failed to fetch streaming events');

      const data = await response.json();
      
      const live = data.data?.filter(e => e.stream_status === 'live') || [];
      const replay = data.data?.filter(e => e.stream_status === 'completed') || [];
      
      setLiveEvents(live);
      setReplayEvents(replay);
    } catch (err) {
      console.error('Fetch streaming events error:', err);
      setError('Failed to load streaming events');
    } finally {
      setLoading(false);
    }
  };

  const EventCard = ({ event, type = 'live' }) => {
    const isLive = type === 'live';
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardActionArea onClick={() => navigate(`/stream/${event.ticket_id || event.id}`)}>
          <CardMedia
            component="div"
            sx={{
              height: 180,
              bgcolor: 'grey.200',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Videocam sx={{ fontSize: 60, color: 'grey.400' }} />
            {isLive && (
              <Chip
                label="🔴 LIVE"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: '#ff0000',
                  color: 'white',
                  fontWeight: 'bold',
                  animation: 'pulse 1s infinite',
                }}
              />
            )}
            {!isLive && (
              <Chip
                label="REPLAY"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            )}
          </CardMedia>
        </CardActionArea>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {event.event_title || event.title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
            <Schedule sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              {new Date(event.start_time || event.created_at).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <People sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="body2">
              {event.viewer_count || 0} watching
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<PlayCircle />}
            onClick={() => navigate(`/stream/${event.ticket_id || event.id}`)}
          >
            {isLive ? 'Watch Live' : 'Watch Replay'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
        Live Streaming & Replays
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Watch live events or catch replays of past events
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Live Events Section */}
      {liveEvents.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Chip label="🔴 LIVE NOW" sx={{ mr: 2, bgcolor: '#ff0000', color: 'white', fontWeight: 'bold' }} />
            {liveEvents.length} Event{liveEvents.length !== 1 ? 's' : ''}
          </Typography>
          <Grid container spacing={3}>
            {liveEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} type="live" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Replay Events Section */}
      {replayEvents.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Available Replays ({replayEvents.length})
          </Typography>
          <Grid container spacing={3}>
            {replayEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} type="replay" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {liveEvents.length === 0 && replayEvents.length === 0 && (
        <Alert severity="info">
          No live events or replays available at this time.
        </Alert>
      )}
    </Container>
  );
};

export default StreamingListPage;
