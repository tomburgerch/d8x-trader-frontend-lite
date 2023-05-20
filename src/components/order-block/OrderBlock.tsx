import { memo } from 'react';

import { Box, Card, CardContent } from '@mui/material';

import { ActionBlock } from './elements/action-block/ActionBlock';
import { ExpirySelector } from './elements/expiry-selector/ExpirySelector';
import { InfoBlock } from './elements/info-block/InfoBlock';
import { LeverageSelector } from './elements/leverage-selector/LeverageSelector';
import { LimitPrice } from './elements/limit-price/LimitPrice';
import { OrderSelector } from './elements/order-selector/OrderSelector';
import { OrderSettings } from './elements/order-settings/OrderSettings';
import { OrderSize } from './elements/order-size/OrderSize';
import { OrderTypeSelector } from './elements/order-type-selector/OrderTypeSelector';
import { TriggerPrice } from './elements/trigger-price/TriggerPrice';
import { StopLossSelector } from './elements/stop-loss-selector/StopLossSelector';
import { TakeProfitSelector } from './elements/take-profit-selector/TakeProfitSelector';

import styles from './OrderBlock.module.scss';

export const OrderBlock = memo(() => {
  return (
    <Card className={styles.root}>
      <OrderSelector />
      <CardContent>
        <OrderTypeSelector />
        <Box className={styles.separator} />
        <OrderSize />
        <TriggerPrice />
        <LimitPrice />
        <Box className={styles.separator} />
        <LeverageSelector />
        <OrderSettings />
        <Box className={styles.separator} />
        <ExpirySelector />
        <StopLossSelector />
        <TakeProfitSelector />
        <Box className={styles.separator} />
        <InfoBlock />
        <ActionBlock />
      </CardContent>
    </Card>
  );
});
