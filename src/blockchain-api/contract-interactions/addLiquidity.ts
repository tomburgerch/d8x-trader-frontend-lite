import { PROXY_ABI, type TraderInterface, floatToDecN } from '@d8x/perpetuals-sdk';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { type Address, type WalletClient } from 'viem';
import { estimateContractGas } from 'viem/actions';
import { getGasLimit } from 'blockchain-api/getGasLimit';
import { MethodE } from 'types/enums';

export async function addLiquidity(
  walletClient: WalletClient,
  traderAPI: TraderInterface,
  symbol: string,
  amount: number
): Promise<{ hash: Address }> {
  const decimals = traderAPI.getMarginTokenDecimalsFromSymbol(symbol);
  const poolId = traderAPI.getPoolIdFromSymbol(symbol);
  const account = walletClient.account?.address;
  if (!decimals || !poolId || !account) {
    throw new Error('undefined call parameters');
  }
  const amountCC = await traderAPI.fetchCollateralToSettlementConversion(symbol).then((c2s) => amount / c2s);
  const amountParsed = BigInt(floatToDecN(amountCC, decimals).toString());
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  const params = {
    chain: walletClient.chain,
    address: traderAPI.getProxyAddress() as Address,
    abi: PROXY_ABI,
    functionName: 'addLiquidity',
    args: [poolId, amountParsed],
    account: account,
    gasPrice: gasPrice,
  };
  const gasLimit = await estimateContractGas(walletClient, params)
    .then((gas) => (gas * 130n) / 100n)
    .catch(() => getGasLimit({ chainId: walletClient?.chain?.id, method: MethodE.Interact }));
  return walletClient.writeContract({ ...params, gas: gasLimit }).then((tx) => ({ hash: tx }));
}
