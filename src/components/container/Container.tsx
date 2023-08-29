import { memo, type PropsWithChildren } from 'react';

import { CommonProps } from '@mui/material/OverridableComponent';

import { PageContainer } from './Container.styles';

export const Container = memo(({ children, ...rest }: CommonProps & PropsWithChildren) => {
  return (
    <PageContainer maxWidth="xl" {...rest}>
      {children}
    </PageContainer>
  );
});
