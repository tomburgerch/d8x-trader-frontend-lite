import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';

interface HandleMessagePropsI {
  messages: string[];
  setMessages: Dispatch<SetStateAction<string[]>>;
  handleWsMessage: (message: string) => void;
}

export const useHandleMessage = ({ messages, setMessages, handleWsMessage }: HandleMessagePropsI) => {
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach(handleWsMessage);
      setMessages([]);
    }
  }, [messages, setMessages, handleWsMessage]);
};
