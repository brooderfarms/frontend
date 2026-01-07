import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SessionSelector = ({ eventId, onSessionSelect, selectedSessionId }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

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
        
        // Auto-select first session if available
        if (data.data && data.data.length > 0 && !selectedSessionId) {
          onSessionSelect(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load event sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 3, backgroundColor: '#f9f9f9' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Select Event Session
        </Typography>
        
        <RadioGroup
          value={selectedSessionId || ''}
          onChange={(e) => onSessionSelect(e.target.value)}
        >
          {sessions.map(session => {
            const isAvailable = session.available_seats > 0;
            const startTime = new Date(session.start_time).toLocaleString();
            const endTime = new Date(session.end_time).toLocaleTimeString();
            const occupancy = ((session.capacity - session.available_seats) / session.capacity * 100).toFixed(0);
            
            return (
              <Box
                key={session.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: isAvailable ? '#fff' : '#f5f5f5',
                  opacity: isAvailable ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: isAvailable ? '#fafafa' : '#f5f5f5',
                    borderColor: isAvailable ? '#1976d2' : '#e0e0e0',
                  }
                }}
              >
                <FormControlLabel
                  value={session.id}
                  control={<Radio disabled={!isAvailable} />}
                  label={
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {session.session_name}
                      </Typography>
                      {session.session_description && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                          {session.session_description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body2">
                          📅 {startTime} - {endTime}
                        </Typography>
                        <Typography variant="body2">
                          💺 {session.available_seats} of {session.capacity} available ({occupancy}% sold)
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          ${parseFloat(session.base_price).toFixed(2)}
                        </Typography>
                      </Box>
                      {!isAvailable && (
                        <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 1 }}>
                          ❌ Session is fully booked
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
              </Box>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default SessionSelector;
