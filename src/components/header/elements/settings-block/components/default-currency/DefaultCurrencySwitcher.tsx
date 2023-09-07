import { useAtom } from 'jotai';
import { useState } from 'react';

import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, Menu } from '@mui/material';

import { defaultCurrencyAtom } from 'store/app.store';
import { DefaultCurrencyE } from 'types/enums';

import { DefaultCurrencyMenuItem } from './components/DefaultCurrencyMenuItem';

import { useTranslation } from 'react-i18next';
import styles from './DefaultCurrencySwitcher.module.scss';

const optionsArray = Object.values(DefaultCurrencyE);

export const DefaultCurrencySwitcher = () => {
  const { t } = useTranslation();
  const [defaultCurrency, setDefaultCurrency] = useAtom(defaultCurrencyAtom);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isOpen = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className={styles.languageButton}
        variant="outlined"
      >
        <div className={styles.selectedLanguage}>
          {t(`common.settings.ui-settings.default-currency.${defaultCurrency}`)}
        </div>
        <div className={styles.arrowDropDown}>{isOpen ? <ArrowDropUp /> : <ArrowDropDown />}</div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="dropdown-language"
        open={isOpen}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {optionsArray.map((option) => (
          <DefaultCurrencyMenuItem
            key={option}
            option={t(`common.settings.ui-settings.default-currency.${option}`)}
            isActive={option === defaultCurrency}
            onClick={() => {
              setDefaultCurrency(option);
              handleClose();
            }}
          />
        ))}
      </Menu>
    </>
  );
};
