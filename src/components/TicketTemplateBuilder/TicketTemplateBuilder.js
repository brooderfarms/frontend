import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import TicketPreview from './TicketPreview';
import TemplateElementEditor from './TemplateElementEditor';

// Ticket size presets (in inches)
const TICKET_SIZE_PRESETS = [
  { id: 'standard-with-stub', label: 'Standard with Stub', width: 5.63, height: 1.97, description: '5.63" × 1.97"' },
  { id: 'standard-no-stub', label: 'Standard without Stub', width: 5.5, height: 2.125, description: '5.5" × 2.125"' },
  { id: 'vertical', label: 'Vertical', width: 2.75, height: 8.5, description: '2.75" × 8.5"' },
  { id: 'custom', label: 'Custom Size', width: null, height: null, description: 'Set your own' }
];

const AVAILABLE_ELEMENTS = [
  { id: 'logo', label: 'Logo/Image', icon: '🖼️' },
  { id: 'event-title', label: 'Event Title', icon: '📋' },
  { id: 'event-info', label: 'Event Info', icon: '📅' },
  { id: 'ticket-number', label: 'Ticket Number', icon: '🔢' },
  { id: 'price', label: 'Price', icon: '💰' },
  { id: 'attendee-info', label: 'Attendee Info', icon: '👤' },
  { id: 'ticket-info', label: 'Seat/Section Info', icon: '🎫' },
  { id: 'qr-code', label: 'QR Code', icon: '📲' },
  { id: 'barcode', label: 'Barcode', icon: '📊' },
  { id: 'extra-fields', label: 'Custom Fields', icon: '📝' },
  { id: 'divider', label: 'Divider Line', icon: '━' },
  { id: 'spacer', label: 'Spacer', icon: '⬜' }
];

