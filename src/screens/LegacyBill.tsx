import { forwardRef, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo from '../components/CardLogo'
import { SheetPortal } from '../components/sheetPortal'
import { useSheetDrag } from '../hooks/useSheetDrag'
import type { PaymentFlowConfig } from '../payment'

// Any card option (Visa/Mastercard/AMEX) reuses the existing Review → CVV →
// Redirecting → BankOtp → Success flow, same as the rest of the app. Pay →
// LegacyBill → Review → Redirecting (replaced by Bank) → Success is 4 real
// pushes deep, so Success's "Done" needs to pop back exactly that far to
// land on Pay with no duplicate entry.
const LEGACY_CARD_PAY_FLOW: PaymentFlowConfig = {
  defaultCardId: 'amex',
  receipt: {
    eyebrow: 'Legacy account',
    name: 'Acc. 1.15655811A',
    description: 'Outstanding balance',
    date: '22 Jun 2026',
    amount: '$142.00',
    lineItems: [],
  },
  setPaidOnSuccess: false,
  setLegacyBillPaidOnSuccess: true,
  successTitle: 'Payment successful!',
  successDescription: 'Your payment has been received and successfully processed',
  doneToLabel: 'Back to My payment',
  doneTo: '/pay',
  doneToSteps: 4,
}

/* dashed tear-line (side notches are cut from the receipt via a mask) */
const TearLine = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="relative h-5">
    <div
      className="absolute inset-x-4 top-1/2 h-[1.5px] -translate-y-1/2"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, var(--color-sh-green) 0 4px, transparent 4px 8px)',
      }}
    />
  </div>
))
TearLine.displayName = 'TearLine'

// Line items grounded in real StarHub pricing (5G Unlimited+ tiers run
// $38–$188; HomeHub fibre broadband $29.55–$39.91 base, higher for
// bundled/"UltraSpeed" tiers; TV+ passes from $5.08). Tuned to sum to
// exactly the $142.00 total outstanding used across the rest of this
// scenario, so nothing else needed to change.
const LINE_ITEMS: [string, string][] = [
  ['5G+ Unlimited Core', '$38.00'],
  ['Mobile', '$22.00'],
  ['HomeHub+ UltraSpeed', '$42.90'],
  ['TV', '$19.90'],
  ['Broadband', '$19.20'],
  ['Total current charges', '$142.00'],
  ['Previous balance', '$0.00'],
  ['Previous payment', '$0.00'],
]

/* receipt-style bill — account + bill-cycle header, itemized charges,
   total outstanding footer */
function Bill() {
  const bodyRef = useRef<HTMLDivElement>(null)
  const t1 = useRef<HTMLDivElement>(null)
  const t2 = useRef<HTMLDivElement>(null)
  const [mask, setMask] = useState<string | undefined>()

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body || !t1.current || !t2.current) return
    const r = 10
    const hole = (x: string, y: number) =>
      `radial-gradient(circle ${r}px at ${x} ${y}px, transparent ${r}px, #000 ${r + 0.5}px)`
    const y1 = t1.current.offsetTop + t1.current.offsetHeight / 2
    const y2 = t2.current.offsetTop + t2.current.offsetHeight / 2
    setMask([hole('0%', y1), hole('100%', y1), hole('0%', y2), hole('100%', y2)].join(', '))
  }, [])

  return (
    <>
      {/* 1px uniform outline hugging the whole receipt silhouette
          (zigzag edges + side notch curves) via alpha dilation */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="legacy-bill-outline">
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="1"
              result="dilated"
            />
            <feFlood floodColor="#1ed760" />
            <feComposite in2="dilated" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div style={{ filter: 'url(#legacy-bill-outline)' }}>
        <img
          src={IMG.receiptTop}
          alt=""
          aria-hidden
          className="relative z-0 block h-2 w-full"
        />

        <div
          ref={bodyRef}
          className="relative z-10 -mt-[3px] bg-white"
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
        >
          <div className="flex flex-col gap-0.5 px-4 pb-4 pt-[21px]">
            <p className="text-[16px] font-bold leading-5 text-sh-ink">
              Acc. 1.15655811A
            </p>
            <p className="text-[14px] leading-5 text-[#434343]">
              Bill cycle: 24 May 26 – 23 Jun 26
            </p>
          </div>

          <TearLine ref={t1} />

          <div className="flex flex-col gap-2 px-4 py-3">
            {LINE_ITEMS.map(([name, price]) => (
              <div key={name} className="flex items-center justify-between">
                <p className="text-[14px] leading-5 text-[#727272]">{name}</p>
                <p className="text-[14px] font-black leading-5 text-sh-ink">{price}</p>
              </div>
            ))}
          </div>

          <TearLine ref={t2} />

          <div className="flex items-center justify-between px-4 pb-[21px] pt-3">
            <p className="text-[14px] font-bold leading-5 text-[#727272]">
              Total outstanding (bill)
            </p>
            <p className="text-[14px] font-black leading-5 text-sh-ink">$142.00</p>
          </div>
        </div>

        <img
          src={IMG.receiptBottom}
          alt=""
          aria-hidden
          className="relative z-0 -mt-[3px] block h-2 w-full"
        />
      </div>
    </>
  )
}

