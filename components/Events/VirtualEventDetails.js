import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Videocam,
  LocationOn,
  DateRange,
  Group,
  School,
  VideoCall,
  ExpandMore,
  ExpandLess,
  Schedule,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const MEETING_PLATFORM_ICONS = {
  zoom: '🎥',
  google_meet: '🎥',
  microsoft_teams: '🎥',
  webex: '🎥',
  custom: '🔗',
};

const VirtualEventDetails = ({ event, isOrganizerView = false }) => {
  const [expandedSections, setExpandedSections] = useState({
    speakers: true,
    objectives: true,
    features: true,
    technical: true,
    certificates: true,
  });

  const handleCopyLink = () => {
    if (event.meeting_link) {
      navigator.clipboard.writeText(event.meeting_link);
      toast.success('Meeting link copied!');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRemainingTime = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;

    if (diff < 0) return 'Event started';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `Starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(diff / 86400000);
    return `Starts in ${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <Box>
      {/* Virtual Event Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Videocam sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {event.event_mode === 'virtual' ? '💻 Virtual Event' : '🔀 Hybrid Event'}
                </Typography>
                <Typography variant="body2">
                  {event.virtual_event_type?.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {getRemainingTime(event.start_date)}
              </Typography>
              <Chip
                icon={<Schedule />}
                label={formatDate(event.start_date)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'inherit',
                  mt: 1,
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Meeting Details Card */}
      {event.meeting_platform && (
        <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            {MEETING_PLATFORM_ICONS[event.meeting_platform]} Meeting Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Meeting Platform
                </Typography>
                <Chip
                  label={event.meeting_platform.replace(/_/g, ' ').toUpperCase()}
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {event.meeting_id && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Meeting ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                    {event.meeting_id}
                  </Typography>
                </Box>
              )}

              {event.meeting_password && !isOrganizerView && (
                <Alert severity="warning" icon={<Lock />} sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    Password required to join. You'll receive it via email before the event.
                  </Typography>
                </Alert>
              )}

              {event.meeting_password && isOrganizerView && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Meeting Password
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                    {event.meeting_password}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {event.meeting_link && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<VideoCall />}
                  onClick={handleCopyLink}
                  sx={{ mb: 2 }}
                >
                  Copy Meeting Link
                </Button>
              )}

              {event.access_instructions && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Access Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {event.access_instructions}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {event.technical_requirements && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Technical Requirements
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {event.technical_requirements}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Host Information */}
      {event.host_name && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            <School sx={{ mr: 1, verticalAlign: 'middle' }} />
            Event Host
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs="auto">
              {event.host_image_url && (
                <Avatar
                  src={event.host_image_url}
                  alt={event.host_name}
                  sx={{ width: 80, height: 80 }}
                />
              )}
            </Grid>
            <Grid item xs>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {event.host_name}
              </Typography>
              {event.host_email && (
                <Typography variant="body2" color="textSecondary">
                  {event.host_email}
                </Typography>
              )}
              {event.host_bio && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.host_bio}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Speakers Section */}
      {event.additional_speakers && event.additional_speakers.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            onClick={() => toggleSection('speakers')}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              ml: -1,
              mr: -1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
              Speakers ({event.additional_speakers.length})
            </Typography>
            {expandedSections.speakers ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandedSections.speakers}>
            <Divider sx={{ my: 2 }} />
            <List>
              {event.additional_speakers.map((speaker, idx) => (
                <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {speaker.image_url && (
                      <Avatar src={speaker.image_url} alt={speaker.name} />
                    )}
                    <Box>
                      <ListItemText
                        primary={speaker.name}
                        secondary={speaker.title || speaker.expertise}
                      />
                    </Box>
                  </Box>
                  {speaker.bio && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 8 }}>
                      {speaker.bio}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}

      {/* Learning Objectives */}
      {event.learning_objectives && event.learning_objectives.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            onClick={() => toggleSection('objectives')}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              ml: -1,
              mr: -1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
              What You'll Learn
            </Typography>
            {expandedSections.objectives ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandedSections.objectives}>
            <Divider sx={{ my: 2 }} />
            <List>
              {event.learning_objectives.map((objective, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={objective.title || objective}
                    secondary={
                      typeof objective === 'object' && objective.description
                        ? objective.description
                        : null
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}

      {/* Event Features */}
      {(event.chat_enabled ||
        event.screen_share_enabled ||
        event.q_and_a_enabled ||
        event.polling_enabled ||
        event.breakout_rooms_enabled) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            onClick={() => toggleSection('features')}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              ml: -1,
              mr: -1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Event Features
            </Typography>
            {expandedSections.features ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandedSections.features}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {event.chat_enabled && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">💬</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Live Chat
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {event.screen_share_enabled && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">🖥️</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Screen Sharing
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {event.q_and_a_enabled && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">❓</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Q&A Session
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {event.polling_enabled && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">📊</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Live Polling
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {event.breakout_rooms_enabled && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">🚪</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Breakout Rooms
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {event.recording_available_after_event && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">📹</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Recording Available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Collapse>
        </Paper>
      )}

      {/* Certificate Information */}
      {event.provides_certificate && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff3e0' }}>
          <Box
            onClick={() => toggleSection('certificates')}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              p: 1,
              ml: -1,
              mr: -1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🎓 Certificate of Completion
            </Typography>
            {expandedSections.certificates ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandedSections.certificates}>
            <Divider sx={{ my: 2 }} />
            <Alert severity="success" icon={<CheckCircle />}>
              Upon completion, you'll receive a certificate of completion from{' '}
              {event.issuing_organization || 'the organizer'}
            </Alert>
            {event.certificate_text && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Certificate Text
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {event.certificate_text}
                </Typography>
              </Box>
            )}
          </Collapse>
        </Paper>
      )}

      {/* Hybrid Pricing Info */}
      {event.event_mode === 'hybrid' && event.virtual_ticket_price && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'secondary.light' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Pricing Options
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    In-Person Attendance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${event.base_price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Virtual Attendance
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    ${event.virtual_ticket_price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {event.virtual_capacity && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
              Virtual Capacity: {event.virtual_capacity} attendees
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default VirtualEventDetails;
