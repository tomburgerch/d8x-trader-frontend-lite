import { lazy } from 'react';

export const getDynamicLogo = (symbol: string) =>
  lazy(async () => {
    try {
      return {
        default: (await import(`../../node_modules/cryptocurrency-icons/svg/color/${symbol}.svg`)).ReactComponent,
      };
    } catch {
      /* continue regardless of error */
    }

    try {
      return {
        default: (await import(`~assets/crypto-icons/${symbol}.svg`)).ReactComponent,
      };
    } catch {
      return {
        default: (await import(`../../node_modules/cryptocurrency-icons/svg/color/generic.svg`)).ReactComponent,
      };
    }
  });
