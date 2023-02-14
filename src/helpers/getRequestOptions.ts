import { RequestMethodE } from 'types/enums';

export function getRequestOptions(method?: RequestMethodE) {
  return {
    method: method ? method : RequestMethodE.GET,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
}
