import { type ComponentType, lazy, type LazyExoticComponent, type ReactElement, type ReactNode } from 'react';

import { TemporaryAnyT } from 'types/types';

const importedLogos: Record<string, ReactElement<TemporaryAnyT>> = {};

export const getDynamicLogo = (symbol: string): LazyExoticComponent<ComponentType<ReactNode>> =>
  lazy(async () => {
    const importedLogo = importedLogos[symbol];
    if (importedLogo) {
      return {
        default: importedLogo,
      };
    }
    try {
      const libraryLogo = (await import(`../../node_modules/cryptocurrency-icons/svg/color/${symbol}.svg`)).default;
      importedLogos[symbol] = libraryLogo;
      return {
        default: libraryLogo,
      };
    } catch {
      /* continue regardless of error */
    }

    try {
      const localLogo = (await import(/* @vite-ignore */ `assets/crypto-icons/${symbol}.svg`)).default;
      importedLogos[symbol] = localLogo;
      return {
        default: localLogo,
      };
    } catch {
      /* continue regardless of error */
    }

    try {
      const genericLogo = (await import('assets/crypto-icons/generic.svg')).default as TemporaryAnyT;
      importedLogos[symbol] = genericLogo;
      return {
        default: genericLogo,
      };
    } catch {
      // We need to reload page, because app has been updated
      window.location.reload();
      return {
        default: null,
      };
    }
  });
