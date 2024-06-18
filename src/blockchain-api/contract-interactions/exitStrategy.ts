import { type Config } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import type { Dispatch, SetStateAction } from 'react';
import { createWalletClient, http } from 'viem';

import { HashZero } from 'appConstants';
import { generateStrategyAccount } from 'blockchain-api/generateStrategyAccount';
import { orderDigest } from 'network/network';
import { OrderSideE, OrderTypeE } from 'types/enums';
import { HedgeConfigI, OrderI } from 'types/types';

import { postOrder } from './postOrder';
import { fundStrategyWallet } from './fundStrategyWallet';

const DEADLINE = 60 * 60; // 1 hour from posting time

export async function exitStrategy(
  { chainId, walletClient, isMultisigAddress, symbol, traderAPI, limitPrice, strategyAddress }: HedgeConfigI,
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>,
  setCurrentPhaseKey: Dispatch<SetStateAction<string>>
) {
  if (!walletClient.account?.address) {
    throw new Error('Account not connected');
  }

  const hedgeClient = await generateStrategyAccount(walletClient).then((account) =>
    createWalletClient({
      account,
      chain: walletClient.chain,
      transport: http(),
    })
  );

  const position = await traderAPI
    .positionRisk(hedgeClient.account.address, symbol)
    .then((pos) => pos[0])
    .catch(() => undefined);
  const marginTokenAddr = traderAPI.getMarginTokenFromSymbol(symbol);
  const marginTokenDec = traderAPI.getMarginTokenDecimalsFromSymbol(symbol);
  if (!position || !marginTokenAddr || !marginTokenDec) {
    throw new Error(`No hedging strategy available for symbol ${symbol} on chain ID ${chainId}`);
  }
  if (position.positionNotionalBaseCCY === 0 || position.side !== OrderSideE.Sell) {
    throw new Error(
      `Invalid hedging position for trader ${walletClient.account?.address} and symbol ${symbol} on chain ID ${chainId}`
    );
  }
  const order: OrderI = {
    symbol: symbol,
    side: OrderSideE.Buy,
    type: OrderTypeE.Market,
    quantity: position.positionNotionalBaseCCY,
    limitPrice: limitPrice,
    reduceOnly: true,
    executionTimestamp: Math.floor(Date.now() / 1000 - 10 - 200),
    deadline: Math.floor(Date.now() / 1000 + DEADLINE),
  };
  const strategyAddr = strategyAddress ?? hedgeClient.account.address;
  const isDelegated = (await traderAPI
    .getReadOnlyProxyInstance()
    .isDelegate(strategyAddr, walletClient.account.address)) as boolean;
  const { data } = await orderDigest(chainId, [order], hedgeClient.account.address);

  if (isDelegated) {
    setCurrentPhaseKey('pages.strategies.exit.phases.posting');
    return postOrder(walletClient, [HashZero], data);
  } else {
    await fundStrategyWallet({ walletClient, strategyAddress: strategyAddr, isMultisigAddress }, sendTransactionAsync);
    setCurrentPhaseKey('pages.strategies.exit.phases.posting');
    return postOrder(hedgeClient, [HashZero], data);
  }
}
