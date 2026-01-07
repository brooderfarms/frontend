import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Alert,
  InputAdornment,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  VideoCall,
  Group,
  School,
  Badge,
  Videocam,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';

const MEETING_PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' },
  { value: 'webex', label: 'Cisco Webex' },
  { value: 'custom', label: 'Custom Platform' },
];

const VIRTUAL_EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop', icon: '🛠️' },
  { value: 'training', label: 'Training', icon: '📚' },
  { value: 'webinar', label: 'Webinar', icon: '🎤' },
  { value: 'seminar', label: 'Seminar', icon: '💼' },
  { value: 'conference', label: 'Conference', icon: '🏢' },
  { value: 'business_conference', label: 'Business Conference', icon: '📊' },
  { value: 'cultural_festival', label: 'Cultural Festival', icon: '🎭' },
  { value: 'health_camp', label: 'Health Camp', icon: '🏥' },
  { value: 'bootcamp', label: 'Bootcamp', icon: '⚡' },
  { value: 'masterclass', label: 'Masterclass', icon: '👑' },
  { value: 'networking_event', label: 'Networking Event', icon: '🤝' },
  { value: 'product_launch', label: 'Product Launch', icon: '🚀' },
  { value: 'panel_discussion', label: 'Panel Discussion', icon: '🎙️' },
  { value: 'expo', label: 'Virtual Expo', icon: '🏛️' },
  { value: 'virtual_tour', label: 'Virtual Tour', icon: '🗺️' },
  { value: 'online_course', label: 'Online Course', icon: '📖' },
  { value: 'class', label: 'Class', icon: '🎓' },
  { value: 'lecture', label: 'Lecture', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '❓' },
];

const EVENT_MODES = [
  { value: 'in_person', label: 'In-Person Only', icon: '📍' },
  { value: 'virtual', label: 'Virtual Only', icon: '💻' },
  { value: 'hybrid', label: 'Hybrid (In-Person + Virtual)', icon: '🔀' },
];

