import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { useAtom } from 'jotai';
import { ReactNode } from 'react';

import { Disclaimer } from 'components/disclaimer/disclaimer';

import '@rainbow-me/rainbowkit/styles.css';
import { enabledDarkModeAtom } from 'store/app.store';

export const RainbowKitProviderWrapper = ({ children }: { children: ReactNode }) => {
  const [enabledDarkMode] = useAtom(enabledDarkModeAtom);

  return (
    <RainbowKitProvider
      appInfo={{ appName: 'D8X', disclaimer: Disclaimer, learnMoreUrl: 'https://d8x.exchange/' }}
      modalSize="compact"
      theme={enabledDarkMode ? darkTheme() : undefined}
    >
      {children}
    </RainbowKitProvider>
  );
};
