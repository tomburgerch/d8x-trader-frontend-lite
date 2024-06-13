import { getMaxSignedPositionSize } from '@d8x/perpetuals-sdk';
import { type Config } from '@wagmi/core';
import { type SendTransactionMutateAsync } from '@wagmi/core/query';
import type { Dispatch, SetStateAction } from 'react';
import {
  createWalletClient,
  type Address,
  http,
  erc20Abi,
  parseUnits,
  WalletClient,
  Transport,
  Chain,
  Account,
} from 'viem';
import { readContract, waitForTransactionReceipt, writeContract } from 'viem/actions';

import { HashZero } from 'appConstants';
import { approveMarginToken } from 'blockchain-api/approveMarginToken';
import { generateStrategyAccount } from 'blockchain-api/generateStrategyAccount';
import { orderDigest } from 'network/network';
import { OrderSideE, OrderTypeE } from 'types/enums';
import type { HedgeConfigI, OrderI } from 'types/types';

import { postOrder } from './postOrder';
import { setDelegate } from './setDelegate';
import { fundWallet } from './fundWallet';

const DEADLINE = 60 * 60; // 1 hour from posting time
const DELEGATE_INDEX = 2; // to be emitted
const GAS_TARGET = 4_000_000n; // good for arbitrum
const PAGE_REFRESH_DELAY = 3_000; // Let's wait 3 sec before refresh

export async function enterStrategy(
  { chainId, walletClient, symbol, traderAPI, amount, feeRate, indexPrice, limitPrice, strategyAddress }: HedgeConfigI,
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>,
  setCurrentPhaseKey: Dispatch<SetStateAction<string>>
): Promise<{
  hash?: Address;
  interrupted?: boolean;
  interruptedMessage?: string;
}> {
  if (!walletClient.account?.address || !amount || !feeRate) {
    throw new Error('Invalid arguments');
  }

  let strategyAddr: Address;
  let hedgeClient: WalletClient<Transport, Chain | undefined, Account> | undefined = undefined;
  if (!strategyAddress) {
    hedgeClient = await generateStrategyAccount(walletClient).then((account) =>
      createWalletClient({
        account,
        chain: walletClient.chain,
        transport: http(),
      })
    );
    strategyAddr = hedgeClient!.account!.address;
  } else {
    strategyAddr = strategyAddress;
  }
  const isDelegated = (await traderAPI
    .getReadOnlyProxyInstance()
    .isDelegate(strategyAddr, walletClient.account.address)) as boolean;

  const marginTokenAddr = traderAPI.getMarginTokenFromSymbol(symbol);
  const marginTokenDec = traderAPI.getMarginTokenDecimalsFromSymbol(symbol);
  const position = await traderAPI
    .positionRisk(strategyAddr, symbol)
    .then((pos) => pos[0])
    .catch(() => undefined);
  if (!position || !marginTokenAddr || !marginTokenDec) {
    //console.log({ position, marginTokenAddr, marginTokenDec });
    throw new Error(`No hedging strategy available for symbol ${symbol} on chain ID ${chainId}`);
  }
  const marginTokenBalance = await readContract(walletClient, {
    address: marginTokenAddr as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [strategyAddr],
  });
  const allowance = await readContract(walletClient, {
    address: marginTokenAddr as Address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [strategyAddr, traderAPI.getProxyAddress() as Address],
  });

  if (position.positionNotionalBaseCCY !== 0) {
    throw new Error(
      `A hedging position already exists for trader ${walletClient.account?.address} symbol ${symbol} on chain ID ${chainId}`
    );
  }

  const orderSize = getMaxSignedPositionSize(
    amount, // margin collateral
    0, // current position
    0, // current locked-in value
    -1, // trade direction
    limitPrice ?? position.markPrice, // limit price
    (indexPrice ?? position.markPrice) / position.markPrice, // margin rate
    feeRate * 1e-5, // fee rate
    position.markPrice, // mark price
    indexPrice ?? position.markPrice, // index price
    position.collToQuoteConversion // collateral price
  );

  const order: OrderI = {
    symbol: symbol,
    side: OrderSideE.Sell,
    type: OrderTypeE.Market,
    quantity: Math.abs(orderSize * 0.98),
    limitPrice: limitPrice,
    leverage: (0.99 * position.markPrice) / (indexPrice ?? position.markPrice),
    executionTimestamp: Math.floor(Date.now() / 1000 - 10 - 200),
    deadline: Math.floor(Date.now() / 1000 + DEADLINE),
  };
  const { data } = await orderDigest(chainId, [order], strategyAddr);

  if (!data.digests || data.digests.length === 0) {
    console.error('orderDigest error:', data.error);
    setTimeout(() => {
      window.location.reload();
    }, PAGE_REFRESH_DELAY);
    throw new Error('An error appeared to enter a strategy. Please wait for page refresh.');
  }

  // now we start sending txns --> need to generate strat wallet and
  await fundWallet({ walletClient, address: strategyAddr }, sendTransactionAsync);
  if (hedgeClient === undefined) {
    hedgeClient = await generateStrategyAccount(walletClient).then((account) =>
      createWalletClient({
        account,
        chain: walletClient.chain,
        transport: http(),
      })
    );
  }
  // set user as delegate of strat wallet
  if (!isDelegated) {
    await setDelegate(
      hedgeClient!,
      traderAPI.getProxyAddress() as Address,
      walletClient.account.address,
      DELEGATE_INDEX
    );
  }
  // send collateral to strat wallet
  const amountBigint = parseUnits(amount.toString(), marginTokenDec);
  if (marginTokenBalance < amountBigint) {
    //console.log('funding strategy account');
    setCurrentPhaseKey('pages.strategies.enter.phases.funding');
    const tx1 = await writeContract(walletClient, {
      address: marginTokenAddr as Address,
      chain: walletClient.chain,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [strategyAddr, amountBigint],
      account: walletClient.account,
      gas: GAS_TARGET,
    }).catch((error) => {
      throw new Error(error.shortMessage);
    });
    await waitForTransactionReceipt(walletClient, { hash: tx1, timeout: 30_000 });
  }
  // increase allowance if needed
  if (allowance < amountBigint) {
    //console.log('approving margin token', { marginTokenAddr, amount });
    await approveMarginToken(hedgeClient!, marginTokenAddr, traderAPI.getProxyAddress(), amount, marginTokenDec).catch(
      (error) => {
        //console.log(error);
        throw new Error(error.shortMessage);
      }
    );
  }
  setCurrentPhaseKey('pages.strategies.enter.phases.posting');
  // post order
  return postOrder(hedgeClient!, [HashZero], data);
}
