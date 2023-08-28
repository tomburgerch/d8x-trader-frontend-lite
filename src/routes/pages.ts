import { RoutesE } from './RoutesE';

export interface PageI {
  id: string;
  path: RoutesE | string;
  title: string;
  translationKey: string;
}

export const pages: PageI[] = [
  {
    id: 'trade',
    path: RoutesE.Trade,
    title: 'Trade',
    translationKey: 'navigation.trade',
  },
  {
    id: 'refer',
    path: RoutesE.Refer,
    title: 'Refer',
    translationKey: 'navigation.refer',
  },
  {
    id: 'vault',
    path: RoutesE.Vault,
    title: 'Vault',
    translationKey: 'navigation.vault',
  },
];
