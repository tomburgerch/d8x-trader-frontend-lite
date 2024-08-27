import classnames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { ArrowForward } from '@mui/icons-material';
import { Card, CardContent, Link } from '@mui/material';

import { depositModalOpenAtom } from 'store/global-modals.store';
import { orderTypeAtom } from 'store/order-block.store';
import { OrderTypeE } from 'types/enums';
import { isEnabledChain } from 'utils/isEnabledChain';

import { Separator } from '../separator/Separator';
import { ActionBlock } from './elements/action-block/ActionBlock';
import { InfoBlock } from './elements/info-block/InfoBlock';
import { LeverageSelector } from './elements/leverage-selector/LeverageSelector';
import { LimitPrice } from './elements/limit-price/LimitPrice';
import { OrderSelector } from './elements/order-selector/OrderSelector';
import { OrderSize } from './elements/order-size/OrderSize';
import { OrderTypeSelector } from './elements/order-type-selector/OrderTypeSelector';
import { SettingsButton } from './elements/settings-button/SettingsButton';
import { StopLossSelector } from './elements/stop-loss-selector/StopLossSelector';
import { TakeProfitSelector } from './elements/take-profit-selector/TakeProfitSelector';
import { TriggerPrice } from './elements/trigger-price/TriggerPrice';

import styles from './OrderBlock.module.scss';

export const OrderBlock = memo(() => {
  const { t } = useTranslation();

  const orderType = useAtomValue(orderTypeAtom);
  const setDepositModalOpen = useSetAtom(depositModalOpenAtom);

  const { chainId, isConnected } = useAccount();

  return (
    <Card className={styles.root}>
      <CardContent className={classnames(styles.card, styles.header)}>
        <OrderTypeSelector />
        <SettingsButton />
      </CardContent>
      <Separator className={styles.separator} />
      <CardContent className={classnames(styles.card, styles.orders)}>
        <OrderSelector />
      </CardContent>
      <CardContent className={styles.card}>
        <LeverageSelector />
        <OrderSize />
        <div className={classnames(styles.additionalPrices, { [styles.hidden]: orderType === OrderTypeE.Market })}>
          <LimitPrice />
          <TriggerPrice />
        </div>
      </CardContent>
      <CardContent className={classnames(styles.card, styles.selectors)}>
        <StopLossSelector />
        <TakeProfitSelector />
      </CardContent>
      <CardContent className={classnames(styles.card, styles.bottomCard)}>
        <InfoBlock />
        <ActionBlock />
        {isConnected && isEnabledChain(chainId) && (
          <Link onClick={() => setDepositModalOpen(true)} className={styles.depositLink}>
            <ArrowForward fontSize="small" />
            <span className={styles.textOffset}>{t('common.deposit-modal.title')}</span>
          </Link>
        )}
      </CardContent>
    </Card>
  );
});
