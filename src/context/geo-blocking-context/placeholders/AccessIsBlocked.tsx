import { useTranslation } from 'react-i18next';

import { Card, CardContent, Typography } from '@mui/material';

import { GeoLayout } from '../geo-layout/GeoLayout';

export const AccessIsBlocked = () => {
  const { t } = useTranslation();

  return (
    <GeoLayout title="Access is blocked">
      <Card>
        <CardContent>
          <Typography variant="body1">{t('pages.geolocation.access-blocked')}</Typography>
        </CardContent>
      </Card>
    </GeoLayout>
  );
};
