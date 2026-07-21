import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import { SheetPortal } from '../components/sheetPortal'
import { usePayment } from '../payment'

const EXPIRY_SECONDS = 4 * 60 + 59 // 04mins 59secs

function formatExpiry(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds)
  const mins = Math.floor(clamped / 60)
  const secs = clamped % 60
  return `${String(mins).padStart(2, '0')}mins ${String(secs).padStart(2, '0')}secs`
}

/* Generic QR-code-look placeholder — deterministic module pattern with the
   three classic finder squares, not a real scannable code (this is a
   design-only prototype, no live PayNow integration). */
function PayNowQr() {
  const size = 21
  const module = 7
  const px = size * module

  const isFinder = (i: number, j: number, baseI: number, baseJ: number) => {
    const li = i - baseI
    const lj = j - baseJ
    if (li < 0 || li > 6 || lj < 0 || lj > 6) return false
    if (li === 0 || li === 6 || lj === 0 || lj === 6) return true
    return li >= 2 && li <= 4 && lj >= 2 && lj <= 4
  }

  const cells: { x: number; y: number }[] = []
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let on = false
      if (i < 7 && j < 7) on = isFinder(i, j, 0, 0)
      else if (i < 7 && j >= size - 7) on = isFinder(i, j, 0, size - 7)
      else if (i >= size - 7 && j < 7) on = isFinder(i, j, size - 7, 0)
      else {
        const centerReserved = i >= 8 && i <= 12 && j >= 8 && j <= 12
        if (!centerReserved) on = (i * 13 + j * 7 + i * j) % 5 === 0 || (i + j) % 3 === 0
      }
      if (on) cells.push({ x: j * module, y: i * module })
    }
  }

  return (
    <div className="relative">
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden>
        <rect width={px} height={px} fill="white" />
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={module} height={module} fill="#141414" />
        ))}
      </svg>
      {/* PayNow badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center rounded-[8px] bg-white p-1 shadow-[0_2px_4px_rgba(20,20,20,0.15)]">
          <img src={ICON.payNowLogo} alt="PayNow" className="h-6 w-8 object-contain" />
        </div>
      </div>
    </div>
  )
}

export default function LegacyPayNow() {
  const navigate = useNavigate()
  const { setLegacyBillPaid } = usePayment()
  const [toast, setToast] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(false), 3600)
    return () => window.clearTimeout(t)
  }, [toast])

  // Real countdown, ticking from the moment the QR code is shown — the
  // "Pay within" text and the save-to-photos toast both read from the same
  // live value, so the toast reflects however much time was actually left
  // when the user saved it.
  useEffect(() => {
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <div className="relative flex min-h-full flex-col bg-[#fafafa]">
      {/* Green banner — wraps the header content directly (status bar +
          back + title) instead of a hardcoded height, so it's always
          exactly the content's natural height, no guessing. pb-10 (40px)
          inside is 24px spare buffer the white panel's -mt-6 overlaps into
          below (see ROUNDED-CORNER-OVERLAP.md) plus 16px of genuinely
          visible gap under the title. */}
      <div className="relative overflow-hidden bg-sh-green">
        <img
          aria-hidden
          src={IMG.homePortal}
          alt=""
          className="pointer-events-none absolute left-[-133px] top-[22px] z-0 h-[948px] w-[492px] max-w-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(102,102,102,0) 78.369%)',
          }}
        />

        <div className="relative z-10 pb-10">
          <StatusBar />

          {/* Back + title */}
          <div className="px-5 pt-[18px]">
            <button
              onClick={() => navigate(-1)}
              className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
            >
              <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
            </button>
            <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">
              Pay with PayNow
            </h1>
          </div>
        </div>
      </div>

      {/* White content panel — -mt-6 overlaps up into the green banner by
          the corner radius so the rounded top corner reveals green instead
          of the page background; pt-6 cancels the shift for the content
          itself. See Pay.tsx for the same fix. */}
      <div className="relative z-10 -mt-6 flex flex-1 flex-col items-center rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        <div className="w-full rounded-[24px] border border-sh-line bg-white p-4">
          <p className="text-center text-[16px] font-black leading-6 text-sh-ink">
            Your PayNow QR code
          </p>

          <div className="mt-4 flex flex-col items-center gap-1">
            <PayNowQr />
            <p className="mt-2 text-[18px] font-bold leading-7 text-sh-green-text">
              $142.00
            </p>
            <p className="text-[12px] leading-4 text-sh-ink">
              Pay within {formatExpiry(secondsLeft)}
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <p className="text-[12px] leading-4 text-sh-ink">
              <span className="font-bold">Step 1: </span>Save QR code to your photos.
            </p>
            <p className="text-[12px] leading-4 text-sh-ink">
              <span className="font-bold">Step 2: </span>Launch your banking app,
              upload the QR code.
            </p>
            <p className="text-[12px] leading-4 text-sh-ink">
              <span className="font-bold">Step 3: </span>Review the payment details
              and complete payment.
            </p>
          </div>
        </div>

        <button
          onClick={() => setToast(true)}
          className="mt-2 flex items-center gap-2 py-2 text-[14px] font-black tracking-[0.15px] text-sh-green-text active:opacity-70"
        >
          <AssetIcon src={ICON.download} size={24} />
          Save to photos
        </button>

        <div className="flex-1" />

        <button
          onClick={() => {
            setLegacyBillPaid(true)
            navigate(-2)
          }}
          className="h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink shadow-[0_16px_16px_-8px_rgba(20,20,20,0.1),0_4px_2px_rgba(20,20,20,0.05)] active:scale-[0.99]"
        >
          Back to My payment
        </button>
      </div>

      {/* Toast — pinned above the CTA: button (56px) + panel's own 48px
          bottom padding + 12px gap = 116px from the screen bottom. */}
      {toast && (
        <SheetPortal>
          <div className="pointer-events-none absolute inset-x-5 bottom-[116px] z-50">
            <div
              className="pointer-events-auto flex items-center gap-2 rounded-[16px] bg-[#434343] p-4 shadow-[0_16px_16px_rgba(20,20,20,0.1)]"
              style={{ animation: 'sheet-fade 0.2s ease-out' }}
            >
              <AssetIcon src={ICON.toastCheck} size={24} className="shrink-0" />
              <p className="text-[14px] leading-5 text-white">
                QR code saved. Launch your banking app and upload the QR code to
                complete your payment. Your QR code will expire in{' '}
                {formatExpiry(secondsLeft)}.
              </p>
            </div>
          </div>
        </SheetPortal>
      )}
    </div>
  )
}
