import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

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
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

import { perpetualStatisticsAtom, positionsAtom, proxyAddrAtom, selectedPoolAtom } from 'store/pools.store';

import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { deposit } from 'blockchain-api/contract-interactions/deposit';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { withdraw } from 'blockchain-api/contract-interactions/withdraw';
import { getSigner } from 'blockchain-api/getSigner';
import { signMessage } from 'blockchain-api/signMessage';
import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { SidesRow } from 'components/sides-row/SidesRow';
import { parseSymbol } from 'helpers/parseSymbol';
import { getAddCollateral, getAvailableMargin, getRemoveCollateral, orderDigest } from 'network/network';
import { formatToCurrency } from 'utils/formatToCurrency';
import { AlignE, OrderTypeE } from 'types/enums';
import type { MarginAccountI, OrderI } from 'types/types';
import type { TableHeaderI } from 'types/types';

import { ModifyTypeE, ModifyTypeSelector } from './elements/modify-type-selector/ModifyTypeSelector';
import { PositionRow } from './elements/PositionRow';

import styles from './PositionsTable.module.scss';

export const PositionsTable = memo(() => {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [positions] = useAtom(positionsAtom);

  const { address } = useAccount();

  const [modifyType, setModifyType] = useState(ModifyTypeE.Close);
  const [closePositionChecked, setClosePositionChecked] = useState(false);
  const [addCollateral, setAddCollateral] = useState(0);
  const [removeCollateral, setRemoveCollateral] = useState(0);
  const [isModifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<MarginAccountI | null>();
  const [requestSent, setRequestSent] = useState(false);
  const [maxCollateral, setMaxCollateral] = useState<number>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handlePositionModify = useCallback((position: MarginAccountI) => {
    setModifyModalOpen(true);
    setSelectedPosition(position);
  }, []);

  const closeModifyModal = useCallback(() => {
    setModifyModalOpen(false);
    setSelectedPosition(null);
  }, []);

  const handleModifyPositionConfirm = useCallback(() => {
    if (!selectedPosition || !address || !selectedPool || !proxyAddr) {
      return;
    }

    if (requestSent) {
      return;
    }

    if (modifyType === ModifyTypeE.Close) {
      setRequestSent(true);

      const closeOrder: OrderI = {
        symbol: selectedPosition.symbol,
        side: selectedPosition.side === 'BUY' ? 'SELL' : 'BUY',
        type: OrderTypeE.Market.toUpperCase(),
        quantity: selectedPosition.positionNotionalBaseCCY,
        timestamp: Math.floor(Date.now() / 1000),
        reduceOnly: true,
        leverage: selectedPosition.leverage,
      };

      orderDigest([closeOrder], address)
        .then((data) => {
          if (data.data.digests.length > 0) {
            const signer = getSigner();
            signMessage(signer, data.data.digests)
              .then((signatures) => {
                approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr)
                  .then(() => {
                    postOrder(signer, signatures, data.data)
                      .then(() => {
                        setRequestSent(false);
                        setModifyModalOpen(false);
                        setSelectedPosition(null);
                      })
                      .catch((error) => {
                        console.error(error);
                        setRequestSent(false);
                      });
                  })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .catch((error: any) => {
                    console.error(error);
                    setRequestSent(false);
                  });
              })
              .catch((error) => {
                console.error(error);
                setRequestSent(false);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          setRequestSent(false);
        });
    } else if (modifyType === ModifyTypeE.Add) {
      setRequestSent(true);
      getAddCollateral(selectedPosition.symbol, addCollateral)
        .then(({ data }) => {
          const signer = getSigner();
          deposit(signer, data)
            .then(() => {
              setRequestSent(false);
              setModifyModalOpen(false);
              setSelectedPosition(null);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
              console.error(error);
              setRequestSent(false);
            });
        })
        .catch((error) => {
          console.error(error);
          setRequestSent(false);
        });
    } else if (modifyType === ModifyTypeE.Remove) {
      if (!maxCollateral || maxCollateral < removeCollateral) {
        return;
      }

      setRequestSent(true);
      getRemoveCollateral(selectedPosition.symbol, removeCollateral)
        .then(({ data }) => {
          const signer = getSigner();
          withdraw(signer, data)
            .then(() => {
              setRequestSent(false);
              setModifyModalOpen(false);
              setSelectedPosition(null);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((error: any) => {
              console.error(error);
              setRequestSent(false);
            });
        })
        .catch((error) => {
          console.error(error);
          setRequestSent(false);
        });
    }
  }, [
    modifyType,
    selectedPosition,
    requestSent,
    address,
    selectedPool,
    proxyAddr,
    addCollateral,
    removeCollateral,
    maxCollateral,
  ]);

  useEffect(() => {
    if (!address || !selectedPosition) {
      return;
    }

    if (modifyType === ModifyTypeE.Remove) {
      getAvailableMargin(selectedPosition.symbol, address).then(({ data }) => {
        setMaxCollateral(data.amount);
      });
    } else {
      setMaxCollateral(undefined);
    }
  }, [modifyType, address, selectedPosition]);

  const handleAddCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddCollateral(+event.target.value);
  }, []);

  const handleRemoveCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRemoveCollateral(+event.target.value);
  }, []);

  const positionsHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: 'Symbol', align: AlignE.Left },
      { label: 'Pos. size', align: AlignE.Right },
      { label: 'Side', align: AlignE.Left },
      { label: 'Entry Price', align: AlignE.Right },
      { label: 'Liq. price', align: AlignE.Right },
      { label: `Margin (${perpetualStatistics?.poolName})`, align: AlignE.Right },
      { label: 'Unr. PnL', align: AlignE.Right },
      { label: '', align: AlignE.Left },
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

  const parsedSymbol = useMemo(() => {
    if (selectedPosition) {
      return parseSymbol(selectedPosition.symbol);
    }
    return null;
  }, [selectedPosition]);

  const calculatedPositionSize = useMemo(() => {
    let size;
    if (selectedPosition) {
      switch (modifyType) {
        case ModifyTypeE.Close:
          size = closePositionChecked ? 0 : selectedPosition.positionNotionalBaseCCY;
          break;
        default:
          size = selectedPosition.positionNotionalBaseCCY;
      }
    } else {
      size = 0;
    }
    return formatToCurrency(size, parsedSymbol?.baseCurrency);
  }, [selectedPosition, modifyType, closePositionChecked, parsedSymbol]);

  const calculatedMargin = useMemo(() => {
    let margin;
    if (selectedPosition) {
      switch (modifyType) {
        case ModifyTypeE.Close:
          margin = closePositionChecked ? 0 : selectedPosition.collateralCC;
          break;
        case ModifyTypeE.Add:
          margin = selectedPosition.collateralCC + addCollateral;
          break;
        case ModifyTypeE.Remove:
          margin = selectedPosition.collateralCC - removeCollateral;
          break;
        default:
          margin = selectedPosition.collateralCC;
      }
    } else {
      margin = 0;
    }
    return formatToCurrency(margin, parsedSymbol?.poolSymbol);
  }, [selectedPosition, modifyType, closePositionChecked, parsedSymbol, addCollateral, removeCollateral]);

  const calculatedLeverage = useMemo(() => {
    if (!selectedPosition) {
      return '-';
    }

    if (modifyType === ModifyTypeE.Close && closePositionChecked) {
      return '-';
    }

    return `${selectedPosition.leverage.toFixed(2)}x`;
  }, [selectedPosition, modifyType, closePositionChecked]);

  const calculatedLiqPrice = useMemo(() => {
    if (!selectedPosition || selectedPosition.liquidationPrice[0] < 0) {
      return '-';
    }

    if (modifyType === ModifyTypeE.Close && closePositionChecked) {
      return '-';
    }

    return formatToCurrency(selectedPosition.liquidationPrice[0], parsedSymbol?.quoteCurrency);
  }, [selectedPosition, modifyType, closePositionChecked, parsedSymbol]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

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
            {positions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((position) => (
              <PositionRow key={position.symbol} position={position} handlePositionModify={handlePositionModify} />
            ))}
            {positions.length === 0 && <EmptyTableRow colSpan={positionsHeaders.length} text="No open positions" />}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {positions.length > 5 && (
        <Box className={styles.paginationHolder}>
          <TablePagination
            align="center"
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={positions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}
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
                    endAdornment={
                      <InputAdornment position="end">
                        <Typography variant="adornment">{perpetualStatistics?.poolName}</Typography>
                      </InputAdornment>
                    }
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
                    endAdornment={
                      <InputAdornment position="end">
                        <Typography variant="adornment">{perpetualStatistics?.poolName}</Typography>
                      </InputAdornment>
                    }
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: maxCollateral }}
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
            <SidesRow leftSide="Position size:" rightSide={calculatedPositionSize} />
            <SidesRow leftSide="Margin:" rightSide={calculatedMargin} />
            <SidesRow leftSide="Leverage:" rightSide={calculatedLeverage} />
            <SidesRow leftSide="Liquidation price:" rightSide={calculatedLiqPrice} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModifyModal} variant="secondary" size="small">
            Cancel
          </Button>
          <Button
            onClick={handleModifyPositionConfirm}
            variant="primary"
            size="small"
            disabled={isConfirmButtonDisabled}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
