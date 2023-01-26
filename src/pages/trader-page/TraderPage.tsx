import type { FC } from 'react';
import { memo } from 'react';

import {Container} from "components/container/Container";
import { Header } from 'components/header/Header';
import { Footer } from 'components/footer/Footer';
import { StaticBackground } from 'components/static-background/StaticBackground';

import styles from './TraderPage.module.scss';

export const TraderPage: FC = memo(() => {
  return (
    <>
      <StaticBackground />
      <div className={styles.content}>
        <Header />
        <Container style={{ height: '60vh' }}>Content</Container>
        <Footer />
      </div>
    </>
  );
});
