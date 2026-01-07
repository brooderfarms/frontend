import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';

const UnifiedApprovals = () => {
  const { user, apiRequest, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allApprovals, setAllApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'organizer', 'venue_manager', 'vendor'
  const [dialog, setDialog] = useState({
    open: false,
    type: null, // 'approve', 'reject', 'suspend'
    reason: '',
    commission: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllPendingApprovals();
      fetchStats();
    }
  }, [user]);

  const fetchAllPendingApprovals = async () => {
    try {
      setLoading(true);

      // Fetch organizers
      const orgResponse = await apiRequest(
        `${API_BASE_URL}/admin/approvals/pending?role=organizer`
      );
      const orgData = orgResponse.ok ? await orgResponse.json() : { data: [] };

      // Fetch venue managers
      const vmResponse = await apiRequest(
        `${API_BASE_URL}/admin/approvals/pending?role=venue_manager`
      );
      const vmData = vmResponse.ok ? await vmResponse.json() : { data: [] };

      // Fetch vendors
      const vendorResponse = await apiRequest(
        `${API_BASE_URL}/vendors?status=pending&limit=100`
      );
      const vendorData = vendorResponse.ok ? await vendorResponse.json() : { data: { vendors: [] } };

      // Combine all data
      const combined = [
        ...(orgData.data || []).map(item => ({ ...item, approval_type: 'organizer' })),
        ...(vmData.data || []).map(item => ({ ...item, approval_type: 'venue_manager' })),
        ...(vendorData.data?.vendors || []).map(item => ({ ...item, approval_type: 'vendor' }))
      ];

      setAllApprovals(combined);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/admin/approvals/stats`);
      if (response.ok) {
        const { data } = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenDialog = (type, user) => {
    setSelectedUser(user);
    setDialog({
      open: true,
      type,
      reason: '',
      commission: ''
    });
  };

  const handleCloseDialog = () => {
    setDialog({
      open: false,
      type: null,
      reason: '',
      commission: ''
    });
    setSelectedUser(null);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    try {
      let endpoint = '';
      const body = {};

      // Determine endpoint based on approval type
      if (selectedUser.approval_type === 'vendor') {
        endpoint = `${API_BASE_URL}/vendors/${selectedUser.id}/approve`;
      } else {
        endpoint = `${API_BASE_URL}/admin/approvals/${selectedUser.id}/approve`;
        if (dialog.commission) {
          body.commission_percentage = parseFloat(dialog.commission);
        }
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve');
      }

      const typeLabel = selectedUser.approval_type === 'vendor' ? 'Vendor' :
                       selectedUser.approval_type === 'organizer' ? 'Organizer' :
                       'Venue Manager';
      toast.success(`${typeLabel} approved successfully`);
      handleCloseDialog();
      fetchAllPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !dialog.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      let endpoint = '';

      if (selectedUser.approval_type === 'vendor') {
        endpoint = `${API_BASE_URL}/vendors/${selectedUser.id}/reject`;
      } else {
        endpoint = `${API_BASE_URL}/admin/approvals/${selectedUser.id}/reject`;
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ reason: dialog.reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject');
      }

      const typeLabel = selectedUser.approval_type === 'vendor' ? 'Vendor' :
                       selectedUser.approval_type === 'organizer' ? 'Organizer' :
                       'Venue Manager';
      toast.success(`${typeLabel} rejected successfully`);
      handleCloseDialog();
      fetchAllPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error(error.message);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser || !dialog.reason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }

    try {
      let endpoint = '';

      if (selectedUser.approval_type === 'vendor') {
        endpoint = `${API_BASE_URL}/vendors/${selectedUser.id}/suspend`;
      } else {
        endpoint = `${API_BASE_URL}/admin/approvals/${selectedUser.id}/suspend`;
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ reason: dialog.reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to suspend');
      }

      const typeLabel = selectedUser.approval_type === 'vendor' ? 'Vendor' :
                       selectedUser.approval_type === 'organizer' ? 'Organizer' :
                       'Venue Manager';
      toast.success(`${typeLabel} suspended successfully`);
      handleCloseDialog();
      fetchAllPendingApprovals();
      fetchStats();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'suspended': 'error'
    };
    return colors[status] || 'default';
  };

  const getTypeLabel = (type) => {
    if (type === 'organizer') return 'Organizer';
    if (type === 'venue_manager') return 'Venue Manager';
    if (type === 'vendor') return 'Vendor';
    return type;
  };

  const getStatusLabel = (approval) => {
    if (approval.approval_type === 'vendor') {
      return approval.status;
    }
    return approval.approval_status;
  };

  const filteredApprovals = filterType === 'all'
    ? allApprovals
    : allApprovals.filter(a => a.approval_type === filterType);

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          This page is only accessible to administrators.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        User Approvals
      </Typography>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h5">{stats.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5">{stats.approved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h5">{stats.rejected}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Suspended
                </Typography>
                <Typography variant="h5">{stats.suspended || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter Tabs */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={filterType} onChange={(e, val) => setFilterType(val)}>
          <Tab label="All" value="all" />
          <Tab label="Organizers" value="organizer" />
          <Tab label="Venue Managers" value="venue_manager" />
          <Tab label="Vendors" value="vendor" />
        </Tabs>
      </Box>

      {filteredApprovals.length === 0 ? (
        <Alert severity="success">
          No pending approvals for this category!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApprovals.map(approval => (
                <TableRow key={approval.id}>
                  <TableCell>
                    {approval.first_name} {approval.last_name}
                  </TableCell>
                  <TableCell>{approval.email}</TableCell>
                  <TableCell>
                    <Chip label={getTypeLabel(approval.approval_type)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(approval).charAt(0).toUpperCase() + getStatusLabel(approval).slice(1)}
                      color={getStatusColor(getStatusLabel(approval))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(approval.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {getStatusLabel(approval) === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleOpenDialog('approve', approval)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleOpenDialog('reject', approval)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={dialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialog.type === 'approve' && `Approve ${getTypeLabel(selectedUser?.approval_type)}`}
          {dialog.type === 'reject' && `Reject ${getTypeLabel(selectedUser?.approval_type)}`}
          {dialog.type === 'suspend' && `Suspend ${getTypeLabel(selectedUser?.approval_type)}`}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </Typography>

              {dialog.type === 'approve' && (selectedUser.approval_type === 'organizer' || selectedUser.approval_type === 'venue_manager') && (
                <TextField
                  fullWidth
                  label="Commission Percentage (optional)"
                  type="number"
                  inputProps={{ step: '0.1', min: '0', max: '100' }}
                  value={dialog.commission}
                  onChange={(e) => setDialog({ ...dialog, commission: e.target.value })}
                  helperText="Leave blank to use default 5%"
                  sx={{ mb: 2 }}
                />
              )}

              {(dialog.type === 'reject' || dialog.type === 'suspend') && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  value={dialog.reason}
                  onChange={(e) => setDialog({ ...dialog, reason: e.target.value })}
                  placeholder="Explain the reason for this action..."
                  required
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialog.type === 'approve' && (
            <Button onClick={handleApprove} variant="contained" color="success">
              Approve
            </Button>
          )}
          {dialog.type === 'reject' && (
            <Button onClick={handleReject} variant="contained" color="error">
              Reject
            </Button>
          )}
          {dialog.type === 'suspend' && (
            <Button onClick={handleSuspend} variant="contained" color="error">
              Suspend
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnifiedApprovals;
