import { PROXY_ABI, type TraderInterface } from '@d8x/perpetuals-sdk';
import { getGasPrice } from 'blockchain-api/getGasPrice';
import { type Address, type WalletClient } from 'viem';
import { estimateContractGas } from 'viem/actions';
import { getGasLimit } from 'blockchain-api/getGasLimit';
import { MethodE } from 'types/enums';

export async function settleTrader(
  walletClient: WalletClient,
  traderAPI: TraderInterface,
  symbol: string,
  traderAddr: Address
): Promise<{ hash: Address }> {
  const perpetualId = traderAPI.getPerpIdFromSymbol(symbol);
  const account = walletClient.account?.address;
  if (!perpetualId || !account) {
    throw new Error('undefined call parameters');
  }
  const gasPrice = await getGasPrice(walletClient.chain?.id);
  const params = {
    chain: walletClient.chain,
    address: traderAPI.getProxyAddress() as Address,
    abi: PROXY_ABI,
    functionName: 'settle',
    args: [perpetualId, traderAddr],
    account: account,
    gasPrice: gasPrice,
  };
  const gasLimit = await estimateContractGas(walletClient, params)
    .then((gas) => (gas * 130n) / 100n)
    .catch(() => getGasLimit({ chainId: walletClient?.chain?.id, method: MethodE.Interact }));
  return walletClient.writeContract({ ...params, gas: gasLimit }).then((tx) => ({ hash: tx }));
}
