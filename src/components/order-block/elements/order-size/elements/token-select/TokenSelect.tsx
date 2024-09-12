import { useAtom, useAtomValue } from 'jotai';
import { Suspense, useMemo, useState } from 'react';

import { ButtonSelect } from 'components/button-select/ButtonSelect';
import { ButtonMenuItem } from 'components/button-select/elements/ButtonMenuItem';
import { selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';
import type { TemporaryAnyT } from 'types/types';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import { selectedCurrencyAtom } from '../../store';

import styles from './TokenSelect.module.scss';

interface OptionTitlePropsI {
  option: string;
}

const OptionTitle = ({ option }: OptionTitlePropsI) => {
  const IconComponent = useMemo(() => getDynamicLogo(option.toLowerCase()) as TemporaryAnyT, [option]);

  return (
    <span className={styles.currencyLabel}>
      <Suspense fallback={null}>
        <IconComponent width={16} height={16} />
      </Suspense>
      <span>{option}</span>
    </span>
  );
};

export const TokenSelect = () => {
  const [selectedCurrency, setSelectedCurrency] = useAtom(selectedCurrencyAtom);
  const selectedPool = useAtomValue(selectedPoolAtom);
  const selectedPerpetual = useAtomValue(selectedPerpetualAtom);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currencyOptions = useMemo(() => {
    if (!selectedPool || !selectedPerpetual) {
      return [];
    }

    const currencies = [selectedPerpetual.baseCurrency, selectedPerpetual.quoteCurrency];
    if (selectedPool.settleSymbol && !currencies.includes(selectedPool.settleSymbol)) {
      currencies.push(selectedPool.settleSymbol);
    }
    return currencies;
  }, [selectedPool, selectedPerpetual]);

  const IconComponent = useMemo(
    () => getDynamicLogo(selectedCurrency.toLowerCase()) as TemporaryAnyT,
    [selectedCurrency]
  );

  return (
    <ButtonSelect
      id="order-size-token-select"
      selectedValue={
        <span className={styles.currencyLabel}>
          <Suspense fallback={null}>
            <IconComponent width={16} height={16} />
          </Suspense>
          <span>{selectedCurrency}</span>
        </span>
      }
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
    >
      {currencyOptions.map((option) => (
        <ButtonMenuItem
          key={option}
          option={<OptionTitle option={option} />}
          isActive={option === selectedCurrency}
          onClick={() => {
            setSelectedCurrency(option);
            setAnchorEl(null);
          }}
        />
      ))}
    </ButtonSelect>
  );
};
