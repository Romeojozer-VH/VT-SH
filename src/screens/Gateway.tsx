import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePayment } from '../payment'
import type { CardBrand } from '../components/CardLogo'

function HsbcLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="30" height="24" viewBox="0 0 30 24" aria-hidden>
        <rect width="30" height="24" fill="#fff" />
        <polygon points="15,12 30,2 30,22" fill="#db0011" />
        <polygon points="15,12 0,2 0,22" fill="#db0011" />
        <polygon points="15,12 3,2 27,2" fill="#db0011" />
        <polygon points="15,12 3,22 27,22" fill="#db0011" />
        <polygon points="15,12 30,2 15,2" fill="#fff" />
        <polygon points="15,12 0,22 15,22" fill="#fff" />
      </svg>
      <span className="text-[18px] font-bold tracking-tight text-[#1a1f36]">HSBC</span>
    </div>
  )
}

export default function Gateway() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAddedCard, showCardAdded } = usePayment()

  const st = location.state as {
    brand?: CardBrand
    returnTo?: string
    reopen?: string
  } | null
  const brand = st?.brand ?? 'visa'
  const returnTo = st?.returnTo ?? '/update-payment'
  const reopen = st?.reopen

  useEffect(() => {
    const t = setTimeout(() => {
      setAddedCard({
        id: 'added-card',
        brand,
        last4: '7228',
        status: 'Expires 12/30',
      })
      showCardAdded()
      navigate(returnTo, { state: { reopenSheet: reopen }, replace: true })
    }, 2600)
    return () => clearTimeout(t)
  }, [brand, returnTo, reopen, navigate, setAddedCard, showCardAdded])

  return (
    <div className="flex min-h-full flex-col bg-[#dbe4f3] px-5 pb-8 pt-4 text-[#2a3f6b]">
      <div className="flex justify-end">
        <button
          onClick={() =>
            navigate(returnTo, { state: { reopenSheet: reopen }, replace: true })
          }
          className="text-[13px] font-bold uppercase tracking-wide underline"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <HsbcLogo />
        <span className="text-[24px] font-bold italic tracking-tight text-[#1a1f71]">
          VISA
        </span>
      </div>

      <h1 className="mt-8 text-center text-[18px] font-bold">
        Protecting your online payments
      </h1>
      <p className="mx-auto mt-3 max-w-[320px] text-center text-[13px] leading-5">
        If you're already logged on to the mobile app, please log off and log back
        on to see the request to approve the payment. Merchant Name :{' '}
        <span className="font-bold">STARHUB</span>
        <br />
        Amount :<br />
        Card Number : <span className="font-bold">************7228</span> By
        proceeding, you are deemed to have accepted the terms below
      </p>

      <div className="mt-7 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-[#2a3f6b]/40 px-5 py-2.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-pulse rounded-full bg-[#2a3f6b]"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-[#2a3f6b]/20 text-[13px]">
        <div className="flex items-center justify-between py-4">
          <span>Frequently asked questions</span>
          <span className="text-[18px]">+</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#2a3f6b]/20 py-4">
          <span>Terms and Conditions</span>
          <span className="text-[18px]">+</span>
        </div>
      </div>
    </div>
  )
}
