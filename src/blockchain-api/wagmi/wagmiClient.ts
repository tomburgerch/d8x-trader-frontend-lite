import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, injectedWallet, metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient } from 'wagmi';
import { polygonMumbai, polygon, polygonZkEvm, polygonZkEvmTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const defautChains: Chain[] = [
  polygon,
  polygonMumbai,
  {
    ...polygonZkEvm,
    iconUrl: 'https://zkevm.polygonscan.com/images/favicon.ico?v=23.3.5.0',
  },
  {
    ...polygonZkEvmTestnet,
    iconUrl: 'https://testnet-zkevm.polygonscan.com/images/favicon.ico?v=23.3.5.0',
  },
];

const { chains, provider } = configureChains(defautChains, [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      coinbaseWallet({ chains, appName: 'D8X App' }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { chains, wagmiClient };
