import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SheetPortalContext } from './sheetPortal'

interface PhoneFrameProps {
  children: ReactNode
  framed: boolean
  /** Persistent bottom bar pinned to the screen, outside the scroll/transition. */
  bottomBar?: ReactNode
  /** Full-screen overlay (e.g. the card-added success sheet), pinned above
      everything else regardless of the current screen's own scroll/sheets. */
  overlay?: ReactNode
}

/**
 * Wraps screen content in a device bezel when `framed`, or renders it
 * full-bleed (centered, max phone width) when off. `bottomBar` is pinned to
 * the bottom of the screen and stays put across page transitions.
 */
export default function PhoneFrame({
  children,
  framed,
  bottomBar,
  overlay,
}: PhoneFrameProps) {
  const screenRef = useRef<HTMLDivElement>(null)
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    setPortalNode(screenRef.current)
  }, [framed])

  if (!framed) {
    return (
      <SheetPortalContext.Provider value={portalNode}>
        <div
          ref={screenRef}
          className="relative mx-auto h-full w-full max-w-[430px] overflow-hidden bg-white"
        >
          <div className="h-full w-full overflow-y-auto no-scrollbar">
            {children}
          </div>
          {bottomBar && (
            <div className="absolute inset-x-0 bottom-0 z-40">{bottomBar}</div>
          )}
          {overlay}
        </div>
      </SheetPortalContext.Provider>
    )
  }

  return (
    <div
      className="relative h-[844px] w-[418px] rounded-[54px] bg-black p-[14px] shadow-2xl"
      style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }}
    >
      {/* screen */}
      <SheetPortalContext.Provider value={portalNode}>
        <div
          ref={screenRef}
          className="relative h-full w-full overflow-hidden rounded-[42px] bg-white"
        >
          {/* notch — physical hardware cutout, must render above every sheet/overlay
              in the app (currently the highest is CardAddedSheet at z-[80]) */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-[100] h-[26px] w-[110px] -translate-x-1/2 rounded-full bg-black" />
          <div className="h-full w-full overflow-y-auto no-scrollbar">
            {children}
          </div>
          {bottomBar && (
            <div className="absolute inset-x-0 bottom-0 z-40">{bottomBar}</div>
          )}
          {overlay}
        </div>
      </SheetPortalContext.Provider>
      {/* side buttons */}
      <div className="absolute -left-[3px] top-[120px] h-[30px] w-[3px] rounded-l bg-neutral-700" />
      <div className="absolute -left-[3px] top-[170px] h-[52px] w-[3px] rounded-l bg-neutral-700" />
      <div className="absolute -left-[3px] top-[236px] h-[52px] w-[3px] rounded-l bg-neutral-700" />
      <div className="absolute -right-[3px] top-[180px] h-[80px] w-[3px] rounded-r bg-neutral-700" />
    </div>
  )
}
