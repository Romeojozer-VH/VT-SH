import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, MaskIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'
import AddPaymentSheet from '../components/AddPaymentSheet'
import {
  usePayment,
  type UpdateService,
  type UpdateOption,
  type UpdateCurrent,
} from '../payment'

const DEFAULT_SERVICES: UpdateService[] = [
  { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9122 1118' },
  { icon: ICON.internet, eyebrow: 'Broadband', title: '4 Haji Street' },
]
const DEFAULT_OPTIONS: UpdateOption[] = [
  { id: 'visa', brand: 'visa', last4: '1234', status: 'Expires 02/32' },
  { id: 'mc', brand: 'mastercard', last4: '1112', status: 'Expires 06/28' },
]
const DEFAULT_CURRENT: UpdateCurrent = {
  brand: 'amex',
  last4: '8824',
  expires: 'Expires 04/28',
  warn: true,
}

const brandName = (b: CardBrand) =>
  b === 'visa'
    ? 'Visa'
    : b === 'mastercard'
      ? 'Mastercard'
      : b === 'amex'
        ? 'AMEX'
        : 'eGIRO'

function ServiceRows({
  services,
  className = 'mt-3',
}: {
  services: UpdateService[]
  className?: string
}) {
  return (
    <div className={`${className} flex flex-wrap gap-x-8 gap-y-3`}>
      {services.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <AssetIcon src={s.icon} size={28} className="shrink-0" />
          <div>
            <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
              {s.eyebrow}
            </p>
            <p className="text-[16px] font-bold leading-5 text-sh-ink">{s.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function UpdatePaymentMethod() {
  const navigate = useNavigate()
  const { deleteCard, addedCard, updateCtx } = usePayment()

  const cfg = updateCtx ?? {}
  const description =
    cfg.description === undefined
      ? 'These services are currently billed to your expired card.'
      : cfg.description
  const services = cfg.services ?? DEFAULT_SERVICES
  const current = cfg.current ?? DEFAULT_CURRENT
  const options = cfg.options ?? DEFAULT_OPTIONS
  const back = cfg.back ?? '/manage-card'
  const doneTo = cfg.doneTo ?? '/payment-methods'

  const allCards = addedCard ? [addedCard, ...options] : options
  const [selectedId, setSelectedId] = useState<string | null>(
    addedCard ? addedCard.id : null,
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addClosing, setAddClosing] = useState(false)

  const selected = allCards.find((c) => c.id === selectedId)

  const closeSheet = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheetOpen(false)
      setClosing(false)
    }, 260)
  }
  const closeAdd = () => {
    setAddClosing(true)
    window.setTimeout(() => {
      setAddOpen(false)
      setAddClosing(false)
    }, 260)
  }

  const confirm = () => {
    if (!selected) return
    if (current.warn && current.id) deleteCard(current.id)
    navigate('/card-updated', {
      state: {
        title: current.warn ? "You're all set" : 'Payment method successfully updated',
        newCard: { brand: selected.brand, last4: selected.last4 },
        oldCard: { brand: current.brand, last4: current.last4 },
        doneTo,
      },
    })
  }

  return (
    <div className="relative flex h-full flex-col bg-[#fafafa]">
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
      <div className="relative z-10 shrink-0 px-5 pt-[18px]">
        <button
          onClick={() => navigate(back)}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
      </div>

      {/* White content panel — 24px top / 20px sides. Its rounded top
          corners tuck up under the green header; internal scroll region +
          fixed Continue footer live inside it. */}
      <div className="relative z-10 mt-3 flex min-h-0 flex-1 flex-col rounded-t-[24px] bg-[#fafafa]">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6 no-scrollbar">
          <h1 className="text-[24px] font-bold leading-8 text-sh-ink">
            Update your payment method
          </h1>
          {description && (
            <p className="mt-1 text-[16px] leading-6 text-sh-ink/70">{description}</p>
          )}

          <ServiceRows services={services} className="mt-8" />

          {/* current card */}
          <div className="mt-6 rounded-[24px] border border-[#dadbda] bg-white p-4">
            <p className="text-[14px] text-sh-ink/60">Current payment method</p>
            <div className="mt-2 flex items-start gap-3">
              <CardLogo brand={current.brand} dim={current.warn} />
              <div>
                <p
                  className={`text-[16px] font-bold leading-5 ${
                    current.warn ? 'text-sh-ink/50' : 'text-sh-ink'
                  }`}
                >
                  **** {current.last4}
                </p>
                <p
                  className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                    current.warn ? 'text-[#9a1a4a]' : 'text-[#727272]'
                  }`}
                >
                  {current.warn && (
                    <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
                  )}
                  {current.expires}
                </p>
              </div>
            </div>
          </div>

          {/* choose new */}
          <h2 className="mt-7 text-[16px] font-black leading-5 text-sh-ink">
            Choose a new payment method
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            {allCards.map((c) => {
              const isSel = selectedId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex items-start gap-3 rounded-[24px] bg-white p-4 text-left ${
                    isSel
                      ? 'border-2 border-sh-green shadow-[0_2px_8px_rgba(20,20,20,0.1)]'
                      : 'border border-sh-line shadow-[0_4px_12px_rgba(20,20,20,0.1)]'
                  }`}
                >
                  <CardLogo brand={c.brand} />
                  <div className="flex-1">
                    <p className="text-[16px] font-bold leading-5 text-sh-ink">
                      **** {c.last4}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                      {c.status}
                    </p>
                  </div>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center self-center rounded-full border-2 bg-white ${
                      isSel ? 'border-sh-green' : 'border-[#dadbda]'
                    }`}
                  >
                    {isSel && <span className="size-2.5 rounded-full bg-sh-green" />}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setAddOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full border border-sh-line bg-white px-4 text-[14px] font-black text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.08)] active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
              Add payment method
            </button>
          </div>
        </div>

        {/* fixed Continue footer */}
        <div className="border-t border-sh-line/60 bg-[#fafafa] px-5 pb-8 pt-4">
          <button
            onClick={() => selectedId && setSheetOpen(true)}
            disabled={!selectedId}
            className={`h-14 w-full rounded-full text-[16px] font-black transition ${
              selectedId
                ? 'bg-sh-green text-sh-ink active:scale-[0.99]'
                : 'cursor-not-allowed bg-sh-green/45 text-sh-ink/50'
            }`}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Review changes bottom sheet */}
      {sheetOpen && selected && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div
            className={`absolute inset-0 bg-[#141414]/85 ${
              closing ? 'sheet-scrim-out' : 'sheet-scrim'
            }`}
            onClick={closeSheet}
          />
          <div
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
              Your services will be charged to {brandName(selected.brand)} ****{' '}
              {selected.last4} moving forward.
            </p>

            <ServiceRows services={services} className="mt-8" />

            {/* comparison card */}
            <div className="mt-6 rounded-[16px] border border-sh-line p-4">
              <p className="text-[14px] text-sh-ink/60">
                {current.warn ? 'Payment method to be deleted' : 'Current payment method'}
              </p>
              <div className="mt-2 flex items-start gap-3">
                <CardLogo brand={current.brand} dim={current.warn} />
                <div>
                  <p
                    className={`text-[16px] font-bold leading-5 ${
                      current.warn ? 'text-sh-ink/50' : 'text-sh-ink'
                    }`}
                  >
                    **** {current.last4}
                  </p>
                  <p
                    className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                      current.warn ? 'text-[#9a1a4a]' : 'text-[#727272]'
                    }`}
                  >
                    {current.warn && (
                      <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
                    )}
                    {current.expires}
                  </p>
                </div>
              </div>

              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-sh-line" />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M6 13l6 6 6-6"
                    stroke="var(--color-sh-green)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="h-px flex-1 bg-sh-line" />
              </div>

              <p className="text-[14px] text-sh-ink/60">Updated payment method</p>
              <div className="mt-2 flex items-start gap-3">
                <CardLogo brand={selected.brand} />
                <div>
                  <p className="text-[16px] font-bold leading-5 text-sh-ink">
                    **** {selected.last4}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-5 text-[#727272]">
                    {selected.status}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={confirm}
              className="mt-16 h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink active:scale-[0.99]"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Add a payment method bottom sheet */}
      {addOpen && <AddPaymentSheet closing={addClosing} onClose={closeAdd} />}
    </div>
  )
}
