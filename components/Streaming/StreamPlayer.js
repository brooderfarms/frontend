import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  PlayArrow,
  Replay,
  LiveTv,
  AccessTime,
} from '@mui/icons-material';

const StreamPlayer = ({ streamData, onAccessGranted }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (streamData) {
      setIsLive(streamData.is_stream_active);
      setIsLoading(false);
    }
  }, [streamData]);

  const getEmbedUrl = (provider, url) => {
    if (!url) return null;

    switch (provider) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (youtubeMatch) {
          return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
        }
        break;
      case 'twitch':
        const twitchMatch = url.match(/twitch\.tv\/(\w+)/);
        if (twitchMatch) {
          return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${window.location.hostname}`;
        }
        break;
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
        }
        break;
      default:
        return url; // Custom URL
    }
    return null;
  };

  const renderStreamEmbed = () => {
    if (!streamData) return null;

    const embedUrl = getEmbedUrl(streamData.stream_provider, streamData.stream_url);

    if (streamData.stream_embed_code) {
      // Use custom embed code
      return (
        <Box
          dangerouslySetInnerHTML={{ __html: streamData.stream_embed_code }}
          sx={{
            width: '100%',
            height: '400px',
            border: 'none',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        />
      );
    } else if (embedUrl) {
      // Use iframe for known providers
      return (
        <Box
          component="iframe"
          src={embedUrl}
          sx={{
            width: '100%',
            height: '400px',
            border: 'none',
            borderRadius: 1,
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    } else {
      return (
        <Box
          sx={{
            width: '100%',
            height: '400px',
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Stream URL not available
          </Typography>
        </Box>
      );
    }
  };

  const getStreamStatus = () => {
    if (!streamData) return { status: 'loading', color: 'default' };

    const now = new Date();
    const startTime = new Date(streamData.stream_start_time);
    const endTime = new Date(streamData.stream_end_time);

    if (streamData.is_stream_active) {
      return { status: 'LIVE', color: 'error' };
    } else if (now < startTime) {
      return { status: 'Starting Soon', color: 'warning' };
    } else if (now > endTime && streamData.allow_replay) {
      return { status: 'Replay Available', color: 'info' };
    } else if (now > endTime) {
      return { status: 'Stream Ended', color: 'default' };
    } else {
      return { status: 'Offline', color: 'default' };
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading stream...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!streamData) {
    return (
      <Alert severity="info">
        Stream data not available
      </Alert>
    );
  }

  const streamStatus = getStreamStatus();

  return (
    <Box>
      {/* Stream Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {streamData.event_title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {streamStatus.status === 'LIVE' && <LiveTv sx={{ color: 'error.main' }} />}
          <Chip
            label={streamStatus.status}
            color={streamStatus.color}
            size="small"
          />
        </Box>
      </Box>

      {/* Stream Player */}
      <Paper
        elevation={2}
        sx={{
          p: 1,
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {renderStreamEmbed()}
      </Paper>

      {/* Stream Info */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        {streamData.stream_start_time && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Started: {new Date(streamData.stream_start_time).toLocaleString()}
            </Typography>
          </Box>
        )}

        {streamData.views_count !== undefined && (
          <Typography variant="body2" color="text.secondary">
            Views: {streamData.views_count}
          </Typography>
        )}

        {streamData.stream_provider && (
          <Chip
            label={streamData.stream_provider}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Stream Controls */}
      {streamStatus.status === 'Starting Soon' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            The live stream will start at {new Date(streamData.stream_start_time).toLocaleString()}
          </Typography>
        </Alert>
      )}

      {streamStatus.status === 'Stream Ended' && !streamData.allow_replay && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            The live stream has ended. Replay is not available for this event.
          </Typography>
        </Alert>
      )}

      {streamStatus.status === 'Replay Available' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Replay is available until {new Date(streamData.replay_available_until).toLocaleString()}
          </Typography>
        </Alert>
      )}

      {/* Access Token (for debugging/verification) */}
      {streamData.access_token && (
        <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
          <Typography variant="caption">
            Access Token: {streamData.access_token}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default StreamPlayer;
