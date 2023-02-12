import { memo } from 'react';

import { Box, Link, Typography } from '@mui/material';

import { ReactComponent as Logo } from 'assets/logo.svg';

import { Container } from '../container/Container';

import styles from './Footer.module.scss';

export const Footer = memo(() => {
  return (
    <footer>
      <Container>
        <Box className={styles.rootBox}>
          <Box component="nav">
            <Typography color="textSecondary" variant="caption" gutterBottom={false}>
              © Copyright 2023 D8X
            </Typography>
          </Box>
          <Link href="/" color="inherit" underline="none" className={styles.footerLogoWrapper}>
            <Logo className={styles.footerLogo} />
          </Link>
        </Box>
      </Container>
    </footer>
  );
});
