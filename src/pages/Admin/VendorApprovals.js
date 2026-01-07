import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Info,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VendorApprovals = () => {
  const { apiRequest, API_BASE_URL } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      const response = await apiRequest(
        `${API_BASE_URL}/vendors?status=pending&limit=100`
      );
      const data = await response.json();

      if (data.success) {
        setVendors(data.data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (vendor) => {
    setSelectedVendor(vendor);
    setActionType('approve');
    setShowDetails(true);
  };

  const handleReject = (vendor) => {
    setSelectedVendor(vendor);
    setActionType('reject');
    setShowDetails(true);
  };

  const handleSuspend = (vendor) => {
    setSelectedVendor(vendor);
    setActionType('suspend');
    setShowDetails(true);
  };

  const submitAction = async () => {
    if (!selectedVendor) return;

    try {
      let response;

      if (actionType === 'approve') {
        response = await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ admin_notes: actionNotes })
        });
      } else if (actionType === 'reject') {
        response = await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: actionNotes })
        });
      } else {
        // Fallback: use PUT for other actions (not typical for admin approvals)
        response = await apiRequest(`${API_BASE_URL}/vendors/${selectedVendor.id}`, {
          method: 'PUT',
          body: JSON.stringify({ admin_notes: actionNotes })
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Vendor ${actionType}d successfully`);
        setShowDetails(false);
        setActionNotes('');
        // Refresh pending vendors list to reflect status change
        fetchPendingVendors();
      } else {
        throw new Error(data.message || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    }
  };

  const getActionColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        ✓ Vendor Approvals
      </Typography>

      {vendors.length === 0 ? (
        <Alert severity="success">
          All vendor applications have been reviewed!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Vendor Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map(vendor => (
                <TableRow key={vendor.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {vendor.vendor_name}
                  </TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>{vendor.contact_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getActionLabel(vendor.status)}
                      color={getActionColor(vendor.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setShowDetails(true);
                          setActionType('view');
                        }}
                      >
                        View
                      </Button>
                      {vendor.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleApprove(vendor)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleReject(vendor)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'view' ? 'Vendor Details' : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Vendor`}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedVendor && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      VENDOR NAME
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {selectedVendor.vendor_name}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">
                      CATEGORY
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {selectedVendor.category}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">
                      STATUS
                    </Typography>
                    <Chip
                      label={getActionLabel(selectedVendor.status)}
                      color={getActionColor(selectedVendor.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      EMAIL
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {selectedVendor.contact_email}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">
                      PHONE
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {selectedVendor.contact_phone}
                    </Typography>

                    <Typography variant="subtitle2" color="textSecondary">
                      BOOTH LOCATION
                    </Typography>
                    <Typography>
                      {selectedVendor.booth_location || 'Not specified'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      DESCRIPTION
                    </Typography>
                    <Typography>
                      {selectedVendor.description || 'No description provided'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {actionType !== 'view' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Admin Notes"
                    multiline
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={`Add notes about your ${actionType}...`}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Cancel</Button>
          {actionType !== 'view' && (
            <Button
              onClick={submitAction}
              variant="contained"
              color={actionType === 'reject' || actionType === 'suspend' ? 'error' : 'success'}
            >
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VendorApprovals;
