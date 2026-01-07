import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EventSessionsManager = ({ eventId, eventStartDate, eventEndDate }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    session_name: '',
    session_description: '',
    start_time: '',
    end_time: '',
    capacity: '',
    base_price: ''
  });

  // Fetch sessions
  useEffect(() => {
    fetchSessions();
  }, [eventId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/events/${eventId}/sessions`);
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        session_name: session.session_name,
        session_description: session.session_description || '',
        start_time: session.start_time.substring(0, 16),
        end_time: session.end_time.substring(0, 16),
        capacity: session.capacity.toString(),
        base_price: session.base_price.toString()
      });
    } else {
      setEditingSession(null);
      setFormData({
        session_name: '',
        session_description: '',
        start_time: '',
        end_time: '',
        capacity: '',
        base_price: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSession(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSession = async () => {
    try {
      // Validate
      if (!formData.session_name || !formData.start_time || !formData.end_time || !formData.capacity) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        toast.error('End time must be after start time');
        return;
      }

      const payload = {
        session_name: formData.session_name,
        session_description: formData.session_description,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        capacity: parseInt(formData.capacity),
        base_price: parseFloat(formData.base_price)
      };

      let response;
      if (editingSession) {
        response = await apiRequest(`${API_BASE_URL}/sessions/${editingSession.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        response = await apiRequest(`${API_BASE_URL}/events/${eventId}/sessions`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        toast.success(editingSession ? 'Session updated' : 'Session created');
        fetchSessions();
        handleCloseDialog();
      } else {
        toast.error(data.message || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await apiRequest(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Session deleted');
        fetchSessions();
      } else {
        toast.error(data.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Event Sessions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Session
            </Button>
          </Box>

          {sessions.length === 0 ? (
            <Alert severity="info">
              No sessions created yet. This event will use default single-day ticketing.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Session Name</strong></TableCell>
                    <TableCell><strong>Start Time</strong></TableCell>
                    <TableCell><strong>End Time</strong></TableCell>
                    <TableCell align="center"><strong>Capacity</strong></TableCell>
                    <TableCell align="center"><strong>Available</strong></TableCell>
                    <TableCell align="right"><strong>Price</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell>{session.session_name}</TableCell>
                      <TableCell>{formatDateTime(session.start_time)}</TableCell>
                      <TableCell>{formatDateTime(session.end_time)}</TableCell>
                      <TableCell align="center">{session.capacity}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={session.available_seats}
                          size="small"
                          color={session.available_seats > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">${parseFloat(session.base_price).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(session)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSession ? 'Edit Session' : 'Create New Session'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Session Name"
            name="session_name"
            value={formData.session_name}
            onChange={handleInputChange}
            placeholder="e.g., Day 1 - Morning Session"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="session_description"
            value={formData.session_description}
            onChange={handleInputChange}
            placeholder="Optional description"
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Start Time"
            name="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Time"
            name="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Base Price"
            name="base_price"
            type="number"
            value={formData.base_price}
            onChange={handleInputChange}
            inputProps={{ step: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveSession}
            variant="contained"
          >
            {editingSession ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventSessionsManager;
