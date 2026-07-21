import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'
import { SheetPortal } from '../components/sheetPortal'
import { useSheetDrag } from '../hooks/useSheetDrag'
import { usePayment } from '../payment'

interface ServiceItem {
  icon: string
  title: string
  subtitle: string
}

interface TargetCard {
  brand: CardBrand
  last4: string
  expires: string
}

const groups: { label: string; items: ServiceItem[] }[] = [
  {
    label: 'Mobile',
    items: [
      { icon: ICON.mobileSim, title: '9111 2222', subtitle: '5G+ Unlimited Core' },
      { icon: ICON.mobileSim, title: '9822 4488', subtitle: '5G Senior' },
    ],
  },
  {
    label: 'Prepaid',
    items: [{ icon: ICON.mobileSim, title: '9134 1396', subtitle: 'Prepaid' }],
  },
  {
    label: 'Broadband',
    items: [
      {
        icon: ICON.internet,
        title: 'Blk 511, Ocean Avenue, #12-345, 123456',
        subtitle: 'UltraSpeed 10Gbps',
      },
      { icon: ICON.internet, title: '9111 2222', subtitle: 'Digital voice home' },
    ],
  },
  {
    label: 'Entertainment',
    items: [
      { icon: ICON.wifi, title: 'StarHub TV+', subtitle: 'Entertainment plan' },
    ],
  },
]

export default function PaymentByServices() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUpdateCtx } = usePayment()

  const targetCard = (location.state as { targetCard?: TargetCard } | null)
    ?.targetCard

  const [confirmItem, setConfirmItem] = useState<
    (ServiceItem & { group: string }) | null
  >(null)
  const [closing, setClosing] = useState(false)
  const closeSheet = () => {
    setClosing(true)
    window.setTimeout(() => {
      setConfirmItem(null)
      setClosing(false)
    }, 260)
  }
  const drag = useSheetDrag(closeSheet)

  const selectService = (item: ServiceItem, group: string) => {
    if (targetCard) {
      // target card already known — skip the picker, go straight to confirmation
      setConfirmItem({ ...item, group })
      return
    }
    setUpdateCtx({
      description: null,
      services: [{ icon: item.icon, eyebrow: group, title: item.title }],
      current: {
        brand: 'visa',
        last4: '1234',
        expires: 'Expires 02/28',
      },
      options: [
        { id: 'amex', brand: 'amex', last4: '8824', status: 'Expires 04/28' },
        { id: 'mc', brand: 'mastercard', last4: '1112', status: 'Expires 06/28' },
      ],
      back: '/payment-by-services',
      doneTo: '/payment-by-services',
      doneToSteps: 2,
    })
    navigate('/update-payment')
  }

  const confirmLink = () => {
    if (!confirmItem || !targetCard) return
    navigate('/card-updated', {
      state: {
        title: 'Payment method successfully updated',
        description: `Your ${confirmItem.title} is now linked to **** ${targetCard.last4}.`,
        doneTo: '/payment-methods',
        doneToSteps: 3,
      },
    })
  }

  return (
    <div className="relative flex min-h-full flex-col bg-[#fafafa]">
      {/* Green banner (flat rectangle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[220px] overflow-hidden bg-sh-green"
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

      {/* Back + title */}
      <div className="relative z-10 px-5 pt-[18px]">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
        <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">
          Manage payment by services
        </h1>
      </div>

      {/* White content panel — 24px top / 20px sides / 48px bottom.
          Its rounded top corners tuck up under the green header. */}
      <div className="relative z-10 mt-3 flex-1 rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        {targetCard && (
          <div className="mb-6 flex items-center gap-3 rounded-[16px] border border-sh-line bg-white p-4">
            <CardLogo brand={targetCard.brand} />
            <p className="text-[14px] leading-5 text-sh-ink">
              Services you add will be linked to{' '}
              <span className="font-bold">**** {targetCard.last4}</span>.
            </p>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.label} className="mb-6 last:mb-0">
            <h2 className="mb-3 text-[16px] font-black text-sh-ink">{g.label}</h2>
            <div className="flex flex-col gap-2">
              {g.items.map((it, i) => (
                <button
                  key={i}
                  onClick={() => selectService(it, g.label)}
                  className="flex w-full items-start gap-3 rounded-[24px] bg-white p-4 text-left shadow-[inset_0_0_0_1px_#dadbda,0_2px_8px_rgba(20,20,20,0.1)] active:scale-[0.99]"
                >
                  <AssetIcon src={it.icon} size={32} className="shrink-0" />
                  <div className="flex-1">
                    <p className="text-[16px] font-bold leading-5 text-sh-ink">
                      {it.title}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                      {it.subtitle}
                    </p>
                  </div>
                  <AssetIcon src={ICON.chevron} size={20} className="shrink-0 self-center" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* direct-link confirmation sheet (only used when a target card is known) */}
      {confirmItem && targetCard && (
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
              className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-8 pt-6 ${
                closing ? 'sheet-panel-out' : 'sheet-panel'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[20px] font-black leading-6 text-sh-ink">
                  Review changes
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

              <p className="mt-2 text-[16px] leading-6 text-sh-ink">
                {confirmItem.title} will be linked to **** {targetCard.last4} moving
                forward.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-sh-line p-4">
                <AssetIcon src={confirmItem.icon} size={32} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                    {confirmItem.group}
                  </p>
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    {confirmItem.title}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-sh-line p-4">
                <CardLogo brand={targetCard.brand} />
                <div className="flex-1">
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    **** {targetCard.last4}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                    {targetCard.expires}
                  </p>
                </div>
              </div>

              <button
                onClick={confirmLink}
                className="mt-6 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
              >
                Confirm
              </button>
            </div>
          </div>
        </SheetPortal>
      )}
    </div>
  )
}
