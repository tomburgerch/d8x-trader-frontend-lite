export function isValidAddress(addr: string): boolean {
  return /^(0x){1}([a-f]|[A-F]|[0-9]){40}/.test(addr);
}
