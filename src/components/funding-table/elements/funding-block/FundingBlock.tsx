import { format } from 'date-fns';
import { Box } from '@mui/material';

import { SidesRow } from 'components/sides-row/SidesRow';
import type { PerpetualDataI, TableHeaderI, FundingI } from 'types/types';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './FundingBlock.module.scss';

interface FundingRowPropsI {
  headers: TableHeaderI[];
  perpetuals: PerpetualDataI[];
  funding: FundingI;
}

export const FundingBlock = ({ headers, perpetuals, funding }: FundingRowPropsI) => {
  const perpetual = perpetuals.find(({ id }) => id === funding.perpetualId);
  const time = format(new Date(funding.timestamp), 'yyyy-MM-dd HH:mm:ss');

  return (
    <Box className={styles.root}>
      <Box className={styles.dataBlock}>
        <SidesRow leftSide={headers[0].label} rightSide={time} rightSideStyles={styles.value} />
        <SidesRow
          leftSide={headers[1].label}
          rightSide={perpetual ? `${perpetual.baseCurrency}-${perpetual.quoteCurrency}` : ''}
          rightSideStyles={styles.value}
        />
        <SidesRow
          leftSide={headers[2].label}
          rightSide={perpetual ? formatToCurrency(funding.amount, perpetual.poolName) : ''}
          rightSideStyles={styles.value}
        />
      </Box>
    </Box>
  );
};
