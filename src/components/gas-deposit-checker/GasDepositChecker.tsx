import { useSetAtom } from 'jotai';
import { type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { type Address } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { Button } from '@mui/material';

import { depositModalOpenAtom } from 'store/global-modals.store';
import { useUserWallet } from 'context/user-wallet-context/UserWalletContext';
import { MethodE } from 'types/enums';
import { isEnabledChain } from 'utils/isEnabledChain';

interface GasDepositCheckerPropsI extends PropsWithChildren {
  multiplier?: bigint;
  address?: Address;
  className?: string;
}

export const GasDepositChecker = ({ children, multiplier = 1n, address, className }: GasDepositCheckerPropsI) => {
  const { t } = useTranslation();

  const { chainId } = useAccount();
  const { data: gasTokenBalance } = useBalance({ address });

  const { hasEnoughGasForFee, isMultisigAddress, calculateGasForFee, isConnected } = useUserWallet();

  const setDepositModalOpen = useSetAtom(depositModalOpenAtom);

  const hasGas = gasTokenBalance
    ? gasTokenBalance.value > calculateGasForFee(MethodE.Interact, multiplier)
    : hasEnoughGasForFee(MethodE.Interact, multiplier);

  if (!isConnected || hasGas || isMultisigAddress || !isEnabledChain(chainId)) {
    return children;
  }

  return (
    <Button variant="buy" onClick={() => setDepositModalOpen(true)} className={className}>
      {t('common.deposit-gas')}
    </Button>
  );
};
