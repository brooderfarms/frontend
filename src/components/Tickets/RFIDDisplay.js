import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import {
  RadioButtonChecked,
  WifiTethering,
  Security,
  Info,
} from '@mui/icons-material';

const RFIDDisplay = ({ ticket }) => {
  if (!ticket || ticket.digital_format !== 'rfid') {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        background: 'rgba(16, 185, 129, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
        <RadioButtonChecked sx={{ mr: 1, verticalAlign: 'middle' }} />
        RFID Ticket
      </Typography>

      <Box sx={{ my: 3 }}>
        <WifiTethering
          sx={{
            fontSize: 80,
            color: 'success.main',
            filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))',
          }}
        />
      </Box>

      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
        Ticket: {ticket.ticket_number}
      </Typography>

      <Chip
        label="RFID Enabled"
        color="success"
        variant="outlined"
        sx={{
          mb: 3,
          borderColor: 'success.main',
          color: 'success.main',
        }}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2 }}>
            <Security sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Secure
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Encrypted data transmission
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2 }}>
            <RadioButtonChecked sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Contactless
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No physical contact required
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          <Info sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
          RFID Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          • RFID chip is embedded in your ticket
          • Simply pass through the RFID reader zone
          • No app or action required from you
          • Validation happens automatically
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="body2">
          <strong>Advantages:</strong> RFID provides the fastest and most secure entry method.
          It's weather-resistant and works reliably in all conditions.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default RFIDDisplay;
