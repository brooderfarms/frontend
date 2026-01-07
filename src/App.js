import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import CheckoutRoute from './components/Auth/CheckoutRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import EventsPage from './pages/Events/EventsPage';
import EventDetailsPage from './pages/Events/EventDetailsPage';
import CreateEventPage from './pages/Events/CreateEventPage';
import EditEventPage from './pages/Events/EditEventPage';
import EventCheckInPage from './pages/Events/EventCheckInPage';
import VenuesPage from './pages/Venues/VenuesPage';
import AddVenuePage from './pages/Venues/AddVenuePage';
import EditVenuePage from './pages/Venues/EditVenuePage';
import VenueDetailsPage from './pages/Venues/VenueDetailsPage';
import TicketsPage from './pages/Tickets/TicketsPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import MyNFCCardsPage from './pages/NFC/MyNFCCardsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import StreamViewerPage from './pages/Streaming/StreamViewerPage';
import StreamingListPage from './pages/Streaming/StreamingListPage';
import TicketTransferPage from './pages/Tickets/TicketTransferPage';
import SearchPage from './pages/Search/SearchPage';
import SeasonalTicketsPage from './pages/SeasonalTickets/SeasonalTicketsPage';
import SeasonalTicketCheckoutPage from './pages/SeasonalTickets/SeasonalTicketCheckoutPage';
import CreateSeasonalTicketPage from './pages/SeasonalTickets/CreateSeasonalTicketPage';
import EditSeasonalTicketPage from './pages/SeasonalTickets/EditSeasonalTicketPage';
import ManageSeasonalTicketsPage from './pages/SeasonalTickets/ManageSeasonalTicketsPage';
import PaymentSetupPage from './pages/PaymentSetupPage';
import PayoutManagementPage from './pages/PayoutManagementPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard';
import TicketTemplatesPage from './pages/TicketTemplatesPage';
import MerchandiseStore from './pages/Merchandise/MerchandiseStore';
import MerchandiseOrders from './pages/Merchandise/MerchandiseOrders';
import BulkOrderPage from './pages/Merchandise/BulkOrderPage';
import MerchandiseManagement from './pages/Admin/MerchandiseManagement';
import MerchandiseSales from './pages/Admin/MerchandiseSales';
import VirtualEventsBrowse from './pages/Events/VirtualEventsBrowse';
import GuestOrderHistory from './pages/Guest/GuestOrderHistory';
import VirtualEventsAnalytics from './pages/Admin/VirtualEventsAnalytics';
import VenueManagerDashboard from './pages/VenueManager/VenueManagerDashboard';
import VenueBookingsPage from './pages/VenueManager/VenueBookingsPage';
import VendorRegistration from './pages/Vendor/VendorRegistration';
import VendorDashboard from './pages/Vendor/VendorDashboard';
import VendorBrowser from './pages/Vendor/VendorBrowser';
import VendorApprovals from './pages/Admin/VendorApprovals';
import RBACManagement from './pages/Admin/RBACManagement';
import SoftDeleteRecovery from './pages/Admin/SoftDeleteRecovery';
import NotFoundPage from './pages/NotFoundPage';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GuestCartProvider } from './context/GuestCartContext';


