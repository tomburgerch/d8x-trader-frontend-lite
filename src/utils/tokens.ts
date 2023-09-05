import { FC, SVGProps, lazy } from 'react';

const importedLogos: Record<string, FC<SVGProps<SVGSVGElement>>> = {};

export const getDynamicLogo = (symbol: string) =>
  lazy(async () => {
    const importedLogo = importedLogos[symbol];
    if (importedLogo) {
      return {
        default: importedLogo,
      };
    }
    try {
      const libraryLogo = (await import(`../../node_modules/cryptocurrency-icons/svg/color/${symbol}.svg`))
        .ReactComponent;
      importedLogos[symbol] = libraryLogo;
      return {
        default: libraryLogo,
      };
    } catch {
      /* continue regardless of error */
    }

    try {
      const localLogo = (await import(`~assets/crypto-icons/${symbol}.svg`)).ReactComponent;
      importedLogos[symbol] = localLogo;
      return {
        default: localLogo,
      };
    } catch {
      const defaultLogo = (await import(`../../node_modules/cryptocurrency-icons/svg/color/generic.svg`))
        .ReactComponent;
      importedLogos[symbol] = defaultLogo;
      return {
        default: defaultLogo,
      };
    }
  });