/* small PayNow badge — matches the mark used on the QR screen */
function PayNowLogo() {
  return (
    <img
      src={ICON.payNowLogo}
      alt="PayNow"
      className="h-6 w-8 shrink-0 object-contain"
    />
  )
}

/* ---------- "Choose a payment method" bottom sheet ---------- */
function PaymentMethodRow({
  logo,
  label,
  onClick,
}: {
  logo: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-[24px] border border-sh-line bg-white p-4 text-left shadow-[0_2px_8px_rgba(20,20,20,0.1)] active:scale-[0.99]"
    >
      {logo}
      <span className="flex-1 text-[16px] font-bold leading-5 text-sh-ink">{label}</span>
      <AssetIcon src={ICON.chevron} size={16} className="shrink-0" />
    </button>
  )
}

/* ================= LEGACY BILL SCREEN ================= */
export default function LegacyBill() {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeSheet = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheetOpen(false)
      setClosing(false)
    }, 260)
  }
  const drag = useSheetDrag(closeSheet)
  // Let the sheet's own close animation finish before navigating away,
  // rather than cutting it off mid-close.
  const selectPayNow = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheetOpen(false)
      setClosing(false)
      navigate('/legacy-paynow')
    }, 260)
  }
  const selectCard = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheetOpen(false)
      setClosing(false)
      navigate('/review', { state: { flow: LEGACY_CARD_PAY_FLOW } })
    }, 260)
  }

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
            <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">Bill</h1>
          </div>
        </div>
      </div>

      {/* White content panel — 20px sides / 24px top / 48px bottom.
          -mt-6 (-24px) overlaps this panel's own box up into the green
          banner by exactly the corner radius, so the rounded top corner
          reveals green behind it instead of the page background — plain
          adjacency to the fixed-height banner isn't enough (see Pay.tsx for
          the same fix). pt-6 below cancels the shift for the actual
          content, matching Figma's Content Container position exactly. */}
      <div className="relative z-10 -mt-6 flex-1 rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        <Bill />

        <div className="mt-6 flex justify-center">
          <button className="flex h-9 items-center gap-1 rounded-full border border-sh-line bg-white px-4 text-[14px] font-black tracking-[0.15px] text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95">
            <AssetIcon src={ICON.filePdf} size={16} />
            View PDF bill
          </button>
        </div>

        <div className="my-8 h-px w-full bg-sh-line" />

        <p className="mb-3 text-[16px] font-black leading-6 text-sh-ink">Payment</p>

        <div className="rounded-[24px] border border-sh-line bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[16px] font-bold leading-5 text-sh-ink">
              Outstanding balance
            </p>
            <div className="flex flex-col items-end gap-0.5">
              <p className="whitespace-nowrap text-[12px] leading-4 text-[#727272]">
                As on 22 Jun 2026
              </p>
              <p className="whitespace-nowrap text-[24px] font-black leading-8 text-sh-ink">
                $142.00
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          className="mt-6 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink shadow-[0_16px_16px_-8px_rgba(20,20,20,0.1),0_4px_2px_rgba(20,20,20,0.05)] active:scale-[0.99]"
        >
          Make one-time payment now
        </button>
      </div>

      {sheetOpen && (
        <SheetPortal>
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className={`absolute inset-0 bg-[#141414]/85 ${
                closing ? 'sheet-scrim-out' : 'sheet-scrim'
              }`}
              onClick={closeSheet}
            />
            <div
              {...drag.handlers}
              style={drag.style}
              className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-12 pt-6 ${
                closing ? 'sheet-panel-out' : 'sheet-panel'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[20px] font-black leading-6 text-sh-ink">
                  Choose a payment method
                </h3>
                <button
                  onClick={closeSheet}
                  aria-label="Close"
                  className="shrink-0 text-sh-ink"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-6 flex items-start gap-2">
                <AssetIcon src={ICON.info} size={16} className="mt-0.5 shrink-0" />
                <p className="text-[14px] leading-5 text-sh-ink">
                  Note: These are non-recurring. Set up your credit card or GIRO to
                  avoid disruption
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <PaymentMethodRow
                  logo={<CardLogo brand="visa" />}
                  label="Visa"
                  onClick={selectCard}
                />
                <PaymentMethodRow
                  logo={<CardLogo brand="mastercard" />}
                  label="Mastercard"
                  onClick={selectCard}
                />
                <PaymentMethodRow
                  logo={<CardLogo brand="amex" />}
                  label="AMEX"
                  onClick={selectCard}
                />
                <PaymentMethodRow
                  logo={<PayNowLogo />}
                  label="PayNow"
                  onClick={selectPayNow}
                />
              </div>
            </div>
          </div>
        </SheetPortal>
      )}
    </div>
  )
}
