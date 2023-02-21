import { memo } from 'react';

import { Card, CardContent } from '@mui/material';

import { ActionBlock } from './elements/action-block/ActionBlock';
import { ExpirySelector } from './elements/expiry-selector/ExpirySelector';
import { InfoBlock } from './elements/info-block/InfoBlock';
import { LeverageSelector } from './elements/leverage-selector/LeverageSelector';
import { OrderSelector } from './elements/order-selector/OrderSelector';
import { OrderSettings } from './elements/order-settings/OrderSettings';
import { OrderSize } from './elements/order-size/OrderSize';
import { OrderTypeSelector } from './elements/order-type-selector/OrderTypeSelector';
import { PricesBlock } from './elements/prices-block/PricesBlock';
import { StopLossSelector } from './elements/stop-loss-selector/StopLossSelector';
import { TakeProfitSelector } from './elements/take-profit-selector/TakeProfitSelector';

import styles from './OrderBlock.module.scss';

export const OrderBlock = memo(() => {
  return (
    <Card className={styles.root}>
      <OrderSelector />
      <CardContent>
        <OrderTypeSelector />
        <OrderSize />
        <PricesBlock />
        <LeverageSelector />
        <OrderSettings />
        <ExpirySelector />
        <StopLossSelector />
        <TakeProfitSelector />
        <ActionBlock />
        <InfoBlock />
      </CardContent>
    </Card>
  );
});
