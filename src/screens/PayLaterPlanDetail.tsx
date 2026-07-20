import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import InfoSheet from '../components/InfoSheet'
import { SheetPortal } from '../components/sheetPortal'
import { useSheetDrag } from '../hooks/useSheetDrag'
import type { PaymentFlowConfig } from '../payment'

const CANCEL_PLAN_FLOW: PaymentFlowConfig = {
  defaultCardId: 'amex',
  receipt: {
    eyebrow: 'Pay later plan',
    name: 'Apple iPhone 17 Pro',
    description: 'Remaining balance',
    date: '19 Jul 2026',
    amount: '$1,787.30',
    lineItems: [],
  },
  setPaidOnSuccess: false,
  successTitle: 'Plan cancelled!',
  successDescription:
    'Your Pay later plan has been cancelled and the remaining balance has been paid.',
  doneToLabel: 'Back to Pay later plans',
  doneTo: '/paylater-plans',
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

/* receipt-style "Pay later plan overview" bill */
function PlanBill() {
  const bodyRef = useRef<HTMLDivElement>(null)
  const t1 = useRef<HTMLDivElement>(null)
  const [mask, setMask] = useState<string | undefined>()

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body || !t1.current) return
    const r = 10
    const y1 = t1.current.offsetTop + t1.current.offsetHeight / 2
    const hole = (x: string, y: number) =>
      `radial-gradient(circle ${r}px at ${x} ${y}px, transparent ${r}px, #000 ${r + 0.5}px)`
    setMask([hole('0%', y1), hole('100%', y1)].join(', '))
  }, [])

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="planbill-outline">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="dilated" />
            <feFlood floodColor="#1ed760" />
            <feComposite in2="dilated" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div style={{ filter: 'url(#planbill-outline)' }}>
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
          <div className="flex items-start gap-2.5 px-4 pb-2 pt-[21px]">
            <div className="flex-1">
              <p className="text-[16px] font-bold leading-5 text-sh-ink">
                Apple iPhone 17 Pro
              </p>
              <p className="text-[12px] leading-4 text-[#727272]">
                $300 device discount*
              </p>
              <p className="text-[12px] leading-4 text-[#727272]">
                250 DeviceDollars redeemed
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[16px] font-black leading-5 text-sh-ink">$1219.00</p>
              <p className="text-[12px] leading-4 text-[#727272]">$1,769.00</p>
            </div>
          </div>

          <TearLine ref={t1} />

          <div className="flex flex-col gap-2 px-4 py-3">
            {[
              ['Apple iPhone 17 Pro', '$100.00'],
              ['Apple Watch S8', '$42.00'],
              ['Apple iPad Pro', '$60.00'],
            ].map(([name, price]) => (
              <div key={name} className="flex items-center justify-between">
                <p className="text-[14px] leading-5 text-[#727272]">{name}</p>
                <p className="text-[14px] font-black leading-5 text-sh-ink">{price}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 pb-3 pt-3">
            <p className="text-[14px] font-bold leading-5 text-[#727272]">Total</p>
            <p className="text-[14px] font-black leading-5 text-sh-ink">$2,659.00</p>
          </div>

          <div className="px-4">
            <div className="h-px w-full bg-[#a8edb2]" />
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-[14px] leading-[18px] text-sh-ink">
              Pay later payment terms
            </p>
            <p className="text-[14px] leading-[18px] text-sh-ink">x24 mths</p>
          </div>

          <div className="px-4">
            <div className="h-px w-full bg-sh-line" />
          </div>

          <div className="flex items-center justify-between px-4 pb-[21px] pt-3">
            <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
              Monthly pay later payment
            </p>
            <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
              $110.79<span className="font-normal">/mth</span>
            </p>
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

export default function PayLaterPlanDetail() {
  const navigate = useNavigate()
  const [sheet, setSheet] = useState<
    'none' | 'balance' | 'deviceDollars' | 'cancel'
  >('none')
  const [closing, setClosing] = useState(false)
  const closeSheet = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheet('none')
      setClosing(false)
    }, 260)
  }
  const drag = useSheetDrag(closeSheet)
  const confirmCancel = () => {
    setClosing(true)
    window.setTimeout(() => {
      navigate('/review', { state: { flow: CANCEL_PLAN_FLOW } })
    }, 260)
  }

  return (
    <div className="relative flex min-h-full flex-col bg-[#fafafa]">
      {/* Green banner (flat rectangle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[140px] overflow-hidden bg-sh-green"
      >
        <img
          src={IMG.homePortal}
          alt=""
          className="absolute left-[-133px] top-[22px] h-[948px] w-[492px] max-w-none"
        />
        <div
          className="absolute inset-x-0 top-0 h-[60px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(102,102,102,0) 78.369%)',
          }}
        />
      </div>

      <StatusBar />

      {/* Back button */}
      <div className="relative z-10 px-5 pt-[18px]">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
      </div>

      {/* White content panel */}
      <div className="relative z-10 mt-3 flex flex-1 flex-col gap-8 rounded-t-[24px] bg-[#fafafa] px-5 pb-8 pt-6">
        {/* Plan header */}
        <div className="flex items-center gap-2">
          <AssetIcon src={ICON.payLaterRecurring} size={48} className="shrink-0" />
          <div className="flex-1">
            <p className="text-[24px] font-bold leading-8 text-sh-ink">
              Apple iPhone 17 Pro
            </p>
            <p className="text-[12px] leading-4 text-sh-ink">
              + Apple Watch Series8 x2, iPad Pro
            </p>
          </div>
        </div>

        {/* Current bill card */}
        <div className="rounded-[24px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                Instalment plan
              </p>
              <p className="mt-1 text-[16px] font-bold leading-5 text-sh-ink">
                Apple iPhone17 Pro Max
              </p>
              <p className="text-[16px] font-bold leading-5 text-sh-ink">
                256GB Starlight
              </p>
              <div className="mt-1 flex items-center gap-1">
                <AssetIcon src={ICON.deviceMobile} size={16} />
                <p className="text-[14px] leading-5 text-[#434343]">9123 4567</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="whitespace-nowrap text-[12px] leading-4 text-[#727272]">
                Payment due 17 Oct
              </p>
              <p className="text-[24px] font-black leading-8 text-sh-ink">$70.79</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <p className="text-[13.33px] leading-[19px] text-sh-ink">
              <span className="font-bold">3 paid</span> of 24 instalments
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
              <div className="h-full w-[12.5%] rounded-full bg-[#35db70]" />
            </div>
          </div>

          <div className="my-4 h-px w-full bg-sh-line" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-[14px] font-bold leading-5 text-sh-ink">
                  Balance left
                </p>
                <button onClick={() => setSheet('balance')} aria-label="What is Balance Left?">
                  <AssetIcon src={ICON.helpCircle} size={16} />
                </button>
              </div>
              <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
                $1,787.30
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold leading-5 text-sh-ink">End date</p>
              <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
                15 May 2026
              </p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="flex flex-col gap-4">
          <p className="text-[16px] font-black leading-5 text-sh-ink">Payment</p>
          <div className="rounded-[24px] border border-sh-line bg-white p-4 shadow-[0_2px_8px_rgba(20,20,20,0.1)]">
            <div className="flex items-start gap-3">
              <img src={ICON.visa} alt="Visa" className="h-6 w-8" />
              <div className="flex-1">
                <p className="text-[16px] font-bold leading-5 text-sh-ink">**** 1234</p>
                <p className="mt-0.5 text-[14px] leading-5 text-[#434343]">
                  Expires 02/28
                </p>
              </div>
              <AssetIcon src={ICON.chevron} size={16} className="mt-1 self-center" />
            </div>

            <div className="my-4 h-px w-full bg-sh-line" />

            <div className="flex items-start gap-2">
              <AssetIcon src={ICON.savings} size={32} className="shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
                    DeviceDollars
                  </p>
                  <button
                    onClick={() => setSheet('deviceDollars')}
                    aria-label="What are DeviceDollars?"
                  >
                    <AssetIcon src={ICON.helpCircle} size={16} />
                  </button>
                </div>
                <p className="mt-1 text-[16px] font-bold leading-5 text-sh-ink">10.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pay later plan overview */}
        <div className="flex flex-col gap-4">
          <p className="text-[16px] font-black leading-5 text-sh-ink">
            Pay later plan overview
          </p>
          <PlanBill />
        </div>

        {/* Cancel */}
        <div className="flex flex-col gap-6 text-center">
          <button
            onClick={() => setSheet('cancel')}
            className="text-[14px] font-black leading-5 tracking-[0.15px] text-sh-ink"
          >
            Cancel this plan
          </button>
          <p className="text-[12px] leading-4 text-[#434343]">
            <span className="font-bold">*Note:</span> Cancelling this plan may cause you
            to lose the discounts tied to your BNPL device purchase. The unused discount
            will be prorated according to the remaining instalment period.
          </p>
        </div>
      </div>

      {sheet === 'balance' && (
        <InfoSheet
          icon={ICON.calendarRecurring}
          title="What is Balance Left?"
          description="Balance Left shows the remaining amount outstanding after all payments received to date have been applied."
          closing={closing}
          onClose={closeSheet}
        />
      )}
      {sheet === 'deviceDollars' && (
        <InfoSheet
          icon={ICON.savings}
          title="What are DeviceDollars?"
          rate={{ left: '1 DeviceDollar', right: 'SGD 1' }}
          description="Earn DeviceDollars every month on an eligible 5G plan. They're automatically applied to your monthly instalments to reduce what you pay each month."
          closing={closing}
          onClose={closeSheet}
        />
      )}
      {sheet === 'cancel' && (
        <SheetPortal>
          <div className="absolute inset-0 z-[70] flex flex-col justify-end">
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
                  Are you sure you want to cancel this Pay later plan?
                </h3>
                <button onClick={closeSheet} aria-label="Close" className="shrink-0 text-sh-ink">
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

              <div className="mt-6 flex flex-col gap-6">
                <p className="text-[16px] leading-6 text-sh-ink">
                  You will be required to pay the remaining balance on this Pay later
                  plan.
                </p>
                <p className="text-[12px] leading-4 text-sh-ink">
                  <span className="font-bold">*Note</span>: If you cancel, the Pay later
                  discount that you received will be pro-rated and charged to you.
                </p>
              </div>

              <button
                onClick={confirmCancel}
                className="mt-6 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
              >
                Continue
              </button>
            </div>
          </div>
        </SheetPortal>
      )}
    </div>
  )
}
