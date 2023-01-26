import type { FC, PropsWithChildren } from 'react';
import { memo } from 'react';

import { CommonProps } from '@mui/material/OverridableComponent';

import { PageContainer } from './Container.styles';

export const Container: FC<CommonProps & PropsWithChildren> = memo(({ children, ...rest }) => {
  return (
    <PageContainer maxWidth="xl" {...rest}>
      {children}
    </PageContainer>
  );
});