// Sortable template element component
const SortableElement = ({ element, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        backgroundColor: isDragging ? '#f5f5f5' : '#fff',
        border: isDragging ? '2px dashed #2196F3' : '1px solid #e0e0e0',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: '#999' }}>
              <DragIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {element.label}
              </Typography>
              {element.config?.customText && (
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Text: "{element.config.customText}"
                </Typography>
              )}
              {element.config?.width && (
                <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                  Size: {element.config.width}px × {element.config.height}px
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(element)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(element.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const TicketTemplateBuilder = ({ templateId, onSave, initialTemplate, apiRequest, API_BASE_URL }) => {
  // Create default elements
  const createDefaultElements = () => [
    {
      id: `element-${Date.now()}-1`,
      type: 'logo',
      label: 'Logo/Image',
      config: {
        width: 120,
        height: 80,
        alignment: 'center',
        borderRadius: 4,
        shadow: 'light'
      }
    },
    {
      id: `element-${Date.now()}-2`,
      type: 'event-title',
      label: 'Event Title',
      config: {
        width: 300,
        height: 60,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        alignment: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 4,
        shadow: 'medium'
      }
    },
    {
      id: `element-${Date.now()}-3`,
      type: 'divider',
      label: 'Divider Line',
      config: {
        lineWidth: 2,
        lineLength: 80,
        borderStyle: 'solid',
        borderColor: '#FFD700',
        shadow: 'light'
      }
    },
    {
      id: `element-${Date.now()}-4`,
      type: 'event-info',
      label: 'Event Info',
      config: {
        width: 300,
        height: 80,
        fontSize: 14,
        color: '#333333',
        alignment: 'left',
        backgroundColor: '#f5f5f5',
        borderRadius: 2
      }
    },
    {
      id: `element-${Date.now()}-5`,
      type: 'spacer',
      label: 'Spacer',
      config: {
        height: 15
      }
    },
    {
      id: `element-${Date.now()}-6`,
      type: 'qr-code',
      label: 'QR Code',
      config: {
        qrSize: 'large',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: '#000000',
        borderRadius: 4,
        shadow: 'medium'
      }
    },
    {
      id: `element-${Date.now()}-7`,
      type: 'spacer',
      label: 'Spacer',
      config: {
        height: 10
      }
    },
    {
      id: `element-${Date.now()}-8`,
      type: 'attendee-info',
      label: 'Attendee Info',
      config: {
        width: 300,
        height: 70,
        fontSize: 13,
        color: '#000000',
        alignment: 'center'
      }
    },
    {
      id: `element-${Date.now()}-9`,
      type: 'ticket-info',
      label: 'Ticket Info',
      config: {
        width: 300,
        height: 50,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFD700',
        alignment: 'center'
      }
    },
    {
      id: `element-${Date.now()}-10`,
      type: 'extra-fields',
      label: 'Custom Fields',
      config: {
        width: 300,
        height: 40,
        fontSize: 12,
        color: '#666666',
        alignment: 'center',
        customText: 'ADMIT ONE'
      }
    }
  ];

  const [template, setTemplate] = useState(initialTemplate || {
    name: '',
    description: '',
    base_price: 0,
    currency: 'USD',
    ticket_type: 'standard',
    ticket_format: 'digital',
    digital_format: 'qr_code',
    is_transferable: true,
    is_refundable: true,
    background_color: '#ffffff',
    background_image: '',
    elements: [],
    metadata: {}
  });

  // Initialize with default elements only if it's a new template (no ID and no elements)
  const [elements, setElements] = useState(() => {
    if (initialTemplate?.elements && initialTemplate.elements.length > 0) {
      // Deep copy elements to prevent shared references
      return initialTemplate.elements.map(el => ({
        ...el,
        config: { ...el.config },
        id: el.id || `element-${Math.random()}`
      }));
    }
    if (!templateId) {
      // New template - add default elements
      return createDefaultElements();
    }
    return [];
  });

  const [tabValue, setTabValue] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [elementDialogOpen, setElementDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex(el => el.id === active.id);
      const newIndex = elements.findIndex(el => el.id === over.id);
      setElements(arrayMove(elements, oldIndex, newIndex));
    }
  };

  // Add element
  const handleAddElement = (elementType) => {
    const element = AVAILABLE_ELEMENTS.find(el => el.id === elementType);
    if (!element) return;

    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      label: element.label,
      config: {
        width: 300,
        height: 50,
        fontSize: 16,
        color: '#000000',
        alignment: 'left'
      }
    };

    setElements([...elements, newElement]);
    toast.success(`${element.label} added`);
  };

  // Delete element
  const handleDeleteElement = (elementId) => {
    setElements(elements.filter(el => el.id !== elementId));
    toast.success('Element removed');
  };

  // Edit element
  const handleEditElement = (element) => {
    setEditingElement(element);
    setElementDialogOpen(true);
  };

  // Update element position during drag
  const handleElementPositionChange = (elementId, x, y) => {
    setElements(elements.map(el => 
      el.id === elementId 
        ? {
            ...el,
            config: {
              ...el.config,
              posX: Math.max(0, x),
              posY: Math.max(0, y)
            }
          }
        : el
    ));
  };

  // Save element changes
  const handleSaveElement = (updatedElement) => {
    setElements(elements.map(el => el.id === updatedElement.id ? updatedElement : el));
    setElementDialogOpen(false);
    setEditingElement(null);
    toast.success('Element updated');
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add at least one element to the template');
      return;
    }

    try {
      const templateData = {
        ...template,
        elements: elements,
        metadata: {
          ...template.metadata,
          element_count: elements.length,
          last_modified: new Date().toISOString()
        }
      };

      if (onSave) {
        await onSave(templateData);
      }
      
      toast.success('Template saved successfully!');
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {templateId ? 'Edit Ticket Template' : 'Create Ticket Template'}
      </Typography>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Template Settings" />
        <Tab label="Template Design" />
      </Tabs>

      {/* Tab 0: Template Settings */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="e.g., Standard VIP Ticket"
                helperText="Give your template a recognizable name"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                placeholder="Describe this ticket template"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={template.base_price || 0}
                onChange={(e) => setTemplate({ ...template, base_price: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={template.currency || 'USD'}
                  label="Currency"
                  onChange={(e) => setTemplate({ ...template, currency: e.target.value })}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="ZWL">ZWL</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ticket Type</InputLabel>
                <Select
                  value={template.ticket_type || 'standard'}
                  label="Ticket Type"
                  onChange={(e) => setTemplate({ ...template, ticket_type: e.target.value })}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="vip">VIP</MenuItem>
                  <MenuItem value="general-admission">General Admission</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ticket Format</InputLabel>
                <Select
                  value={template.ticket_format || 'digital'}
                  label="Ticket Format"
                  onChange={(e) => setTemplate({ ...template, ticket_format: e.target.value })}
                >
                  <MenuItem value="digital">Digital</MenuItem>
                  <MenuItem value="physical">Physical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Digital Format(s)</InputLabel>
                <Select
                  multiple
                  value={Array.isArray(template.digital_format) ? template.digital_format : (template.digital_format ? [template.digital_format] : ['qr_code'])}
                  label="Digital Format(s)"
                  onChange={(e) => setTemplate({ ...template, digital_format: e.target.value })}
                >
                  <MenuItem value="qr_code">QR Code</MenuItem>
                  <MenuItem value="barcode">Barcode</MenuItem>
                  <MenuItem value="nfc">NFC</MenuItem>
                  <MenuItem value="rfid">RFID</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Transferable</InputLabel>
                  <Select
                    value={template.is_transferable ? 'yes' : 'no'}
                    label="Transferable"
                    onChange={(e) => setTemplate({ ...template, is_transferable: e.target.value === 'yes' })}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Refundable</InputLabel>
                  <Select
                    value={template.is_refundable ? 'yes' : 'no'}
                    label="Refundable"
                    onChange={(e) => setTemplate({ ...template, is_refundable: e.target.value === 'yes' })}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ticket Size</InputLabel>
                <Select
                  value={template.metadata?.sizePreset || 'custom'}
                  label="Ticket Size"
                  onChange={(e) => {
                    const preset = TICKET_SIZE_PRESETS.find(p => p.id === e.target.value);
                    setTemplate({
                      ...template,
                      metadata: {
                        ...template.metadata,
                        sizePreset: e.target.value,
                        width: preset?.width,
                        height: preset?.height
                      }
                    });
                  }}
                >
                  {TICKET_SIZE_PRESETS.map(preset => (
                    <MenuItem key={preset.id} value={preset.id}>
                      {preset.label} - {preset.width}" × {preset.height}"
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Background Color</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={template.background_color}
                    onChange={(e) => setTemplate({ ...template, background_color: e.target.value })}
                    style={{ width: 60, height: 40, cursor: 'pointer', borderRadius: 4, border: '1px solid #ddd' }}
                  />
                  <TextField
                    value={template.background_color}
                    onChange={(e) => setTemplate({ ...template, background_color: e.target.value })}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPreviewOpen(true)}
                startIcon={<PreviewIcon />}
              >
                Preview Ticket
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveTemplate}
              fullWidth
            >
              Save Template
            </Button>
          </Box>
        </Paper>
      )}

      {/* Tab 1: Template Design */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Available Elements Panel */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Available Elements
              </Typography>
              <Stack spacing={1}>
                {AVAILABLE_ELEMENTS.map(element => (
                  <Button
                    key={element.id}
                    variant="outlined"
                    fullWidth
                    startIcon={element.icon}
                    onClick={() => handleAddElement(element.id)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {element.label}
                  </Button>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" sx={{ color: '#666' }}>
                <strong>Tip:</strong> Click a button to add it to your ticket. Drag elements to reorder them. Click the edit icon to customize.
              </Typography>
            </Paper>
          </Grid>

          {/* Template Elements Panel */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Ticket Elements ({elements.length})
              </Typography>

              {elements.length === 0 ? (
                <Alert severity="info">
                  Add elements by clicking the buttons on the left. You can reorder them by dragging.
                </Alert>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={elements.map(el => el.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {elements.map(element => (
                      <SortableElement
                        key={element.id}
                        element={element}
                        onEdit={handleEditElement}
                        onDelete={handleDeleteElement}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Element Editor Dialog */}
      <Dialog
        open={elementDialogOpen}
        onClose={() => setElementDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {editingElement && (
          <TemplateElementEditor
            element={editingElement}
            onSave={handleSaveElement}
            onCancel={() => setElementDialogOpen(false)}            apiRequest={apiRequest}
            API_BASE_URL={API_BASE_URL}          />
        )}
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <TicketPreview
          template={template}
          elements={elements}
          onClose={() => setPreviewOpen(false)}
          onElementPositionChange={handleElementPositionChange}
        />
      </Dialog>
    </Container>
  );
};

export default TicketTemplateBuilder;
