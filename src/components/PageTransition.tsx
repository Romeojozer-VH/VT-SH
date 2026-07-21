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
  '/home',
  '/card-updated',
  '/gateway',
  '/redirecting',
])

// Success has no back button and no history to slide in from, so *entering*
// it (forward) stays an instant swap — but *leaving* it via its own CTA
// should still slide, so it's deliberately left out of NO_TRANSITION.
const NO_TRANSITION_ENTER_ONLY = new Set(['/success'])

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

    let direction: 'forward' | 'back' = navigationType === 'POP' ? 'back' : 'forward'
    // Leaving Success is always a "closing" motion — slide right, pulling
    // the parent screen in from the left — regardless of whether the
    // underlying navigation is a real history pop or a push to a fixed
    // path (some flows don't know their exact back-depth and just push).
    if (from.pathname === '/success') direction = 'back'

    // Whichever screen is animating on top — the incoming child on a push,
    // the outgoing child on a pop — must be a screen that has a back button.
    const topPathname = direction === 'forward' ? location.pathname : from.pathname
    if (
      NO_TRANSITION.has(topPathname) ||
      (direction === 'forward' && NO_TRANSITION_ENTER_ONLY.has(topPathname))
    ) {
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
          while the row below slides. The parent and child screens are laid
          out as literal side-by-side siblings in a 200%-wide flex row (child
          always to the right of parent), and the whole row translates by
          one screen-width — never two independently-animated, stacked
          (z-indexed) layers, which is what made it read as an overlay
          instead of a real push. */}
      <StatusBarHiddenContext.Provider value={true}>
        <div
          className={`absolute inset-0 flex h-full w-[200%] bg-white ${
            topIsNew ? 'screen-row-forward' : 'screen-row-back'
          }`}
        >
          <div className="h-full w-1/2 shrink-0">
            <Routes location={baseLocation}>{children}</Routes>
          </div>
          <div className="h-full w-1/2 shrink-0">
            <Routes location={topLocation}>{children}</Routes>
          </div>
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
