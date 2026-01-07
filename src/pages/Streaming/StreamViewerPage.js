import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Error,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StreamPlayer from '../../components/Streaming/StreamPlayer';
import toast from 'react-hot-toast';

const StreamViewerPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { apiRequest, API_BASE_URL } = useAuth();

  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadStreamAccess();
    }
  }, [ticketId]);

  const loadStreamAccess = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest(`${API_BASE_URL}/streaming/access/${ticketId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to access stream');
      }

      setStreamData(data.data);
      setAccessGranted(true);
      toast.success('Stream access granted!');
    } catch (err) {
      console.error('Load stream access error:', err);
      setError(err.message || 'Failed to load stream access');
      toast.error('Failed to access stream');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTickets = () => {
    navigate('/tickets');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading stream access...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we verify your ticket
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToTickets}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Live Stream
        </Typography>

        {streamData && (
          <Typography variant="body1" color="text.secondary">
            Ticket: {streamData.ticket_id}
          </Typography>
        )}
      </Box>

      {/* Error State */}
      {error && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="error">
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {error}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Make sure your ticket includes streaming access and is still valid.
              </Typography>
              <Button variant="contained" onClick={handleBackToTickets}>
                Back to My Tickets
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stream Access Granted */}
      {accessGranted && !error && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1 }} />
            <Typography variant="body2">
              Streaming access verified! You can now watch the live stream.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Stream Player */}
      {accessGranted && streamData && (
        <StreamPlayer
          streamData={streamData}
          onAccessGranted={() => setAccessGranted(true)}
        />
      )}

      {/* Stream Info */}
      {accessGranted && streamData && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Stream Information
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Event
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {streamData.event_title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Stream Provider
                </Typography>
                <Typography variant="body1">
                  {streamData.stream_provider || 'Custom'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Access Expires
                </Typography>
                <Typography variant="body1">
                  {streamData.replay_available_until
                    ? new Date(streamData.replay_available_until).toLocaleString()
                    : 'Live event only'
                  }
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Views Count
                </Typography>
                <Typography variant="body1">
                  {streamData.views_count || 0}
                </Typography>
              </Box>
            </Box>

            {streamData.allow_replay && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  🎥 Replay access is available for this event. You can rewatch the stream even after it ends.
                </Typography>
              </Alert>
            )}

            {!streamData.allow_replay && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  ⚠️ This is a live-only event. Once the stream ends, you won't be able to rewatch it.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Streaming Help
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                🔴 Live Indicator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Red "LIVE" badge shows the stream is currently broadcasting
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                🎥 Replay Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If available, you can rewatch the stream after it ends
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                📱 Device Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Works on desktop, tablet, and mobile devices
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                🔒 Secure Access
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your ticket provides unique access to this stream
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StreamViewerPage;
