import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuestCart } from '../../context/GuestCartContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * CheckoutRoute
 * Allows access to checkout for:
 * 1. Authenticated users (with items in authenticated cart)
 * 2. Guest users (with active guestCartId)
 * 
 * Redirects to events page if neither condition is met
 */
const CheckoutRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { guestCartId } = useGuestCart();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Allow access if authenticated OR has guest cart
  if (isAuthenticated() || guestCartId) {
    return children;
  }

  // Redirect to events if not authenticated and no guest cart
  return <Navigate to="/events" state={{ from: location }} replace />;
};

export default CheckoutRoute;
