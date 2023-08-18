export function getRefLink(code: string | null) {
  if (!code) {
    return '';
  }

  return document.location.origin + '/?ref=' + code;
}
