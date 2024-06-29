import { useAtomValue } from 'jotai';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DeleteForeverOutlined, ModeEditOutlineOutlined, ShareOutlined } from '@mui/icons-material';
import { IconButton, TableCell, TableRow, Typography } from '@mui/material';

import { parseSymbol } from 'helpers/parseSymbol';
import { useSettlementMap } from 'hooks/useSettlementMap';
import { collateralToSettleConversionAtom } from 'store/pools.store';
import type { MarginAccountWithAdditionalDataI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import { TpSlValue } from '../tp-sl-value/TpSlValue';

import styles from './PositionRow.module.scss';

interface PositionRowPropsI {
  position: MarginAccountWithAdditionalDataI;
  handlePositionClose: (position: MarginAccountWithAdditionalDataI) => void;
  handlePositionModify: (position: MarginAccountWithAdditionalDataI) => void;
  handlePositionShare: (position: MarginAccountWithAdditionalDataI) => void;
  handleTpSlModify: (position: MarginAccountWithAdditionalDataI) => void;
}

// @DONE view, @DONE fx

export const PositionRow = memo(
  ({
    position,
    handlePositionClose,
    handlePositionModify,
    handlePositionShare,
    handleTpSlModify,
  }: PositionRowPropsI) => {
    const { t } = useTranslation();

    const c2s = useAtomValue(collateralToSettleConversionAtom);

    const { mapPoolSymbolToSettleSymbol } = useSettlementMap();

    const parsedSymbol = parseSymbol(position.symbol);

    return (
      <TableRow key={position.symbol}>
        <TableCell align="left">
          <Typography variant="cellSmall">
            {parsedSymbol?.baseCurrency}/{parsedSymbol?.quoteCurrency}/
            {mapPoolSymbolToSettleSymbol(parsedSymbol?.poolSymbol)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {formatToCurrency(position.positionNotionalBaseCCY, parsedSymbol?.baseCurrency, true)}
          </Typography>
        </TableCell>
        <TableCell align="left">
          <Typography variant="cellSmall">
            {position.side === 'BUY'
              ? t('pages.trade.positions-table.table-content.buy')
              : t('pages.trade.positions-table.table-content.sell')}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {formatToCurrency(position.entryPrice, parsedSymbol?.quoteCurrency, true)}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="cellSmall">
            {position.liqPrice < 0
              ? `- ${parsedSymbol?.quoteCurrency}`
              : formatToCurrency(position.liqPrice, parsedSymbol?.quoteCurrency, true)}
          </Typography>
        </TableCell>
        {/* // @DONE: settlement token */}
        <TableCell align="right">
          <Typography variant="cellSmall">
            {parsedSymbol
              ? formatToCurrency(
                  position.collateralCC * (c2s.get(parsedSymbol.poolSymbol)?.value ?? 1),
                  mapPoolSymbolToSettleSymbol(parsedSymbol.poolSymbol),
                  true
                )
              : '-'}{' '}
            ({Math.round(position.leverage * 100) / 100}x)
          </Typography>
        </TableCell>
        {/* // @DONE: leave collateral token */}
        <TableCell align="right">
          <Typography
            variant="cellSmall"
            className={position.unrealizedPnlQuoteCCY >= 0 ? styles.pnlPositive : styles.pnlNegative}
          >
            {formatToCurrency(position.unrealizedPnlQuoteCCY, parsedSymbol?.quoteCurrency, true)}
            {position.unrealizedPnlQuoteCCY
              ? ` (${Math.round((position.unrealizedPnlQuoteCCY / (position.collateralCC * position.collToQuoteConversion)) * 10000) / 100}%)`
              : ' (0%)'}
          </Typography>
        </TableCell>
        <TableCell align="right" className={styles.tpSlCell}>
          <TpSlValue position={position} handleTpSlModify={handleTpSlModify} />
        </TableCell>
        <TableCell align="center">
          <IconButton
            aria-label={t('pages.trade.positions-table.table-content.modify')}
            title={t('pages.trade.positions-table.table-content.modify')}
            onClick={() => handlePositionModify(position)}
          >
            <ModeEditOutlineOutlined className={styles.actionIcon} />
          </IconButton>
          <IconButton
            aria-label={t('pages.trade.positions-table.table-content.close')}
            title={t('pages.trade.positions-table.modify-modal.close')}
            onClick={() => handlePositionClose(position)}
          >
            <DeleteForeverOutlined className={styles.actionIcon} />
          </IconButton>
          <IconButton
            aria-label={t('pages.trade.positions-table.table-content.share')}
            title={t('pages.trade.positions-table.modify-modal.share')}
            onClick={() => handlePositionShare(position)}
          >
            <ShareOutlined className={styles.actionIcon} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
);
