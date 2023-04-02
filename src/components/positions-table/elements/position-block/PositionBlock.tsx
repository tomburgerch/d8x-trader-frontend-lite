import { Box, Button } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';
import { parseSymbol } from 'helpers/parseSymbol';
import type { MarginAccountI, TableHeaderI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './PositionBlock.module.scss';

interface PositionRowPropsI {
  headers: TableHeaderI[];
  position: MarginAccountI;
  handlePositionModify: (position: MarginAccountI) => void;
}

export const PositionBlock = ({ headers, position, handlePositionModify }: PositionRowPropsI) => {
  const parsedSymbol = parseSymbol(position.symbol);

  return (
    <Box className={styles.root}>
      <Box className={styles.dataBlock}>
        <SidesRow
          leftSide={headers[0].label}
          rightSide={`${parsedSymbol?.baseCurrency}/${parsedSymbol?.quoteCurrency}`}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[1].label}
          rightSide={formatToCurrency(position.positionNotionalBaseCCY, parsedSymbol?.baseCurrency)}
          rightSideStyles={styles.value}
        />
        <SidesRow leftSide={headers[2].label} rightSide={position.side} rightSideStyles={styles.value} />
        <SidesRow
          leftSide={headers[3].label}
          rightSide={formatToCurrency(position.entryPrice, parsedSymbol?.quoteCurrency)}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[4].label}
          rightSide={
            position.liquidationPrice[0] < 0
              ? `- ${parsedSymbol?.quoteCurrency}`
              : formatToCurrency(position.liquidationPrice[0], parsedSymbol?.quoteCurrency)
          }
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[5].label}
          rightSide={`${formatToCurrency(position.collateralCC, '')}(${Math.round(position.leverage * 100) / 100}x)`}
          rightSideStyles={styles.value}
        />
      </Box>
      <Box className={styles.actionBlock}>
        <Button variant="primary" size="tableSmall" onClick={() => handlePositionModify(position)}>
          Modify
        </Button>
      </Box>
    </Box>
  );
};
