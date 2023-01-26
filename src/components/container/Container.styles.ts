import { Container, styled } from '@mui/material';

export const PageContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    paddingLeft: '0',
    paddingRight: '0',
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: '40px',
    paddingRight: '40px',
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: '60px',
    paddingRight: '60px',
  },
  [theme.breakpoints.up('xl')]: {
    paddingLeft: '80px',
    paddingRight: '80px',
  },
}));
