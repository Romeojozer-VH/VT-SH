import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, MaskIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'
import { SheetPortal } from '../components/sheetPortal'
import { useSheetDrag } from '../hooks/useSheetDrag'
import { usePayment } from '../payment'

interface CardInfo {
  id?: string
  brand: CardBrand
  last4: string
  expires: string
  warn?: boolean
  connected?: boolean
}

const services = [
  { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9122 1118' },
  {
    icon: ICON.internet,
    eyebrow: 'Broadband plan',
    title: '4 Haji Street, #01-234, Singapore 123456',
  },
  { icon: ICON.payLater, eyebrow: 'PayLater plan', title: 'Apple iPhone 17 Pro' },
]

function CardVisual({ card }: { card: CardInfo }) {
  const isEgiro = card.brand === 'egiro'
  return (
    <div className="relative h-[150px] w-[262px] rounded-[16px] border border-sh-line bg-white p-4 shadow-[0_6px_18px_rgba(20,20,20,0.1)]">
      <div className="flex items-start justify-between">
        <span className="text-[14px] text-sh-ink">
          {isEgiro ? 'Bank account' : 'Credit card'}
        </span>
        <CardLogo brand={card.brand} />
      </div>
      <p className="mt-9 text-[18px] font-bold tracking-[2px]">
        <span className="text-sh-ink/45">**** **** **** </span>
        <span className="text-sh-ink/70">{card.last4}</span>
      </p>
      {isEgiro ? (
        <p className="mt-2 text-[14px] leading-5 text-[#727272]">{card.expires}</p>
      ) : (
        <p
          className={`mt-2 flex items-center gap-1 text-[14px] leading-5 ${
            card.warn ? 'text-[#9a1a4a]' : 'text-[#727272]'
          }`}
        >
          {card.warn && (
            <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
          )}
          {card.expires}
        </p>
      )}
    </div>
  )
}

export default function ManageCard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUpdateCtx, deleteCard } = usePayment()
  const card: CardInfo =
    (location.state as CardInfo) ?? {
      id: 'amex',
      brand: 'amex',
      last4: '8824',
      expires: 'Expires 04/28',
      warn: true,
      connected: true,
    }

  const [sheet, setSheet] = useState<
    'none' | 'blocked' | 'confirm' | 'egiro-blocked'
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

      {/* Back button (title lives on the white content panel, not the green header) */}
      <div className="relative z-10 px-5 pt-[18px]">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
      </div>

      {/* White content panel — 24px top / 20px sides / 48px bottom.
          Its rounded top corners tuck up under the green header. */}
      <div className="relative z-10 mt-3 flex-1 rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        <h1 className="text-[24px] font-bold leading-8 text-sh-ink">
          {card.brand === 'egiro' ? 'Manage eGIRO' : 'Manage card'}
        </h1>
        <div className="mt-8 flex justify-center">
          <CardVisual card={card} />
        </div>

        <button
          onClick={() =>
            setSheet(
              card.brand === 'egiro'
                ? 'egiro-blocked'
                : card.connected
                  ? 'blocked'
                  : 'confirm',
            )
          }
          className="mx-auto mt-5 flex items-center gap-1.5 text-[14px] font-black text-sh-ink active:opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13h10l1-13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete this card
        </button>

        <h2 className="mt-8 text-[20px] font-black text-sh-ink">My services</h2>
        <p className="mt-1 text-[16px] leading-6 text-sh-ink/60">
          {card.connected
            ? 'All services that are currently linked to this payment method.'
            : 'No services are linked to this card yet.'}
        </p>

        {card.brand === 'egiro' && (
          <div className="mt-4 flex items-start gap-2">
            <AssetIcon src={ICON.info} size={20} className="shrink-0" />
            <p className="text-[14px] leading-5 text-[#434343]">
              Please note that eGIRO approval may take some time.
            </p>
          </div>
        )}

        {card.connected && (
          <div className="mt-4 flex flex-col">
            {services.map((s, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-3">
                  <AssetIcon src={s.icon} size={32} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                      {s.eyebrow}
                    </p>
                    <p className="mt-1 text-[16px] font-bold leading-5 text-sh-ink">
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                      Next payment on 28 Jun
                    </p>
                  </div>
                </div>
                {i < services.length - 1 && <div className="h-px bg-sh-line" />}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* "Can't delete yet" bottom sheet (card still has services) */}
      {sheet === 'blocked' && (
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
                You can&rsquo;t remove this card yet
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

            {/* card row — disabled state (not actionable in this sheet) */}
            <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-[#dadbda] bg-white/40 p-4">
              <CardLogo brand={card.brand} dim />
              <div className="flex-1">
                <p className="text-[16px] font-bold leading-5 text-sh-ink/40">
                  **** {card.last4}
                </p>
                <p
                  className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                    card.warn ? 'text-[#9a1a4a]' : 'text-[#727272]'
                  }`}
                >
                  {card.warn && (
                    <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
                  )}
                  {card.expires}
                </p>
              </div>
            </div>

            <h4 className="mt-8 text-[20px] font-black leading-6 text-sh-ink">
              Move these services first
            </h4>
            <p className="mt-1 text-[15px] leading-5 text-sh-ink/60">
              Some services are billed to this card. Link them to another payment
              method before removing it.
            </p>

            <div className="mt-4 flex gap-8">
              <div className="flex items-center gap-2">
                <AssetIcon src={ICON.mobileSim} size={28} className="shrink-0" />
                <div>
                  <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                    Mobile
                  </p>
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    9122 1118
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AssetIcon src={ICON.internet} size={28} className="shrink-0" />
                <div>
                  <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                    Broadband
                  </p>
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    4 Haji Street
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setUpdateCtx({ current: card, doneToSteps: 3 })
                navigate('/update-payment')
              }}
              className="mt-12 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
            >
              Choose new payment method
            </button>
          </div>
        </div>
        </SheetPortal>
      )}

      {/* "Review changes" confirm-remove sheet (card has no services) */}
      {sheet === 'confirm' && (
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
              <h3 className="text-[20px] font-black leading-6 text-sh-ink">Review changes</h3>
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

            <p className="mt-1 text-[16px] leading-6 text-sh-ink">
              Confirm your choice to remove this payment method.
            </p>

            <div className="mt-5 rounded-[16px] border border-sh-line p-4">
              <p className="text-[14px] text-sh-ink/60">Card to remove</p>
              <div className="mt-2 flex items-start gap-3">
                <CardLogo brand={card.brand} />
                <div>
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    **** {card.last4}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                    {card.expires}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (card.id) deleteCard(card.id)
                navigate('/card-updated', {
                  state: {
                    title: 'Payment method successfully removed',
                    doneTo: '/payment-methods',
                    doneToSteps: 2,
                  },
                })
              }}
              className="mt-6 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
            >
              Confirm
            </button>
          </div>
        </div>
        </SheetPortal>
      )}

      {/* eGIRO can't be removed instantly — requires a removal form */}
      {sheet === 'egiro-blocked' && (
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
                You can&rsquo;t remove this account yet
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

            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-sh-line p-4">
              <CardLogo brand="egiro" />
              <p className="text-[16px] font-bold leading-5 text-sh-ink">
                {card.expires} accnt ending in {card.last4}
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-black leading-6 text-sh-ink">
              Please download the eGIRO removal form
            </h4>
            <p className="mt-1 text-[15px] leading-5 text-sh-ink/60">
              Your GIRO payment will still appear as an option, but to remove it,
              download the GIRO removal form and send it to us. It may take up to 2
              weeks to process your request once we receive your details.
            </p>

            <button
              onClick={closeSheet}
              className="mt-6 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
            >
              Download eGIRO removal form
            </button>
            <button
              onClick={closeSheet}
              className="mt-4 w-full text-center text-[14px] font-black text-sh-ink"
            >
              Cancel
            </button>
          </div>
        </div>
        </SheetPortal>
      )}
    </div>
  )
}
