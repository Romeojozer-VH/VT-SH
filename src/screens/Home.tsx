import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import { usePayment } from '../payment'

/* ---------- My Hub tiles ---------- */
function HubTile({
  variant,
  icon,
  label,
  value,
}: {
  variant: 'green' | 'white'
  icon: React.ReactNode
  label: string
  value: string
}) {
  const isGreen = variant === 'green'
  return (
    <div
      className={`relative flex h-[132px] flex-1 flex-col items-start rounded-[24px] pb-4 pl-3 pr-3 pt-3 ${
        isGreen ? 'gap-1.5 bg-sh-green' : 'gap-1 bg-white'
      }`}
      style={{
        boxShadow: isGreen
          ? '0 2px 8px #1414140d'
          : 'inset 0 0 0 1px #dadbda, 0 2px 8px #1414140d',
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex h-8 items-center py-[2.8px]">{icon}</div>
        <div>
          <p
            className={`text-[14px] font-bold leading-[18px] ${
              isGreen ? 'text-sh-ink' : 'text-sh-green-text'
            }`}
          >
            {label}
          </p>
          <p className="text-[20px] font-black leading-6 text-sh-ink">{value}</p>
        </div>
      </div>
      <AssetIcon src={ICON.arrow} size={18} className="self-end" />
    </div>
  )
}

/* ---------- promo cards ---------- */
function PromoCard({ image, title }: { image: string; title: string }) {
  return (
    <div
      className="relative h-[160px] w-[200px] shrink-0 snap-start overflow-hidden rounded-[24px]"
      style={{ boxShadow: '0 4px 12px rgba(20,20,20,0.1)' }}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <p className="absolute inset-x-0 bottom-0 p-4 text-[14px] font-black leading-5 text-white">
        {title}
      </p>
    </div>
  )
}

/* ================= HOME SCREEN ================= */
export default function Home() {
  const navigate = useNavigate()
  const { paid } = usePayment()
  const rootRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState<number>()

  // Green header extends down behind the moment card, stopping 80px above
  // the card's bottom edge — measured live since the card's height varies
  // with content (paid vs. unpaid, text wrapping).
  useLayoutEffect(() => {
    const measure = () => {
      if (!rootRef.current || !cardRef.current) return
      const rootTop = rootRef.current.getBoundingClientRect().top
      const cardBottom = cardRef.current.getBoundingClientRect().bottom
      setHeaderHeight(cardBottom - rootTop - 80)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [paid])

  return (
    <div ref={rootRef} className="relative flex min-h-full flex-col bg-[#efefef]">
      {/* Green header background — extends behind the moment card down to
          80px above the card's bottom edge (see useLayoutEffect above). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden bg-sh-green"
        style={{ height: headerHeight }}
      >
        <img
          src={IMG.hero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {/* Gradient Dark — darkens the status-bar area (Figma node 42:20390) */}
        <div
          className="absolute inset-x-0 top-0 h-[60px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(102,102,102,0) 78.369%)',
          }}
        />
      </div>

      <StatusBar />

      {/* Greeting */}
      <div className="relative z-10">
        <div className="flex items-center justify-between px-5 pb-5 pt-3">
          <h1 className="text-[20px] font-bold leading-6 text-sh-ink">
            Good morning
          </h1>
          <button className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)]">
            <AssetIcon src={ICON.bell} size={24} />
            <span className="absolute right-2.5 top-3 size-2 rounded-full bg-sh-pink ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Moment card — overdue state, or a smaller "paid" state after payment */}
      <section className="relative z-10 px-4">
        <div
          ref={cardRef}
          className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] pb-[38px] pt-[38px]"
          style={{ boxShadow: '0 16px 32px rgba(20,20,20,0.1)' }}
        >
          <img
            src={IMG.momentCardLatest}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
          />

          {/* Text block */}
          <div className="relative z-10 flex flex-col gap-1 pl-5 pr-4">
            {paid ? (
              <>
                <h2 className="line-clamp-2 w-full text-[24px] font-black leading-8 text-sh-ink">
                  Everything is going well on your plan
                </h2>
                <p className="line-clamp-3 max-w-[170px] text-[16px] leading-6 text-sh-ink">
                  We will be on a look out in case if anything comes up,
                </p>
              </>
            ) : (
              <>
                {/* Payment reminder pill */}
                <div className="mb-1 inline-flex w-fit items-center">
                  <div className="z-[2] -mr-3">
                    <div className="-rotate-[10deg]">
                      <div className="flex size-6 items-center justify-center rounded-[8px] bg-sh-pink">
                        <AssetIcon src={ICON.alert} size={15} />
                      </div>
                    </div>
                  </div>
                  <div className="z-[1] flex h-[22px] items-center justify-center rounded-r-full border-2 border-sh-pink bg-white pl-4 pr-3">
                    <span className="whitespace-nowrap text-[12px] font-black leading-none tracking-[0.2px] text-sh-ink">
                      Payment reminder
                    </span>
                  </div>
                </div>

                <h2 className="line-clamp-2 w-full text-[24px] font-black leading-8 text-sh-ink">
                  Your payment is overdue
                </h2>
                <p className="line-clamp-3 max-w-[190px] text-[16px] leading-6 text-sh-ink">
                  Pay $66.44 now to avoid service disruption. Late fee applies.
                </p>
              </>
            )}
          </div>

          {/* CTA (only when unpaid) */}
          {!paid && (
            <div className="relative z-10 pl-5 pr-4">
              <button
                onClick={() => navigate('/review')}
                className="inline-flex items-center justify-center rounded-full bg-sh-green px-4 py-2 text-[14px] font-black leading-5 tracking-[0.15px] text-sh-ink transition active:scale-95"
                style={{
                  boxShadow:
                    '0 16px 32px -4px rgba(20,20,20,0.1), 0 4px 4px -4px rgba(20,20,20,0.05)',
                }}
              >
                Make payment
              </button>
            </div>
          )}

          {/* Illustration anchored to the bottom edge of the moment card */}
          {paid ? (
            <img
              src="/Illustrations/Isolation.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-20 h-[150px] w-auto"
            />
          ) : (
            <AssetIcon
              src={ICON.illustration}
              size={140}
              className="pointer-events-none absolute bottom-0 right-0 z-20"
            />
          )}
        </div>
      </section>

      {/* My Hub */}
      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[24px] font-bold leading-8 text-sh-ink">My Hub</h3>
          <button className="text-[14px] font-black leading-5 tracking-[0.15px] text-sh-green-text">
            View more
          </button>
        </div>
        <div className="flex gap-2">
          <HubTile
            variant="green"
            icon={<img src={ICON.mobileSim2} alt="" className="h-full w-auto" />}
            label="Mobile"
            value="9712 3456"
          />
          <HubTile
            variant="white"
            icon={<img src={ICON.internet} alt="" className="h-full w-auto" />}
            label="Broadband"
            value="West Coast D…"
          />
        </div>

        {/* Rewards bar */}
        <button
          className="relative mt-2 flex w-full items-center gap-3 overflow-hidden rounded-[20px] px-4 py-3.5 text-left"
          style={{ boxShadow: '0 2px 8px #1414140d' }}
        >
          <img
            src={IMG.rewards}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* 1px inside gradient border (dadbda → 747574) */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-[20px]"
            style={{
              padding: 1,
              background:
                'linear-gradient(180deg, #dadbda 0%, rgba(116,117,116,0.35) 100%)',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          <div className="relative z-10 flex w-full items-center gap-[5px]">
            <img
              src={ICON.diamond}
              alt=""
              className="h-[24.6px] w-[27.6px] shrink-0"
            />
            <div className="flex-1">
              <p className="text-[14px] font-bold leading-[18px] text-sh-ink">
                Platinum member
              </p>
              <p className="text-[20px] font-black leading-6 text-sh-ink">
                My rewards
              </p>
            </div>
            <AssetIcon src={ICON.arrow} size={18} className="self-end" />
          </div>
        </button>
      </section>

      {/* Picked for you */}
      <section className="px-4 pb-12 pt-10">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[24px] font-bold leading-8 text-sh-ink">
            Picked for you
          </h3>
          <button className="text-[14px] font-black leading-5 tracking-[0.15px] text-sh-green-text">
            View more
          </button>
        </div>
        <div className="-mx-4 -my-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 py-4 no-scrollbar">
          <PromoCard
            image={IMG.promoGalaxy}
            title="Get the latest Galaxy S26 Ultra 512GB for $0 with 5G Unlimited+ Max Plan"
          />
          <PromoCard image={IMG.promoHbo} title="HBO Max Standard for only $9" />
        </div>
      </section>

      {/* Floating chat button */}
      <div className="pointer-events-none sticky bottom-[92px] z-20 flex justify-end px-4">
        <button className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-sh-green shadow-lg active:scale-95">
          <AssetIcon src={ICON.chat} size={22} />
        </button>
      </div>
    </div>
  )
}
