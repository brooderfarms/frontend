import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Tabs, Tab, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Checkbox, Chip, CircularProgress, Alert, Card, CardContent, Grid,
  FormControlLabel, Switch, Autocomplete, Typography, Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Security as SecurityIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3800/api';

const RBACManagement = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Dialog states
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [userRoleDialog, setUserRoleDialog] = useState(false);
  const [rbacMatrixDialog, setRbacMatrixDialog] = useState(false);

  // Form states
  const [editingPermission, setEditingPermission] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editingUserRole, setEditingUserRole] = useState(null);

  const [permissionForm, setPermissionForm] = useState({ name: '', description: '', category: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', priority: 0, permissions: [] });
  const [userRoleForm, setUserRoleForm] = useState({ userId: '', roleId: '', scope: '', expires_at: '', reason: '' });

  const token = localStorage.getItem('token');

  // Fetch data on mount and when tab changes
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData();
    }
  }, [tabValue]);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [permRes, rolesRes, usersRes, userRolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/rbac/permissions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/rbac/roles`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/rbac/report/user-roles`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (permRes.ok) {
        const permData = await permRes.json();
        setPermissions(Array.isArray(permData.data) ? permData.data : []);
      }
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(Array.isArray(rolesData.data) ? rolesData.data : []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Handle various response structures from users API
        let usersList = [];
        if (Array.isArray(usersData)) {
          usersList = usersData;
        } else if (usersData.data) {
          if (Array.isArray(usersData.data)) {
            usersList = usersData.data;
          } else if (usersData.data.users && Array.isArray(usersData.data.users)) {
            usersList = usersData.data.users;
          }
        }
        // Ensure it's always an array
        setAllUsers(Array.isArray(usersList) ? usersList : []);
      } else {
        setAllUsers([]);
      }
      if (userRolesRes.ok) {
        const userRolesData = await userRolesRes.json();
        setUserRoles(Array.isArray(userRolesData.data) ? userRolesData.data : []);
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    }
    setLoading(false);
  };

  // ==================== PERMISSIONS ====================

  const handleAddPermission = () => {
    setEditingPermission(null);
    setPermissionForm({ name: '', description: '', category: '' });
    setPermissionDialog(true);
  };

  const handleEditPermission = (perm) => {
    setEditingPermission(perm);
    setPermissionForm(perm);
    setPermissionDialog(true);
  };

  const handleSavePermission = async () => {
    if (!permissionForm.name || !permissionForm.category) {
      setError('Name and category are required');
      return;
    }

    setLoading(true);
    try {
      const method = editingPermission ? 'PUT' : 'POST';
      const url = editingPermission ? `${API_BASE_URL}/rbac/permissions/${editingPermission.id}` : `${API_BASE_URL}/rbac/permissions`;
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionForm)
      });

      if (response.ok) {
        setSuccess('Permission saved successfully');
        setPermissionDialog(false);
        fetchAllData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save permission');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Delete this permission?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rbac/permissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Permission deleted');
        fetchAllData();
      } else {
        setError('Failed to delete permission');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  // ==================== ROLES ====================

  const handleAddRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '', priority: 0, permissions: [] });
    setRoleDialog(true);
  };

  const handleEditRole = async (role) => {
    setEditingRole(role);
    const response = await fetch(`${API_BASE_URL}/rbac/roles/${role.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setRoleForm({
        name: data.data.name,
        description: data.data.description,
        priority: data.data.priority,
        permissions: data.data.permissions.map(p => p.id)
      });
    }
    setRoleDialog(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name) {
      setError('Role name is required');
      return;
    }

    setLoading(true);
    try {
      const method = editingRole ? 'PUT' : 'POST';
      const url = editingRole ? `${API_BASE_URL}/rbac/roles/${editingRole.id}` : `${API_BASE_URL}/rbac/roles`;
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...roleForm,
          permissions: roleForm.permissions
        })
      });

      if (response.ok) {
        setSuccess('Role saved successfully');
        setRoleDialog(false);
        fetchAllData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save role');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  // ==================== USER ROLES ====================

  const handleAddUserRole = () => {
    setEditingUserRole(null);
    setUserRoleForm({ userId: '', roleId: '', scope: '', expires_at: '', reason: '' });
    setUserRoleDialog(true);
  };

  const handleSaveUserRole = async () => {
    if (!userRoleForm.userId || !userRoleForm.roleId) {
      setError('User and role are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rbac/users/${userRoleForm.userId}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleId: userRoleForm.roleId,
          scope: userRoleForm.scope || null,
          expires_at: userRoleForm.expires_at ? new Date(userRoleForm.expires_at).toISOString() : null,
          reason: userRoleForm.reason
        })
      });

      if (response.ok) {
        setSuccess('User role assigned successfully');
        setUserRoleDialog(false);
        fetchAllData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to assign role');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleRemoveUserRole = async (userId, roleId) => {
    if (!window.confirm('Remove this role from user?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rbac/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('User role removed');
        fetchAllData();
      } else {
        setError('Failed to remove role');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  // ==================== TAB PANELS ====================

  const PermissionsPanel = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPermission}>
          New Permission
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm.id}>
                <TableCell><code>{perm.name}</code></TableCell>
                <TableCell><Chip label={perm.category} size="small" /></TableCell>
                <TableCell>{perm.description || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPermission(perm)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  {!perm.is_system && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeletePermission(perm.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Permission Dialog */}
      <Dialog open={permissionDialog} onClose={() => setPermissionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPermission ? 'Edit Permission' : 'New Permission'}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Permission Name"
            placeholder="e.g., events.create"
            fullWidth
            value={permissionForm.name}
            onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
            disabled={!!editingPermission}
          />
          <TextField
            label="Category"
            placeholder="e.g., events, users, payments"
            fullWidth
            value={permissionForm.category}
            onChange={(e) => setPermissionForm({ ...permissionForm, category: e.target.value })}
          />
          <TextField
            label="Description"
            placeholder="Human-readable description"
            fullWidth
            multiline
            rows={3}
            value={permissionForm.description}
            onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePermission} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const RolesPanel = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRole}>
          New Role
        </Button>
        <Button variant="outlined" onClick={() => setRbacMatrixDialog(true)}>
          View Permission Matrix
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Priority</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell><strong>{role.name}</strong></TableCell>
                <TableCell>{role.description || '-'}</TableCell>
                <TableCell>{role.priority}</TableCell>
                <TableCell>{role.permissions?.length || 0} permissions</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditRole(role)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? 'Edit Role' : 'New Role'}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Role Name"
            fullWidth
            value={roleForm.name}
            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
            disabled={!!editingRole?.is_system}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={roleForm.description}
            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
          />
          <TextField
            label="Priority"
            type="number"
            fullWidth
            value={roleForm.priority}
            onChange={(e) => setRoleForm({ ...roleForm, priority: parseInt(e.target.value) })}
          />
          <Autocomplete
            multiple
            options={permissions}
            getOptionLabel={(option) => option.name}
            value={permissions.filter(p => roleForm.permissions.includes(p.id))}
            onChange={(e, value) => setRoleForm({ ...roleForm, permissions: value.map(v => v.id) })}
            renderInput={(params) => <TextField {...params} label="Permissions" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const UserRolesPanel = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUserRole}>
          Assign Role to User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Scope</strong></TableCell>
              <TableCell><strong>Expires</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userRoles.map((ur, idx) => (
              <TableRow key={idx}>
                <TableCell>{ur.email}</TableCell>
                <TableCell><Chip label={ur.role_name} size="small" /></TableCell>
                <TableCell>{ur.scope || '-'}</TableCell>
                <TableCell>{ur.expires_at ? new Date(ur.expires_at).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{ur.reason || '-'}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleRemoveUserRole(ur.user_id, roles.find(r => r.name === ur.role_name)?.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Role Dialog */}
      <Dialog open={userRoleDialog} onClose={() => setUserRoleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Role to User</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            options={Array.isArray(allUsers) ? allUsers : []}
            getOptionLabel={(option) => `${option.email} (${option.first_name} ${option.last_name})`}
            value={Array.isArray(allUsers) ? (allUsers.find(u => u.id === userRoleForm.userId) || null) : null}
            onChange={(e, value) => setUserRoleForm({ ...userRoleForm, userId: value?.id || '' })}
            renderInput={(params) => <TextField {...params} label="Select User" />}
          />
          <Autocomplete
            options={roles}
            getOptionLabel={(option) => option.name}
            value={roles.find(r => r.id === userRoleForm.roleId) || null}
            onChange={(e, value) => setUserRoleForm({ ...userRoleForm, roleId: value?.id || '' })}
            renderInput={(params) => <TextField {...params} label="Select Role" />}
          />
          <TextField
            label="Scope (optional)"
            placeholder="e.g., event:123, venue:456"
            fullWidth
            value={userRoleForm.scope}
            onChange={(e) => setUserRoleForm({ ...userRoleForm, scope: e.target.value })}
            help="Limit role to specific resource"
          />
          <TextField
            label="Expires At (optional)"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={userRoleForm.expires_at}
            onChange={(e) => setUserRoleForm({ ...userRoleForm, expires_at: e.target.value })}
          />
          <TextField
            label="Reason"
            placeholder="Why is this role being assigned?"
            fullWidth
            multiline
            rows={2}
            value={userRoleForm.reason}
            onChange={(e) => setUserRoleForm({ ...userRoleForm, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUserRole} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const RBACMatrixPanel = () => {
    const [matrixData, setMatrixData] = useState({});

    useEffect(() => {
      const fetchMatrix = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/rbac/report/permissions-by-role`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            setMatrixData((await response.json()).data);
          }
        } catch (err) {
          setError('Failed to load matrix');
        }
      };
      if (rbacMatrixDialog) fetchMatrix();
    }, [rbacMatrixDialog]);

    return (
      <Dialog open={rbacMatrixDialog} onClose={() => setRbacMatrixDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>RBAC Permission Matrix</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell sx={{ maxWidth: 400 }}><strong>Permissions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(matrixData).map(([roleName, perms]) => (
                  <TableRow key={roleName}>
                    <TableCell><strong>{roleName}</strong></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {perms.map((perm) => (
                          <Chip key={perm} label={perm} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRbacMatrixDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">You do not have permission to access RBAC management</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SecurityIcon sx={{ fontSize: 32 }} color="primary" />
        <Typography variant="h4">RBAC Management</Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Permissions" />
          <Tab label="Roles" />
          <Tab label="User Roles" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && <PermissionsPanel />}
          {tabValue === 1 && <RolesPanel />}
          {tabValue === 2 && <UserRolesPanel />}
        </Box>
      </Paper>

      <RBACMatrixPanel />
    </Container>
  );
};

export default RBACManagement;
