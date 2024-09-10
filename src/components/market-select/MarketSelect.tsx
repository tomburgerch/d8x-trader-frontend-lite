import { TraderInterface } from '@d8x/perpetuals-sdk';
import classnames from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { memo, Suspense, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';

import ArrowDownIcon from 'assets/icons/new/arrowDown.svg?react';
import ArrowUpIcon from 'assets/icons/new/arrowUp.svg?react';
import { CurrencyBadge } from 'components/currency-badge/CurrencyBadge';
import type { StatDataI } from 'components/stats-line/types';
import { TooltipMobile } from 'components/tooltip-mobile/TooltipMobile';
import { createSymbol } from 'helpers/createSymbol';
import { parseSymbol } from 'helpers/parseSymbol';
import { calculateProbability } from 'helpers/calculateProbability';
import { marketSelectModalOpenAtom } from 'store/global-modals.store';
import { orderBlockAtom } from 'store/order-block.store';
import {
  perpetualStaticInfoAtom,
  perpetualStatisticsAtom,
  poolsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { OrderBlockE } from 'types/enums';
import type { TemporaryAnyT } from 'types/types';
import { cutBaseCurrency } from 'utils/cutBaseCurrency';
import { formatToCurrency } from 'utils/formatToCurrency';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import { useMarkets } from 'components/market-select-modal/hooks/useMarkets';

import styles from './MarketSelect.module.scss';

export const MarketSelect = memo(() => {
  const { t } = useTranslation();

  const location = useLocation();

  const pools = useAtomValue(poolsAtom);
  const orderBlock = useAtomValue(orderBlockAtom);
  const traderAPI = useAtomValue(traderAPIAtom);
  const perpetualStatistics = useAtomValue(perpetualStatisticsAtom);
  const perpetualStaticInfo = useAtomValue(perpetualStaticInfoAtom);
  const [selectedPerpetual, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const setPerpetualStatistics = useSetAtom(perpetualStatisticsAtom);
  const [isMarketSelectModalOpen, setMarketSelectModalOpen] = useAtom(marketSelectModalOpenAtom);

  const urlChangesAppliedRef = useRef(false);

  const markets = useMarkets();

  useEffect(() => {
    if (!location.hash || urlChangesAppliedRef.current || !pools.length) {
      return;
    }

    let symbolHash = location.hash.slice(1);
    // Handle `=` in the URL, which magically appears there...
    if (symbolHash.indexOf('=')) {
      symbolHash = symbolHash.replaceAll('=', '');
    }
    const result = parseSymbol(symbolHash);

    if (result) {
      setSelectedPool(result.poolSymbol);

      const foundPool = pools.find(({ poolSymbol }) => poolSymbol === result.poolSymbol);
      if (!foundPool) {
        if (pools.length > 0) {
          urlChangesAppliedRef.current = true;
        }
        return;
      }

      const foundPerpetual = foundPool.perpetuals.find(
        ({ baseCurrency, quoteCurrency }) =>
          baseCurrency === result.baseCurrency && quoteCurrency === result.quoteCurrency
      );
      if (foundPerpetual) {
        setSelectedPerpetual(foundPerpetual.id);
      }
      urlChangesAppliedRef.current = true;
    }
  }, [location.hash, selectedPool, setSelectedPool, setSelectedPerpetual, pools]);

  useEffect(() => {
    if (selectedPool && selectedPerpetual) {
      setPerpetualStatistics({
        id: selectedPerpetual.id,
        baseCurrency: selectedPerpetual.baseCurrency,
        quoteCurrency: selectedPerpetual.quoteCurrency,
        poolName: selectedPool.poolSymbol,
        midPrice: selectedPerpetual.midPrice,
        markPrice: selectedPerpetual.markPrice,
        indexPrice: selectedPerpetual.indexPrice,
        currentFundingRateBps: selectedPerpetual.currentFundingRateBps,
        openInterestBC: selectedPerpetual.openInterestBC,
      });
    }
  }, [selectedPool, selectedPerpetual, setPerpetualStatistics]);

  const BaseIconComponent = useMemo(() => {
    return getDynamicLogo(selectedPerpetual?.baseCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [selectedPerpetual?.baseCurrency]);

  const QuoteIconComponent = useMemo(() => {
    return getDynamicLogo(selectedPerpetual?.quoteCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [selectedPerpetual?.quoteCurrency]);

  let midPriceClass = styles.positive;
  if (perpetualStatistics?.midPriceDiff != null) {
    midPriceClass = perpetualStatistics?.midPriceDiff >= 0 ? styles.positive : styles.negative;
  }

  const [displayMidPrice, displayCcy] = useMemo(() => {
    if (!!perpetualStatistics && !!perpetualStaticInfo) {
      let isPredictionMarket = false;
      try {
        isPredictionMarket = TraderInterface.isPredictionMarketStatic(perpetualStaticInfo);
      } catch {
        // skip
      }
      const px = perpetualStatistics.midPrice;
      return isPredictionMarket
        ? [calculateProbability(px, orderBlock === OrderBlockE.Short), perpetualStatistics.quoteCurrency]
        : [px, perpetualStatistics.quoteCurrency];
    }
    return [undefined, undefined];
  }, [perpetualStatistics, perpetualStaticInfo, orderBlock]);

  const midPrice: StatDataI = useMemo(
    () => ({
      id: 'midPrice',
      label: t('pages.trade.stats.mid-price'),
      tooltip: t('pages.trade.stats.mid-price-tooltip'),
      value: displayCcy ? formatToCurrency(displayMidPrice, displayCcy, true) : '--',
      numberOnly: displayCcy ? formatToCurrency(displayMidPrice, '', true, undefined, true) : '--',
      className: midPriceClass, // Add the custom class here
    }),
    [t, midPriceClass, displayMidPrice, displayCcy]
  );

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

  const currencyMarketData = useMemo(() => {
    if (selectedPerpetual && markets.length > 0) {
      return markets.find((market) => market.value === `${selectedPerpetual.id}`)?.item.marketData ?? null;
    }
    return null;
  }, [selectedPerpetual, markets]);

  return (
    <div className={styles.holderRoot} onClick={() => setMarketSelectModalOpen(true)}>
      <div className={classnames(styles.iconsWrapper, { [styles.oneCurrency]: isPredictionMarket })}>
        <div className={styles.baseIcon}>
          <Suspense fallback={null}>
            <BaseIconComponent />
          </Suspense>
        </div>
        <div className={styles.quoteIcon}>
          <Suspense fallback={null}>
            <QuoteIconComponent />
          </Suspense>
        </div>
      </div>
      <Button className={styles.marketSelectButton} variant="outlined">
        <div className={styles.selectedMarketBlock}>
          <div className={styles.selectedMarketValue}>
            <Typography variant="bodyBig" className={styles.selectedMarketPerpetual}>
              {isPredictionMarket
                ? cutBaseCurrency(selectedPerpetual?.baseCurrency)
                : `${cutBaseCurrency(selectedPerpetual?.baseCurrency)}/${selectedPerpetual?.quoteCurrency}`}
            </Typography>
            <CurrencyBadge
              className={styles.badge}
              assetType={currencyMarketData?.assetType}
              label={t(`common.select.market.${currencyMarketData?.assetType}`)}
              withPoint={true}
            />
          </div>
          <div className={styles.midPrice}>
            {midPrice.tooltip && perpetualStatistics?.midPriceDiff ? (
              <TooltipMobile tooltip={midPrice.tooltip}>
                <div className={classnames(styles.statMainValue, midPrice.className)}>{midPrice.numberOnly}</div>
              </TooltipMobile>
            ) : (
              <div className={classnames(styles.statMainValue, midPrice.className)}>{midPrice.numberOnly}</div>
            )}
            {!isPredictionMarket && currencyMarketData && (
              <div
                className={classnames(styles.priceChange, {
                  [styles.positive]: currencyMarketData.ret24hPerc >= 0,
                  [styles.negative]: currencyMarketData.ret24hPerc < 0,
                })}
              >
                <span>{currencyMarketData.ret24hPerc.toFixed(2)}%</span>
                <span>{currencyMarketData.ret24hPerc >= 0 ? <ArrowDropUp /> : <ArrowDropDown />}</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.arrowDropDown}>
          {isMarketSelectModalOpen ? <ArrowUpIcon width={20} height={20} /> : <ArrowDownIcon width={20} height={20} />}
        </div>
      </Button>
    </div>
  );
});
