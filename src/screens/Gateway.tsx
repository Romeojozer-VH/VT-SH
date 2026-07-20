import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SheetPortal } from '../components/sheetPortal'
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
  const { setAddedCard, showCardAdded, setPendingReopenSheet } = usePayment()
  const [processing, setProcessing] = useState(false)

  const st = location.state as {
    brand?: CardBrand
    reopen?: string
  } | null
  const brand = st?.brand ?? 'visa'
  const reopen = st?.reopen

  // A real history pop, not a replace to a fixed path — Redirecting already
  // collapsed itself into this entry, so -1 lands exactly back on the
  // screen that opened the "add payment" sheet, with no duplicate entry
  // left behind for its own back button to snag on.
  const returnToCaller = () => {
    if (reopen) setPendingReopenSheet(reopen)
    navigate(-1)
  }

  const authenticate = () => {
    setProcessing(true)
    setTimeout(() => {
      setAddedCard({
        id: 'added-card',
        brand,
        last4: '7228',
        status: 'Expires 12/30',
      })
      showCardAdded()
      returnToCaller()
    }, 2100)
  }

  return (
    <div className="flex min-h-full flex-col bg-[#dbe4f3] px-5 pb-8 pt-4 text-[#2a3f6b]">
      <div className="flex justify-end">
        <button
          onClick={returnToCaller}
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
        Please review the card details below and tap Authenticate to securely add
        this card. Merchant Name :{' '}
        <span className="font-bold">STARHUB</span>
        <br />
        Card Number : <span className="font-bold">************7228</span> By
        proceeding, you are deemed to have accepted the terms below
      </p>

      <div className="mt-7 flex justify-center">
        <button
          onClick={authenticate}
          className="rounded-[3px] bg-[#1a3f8f] px-8 py-2.5 text-[14px] font-bold text-white active:opacity-90"
        >
          Authenticate and add card
        </button>
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

      {processing && (
        <SheetPortal>
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95">
            <div className="size-10 animate-spin rounded-full border-[3px] border-[#1a1a1a]/15 border-t-[#1a3f8f]" />
            <p className="text-[15px] font-semibold text-[#1a1a1a]">
              Authenticating…
            </p>
            <p className="text-[13px] text-[#666]">
              Please do not close or refresh this page.
            </p>
          </div>
        </SheetPortal>
      )}
    </div>
  )
}
