import classnames from 'classnames';
import { type Dispatch, type PropsWithChildren, type ReactNode, type SetStateAction } from 'react';

import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Button, Menu, Typography } from '@mui/material';

import styles from './ButtonSelect.module.scss';

interface ButtonSelectPropsI extends PropsWithChildren {
  id: string;
  selectedValue: ReactNode;
  anchorEl: HTMLElement | null;
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  hasArrow?: boolean;
}

export const ButtonSelect = ({
  id,
  children,
  selectedValue,
  anchorEl,
  setAnchorEl,
  fullWidth,
  disabled,
  className,
  hasArrow = true,
}: ButtonSelectPropsI) => {
  const isOpen = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className={classnames(styles.button, className, { [styles.fullWidth]: fullWidth })}
        variant="primary"
        disabled={disabled}
      >
        <Typography variant="bodySmall" className={styles.selectedValue}>
          {selectedValue}
        </Typography>
        {hasArrow && (
          <div className={classnames(styles.arrowDropDown, { [styles.disabledHandle]: disabled })}>
            {isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
          </div>
        )}
      </Button>
      <Menu
        className={styles.menuHolder}
        anchorEl={anchorEl}
        id={id}
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
        {children}
      </Menu>
    </>
  );
};
