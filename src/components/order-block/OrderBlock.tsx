import classnames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { ArrowForward } from '@mui/icons-material';
import { Card, CardContent, Link } from '@mui/material';

import { createSymbol } from 'helpers/createSymbol';
import { depositModalOpenAtom } from 'store/global-modals.store';
import { orderTypeAtom } from 'store/order-block.store';
import { selectedPerpetualAtom, selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
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
  const traderAPI = useAtomValue(traderAPIAtom);
  const selectedPerpetual = useAtomValue(selectedPerpetualAtom);
  const selectedPool = useAtomValue(selectedPoolAtom);

  const { chainId, isConnected } = useAccount();

  const [predictionQuestion, setPredictionQuestion] = useState('');

  const isPredictionMarket = useMemo(() => {
    if (!selectedPerpetual || !selectedPool) {
      return false;
    }
    try {
      return traderAPI?.isPredictionMarket(
        createSymbol({
          poolSymbol: selectedPool.poolSymbol,
          baseCurrency: selectedPerpetual.baseCurrency,
          quoteCurrency: selectedPerpetual.quoteCurrency,
        })
      );
    } catch (error) {
      // skip
    }
    return false;
  }, [traderAPI, selectedPerpetual, selectedPool]);

  useEffect(() => {
    if (!isPredictionMarket || !traderAPI) {
      setPredictionQuestion('');
      return;
    }
    if (!selectedPerpetual || !selectedPool) {
      setPredictionQuestion('');
      return;
    }
    traderAPI
      .fetchPrdMktQuestion(`${selectedPerpetual.baseCurrency}-${selectedPerpetual.quoteCurrency}`)
      .then((value) => {
        setPredictionQuestion(value);
      });
  }, [isPredictionMarket, traderAPI, selectedPerpetual, selectedPool]);

  return (
    <Card className={styles.root}>
      {!isPredictionMarket && (
        <CardContent className={classnames(styles.card, styles.header)}>
          <OrderTypeSelector />
          <SettingsButton />
        </CardContent>
      )}
      {isPredictionMarket && (
        <CardContent className={classnames(styles.card, styles.predictionHeader)}>
          <div className={styles.heading}>
            <div className={styles.main}>{t('pages.trade.order-block.prediction.title')}</div>
            <div className={styles.name}>&bull; {selectedPerpetual?.baseCurrency}</div>
          </div>
          <div className={styles.note}>{t('pages.trade.order-block.prediction.note')}</div>
        </CardContent>
      )}
      <Separator className={styles.separator} />
      <CardContent className={classnames(styles.card, styles.orders)}>
        {isPredictionMarket && <div className={styles.predictionQuestion}>{predictionQuestion}</div>}
        <OrderSelector />
      </CardContent>
      <CardContent className={styles.card}>
        <LeverageSelector />
        <OrderSize />
        {!isPredictionMarket && (
          <div className={classnames(styles.additionalPrices, { [styles.hidden]: orderType === OrderTypeE.Market })}>
            <LimitPrice />
            <TriggerPrice />
          </div>
        )}
      </CardContent>
      {!isPredictionMarket && (
        <CardContent className={classnames(styles.card, styles.selectors)}>
          <StopLossSelector />
          <TakeProfitSelector />
        </CardContent>
      )}
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
