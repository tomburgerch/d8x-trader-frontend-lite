import { atom } from 'jotai';
import { TableTypeE } from 'types/enums';

type RefreshHandlerT = () => Promise<void> | void;

type RefreshHandlersT = Record<TableTypeE, RefreshHandlerT | null>;

const uninitializedState: RefreshHandlersT = {
  [TableTypeE.POSITIONS]: null,
  [TableTypeE.OPEN_ORDERS]: null,
  [TableTypeE.TRADE_HISTORY]: null,
  [TableTypeE.FUNDING]: null,
};

export const tableRefreshHandlersAtom = atom<RefreshHandlersT>(uninitializedState);
