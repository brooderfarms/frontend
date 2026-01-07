import React, { useState } from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import toast from 'react-hot-toast';

// Example zones for demo
const defaultZones = [
  { name: 'Premium', color: '#FFD700', price: 100, seats: 40 },
  { name: 'Standard', color: '#2196F3', price: 50, seats: 100 },
  { name: 'Hospitality', color: '#43A047', price: 200, seats: 20 },
  { name: 'Accessible', color: '#FF5722', price: 30, seats: 10 },
];


// eventId and apiRequest (or API_BASE_URL) should be passed as props or available via context
const InteractiveSeatMap = ({ zones = defaultZones, onSelectZone, eventId, apiRequest, API_BASE_URL }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [zoneConfig, setZoneConfig] = useState(zones);
  const [seatArrangement, setSeatArrangement] = useState({}); // { zoneName: [seatObj, ...] }
  const [saving, setSaving] = useState(false);

  const handleSaveZones = async () => {
    if (!eventId || !apiRequest) {
      toast.error('Event ID or API context missing');
      return;
    }
    setSaving(true);
    try {
      const response = await apiRequest(`${API_BASE_URL}/seats/event/${eventId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: zoneConfig.map(z => ({
          id: z.id,
          name: z.name,
          price: z.price,
          color: z.color,
          section: z.section || z.name,
          description: z.description || ''
        })) })
      });
      if (response.ok) {
        toast.success('Zones saved successfully!');
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to save zones');
      }
    } catch (err) {
      toast.error('Failed to save zones');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Interactive Seat Map
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {zoneConfig.map((zone, idx) => (
          <Chip
            key={zone.name}
            label={`${zone.name} (${zone.seats} seats)`}
            sx={{ bgcolor: zone.color, color: '#fff', fontWeight: 'bold', fontSize: '1rem', px: 2 }}
            onClick={() => {
              setSelectedZone(zone.name);
              if (onSelectZone) onSelectZone(zone);
            }}
            variant={selectedZone === zone.name ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      {/* Visual seat arrangement for selected zone */}
      {selectedZone && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Seat Arrangement for {selectedZone}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(seatArrangement[selectedZone] || Array(zoneConfig.find(z => z.name === selectedZone)?.seats || 0).fill(null)).map((seat, idx) => (
              <Button
                key={idx}
                size="small"
                variant={seat && seat.available === false ? 'outlined' : 'contained'}
                color={seat && seat.available === false ? 'error' : 'primary'}
                sx={{ minWidth: 32, minHeight: 32, p: 0, fontSize: '0.9rem', borderRadius: 1 }}
                onClick={() => {
                  setSeatArrangement(prev => {
                    const arr = { ...prev };
                    arr[selectedZone] = arr[selectedZone] || Array(zoneConfig.find(z => z.name === selectedZone)?.seats || 0).fill(null);
                    arr[selectedZone][idx] = arr[selectedZone][idx] && arr[selectedZone][idx].available === false
                      ? { ...arr[selectedZone][idx], available: true }
                      : { available: false };
                    return arr;
                  });
                }}
              >
                {idx + 1}
              </Button>
            ))}
          </Box>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Click seats to toggle availability (red = unavailable, blue = available)
          </Typography>
        </Box>
      )}
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setEditMode(!editMode)}>
        {editMode ? 'Done Editing Zones' : 'Edit Zones'}
      </Button>
      {editMode && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Zone Editor</Typography>
          {zoneConfig.map((zone, idx) => (
            <Box key={zone.name} sx={{ mb: 2, p: 2, bgcolor: '#fff', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{zone.name}</Typography>
              <input
                type="color"
                value={zone.color}
                onChange={e => {
                  const updated = [...zoneConfig];
                  updated[idx].color = e.target.value;
                  setZoneConfig(updated);
                }}
                style={{ marginRight: 8 }}
              />
              <input
                type="number"
                min={1}
                value={zone.seats}
                onChange={e => {
                  const updated = [...zoneConfig];
                  updated[idx].seats = parseInt(e.target.value) || 1;
                  setZoneConfig(updated);
                }}
                style={{ width: 80, marginRight: 8 }}
              />
              <input
                type="number"
                min={0}
                value={zone.price}
                onChange={e => {
                  const updated = [...zoneConfig];
                  updated[idx].price = parseFloat(e.target.value) || 0;
                  setZoneConfig(updated);
                }}
                style={{ width: 80, marginRight: 8 }}
              />
              <Button size="small" color="error" onClick={() => {
                setZoneConfig(zoneConfig.filter((_, i) => i !== idx));
              }}>Remove</Button>
            </Box>
          ))}
          <Button size="small" variant="contained" sx={{ mt: 1, mr: 2 }} onClick={() => {
            setZoneConfig([...zoneConfig, { name: `Zone ${zoneConfig.length + 1}`, color: '#888', price: 0, seats: 10 }]);
          }}>Add Zone</Button>
          <Button size="small" variant="contained" color="success" sx={{ mt: 1 }} onClick={handleSaveZones} disabled={saving}>
            {saving ? 'Saving...' : 'Save Zones'}
          </Button>
        </Box>
      )}
      {selectedZone && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Selected Zone: {selectedZone}
          </Typography>
          <Button variant="contained" sx={{ mt: 1 }}>
            Configure Zone
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InteractiveSeatMap;
