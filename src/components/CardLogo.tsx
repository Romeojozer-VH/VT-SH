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
        <span className="text-[13px] font-black leading-none">
          <span className="text-[#e6007e]">e</span>
          <span className="text-[#4b2e83]">GIRO</span>
        </span>
      )}
      {brand === 'amex' && (
        <span className="flex h-5 w-8 items-center justify-center rounded-[3px] bg-[#2E77BC] text-[7px] font-black leading-none text-white">
          AMEX
        </span>
      )}
    </span>
  )
}
