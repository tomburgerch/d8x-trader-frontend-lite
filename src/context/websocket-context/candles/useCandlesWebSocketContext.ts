import { useContext } from 'react';

import { CandlesWebSocketContext } from './CandlesWebSocketContext';

export const useCandlesWebSocketContext = () => useContext(CandlesWebSocketContext);
