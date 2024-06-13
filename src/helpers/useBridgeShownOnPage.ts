import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { RoutesE } from 'routes/RoutesE';

export function useBridgeShownOnPage() {
  const location = useLocation();

  return useMemo(() => {
    const restrictedPages = Object.values(RoutesE).filter((page) => page !== RoutesE.Trade && page !== RoutesE.Vault);
    const foundPage = restrictedPages.find((page) => location.pathname.indexOf(page) === 0);
    return !foundPage;
  }, [location.pathname]);
}
