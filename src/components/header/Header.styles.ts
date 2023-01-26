import { AppBar, styled } from '@mui/material';

export const PageAppBar = styled(AppBar)(({ theme }) => ({
  '&.MuiPaper-root': {
    [theme.breakpoints.down('sm')]: {
      height: '80px',
    },
  },
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
