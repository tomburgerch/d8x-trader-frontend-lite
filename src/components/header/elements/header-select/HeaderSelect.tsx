import type { HTMLAttributes, JSXElementConstructor, ReactNode, SyntheticEvent } from 'react';

import { Box, FormControl, TextField, Autocomplete, PopperProps } from '@mui/material';

import { ReactComponent as ArrowDropIcon } from 'assets/icons/arrowDropIcon.svg';
import { genericMemo } from 'helpers/genericMemo';

import styles from './HeaderSelect.module.scss';

interface HeaderSelectI<T> {
  id: string;
  label: string;
  items: T[];
  width?: string | number;
  PaperComponent?: JSXElementConstructor<HTMLAttributes<HTMLElement>>;
  PopperComponent?: JSXElementConstructor<PopperProps>;
  onChange: (event: SyntheticEvent, value: T, reason: string) => void;
  value: T | null;
  getOptionLabel?: (option: T) => string;
  renderOption?: (props: HTMLAttributes<HTMLLIElement>, option: T) => ReactNode;
}

function HeaderSelectComponent<T>(props: HeaderSelectI<T>) {
  if (!props.value) {
    return null;
  }

  return (
    <Box className={styles.root}>
      <FormControl fullWidth>
        <Autocomplete
          id={props.id}
          sx={{ width: props.width ?? 300 }}
          options={props.items}
          autoHighlight
          classes={{
            paper: styles.paper,
          }}
          className={styles.autocomplete}
          disableClearable
          value={props.value}
          // freeSolo={true}
          onChange={props.onChange}
          getOptionLabel={props.getOptionLabel}
          popupIcon={<ArrowDropIcon width={24} height={24} />}
          PaperComponent={props.PaperComponent}
          PopperComponent={props.PopperComponent}
          renderOption={props.renderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
              variant="filled"
            />
          )}
        />
      </FormControl>
    </Box>
  );
}

export const HeaderSelect = genericMemo(HeaderSelectComponent);
