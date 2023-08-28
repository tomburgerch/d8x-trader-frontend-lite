import { Box, Toolbar, Typography } from '@mui/material';

import { Container } from '../container/Container';
import { InteractiveLogo } from '../interactive-logo/InteractiveLogo';
import { LanguageSwitcher } from '../language-switcher/LanguageSwitcher';

import { PageAppBar } from './Header.styles';
import styles from './Header.module.scss';

export const EmptyHeader = () => (
  <Container className={styles.root}>
    <Box sx={{ display: 'flex' }}>
      <PageAppBar position="static">
        <Toolbar className={styles.toolbar}>
          <Box className={styles.leftSide}>
            <Typography variant="h6" component="div">
              <a href="/" className={styles.logoLink}>
                <InteractiveLogo />
              </a>
            </Typography>
          </Box>
          <LanguageSwitcher />
        </Toolbar>
      </PageAppBar>
    </Box>
  </Container>
);
