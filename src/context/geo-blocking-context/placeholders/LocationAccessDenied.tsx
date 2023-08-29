import { useTranslation } from 'react-i18next';

import { Card, CardContent, Typography } from '@mui/material';

import { GeoLayout } from '../geo-layout/GeoLayout';

interface LocationAccessDeniedPropsI {
  errorMessage: string;
}

export const LocationAccessDenied = ({ errorMessage }: LocationAccessDeniedPropsI) => {
  const { t } = useTranslation();

  return (
    <GeoLayout title="GeoLocation check">
      <Card>
        <CardContent>
          <Typography variant="body1">{t('pages.geolocation.access-denied')}</Typography>
          <Typography variant="body2">{errorMessage}</Typography>
        </CardContent>
      </Card>
    </GeoLayout>
  );
};
