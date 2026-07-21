import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'

type PaymentMethodInfo =
  | { type: 'paynow' }
  | { type: 'card'; brand: CardBrand; label: string; last4: string }

export interface TransactionDetailState {
  eyebrow: string
  name: string
  desc?: string
  date: string
  amount: string
  /** Recurring monthly charge line — omit for a one-off transaction. */
  monthlyAmount?: string
  paymentMethod: PaymentMethodInfo
  transactionId: string
}

const DEFAULT_STATE: TransactionDetailState = {
  eyebrow: 'Legacy account',
  name: 'Acc. 1.15655811A',
  desc: '2 mobiles, 1 TVs, 1 broadband, 1 DV',
  date: '22 Jun 2026',
  amount: '$142.00',
  monthlyAmount: '$142.00/mth',
  paymentMethod: { type: 'paynow' },
  transactionId: '1155811Afhtesx22467',
}

/* dashed tear-line (side notches are cut from the receipt via a mask) —
   same technique as LegacyBill.tsx's Bill component, duplicated locally
   per this codebase's convention (each receipt screen owns its own copy
   since the mask math is tied to that screen's own ref layout). */
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

/* receipt-style transaction detail — generic, driven entirely by route
   state so it can represent any past-activity row (Legacy's manual bill,
   a SuperNova recurring mobile charge, etc). */
function Receipt({ data }: { data: TransactionDetailState }) {
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
      {/* 1px uniform outline hugging the whole receipt silhouette (zigzag
          edges + side notch curves) via alpha dilation — same technique as
          LegacyBill.tsx's Bill component. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="txn-detail-outline">
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
      <div style={{ filter: 'url(#txn-detail-outline)' }}>
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
          <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-[21px]">
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                {data.eyebrow}
              </p>
              <p className="text-[16px] font-bold leading-5 text-sh-ink">{data.name}</p>
              {data.desc && (
                <p className="text-[14px] leading-5 text-[#434343]">{data.desc}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <p className="whitespace-nowrap text-[12px] leading-4 text-[#727272]">
                {data.date}
              </p>
              <p className="whitespace-nowrap text-[16px] font-black leading-5 text-sh-ink">
                {data.amount}
              </p>
            </div>
          </div>

          <TearLine ref={t1} />

          <div className="flex flex-col gap-2 px-4 py-3">
            {data.monthlyAmount ? (
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-5 text-[#727272]">Monthly payment</p>
                <p className="text-[14px] font-black leading-5 text-sh-ink">
                  {data.monthlyAmount.split('/')[0]}
                  <span className="font-normal">/{data.monthlyAmount.split('/')[1]}</span>
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-[14px] leading-5 text-[#727272]">Amount</p>
                <p className="text-[14px] font-black leading-5 text-sh-ink">{data.amount}</p>
              </div>
            )}
          </div>

          <TearLine ref={t2} />

          <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold leading-5 text-[#727272]">Amount paid</p>
              <p className="text-[14px] font-black leading-5 text-sh-ink">{data.amount}</p>
            </div>

            <div className="h-px w-full bg-sh-line" />

            <div className="flex flex-col gap-1">
              <p className="text-[14px] leading-5 text-[#727272]">Payment method</p>
              <div className="flex items-center gap-2">
                {data.paymentMethod.type === 'card' ? (
                  <>
                    <CardLogo brand={data.paymentMethod.brand} />
                    <span className="text-[14px] font-bold text-sh-ink">
                      {data.paymentMethod.label} Ending {data.paymentMethod.last4}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={ICON.payNowLogo}
                      alt="PayNow"
                      className="h-6 w-8 shrink-0 object-contain"
                    />
                    <span className="text-[14px] font-bold text-sh-ink">PayNow</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[14px] leading-5 text-[#727272]">Transaction ID</p>
              <p className="text-[14px] font-bold text-sh-ink">{data.transactionId}</p>
            </div>
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

export default function TransactionDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = (location.state as TransactionDetailState | null) ?? DEFAULT_STATE

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-sh-green">
      {/* Green all the way down (branding) — no white content panel on
          this screen, unlike LegacyBill.tsx/Pay.tsx's pattern, so none of
          the rounded-corner-overlap trick is needed here. */}
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

      <div className="relative z-10">
        <StatusBar />

        <div className="px-5 pt-[18px]">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
          >
            <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
          </button>
          <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">
            Transaction detail
          </h1>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-5 pb-12 pt-6">
        <Receipt data={data} />

        <div className="mt-6 flex justify-center">
          <button className="flex h-9 items-center gap-1 rounded-full border border-sh-line bg-white px-4 text-[14px] font-black tracking-[0.15px] text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95">
            <AssetIcon src={ICON.filePdf} size={16} />
            View PDF receipt
          </button>
        </div>
      </div>
    </div>
  )
}
