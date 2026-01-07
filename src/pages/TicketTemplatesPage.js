import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  Chip,
  IconButton,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  Search as SearchIcon,
  FileCopy as DuplicateIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TicketTemplateBuilder from '../components/TicketTemplateBuilder/TicketTemplateBuilder';
import TemplatePreviewDialog from '../components/TicketTemplateBuilder/TemplatePreviewDialog';
import TemplatePresetsSection from '../components/TicketTemplateBuilder/TemplatePresetsSection';

const TicketTemplatesPage = () => {
  const { user, apiRequest, API_BASE_URL } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingFromPreset, setCreatingFromPreset] = useState(null);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/ticket-templates`);
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const { data = [] } = await response.json();
      setTemplates(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        active: data.filter(t => t.is_active).length,
        inactive: data.filter(t => !t.is_active).length
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  // Save new or updated template
  const handleSaveTemplate = async (templateData) => {
    try {
      const url = editing
        ? `${API_BASE_URL}/ticket-templates/${editing.id}`
        : `${API_BASE_URL}/ticket-templates`;

      const method = editing ? 'PUT' : 'POST';

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(templateData)
      });

      if (!response.ok) throw new Error('Failed to save template');

      toast.success(editing ? 'Template updated' : 'Template created');
      
      // Reset state and reload
      setCreating(false);
      setCreatingFromPreset(null);
      setEditing(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Handle preset selection
  const handleSelectPreset = (preset) => {
    setCreatingFromPreset(preset);
    setCreating(true);
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await apiRequest(`${API_BASE_URL}/ticket-templates/${templateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete template');

      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Duplicate template
  const handleDuplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        id: undefined // Remove ID so backend creates new one
      };

      const response = await apiRequest(`${API_BASE_URL}/ticket-templates`, {
        method: 'POST',
        body: JSON.stringify(duplicateData)
      });

      if (!response.ok) throw new Error('Failed to duplicate template');

      toast.success('Template duplicated');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check role access
  if (!['admin', 'organizer', 'venue_manager'].includes(user?.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          You don't have permission to access ticket templates.
        </Alert>
      </Container>
    );
  }

  // Show builder if creating or editing
  if (creating || editing) {
    // Build initial template from preset if creating from preset
    let templateToEdit = editing;
    if (creatingFromPreset && !editing) {
      // Deep copy elements to prevent shared references
      const copiedElements = creatingFromPreset.elements.map(el => ({
        ...el,
        config: { ...el.config },
        id: el.id || `element-${Math.random()}`
      }));
      
      templateToEdit = {
        name: creatingFromPreset.name,
        description: creatingFromPreset.description,
        background_color: creatingFromPreset.backgroundColor || '#ffffff',
        elements: copiedElements,
        metadata: {
          sizePreset: creatingFromPreset.sizePreset
        }
      };
    }

    return (
      <TicketTemplateBuilder
        templateId={editing?.id}
        initialTemplate={templateToEdit}
        onSave={handleSaveTemplate}
        apiRequest={apiRequest}
        API_BASE_URL={API_BASE_URL}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Ticket Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreating(true)}
        >
          Create Template
        </Button>
      </Box>

      {/* Template Presets Section */}
      <TemplatePresetsSection onSelectPreset={handleSelectPreset} />

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Total Templates
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Active
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, color: 'success.main' }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="body2">
                Inactive
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, color: 'warning.main' }}>
                {stats.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search templates by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Templates Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredTemplates.length === 0 ? (
        <Alert severity="info">
          {searchQuery ? 'No templates match your search' : 'No templates created yet. Click "Create Template" to get started.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Format</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {template.name}
                      </Typography>
                      {template.description && (
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {template.description.substring(0, 50)}...
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.ticket_type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {template.ticket_format === 'digital' ? '📱' : '📄'} {template.digital_format}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ${(Number(template.base_price) || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.is_active ? 'Active' : 'Inactive'}
                      color={template.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => setEditing(template)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Preview Dialog */}
      {previewTemplate && (
        <TemplatePreviewDialog
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </Container>
  );
};

export default TicketTemplatesPage;
