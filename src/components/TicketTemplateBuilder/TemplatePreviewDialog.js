import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import TicketPreview from './TicketPreview';

const TemplatePreviewDialog = ({ template, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Template Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Template Information
              </Typography>

              {template.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Description</Typography>
                  <Typography variant="body2">{template.description}</Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>Type</Typography>
                <Typography variant="body2">
                  <Chip label={template.ticket_type} size="small" />
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>Format</Typography>
                <Typography variant="body2">
                  {template.ticket_format} / {template.digital_format}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>Base Price</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  ${(Number(template.base_price) || 0).toFixed(2)} {template.currency}
                </Typography>
              </Box>

              {template.service_fee > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>Service Fee</Typography>
                  <Typography variant="body2">
                    ${(Number(template.service_fee) || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>Transferable</Typography>
                <Typography variant="body2">
                  {template.is_transferable ? '✓ Yes' : '✗ No'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#666' }}>Refundable</Typography>
                <Typography variant="body2">
                  {template.is_refundable ? '✓ Yes' : '✗ No'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Ticket Preview */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TicketPreview
                template={template}
                elements={Array.isArray(template.elements) ? template.elements : []}
                onClose={onClose}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
