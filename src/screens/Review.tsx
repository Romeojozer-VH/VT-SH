import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, MaskIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'
import AddPaymentSheet from '../components/AddPaymentSheet'
import { usePayment } from '../payment'

const PAGE_BG = '#fafafa'

const lineItems: [string, string][] = [
  ['5G+ Unlimited Core', '$42.00'],
  ['Block Overseas Calls', '$0.00'],
  ['Block Overseas SMSes', '$0.00'],
  ['SmartSupport', '$14.26'],
  ['CyberProtect', '$10.18'],
]

interface Card {
  id: string
  brand: CardBrand
  last4: string
  status: string
  expired?: boolean
}

const cards: Card[] = [
  { id: 'visa', brand: 'visa', last4: '1234', status: 'Expired 05/26', expired: true },
  { id: 'amex', brand: 'amex', last4: '1234', status: 'Expires XX/XX' },
  { id: 'mc', brand: 'mastercard', last4: '1234', status: 'Expires 04/28' },
]

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

/* receipt-style bill */
function Bill() {
  const bodyRef = useRef<HTMLDivElement>(null)
  const t1 = useRef<HTMLDivElement>(null)
  const t2 = useRef<HTMLDivElement>(null)
  const [mask, setMask] = useState<string | undefined>()

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body || !t1.current || !t2.current) return
    const r = 10
    const y1 = t1.current.offsetTop + t1.current.offsetHeight / 2
    const y2 = t2.current.offsetTop + t2.current.offsetHeight / 2
    const hole = (x: string, y: number) =>
      `radial-gradient(circle ${r}px at ${x} ${y}px, transparent ${r}px, #000 ${r + 0.5}px)`
    setMask(
      [hole('0%', y1), hole('100%', y1), hole('0%', y2), hole('100%', y2)].join(', '),
    )
  }, [])

  return (
    <>
      {/* 1px uniform outline hugging the whole receipt silhouette
          (zigzag edges + side notch curves) via alpha dilation */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="receipt-outline">
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
      <div style={{ filter: 'url(#receipt-outline)' }}>
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
        {/* header */}
        <div className="flex items-start gap-2.5 px-4 pb-2 pt-[21px]">
          <div className="flex-1">
            <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
              Mobile plan
            </p>
            <p className="mt-1 text-[16px] font-bold leading-5 text-sh-ink">
              9111 2222
            </p>
            <p className="text-[14px] leading-5 text-[#434343]">5G+ Unlimited Core</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[12px] leading-4 text-[#727272]">22 May 2026</p>
            <p className="text-[24px] font-black leading-8 text-sh-ink">$66.44</p>
            <p className="text-[14px] font-bold leading-4 text-[#9a1a4a]">Overdue</p>
          </div>
        </div>

        <TearLine ref={t1} />

        <div className="flex flex-col gap-2 px-4 py-3">
          {lineItems.map(([name, price]) => (
            <div key={name} className="flex items-center justify-between">
              <p className="text-[14px] leading-5 text-[#727272]">{name}</p>
              <p className="text-[14px] font-black leading-5 text-sh-ink">{price}</p>
            </div>
          ))}
        </div>

        <TearLine ref={t2} />

        <div className="flex items-center justify-between px-4 pb-[21px] pt-3">
          <p className="text-[14px] font-bold leading-5 text-[#727272]">
            Amount to be paid
          </p>
          <p className="text-[14px] font-black leading-5 text-sh-ink">$XX.XX</p>
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

/* ---------- change payment method bottom sheet ---------- */
function ChangePaymentSheet({
  cards,
  draftId,
  onDraft,
  onClose,
  onContinue,
  onAddPayment,
  closing,
}: {
  cards: Card[]
  draftId: string
  onDraft: (id: string) => void
  onClose: () => void
  onContinue: () => void
  onAddPayment: () => void
  closing: boolean
}) {
  const draft = cards.find((c) => c.id === draftId)
  const canContinue = !!draft && !draft.expired

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-[#141414]/85 ${closing ? 'sheet-scrim-out' : 'sheet-scrim'}`}
        onClick={onClose}
      />

      <div
        className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-8 pt-6 ${
          closing ? 'sheet-panel-out' : 'sheet-panel'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] font-black leading-6 text-sh-ink">
            Change payment method
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-sh-ink">
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

        <div className="mt-5 flex flex-col gap-3">
          {cards.map((card) => {
            const selected = draftId === card.id && !card.expired
            return (
              <button
                key={card.id}
                disabled={card.expired}
                onClick={() => onDraft(card.id)}
                className={`flex items-start gap-3 rounded-[24px] p-4 text-left transition ${
                  card.expired
                    ? 'cursor-not-allowed border border-[#dadbda] bg-white/40'
                    : selected
                      ? 'border-2 border-sh-green bg-white shadow-[0_2px_8px_rgba(20,20,20,0.1)]'
                      : 'border border-sh-line bg-white shadow-[0_4px_12px_rgba(20,20,20,0.1)]'
                }`}
              >
                <CardLogo brand={card.brand} dim={card.expired} />
                <div className="flex-1">
                  <p
                    className={`text-[16px] font-bold leading-5 ${
                      card.expired ? 'text-sh-ink/40' : 'text-sh-ink'
                    }`}
                  >
                    **** {card.last4}
                  </p>
                  <p
                    className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                      card.expired ? 'text-[#9a1a4a]' : 'text-[#727272]'
                    }`}
                  >
                    {card.expired && (
                      <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
                    )}
                    {card.status}
                  </p>
                </div>
                <span
                  className={`flex size-5 shrink-0 items-center justify-center self-center rounded-full border-2 bg-white ${
                    selected ? 'border-sh-green' : 'border-[#dadbda]'
                  }`}
                >
                  {selected && <span className="size-2.5 rounded-full bg-sh-green" />}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onAddPayment}
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

        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`mt-10 h-14 w-full rounded-full text-[16px] font-black transition ${
            canContinue
              ? 'bg-sh-green text-sh-ink active:scale-[0.99]'
              : 'cursor-not-allowed bg-sh-green/45 text-sh-ink/50'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

/* ---------- CVV entry bottom sheet ---------- */
function CvvSheet({
  last4,
  onClose,
  onProceed,
  closing,
}: {
  last4: string
  onClose: () => void
  onProceed: () => void
  closing: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cvv, setCvv] = useState('')
  const ready = cvv.length === 3

  // focus without scrolling the background into view
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-[#141414]/85 ${closing ? 'sheet-scrim-out' : 'sheet-scrim'}`}
        onClick={onClose}
      />
      <div
        className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-8 pt-6 ${
          closing ? 'sheet-panel-out' : 'sheet-panel'
        }`}
      >
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close" className="text-sh-ink">
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

        <AssetIcon src={ICON.creditCard} size={48} />
        <h3 className="mt-4 text-[24px] font-black leading-8 text-sh-ink">
          Enter CVV for card ending in {last4}.
        </h3>

        <div className="mt-6" onClick={() => inputRef.current?.focus()}>
          <p className="text-[14px] font-black text-sh-ink">CVV</p>
          <div className="relative mt-3 flex h-6 items-center gap-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`size-2 rounded-full ${
                  i < cvv.length ? 'bg-sh-ink' : 'bg-sh-ink/25'
                }`}
              />
            ))}
            <input
              ref={inputRef}
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
              }
              inputMode="numeric"
              className="absolute inset-0 w-full opacity-0"
            />
          </div>
          <div className="mt-2 border-t border-sh-line" />
          <p className="mt-2 text-[12px] text-[#727272]">3-digits</p>
        </div>

        <button
          onClick={onProceed}
          disabled={!ready}
          className={`mt-8 h-14 w-full rounded-full text-[16px] font-black transition ${
            ready
              ? 'bg-sh-green text-sh-ink active:scale-[0.99]'
              : 'cursor-not-allowed bg-sh-green/45 text-sh-ink/50'
          }`}
        >
          Proceed to check out
        </button>
      </div>
    </div>
  )
}

/* ================= REVIEW PAYMENT SCREEN ================= */
export default function Review() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addedCard, cardAddedOpen } = usePayment()
  const [selectedId, setSelectedId] = useState('visa')
  const [sheet, setSheet] = useState<'none' | 'payment' | 'cvv' | 'add'>('none')
  const [closing, setClosing] = useState(false)
  const [draftId, setDraftId] = useState('visa')

  // any card added via the gateway joins the selectable list
  const allCards: Card[] = addedCard ? [...cards, addedCard] : cards
  const selected = allCards.find((c) => c.id === selectedId) ?? allCards[0]
  const canPay = !selected.expired

  // returning from the "add payment" gateway reopens the change sheet — but
  // only one bottom sheet shows at a time, so this waits for the card-added
  // success sheet to close first instead of stacking underneath it.
  useEffect(() => {
    if (cardAddedOpen) return
    const reopen = (location.state as { reopenSheet?: string } | null)?.reopenSheet
    if (reopen === 'payment') {
      setSheet('payment')
      if (addedCard) setDraftId(addedCard.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardAddedOpen])

  const openPayment = () => {
    setDraftId(selectedId)
    setSheet('payment')
  }
  const requestClose = () => {
    setClosing(true)
    window.setTimeout(() => {
      setSheet('none')
      setClosing(false)
    }, 260)
  }
  const confirmPayment = () => {
    setSelectedId(draftId)
    requestClose()
  }

  return (
    <div
      className="relative flex min-h-full flex-col"
      style={{ background: PAGE_BG }}
    >
      {/* Green banner (flat rectangle) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[188px] overflow-hidden bg-sh-green"
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
          Review payment
        </h1>
      </div>

      {/* White content panel — 24px top / 20px sides / 48px bottom.
          Its rounded top corners tuck up under the green header. */}
      <div className="relative z-10 mt-3 flex flex-1 flex-col rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        <Bill />

        <h2 className="pb-4 pt-8 text-[16px] font-black leading-5 text-sh-ink">
          Payment
        </h2>
        <button
          onClick={openPayment}
          className="flex w-full items-start gap-3 rounded-[24px] bg-white p-4 text-left shadow-[inset_0_0_0_1px_#dadbda,0_2px_8px_rgba(20,20,20,0.1)] active:scale-[0.99]"
        >
          <CardLogo brand={selected.brand} dim={selected.expired} />
          <div className="flex-1">
            <p className="text-[16px] font-bold leading-5 text-sh-ink">
              **** {selected.last4}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                selected.expired ? 'text-[#9a1a4a]' : 'text-[#727272]'
              }`}
            >
              {selected.expired && (
                <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
              )}
              {selected.status}
            </p>
          </div>
          <AssetIcon src={ICON.chevron} size={20} className="self-center" />
        </button>

        {/* inline alert — shown when the selected card can't be charged */}
        {selected.expired && (
          <div className="mt-2 flex items-start gap-2">
            <AssetIcon src={ICON.info} size={20} className="shrink-0" />
            <p className="text-[14px] leading-5 text-[#434343]">
              Update your payment method by using a different card to continue.
            </p>
          </div>
        )}

        {/* Confirm */}
        <div className="mt-auto pt-6">
          <button
            onClick={() => setSheet('cvv')}
            disabled={!canPay}
            className={`h-14 w-full rounded-full text-[16px] font-black transition ${
              canPay
                ? 'bg-sh-green text-sh-ink active:scale-[0.99]'
                : 'cursor-not-allowed bg-sh-green/45 text-sh-ink/50'
            }`}
          >
            Confirm and pay
          </button>
        </div>
      </div>

      {sheet === 'payment' && (
        <ChangePaymentSheet
          cards={allCards}
          draftId={draftId}
          onDraft={setDraftId}
          onClose={requestClose}
          onContinue={confirmPayment}
          onAddPayment={() => setSheet('add')}
          closing={closing}
        />
      )}
      {sheet === 'add' && (
        <AddPaymentSheet
          closing={closing}
          onClose={requestClose}
          reopen="payment"
        />
      )}
      {sheet === 'cvv' && (
        <CvvSheet
          last4={selected.last4}
          onClose={requestClose}
          onProceed={() => navigate('/redirecting')}
          closing={closing}
        />
      )}
    </div>
  )
}
