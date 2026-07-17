import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'

export default function Redirecting() {
  const navigate = useNavigate()
  const location = useLocation()
  const next = (location.state as { next?: string } | null)?.next ?? '/bank'

  useEffect(() => {
    const t = setTimeout(
      () => navigate(next, { state: location.state, replace: true }),
      1900,
    )
    return () => clearTimeout(t)
  }, [navigate, next, location.state])

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-sh-green">
      <img
        src={IMG.homePortal}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-133px] top-[22px] z-0 h-[948px] w-[492px] max-w-none"
      />

      <StatusBar />

      <div className="relative z-10 mt-3 flex flex-1 flex-col items-center rounded-t-[24px] bg-[#fafafa] px-5 pt-16 text-center">
        <div className="size-9 animate-spin rounded-full border-[3px] border-sh-ink/15 border-t-sh-ink" />
        <h1 className="mt-6 text-[24px] font-black text-sh-ink">Redirecting</h1>
        <p className="mt-2 max-w-[280px] text-[16px] leading-6 text-sh-ink">
          We&rsquo;re directing you to another page. Hang tight!
        </p>
      </div>
    </div>
  )
}
