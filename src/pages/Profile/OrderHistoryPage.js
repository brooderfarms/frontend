import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';
import { ReceiptLong, CheckCircle, Cancel, HourglassBottom } from '@mui/icons-material';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API call
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-20260101-001',
          date: '2026-01-01',
          event: 'Summer Music Festival',
          tickets: 2,
          total: 90.00,
          status: 'completed',
        },
        {
          id: 'ORD-20251215-002',
          date: '2025-12-15',
          event: 'Champions League Final',
          tickets: 4,
          total: 320.00,
          status: 'pending',
        },
        {
          id: 'ORD-20251120-003',
          date: '2025-11-20',
          event: 'Comedy Night',
          tickets: 1,
          total: 25.00,
          status: 'cancelled',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="success" variant="outlined" />;
      case 'pending':
        return <Chip icon={<HourglassBottom />} label="Pending" color="warning" variant="outlined" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Cancelled" color="error" variant="outlined" />;
      default:
        return <Chip label={status} variant="outlined" />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <ReceiptLong color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Order History
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Tickets</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.event}</TableCell>
                  <TableCell>{order.tickets}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrderHistoryPage;
