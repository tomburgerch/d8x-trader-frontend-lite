import { useAtom, useAtomValue } from 'jotai';
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonSelect } from 'components/button-select/ButtonSelect';
import { ButtonMenuItem } from 'components/button-select/elements/ButtonMenuItem';
import { collateralToSettleConversionAtom } from 'store/pools.store';
import type { TemporaryAnyT } from 'types/types';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import { collateralFilterAtom, collateralsAtom } from '../../collaterals.store';

import styles from './CollateralSelect.module.scss';

interface OptionTitlePropsI {
  option: string;
}

const OptionTitle = ({ option }: OptionTitlePropsI) => {
  const { t } = useTranslation();

  const IconComponent = useMemo(() => {
    if (option === '') {
      return () => null;
    }
    return getDynamicLogo(option.toLowerCase()) as TemporaryAnyT;
  }, [option]);

  return (
    <span className={styles.currencyLabel}>
      <span className={styles.iconHolder}>
        <Suspense fallback={null}>
          <IconComponent width={16} height={16} />
        </Suspense>
      </span>
      <span className={styles.label}>{option !== '' ? option : t('common.select.option-all')}</span>
    </span>
  );
};

export const CollateralSelect = () => {
  const { t } = useTranslation();

  const [collateralFilter, setCollateralFilter] = useAtom(collateralFilterAtom);
  const collaterals = useAtomValue(collateralsAtom);
  const c2s = useAtomValue(collateralToSettleConversionAtom);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currencyOptions = useMemo(() => {
    const currencies = [''];
    collaterals.forEach((collateral) => {
      if (!currencies.includes(collateral)) {
        currencies.push(collateral);
      }
    });
    return currencies;
  }, [collaterals]);

  const IconComponent = useMemo(() => {
    if (!collateralFilter) {
      return () => null;
    }
    return getDynamicLogo(collateralFilter.toLowerCase()) as TemporaryAnyT;
  }, [collateralFilter]);

  return (
    <ButtonSelect
      id="collateral-select"
      selectedValue={
        <span className={styles.currencyLabel}>
          <span className={styles.iconHolder}>
            <Suspense fallback={null}>
              <IconComponent width={16} height={16} />
            </Suspense>
          </span>
          <span className={styles.label}>
            {collateralFilter !== null
              ? c2s.get(collateralFilter)?.settleSymbol ?? collateralFilter
              : t('common.select.option-all')}
          </span>
        </span>
      }
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      className={styles.collateralButton}
    >
      {currencyOptions.map((option) => (
        <ButtonMenuItem
          key={option}
          option={<OptionTitle option={option} />}
          isActive={option === collateralFilter || (option === '' && collateralFilter === null)}
          onClick={() => {
            setCollateralFilter(option === '' ? null : option);
            setAnchorEl(null);
          }}
        />
      ))}
    </ButtonSelect>
  );
};
