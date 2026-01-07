import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import QRCode from 'qrcode.react';

// Ticket size presets with dimensions in inches (converted to pixels at 96 DPI)
const TICKET_SIZE_PRESETS = [
  { id: 'with-stub', name: 'With Stub', width: 5.63, height: 1.97 },
  { id: 'no-stub', name: 'Without Stub', width: 5.5, height: 2.125 },
  { id: 'vertical', name: 'Vertical', width: 2.75, height: 8.5 },
  { id: 'custom', name: 'Custom', width: 5.5, height: 2 }
];

// Convert inches to pixels (96 DPI standard for screen)
const inchesToPixels = (inches) => Math.round(inches * 96);

// Mock data for preview
const MOCK_TICKET_DATA = {
  event: {
    title: 'Tech Conference 2026',
    date: '2026-03-15',
    time: '09:00 AM',
    location: 'San Francisco Convention Center',
    timezone: 'PST'
  },
  attendee: {
    name: 'John Doe',
    email: 'john@example.com',
    id: 'ATT-2026-12345'
  },
  ticket: {
    type: 'VIP',
    number: 'TKT-2026-67890',
    section: 'A',
    seat: '101',
    qrValue: 'TKT-2026-67890-QR'
  }
};

const TicketPreview = ({ template, elements, onClose, onElementPositionChange }) => {
  const [loading, setLoading] = useState(false);
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = React.useRef(null);

  // Get size preset dimensions with large preview size
  const getSizePresetDimensions = () => {
    if (!template) return { width: 500, height: 300 };
    
    const presetId = template?.metadata?.sizePreset || 'custom';
    const preset = TICKET_SIZE_PRESETS.find(p => p.id === presetId);
    
    let aspectRatio = 5.5 / 2; // default aspect ratio
    
    if (preset && presetId !== 'custom') {
      aspectRatio = preset.width / preset.height;
    } else if (template?.metadata?.width && template?.metadata?.height) {
      aspectRatio = template.metadata.width / template.metadata.height;
    }

    // Large preview - fill dialog with max dimensions
    const maxWidth = 1200;
    const maxHeight = 1000;
    
    let displayWidth, displayHeight;
    
    if (aspectRatio > maxWidth / maxHeight) {
      // Width is the limiting factor
      displayWidth = maxWidth;
      displayHeight = Math.round(maxWidth / aspectRatio);
    } else {
      // Height is the limiting factor
      displayHeight = maxHeight;
      displayWidth = Math.round(maxHeight * aspectRatio);
    }

    return {
      width: displayWidth,
      height: displayHeight
    };
  };

  const sizeDimensions = getSizePresetDimensions();

  // Drag handlers
  const handleElementMouseDown = (e, elementId) => {
    if (e.button !== 0) return; // Only left-click
    
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggingElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingElement || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    if (onElementPositionChange) {
      onElementPositionChange(draggingElement, Math.max(0, newX), Math.max(0, newY));
    }
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  // All hooks must be called unconditionally
  React.useEffect(() => {
    if (draggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingElement, dragOffset, onElementPositionChange]);

  // Quick validation - after all hooks
  if (!template) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No template data</Typography>
      </Box>
    );
  }

  // Helper function to create gradient
  const createGradient = (config) => {
    if (!config.gradientType || config.gradientType === 'none') {
      const bgColor = config.backgroundColor || '#ffffff';
      return bgColor === 'transparent' ? 'transparent' : bgColor;
    }

    const startColor = config.backgroundColor === 'transparent' ? 'rgba(255,255,255,0)' : (config.backgroundColor || '#ffffff');
    const endColor = config.gradientEndColor === 'transparent' ? 'rgba(255,255,255,0)' : (config.gradientEndColor || '#000000');

    if (config.gradientType === 'linear-h') {
      return `linear-gradient(to right, ${startColor}, ${endColor})`;
    } else if (config.gradientType === 'linear-v') {
      return `linear-gradient(to bottom, ${startColor}, ${endColor})`;
    } else if (config.gradientType === 'radial') {
      return `radial-gradient(circle, ${startColor}, ${endColor})`;
    }
    return startColor;
  };

  // Helper function to create shadow
  const getShadowStyle = (shadowType) => {
    switch (shadowType) {
      case 'light':
        return '0 2px 4px rgba(0,0,0,0.1)';
      case 'medium':
        return '0 4px 8px rgba(0,0,0,0.2)';
      case 'heavy':
        return '0 8px 16px rgba(0,0,0,0.3)';
      default:
        return 'none';
    }
  };

  // Render element content based on type
  const renderElement = (element) => {
    if (!element || !element.type) {
      return null;
    }

    const { config = {} } = element;
    const elementId = element.id || `element-${Math.random()}`;
    
    // Base style with styling options and position
    const baseStyle = {
      width: config.width || 300,
      height: config.height || 50,
      fontSize: config.fontSize || 16,
      fontFamily: config.fontFamily || 'Arial',
      position: 'absolute',
      left: `${config.posX || 0}px`,
      top: `${config.posY || 0}px`,
      cursor: 'grab',
      color: config.color === 'transparent' ? 'transparent' : (config.color || '#000000'),
      textAlign: config.alignment || 'left',
      fontWeight: config.fontWeight || 'normal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: config.alignment === 'center' ? 'center' : config.alignment === 'right' ? 'flex-end' : 'flex-start',
      padding: '8px 12px',
      marginBottom: '0px',
      // Border styles
      border: config.borderWidth && config.borderColor !== 'transparent' ? `${config.borderWidth}px ${config.borderStyle || 'solid'} ${config.borderColor === 'transparent' ? 'transparent' : (config.borderColor || '#cccccc')}` : 'none',
      borderRadius: config.borderRadius ? `${config.borderRadius}px` : '0px',
      // Background and gradient
      background: createGradient(config),
      // Shadow
      boxShadow: getShadowStyle(config.shadow),
      // Opacity
      opacity: (config.opacity || 100) / 100,
      // Rotation
      transform: config.rotation ? `rotate(${config.rotation}deg)` : 'none',
      transformOrigin: 'center center',
      transition: 'transform 0.2s ease'
    };

    switch (element.type) {
      case 'event-title':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Typography variant="h6" sx={{ fontWeight: config.fontWeight || 'bold' }}>
              {config.customText || MOCK_TICKET_DATA.event.title}
            </Typography>
          </Box>
        );

      case 'event-info':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Box>
              <Typography variant="body2">
                <strong>Date:</strong> {MOCK_TICKET_DATA.event.date}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong> {MOCK_TICKET_DATA.event.time}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {MOCK_TICKET_DATA.event.location}
              </Typography>
            </Box>
          </Box>
        );

      case 'attendee-info':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Box>
              <Typography variant="body2">
                <strong>Attendee:</strong> {MOCK_TICKET_DATA.attendee.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {MOCK_TICKET_DATA.attendee.email}
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {MOCK_TICKET_DATA.attendee.id}
              </Typography>
            </Box>
          </Box>
        );

      case 'ticket-info':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Box>
              <Typography variant="body2">
                <strong>Type:</strong> {MOCK_TICKET_DATA.ticket.type}
              </Typography>
              <Typography variant="body2">
                <strong>Number:</strong> {MOCK_TICKET_DATA.ticket.number}
              </Typography>
              <Typography variant="body2">
                <strong>Section:</strong> {MOCK_TICKET_DATA.ticket.section} | <strong>Seat:</strong> {MOCK_TICKET_DATA.ticket.seat}
              </Typography>
            </Box>
          </Box>
        );

      case 'qr-code':
        const qrSize = config.qrSize === 'small' ? 150 : config.qrSize === 'large' ? 350 : 250;
        return (
          <Box 
            key={elementId} 
            sx={{ display: 'flex', justifyContent: 'center', my: 2, opacity: (config.opacity || 100) / 100, position: 'absolute', left: `${config.posX || 0}px`, top: `${config.posY || 0}px`, cursor: 'grab', transform: config.rotation ? `rotate(${config.rotation}deg)` : 'none', transformOrigin: 'center center' }}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Box sx={{ border: config.borderWidth && config.borderColor !== 'transparent' ? `${config.borderWidth}px ${config.borderStyle || 'solid'} ${config.borderColor === 'transparent' ? 'transparent' : (config.borderColor || '#cccccc')}` : 'none', borderRadius: config.borderRadius ? `${config.borderRadius}px` : '0px', padding: '4px' }}>
              <QRCode 
                value={MOCK_TICKET_DATA.ticket.qrValue} 
                size={qrSize} 
                level="H"
                fgColor={config.qrDarkColor || '#000000'}
                bgColor={config.qrLightColor || '#ffffff'}
              />
            </Box>
          </Box>
        );

      case 'logo':
        return (
          <Box
            key={elementId}
            sx={{
              width: config.width || 150,
              height: config.height || 100,
              display: 'flex',
              justifyContent: config.alignment === 'center' ? 'center' : config.alignment === 'right' ? 'flex-end' : 'flex-start',
              alignItems: 'center',
              mb: 2,
              overflow: 'hidden',
              border: config.borderWidth && config.borderColor !== 'transparent' ? `${config.borderWidth}px ${config.borderStyle || 'solid'} ${config.borderColor === 'transparent' ? 'transparent' : (config.borderColor || '#cccccc')}` : 'none',
              borderRadius: config.borderRadius ? `${config.borderRadius}px` : '0px',
              background: createGradient(config),
              boxShadow: getShadowStyle(config.shadow),
              opacity: (config.opacity || 100) / 100,
              position: 'absolute',
              left: `${config.posX || 0}px`,
              top: `${config.posY || 0}px`,
              cursor: 'grab',
              transform: config.rotation ? `rotate(${config.rotation}deg)` : 'none',
              transformOrigin: 'center center'
            }}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt="Logo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" color="textSecondary">Logo</Typography>
              </Box>
            )}
          </Box>
        );

      case 'extra-fields':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Typography variant="body2">
              {config.customText || 'Custom field data will appear here'}
            </Typography>
          </Box>
        );

      case 'divider':
        const lineLength = (config.lineLength || 200);
        return (
          <Box
            key={elementId}
            sx={{
              width: `${lineLength}px`,
              height: `${config.lineWidth || 2}px`,
              opacity: (config.opacity || 100) / 100,
              position: 'absolute',
              left: `${config.posX || 0}px`,
              top: `${config.posY || 0}px`,
              cursor: 'grab',
              background: config.borderColor === 'transparent' ? 'transparent' : (config.borderColor || config.color || '#000000'),
              boxShadow: getShadowStyle(config.shadow),
              transform: config.rotation ? `rotate(${config.rotation}deg)` : 'none',
              transformOrigin: 'center center'
            }}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          />
        );

      case 'spacer':
        return (
          <Box
            key={elementId}
            sx={{
              width: '100%',
              height: `${config.height || 20}px`,
              mb: 1,
              opacity: (config.opacity || 100) / 100,
              position: 'absolute',
              left: `${config.posX || 0}px`,
              top: `${config.posY || 0}px`,
              cursor: 'grab',
              transform: config.rotation ? `rotate(${config.rotation}deg)` : 'none',
              transformOrigin: 'center center'
            }}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          />
        );

      case 'ticket-number':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              <strong>Ticket #:</strong> {MOCK_TICKET_DATA.ticket.number}
            </Typography>
          </Box>
        );

      case 'price':
        return (
          <Box 
            key={elementId} 
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ${(config.price || 25).toFixed(2)}
            </Typography>
          </Box>
        );

      case 'barcode':
        return (
          <Box
            key={elementId}
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              my: 2,
              opacity: (config.opacity || 100) / 100,
              position: 'absolute',
              left: `${config.posX || 0}px`,
              top: `${config.posY || 0}px`,
              cursor: 'grab'
            }}
            onMouseDown={(e) => handleElementMouseDown(e, elementId)}
          >
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                border: config.borderWidth && config.borderColor !== 'transparent' ? `${config.borderWidth}px ${config.borderStyle || 'solid'} ${config.borderColor === 'transparent' ? 'transparent' : (config.borderColor || '#cccccc')}` : 'none',
                borderRadius: config.borderRadius ? `${config.borderRadius}px` : '0px',
                padding: '4px 8px',
                background: createGradient(config),
                boxShadow: getShadowStyle(config.shadow)
              }}
            >
              ▌ ▌▐ ▌▐▌ ▐
            </Box>
          </Box>
        );

      default:
        // Log unknown element types for debugging
        console.warn('Unknown element type:', element.type);
        return null;
      }
      return null; // Fallback return
  };

  return (
    <Paper
      ref={previewRef}
      sx={{
        backgroundColor: template?.background_color || '#ffffff',
        backgroundImage: template?.background_image ? `url(${template.background_image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 3,
        borderRadius: 2,
        width: `${sizeDimensions.width}px`,
        height: `${sizeDimensions.height}px`,
        mx: 'auto',
        boxShadow: 3,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        display: 'block',
        position: 'relative'
      }}
    >
      {!elements || elements.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: '#999', textAlign: 'center' }}>
            Add elements to preview the ticket
          </Typography>
        </Box>
      ) : (
        elements.map((element) => {
          if (!element || !element.type) return null;
          return renderElement(element);
        })
      )}
    </Paper>
  );
};

export default TicketPreview;
