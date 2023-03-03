import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  OutlinedInput,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { perpetualStatisticsAtom, positionsAtom } from 'store/pools.store';

import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { SidesRow } from 'components/sides-row/SidesRow';

import { ModifyTypeE, ModifyTypeSelector } from './elements/modify-type-selector/ModifyTypeSelector';
import { PositionRow } from './elements/PositionRow';

import styles from './PositionsTable.module.scss';

export const PositionsTable = memo(() => {
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [positions] = useAtom(positionsAtom);

  const [modifyType, setModifyType] = useState(ModifyTypeE.Close);
  const [closePositionChecked, setClosePositionChecked] = useState(false);
  const [addCollateral, setAddCollateral] = useState(0);
  const [removeCollateral, setRemoveCollateral] = useState(0);
  const [isModifyModalOpen, setModifyModalOpen] = useState(false);
  const [, /*selectedPositionSymbol*/ setSelectedPositionSymbol] = useState('');

  const handlePositionModify = useCallback((symbol: string) => {
    setModifyModalOpen(true);
    setSelectedPositionSymbol(symbol);
  }, []);

  const closeModifyModal = useCallback(() => {
    setModifyModalOpen(false);
    setSelectedPositionSymbol('');
  }, []);

  const handleModifyPositionConfirm = useCallback(() => {
    // TODO: ...
    setModifyModalOpen(false);
    setSelectedPositionSymbol('');
  }, []);

  const handleAddCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddCollateral(+event.target.value);
  }, []);

  const handleRemoveCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRemoveCollateral(+event.target.value);
  }, []);

  const positionsHeaders: Array<{ label: string; align: 'left' | 'right' }> = useMemo(
    () => [
      { label: 'Symbol', align: 'left' },
      { label: 'Pos. size', align: 'right' },
      { label: 'Side', align: 'left' },
      { label: 'Entry Price', align: 'right' },
      { label: 'Liq. price', align: 'right' },
      { label: `Margin (${perpetualStatistics?.poolName})`, align: 'right' },
      { label: 'Unr. PnL', align: 'right' },
      { label: '', align: 'left' },
    ],
    [perpetualStatistics]
  );

  const isConfirmButtonDisabled = useMemo(() => {
    switch (modifyType) {
      case ModifyTypeE.Close:
        return !closePositionChecked;
      case ModifyTypeE.Add:
        return addCollateral === 0;
      case ModifyTypeE.Remove:
        return removeCollateral === 0;
      default:
        return false;
    }
  }, [modifyType, closePositionChecked, addCollateral, removeCollateral]);

  return (
    <>
      <TableContainer className={styles.root}>
        <MuiTable>
          <TableHead className={styles.tableHead}>
            <TableRow>
              {positionsHeaders.map((header) => (
                <TableCell key={header.label} align={header.align}>
                  <Typography variant="bodySmall">{header.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={styles.tableBody}>
            {positions.map((position) => (
              <PositionRow key={position.symbol} position={position} handlePositionModify={handlePositionModify} />
            ))}
            {positions.length === 0 && <EmptyTableRow colSpan={positionsHeaders.length} text="No open positions" />}
          </TableBody>
        </MuiTable>
      </TableContainer>
      <Dialog open={isModifyModalOpen} className={styles.dialog}>
        <DialogTitle>Modify Position</DialogTitle>
        <DialogContent>
          <ModifyTypeSelector modifyType={modifyType} setModifyType={setModifyType} />
          <Box className={styles.newPositionHeader}>
            {modifyType === ModifyTypeE.Close && (
              <FormControlLabel
                id="confirm-close"
                value="true"
                defaultChecked={closePositionChecked}
                onChange={(_event, checked) => setClosePositionChecked(checked)}
                control={closePositionChecked ? <Checkbox checked={true} /> : <Checkbox checked={false} />}
                label="Close position"
                labelPlacement="start"
              />
            )}
            {modifyType === ModifyTypeE.Add && (
              <SidesRow
                leftSide="Add collateral"
                rightSide={
                  <OutlinedInput
                    id="add-collateral"
                    endAdornment={<InputAdornment position="end">{perpetualStatistics?.poolName}</InputAdornment>}
                    type="number"
                    inputProps={{ step: 0.1, min: 0 }}
                    defaultValue={addCollateral}
                    onChange={handleAddCollateralCapture}
                  />
                }
              />
            )}
            {modifyType === ModifyTypeE.Remove && (
              <SidesRow
                leftSide="Remove collateral"
                rightSide={
                  <OutlinedInput
                    id="remove-collateral"
                    endAdornment={<InputAdornment position="end">{perpetualStatistics?.poolName}</InputAdornment>}
                    type="number"
                    inputProps={{ step: 0.1, min: 0 }}
                    defaultValue={removeCollateral}
                    onChange={handleRemoveCollateralCapture}
                  />
                }
              />
            )}
          </Box>
          <Box className={styles.newPositionHeader}>
            <Typography variant="bodyMedium" className={styles.centered}>
              New position details
            </Typography>
          </Box>
          <Box className={styles.newPositionDetails}>
            <SidesRow leftSide="Position size:" rightSide={`0 ${perpetualStatistics?.baseCurrency}`} />
            <SidesRow leftSide="Margin:" rightSide={`0 ${perpetualStatistics?.poolName}`} />
            <SidesRow leftSide="Leverage:" rightSide={'-'} />
            <SidesRow leftSide="Liquidation price:" rightSide={'-'} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModifyModal} variant="secondaryAction">
            Cancel
          </Button>
          <Button onClick={handleModifyPositionConfirm} variant="action" disabled={isConfirmButtonDisabled}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
