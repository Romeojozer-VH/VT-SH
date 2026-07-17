import { type CardBrand } from './CardLogo'

const label = (b: CardBrand) =>
  b === 'amex' ? 'AMEX' : b === 'visa' ? 'Visa' : b === 'mastercard' ? 'Mastercard' : 'eGIRO'

/** Success confirmation bottom sheet shown after a card is added via the
    payment gateway (replaces the old toast). */
export default function CardAddedSheet({
  brand,
  last4,
  closing,
  onClose,
}: {
  brand: CardBrand
  last4: string
  closing: boolean
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-[80] flex flex-col justify-end">
      <div
        className={`absolute inset-0 bg-[#141414]/85 ${
          closing ? 'sheet-scrim-out' : 'sheet-scrim'
        }`}
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

        <div className="flex flex-col items-center pb-2 text-center">
          <img
            src="/Icons/Illustration%202_1.svg"
            alt=""
            aria-hidden
            className="success-pop h-[155px] w-auto"
          />
          <h3 className="success-rise mt-6 max-w-[280px] text-[24px] font-black leading-8 text-sh-ink [animation-delay:120ms]">
            Payment method successfully added
          </h3>
          <p className="success-rise mt-3 max-w-[300px] text-[16px] leading-6 text-sh-ink/70 [animation-delay:220ms]">
            Your new {label(brand)} **** {last4} has been successfully added to
            your account.
          </p>
        </div>
      </div>
    </div>
  )
}
