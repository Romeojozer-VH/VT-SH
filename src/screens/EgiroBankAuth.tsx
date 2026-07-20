import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SheetPortal } from '../components/sheetPortal'
import { usePayment } from '../payment'

/* generic bank wordmark — bank name is dynamic, so no real logo asset */
function BankWordmark({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[2px]">
        {[0, 1, 2].map((i) => (
          <span key={i} className="block h-4 w-[3px] -skew-x-12 bg-[#004a97]" />
        ))}
      </div>
      <span className="text-[18px] font-bold leading-none text-[#004a97]">{name}</span>
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

export default function EgiroBankAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAddedCard, showCardAdded, setPendingReopenSheet } = usePayment()
  const [processing, setProcessing] = useState(false)

  const st = location.state as {
    bank?: string
    name?: string
    email?: string
    reopen?: string
  } | null
  const bank = st?.bank ?? 'Your Bank'
  const name = st?.name ?? 'ACCOUNT HOLDER'
  const email = st?.email ?? 'you@example.com'
  const reopen = st?.reopen

  const authorize = () => {
    setProcessing(true)
    setTimeout(() => {
      setAddedCard({ id: 'added-card', brand: 'egiro', last4: '022', status: bank })
      showCardAdded()
      if (reopen) setPendingReopenSheet(reopen)
      // Two real pushes deep (AddEgiroAccount, then Redirecting collapsed
      // into this screen) — pop both to land back on the original caller
      // with no duplicate entry, skipping the form since it succeeded.
      navigate(-2)
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
          <BankWordmark name={bank} />
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#666]">
            eGIRO
          </span>
        </div>

        <p className="mt-4">
          <b>StarHub Epayment</b> is requesting authorization to set up recurring
          GIRO deductions from your account at <b>{bank}</b>. Please review the
          details below before proceeding.
        </p>

        <div className="mt-4 border border-[#333] p-3">
          <div className="flex flex-col gap-2">
            <Row label="Merchant" value="STARHUB EPAYMENT" />
            <Row label="Purpose" value="Recurring bill payment" />
            <Row label="Account holder" value={name.toUpperCase()} />
            <Row label="Email" value={email} />
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={authorize}
              className="rounded-[3px] bg-[#3b7fd4] py-2 text-[14px] font-bold text-white active:opacity-90"
            >
              Authorize
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-[3px] bg-[#3b7fd4] py-2 text-[14px] font-bold text-white active:opacity-90"
            >
              Cancel
            </button>
          </div>
        </div>

        <p className="mt-4 text-[13px]">
          If you did not initiate this request, do not authorize it and contact{' '}
          <span className="text-[#2f6fd0] underline">{bank} customer service</span>{' '}
          immediately.
        </p>

        <p className="mt-4 text-[11px] leading-4 text-[#666]">
          This is a simulated bank authorization page for prototype purposes only.
        </p>
      </div>

      {/* processing overlay */}
      {processing && (
        <SheetPortal>
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95">
            <div className="size-10 animate-spin rounded-full border-[3px] border-[#1a1a1a]/15 border-t-[#3b7fd4]" />
            <p className="text-[15px] font-semibold text-[#1a1a1a]">
              Linking account…
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
