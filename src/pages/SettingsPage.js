import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsPage = () => {
  const { user, apiRequest, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    commission: [],
    taxes: [],
    fees: [],
    other: []
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    key: '',
    value: '',
    type: 'percentage',
    description: ''
  });
  const [formData, setFormData] = useState({
    default_commission_rate: 5,
    vat_rate: 0,
    sales_tax_rate: 0,
    processing_fee: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${API_BASE_URL}/admin/settings`);

      if (!response.ok) throw new Error('Failed to fetch settings');

      const { data } = await response.json();
      setSettings(data);

      // Flatten to form data
      const flattened = {};
      Object.values(data).forEach(category => {
        category.forEach(setting => {
          flattened[setting.key] = setting.value;
        });
      });
      setFormData(flattened);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const settingsArray = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        type: 'percentage'
      }));

      const response = await apiRequest(`${API_BASE_URL}/admin/settings/bulk`, {
        method: 'POST',
        body: JSON.stringify({ settings: settingsArray })
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSetting = (setting) => {
    setEditDialog({
      open: true,
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description
    });
  };

  const handleSaveEditedSetting = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${API_BASE_URL}/admin/settings/${editDialog.key}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            value: editDialog.value,
            type: editDialog.type,
            description: editDialog.description
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update setting');

      toast.success('Setting updated successfully');
      setEditDialog({ open: false, key: '', value: '', type: '', description: '' });
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Unauthorized: Admin access required</Alert>
      </Container>
    );
  }

  const allSettings = [
    ...settings.commission,
    ...settings.taxes,
    ...settings.fees,
    ...settings.other
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">System Settings</Typography>
      </Box>

      {loading && <CircularProgress />}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Quick Edit" value={0} />
          <Tab label="All Settings" value={1} />
          <Tab label="Fee Calculator" value={2} />
        </Tabs>

        {/* Quick Edit Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Configure Primary Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Default Commission Rate (%)"
                  type="number"
                  value={formData.default_commission_rate || ''}
                  onChange={(e) => handleFormChange('default_commission_rate', e.target.value)}
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  helperText="Percentage taken from each ticket sale"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="VAT Rate (%)"
                  type="number"
                  value={formData.vat_rate || ''}
                  onChange={(e) => handleFormChange('vat_rate', e.target.value)}
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  helperText="Value Added Tax"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sales Tax Rate (%)"
                  type="number"
                  value={formData.sales_tax_rate || ''}
                  onChange={(e) => handleFormChange('sales_tax_rate', e.target.value)}
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  helperText="Additional sales tax"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Processing Fee (%)"
                  type="number"
                  value={formData.processing_fee || ''}
                  onChange={(e) => handleFormChange('processing_fee', e.target.value)}
                  fullWidth
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  helperText="Payment processing fee"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outlined" onClick={fetchSettings}>
                Reload
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* All Settings Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              All System Settings
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Setting Key</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allSettings.map((setting) => (
                    <TableRow key={setting.key} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        {setting.key}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {typeof setting.value === 'number'
                            ? setting.value.toFixed(2)
                            : String(setting.value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ backgroundColor: '#e3f2fd', p: 1, borderRadius: 1 }}>
                          {setting.type}
                        </Typography>
                      </TableCell>
                      <TableCell>{setting.description || '—'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditSetting(setting)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {allSettings.length === 0 && (
              <Alert severity="info">No settings configured yet</Alert>
            )}
          </Box>
        </TabPanel>

        {/* Fee Calculator Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Fee Calculation Preview
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Commission Rate: {formData.default_commission_rate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      VAT Rate: {formData.vat_rate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Sales Tax: {formData.sales_tax_rate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Processing Fee: {formData.processing_fee}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Example: Ticket priced at $100
                </Typography>

                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
                  <Typography variant="body2">
                    Gross Amount: $100.00
                  </Typography>
                  <Typography variant="body2">
                    Commission ({formData.default_commission_rate}%): ${(100 * formData.default_commission_rate / 100).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    VAT ({formData.vat_rate}%): ${(100 * formData.vat_rate / 100).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Sales Tax ({formData.sales_tax_rate}%): ${(100 * formData.sales_tax_rate / 100).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Processing Fee ({formData.processing_fee}%): ${(100 * formData.processing_fee / 100).toFixed(2)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'green' }}>
                    Organizer Net: $
                    {(
                      100 -
                      (100 * formData.default_commission_rate / 100) -
                      (100 * formData.vat_rate / 100) -
                      (100 * formData.sales_tax_rate / 100) -
                      (100 * formData.processing_fee / 100)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Edit Setting Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ ...editDialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Setting: {editDialog.key}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Value"
            type="number"
            value={editDialog.value}
            onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ step: 0.1 }}
          />
          <TextField
            label="Type"
            value={editDialog.type}
            onChange={(e) => setEditDialog({ ...editDialog, type: e.target.value })}
            select
            fullWidth
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
            <option value="json">JSON</option>
          </TextField>
          <TextField
            label="Description"
            value={editDialog.description}
            onChange={(e) => setEditDialog({ ...editDialog, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
          <Button onClick={handleSaveEditedSetting} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;
