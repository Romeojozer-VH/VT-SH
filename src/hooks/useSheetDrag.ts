import { useRef, useState } from 'react'

const CLOSE_DISTANCE = 90 // px dragged down before it counts as a dismiss
const CLOSE_VELOCITY = 0.5 // px/ms — a fast flick dismisses even if short

/** Drag-down-to-dismiss for a bottom sheet panel. Spread `handlers` onto the
    panel element and apply `style` so it tracks the finger while dragging
    and springs back (or hands off to the panel's own closing animation) on
    release. Ignores the gesture if it started inside a scrolled-down
    scrollable area, so it doesn't fight normal scrolling within the sheet. */
export function useSheetDrag(onClose: () => void) {
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ y: number; time: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) {
      start.current = null
      return
    }
    // if the touch begins inside a scrolled-down list, let it scroll —
    // only engage the drag when starting from the top of any such area.
    let el = e.target as HTMLElement | null
    while (el && el !== e.currentTarget) {
      if (el.scrollHeight > el.clientHeight && el.scrollTop > 0) {
        start.current = null
        return
      }
      el = el.parentElement
    }
    start.current = { y: e.touches[0].clientY, time: Date.now() }
    setDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!start.current) return
    const delta = e.touches[0].clientY - start.current.y
    if (delta > 0) setDragY(delta)
  }

  const onTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const s = start.current
    start.current = null
    setDragging(false)
    if (!s) return
    const delta = e.changedTouches[0].clientY - s.y
    const velocity = delta / Math.max(Date.now() - s.time, 1)
    setDragY(0)
    if (delta > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) onClose()
  }

  const onTouchCancel = () => {
    start.current = null
    setDragging(false)
    setDragY(0)
  }

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel },
    style:
      dragY > 0
        ? {
            transform: `translateY(${dragY}px)`,
            transition: dragging ? 'none' : 'transform 0.2s ease-out',
          }
        : undefined,
  }
}
