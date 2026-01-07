import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  MusicNote as MusicNoteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Template Preset Configurations
export const TEMPLATE_PRESETS = [
  {
    id: 'standard-event',
    name: 'Standard Event Ticket',
    description: 'Classic ticket format with stub for 5.63" × 1.97" tickets',
    sizePreset: 'with-stub',
    elements: [
      { type: 'logo', label: 'Logo', config: { width: 80, height: 60 } },
      { type: 'event-title', label: 'Event Title', config: { fontSize: 24, fontWeight: 'bold' } },
      { type: 'event-info', label: 'Event Info', config: { fontSize: 12 } },
      { type: 'ticket-number', label: 'Ticket Number', config: { fontSize: 14, fontFamily: 'monospace' } },
      { type: 'attendee-info', label: 'Attendee Info', config: { fontSize: 12 } },
      { type: 'divider', label: 'Divider', config: { lineLength: 80 } },
      { type: 'qr-code', label: 'QR Code', config: { qrSize: 'medium' } }
    ],
    backgroundColor: '#ffffff'
  },
  {
    id: 'concert-ticket',
    name: 'Concert Ticket',
    description: 'High-contrast design optimized for concerts and live events (5.5" × 2.125")',
    sizePreset: 'no-stub',
    elements: [
      { type: 'event-title', label: 'Event Title', config: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' } },
      { type: 'event-info', label: 'Event Info', config: { fontSize: 14, color: '#ffffff' } },
      { type: 'ticket-number', label: 'Ticket Number', config: { fontSize: 16, color: '#ffffff' } },
      { type: 'price', label: 'Price', config: { fontSize: 20, fontWeight: 'bold', color: '#FFD700' } },
      { type: 'qr-code', label: 'QR Code', config: { qrSize: 'medium' } },
      { type: 'barcode', label: 'Barcode', config: { fontSize: 12 } }
    ],
    backgroundColor: '#1a1a1a'
  },
  {
    id: 'admission-ticket',
    name: 'Vertical Admission Ticket',
    description: 'Vertical format for admissions and entries (2.75" × 8.5")',
    sizePreset: 'vertical',
    elements: [
      { type: 'logo', label: 'Logo', config: { width: 100, height: 80 } },
      { type: 'event-title', label: 'Event Title', config: { fontSize: 20, fontWeight: 'bold', alignment: 'center' } },
      { type: 'spacer', label: 'Spacer', config: { height: 20 } },
      { type: 'ticket-number', label: 'Ticket Number', config: { fontSize: 16, alignment: 'center' } },
      { type: 'spacer', label: 'Spacer', config: { height: 20 } },
      { type: 'qr-code', label: 'QR Code', config: { qrSize: 'large' } },
      { type: 'event-info', label: 'Event Info', config: { fontSize: 11, alignment: 'center' } }
    ],
    backgroundColor: '#f0f0f0'
  }
];

const TemplatePresetsSection = ({ onSelectPreset }) => {
  const presetIcons = {
    'standard-event': CheckCircleIcon,
    'concert-ticket': MusicNoteIcon,
    'admission-ticket': PersonIcon
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Get Started with Templates
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Choose a preset to quickly create a professional ticket template
      </Typography>

      <Grid container spacing={3}>
        {TEMPLATE_PRESETS.map((preset) => {
          const IconComponent = presetIcons[preset.id] || CheckCircleIcon;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={preset.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  },
                  cursor: 'pointer'
                }}
                onClick={() => onSelectPreset(preset)}
              >
                <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconComponent sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {preset.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {preset.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666' }}>
                    <strong>Includes {preset.elements.length} pre-configured elements:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {preset.elements.slice(0, 4).map((el, idx) => (
                      <Typography key={idx} variant="caption" sx={{ 
                        backgroundColor: '#e3f2fd', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {el.label}
                      </Typography>
                    ))}
                    {preset.elements.length > 4 && (
                      <Typography variant="caption" sx={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        +{preset.elements.length - 4} more
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => onSelectPreset(preset)}
                  sx={{ mt: 'auto' }}
                >
                  Use This Template
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TemplatePresetsSection;
