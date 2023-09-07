import type { Dispatch, SetStateAction } from 'react';

import { Box, TableCell, TableSortLabel, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import { genericMemo } from 'helpers/genericMemo';
import { SortOrderE } from 'types/enums';
import type { TableHeaderI } from 'types/types';

interface SortableHeaderPropsI<T> {
  headers: TableHeaderI<T>[];
  order: SortOrderE;
  orderBy: keyof T;
  setOrder: Dispatch<SetStateAction<SortOrderE>>;
  setOrderBy: Dispatch<SetStateAction<keyof T>>;
}

function SortableHeadersComponent<T>({ headers, orderBy, order, setOrder, setOrderBy }: SortableHeaderPropsI<T>) {
  const handleRequestSort = (event: MouseEvent<unknown>, property: keyof T) => {
    const isAsc = orderBy === property && order === SortOrderE.Asc;
    setOrder(isAsc ? SortOrderE.Desc : SortOrderE.Asc);
    setOrderBy(property);
  };

  const createSortHandler = (property: keyof T) => (event: MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  return headers.map((header) => (
    <TableCell key={header.id} align={header.align} sortDirection={orderBy === header.id ? order : false}>
      <TableSortLabel
        active={orderBy === header.id}
        direction={orderBy === header.id ? order : 'asc'}
        onClick={createSortHandler(header.id)}
      >
        <Typography variant="bodySmall">{header.label}</Typography>
        {orderBy === header.id ? (
          <Box component="span" sx={visuallyHidden}>
            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
          </Box>
        ) : null}
      </TableSortLabel>
    </TableCell>
  ));
}

export const SortableHeaders = genericMemo(SortableHeadersComponent);
