import type { HTMLAttributes, JSXElementConstructor, ReactNode, SyntheticEvent } from 'react';

import { Box, FormControl, TextField, Autocomplete } from '@mui/material';

import { ReactComponent as ArrowDropIcon } from 'assets/icons/arrowDropIcon.svg';
import { genericMemo } from 'helpers/genericMemo';

interface HeaderSelectI<T> {
  id: string;
  label: string;
  items: T[];
  width?: string | number;
  PaperComponent?: JSXElementConstructor<HTMLAttributes<HTMLElement>>;
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
    <Box sx={{ mx: 5 }}>
      <FormControl fullWidth>
        <Autocomplete
          id={props.id}
          sx={{ width: props.width ?? 300 }}
          options={props.items}
          autoHighlight
          disableClearable
          value={props.value}
          onChange={props.onChange}
          getOptionLabel={props.getOptionLabel}
          popupIcon={<ArrowDropIcon width={20} />}
          PaperComponent={props.PaperComponent}
          renderOption={props.renderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
              variant="standard"
            />
          )}
        />
      </FormControl>
    </Box>
  );
}

export const HeaderSelect = genericMemo(HeaderSelectComponent);
