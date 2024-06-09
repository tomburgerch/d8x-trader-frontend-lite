import classNames from 'classnames';
import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography, useMediaQuery, useTheme } from '@mui/material';

import ViewChartIcon from 'assets/icons/viewChart.svg?react';

import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { TooltipMobile } from 'components/tooltip-mobile/TooltipMobile';
import { perpetualStatisticsAtom, showChartForMobileAtom } from 'store/pools.store';
import { abbreviateNumber } from 'utils/abbreviateNumber';
import { formatToCurrency } from 'utils/formatToCurrency';
import { marketsDataAtom } from 'store/tv-chart.store';

import styles from './PerpetualStats.module.scss';

export const PerpetualStats = () => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isDesktopScreen = useMediaQuery(theme.breakpoints.down('xl'));
  const isTabletScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isMiddleScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const marketsData = useAtomValue(marketsDataAtom);

  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [showChartForMobile, setShowChartForMobile] = useAtom(showChartForMobileAtom);

  const pairId = `${perpetualStatistics?.baseCurrency}-${perpetualStatistics?.quoteCurrency}`.toLowerCase();
  const marketData = marketsData.find((market) => market.symbol === pairId);

  console.log(marketData?.ret24hPerc);

  const midPrice: StatDataI = useMemo(
    () => ({
      id: 'midPrice',
      label: t('pages.trade.stats.mid-price'),
      tooltip: t('pages.trade.stats.mid-price-tooltip'),
      value: perpetualStatistics
        ? formatToCurrency(perpetualStatistics.midPrice, perpetualStatistics.quoteCurrency, true)
        : '--',
      numberOnly: perpetualStatistics
        ? formatToCurrency(perpetualStatistics.midPrice, '', true, undefined, true)
        : '--',
      // currencyOnly: perpetualStatistics ? perpetualStatistics.quoteCurrency : '--',
    }),
    [t, perpetualStatistics]
  );

  const items: StatDataI[] = useMemo(
    () => [
      {
        id: 'markPrice',
        label: t('pages.trade.stats.mark-price'),
        tooltip: t('pages.trade.stats.mark-price-tooltip'),
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.markPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
        numberOnly: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.markPrice, '', true, undefined, true)
          : '--',
        // currencyOnly: perpetualStatistics ? perpetualStatistics.quoteCurrency : '--',
      },
      {
        id: 'indexPrice',
        label: t('pages.trade.stats.index-price'),
        tooltip: t('pages.trade.stats.index-price-tooltip'),
        value: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.indexPrice, perpetualStatistics.quoteCurrency, true)
          : '--',
        numberOnly: perpetualStatistics
          ? formatToCurrency(perpetualStatistics.indexPrice, '', true, undefined, true)
          : '--',
        // currencyOnly: perpetualStatistics ? perpetualStatistics.quoteCurrency : '--',
      },
      {
        id: 'fundingRate',
        label: t('pages.trade.stats.funding-rate'),
        tooltip: t('pages.trade.stats.funding-rate-tooltip'),
        value: perpetualStatistics ? `${(perpetualStatistics.currentFundingRateBps / 100).toFixed(2)} %` : '--',
        numberOnly: perpetualStatistics ? (perpetualStatistics.currentFundingRateBps / 100).toFixed(2) : '--',
        currencyOnly: perpetualStatistics ? '%' : '',
      },
      {
        id: 'openInterestBC',
        label: t('pages.trade.stats.open-interest'),
        tooltip: t('pages.trade.stats.open-interest-tooltip'),
        value: perpetualStatistics
          ? abbreviateNumber(perpetualStatistics.openInterestBC) + perpetualStatistics.baseCurrency
          : '--',
        numberOnly: perpetualStatistics ? abbreviateNumber(perpetualStatistics.openInterestBC) : '--',
        currencyOnly: perpetualStatistics ? perpetualStatistics.baseCurrency : '',
      },
    ],
    [t, perpetualStatistics]
  );

  if (isMobileScreen) {
    return (
      <div className={styles.statContainer}>
        <div className={styles.mainMobileLine}>
          <div>
            {midPrice.tooltip && marketData?.ret24hPerc ? (
              <TooltipMobile tooltip={midPrice.tooltip}>
                <div
                  className={
                    marketData.ret24hPerc >= 0 ? styles.statMainValuePositiveMobile : styles.statMainValueNegativeMobile
                  }
                >
                  {midPrice.numberOnly}
                </div>
              </TooltipMobile>
            ) : (
              <div className={styles.statMainValuePositiveMobile}>{midPrice.numberOnly}</div>
            )}
          </div>
          <div>
            <div className={styles.viewChart} onClick={() => setShowChartForMobile(!showChartForMobile)}>
              <ViewChartIcon className={styles.viewChartIcon} />
              <Typography variant="bodyTiny">
                {t(showChartForMobile ? 'pages.trade.stats.hide-graph' : 'pages.trade.stats.view-graph')}
              </Typography>
            </div>
          </div>
        </div>
        <div className={styles.statsBlock}>
          {items.map((item) => (
            <div key={item.id}>
              {item.tooltip ? (
                <TooltipMobile tooltip={item.tooltip}>
                  <div className={classNames(styles.statLabel, styles.tooltip)}>{item.label}</div>
                </TooltipMobile>
              ) : (
                <div className={styles.statLabel}>{item.label}</div>
              )}
              <span className={styles.statValue}>{item.numberOnly}</span>{' '}
              <span className={styles.statCurrency}>{item.currencyOnly}</span>
            </div>
          ))}
        </div>
      </div>
    );

    // TODO: VOV: Make StatsLineMobile common
    // return <StatsLineMobile items={items} />;
  }

  if ((isDesktopScreen && !isTabletScreen) || (isMiddleScreen && !isMobileScreen)) {
    return (
      <div className={styles.statContainer}>
        <div className={styles.statsBlock}>
          {midPrice.tooltip && marketData?.ret24hPerc ? (
            <TooltipMobile tooltip={midPrice.tooltip}>
              <div
                className={`${styles.statMainValueContainer} ${marketData.ret24hPerc >= 0 ? styles.statMainValuePositive : styles.statMainValueNegative}`}
              >
                {midPrice.numberOnly}
              </div>
            </TooltipMobile>
          ) : (
            <div className={`${styles.statMainValueContainer} ${styles.statMainValuePositive}`}>
              {midPrice.numberOnly}
            </div>
          )}
          {[...items].map((item) => (
            <div key={item.id}>
              {item.tooltip ? (
                <TooltipMobile tooltip={item.tooltip}>
                  <div className={classNames(styles.statLabel, styles.tooltip)}>{item.label}</div>
                </TooltipMobile>
              ) : (
                <div className={styles.statLabel}>{item.label}</div>
              )}
              <span className={styles.statValue}>{item.numberOnly}</span>{' '}
              <span className={styles.statCurrency}>{item.currencyOnly}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <StatsLine items={[midPrice, ...items]} />;
};
