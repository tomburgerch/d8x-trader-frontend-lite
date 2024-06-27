import { type Address } from 'viem';

export interface CurrencyItemI {
  id: string;
  name: string;
  settleToken: string;
  contractAddress?: Address;
  isGasToken: boolean;
  isActiveToken: boolean;
}
