import { useNavigate } from 'react-router-dom'
import { AssetIcon, MaskIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import CardLogo, { type CardBrand } from '../components/CardLogo'
import { usePayment } from '../payment'

interface Method {
  id: string
  brand: CardBrand
  last4: string
  expires: string
  warn?: boolean
  connected?: boolean
}

const methods: Method[] = [
  { id: 'visa', brand: 'visa', last4: '1234', expires: 'Expires 02/28', connected: true },
  { id: 'amex', brand: 'amex', last4: '8824', expires: 'Expires 04/28', warn: true, connected: true },
  { id: 'mc', brand: 'mastercard', last4: '1112', expires: 'Expires 06/28', connected: false },
]

export default function PaymentMethods() {
  const navigate = useNavigate()
  const { deletedIds, addedCard } = usePayment()
  const allMethods = addedCard
    ? [
        ...methods,
        {
          id: addedCard.id,
          brand: addedCard.brand,
          last4: addedCard.last4,
          expires: addedCard.status,
          connected: false,
        },
      ]
    : methods
  const visible = allMethods.filter((m) => !deletedIds.includes(m.id))

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
          onClick={() => navigate('/pay')}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
        <h1 className="mt-3 text-[28px] font-black leading-9 text-sh-ink">
          My payment methods
        </h1>
      </div>

      {/* White content panel — 24px top / 20px sides / 48px bottom.
          Its rounded top corners tuck up under the green header. */}
      <div className="relative z-10 mt-3 flex flex-1 flex-col gap-2 rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        {visible.map((m, i) => (
          <button
            key={i}
            onClick={() => navigate('/manage-card', { state: m })}
            className="flex w-full items-start gap-3 rounded-[24px] bg-white p-4 text-left shadow-[inset_0_0_0_1px_#dadbda,0_2px_8px_rgba(20,20,20,0.1)] active:scale-[0.99]"
          >
            <CardLogo brand={m.brand} dim={m.warn} />
            <div className="flex-1">
              <p
                className={`text-[16px] font-bold leading-5 ${
                  m.warn ? 'text-sh-ink/50' : 'text-sh-ink'
                }`}
              >
                **** {m.last4}
              </p>
              <p
                className={`mt-0.5 flex items-center gap-1 text-[14px] leading-5 ${
                  m.warn ? 'text-[#9a1a4a]' : 'text-[#727272]'
                }`}
              >
                {m.warn && (
                  <MaskIcon src={ICON.alertTriangle} size={14} className="text-[#9a1a4a]" />
                )}
                {m.expires}
              </p>
            </div>
            <AssetIcon src={ICON.chevron} size={20} className="self-center" />
          </button>
        ))}
      </div>
    </div>
  )
}
