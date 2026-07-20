/** Best-effort "is this an actual mobile device" check — not just a narrow
    viewport, which a resized desktop window would also trigger. Combines a
    UA check (broad browser support, including Safari) with a touch +
    coarse-pointer check (catches cases UA sniffing misses, and avoids
    flagging touchscreen laptops which have a fine pointer alongside touch). */
export function detectMobile(): boolean {
  if (typeof navigator === 'undefined') return false
  const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const touchCapable =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  const coarsePointer =
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(pointer: coarse)').matches
  return uaMobile || (touchCapable && coarsePointer)
}
