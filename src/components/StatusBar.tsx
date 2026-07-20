import { useContext, useEffect, useRef, useState } from 'react'
import { StatusBarHiddenContext } from '../statusBarContext'

/* iOS status bar — pinned to the top of the phone screen. Transparent while
   at rest (the green banner shows through); once scrolled, a subtle top-down
   gradient scrim fades in so the glyphs stay legible over whatever content
   scrolls beneath. */
function formatTime(d: Date) {
  let h = d.getHours() % 12
  if (h === 0) h = 12
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function StatusBar() {
  const hidden = useContext(StatusBarHiddenContext)
  const ref = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    // Walk up to the nearest scrollable ancestor (PhoneFrame's scroll area).
    let el: HTMLElement | null = ref.current?.parentElement ?? null
    while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement
    const scroller = el

    const onScroll = () => setScrolled((scroller?.scrollTop ?? 0) > 4)
    onScroll()
    scroller?.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller?.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={ref}
      className={`sticky top-0 z-40 flex items-center justify-between px-6 pb-1 pt-3 text-sh-ink transition-opacity duration-200 ${
        hidden ? 'opacity-0' : ''
      }`}
      style={
        scrolled
          ? {
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 78.369%)',
            }
          : undefined
      }
    >
      <span className="text-[15px] font-bold tracking-tight">{formatTime(now)}</span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2C5.6 2 2.9 3 .9 4.9l1.6 1.7C4 5 6.2 4.2 8.5 4.2S13 5 14.5 6.6l1.6-1.7C14.1 3 11.4 2 8.5 2Z" />
          <path d="M8.5 6.3c-1.6 0-3.1.6-4.2 1.7l1.7 1.7c.7-.7 1.6-1 2.5-1s1.8.3 2.5 1l1.7-1.7c-1.1-1.1-2.6-1.7-4.2-1.7Z" />
          <circle cx="8.5" cy="11" r="1.2" />
        </svg>
        {/* battery */}
        <div className="flex items-center gap-0.5">
          <div className="relative h-[12px] w-[24px] rounded-[3px] border-[1.5px] border-sh-ink/40">
            <div className="absolute inset-[1.5px] rounded-[1px] bg-sh-ink" />
          </div>
          <div className="h-[4px] w-[1.5px] rounded-r bg-sh-ink/40" />
        </div>
      </div>
    </div>
  )
}
