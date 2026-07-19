import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import type { PaymentFlowConfig } from '../payment'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const [leaving, setLeaving] = useState(false)

  const flow = (location.state as { flow?: PaymentFlowConfig } | null)?.flow
  const doneTo = flow?.doneTo ?? '/pay'
  const doneToLabel = flow?.doneToLabel ?? 'Back to pay dashboard'

  const goToDashboard = () => {
    setLeaving(true)
    setTimeout(() => navigate(doneTo), 300)
  }

  return (
    <div
      className={`relative flex min-h-full flex-col overflow-hidden bg-sh-green ${
        leaving ? 'screen-exit' : ''
      }`}
    >
      {/* portal on the green strip behind the status bar */}
      <img
        src={IMG.homePortal}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-133px] top-[22px] z-0 h-[948px] w-[492px] max-w-none"
      />

      <StatusBar />

      {/* content sheet — starts 104px from the top, regardless of the
          status bar's own rendered height; that band stays green */}
      <div className="absolute inset-x-0 bottom-0 top-[104px] z-10 flex flex-col rounded-t-[24px] bg-[#fafafa] px-5 pb-8 pt-8">
        <div className="flex flex-1 flex-col items-center pt-8 text-center">
          <img
            src="/Icons/Illustration%202_1.svg"
            alt=""
            aria-hidden
            className="success-pop h-[155px] w-auto"
          />
          <h1 className="success-rise mt-6 text-[24px] font-black text-sh-ink [animation-delay:200ms]">
            {flow?.successTitle ?? 'Payment complete!'}
          </h1>
          <p className="success-rise mt-3 max-w-[300px] text-[16px] leading-6 text-sh-ink [animation-delay:290ms]">
            {flow?.successDescription ??
              'Your payment has been received and successfully processed.'}
          </p>
          <p className="success-rise mt-4 max-w-[300px] text-[16px] leading-6 text-sh-ink [animation-delay:380ms]">
            A confirmation has been sent to{' '}
            <span className="font-bold">xxx.xxxx@gmail.com</span>
          </p>
        </div>

        <button
          onClick={goToDashboard}
          className="success-rise h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink shadow-[0_8px_24px_rgba(20,20,20,0.12)] [animation-delay:470ms] active:scale-[0.99]"
        >
          {doneToLabel}
        </button>
      </div>
    </div>
  )
}
