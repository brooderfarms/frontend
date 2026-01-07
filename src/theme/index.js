import { createTheme } from '@mui/material/styles';

/* =========================================================
   DESIGN TOKENS
========================================================= */

const palette = {
  primary: {
    main: '#002d68',
    light: '#1e40af',
    dark: '#001b3a',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff0080',
    light: '#ff4da6',
    dark: '#b30059',
    contrastText: '#ffffff',
  },
  success: { main: '#10b981' },
  warning: { main: '#f59e0b' },
  error: { main: '#ef4444' },
  info: { main: '#3b82f6' },

  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },

  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },

  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

/* =========================================================
   SHADOWS (EXACTLY 25)
========================================================= */

const shadows = [
  'none',
  '0px 1px 2px rgba(0,0,0,0.08)',
  '0px 2px 4px rgba(0,0,0,0.10)',
  '0px 4px 8px rgba(0,0,0,0.12)',
  '0px 6px 12px rgba(0,0,0,0.14)',
  '0px 8px 16px rgba(0,0,0,0.16)',
  '0px 10px 20px rgba(0,0,0,0.18)',
  '0px 12px 24px rgba(0,0,0,0.20)',
  '0px 14px 28px rgba(0,0,0,0.22)',
  '0px 16px 32px rgba(0,0,0,0.24)',
  '0px 18px 36px rgba(0,0,0,0.26)',
  '0px 20px 40px rgba(0,0,0,0.28)',
  '0px 22px 44px rgba(0,0,0,0.30)',
  '0px 24px 48px rgba(0,0,0,0.32)',
  '0px 26px 52px rgba(0,0,0,0.34)',
  '0px 28px 56px rgba(0,0,0,0.36)',
  '0px 30px 60px rgba(0,0,0,0.38)',
  '0px 32px 64px rgba(0,0,0,0.40)',
  '0px 34px 68px rgba(0,0,0,0.42)',
  '0px 36px 72px rgba(0,0,0,0.44)',
  '0px 38px 76px rgba(0,0,0,0.46)',
  '0px 40px 80px rgba(0,0,0,0.48)',
  '0px 42px 84px rgba(0,0,0,0.50)',
  '0px 44px 88px rgba(0,0,0,0.52)',
  '0px 46px 92px rgba(0,0,0,0.54)',
];

/* =========================================================
   THEME
========================================================= */

const theme = createTheme({
  palette: {
    mode: 'light',
    ...palette,
    divider: 'rgba(0,0,0,0.08)',
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,

    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },

    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },

    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  shadows,

  components: {
    /* ---------------- Buttons ---------------- */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          transition: 'all .25s ease',
        },
        containedPrimary: {
          boxShadow: '0 6px 18px rgba(0,45,104,.35)',
          '&:hover': {
            boxShadow: '0 10px 28px rgba(0,45,104,.5)',
          },
        },
        containedSecondary: {
          boxShadow: '0 6px 18px rgba(255,0,128,.35)',
          '&:hover': {
            boxShadow: '0 10px 28px rgba(255,0,128,.5)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': { borderWidth: 2 },
        },
      },
    },

    /* ---------------- Cards ---------------- */
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'all .3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: shadows[8],
          },
        },
      },
    },

    /* ---------------- AppBar ---------------- */
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(0,45,104,0.92)',
          backdropFilter: 'blur(16px)',
          boxShadow: shadows[6],
        },
      },
    },

    /* ---------------- TextField ---------------- */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    /* ---------------- Paper ---------------- */
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    /* ---------------- Dialog ---------------- */
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },

    /* ---------------- Table ---------------- */
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: palette.grey[50],
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
  },

  /* =========================================================
     CUSTOM EXTENSIONS (SAFE)
  ========================================================= */

  custom: {
    gradients: {
      primary:
        'linear-gradient(135deg, #002d68 0%, #1e40af 100%)',
      secondary:
        'linear-gradient(135deg, #ff0080 0%, #ff4da6 100%)',
    },
    elevations: {
      cardHover: shadows[8],
      modal: shadows[12],
    },
  },
});

export default theme;
