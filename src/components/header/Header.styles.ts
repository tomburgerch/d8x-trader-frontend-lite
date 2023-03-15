import { AppBar, styled } from '@mui/material';

export const PageAppBar = styled(AppBar)(({ theme }) => ({
  '.MuiLink-root': {
    [theme.breakpoints.up('sm')]: {
      marginLeft: '12px',
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: '24px',
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: '48px',
    },
  },
}));
