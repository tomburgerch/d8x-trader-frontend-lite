// import classnames from 'classnames';
// import { type ReactNode, Suspense, useMemo } from 'react';
import { type ReactNode } from 'react';

// import { Button } from '@mui/material';

import { InputE } from 'components/responsive-input/enums';
import { ResponsiveInput } from 'components/responsive-input/ResponsiveInput';
import { genericMemo } from 'helpers/genericMemo';
// import { getDynamicLogo } from 'utils/getDynamicLogo';
// import type { TemporaryAnyT } from 'types/types';

import styles from './CustomPriceSelector.module.scss';

interface CustomPriceSelectorPropsI<T extends string> {
  id: string;
  label: ReactNode;
  options: T[];
  translationMap: Record<T, string>;
  handleInputPriceChange: (newValue: string) => void;
  validateInputPrice: () => void;
  handlePriceChange: (key: T) => void;
  selectedInputPrice: number | null | undefined;
  selectedPrice: T | null;
  currency?: string;
  stepSize: string;
  disabled?: boolean;
}

function CustomPriceSelectorComponent<T extends string>(props: CustomPriceSelectorPropsI<T>) {
  const {
    id,
    label,
    // options,
    // translationMap,
    // handlePriceChange,
    handleInputPriceChange,
    validateInputPrice,
    selectedInputPrice,
    // selectedPrice,
    // currency,
    stepSize,
    disabled = false,
  } = props;

  // const CurrencyIcon = useMemo(() => {
  //   if (!currency) {
  //     return null;
  //   }
  //   return getDynamicLogo(currency.toLowerCase()) as TemporaryAnyT;
  // }, [currency]);

  return (
    <div className={styles.root}>
      <div className={styles.labelHolder}>
        {label}
        <ResponsiveInput
          id={id}
          className={styles.responsiveInput}
          inputValue={selectedInputPrice != null ? selectedInputPrice : ''}
          placeholder="-"
          step={stepSize}
          min={0}
          setInputValue={handleInputPriceChange}
          handleInputBlur={validateInputPrice}
          disabled={disabled}
          type={InputE.Outlined}
        />
      </div>
      {/*<div className={styles.priceOptions}>
        {options.map((key) => (
          <Button
            key={key}
            variant="outlined"
            className={classnames({ [styles.selected]: key === selectedPrice })}
            onClick={() => handlePriceChange(key)}
            disabled={disabled}
          >
            {translationMap[key]}
          </Button>
        ))}
      </div>*/}
    </div>
  );
}

export const CustomPriceSelector = genericMemo(CustomPriceSelectorComponent);
