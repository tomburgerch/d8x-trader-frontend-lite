import { useAtom, useAtomValue } from 'jotai';

import { extractSocialPKModalOpenAtom } from 'store/global-modals.store';
import { socialPKAtom } from 'store/web3-auth.store';

import { ExtractPKModal } from './ExtractPKModal';
import { useCallback } from 'react';

export const ExtractSocialPKModal = () => {
  const [isExtractPKModalOpen, setExtractPKModalOpen] = useAtom(extractSocialPKModalOpenAtom);
  const socialPK = useAtomValue(socialPKAtom);

  const setModalOpen = useCallback(
    (isOpen: boolean) => {
      setExtractPKModalOpen(isOpen);
    },
    [setExtractPKModalOpen]
  );

  return (
    <ExtractPKModal
      getPK={() => new Promise((resolve) => resolve(socialPK))}
      isModalOpen={isExtractPKModalOpen}
      setModalOpen={setModalOpen}
    />
  );
};
