import { useEffect, useState } from 'react'

const THRESHOLD = 60 // px — ignores minor viewport jitter (address bar, etc.)

/** Height (px) of the on-screen mobile keyboard via the Visual Viewport
    API — 0 when it's not showing. Lets an absolutely/fixed positioned
    sheet shift its content above the keyboard instead of letting it cover
    a focused field, which plain CSS viewport units can't reliably do. */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setInset(gap > THRESHOLD ? gap : 0)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
