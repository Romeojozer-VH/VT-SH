import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ICON } from '../components/icons'
import { usePayment } from '../payment'

/* rough UOB wordmark */
function UobLogo() {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="block h-4 w-[3px] -skew-x-12 bg-[#e2231a]" />
        ))}
      </div>
      <span className="text-[22px] font-bold leading-none">
        <span className="text-[#e2231a]">U</span>
        <span className="text-[#004a97]">OB</span>
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-[92px] shrink-0 text-right font-bold">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

export default function BankOtp() {
  const navigate = useNavigate()
  const { setPaid } = usePayment()
  const [processing, setProcessing] = useState(false)

  const pay = () => {
    setProcessing(true)
    setTimeout(() => {
      setPaid(true)
      navigate('/success')
    }, 2100)
  }

  return (
    <div className="relative flex min-h-full flex-col bg-white">
      {/* in-app browser chrome */}
      <div className="bg-[#1f1f1f] text-white">
        <div className="flex items-center justify-between px-6 pb-1 pt-3">
          <span className="text-[15px] font-semibold">11:29</span>
          <div className="flex items-center gap-1.5">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="white">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5" width="3" height="7" rx="1" />
              <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
              <path d="M8.5 2C5.6 2 2.9 3 .9 4.9l1.6 1.7C4 5 6.2 4.2 8.5 4.2S13 5 14.5 6.6l1.6-1.7C14.1 3 11.4 2 8.5 2Z" />
              <circle cx="8.5" cy="11" r="1.2" />
            </svg>
            <div className="flex h-[12px] w-[24px] items-center rounded-[3px] border border-white/60 px-[1px]">
              <div className="h-[8px] w-full rounded-[1px] bg-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="text-[16px] font-semibold text-[#3bd15f]"
          >
            Done
          </button>
          <div className="flex items-center gap-7 text-[14px]">
            <span className="text-[#3bd15f]">◀</span>
            <span className="text-white/30">▶</span>
          </div>
        </div>
      </div>

      {/* bank page */}
      <div className="flex-1 px-4 py-4 text-[14px] leading-5 text-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <img src={ICON.visa} alt="Visa" className="h-6 w-auto" />
          <UobLogo />
        </div>

        <p className="mt-4">
          For added security, an SMS One-time Password (OTP) is required to
          complete this transaction. Please enter the SMS-OTP which has been sent
          to your mobile phone (<b>XXXX3056</b>).
        </p>

        <div className="mt-4 border border-[#333] p-3">
          <div className="flex flex-col gap-2">
            <Row label="Merchant" value="STARHUB EPAYMENT" />
            <Row label="Amount" value="SGD 1.00" />
            <Row label="Date" value="11/05/2023" />
            <Row label="Card Number" value="426588******3841" />
            <div className="flex items-center gap-2">
              <span className="w-[92px] shrink-0 text-right font-bold">
                SMS-OTP:
              </span>
              <span className="font-bold">MC9O</span>
              <input
                value="••••••"
                readOnly
                className="min-w-0 flex-1 border border-[#999] px-2 py-1 tracking-widest"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={pay}
              className="rounded-[3px] bg-[#3b7fd4] py-2 text-[14px] font-bold text-white active:opacity-90"
            >
              Proceed
            </button>
            <button className="rounded-[3px] bg-[#3b7fd4] py-2 text-[14px] font-bold text-white active:opacity-90">
              Get Another SMS-OTP
            </button>
            <button
              onClick={() => navigate('/pay')}
              className="rounded-[3px] bg-[#3b7fd4] py-2 text-[14px] font-bold text-white active:opacity-90"
            >
              Cancel
            </button>
          </div>
        </div>

        <p className="mt-4 text-[13px]">
          If <b>XXXX3056</b> is not your mobile phone number, please complete the{' '}
          <span className="text-[#2f6fd0] underline">2FA Registration/Update Form</span>{' '}
          (available on the <span className="text-[#2f6fd0] underline">UOB website</span>)
          and mail it to us.
        </p>

        <p className="mt-4 text-[11px] leading-4 text-[#666]">
          Copyright © 2019 United Overseas Bank Limited Co. Reg. No. 193500026Z.
          All Rights Reserved.
        </p>
      </div>

      {/* payment gateway processing overlay */}
      {processing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95">
          <div className="size-10 animate-spin rounded-full border-[3px] border-[#1a1a1a]/15 border-t-[#3b7fd4]" />
          <p className="text-[15px] font-semibold text-[#1a1a1a]">
            Processing payment…
          </p>
          <p className="text-[13px] text-[#666]">
            Please do not close or refresh this page.
          </p>
        </div>
      )}
    </div>
  )
}