function App() {
  const HomeRedirect = () => {
    // Use AuthContext inside the routed component (AuthProvider is above Routes)
    const { isAuthenticated, user } = require('./context/AuthContext').useAuth();
    if (isAuthenticated && isAuthenticated()) {
      if (!user) return <Navigate to="/dashboard" replace />;
      const role = user.role;
      if (role === 'admin') return <Navigate to="/admin" replace />;
      if (role === 'organizer') return <Navigate to="/organizer" replace />;
      if (role === 'venue_manager') return <Navigate to="/venue-manager" replace />;
      if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }
    return <HomePage />;
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <GuestCartProvider>
            <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />

                  {/* Events Routes - Public for browsing, protected for create/edit */}
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/virtual" element={<VirtualEventsBrowse />} />
                  <Route path="/events/create" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <CreateEventPage />
                    </PrivateRoute>
                  } />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route path="/events/:eventId/edit" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <EditEventPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/events/:eventId/check-in" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <EventCheckInPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Search Routes */}
                  <Route path="/search" element={<SearchPage />} />

                  {/* Venues Routes - Public for browsing, protected for create/edit */}
                  <Route path="/venues" element={<VenuesPage />} />
                  <Route path="/venues/:id" element={<VenueDetailsPage />} />
                  <Route path="/venues/create" element={
                    <PrivateRoute allowedRoles={["venue_manager","admin"]}>
                      <AddVenuePage />
                    </PrivateRoute>
                  } />
                  <Route path="/venues/:venueId/edit" element={
                    <PrivateRoute allowedRoles={["venue_manager","admin"]}>
                      <EditVenuePage />
                    </PrivateRoute>
                  } />

                  {/* Tickets Routes */}
                  <Route path="/tickets" element={
                    <PrivateRoute>
                      <TicketsPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/tickets/transfer" element={
                    <PrivateRoute>
                      <TicketTransferPage />
                    </PrivateRoute>
                  } />

                  {/* Seasonal Tickets Routes */}
                  <Route path="/seasonal-tickets" element={<SeasonalTicketsPage />} />
                  <Route path="/seasonal-tickets/:id" element={<SeasonalTicketsPage />} />
                  <Route path="/seasonal-tickets/:id/purchase" element={
                    <PrivateRoute>
                      <SeasonalTicketCheckoutPage />
                    </PrivateRoute>
                  } />
                  <Route path="/create-seasonal-ticket" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <CreateSeasonalTicketPage />
                    </PrivateRoute>
                  } />
                  <Route path="/edit-seasonal-ticket/:id" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <EditSeasonalTicketPage />
                    </PrivateRoute>
                  } />
                  <Route path="/manage-seasonal-tickets" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <ManageSeasonalTicketsPage />
                    </PrivateRoute>
                  } />

                  {/* NFC Cards Routes */}
                  <Route path="/my-nfc-cards" element={
                    <PrivateRoute>
                      <MyNFCCardsPage />
                    </PrivateRoute>
                  } />

                {/* Checkout Routes */}
                <Route path="/checkout" element={
                  <CheckoutRoute>
                    <CheckoutPage />
                  </CheckoutRoute>
                } />

                {/* Guest Routes */}
                <Route path="/guest/orders" element={<GuestOrderHistory />} />

                {/* Streaming Routes */}
                <Route path="/stream/:ticketId" element={
                  <PrivateRoute>
                    <StreamViewerPage />
                  </PrivateRoute>
                } />
                
                <Route path="/streaming" element={<StreamingListPage />} />

                {/* Profile Routes */}
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/approvals" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <AdminApprovalsPage />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/settings" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <SettingsPage />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/merchandise" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <MerchandiseManagement />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/merchandise-sales" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <MerchandiseSales />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/rbac" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <RBACManagement />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/soft-delete-recovery" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <SoftDeleteRecovery />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/virtual-events" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <VirtualEventsAnalytics />
                    </PrivateRoute>
                  } />

                  <Route path="/admin/vendors/approvals" element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <VendorApprovals />
                    </PrivateRoute>
                  } />

                  {/* Vendor Routes */}
                  <Route path="/vendors/browse" element={<VendorBrowser />} />
                  
                  <Route path="/vendor/register" element={
                    <PrivateRoute allowedRoles={['vendor']}>
                      <VendorRegistration />
                    </PrivateRoute>
                  } />

                  <Route path="/vendor/dashboard" element={
                    <PrivateRoute allowedRoles={['vendor']}>
                      <VendorDashboard />
                    </PrivateRoute>
                  } />

                  {/* Organizer Routes */}
                  <Route path="/organizer" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <OrganizerDashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/organizer/ticket-templates" element={
                    <PrivateRoute allowedRoles={['organizer', 'admin']}>
                      <TicketTemplatesPage />
                    </PrivateRoute>
                  } />

                  <Route path="/ticket-templates" element={
                    <PrivateRoute allowedRoles={['organizer', 'venue_manager', 'admin']}>
                      <TicketTemplatesPage />
                    </PrivateRoute>
                  } />

                  <Route path="/merchandise/store" element={
                    <PrivateRoute>
                      <MerchandiseStore />
                    </PrivateRoute>
                  } />

                  <Route path="/merchandise/orders" element={
                    <PrivateRoute>
                      <MerchandiseOrders />
                    </PrivateRoute>
                  } />

                  <Route path="/merchandise/bulk-order" element={
                    <PrivateRoute allowedRoles={['organizer', 'venue_manager', 'admin']}>
                      <BulkOrderPage />
                    </PrivateRoute>
                  } />

                  {/* Venue Manager Routes */}
                  <Route path="/venue-manager" element={
                    <PrivateRoute allowedRoles={['venue_manager', 'admin']}>
                      <VenueManagerDashboard />
                    </PrivateRoute>
                  } />

                  <Route path="/venue-manager/bookings" element={
                    <PrivateRoute allowedRoles={['venue_manager', 'admin']}>
                      <VenueBookingsPage />
                    </PrivateRoute>
                  } />

                  {/* Payment & Payout Routes */}
                  <Route path="/payment-setup" element={
                    <PrivateRoute allowedRoles={['organizer', 'venue_manager', 'admin']}>
                      <PaymentSetupPage />
                    </PrivateRoute>
                  } />

                  <Route path="/payouts" element={
                    <PrivateRoute allowedRoles={['organizer', 'venue_manager', 'admin']}>
                      <PayoutManagementPage />
                    </PrivateRoute>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </Router>
        </GuestCartProvider>
        </CartProvider>
      </AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
        }}
      />
    </ThemeProvider>
  );
}

export default App;
