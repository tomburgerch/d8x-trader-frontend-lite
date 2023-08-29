import { type PropsWithChildren } from 'react';

import { Box } from '@mui/material';

import { Container } from 'components/container/Container';
import { Footer } from 'components/footer/Footer';
import { EmptyHeader } from 'components/header/EmptyHeader';
import { Helmet } from 'components/helmet/Helmet';
import { StaticBackground } from 'components/static-background/StaticBackground';

import styles from './GeoLayout.module.scss';

interface GeoLayoutPropsI extends PropsWithChildren {
  title: string;
}

export const GeoLayout = ({ title, children }: GeoLayoutPropsI) => {
  return (
    <Box className={styles.root}>
      <StaticBackground />
      <Helmet title={`${title} | D8X App`} />
      <Box className={styles.content}>
        <Box className={styles.body}>
          <EmptyHeader />
          <Container className={styles.container}>{children}</Container>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};
