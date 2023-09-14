import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Container } from 'components/container/Container';
import { useFetchOpenRewards } from 'pages/refer-page/components/trader-tab/useFetchOpenRewards';
import { traderAPIAtom } from 'store/pools.store';

import styles from './PortfolioPage.module.scss';
import { AccountValue } from './components/AccountValue/AccountValue';
import { fetchPositionsAtom } from './components/AccountValue/fetchEverything';
import { AssetsBlock } from './components/AssetsBlock/AssetsBlock';

export const PortfolioPage = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { openRewards } = useFetchOpenRewards();
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, fetchPositions] = useAtom(fetchPositionsAtom);

  useEffect(() => {
    if (traderAPI) {
      // eslint-disable-next-line
      fetchPositions(address!, chainId, openRewards);
    }
  }, [openRewards, traderAPI, address, chainId, fetchPositions]);

  return (
    <div className={styles.root}>
      <Container>
        <div className={styles.container}>
          <AccountValue />
          <AssetsBlock />
        </div>
      </Container>
    </div>
  );
};
