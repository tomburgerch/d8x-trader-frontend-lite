import { memo } from 'react';
import { Trans, withTranslation } from 'react-i18next';

import styles from './Translate.module.scss';

interface TranslatePropsI {
  i18nKey: string;
  values?: Record<string, string | number | null | undefined>;
}

const TranslateComponent = ({ i18nKey, values = {} }: TranslatePropsI) => {
  return (
    <Trans
      i18nKey={i18nKey}
      values={values}
      components={{
        bold: <span className={styles.bold} />,
        uppercase: <span className={styles.uppercase} />,
      }}
    />
  );
};

export const Translate = memo(withTranslation()(TranslateComponent));
