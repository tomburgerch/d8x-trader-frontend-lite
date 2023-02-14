import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Box } from '@mui/material';

import { TraderPage } from './pages/trader-page/TraderPage';

import styles from './App.module.scss';

export const App = memo(() => {
  return (
    <Box className={styles.root}>
      <Routes>
        <Route key="trader-page" path="*" element={<TraderPage />} />
      </Routes>
    </Box>
  );
});
