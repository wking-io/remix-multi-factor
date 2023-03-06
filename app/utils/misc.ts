export function removeTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function isEven(n: number): boolean {
  return n % 2 === 0;
}
