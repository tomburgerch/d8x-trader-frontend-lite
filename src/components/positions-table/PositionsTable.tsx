import classnames from 'classnames';
import { HashZero } from '@ethersproject/constants';
import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useSigner } from 'wagmi';

import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Link,
  OutlinedInput,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { ReactComponent as RefreshIcon } from 'assets/icons/refreshIcon.svg';
import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { deposit } from 'blockchain-api/contract-interactions/deposit';
import { postOrder } from 'blockchain-api/contract-interactions/postOrder';
import { withdraw } from 'blockchain-api/contract-interactions/withdraw';
import { Dialog } from 'components/dialog/Dialog';
import { EmptyTableRow } from 'components/empty-table-row/EmptyTableRow';
import { SidesRow } from 'components/sides-row/SidesRow';
import { ToastContent } from 'components/toast-content/ToastContent';
import { createSymbol } from 'helpers/createSymbol';
import { parseSymbol } from 'helpers/parseSymbol';
import { useDebounce } from 'helpers/useDebounce';
import {
  getAddCollateral,
  getAvailableMargin,
  getPositionRisk,
  getRemoveCollateral,
  orderDigest,
  positionRiskOnCollateralAction,
} from 'network/network';
import {
  perpetualStatisticsAtom,
  positionsAtom,
  proxyAddrAtom,
  removePositionAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { AlignE, OrderTypeE } from 'types/enums';
import type { MarginAccountI, OrderI, TableHeaderI } from 'types/types';
import { formatNumber } from 'utils/formatNumber';
import { formatToCurrency } from 'utils/formatToCurrency';

import { ModifyTypeE, ModifyTypeSelector } from './elements/modify-type-selector/ModifyTypeSelector';
import { PositionBlock } from './elements/position-block/PositionBlock';
import { PositionRow } from './elements/PositionRow';

import styles from './PositionsTable.module.scss';

export const PositionsTable = memo(() => {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [proxyAddr] = useAtom(proxyAddrAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, removePosition] = useAtom(removePositionAtom);

  const traderAPIRef = useRef(traderAPI);
  const updatedPositionsRef = useRef(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const chainId = useChainId();
  const { address, isConnected, isDisconnected } = useAccount();
  const { data: signer } = useSigner();

  const [modifyType, setModifyType] = useState(ModifyTypeE.Close);
  const [closePositionChecked, setClosePositionChecked] = useState(false);
  const [addCollateral, setAddCollateral] = useState(0);
  const [removeCollateral, setRemoveCollateral] = useState(0);
  const [isModifyModalOpen, setModifyModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<MarginAccountI | null>();
  const [newPositionRisk, setNewPositionRisk] = useState<MarginAccountI | null>();
  const [requestSent, setRequestSent] = useState(false);
  const [maxCollateral, setMaxCollateral] = useState<number>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [positionRiskSent, setPositionRiskSent] = useState(false);

  const handlePositionModify = useCallback((position: MarginAccountI) => {
    setModifyModalOpen(true);
    setSelectedPosition(position);
    setClosePositionChecked(false);
    setAddCollateral(0);
    setRemoveCollateral(0);
    setModifyType(ModifyTypeE.Close);
  }, []);

  const closeModifyModal = useCallback(() => {
    setModifyModalOpen(false);
    setSelectedPosition(null);
  }, []);

  const handleModifyPositionConfirm = useCallback(() => {
    if (!selectedPosition || !address || !selectedPool || !proxyAddr || !signer) {
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

      orderDigest(chainId, [closeOrder], address)
        .then((data) => {
          if (data.data.digests.length > 0) {
            approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr, 0)
              .then((res) => {
                if (res?.hash) {
                  console.log(res.hash);
                }
                const signatures = new Array<string>(data.data.digests.length).fill(HashZero);
                postOrder(signer, signatures, data.data)
                  .then((tx) => {
                    setRequestSent(false);
                    setModifyModalOpen(false);
                    setSelectedPosition(null);
                    console.log(`closePosition tx hash: ${tx.hash}`);
                    toast.success(<ToastContent title="Order close processed" bodyLines={[]} />);
                  })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .catch((error: any) => {
                    console.error(error);
                    setRequestSent(false);
                  });
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .catch((error: any) => {
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
      getAddCollateral(chainId, traderAPIRef.current, selectedPosition.symbol, addCollateral)
        .then(({ data }) => {
          approveMarginToken(signer, selectedPool.marginTokenAddr, proxyAddr, addCollateral)
            .then((res) => {
              if (res?.hash) {
                console.log(res.hash);
              }
              deposit(signer, data)
                .then((tx) => {
                  setRequestSent(false);
                  setModifyModalOpen(false);
                  setSelectedPosition(null);
                  console.log(`addCollateral tx hash: ${tx.hash}`);
                  toast.success(<ToastContent title="Collateral add processed" bodyLines={[]} />);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .catch((error: any) => {
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
    } else if (modifyType === ModifyTypeE.Remove) {
      if (!maxCollateral || maxCollateral < removeCollateral) {
        return;
      }

      setRequestSent(true);
      getRemoveCollateral(chainId, traderAPIRef.current, selectedPosition.symbol, removeCollateral)
        .then(({ data }) => {
          withdraw(signer, data)
            .then((tx) => {
              setRequestSent(false);
              setModifyModalOpen(false);
              setSelectedPosition(null);
              console.log(`removeCollaeral tx hash: ${tx.hash}`);
              toast.success(<ToastContent title="Collateral remove processed" bodyLines={[]} />);
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
    chainId,
    address,
    selectedPool,
    proxyAddr,
    addCollateral,
    removeCollateral,
    maxCollateral,
    signer,
  ]);

  const clearPositions = useCallback(() => {
    if (selectedPool?.perpetuals) {
      selectedPool.perpetuals.forEach(({ baseCurrency, quoteCurrency }) => {
        const symbol = createSymbol({
          baseCurrency,
          quoteCurrency,
          poolSymbol: selectedPool.poolSymbol,
        });
        removePosition(symbol);
      });
    }
  }, [selectedPool, removePosition]);

  useEffect(() => {
    if (isDisconnected) {
      clearPositions();
    }
  }, [isDisconnected, clearPositions]);

  useEffect(() => {
    if (!address || !selectedPosition) {
      return;
    }

    if (modifyType === ModifyTypeE.Remove) {
      getAvailableMargin(chainId, traderAPIRef.current, selectedPosition.symbol, address).then(({ data }) => {
        setMaxCollateral(data.amount < 0 ? 0 : data.amount);
      });
    } else {
      setMaxCollateral(undefined);
    }
  }, [modifyType, chainId, address, selectedPosition]);

  useEffect(() => {
    setNewPositionRisk(null);
  }, [modifyType, addCollateral, removeCollateral]);

  const handleAddCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddCollateral(+event.target.value);
  }, []);

  const handleRemoveCollateralCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRemoveCollateral(+event.target.value);
  }, []);

  const refreshPositions = useCallback(() => {
    if (selectedPool?.perpetuals && address && isConnected && !positionRiskSent) {
      setPositionRiskSent(true);
      selectedPool.perpetuals.forEach(({ baseCurrency, quoteCurrency }) => {
        const symbol = createSymbol({
          baseCurrency,
          quoteCurrency,
          poolSymbol: selectedPool.poolSymbol,
        });
        getPositionRisk(chainId, traderAPIRef.current, symbol, address, Date.now()).then(({ data }) => {
          setPositions(data);
        });
      });
      setPositionRiskSent(false);
    }
  }, [chainId, address, isConnected, selectedPool, positionRiskSent, setPositions]);

  useEffect(() => {
    if (!updatedPositionsRef.current) {
      refreshPositions();
      updatedPositionsRef.current = true;
    }
  }, [refreshPositions]);

  const debouncedAddCollateral = useDebounce(addCollateral, 500);

  const debouncedRemoveCollateral = useDebounce(removeCollateral, 500);

  const handleRefreshPositionRisk = useCallback(() => {
    if (!selectedPosition || !address || modifyType === ModifyTypeE.Close) {
      return;
    }

    if (modifyType === ModifyTypeE.Add && debouncedAddCollateral === 0) {
      return;
    }

    if (modifyType === ModifyTypeE.Remove && debouncedRemoveCollateral === 0) {
      return;
    }

    positionRiskOnCollateralAction(
      chainId,
      traderAPIRef.current,
      address,
      modifyType === ModifyTypeE.Add ? debouncedAddCollateral : -debouncedRemoveCollateral,
      selectedPosition
    ).then((data) => {
      setNewPositionRisk(data.data.newPositionRisk);
      setMaxCollateral(data.data.availableMargin);
    });
  }, [chainId, address, selectedPosition, modifyType, debouncedAddCollateral, debouncedRemoveCollateral]);

  useEffect(() => {
    return handleRefreshPositionRisk();
  }, [debouncedAddCollateral, debouncedRemoveCollateral, handleRefreshPositionRisk]);

  const handleMaxCollateral = useCallback(() => {
    if (maxCollateral) {
      setRemoveCollateral(maxCollateral);
    }
  }, [maxCollateral]);

  const positionsHeaders: TableHeaderI[] = useMemo(
    () => [
      { label: 'Symbol', align: AlignE.Left },
      { label: 'Pos. size', align: AlignE.Right },
      { label: 'Side', align: AlignE.Left },
      { label: 'Entry Price', align: AlignE.Right },
      { label: 'Liq. price', align: AlignE.Right },
      { label: `Margin (${perpetualStatistics?.poolName})`, align: AlignE.Right },
      { label: 'Unr. PnL', align: AlignE.Right },
      { label: <RefreshIcon onClick={refreshPositions} className={styles.actionIcon} />, align: AlignE.Center },
    ],
    [perpetualStatistics, refreshPositions]
  );

  const isConfirmButtonDisabled = useMemo(() => {
    switch (modifyType) {
      case ModifyTypeE.Close:
        return !closePositionChecked;
      case ModifyTypeE.Add:
        return addCollateral <= 0 || addCollateral < 0;
      case ModifyTypeE.Remove:
        return removeCollateral <= 0 || maxCollateral === undefined || maxCollateral < removeCollateral;
      default:
        return false;
    }
  }, [modifyType, closePositionChecked, addCollateral, removeCollateral, maxCollateral]);

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

    if (modifyType === ModifyTypeE.Add || modifyType === ModifyTypeE.Remove) {
      if (!newPositionRisk) {
        return '-';
      } else {
        return `${formatNumber(newPositionRisk.leverage)}x`;
      }
    }

    return `${formatNumber(selectedPosition.leverage)}x`;
  }, [selectedPosition, newPositionRisk, modifyType, closePositionChecked]);

  const calculatedLiqPrice = useMemo(() => {
    if (!selectedPosition || selectedPosition.liquidationPrice[0] <= 0) {
      return '-';
    }

    if (modifyType === ModifyTypeE.Close && closePositionChecked) {
      return '-';
    }

    if (modifyType === ModifyTypeE.Add || modifyType === ModifyTypeE.Remove) {
      if (!newPositionRisk || newPositionRisk.liquidationPrice[0] <= 0) {
        return '-';
      } else {
        return formatToCurrency(newPositionRisk.liquidationPrice[0], parsedSymbol?.quoteCurrency);
      }
    }

    return formatToCurrency(selectedPosition.liquidationPrice[0], parsedSymbol?.quoteCurrency);
  }, [selectedPosition, newPositionRisk, modifyType, closePositionChecked, parsedSymbol]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }, []);

  const isRefreshActive = useMemo(() => {
    if (!selectedPosition || !address || modifyType === ModifyTypeE.Close) {
      return false;
    }

    if (newPositionRisk) {
      return false;
    }

    if (modifyType === ModifyTypeE.Add && addCollateral > 0) {
      return true;
    }

    return modifyType === ModifyTypeE.Remove && removeCollateral > 0;
  }, [selectedPosition, address, modifyType, addCollateral, removeCollateral, newPositionRisk]);

  return (
    <>
      {!isSmallScreen && (
        <TableContainer className={styles.root}>
          <MuiTable>
            <TableHead className={styles.tableHead}>
              <TableRow>
                {positionsHeaders.map((header) => (
                  <TableCell key={header.label.toString()} align={header.align}>
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
      )}
      {isSmallScreen && (
        <Box>
          <Box className={styles.refreshHolder}>
            <RefreshIcon onClick={refreshPositions} className={styles.actionIcon} />
          </Box>
          <Box>
            {positions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((position) => (
              <PositionBlock
                key={position.symbol}
                headers={positionsHeaders}
                position={position}
                handlePositionModify={handlePositionModify}
              />
            ))}
            {positions.length === 0 && <Box className={styles.noData}>No open positions</Box>}
          </Box>
        </Box>
      )}
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
                  <FormControl variant="outlined">
                    <OutlinedInput
                      id="remove-collateral"
                      endAdornment={
                        <InputAdornment position="end">
                          <Typography variant="adornment">{perpetualStatistics?.poolName}</Typography>
                        </InputAdornment>
                      }
                      type="number"
                      inputProps={{ step: 0.1, min: 0, max: maxCollateral }}
                      value={removeCollateral}
                      onChange={handleRemoveCollateralCapture}
                    />
                    {maxCollateral && (
                      <Typography className={styles.helperText} variant="bodySmall">
                        Max: <Link onClick={handleMaxCollateral}>{formatNumber(maxCollateral)}</Link>
                      </Typography>
                    )}
                  </FormControl>
                }
              />
            )}
          </Box>
          <Box className={styles.newPositionHeader}>
            <Typography variant="bodyMedium" className={styles.centered}>
              New position details
            </Typography>
          </Box>
          {modifyType !== ModifyTypeE.Close && (
            <Box className={styles.refreshHolder}>
              <RefreshIcon
                onClick={handleRefreshPositionRisk}
                className={classnames(styles.actionIcon, { [styles.disabled]: !isRefreshActive })}
              />
            </Box>
          )}
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
