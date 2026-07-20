import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import { usePayment } from '../payment'

/* ---------- category tabs ---------- */
const tabs = [
  { icon: ICON.managePayment, label: 'Payment methods', to: '/payment-methods' },
  {
    icon: ICON.manageServices,
    label: 'Payment by services',
    to: '/payment-by-services',
  },
]

function SocketTab({
  icon,
  label,
  to,
}: {
  icon: string
  label: string
  to?: string
}) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => to && navigate(to)}
      className="flex h-[86px] flex-1 flex-col justify-end rounded-[24px] border border-[#dadbda] bg-white p-4 text-left shadow-[0_4px_12px_rgba(20,20,20,0.1)]"
    >
      <AssetIcon src={icon} size={32} />
      <p className="mt-1 text-[14px] font-black leading-[18px] tracking-[0.15px] text-sh-ink">
        {label}
      </p>
    </button>
  )
}

/* ---------- wide "PayLater plans" row ---------- */
function PayLaterRow() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/paylater-plans')}
      className="flex w-full items-center gap-3 rounded-[24px] border border-[#dadbda] bg-white p-4 text-left shadow-[0_4px_12px_rgba(20,20,20,0.1)]"
    >
      <AssetIcon src={ICON.payLater} size={32} className="shrink-0" />
      <p className="text-[14px] font-black leading-[18px] tracking-[0.15px] text-sh-ink">
        PayLater plans
      </p>
    </button>
  )
}

/* ---------- payment-due card (only rendered while unpaid) ---------- */
function PaymentDueCard() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-[#9a1a4a] bg-white p-4 shadow-[0_2px_8px_rgba(20,20,20,0.1)]">
      <div className="flex gap-2">
        <AssetIcon src={ICON.mobileSim} size={32} className="shrink-0" />
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
              Mobile
            </p>
            <p className="text-[16px] font-bold leading-5 text-sh-ink">9111 2222</p>
            <p className="text-[14px] leading-5 text-[#434343]">5G+ Unlimited Core</p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <p className="whitespace-nowrap text-[16px] font-black leading-5 text-sh-ink">
              $66.44
            </p>
            <p className="whitespace-nowrap text-[12px] font-bold leading-4 text-[#9a1a4a]">
              Due 5 Jul
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/review')}
        className="flex w-full items-center justify-center gap-1 rounded-full border border-sh-line bg-white py-2 text-[14px] font-black tracking-[0.15px] text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
      >
        Pay
        <AssetIcon src={ICON.arrow} size={16} />
      </button>
    </div>
  )
}

/* ---------- Legacy user's manual PayNow bill ---------- */
function LegacyPaymentDueCard() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#dadbda] bg-white p-4 shadow-[0_2px_4px_rgba(20,20,20,0.1)]">
      <div className="flex gap-2">
        <AssetIcon src={ICON.legacyContract} size={32} className="shrink-0" />
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[16px] font-bold leading-5 text-sh-ink">
              Acc. 1.15655811A
            </p>
            <p className="text-[14px] leading-5 text-[#434343]">
              2 mobiles, 1 TVs, 1 broadband, 1 DV
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <p className="whitespace-nowrap text-[16px] font-black leading-5 text-sh-ink">
              $66.00
            </p>
            <p className="whitespace-nowrap text-[12px] font-bold leading-4 text-[#727272]">
              28 Jul
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/review')}
        className="flex w-full items-center justify-center gap-1 rounded-full border border-sh-line bg-white py-2 text-[14px] font-black tracking-[0.15px] text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
      >
        Pay
        <AssetIcon src={ICON.arrow} size={16} />
      </button>
    </div>
  )
}

/* ---------- transaction row ---------- */
interface Txn {
  icon: string
  eyebrow?: string
  title: string
  desc?: string
  card?: boolean
  amount: string
}

