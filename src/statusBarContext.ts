import { createContext } from 'react'

// While true, StatusBar hides its own rendered row. Used during page
// transitions: PageTransition shows one static overlay copy instead, so the
// OS status bar never visibly slides along with the animating screen.
export const StatusBarHiddenContext = createContext(false)
