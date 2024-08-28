import { TraderInterface } from '@d8x/perpetuals-sdk';
import classnames from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import type { SelectItemI } from 'components/header/elements/header-select/types';
import { Separator } from 'components/separator/Separator';
import type { StatDataI } from 'components/stats-line/types';
import { TooltipMobile } from 'components/tooltip-mobile/TooltipMobile';
import { createSymbol } from 'helpers/createSymbol';
import { parseSymbol } from 'helpers/parseSymbol';
import { calculateProbability } from 'helpers/calculateProbability';
import { clearInputsDataAtom, orderBlockAtom } from 'store/order-block.store';
import {
  perpetualStaticInfoAtom,
  perpetualStatisticsAtom,
  poolsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { marketsDataAtom } from 'store/tv-chart.store';
import { AssetTypeE, OrderBlockE } from 'types/enums';
import type { TemporaryAnyT } from 'types/types';
import { cutBaseCurrency } from 'utils/cutBaseCurrency';
import { formatToCurrency } from 'utils/formatToCurrency';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import { CollateralFilter } from './components/collateral-filter/CollateralFilter';
import { Filters } from './components/filters/Filters';
import { MarketOption } from './components/market-option/MarketOption';
import { SearchInput } from './components/search-input/SearchInput';
import { PerpetualWithPoolAndMarketI } from './types';
import { useMarketsFilter } from './useMarketsFilter';

import styles from './MarketSelect.module.scss';

const OptionsHeader = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.optionsHeader}>
        <div className={styles.header}>{t('common.select.market.header')}</div>
      </div>
      <Separator />
      <div className={styles.controlsContainer}>
        <SearchInput />
        <CollateralFilter />
        <Filters />
      </div>
    </>
  );
};

export const MarketSelect = memo(() => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const pools = useAtomValue(poolsAtom);
  const orderBlock = useAtomValue(orderBlockAtom);
  const marketsData = useAtomValue(marketsDataAtom);
  const traderAPI = useAtomValue(traderAPIAtom);
  const perpetualStatistics = useAtomValue(perpetualStatisticsAtom);
  const perpetualStaticInfo = useAtomValue(perpetualStaticInfoAtom);
  const [selectedPerpetual, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const setPerpetualStatistics = useSetAtom(perpetualStatisticsAtom);
  const clearInputsData = useSetAtom(clearInputsDataAtom);

  const [isModalOpen, setModalOpen] = useState(false);

  const urlChangesAppliedRef = useRef(false);

  useEffect(() => {
    if (!location.hash || urlChangesAppliedRef.current || !pools.length) {
      return;
    }

    urlChangesAppliedRef.current = true;

    const symbolHash = location.hash.slice(1);
    const result = parseSymbol(symbolHash);

    if (result) {
      setSelectedPool(result.poolSymbol);

      const foundPool = pools.find(({ poolSymbol }) => poolSymbol === result.poolSymbol);
      if (!foundPool) {
        return;
      }

      const foundPerpetual = foundPool.perpetuals.find(
        ({ baseCurrency, quoteCurrency }) =>
          baseCurrency === result.baseCurrency && quoteCurrency === result.quoteCurrency
      );
      if (foundPerpetual) {
        setSelectedPerpetual(foundPerpetual.id);
      }
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

  const handleChange = (newItem: PerpetualWithPoolAndMarketI) => {
    setSelectedPool(newItem.poolSymbol);
    setSelectedPerpetual(newItem.id);

    navigate(
      `${location.pathname}${location.search}#${newItem.baseCurrency}-${newItem.quoteCurrency}-${newItem.poolSymbol}`
    );
    clearInputsData();
    setModalOpen(false);
  };

  const markets = useMemo(() => {
    const marketsList: SelectItemI<PerpetualWithPoolAndMarketI>[] = [];
    pools
      .filter((pool) => pool.isRunning)
      .forEach((pool) =>
        marketsList.push(
          ...pool.perpetuals
            .filter((perpetual) => perpetual.state === 'NORMAL')
            .map((perpetual) => {
              const pairId = `${perpetual.baseCurrency}-${perpetual.quoteCurrency}`.toLowerCase();
              let marketData = marketsData.find((market) => market.symbol === pairId);

              const symbol = createSymbol({
                poolSymbol: pool.poolSymbol,
                baseCurrency: perpetual.baseCurrency,
                quoteCurrency: perpetual.quoteCurrency,
              });

              let isPredictionMarket = false;
              try {
                isPredictionMarket = traderAPI?.isPredictionMarket(symbol) || false;
              } catch (error) {
                // skip
              }

              if (!marketData && isPredictionMarket) {
                const currentPx = calculateProbability(perpetual.midPrice, orderBlock === OrderBlockE.Short);

                marketData = {
                  isOpen: !perpetual.isMarketClosed,
                  symbol: pairId,
                  assetType: AssetTypeE.Prediction,
                  ret24hPerc: 0,
                  currentPx,
                  nextOpen: 0,
                  nextClose: 0,
                };
              }

              return {
                value: perpetual.id.toString(),
                item: {
                  ...perpetual,
                  poolSymbol: pool.poolSymbol,
                  settleSymbol: pool.settleSymbol,
                  symbol,
                  marketData: marketData ?? null,
                },
              };
            })
        )
      );
    return marketsList;
  }, [pools, marketsData, orderBlock, traderAPI]);

  const filteredMarkets = useMarketsFilter(markets);

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
        isPredictionMarket = TraderInterface.isPredictionMarket(perpetualStaticInfo);
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

  return (
    <div className={styles.holderRoot}>
      <div className={styles.iconsWrapper}>
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
      <Button onClick={() => setModalOpen(true)} className={styles.marketSelectButton} variant="outlined">
        <div className={styles.selectedMarketBlock}>
          <div className={styles.selectedMarketValue}>
            <Typography variant="bodyBig" className={styles.selectedMarketPerpetual}>
              {isPredictionMarket
                ? cutBaseCurrency(selectedPerpetual?.baseCurrency)
                : `${cutBaseCurrency(selectedPerpetual?.baseCurrency)}/${selectedPerpetual?.quoteCurrency}`}
            </Typography>
            <Typography variant="bodyTiny">{selectedPool?.settleSymbol}</Typography>
          </div>
          {midPrice.tooltip && perpetualStatistics?.midPriceDiff ? (
            <TooltipMobile tooltip={midPrice.tooltip}>
              <div className={classnames(styles.statMainValue, midPrice.className)}>$ {midPrice.numberOnly}</div>
            </TooltipMobile>
          ) : (
            <div className={classnames(styles.statMainValue, midPrice.className)}>$ {midPrice.numberOnly}</div>
          )}
        </div>
        <div className={styles.arrowDropDown}>{isModalOpen ? <ArrowDropUp /> : <ArrowDropDown />}</div>
      </Button>

      <Dialog open={isModalOpen} className={styles.dialog} onClose={() => setModalOpen(false)} scroll="paper">
        <OptionsHeader />
        <Separator />
        <DialogContent />
        <div className={styles.optionList}>
          {filteredMarkets.map((market) => (
            <MarketOption
              key={market.value}
              option={market}
              isSelected={market.item.id === selectedPerpetual?.id}
              onClick={() => handleChange(market.item)}
            />
          ))}
        </div>
        <DialogActions className={styles.dialogAction}>
          <Button onClick={() => setModalOpen(false)} variant="secondary" size="small">
            {t('common.info-modal.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});
