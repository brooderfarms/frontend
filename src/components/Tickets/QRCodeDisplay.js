import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  QrCode,
  Download,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const QRCodeDisplay = ({ ticket }) => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticket && ticket.digital_format === 'qr_code') {
      loadQRCode();
    }
  }, [ticket]);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiRequest(`${API_BASE_URL}/tickets/${ticket.id}/qr`);
      const data = await response.json();

      if (response.ok) {
        setQrCodeUrl(data.qr_code);
      } else {
        setError(data.message || 'Failed to load QR code');
      }
    } catch (err) {
      console.error('Load QR code error:', err);
      setError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `ticket-${ticket.ticket_number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR code downloaded!');
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Ticket ${ticket.ticket_number}`,
          text: `QR Code for ${ticket.event_title}`,
          url: qrCodeUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrCodeUrl);
        toast.success('QR code URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to share QR code');
    }
  };

  if (!ticket || ticket.digital_format !== 'qr_code') {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
        QR Code Ticket
      </Typography>

      {loading && (
        <Box sx={{ py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Generating QR code...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {qrCodeUrl && !loading && (
        <>
          <Box
            component="img"
            src={qrCodeUrl}
            alt={`QR Code for ticket ${ticket.ticket_number}`}
            sx={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 256,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(0, 45, 104, 0.1)',
            }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            Ticket: {ticket.ticket_number}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadQRCode}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              Download
            </Button>

            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={shareQRCode}
              sx={{
                background: 'linear-gradient(135deg, #002d68 0%, #2563eb 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #001b3a 0%, #002d68 100%)',
                },
              }}
            >
              Share
            </Button>
          </Box>
        </>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          Show this QR code at the event entrance for validation. Keep it secure and don't share with others.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default QRCodeDisplay;
