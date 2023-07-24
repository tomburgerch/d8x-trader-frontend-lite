import { useCallback, useState } from 'react';

/**
 * Hook returning simple dialog state, as well as open and close handlers.
 *
 * @dev Usage migration will be done at a later stage.
 * @returns An object including dialog state and handlers.
 */
export const useDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = useCallback(() => setDialogOpen(true), []);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return { dialogOpen, openDialog, closeDialog };
};
