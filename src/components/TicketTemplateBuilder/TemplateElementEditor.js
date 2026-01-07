import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

// Color Picker Component with Transparent Option
const ColorPicker = ({ label, value, onChange, includeTransparent = true }) => {
  const isTransparent = value === 'transparent' || !value;
  
  return (
    <Box>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{label}</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="color"
          value={isTransparent ? '#ffffff' : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isTransparent}
          style={{ 
            width: 50, 
            height: 40, 
            cursor: isTransparent ? 'not-allowed' : 'pointer', 
            borderRadius: 4,
            opacity: isTransparent ? 0.5 : 1
          }}
        />
        <TextField
          size="small"
          value={isTransparent ? 'transparent' : value}
          onChange={(e) => onChange(e.target.value === 'transparent' ? 'transparent' : e.target.value)}
          sx={{ flexGrow: 1 }}
          placeholder="transparent or hex color"
        />
        {includeTransparent && (
          <Chip
            label={isTransparent ? 'Transparent' : 'Solid'}
            onClick={() => onChange(isTransparent ? '#000000' : 'transparent')}
            color={isTransparent ? 'primary' : 'default'}
            variant={isTransparent ? 'filled' : 'outlined'}
            size="small"
          />
        )}
      </Box>
    </Box>
  );
};

