import { createContext } from 'react'

// True when viewed on an actual mobile device with the frame off — the
// real OS already shows its own status bar above the browser there, so our
// simulated one is redundant and should be removed entirely (not just
// hidden, unlike StatusBarHiddenContext — its space should collapse too).
export const SuppressStatusBarContext = createContext(false)
