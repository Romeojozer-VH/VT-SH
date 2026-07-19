import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'

interface AddOnDevice {
  name: string
  qty: string
}

interface PayLaterPlan {
  progress: string
  device: string
  number: string
  addOns?: AddOnDevice[]
}

const plans: PayLaterPlan[] = [
  {
    progress: 'Instalment plan (3/24)',
    device: 'iPhone14 Pro Max 256GB Starlight',
    number: '9123 4567',
    addOns: [
      { name: 'Apple Watch Series8', qty: 'x2' },
      { name: 'iPad Pro', qty: 'x1' },
    ],
  },
  {
    progress: 'Instalment plan (19/24)',
    device: 'iPhone14 Pro Max 256GB Starlight',
    number: '9123 4567',
  },
]

function PlanCard({ plan, onClick }: { plan: PayLaterPlan; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full overflow-hidden rounded-[24px] border border-[#dadbda] bg-white text-left shadow-[0_4px_12px_rgba(20,20,20,0.1)] active:scale-[0.99]"
    >
      <div className="flex gap-2 px-4 pb-4 pt-4">
        <AssetIcon src={ICON.calendarRecurring} size={32} className="shrink-0" />
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
              {plan.progress}
            </p>
            <p className="text-[16px] font-bold leading-5 text-sh-ink">
              {plan.device}
            </p>
            <div className="flex items-center gap-1">
              <AssetIcon src={ICON.deviceMobile} size={16} />
              <p className="text-[14px] leading-5 text-[#434343]">{plan.number}</p>
            </div>
          </div>
          <div className="flex items-center self-stretch py-0.5">
            <AssetIcon src={ICON.chevron} size={16} />
          </div>
        </div>
      </div>

      {plan.addOns && (
        <>
          <div className="px-4">
            <div className="h-px w-full bg-[#dadbda]" />
          </div>
          <div className="px-4 pb-6 pt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[14px] font-bold leading-4 text-[#727272]">
                  Add-on device
                </p>
                <div className="flex flex-col gap-1">
                  {plan.addOns.map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <p className="text-[14px] font-bold leading-5 text-sh-ink">
                        {a.name}
                      </p>
                      <p className="whitespace-nowrap text-[14px] leading-5 text-sh-ink">
                        {a.qty}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </button>
  )
}

export default function PayLaterPlans() {
  const navigate = useNavigate()
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
          onClick={() => navigate('/pay')}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
      </div>

      {/* White content panel — 24px top / 20px sides / 32px bottom, 24px gap
          between children. Its rounded top corners tuck up under the green header. */}
      <div className="relative z-10 mt-3 flex flex-1 flex-col gap-6 rounded-t-[24px] bg-[#fafafa] px-5 pb-8 pt-6">
        <h1 className="text-[24px] font-bold leading-8 text-sh-ink">My Pay later</h1>
        {plans.map((p) => (
          <PlanCard
            key={p.progress}
            plan={p}
            onClick={() => navigate('/paylater-plan-detail')}
          />
        ))}
      </div>
    </div>
  )
}
