import { useLocation, useNavigate } from 'react-router-dom'
import { IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import { type CardBrand } from '../components/CardLogo'

interface CardInfo {
  brand: CardBrand
  last4: string
}

const label = (b: CardBrand) =>
  b === 'amex' ? 'AMEX' : b === 'visa' ? 'Visa' : 'Mastercard'

export default function CardUpdated() {
  const navigate = useNavigate()
  const location = useLocation()
  const st = location.state as {
    title?: string
    description?: string
    newCard?: CardInfo
    oldCard?: CardInfo
    doneTo?: string
    doneToSteps?: number
  } | null
  const title = st?.title ?? "You're all set"
  const doneTo = st?.doneTo ?? '/payment-methods'
  const doneToSteps = st?.doneToSteps
  // A real history pop (when the caller tells us how deep), not a push to a
  // fixed path — this screen is always reached via a chain of real pushes,
  // so pushing forward to doneTo would leave a duplicate of that same
  // screen's entry behind, which its own back button would then snag on.
  const goDone = () => (doneToSteps ? navigate(-doneToSteps) : navigate(doneTo))
  const showMoved = !!(st?.newCard && st?.oldCard)
  const newCard = st?.newCard ?? { brand: 'visa', last4: '1234' }
  const oldCard = st?.oldCard ?? { brand: 'amex', last4: '8824' }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-sh-green">
      <img
        src={IMG.homePortal}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[-133px] top-[22px] z-0 h-[948px] w-[492px] max-w-none"
      />

      <StatusBar />

      {/* white panel starts 104px from the top, regardless of the status
          bar's own rendered height — that band stays green */}
      <div className="absolute inset-x-0 bottom-0 top-[104px] z-10 flex flex-col rounded-t-[24px] bg-[#fafafa] px-5 pb-8 pt-8">
        <div className="flex flex-1 flex-col items-center pt-8 text-center">
          <img
            src="/Icons/Illustration%202_1.svg"
            alt=""
            aria-hidden
            className="success-pop h-[175px] w-auto"
          />
          <h1 className="success-rise mt-6 max-w-[320px] text-[24px] font-black leading-8 text-sh-ink [animation-delay:200ms]">
            {title}
          </h1>
          {st?.description ? (
            <p className="success-rise mt-3 max-w-[320px] text-[16px] leading-6 text-sh-ink [animation-delay:290ms]">
              {st.description}
            </p>
          ) : (
            showMoved && (
              <p className="success-rise mt-3 max-w-[320px] text-[16px] leading-6 text-sh-ink [animation-delay:290ms]">
                Your service is now moved to {label(newCard.brand)} ****{' '}
                {newCard.last4} from {label(oldCard.brand)} **** {oldCard.last4}
              </p>
            )
          )}
        </div>

        <button
          onClick={goDone}
          className="h-14 w-full rounded-full bg-sh-green text-[16px] font-black text-sh-ink shadow-[0_8px_24px_rgba(20,20,20,0.12)] active:scale-[0.99]"
        >
          Done
        </button>
      </div>
    </div>
  )
}
