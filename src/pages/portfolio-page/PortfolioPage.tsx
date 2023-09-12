import { Container } from 'components/container/Container';
import styles from './PortfolioPage.module.scss';
import { AccountValue } from './components/AccountValue/AccountValue';
import { AssetsBlock } from './components/AssetsBlock/AssetsBlock';

export const PortfolioPage = () => {
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
