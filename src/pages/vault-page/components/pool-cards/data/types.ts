import { type ReactNode } from 'react';

export interface DataItemI {
  label: string;
  logo: ReactNode;
  logoBackground?: string;
  isRounded?: boolean;
  translationKey?: string;
}
