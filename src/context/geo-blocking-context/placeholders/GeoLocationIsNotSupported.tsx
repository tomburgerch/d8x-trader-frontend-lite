import { useTranslation } from 'react-i18next';

import { Card, CardContent, Typography } from '@mui/material';

import { GeoLayout } from '../geo-layout/GeoLayout';

export const GeoLocationIsNotSupported = () => {
  const { t } = useTranslation();

  return (
    <GeoLayout title="GeoLocation check">
      <Card>
        <CardContent>
          <Typography>{t('pages.geolocation.not-supported')}</Typography>
        </CardContent>
      </Card>
    </GeoLayout>
  );
};