const TemplateElementEditor = ({ element, onSave, onCancel, apiRequest, API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api' }) => {
  const [config, setConfig] = useState(element.config || {});
  const [customText, setCustomText] = useState(element.config?.customText || '');
  const [logoMode, setLogoMode] = useState(element.type === 'logo' ? (config.logoUrl?.startsWith('http') && !config.logoUrl?.includes('tick-uploads') ? 'url' : 'upload') : 'url');
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setConfig({ ...config, logoUrl: data.fileUrl });
        toast.success('Logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const updatedElement = {
      ...element,
      config: {
        ...config,
        ...(customText && { customText })
      }
    };
    onSave(updatedElement);
  };

  return (
    <>
      <DialogTitle>Edit {element.label}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          {/* Logo URL or Upload (for logo element type) */}
          {element.type === 'logo' && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Logo Source</Typography>
                <ToggleButtonGroup
                  value={logoMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode) setLogoMode(newMode);
                  }}
                  fullWidth
                >
                  <ToggleButton value="upload">Upload</ToggleButton>
                  <ToggleButton value="url">URL</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {logoMode === 'upload' ? (
                <Grid item xs={12}>
                  <Box sx={{ border: '2px dashed #2196F3', borderRadius: 1, p: 2, textAlign: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#eeeeee' } }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                      style={{ display: 'none' }}
                      id="logo-upload-input"
                      disabled={uploading}
                    />
                    <label htmlFor="logo-upload-input" style={{ cursor: 'pointer', display: 'block' }}>
                      {uploading ? (
                        <>
                          <CircularProgress size={24} sx={{ mb: 1 }} />
                          <Typography variant="body2">Uploading...</Typography>
                        </>
                      ) : (
                        <>
                          <UploadIcon sx={{ fontSize: 32, mb: 1, color: '#2196F3' }} />
                          <Typography variant="body2">Click to upload or drag and drop</Typography>
                          <Typography variant="caption" color="textSecondary">PNG, JPG or GIF up to 5MB</Typography>
                        </>
                      )}
                    </label>
                  </Box>
                  {config.logoUrl && config.logoUrl.includes('tick-uploads') && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      ✓ Logo uploaded: {config.logoUrl.split('/').pop()}
                    </Typography>
                  )}
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={config.logoUrl || ''}
                    onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    helperText="Enter the full URL to your logo image"
                  />
                </Grid>
              )}
            </>
          )}

          {/* Custom Text (for certain element types) */}
          {['event-title', 'attendee-info', 'extra-fields'].includes(element.type) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custom Text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Optional: Add custom text to display"
                helperText="Leave empty to use default element content"
              />
            </Grid>
          )}

          {/* Price Field (for price element) */}
          {element.type === 'price' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Price ($)"
                value={config.price || 25}
                onChange={(e) => setConfig({ ...config, price: parseFloat(e.target.value) })}
                step="0.01"
                inputProps={{ min: 0 }}
                helperText="The price to display on the ticket"
              />
            </Grid>
          )}

          {/* Position X */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Position X (px)"
              value={config.posX || 0}
              onChange={(e) => setConfig({ ...config, posX: parseInt(e.target.value) })}
              inputProps={{ min: 0 }}
              helperText="Horizontal position"
            />
          </Grid>

          {/* Position Y */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Position Y (px)"
              value={config.posY || 0}
              onChange={(e) => setConfig({ ...config, posY: parseInt(e.target.value) })}
              inputProps={{ min: 0 }}
              helperText="Vertical position"
            />
          </Grid>

          {/* Rotation */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Rotation (degrees)"
              value={config.rotation || 0}
              onChange={(e) => setConfig({ ...config, rotation: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 360 }}
              helperText="0-360 degrees"
            />
          </Grid>

          {/* Width */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Width (px)"
              value={config.width || 300}
              onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) })}
              inputProps={{ min: 50, max: 600 }}
            />
          </Grid>

          {/* Height */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Height (px)"
              value={config.height || 50}
              onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) })}
              inputProps={{ min: 20, max: 400 }}
            />
          </Grid>

          {/* Font Size */}
          {!['qr-code', 'logo'].includes(element.type) && (
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Font Size (px)"
                value={config.fontSize || 16}
                onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                inputProps={{ min: 8, max: 48 }}
              />
            </Grid>
          )}

          {/* Font Family */}
          {!['qr-code', 'logo', 'divider', 'spacer'].includes(element.type) && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={config.fontFamily || 'Arial'}
                  onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                  label="Font Family"
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                  <MenuItem value="Comic Sans MS">Comic Sans MS</MenuItem>
                  <MenuItem value="Trebuchet MS">Trebuchet MS</MenuItem>
                  <MenuItem value="monospace">Monospace</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Text Color */}
          {!['qr-code', 'logo'].includes(element.type) && (
            <Grid item xs={6}>
              <ColorPicker
                label="Text Color"
                value={config.color || '#000000'}
                onChange={(color) => setConfig({ ...config, color })}
              />
            </Grid>
          )}

          {/* Text Alignment */}
          {!['qr-code', 'logo'].includes(element.type) && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Alignment</InputLabel>
                <Select
                  value={config.alignment || 'left'}
                  onChange={(e) => setConfig({ ...config, alignment: e.target.value })}
                  label="Alignment"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* QR Code Size */}
          {element.type === 'qr-code' && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>QR Code Size</InputLabel>
                <Select
                  value={config.qrSize || 'medium'}
                  onChange={(e) => setConfig({ ...config, qrSize: e.target.value })}
                  label="QR Code Size"
                >
                  <MenuItem value="small">Small (150px)</MenuItem>
                  <MenuItem value="medium">Medium (250px)</MenuItem>
                  <MenuItem value="large">Large (350px)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* QR Code Foreground Color */}
          {element.type === 'qr-code' && (
            <Grid item xs={6}>
              <ColorPicker
                label="QR Code Color (Dark)"
                value={config.qrDarkColor || '#000000'}
                onChange={(color) => setConfig({ ...config, qrDarkColor: color })}
                includeTransparent={false}
              />
            </Grid>
          )}

          {/* QR Code Background Color */}
          {element.type === 'qr-code' && (
            <Grid item xs={6}>
              <ColorPicker
                label="QR Code Background"
                value={config.qrLightColor || '#ffffff'}
                onChange={(color) => setConfig({ ...config, qrLightColor: color })}
                includeTransparent={false}
              />
            </Grid>
          )}

          {/* Bold Text */}
          {!['qr-code', 'logo', 'divider', 'spacer'].includes(element.type) && (
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Weight</InputLabel>
                <Select
                  value={config.fontWeight || 'normal'}
                  onChange={(e) => setConfig({ ...config, fontWeight: e.target.value })}
                  label="Weight"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="bold">Bold</MenuItem>
                  <MenuItem value="600">Semi-Bold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* BORDER STYLES */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Border & Shadow</Typography>
          </Grid>

          {/* Border Width */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Border Width (px)"
              value={config.borderWidth || 0}
              onChange={(e) => setConfig({ ...config, borderWidth: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 10 }}
              helperText="0 for no border"
            />
          </Grid>

          {/* Border Style */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Border Style</InputLabel>
              <Select
                value={config.borderStyle || 'solid'}
                onChange={(e) => setConfig({ ...config, borderStyle: e.target.value })}
                label="Border Style"
              >
                <MenuItem value="solid">Solid</MenuItem>
                <MenuItem value="dashed">Dashed</MenuItem>
                <MenuItem value="dotted">Dotted</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Border Color */}
          <Grid item xs={12}>
            <ColorPicker
              label="Border Color"
              value={config.borderColor || '#cccccc'}
              onChange={(color) => setConfig({ ...config, borderColor: color })}
            />
          </Grid>

          {/* Border Radius */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Border Radius (px)"
              value={config.borderRadius || 0}
              onChange={(e) => setConfig({ ...config, borderRadius: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 50 }}
              helperText="Rounded corners"
            />
          </Grid>

          {/* Shadow */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Shadow</InputLabel>
              <Select
                value={config.shadow || 'none'}
                onChange={(e) => setConfig({ ...config, shadow: e.target.value })}
                label="Shadow"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="heavy">Heavy</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* GRADIENT BACKGROUND */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Gradient & Effects</Typography>
          </Grid>

          {/* Background Color for elements */}
          <Grid item xs={12}>
            <ColorPicker
              label="Background Color"
              value={config.backgroundColor || '#ffffff'}
              onChange={(color) => setConfig({ ...config, backgroundColor: color })}
            />
          </Grid>

          {/* Use Gradient */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Gradient Type</InputLabel>
              <Select
                value={config.gradientType || 'none'}
                onChange={(e) => setConfig({ ...config, gradientType: e.target.value })}
                label="Gradient Type"
              >
                <MenuItem value="none">None (Solid)</MenuItem>
                <MenuItem value="linear-h">Linear Horizontal</MenuItem>
                <MenuItem value="linear-v">Linear Vertical</MenuItem>
                <MenuItem value="radial">Radial</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Gradient End Color */}
          {config.gradientType && config.gradientType !== 'none' && (
            <Grid item xs={6}>
              <ColorPicker
                label="Gradient End Color"
                value={config.gradientEndColor || '#000000'}
                onChange={(color) => setConfig({ ...config, gradientEndColor: color })}
              />
            </Grid>
          )}

          {/* Opacity */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Opacity (%)"
              value={config.opacity || 100}
              onChange={(e) => setConfig({ ...config, opacity: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: 100 }}
              helperText="0-100%"
            />
          </Grid>

          {/* Divider specific settings */}
          {element.type === 'divider' && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Line Width (px)"
                  value={config.lineWidth || 2}
                  onChange={(e) => setConfig({ ...config, lineWidth: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Line Length (%)"
                  value={config.lineLength || 100}
                  onChange={(e) => setConfig({ ...config, lineLength: parseInt(e.target.value) })}
                  inputProps={{ min: 10, max: 100 }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </>
  );
};

export default TemplateElementEditor;
