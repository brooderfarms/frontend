import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  QrCode,
  CheckCircle,
  Error,
  History,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EventCheckInPage = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const { eventId } = useParams();
  
  const [cardUID, setCardUID] = useState('');
  const [scanning, setScanning] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState([]);

  const handleScanCard = async () => {
    if (!cardUID.trim()) {
      toast.error('Please enter or scan a card UID');
      return;
    }

    try {
      setScanning(true);

      // Step 1: Verify card exists
      const verifyResponse = await apiRequest(`${API_BASE_URL}/nfc/verify/${cardUID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          venue_id: null,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setCheckInResult({
          success: false,
          message: verifyData.error || 'Card not found or invalid',
          card: null,
        });
        toast.error(verifyData.error);
        return;
      }

      // Card found - show success
      setCheckInResult({
        success: true,
        message: `Welcome! Card ${verifyData.card.card_number} has been verified.`,
        card: verifyData.card,
      });

      toast.success(`✓ Check-in successful for ${verifyData.card.card_number}`);

      // Add to history
      setCheckInHistory(prev => [{
        card_number: verifyData.card.card_number,
        card_type: verifyData.card.card_type,
        timestamp: new Date(),
        status: 'success',
      }, ...prev]);

      // Clear input
      setCardUID('');
    } catch (error) {
      console.error('Check-in error:', error);
      setCheckInResult({
        success: false,
        message: 'Error processing card. Please try again.',
        card: null,
      });
      toast.error('Check-in failed');
    } finally {
      setScanning(false);
    }
  };

  const handleUseCard = async () => {
    if (!checkInResult?.card) return;

    try {
      setScanning(true);

      // Process card usage/deduction
      const response = await apiRequest(`${API_BASE_URL}/nfc/${checkInResult.card.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          venue_id: null,
          location: 'Event Gate',
          amount: 0, // Can be configured per event
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Card used! Remaining balance: $${Number(data.new_balance).toFixed(2)}`);
        setCheckInResult({
          ...checkInResult,
          message: `Check-in successful! Remaining balance: $${Number(data.new_balance).toFixed(2)}`,
          card: {
            ...checkInResult.card,
            balance: data.new_balance,
          },
        });
      } else {
        toast.error(data.error || 'Failed to process card');
      }
    } catch (error) {
      console.error('Card usage error:', error);
      toast.error('Error processing card');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎫 Event Check-In
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Scan NFC/RFID cards to process event entry
        </Typography>
      </Box>

      {/* Card Scanner */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Scan Card
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Card UID or Card Number"
              placeholder="Scan card or enter UID manually"
              value={cardUID}
              onChange={(e) => setCardUID(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleScanCard()}
              disabled={scanning}
              autoFocus
            />
            <Button
              variant="contained"
              startIcon={scanning ? <CircularProgress size={20} /> : <QrCode />}
              onClick={handleScanCard}
              disabled={scanning || !cardUID.trim()}
              sx={{ minWidth: 120 }}
            >
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Position the NFC/RFID reader near the card to scan. Or manually enter the card UID above.
          </Typography>
        </CardContent>
      </Card>

      {/* Check-in Result */}
      {checkInResult && (
        <Card
          sx={{
            mb: 3,
            backgroundColor: checkInResult.success ? 'success.light' : 'error.light',
            borderLeft: `4px solid ${checkInResult.success ? '#4caf50' : '#f44336'}`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {checkInResult.success ? (
                <CheckCircle sx={{ color: 'success.main', mt: 0.5 }} />
              ) : (
                <Error sx={{ color: 'error.main', mt: 0.5 }} />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {checkInResult.message}
                </Typography>

                {checkInResult.card && (
                  <>
                    <Box sx={{ display: 'grid', gap: 1, mb: 2, backgroundColor: 'rgba(255,255,255,0.5)', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Card Number:</strong> {checkInResult.card.card_number}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {checkInResult.card.card_type.toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Balance:</strong> ${Number(checkInResult.card.balance).toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong>
                        <Chip
                          label={checkInResult.card.status.toUpperCase()}
                          size="small"
                          sx={{ ml: 1 }}
                          color={checkInResult.card.status === 'active' ? 'success' : 'warning'}
                        />
                      </Typography>
                    </Box>

                    {checkInResult.success && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleUseCard}
                        disabled={scanning || checkInResult.card.status !== 'active'}
                        sx={{ mr: 1 }}
                      >
                        {scanning ? 'Processing...' : 'Complete Entry'}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setCheckInResult(null);
                        setCardUID('');
                      }}
                    >
                      Clear
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Check-in History */}
      {checkInHistory.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Check-In History
              </Typography>
              <Chip label={checkInHistory.length} color="primary" />
            </Box>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell>Card</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkInHistory.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.card_number}</TableCell>
                      <TableCell>{entry.card_type.toUpperCase()}</TableCell>
                      <TableCell>{entry.timestamp.toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status.toUpperCase()}
                          size="small"
                          color={entry.status === 'success' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          How to use:
        </Typography>
        <ol style={{ marginTop: 8, marginBottom: 0 }}>
          <li>Have the customer scan their NFC/RFID card</li>
          <li>Verify the card details shown on screen</li>
          <li>Click "Complete Entry" to process the check-in</li>
          <li>Card balance will be updated accordingly</li>
        </ol>
      </Alert>
    </Container>
  );
};

export default EventCheckInPage;
