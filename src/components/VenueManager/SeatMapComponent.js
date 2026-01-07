import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Tooltip,
  Slider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Chair,
  EventSeat,
  Block,
  ZoomIn,
  ZoomOut,
  Refresh,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const defaultZones = [
  { name: 'Premium', color: '#FFD700', price: 100, seats: 40, description: 'Best seats with premium view' },
  { name: 'Standard', color: '#2196F3', price: 50, seats: 100, description: 'Standard seating' },
  { name: 'VIP', color: '#FF1493', price: 150, seats: 20, description: 'VIP lounge access' },
  { name: 'Accessible', color: '#4CAF50', price: 40, seats: 10, description: 'Wheelchair accessible' },
];

const SeatMapComponent = ({ zones = defaultZones, onSelectZone, eventId, apiRequest, API_BASE_URL, onSeatsSelected }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom state: 0.8 to 1.5
  const [priceFilter, setPriceFilter] = useState([0, 300]); // Price range filter
  const [showAccessibleOnly, setShowAccessibleOnly] = useState(false); // Filter accessible only
  const [availableSeats, setAvailableSeats] = useState({}); // Track real-time availability
  const [lastUpdate, setLastUpdate] = useState(null); // Track last update time
  
  // Map zone names to valid backend ticket types
  const zoneToTicketTypeMap = {
    'premium': 'premium',
    'vip': 'vip',
    'standard': 'standard',
    'accessible': 'standard', // Map accessible to standard
    'economy': 'economy',
    'business': 'business',
    'first_class': 'first_class',
  };
  
  // Ensure zoneConfig has proper structure with seats field
  const [zoneConfig, setZoneConfig] = useState(
    Array.isArray(zones) && zones.length > 0 
      ? zones.map(z => ({
          name: z.name || z.title || 'Unnamed',
          color: z.color || '#2196F3',
          price: z.price || 50,
          seats: z.seats || 100,
          description: z.description || '',
        }))
      : defaultZones
  );
  const [editDialog, setEditDialog] = useState({ open: false, zone: null });

  // Update zoneConfig when zones prop changes
  useEffect(() => {
    if (Array.isArray(zones) && zones.length > 0) {
      const mappedZones = zones.map(z => ({
        name: z.name || z.title || 'Unnamed',
        color: z.color || '#2196F3',
        price: z.price || 50,
        seats: z.seats || 100,
        description: z.description || '',
      }));
      setZoneConfig(mappedZones);
    }
  }, [zones]);

  // Fetch real-time seat availability
  const fetchAvailableSeats = async () => {
    if (!eventId) return;
    try {
      const response = await apiRequest(`${API_BASE_URL}/seats/event/${eventId}?status=available`);
      if (response?.ok) {
        const data = await response.json();
        if (data.data?.seats) {
          const availability = {};
          data.data.seats.forEach(seat => {
            availability[`${seat.section}-${seat.seat_number}`] = seat.status === 'available';
          });
          setAvailableSeats(availability);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error('Error fetching seat availability:', error);
    }
  };

  // Poll for seat availability updates every 5 seconds
  useEffect(() => {
    fetchAvailableSeats();
    const interval = setInterval(fetchAvailableSeats, 5000);
    return () => clearInterval(interval);
  }, [eventId]);

  // Filter zones by price and accessibility
  const filteredZones = zoneConfig.filter(zone => {
    const priceInRange = zone.price >= priceFilter[0] && zone.price <= priceFilter[1];
    const accessibilityMatch = !showAccessibleOnly || zone.name.toLowerCase().includes('accessible');
    return priceInRange && accessibilityMatch;
  });

  const handleSelectZone = (zone) => {
    setSelectedZone(zone.name);
    if (onSelectZone) onSelectZone(zone);
  };

  const handleSeatClick = (zoneIndex, seatIndex) => {
    const seatId = `${selectedZone}-${seatIndex}`;
    const newSelectedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];
    setSelectedSeats(newSelectedSeats);
    
    // Pass selected seats and the selected zone/ticket type
    if (onSeatsSelected) {
      const selectedZoneConfig = Array.isArray(zoneConfig) 
        ? zoneConfig.find(z => z.name === selectedZone)
        : null;
      
      // Map zone name to valid ticket type
      const zoneLower = selectedZone?.toLowerCase() || 'standard';
      const mappedTicketType = zoneToTicketTypeMap[zoneLower] || 'standard';
      
      onSeatsSelected({
        seats: newSelectedSeats,
        ticketType: mappedTicketType,
        zoneConfig: selectedZoneConfig,
      });
    }
  };

  const generateSeatGrid = (zoneSeats, zoneIndex) => {
    const seatsPerRow = 10;
    const rows = Math.ceil(zoneSeats / seatsPerRow);
    const seats = [];

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatIndex = row * seatsPerRow + col;
        if (seatIndex < zoneSeats) {
          const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
          const seatId = `${selectedZone}-${seatIndex}`;
          const isSelected = selectedSeats.includes(seatId);
          const isAvailable = availableSeats[seatId] !== false; // Default to available if not tracked

          rowSeats.push(
            <Tooltip 
              key={seatIndex} 
              title={`${seatLabel} - ${isAvailable ? 'Available' : 'Taken'} - $${zoneConfig[zoneIndex]?.price}`}
            >
              <Button
                onClick={() => isAvailable && handleSeatClick(zoneIndex, seatIndex)}
                disabled={!isAvailable}
                sx={{
                  minWidth: 36 * zoomLevel,
                  width: 36 * zoomLevel,
                  height: 36 * zoomLevel,
                  p: 0,
                  borderRadius: '6px',
                  bgcolor: !isAvailable 
                    ? '#ccc' // Taken seats
                    : isSelected
                      ? zoneConfig[zoneIndex]?.color
                      : '#f5f5f5',
                  color: isSelected ? '#fff' : isAvailable ? '#999' : '#999',
                  border: isSelected ? `2px solid ${zoneConfig[zoneIndex]?.color}` : !isAvailable ? '1px solid #999' : '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${0.75 * zoomLevel}rem`,
                  fontWeight: 'bold',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: isAvailable ? 1 : 0.6,
                  '&:hover': isAvailable ? {
                    transform: `scale(${1.1 * zoomLevel})`,
                    boxShadow: isSelected ? `0 0 12px ${zoneConfig[zoneIndex]?.color}` : '0 2px 8px rgba(0,0,0,0.15)',
                  } : {},
                }}
              >
                <Chair sx={{ fontSize: `${1.2 * zoomLevel}rem` }} />
              </Button>
            </Tooltip>
          );
        }
      }
      seats.push(
        <Box key={row} sx={{ display: 'flex', gap: 0.5 * zoomLevel, mb: 0.5 * zoomLevel, justifyContent: 'center' }}>
          {rowSeats}
        </Box>
      );
    }
    return seats;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: '900', color: '#333' }}>
          🎭 Select Your Seats
        </Typography>
        {lastUpdate && (
          <Typography variant="caption" sx={{ color: '#999' }}>
            Live availability updated {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </Typography>
        )}
      </Box>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#666' }}>
          🔍 Filter Seats
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Price Range: ${priceFilter[0]} - ${priceFilter[1]}
            </Typography>
            <Slider
              value={priceFilter}
              onChange={(e, newValue) => setPriceFilter(newValue)}
              min={0}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAccessibleOnly}
                  onChange={(e) => setShowAccessibleOnly(e.target.checked)}
                />
              }
              label="Show Accessible Seats Only ♿"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Zoom Controls */}
      {selectedZone && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>🔍 Zoom:</Typography>
          <Button
            size="small"
            variant={zoomLevel === 0.8 ? 'contained' : 'outlined'}
            startIcon={<ZoomOut />}
            onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
          >
            Zoom Out
          </Button>
          <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </Typography>
          <Button
            size="small"
            variant={zoomLevel === 1.5 ? 'contained' : 'outlined'}
            endIcon={<ZoomIn />}
            onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.2))}
          >
            Zoom In
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAvailableSeats}
            sx={{ ml: 'auto' }}
          >
            Refresh Availability
          </Button>
        </Paper>
      )}

      {/* Zone Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: '#666' }}>
          Choose a Section
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {filteredZones.map((zone, idx) => (
            <Card
              key={zone.name}
              onClick={() => handleSelectZone(zone)}
              sx={{
                cursor: 'pointer',
                bgcolor: zone.color,
                color: '#fff',
                flex: '1 1 auto',
                minWidth: 120,
                transition: 'all 0.3s ease',
                border: selectedZone === zone.name ? '3px solid #fff' : '2px solid transparent',
                boxShadow:
                  selectedZone === zone.name
                    ? `0 8px 20px ${zone.color}40`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                transform: selectedZone === zone.name ? 'scale(1.05)' : 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 8px 20px ${zone.color}40`,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <EventSeat sx={{ fontSize: '2rem', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {zone.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                  ${zone.price}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                  {zone.seats} seats available
                </Typography>
              </CardContent>
            </Card>
          ))}
          {filteredZones.length === 0 && (
            <Chip label="No sections match your filters" color="warning" />
          )}
        </Box>
      </Box>

      {/* Seat Map */}
      {selectedZone && (
        <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '2px solid #eee', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#333' }}>
            {selectedZone} Section - Select your seats
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 2, color: '#999' }}>
            Hover over seats to see details. Gray seats are taken.
          </Typography>

          {/* Stage indicator */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
              py: 1.5,
              bgcolor: '#001a33',
              color: '#fff',
              borderRadius: 1,
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            🎪 STAGE / SCREEN 🎪
          </Box>

          {/* Seat Grid */}
          <Box sx={{ mb: 2 }}>
            {generateSeatGrid(
              Array.isArray(zoneConfig) ? (zoneConfig.find((z) => z.name === selectedZone)?.seats || 0) : 0,
              Array.isArray(zoneConfig) ? zoneConfig.findIndex((z) => z.name === selectedZone) : 0
            )}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Chair sx={{ fontSize: '0.9rem', color: '#999' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Available
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: Array.isArray(zoneConfig) ? (zoneConfig.find((z) => z.name === selectedZone)?.color || '#2196F3') : '#2196F3',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Chair sx={{ fontSize: '0.9rem', color: '#fff' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Selected
              </Typography>
            </Box>
          </Box>

          {/* Selection Summary */}
          <Box sx={{ mt: 3, pt: 3, borderTop: '2px solid #eee' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Selected Seats ({selectedSeats.length})
            </Typography>
            {selectedSeats.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedSeats.map((seatId) => (
                  <Chip
                    key={seatId}
                    label={seatId.split('-')[1]}
                    onDelete={() =>
                      setSelectedSeats((prev) => prev.filter((s) => s !== seatId))
                    }
                    sx={{
                      bgcolor: Array.isArray(zoneConfig) ? (zoneConfig.find((z) => z.name === selectedZone)?.color || '#2196F3') : '#2196F3',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Click seats to select them
              </Typography>
            )}
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default SeatMapComponent;
