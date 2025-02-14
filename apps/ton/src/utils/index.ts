export function truncateHash(hash?: string, chars = 6): string {
  if (!hash) return ''
  return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`
}
