import { useTranslation } from 'react-i18next';

import { Separator } from 'components/separator/Separator';

import { CollateralSelect } from '../collateral-select/CollateralSelect';
import { SearchInput } from '../search-input/SearchInput';
import { Filters } from '../filters/Filters';

import styles from './OptionsHeader.module.scss';

export const OptionsHeader = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.optionsHeader}>
        <div className={styles.header}>{t('common.select.market.header')}</div>
      </div>
      <Separator />
      <div className={styles.controlsContainer}>
        <div className={styles.searchAndType}>
          <SearchInput />
          <CollateralSelect />
        </div>
        <Filters />
      </div>
    </>
  );
};
