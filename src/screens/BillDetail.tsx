import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'

export interface BillDetailState {
  account: string
  billCycle: string
  lineItems: [string, string][]
  total: string
}

const DEFAULT_STATE: BillDetailState = {
  account: 'Acc. 1.15655811A',
  billCycle: '24 May 26 – 23 Jun 26',
  lineItems: [
    ['5G+ Unlimited Core', '$30.25'],
    ['Mobile', '$25.25'],
    ['HomeHub+ UltraSpeed', '$40.25'],
    ['TV', '$25.25'],
    ['Broadband', '$21.00'],
    ['Total current charges', '$142.00'],
    ['Previous balance', '$00.00'],
    ['Previous payment', '-$00.00'],
  ],
  total: '$142.00',
}

/* single dashed tear-line (side notches cut from the receipt via a mask) —
   same technique as LegacyBill.tsx's Bill component, duplicated locally
   per this codebase's convention (each receipt screen owns its own copy
   since the mask math is tied to that screen's own ref layout). This
   screen only has one tear-line (between the itemized charges and the
   total), unlike LegacyBill's two. */
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

/* receipt-style read-only bill — a settled past bill's itemized charges,
   generic via route state so other bill entries could reuse this. */
function Receipt({ data }: { data: BillDetailState }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const t1 = useRef<HTMLDivElement>(null)
  const [mask, setMask] = useState<string | undefined>()

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body || !t1.current) return
    const r = 10
    const hole = (x: string, y: number) =>
      `radial-gradient(circle ${r}px at ${x} ${y}px, transparent ${r}px, #000 ${r + 0.5}px)`
    const y1 = t1.current.offsetTop + t1.current.offsetHeight / 2
    setMask([hole('0%', y1), hole('100%', y1)].join(', '))
  }, [])

  return (
    <>
      {/* 1px uniform outline hugging the whole receipt silhouette (zigzag
          edges + side notch curves) via alpha dilation — same technique as
          LegacyBill.tsx's Bill component. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="bill-detail-outline">
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
      <div style={{ filter: 'url(#bill-detail-outline)' }}>
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
            <p className="text-[16px] font-bold leading-5 text-sh-ink">{data.account}</p>
            <p className="text-[14px] leading-5 text-[#434343]">
              Bill cycle: {data.billCycle}
            </p>
          </div>

          <div className="flex flex-col gap-2 px-4 py-3">
            {data.lineItems.map(([name, price]) => (
              <div key={name} className="flex items-center justify-between">
                <p className="text-[14px] leading-5 text-[#727272]">{name}</p>
                <p className="text-[14px] font-black leading-5 text-sh-ink">{price}</p>
              </div>
            ))}
          </div>

          <TearLine ref={t1} />

          <div className="flex items-center justify-between px-4 pb-6 pt-3">
            <p className="text-[14px] font-bold leading-5 text-[#727272]">
              Total outstanding (bill)
            </p>
            <p className="text-[14px] font-black leading-5 text-sh-ink">{data.total}</p>
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

export default function BillDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = (location.state as BillDetailState | null) ?? DEFAULT_STATE

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-sh-green">
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
          <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">Bill detail</h1>
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
