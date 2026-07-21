import { ICON } from './icons'

export type CardBrand = 'visa' | 'amex' | 'mastercard' | 'egiro'

export default function CardLogo({
  brand,
  dim,
}: {
  brand: CardBrand
  dim?: boolean
}) {
  const op = dim ? 'opacity-40' : ''
  return (
    <span
      className={`flex h-6 w-8 shrink-0 items-center justify-center ${op}`}
    >
      {brand === 'visa' && (
        <img src={ICON.visa} alt="Visa" className="h-6 w-8" />
      )}
      {brand === 'mastercard' && (
        <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
          <circle cx="13" cy="10" r="7" fill="#EB001B" />
          <circle cx="19" cy="10" r="7" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      )}
      {brand === 'egiro' && (
        <img src={ICON.egiro} alt="eGIRO" className="h-6 w-8 object-contain" />
      )}
      {brand === 'amex' && (
        <img src={ICON.amex} alt="AMEX" className="h-6 w-8 rounded-[3px] object-contain" />
      )}
    </span>
  )
}