const VirtualEventConfig = ({ control, watch, setValue, formData, onFormDataChange }) => {
  const [speakersDialog, setSpeakersDialog] = useState(false);
  const [objectivesDialog, setObjectivesDialog] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({ name: '', bio: '', image_url: '' });
  const [newObjective, setNewObjective] = useState('');

  const usesRHF = typeof watch === 'function' && control;

  const safeWatch = (key) => {
    try {
      if (usesRHF) return watch(key);
    } catch (e) {
      // continue to fallback
    }
    return formData && (key in formData) ? formData[key] : undefined;
  };

  const safeSet = (name, value) => {
    try {
      if (usesRHF && typeof setValue === 'function') return setValue(name, value);
    } catch (e) {
      // ignore
    }
    // allow callers who passed a wrapped setValue(name,value)
    if (typeof setValue === 'function') {
      try { return setValue(name, value); } catch (e) {}
    }
    if (typeof onFormDataChange === 'function' && formData) {
      try { onFormDataChange({ ...formData, [name]: value }); } catch (e) {}
    }
  };

  const eventMode = safeWatch('event_mode');
  const isVirtual = eventMode === 'virtual' || eventMode === 'hybrid';
  const additionalSpeakers = safeWatch('additional_speakers') || [];
  const learningObjectives = safeWatch('learning_objectives') || [];

  const handleAddSpeaker = () => {
    if (newSpeaker.name && newSpeaker.bio) {
      const speakers = additionalSpeakers ? [...additionalSpeakers] : [];
      speakers.push(newSpeaker);
      safeSet('additional_speakers', speakers);
      setNewSpeaker({ name: '', bio: '', image_url: '' });
      setSpeakersDialog(false);
    }
  };

  const handleRemoveSpeaker = (index) => {
    const speakers = additionalSpeakers.filter((_, i) => i !== index);
    safeSet('additional_speakers', speakers);
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      const objectives = learningObjectives ? [...learningObjectives] : [];
      objectives.push(newObjective);
      safeSet('learning_objectives', objectives);
      setNewObjective('');
      setObjectivesDialog(false);
    }
  };

  const handleRemoveObjective = (index) => {
    const objectives = learningObjectives.filter((_, i) => i !== index);
    safeSet('learning_objectives', objectives);
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Event Mode Selection */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader 
          title="Event Mode" 
          avatar={<Videocam />}
          titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Choose how you want to deliver your event
          </Typography>
          <Controller
            name="event_mode"
            control={control}
            defaultValue="in_person"
            render={({ field }) => (
              <RadioGroup {...field} row>
                {EVENT_MODES.map((mode) => (
                  <Grid item xs={12} sm={6} md={4} key={mode.value} sx={{ mb: 1 }}>
                    <Paper
                      onClick={() => field.onChange(mode.value)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: field.value === mode.value ? '3px solid' : '1px solid #e0e0e0',
                        borderColor: field.value === mode.value ? 'primary.main' : '#e0e0e0',
                        bgcolor: field.value === mode.value ? 'primary.lighter' : 'white',
                        transition: 'all 0.3s ease',
                        '&:hover': { 
                          boxShadow: 3,
                          borderColor: 'primary.main'
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Radio 
                          checked={field.value === mode.value} 
                          onChange={() => field.onChange(mode.value)}
                        />
                        <Box>
                          <Typography sx={{ fontSize: 24, mb: 0.5 }}>
                            {mode.icon}
                          </Typography>
                          <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
                            {mode.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </RadioGroup>
            )}
          />
        </CardContent>
      </Card>

      {/* Virtual Event Details */}
      {isVirtual && (
        <>
          <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardHeader 
              title="Virtual Event Type" 
              avatar={<Badge />}
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Select the type that best describes your event
              </Typography>
              <Grid container spacing={1.5}>
                {VIRTUAL_EVENT_TYPES.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.value}>
                    <Controller
                      name="virtual_event_type"
                      control={control}
                      render={({ field }) => (
                        <Paper
                          onClick={() => field.onChange(type.value)}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            border: field.value === type.value ? '2px solid' : '1px solid #e0e0e0',
                            borderColor: field.value === type.value ? 'primary.main' : '#e0e0e0',
                            bgcolor: field.value === type.value ? 'primary.lighter' : 'white',
                            transition: 'all 0.2s ease',
                            '&:hover': { 
                              boxShadow: 2,
                              borderColor: 'primary.main'
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 20 }}>
                              {type.icon}
                            </Typography>
                            <Typography sx={{ fontWeight: field.value === type.value ? 600 : 500, fontSize: 13 }}>
                              {type.label}
                            </Typography>
                          </Box>
                        </Paper>
                      )}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title="Meeting Platform & Details" avatar={<VideoCall />} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="meeting_platform"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Meeting Platform"
                        size="small"
                      >
                        {MEETING_PLATFORMS.map((platform) => (
                          <MenuItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="max_attendees"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Max Attendees"
                        type="number"
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Group /></InputAdornment>,
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="meeting_link"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Meeting Link"
                        placeholder="https://zoom.us/j/123456789"
                        size="small"
                        helperText="Direct link to join the virtual event"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="meeting_id"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Meeting ID"
                        size="small"
                        helperText="Meeting ID from your platform"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="meeting_password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Meeting Password"
                        type="password"
                        size="small"
                        helperText="Leave empty if not required"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="access_instructions"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Access Instructions"
                        multiline
                        rows={3}
                        placeholder="How attendees should prepare and join..."
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="technical_requirements"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Technical Requirements"
                        multiline
                        rows={3}
                        placeholder="Browser requirements, bandwidth, software needed..."
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="recording_url"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Recording URL (for past events)"
                        placeholder="https://example.com/recording"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="reminder_hours_before"
                    control={control}
                    defaultValue={24}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Send Reminder (hours before)"
                        type="number"
                        size="small"
                        inputProps={{ min: 0, max: 720 }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="chat_enabled"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Enable Chat"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="screen_share_enabled"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Enable Screen Sharing"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="q_and_a_enabled"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Enable Q&A"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="polling_enabled"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Enable Polls"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="breakout_rooms_enabled"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Enable Breakout Rooms"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="auto_record"
                    control={control}
                    defaultValue={true}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Auto Record"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title="Host & Speakers Information" avatar={<School />} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="host_name"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Host Name"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="host_email"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Host Email"
                        type="email"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="host_bio"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Host Bio/Description"
                        multiline
                        rows={2}
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="host_image_url"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Host Image URL"
                        size="small"
                        helperText="URL to host photo"
                      />
                    )}
                  />
                </Grid>

                {additionalSpeakers && additionalSpeakers.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Additional Speakers ({additionalSpeakers.length})
                    </Typography>
                    <List dense>
                      {additionalSpeakers.map((speaker, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={speaker.name}
                            secondary={speaker.bio}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveSpeaker(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setSpeakersDialog(true)}
                    fullWidth
                  >
                    Add Speaker
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title="Learning Objectives" avatar={<School />} />
            <CardContent>
              {learningObjectives && learningObjectives.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <List dense>
                    {learningObjectives.map((objective, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={objective} />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRemoveObjective(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setObjectivesDialog(true)}
                fullWidth
              >
                Add Learning Objective
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title="Certificates & Completion" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="provides_certificate"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="This event provides certificates of completion"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="issuing_organization"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Organization Issuing Certificate"
                        size="small"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="certificate_template_url"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Certificate Template URL"
                        size="small"
                        helperText="Template for certificates"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="certificate_text"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Certificate Text"
                        multiline
                        rows={3}
                        placeholder="Custom text to appear on certificates"
                        size="small"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Hybrid Event - Virtual Pricing */}
          {eventMode === 'hybrid' && (
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Virtual Attendee Pricing" />
              <CardContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Set different pricing for attendees joining virtually vs in-person
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="virtual_capacity"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Virtual Attendee Capacity"
                          type="number"
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="virtual_ticket_price"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Virtual Ticket Price"
                          type="number"
                          size="small"
                          inputProps={{ step: '0.01', min: 0 }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dialogs */}
      <Dialog open={speakersDialog} onClose={() => setSpeakersDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Speaker</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Speaker Name"
            value={newSpeaker.name}
            onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bio/Description"
            multiline
            rows={2}
            value={newSpeaker.bio}
            onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Image URL (optional)"
            value={newSpeaker.image_url}
            onChange={(e) => setNewSpeaker({ ...newSpeaker, image_url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpeakersDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSpeaker} variant="contained">
            Add Speaker
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={objectivesDialog} onClose={() => setObjectivesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Learning Objective</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Learning Objective"
            multiline
            rows={2}
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="e.g., Learn how to implement best practices..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObjectivesDialog(false)}>Cancel</Button>
          <Button onClick={handleAddObjective} variant="contained">
            Add Objective
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VirtualEventConfig;
