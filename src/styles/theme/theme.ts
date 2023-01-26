import { createTheme } from '@mui/material/styles';

// Disable eslint as @mui does not follow same linting convention for interface suffixes.

/* eslint-disable */
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true; // adds the `xs` breakpoint
    sm: true;
    md: true;
    lg: true;
    xl: true;
    mobile: false; // removes the `mobile` breakpoint
    tablet: false;
    laptop: false;
    desktop: false;
  }
}
/* eslint-enable */

export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1760,
    },
  },
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    fontSize: 16,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          display: 'flex',
          justifyContent: 'center',
          height: '172px',
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent',
          color: 'var(--d8x-text-color)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'var(--d8x-text-color)',
          marginLeft: '48px',
          ':first-of-type': {
            marginLeft: '0',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 24px',
        },
        content: {
          margin: '32px 0',
          '&.Mui-expanded': {
            margin: '32px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 24px',
          margin: '32px 0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '26px',
          textTransform: 'none',
          color: 'var(--d8x-color-purple)',
          borderColor: 'var(--d8x-color-purple)',
          '&:hover': {
            borderColor: 'var(--d8x-color-purple)',
            backgroundColor: 'rgba(var(--d8x-color-purple-rgb), 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

// Responsive Typography
theme.typography.h1 = {
  fontSize: 120,
  lineHeight: '145px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '40px',
    lineHeight: '48px',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '7vw',
    lineHeight: '7.5vw',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: '120px',
    lineHeight: '145px',
  },
};
theme.typography.h2 = {
  fontSize: 90,
  lineHeight: '109px',
  [theme.breakpoints.up('xl')]: {
    fontSize: '90px',
    lineHeight: '109px',
  },
};
theme.typography.h3 = {
  fontSize: 32,
  lineHeight: '39px',
  [theme.breakpoints.up('sm')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: '48px',
    lineHeight: '58px',
  },
};
theme.typography.h4 = {
  fontSize: 32,
  lineHeight: '39px',
  [theme.breakpoints.up('xs')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '30px',
    lineHeight: '36px',
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
};
theme.typography.body1 = {
  fontSize: 24,
  lineHeight: '32px',
  [theme.breakpoints.up('md')]: {
    fontSize: '24px',
    lineHeight: '32px',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: '32px',
    lineHeight: '39px',
  },
};
theme.typography.body2 = {
  fontSize: 24,
  lineHeight: '32px',
  [theme.breakpoints.up('xs')]: {
    fontSize: '20px',
    lineHeight: '28px',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '22px',
    lineHeight: '30px',
  },
  [theme.breakpoints.up('xl')]: {
    fontSize: '24px',
    lineHeight: '32px',
  },
};

// TODO: VOV: Investigate possibility to change UI here
// // Responsive components
// if (theme.components) {
//   // AppBar
//   theme.components.MuiAppBar = {
//     ...theme.components.MuiAppBar,
//     styleOverrides: {
//       ...theme.components.MuiAppBar?.styleOverrides,
//       root: {
//         [theme.breakpoints.up('sm')]: {
//           marginLeft: '12px',
//         },
//         [theme.breakpoints.up('md')]: {
//           marginLeft: '24px',
//         },
//         [theme.breakpoints.up('lg')]: {
//           marginLeft: '48px',
//         },
//       },
//     },
//   };
// }
