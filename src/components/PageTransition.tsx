import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Routes, useLocation, useNavigationType, type Location } from 'react-router-dom'
import StatusBar from './StatusBar'
import { StatusBarHiddenContext } from '../statusBarContext'

const DURATION = 300

// Root/terminal screens with no back button — a route change into (or,
// going back, out of) one of these is always an instant swap, never a slide.
const NO_TRANSITION = new Set([
  '/',
  '/pay',
  '/card-updated',
  '/gateway',
  '/redirecting',
  '/success',
])

// Screens that render their own dark "external site" chrome instead of the
// shared StatusBar — don't paint the light status-bar overlay over these.
const DARK_CHROME_ROUTES = new Set(['/bank', '/egiro-bank-auth'])

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const currentRef = useRef(location)
  const [prev, setPrev] = useState<{
    location: Location
    direction: 'forward' | 'back'
  } | null>(null)

  useEffect(() => {
    const from = currentRef.current
    currentRef.current = location
    if (location.pathname === from.pathname) return

    const direction: 'forward' | 'back' = navigationType === 'POP' ? 'back' : 'forward'
    // Whichever screen is animating on top — the incoming child on a push,
    // the outgoing child on a pop — must be a screen that has a back button.
    const topPathname = direction === 'forward' ? location.pathname : from.pathname
    if (NO_TRANSITION.has(topPathname)) {
      setPrev(null)
      return
    }

    setPrev({ location: from, direction })
    const t = window.setTimeout(() => setPrev(null), DURATION)
    return () => window.clearTimeout(t)
  }, [location, navigationType])

  if (!prev) {
    // No wrapper here — StatusBar walks up the DOM looking for the nearest
    // ancestor that actually overflows (scrollHeight > clientHeight) to
    // attach its scroll listener. Any intermediate box here — even a plain,
    // non-scrolling one — would report that same overflow (scrollHeight
    // reflects overflowed content regardless of the overflow property) and
    // get mistaken for the real scroller, silently breaking the gradient.
    return <Routes location={location}>{children}</Routes>
  }

  const topIsNew = prev.direction === 'forward'
  const baseLocation = topIsNew ? prev.location : location
  const topLocation = topIsNew ? location : prev.location
  const showStatusBarOverlay =
    !DARK_CHROME_ROUTES.has(baseLocation.pathname) &&
    !DARK_CHROME_ROUTES.has(topLocation.pathname)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* The OS status bar (and the physical notch, painted separately by
          PhoneFrame) is device chrome, not app content — it must stay put
          while the screen underneath slides. Both layers below still mount
          their own StatusBar as part of their normal content, but it hides
          itself via context while a transition is active; this single
          static copy is the only one actually visible for the duration. */}
      <StatusBarHiddenContext.Provider value={true}>
        <div className="absolute inset-0 z-0 bg-white">
          <Routes location={baseLocation}>{children}</Routes>
        </div>
        <div
          className={`absolute inset-0 z-10 bg-white ${
            topIsNew ? 'screen-push-in' : 'screen-pop-out'
          }`}
        >
          <Routes location={topLocation}>{children}</Routes>
        </div>
      </StatusBarHiddenContext.Provider>
      {showStatusBarOverlay && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <StatusBar />
        </div>
      )}
    </div>
  )
}
