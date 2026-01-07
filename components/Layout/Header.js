import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Badge,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExpandMore,
  Person,
  Logout,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGuestCart } from '../../context/GuestCartContext';
import { EventsIcon, VenuesIcon, DashboardIcon, TicketsIcon, CreateIcon, CartIcon, ProfileIcon } from './CustomIcons';
import logo from '../../assets/shashapass.png';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, cartItems, removeFromCart } = useCart();
  const { guestCartId, guestCart } = useGuestCart();

  const isGuest = !isAuthenticated() && !!(guestCartId || guestCart);
  const guestCartItemCount = guestCart?.items?.length || 0;

  const [profileEl, setProfileEl] = useState(null);
  const [submenu, setSubmenu] = useState(null);
  const [cartEl, setCartEl] = useState(null);
  const [mobileEl, setMobileEl] = useState(null);

  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const openSubmenu = (e, name) => {
    clearTimeout(closeTimerRef.current);
    const target = e.currentTarget;
    openTimerRef.current = setTimeout(() => setSubmenu({ anchor: target, name }), 50);
  };

  const closeSubmenu = () => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => setSubmenu(null), 200);
  };

  useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);



  const handleLogout = async () => {
    setProfileEl(null);
    setCartEl(null);
    setMobileEl(null);
    setSubmenu(null);
    await logout();
    navigate('/');
  };

  /* =========================
     MENU DEFINITIONS
  ========================= */

  const mainMenus = [
    {
      label: 'Events',
      icon: <EventsIcon />,
      isMultiColumn: true,
      columns: [
        {
          title: 'Events & Venues',
          items: [
            { label: 'Browse Events', path: '/events' },
            { label: 'Virtual Events', path: '/events/virtual' },
            { label: 'All Venues', path: '/venues' },
          ]
        },
        {
          title: 'Passes',
          items: [
            { label: 'Season Passes', path: '/seasonal-tickets' },
            { label: 'Live Streams', path: '/streaming' },
          ]
        },
        {
          title: 'Templates',
          items: [
            { label: 'Ticket Templates', path: '/ticket-templates' },
          ]
        },
        {
          title: 'Designs',
          items: [
            { label: 'Create Template', path: '/ticket-templates/create' },
          ]
        }
      ]
    },
    {
      label: 'Venues',
      icon: <VenuesIcon />,
      items: [
        { label: 'All Venues', path: '/venues' },
        user?.role === 'admin' && {
          label: 'Add Venue',
          path: '/venues/create',
        },
      ].filter(Boolean),
    },
    {
      label: 'Vendors',
      icon: <VenuesIcon />,
      items: [
        { label: 'Browse Vendors', path: '/vendors/browse' },
        { label: 'Register as Vendor', path: '/vendor/register' },
        user && (user.role === 'organizer' || user.role === 'venue_manager' || user.role === 'admin') && {
          label: 'My Vendor Account',
          path: '/vendor/dashboard',
        },
      ].filter(Boolean),
    },
  ];

  // Role-specific menu items with submenus
  const getRoleMenus = () => {
    if (!isAuthenticated()) return [];

    switch (user?.role) {
      case 'organizer':
        return [
          {
            label: 'My Events',
            icon: <EventsIcon />,
            items: [
              { label: 'Create Event', path: '/events/create' },
              { label: 'Create Season Pass', path: '/create-seasonal-ticket' },
              { label: 'Manage Season Passes', path: '/manage-seasonal-tickets' },
            ],
          },
          {
            label: 'Analytics',
            icon: <EventsIcon />,
            items: [
              { label: 'View Analytics', path: '/organizer#analytics' },
              { label: 'Manage Attendees', path: '/organizer#attendees' },
              { label: 'Payment History', path: '/organizer#payments' },
            ],
          },
          {
            label: 'My Account',
            icon: <TicketsIcon />,
            items: [
              { label: 'Ticket Templates', path: '/ticket-templates' },
              { label: 'Create Template', path: '/ticket-templates/create' },
              { label: 'Payment Information', path: '/payment-setup' },
              { label: 'Manage Payouts', path: '/payouts' },
              { label: 'Order Merchandise', path: '/merchandise/store' },
              { label: 'Merchandise Orders', path: '/merchandise/orders' },
              { label: 'Profile', path: '/profile' },
            ],
          },
        ];
      case 'venue_manager':
        return [
          {
            label: 'Management',
            icon: <VenuesIcon />,
            items: [
              { label: 'Add Venue', path: '/venues/create' },
              { label: 'Manage Bookings', path: '/venue-manager#bookings' },
            ],
          },
          {
            label: 'Analytics',
            icon: <EventsIcon />,
            items: [
              { label: 'View Analytics', path: '/venue-manager#analytics' },
              { label: 'Revenue Report', path: '/venue-manager#revenue' },
            ],
          },
          {
            label: 'My Account',
            icon: <TicketsIcon />,
            items: [
              { label: 'Payment Information', path: '/payment-setup' },
              { label: 'Manage Payouts', path: '/payouts' },
              { label: 'Order Merchandise', path: '/merchandise/store' },
              { label: 'Merchandise Orders', path: '/merchandise/orders' },
              { label: 'Profile', path: '/profile' },
            ],
          },
        ];
      case 'admin':
        return [
          {
            label: 'Content',
            icon: <EventsIcon />,
            items: [
              { label: 'Create Event', path: '/events/create' },
              { label: 'Add Venue', path: '/venues/create' },
              { label: 'Create Season Pass', path: '/create-seasonal-ticket' },
              { label: 'Manage Season Passes', path: '/manage-seasonal-tickets' },
            ],
          },
          {
            label: 'System',
            icon: <VenuesIcon />,
            items: [
              { label: 'System Settings', path: '/admin/settings' },
              { label: 'System Analytics', path: '/admin#analytics' },
            ],
          },
          {
            label: 'Vendors',
            icon: <EventsIcon />,
            items: [
              { label: 'Approve Vendors', path: '/admin/vendors/approvals' },
              { label: 'Vendor Analytics', path: '/admin#vendors' },
            ],
          },
        ];
      case 'customer':
        return [
          {
            label: 'My Account',
            icon: <TicketsIcon />,
            items: [
              { label: 'My Tickets', path: '/tickets' },
              { label: 'My NFC Cards', path: '/nfc-cards' },
              { label: 'Season Passes', path: '/seasonal-tickets' },
              { label: 'Profile', path: '/profile' },
            ],
          },
        ];
      case 'vendor':
        return [
          {
            label: 'My Business',
            icon: <EventsIcon />,
            items: [
              { label: 'Dashboard', path: '/vendor/dashboard' },
              { label: 'My Products', path: '/vendor/dashboard#products' },
              { label: 'Orders', path: '/vendor/dashboard#orders' },
            ],
          },
          {
            label: 'My Account',
            icon: <TicketsIcon />,
            items: [
              { label: 'Payment Information', path: '/payment-setup' },
              { label: 'Manage Payouts', path: '/payouts' },
              { label: 'Profile', path: '/profile' },
            ],
          },
        ];
      default:
        return [];
    }
  };

  const roleMenus = getRoleMenus();

  // Dashboard as standalone item (no submenu)
  const dashboardItem = isAuthenticated()
    ? {
        label: 'Dashboard',
        path: user?.role === 'admin' ? '/admin' : user?.role === 'organizer' ? '/organizer' : user?.role === 'venue_manager' ? '/venue-manager' : user?.role === 'vendor' ? '/vendor/dashboard' : '/dashboard',
        icon: <DashboardIcon />,
      }
    : null;

  /* =========================
     SHARED MENU STYLES
  ========================= */

  const menuPaperProps = {
    sx: {
      bgcolor: 'background.paper',
      color: 'text.primary',
      border: 1,
      borderColor: 'divider',
      minWidth: 220,
    },
  };

  const menuItemSx = {
    color: 'text.primary',
    '&:hover': { bgcolor: 'action.hover' },
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Logo */}
        <Typography
          component={Link}
          to={
            isAuthenticated()
              ? user?.role === 'admin'
                ? '/admin'
                : user?.role === 'organizer'
                ? '/organizer'
                : user?.role === 'venue_manager'
                ? '/venue-manager'
                : '/dashboard'
              : '/'
          }
          variant="h6"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <img
            src={logo}
            alt="ShashaPass Logo"
            style={{
              height: 80,
              width: 'auto',
              objectFit: 'contain',
              marginRight: 8,
            }}
          />
         
        </Typography>

        {/* Desktop Menus */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 3 }}>
          {/* Dashboard - Direct Link (No Submenu) - First Item */}
              {dashboardItem && (
            <Button
              color="inherit"
              startIcon={dashboardItem.icon}
              component={Link}
              to={dashboardItem.path}
              sx={{ color: 'text.primary' }}
            >
              {dashboardItem.label}
            </Button>
          )}

          {/* Events and Venues - Only for Unauthenticated Users */}
          {!isAuthenticated() ? (
            mainMenus.map((menu) => (
              <Button
                key={menu.label}
                color="inherit"
                startIcon={menu.icon}
                endIcon={<ExpandMore />}
                onMouseEnter={(e) => openSubmenu(e, menu.label)}
                onClick={(e) => openSubmenu(e, menu.label)}
                sx={{
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {menu.label}
              </Button>
            ))
          ) : null}

          {/* Role-Specific Menus - For Authenticated Users */}
          {isAuthenticated() ? (
            roleMenus.map((menu) => (
              <Button
                key={menu.label}
                color="inherit"
                startIcon={menu.icon}
                endIcon={<ExpandMore />}
                onMouseEnter={(e) => openSubmenu(e, menu.label)}
                onClick={(e) => openSubmenu(e, menu.label)}
                sx={{
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {menu.label}
              </Button>
            ))
          ) : null}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Create Event - Only for Admin and Organizer */}
        {isAuthenticated() && (user?.role === 'admin' || user?.role === 'organizer') && (
          <Button
            variant="outlined"
            startIcon={<CreateIcon />}
            component={Link}
            to="/events/create"
            sx={{ color: 'text.primary' }}
          >
            Create Event
          </Button>
        )}

        {/* Cart - for authenticated users and guests */}
        {(isAuthenticated() || isGuest) && (
          <IconButton 
            aria-label="Open cart" 
            onClick={() => navigate('/checkout')}
          >
            <Badge badgeContent={isGuest ? guestCartItemCount : cartCount} color="secondary">
              <CartIcon />
            </Badge>
          </IconButton>
        )}

        {/* Profile */}
        {isAuthenticated() ? (
          <IconButton onClick={(e) => setProfileEl(e.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34 }}>
              {user?.first_name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
        ) : (
          <Button 
            variant="contained" 
            color="secondary" 
            component={Link} 
            to="/login"
            sx={{ 
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Login
          </Button>
        )}

        {/* Mobile Menu Button */}
        <IconButton
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={(e) => setMobileEl(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Desktop Submenu */}
      <Menu
        anchorEl={submenu?.anchor}
        open={Boolean(submenu)}
        onClose={closeSubmenu}
        MenuListProps={{ onMouseLeave: closeSubmenu }}
        TransitionProps={{
          onEnter: (node) => {
            node.style.animation = 'slideDown 0.2s ease-out';
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            minWidth: submenu?.name === 'Events' ? 600 : 220,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            animation: 'slideDown 0.2s ease-out',
            '@keyframes slideDown': {
              from: {
                opacity: 0,
                transform: 'translateY(-8px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          },
        }}
      >
        {/* Multi-Column Menu (Events) */}
        {mainMenus.find((m) => m.label === submenu?.name)?.isMultiColumn ? (
          <Box sx={{ display: 'flex', p: 2, gap: 3 }}>
            {mainMenus.find((m) => m.label === submenu?.name)?.columns?.map((column) => (
              <Box key={column.title} sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  {column.title}
                </Typography>
                {column.items.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      ...menuItemSx,
                      fontSize: '0.875rem',
                      py: 0.75,
                      px: 0,
                      '&:hover': { bgcolor: 'transparent', pl: 1 },
                    }}
                    onClick={closeSubmenu}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Box>
            ))}
          </Box>
        ) : (
          <>
            {/* Main Menus (Venues, Vendors) */}
            {mainMenus.find((m) => m.label === submenu?.name)?.items && 
              mainMenus.find((m) => m.label === submenu?.name)?.items?.map((item) => (
                <MenuItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={menuItemSx}
                  onClick={closeSubmenu}
                >
                  {item.label}
                </MenuItem>
              ))
            }

            {/* Role Menus */}
            {roleMenus.find((m) => m.label === submenu?.name)?.items && 
              roleMenus.find((m) => m.label === submenu?.name)?.items?.map((item) => (
                <MenuItem
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={menuItemSx}
                  onClick={closeSubmenu}
                >
                  {item.label}
                </MenuItem>
              ))
            }
          </>
        )}
      </Menu>

      {/* Cart Dropdown */}
      <Menu
        anchorEl={cartEl}
        open={Boolean(cartEl)}
        onClose={() => setCartEl(null)}
        PaperProps={{
          sx: {
            width: 320,
            p: 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
          },
        }}
      >
        {cartItems.length === 0 ? (
          <MenuItem disabled>Your cart is empty</MenuItem>
        ) : (
          <>
            {cartItems.map((item) => (
              <MenuItem
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {item.eventTitle || item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.quantity} × ${Number(item.basePrice || item.price || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    ${Number(item.totalPrice || 0).toFixed(2)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                    sx={{ mt: 0.5 }}
                  >
                    ✕
                  </IconButton>
                </Box>
              </MenuItem>
            ))}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ px: 2, py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Total:
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                  ${cartItems.reduce((sum, item) => sum + (item.totalPrice || item.quantity * item.price), 0).toFixed(2)}
                </Typography>
              </Box>
              <MenuItem
                component={Link}
                to="/checkout"
                onClick={() => setCartEl(null)}
                sx={{ justifyContent: 'center', fontWeight: 600, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Proceed to Checkout
              </MenuItem>
            </Box>
          </>
        )}
      </Menu>

      {/* Profile Menu */}
      {isAuthenticated() && (
        <Menu
          anchorEl={profileEl}
          open={Boolean(profileEl)}
          onClose={() => setProfileEl(null)}
          PaperProps={menuPaperProps}
        >
          <MenuItem
            component={Link}
            to="/profile"
            sx={menuItemSx}
            onClick={() => setProfileEl(null)}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>

          <MenuItem
            component={Link}
            to="/my-nfc-cards"
            sx={menuItemSx}
            onClick={() => setProfileEl(null)}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            My NFC Cards
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={menuItemSx}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      )}

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileEl}
        open={Boolean(mobileEl)}
        onClose={() => setMobileEl(null)}
        PaperProps={menuPaperProps}
      >
        {mainMenus.flatMap((m) =>
          m.isMultiColumn
            ? m.columns.flatMap((col) =>
                col.items.map((i) => (
                  <MenuItem
                    key={i.path}
                    component={Link}
                    to={i.path}
                    sx={menuItemSx}
                    onClick={() => setMobileEl(null)}
                  >
                    {i.label}
                  </MenuItem>
                ))
              )
            : m.items?.map((i) => (
                <MenuItem
                  key={i.path}
                  component={Link}
                  to={i.path}
                  sx={menuItemSx}
                  onClick={() => setMobileEl(null)}
                >
                  {i.label}
                </MenuItem>
              )) || []
        )}

        {/* Dashboard - Direct Link for Mobile */}
        {dashboardItem && (
          <MenuItem
            key={dashboardItem.path}
            component={Link}
            to={dashboardItem.path}
            sx={menuItemSx}
            onClick={() => setMobileEl(null)}
          >
            {dashboardItem.label}
          </MenuItem>
        )}

        {/* My Tickets - Direct Link for Mobile */}
        {isAuthenticated() && (
          <MenuItem
            key="my-tickets"
            component={Link}
            to="/tickets"
            sx={menuItemSx}
            onClick={() => setMobileEl(null)}
          >
            My Tickets
          </MenuItem>
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;