function TransactionRow({ txn, divider }: { txn: Txn; divider: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 py-3">
        <AssetIcon src={txn.icon} size={32} className="mt-0.5 shrink-0" />
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col gap-1">
            {txn.eyebrow && (
              <p className="text-[12px] font-bold leading-[14px] text-sh-green-text">
                {txn.eyebrow}
              </p>
            )}
            <p className="text-[16px] font-bold leading-5 text-sh-ink">{txn.title}</p>
            {txn.desc && <p className="text-[14px] leading-5 text-[#434343]">{txn.desc}</p>}
            {txn.card && (
              <div className="flex items-center gap-2">
                <img src={ICON.visa} alt="Visa" className="h-5 w-auto" />
                <span className="text-[14px] font-bold text-sh-ink">Ending 1234</span>
              </div>
            )}
          </div>
          <p className="whitespace-nowrap text-[16px] font-black leading-5 text-sh-ink">
            {txn.amount}
          </p>
          <div className="flex items-start pt-0.5">
            <AssetIcon src={ICON.chevron} size={16} />
          </div>
        </div>
      </div>
      {divider && <div className="h-px w-full bg-sh-line" />}
    </div>
  )
}

/* ---------- activity data ---------- */
const groups: { month: string; days: { date: string; txns: Txn[] }[] }[] = [
  {
    month: 'Jun 2026',
    days: [
      {
        date: '26 Jun',
        txns: [
          { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9111 2222', desc: '5G+ Unlimited Core', card: true, amount: '-$42.00' },
          { icon: ICON.addOn, eyebrow: 'Add on', title: 'Add-on', desc: 'Additional info', card: true, amount: '-$12.00' },
        ],
      },
      {
        date: '12 Jun',
        txns: [
          { icon: ICON.legacyContract, title: 'Acc. 1.15655811B', desc: '2 mobiles, 1 TV, 1 broadband, 1 DV', amount: '-$142.00' },
        ],
      },
    ],
  },
  {
    month: 'May 2026',
    days: [
      {
        date: '26 May',
        txns: [
          { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9111 2222', desc: '5G+ Unlimited Core', card: true, amount: '-$42.00' },
          { icon: ICON.addOn, eyebrow: 'Add on', title: 'Add-on', desc: 'Additional info', card: true, amount: '-$12.00' },
        ],
      },
      {
        date: '22 May',
        txns: [
          { icon: ICON.legacyContract, eyebrow: 'Entertainment', title: 'Blk 511, Street Name, #12-937, S60311', desc: 'StarHub TV+', card: true, amount: '-$32.00' },
          { icon: ICON.addOn, eyebrow: 'Premium add-on', title: 'Premium add-on', desc: 'Disney+', card: true, amount: '-$12.00' },
          { icon: ICON.addOn, eyebrow: 'Premium add-on', title: 'Premium add-on', desc: 'Netflix', card: true, amount: '-$12.00' },
        ],
      },
    ],
  },
  {
    month: 'Apr 2026',
    days: [
      {
        date: '26 Apr',
        txns: [
          { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9111 2222', desc: '5G+ Unlimited Core', card: true, amount: '-$42.00' },
          { icon: ICON.addOn, eyebrow: 'Add on', title: 'Add-on', desc: 'Additional info', card: true, amount: '-$12.00' },
        ],
      },
    ],
  },
]

const moreGroups: typeof groups = [
  {
    month: 'Mar 2026',
    days: [
      {
        date: '26 Mar',
        txns: [
          { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9111 2222', desc: '5G+ Unlimited Core', card: true, amount: '-$42.00' },
          { icon: ICON.addOn, eyebrow: 'Add on', title: 'Add-on', desc: 'Additional info', card: true, amount: '-$12.00' },
        ],
      },
    ],
  },
  {
    month: 'Feb 2026',
    days: [
      {
        date: '26 Feb',
        txns: [
          { icon: ICON.mobileSim, eyebrow: 'Mobile', title: '9111 2222', desc: '5G+ Unlimited Core', card: true, amount: '-$42.00' },
        ],
      },
      {
        date: '12 Feb',
        txns: [
          { icon: ICON.legacyContract, title: 'Acc. 1.15655811B', desc: '2 mobiles, 1 TV, 1 broadband, 1 DV', amount: '-$142.00' },
        ],
      },
    ],
  },
]

/* ================= PAY SCREEN ================= */
export default function Pay() {
  const { paid, userType } = usePayment()
  const [loaded, setLoaded] = useState(false)
  const latestPayment: typeof groups = paid
    ? [
        {
          month: 'Jul 2026',
          days: [
            {
              date: '5 Jul',
              txns: [
                {
                  icon: ICON.mobileSim,
                  eyebrow: 'Mobile',
                  title: '9111 2222',
                  desc: '5G+ Unlimited Core',
                  card: true,
                  amount: '-$66.44',
                },
              ],
            },
          ],
        },
      ]
    : []
  const allGroups = [
    ...latestPayment,
    ...groups,
    ...(loaded ? moreGroups : []),
  ]
  return (
    <div className="relative flex min-h-full flex-col bg-[#fafafa]">
      {/* Green banner — wraps the top section directly (status bar through
          the PayLater row) instead of being a separately-sized overlay, so
          its height is just the section's natural layout height: no JS
          measurement, so no possible mismatch from scale transforms, font
          load timing, or content changes. The PayLater row's own 16px
          bottom padding is inside this wrapper too, which is how that
          padding reads as green rather than as the white panel's own
          background. */}
      <div className="relative overflow-hidden bg-sh-green">
        <img
          aria-hidden
          src={IMG.homePortal}
          alt=""
          className="pointer-events-none absolute left-[-133px] top-[22px] z-0 h-[948px] w-[492px] max-w-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60px]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(102,102,102,0) 78.369%)',
          }}
        />

        <div className="relative z-10">
        <StatusBar />

        {/* Title */}
        <h1 className="px-5 pb-5 pt-[26px] text-[28px] font-black leading-9 tracking-[0px] text-sh-ink">
          My payment
        </h1>

        {/* Manage my payment */}
        <h2 className="px-5 text-[16px] font-black leading-9 tracking-[0px] text-sh-ink">
          Manage my payment
        </h2>

        {/* Category tabs */}
        <div className="flex gap-2 px-5 pb-3">
          {tabs.map((t) => (
            <SocketTab key={t.label} {...t} />
          ))}
        </div>

        {/* My Pay later */}
        <h2 className="px-5 text-[16px] font-black leading-9 tracking-[0px] text-sh-ink">
          My Pay later
        </h2>

        {/* PayLater plans wide row */}
        <div className="px-5 pb-4">
          <PayLaterRow />
        </div>
        </div>
      </div>

      {/* White content panel — 20px sides / 24px top / 48px bottom.
          Its rounded top corners tuck up right against the green wrapper
          above, guaranteed adjacent since both are plain normal-flow
          siblings. */}
      <div className="relative z-10 flex flex-1 flex-col rounded-t-[24px] bg-[#fafafa] px-5 pb-12 pt-6">
        {/* Payment due — Legacy users always have a manual bill to pay via
            PayNow here regardless of the "paid" flag (Home can be in its
            happy/no-overdue state while this still needs action); SuperNova
            users only see this section while unpaid. */}
        {userType === 'legacy' ? (
          <section>
            <p className="mb-2 text-[16px] font-black leading-6 text-sh-ink">
              Payment due
            </p>
            <LegacyPaymentDueCard />
          </section>
        ) : (
          !paid && (
            <section>
              <p className="mb-2 text-[16px] font-black leading-6 text-sh-ink">
                Payment due
              </p>
              <PaymentDueCard />
            </section>
          )
        )}

        {/* Past payment activity */}
        <section>
          <h2
            className={`pb-4 text-[16px] font-black leading-5 text-sh-ink ${
              paid ? 'pt-0' : 'pt-6'
            }`}
          >
            Past payment activity
          </h2>
          {allGroups.map((g) => (
            <div key={g.month}>
              <div className="-mx-5 bg-sh-surface px-5 py-2 text-[14px] font-bold leading-[18px] text-sh-ink">
                {g.month}
              </div>
              {g.days.map((d, di) => (
                <div key={d.date}>
                  <p className="pt-3 text-[14px] font-bold text-sh-ink">{d.date}</p>
                  {d.txns.map((t, i) => {
                    const isLastInMonth =
                      di === g.days.length - 1 && i === d.txns.length - 1
                    return (
                      <TransactionRow
                        key={`${d.date}-${i}`}
                        txn={t}
                        divider={!isLastInMonth}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Load more — extra bottom clearance so it isn't hidden under the
              persistent bottom nav, which overlays the screen. */}
          <div className="flex justify-center pb-16 pt-6">
            {!loaded && (
              <button
                onClick={() => setLoaded(true)}
                className="flex h-9 items-center rounded-full border border-sh-line bg-white px-5 text-[14px] font-black text-sh-ink shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
              >
                Load more
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
