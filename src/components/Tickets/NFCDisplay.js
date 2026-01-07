import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Nfc,
  SmartButton,
  Info,
} from '@mui/icons-material';

const NFCDisplay = ({ ticket }) => {
  if (!ticket || ticket.digital_format !== 'nfc') {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        background: 'rgba(255, 0, 128, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 0, 128, 0.2)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
        <Nfc sx={{ mr: 1, verticalAlign: 'middle' }} />
        NFC Ticket
      </Typography>

      <Box sx={{ my: 3 }}>
        <SmartButton
          sx={{
            fontSize: 80,
            color: 'secondary.main',
            filter: 'drop-shadow(0 4px 8px rgba(255, 0, 128, 0.3))',
          }}
        />
      </Box>

      <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
        Ticket: {ticket.ticket_number}
      </Typography>

      <Chip
        label="NFC Enabled"
        color="secondary"
        variant="outlined"
        sx={{
          mb: 3,
          borderColor: 'secondary.main',
          color: 'secondary.main',
        }}
      />

      <Alert severity="info" sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          <Info sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
          NFC Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          • Keep your device close to the NFC reader at the entrance
          • Ensure NFC is enabled on your device
          • The ticket will be automatically validated
          • No need to open any app or show any code
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="body2">
          <strong>Device Compatibility:</strong> NFC works on most modern smartphones and some wearables.
          If your device doesn't support NFC, please contact event staff for alternative validation.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default NFCDisplay;
