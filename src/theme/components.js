import { alpha } from '@mui/material/styles';

// Custom component styles that can be used with sx prop
export const componentStyles = (theme) => ({
  // Event card styling
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxShadow: `0 8px 32px rgba(0, 45, 104, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.95)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      background: theme.palette.primary.main,
      borderRadius: '20px 20px 0 0',
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `0 20px 60px rgba(0, 45, 104, 0.2), 0 8px 24px rgba(0, 0, 0, 0.12)`,
      border: '1px solid rgba(0, 45, 104, 0.3)',
    },
    '& .event-image': {
      height: 200,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
      },
    },
    '& .event-content': {
      padding: theme.spacing(3),
    },
    '& .event-title': {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      marginBottom: theme.spacing(1),
      color: theme.palette.text.primary,
    },
    '& .event-description': {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      marginBottom: theme.spacing(2),
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    '& .event-meta': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(2),
      fontSize: '0.875rem',
      color: theme.palette.text.secondary,
      '& svg': {
        fontSize: '1rem',
      },
    },
  },

  // Hero section styling
  heroSection: {
    background: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(theme.custom.spacing.section / 8, 0),
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 0, 128, 0.05) 0%, transparent 50%)
      `,
      animation: 'float 20s ease-in-out infinite',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.08"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      opacity: 0.6,
    },
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
      '33%': { transform: 'translateY(-10px) rotate(120deg)' },
      '66%': { transform: 'translateY(5px) rotate(240deg)' },
    },
    '& .hero-content': {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      maxWidth: 800,
      margin: '0 auto',
      '& h1': {
        fontSize: '3.5rem',
        fontWeight: 700,
        marginBottom: theme.spacing(2),
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        [theme.breakpoints.down('md')]: {
          fontSize: '2.5rem',
        },
      },
      '& p': {
        fontSize: '1.25rem',
        marginBottom: theme.spacing(4),
        opacity: 0.9,
        lineHeight: 1.6,
        [theme.breakpoints.down('md')]: {
          fontSize: '1.125rem',
        },
      },
    },
  },

  // Ticket card styling
  ticketCard: {
    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)`,
    borderRadius: 20,
    padding: theme.spacing(3),
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: `0 8px 32px rgba(0, 45, 104, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '6px',
      height: '100%',
      background: theme.custom.gradients.accent,
      borderRadius: '20px 0 0 20px',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: `radial-gradient(circle, rgba(0, 45, 104, 0.08) 0%, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(30px, -30px)',
    },
    '&:hover': {
      transform: 'translateY(-6px) scale(1.02)',
      boxShadow: `0 20px 60px rgba(0, 45, 104, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)`,
      border: '1px solid rgba(0, 45, 104, 0.2)',
    },
    '& .ticket-header': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing(2),
    },
    '& .ticket-title': {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(0.5),
    },
    '& .ticket-event': {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
    },
    '& .ticket-status': {
      padding: theme.spacing(0.5, 1.5),
      borderRadius: theme.custom.radius.medium,
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    '& .ticket-details': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    '& .ticket-detail': {
      '& .label': {
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        fontWeight: 600,
        letterSpacing: '0.05em',
        marginBottom: theme.spacing(0.5),
      },
      '& .value': {
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
    },
  },

  // Navigation styling
  navigation: {
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: `0 8px 32px rgba(0, 45, 104, 0.1)`,
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    '& .nav-brand': {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: theme.palette.primary.main,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    '& .nav-links': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(3),
      '& a': {
        color: theme.palette.text.primary,
        textDecoration: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        padding: theme.spacing(1, 0),
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          color: theme.palette.primary.main,
          borderBottomColor: theme.palette.primary.main,
        },
      },
    },
  },

  // Footer styling
  footer: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(theme.custom.spacing.section / 8, 0),
    '& .footer-content': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: theme.spacing(4),
    },
    '& .footer-section': {
      '& h4': {
        color: theme.palette.common.white,
        fontWeight: 600,
        marginBottom: theme.spacing(2),
      },
      '& p, & a': {
        color: alpha(theme.palette.common.white, 0.8),
        textDecoration: 'none',
        lineHeight: 1.6,
        '&:hover': {
          color: theme.palette.primary.light,
        },
      },
      '& .social-links': {
        display: 'flex',
        gap: theme.spacing(2),
        marginTop: theme.spacing(2),
        '& a': {
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.common.white, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },

  // Form styling
  formSection: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.custom.radius.large,
    padding: theme.spacing(4),
    boxShadow: theme.custom.shadows.card,
    border: `1px solid ${theme.palette.grey[200]}`,
    '& .form-header': {
      textAlign: 'center',
      marginBottom: theme.spacing(4),
      '& h2': {
        fontWeight: 600,
        marginBottom: theme.spacing(1),
      },
      '& p': {
        color: theme.palette.text.secondary,
        fontSize: '1rem',
      },
    },
    '& .form-actions': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing(4),
      paddingTop: theme.spacing(3),
      borderTop: `1px solid ${theme.palette.grey[200]}`,
    },
  },

  // Dashboard card styling
  dashboardCard: {
    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)`,
    borderRadius: 20,
    padding: theme.spacing(3),
    boxShadow: `0 8px 32px rgba(0, 45, 104, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    height: '100%',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '120px',
      height: '120px',
      background: `radial-gradient(circle, rgba(0, 45, 104, 0.08) 0%, transparent 70%)`,
      borderRadius: '50%',
      transform: 'translate(40px, -40px)',
    },
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: `0 20px 60px rgba(0, 45, 104, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)`,
      border: '1px solid rgba(0, 45, 104, 0.2)',
    },
    '& .card-icon': {
      width: 48,
      height: 48,
      borderRadius: theme.custom.radius.medium,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(2),
      '&.primary': {
        background: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
      },
      '&.secondary': {
        background: alpha(theme.palette.secondary.main, 0.1),
        color: theme.palette.secondary.main,
      },
      '&.success': {
        background: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.main,
      },
    },
    '& .card-title': {
      fontWeight: 600,
      fontSize: '1.125rem',
      marginBottom: theme.spacing(1),
    },
    '& .card-value': {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: theme.spacing(1),
      '&.primary': {
        color: theme.palette.primary.main,
      },
      '&.secondary': {
        color: theme.palette.secondary.main,
      },
      '&.success': {
        color: theme.palette.success.main,
      },
    },
    '& .card-description': {
      color: theme.palette.text.secondary,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },

  // Stream player styling
  streamPlayer: {
    backgroundColor: theme.palette.grey[900],
    borderRadius: theme.custom.radius.large,
    overflow: 'hidden',
    position: 'relative',
    '& .stream-header': {
      background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
      padding: theme.spacing(2),
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    '& .stream-status': {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
      '&.live': {
        color: theme.palette.error.main,
      },
      '&.offline': {
        color: theme.palette.text.secondary,
      },
    },
    '& .stream-viewer-count': {
      backgroundColor: alpha(theme.palette.common.black, 0.6),
      padding: theme.spacing(0.5, 1),
      borderRadius: theme.custom.radius.medium,
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    '& .stream-info': {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
      borderTop: `1px solid ${theme.palette.grey[200]}`,
      '& .stream-meta': {
        display: 'flex',
        gap: theme.spacing(3),
        marginBottom: theme.spacing(2),
        '& .meta-item': {
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(0.5),
          fontSize: '0.875rem',
          color: theme.palette.text.secondary,
        },
      },
    },
  },
});

export default componentStyles;
