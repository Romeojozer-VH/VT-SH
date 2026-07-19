import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** The screen's fixed (non-scrolling) container — set by PhoneFrame. */
export const SheetPortalContext = createContext<HTMLElement | null>(null)

/**
 * Renders bottom-sheet content into the screen's fixed container instead of
 * wherever it's called from. Screens are scrollable, so a sheet positioned
 * `absolute inset-0` inside one would stretch to the full scrollable height
 * and scroll with the page; portaling keeps it pinned to the visible screen.
 * Falls back to inline rendering if the portal target isn't mounted yet.
 */
export function SheetPortal({ children }: { children: ReactNode }) {
  const node = useContext(SheetPortalContext)
  return node ? createPortal(children, node) : <>{children}</>
}
