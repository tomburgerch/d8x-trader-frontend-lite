import { useAtom } from 'jotai';
import { useState } from 'react';

import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, Menu } from '@mui/material';

import { orderBlockPositionAtom } from 'store/app.store';
import { OrderBlockPositionE } from 'types/enums';

import styles from './OrderBlockSwitcher.module.scss';

import { OrderBlockMenuItem } from './components/OrderBlockMenuItem';
import { useTranslation } from 'react-i18next';

const optionsArray = Object.values(OrderBlockPositionE);

export const OrderBlockSwitcher = () => {
  const { t } = useTranslation();
  const [orderBlockPosition, setOrderBlockPosition] = useAtom(orderBlockPositionAtom);

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
          {t(`common.settings.ui-settings.order-block.${orderBlockPosition}`)}
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
          <OrderBlockMenuItem
            key={option}
            option={t(`common.settings.ui-settings.order-block.${option}`)}
            isActive={option === orderBlockPosition}
            onClick={() => {
              setOrderBlockPosition(option);
              handleClose();
            }}
          />
        ))}
      </Menu>
    </>
  );
};
