import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const HeaderPortal = ({ children }: { children: ReactNode }) => {
  const domElement = document.querySelector('#header-side');
  if (!domElement) {
    return null;
  }
  return createPortal(children, domElement);
};
