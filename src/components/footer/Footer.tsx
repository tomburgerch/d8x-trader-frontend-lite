import type { FC } from 'react';
import { memo } from 'react';

import { Box, Link, Typography } from '@mui/material';

import { ReactComponent as Logo } from 'assets/logo.svg';

import { Container } from '../container/Container';

import styles from './Footer.module.scss';

export const Footer: FC = memo(() => {
  return (
    <footer>
      <Container>
        <Box py={6} display="flex" flexWrap="wrap" alignItems="center" className={styles.rootBox}>
          <Box component="nav" className={styles.footerNav}>
            {/*<Link href="#" color="textPrimary" className={styles.footerLink}>*/}
            {/*  Imprint*/}
            {/*</Link>*/}
            {/*<Link href="#" color="textPrimary" className={styles.footerLink}>*/}
            {/*  GTC*/}
            {/*</Link>*/}
            {/*<Link href="#" color="textPrimary" className={styles.footerLink}>*/}
            {/*  Privacy Policy*/}
            {/*</Link>*/}
            <Typography color="textSecondary" variant="caption" gutterBottom={false} className={styles.footerCopyright}>
              © Copyright 2023 D8X
            </Typography>
          </Box>
          <Link href="#" color="inherit" underline="none" className={styles.footerLogo}>
            <Logo />
          </Link>
        </Box>
      </Container>
    </footer>
  );
});
