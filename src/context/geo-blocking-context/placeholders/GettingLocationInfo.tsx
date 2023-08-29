import { useTranslation } from 'react-i18next';

import { Card, CardContent, Typography } from '@mui/material';

import { GeoLayout } from '../geo-layout/GeoLayout';

export const GettingLocationInfo = () => {
  const { t } = useTranslation();

  return (
    <GeoLayout title="GeoLocation check">
      <Card>
        <CardContent>
          <Typography>{t('pages.geolocation.getting-location')}</Typography>
        </CardContent>
      </Card>
    </GeoLayout>
  );
};
