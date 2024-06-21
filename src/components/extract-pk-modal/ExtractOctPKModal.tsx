import { useAtom } from 'jotai';
import { useWalletClient } from 'wagmi';
import { useCallback } from 'react';

import { getStorageKey } from 'blockchain-api/getStorageKey';
import { getDelegateKey } from 'helpers/getDelegateKey';
import { extractOctPKModalOpenAtom } from 'store/global-modals.store';
import { storageKeyAtom } from 'store/order-block.store';

import { ExtractPKModal } from './ExtractPKModal';

export const ExtractOctPKModal = () => {
  const [isExtractPKModalOpen, setExtractPKModalOpen] = useAtom(extractOctPKModalOpenAtom);
  const [storageKey, setStorageKey] = useAtom(storageKeyAtom);

  const { data: walletClient } = useWalletClient();

  const setModalOpen = useCallback(
    (isOpen: boolean) => {
      setExtractPKModalOpen(isOpen);
    },
    [setExtractPKModalOpen]
  );

  const getPK = useCallback(async () => {
    if (!walletClient) {
      return null;
    }

    try {
      let strgKey = storageKey;
      if (!strgKey) {
        strgKey = await getStorageKey(walletClient);
        setStorageKey(strgKey);
      }
      return getDelegateKey(walletClient, strgKey) || null;
    } catch (error) {
      console.error(error);
    }
    return null;
  }, [walletClient, storageKey, setStorageKey]);

  return <ExtractPKModal getPK={getPK} isModalOpen={isExtractPKModalOpen} setModalOpen={setModalOpen} />;
};
