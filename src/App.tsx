import { useEffect, useState } from 'react'
import { Route, useLocation, useNavigate } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import PageTransition from './components/PageTransition'
import BottomNav from './components/BottomNav'
import CardAddedSheet from './components/CardAddedSheet'
import { PaymentContext } from './payment'
import { SuppressStatusBarContext } from './suppressStatusBarContext'
import { detectMobile } from './isMobile'
import { useSheetDrag } from './hooks/useSheetDrag'
import Home from './screens/Home'
import Pay from './screens/Pay'
import PaymentMethods from './screens/PaymentMethods'
import PaymentByServices from './screens/PaymentByServices'
import ManageCard from './screens/ManageCard'
import UpdatePaymentMethod from './screens/UpdatePaymentMethod'
import CardUpdated from './screens/CardUpdated'
import Gateway from './screens/Gateway'
import Review from './screens/Review'
import type { AddedCard, UpdateConfig, UserType } from './payment'
import Redirecting from './screens/Redirecting'
import BankOtp from './screens/BankOtp'
import Success from './screens/Success'
import PayLaterPlans from './screens/PayLaterPlans'
import PayLaterPlanDetail from './screens/PayLaterPlanDetail'
import AddEgiroAccount from './screens/AddEgiroAccount'
import EgiroBankAuth from './screens/EgiroBankAuth'
import LegacyBill from './screens/LegacyBill'
import LegacyPayNow from './screens/LegacyPayNow'

const STORAGE_KEY = 'sh-phone-framed'
const FIT_KEY = 'sh-phone-fit'
const FRAME_WIDTH = 418
const FRAME_HEIGHT = 844

interface Scenario {
  label: string
  paid: boolean
  userType?: UserType
}
interface ScenarioGroup {
  persona: string
  scenarios: Scenario[]
}
// Presentation scenarios — each one resets the prototype to a known state
// and jumps to Home, so a demo can jump straight to a specific narrative
// instead of manually toggling individual flags.
const SCENARIO_GROUPS: ScenarioGroup[] = [
  {
    persona: 'SuperNova User',
    scenarios: [
      { label: 'Pay Journey - Happy flow (No overdue)', paid: true },
      { label: 'Pay Journey - Unhappy flow (with overdue)', paid: false },
    ],
  },
  {
    persona: 'Legacy User',
    scenarios: [
      {
        label: 'Pay Journey (Pay by PayNow)',
        paid: true,
        userType: 'legacy',
      },
    ],
  },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const showNav = location.pathname === '/' || location.pathname === '/pay'
  const [isMobile] = useState(detectMobile)
  const [framed, setFramed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    // No saved preference yet — default the bezel mockup off on an actual
    // mobile device (it's redundant there, the real phone IS the frame) and
    // on for desktop, where it's the whole point of the prototype view.
    if (saved === null) return !detectMobile()
    return saved === 'true'
  })
  const [fit, setFit] = useState<boolean>(() => {
    const saved = localStorage.getItem(FIT_KEY)
    return saved === null ? true : saved === 'true'
  })
  const [scale, setScale] = useState(1)
  const [paid, setPaid] = useState(false)
  const [userType, setUserType] = useState<UserType>('supernova')
  const [legacyBillPaid, setLegacyBillPaid] = useState(false)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const deleteCard = (id: string) =>
    setDeletedIds((p) => (p.includes(id) ? p : [...p, id]))
  const [addedCard, setAddedCard] = useState<AddedCard | null>(null)
  const [updateCtx, setUpdateCtx] = useState<UpdateConfig | null>(null)
  const [pendingReopenSheet, setPendingReopenSheet] = useState<string | null>(null)
  const [cardAddedOpen, setCardAddedOpen] = useState(false)
  const [cardAddedClosing, setCardAddedClosing] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  // On mobile the prototype controls are hidden (they'd otherwise eat
  // screen space during a live demo); tapping "Account" in the bottom nav
  // summons them as a closable modal instead. Desktop keeps the
  // always-visible bar.
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false)
  const mobileControlsDrag = useSheetDrag(() => setMobileControlsOpen(false))
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false)

  // Turning the frame on while on an actual mobile device also turns on
  // fit-to-screen — otherwise the fixed-size bezel would just overflow the
  // real (much smaller, non-resizable) phone viewport.
  const toggleFramed = () => {
    setFramed((v) => {
      const next = !v
      if (isMobile && next) setFit(true)
      return next
    })
  }

  const closeCardAdded = () => {
    setCardAddedClosing(true)
    window.setTimeout(() => {
      setCardAddedOpen(false)
      setCardAddedClosing(false)
    }, 260)
  }
  const showCardAdded = () => setCardAddedOpen(true)

  useEffect(() => {
    if (!cardAddedOpen) return
    const t = window.setTimeout(closeCardAdded, 3200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardAddedOpen])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(framed))
  }, [framed])

  useEffect(() => {
    localStorage.setItem(FIT_KEY, String(fit))
  }, [fit])

  // Scale the fixed-size device bezel down so it always fits the viewport
  // (only relevant when framed — the frameless view is already fluid).
  useEffect(() => {
    if (!framed || !fit) {
      setScale(1)
      return
    }
    const compute = () => {
      const availableWidth = window.innerWidth - 48
      const availableHeight = window.innerHeight - 64
      setScale(
        Math.min(1, availableWidth / FRAME_WIDTH, availableHeight / FRAME_HEIGHT),
      )
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [framed, fit])

  const resetPrototype = (paidState = false, userTypeState: UserType = 'supernova') => {
    setPaid(paidState)
    setUserType(userTypeState)
    setLegacyBillPaid(false)
    setDeletedIds([])
    setAddedCard(null)
    setUpdateCtx(null)
    setPendingReopenSheet(null)
    setCardAddedOpen(false)
    setResetKey((k) => k + 1)
    navigate('/pay')
  }
  const loadScenario = (scenario: Scenario) => {
    resetPrototype(scenario.paid, scenario.userType ?? 'supernova')
    setScenarioMenuOpen(false)
    setMobileControlsOpen(false)
  }

  return (
    <PaymentContext.Provider
      value={{
        paid,
        setPaid,
        userType,
        setUserType,
        legacyBillPaid,
        setLegacyBillPaid,
        deletedIds,
        deleteCard,
        addedCard,
        setAddedCard,
        showCardAdded,
        cardAddedOpen,
        updateCtx,
        setUpdateCtx,
        pendingReopenSheet,
        setPendingReopenSheet,
      }}
    >
      <SuppressStatusBarContext.Provider value={isMobile && !framed}>
      <div
        className={
          framed
            ? 'flex min-h-screen w-full items-center justify-center bg-neutral-200 py-8'
            : `flex w-full justify-center overflow-hidden bg-neutral-200 ${
                isMobile ? 'h-[100dvh]' : 'h-screen'
              }`
        }
      >
        {/* Prototype controls — desktop only; on mobile these are hidden and
            summoned via the Account tab (see the modal below) so they don't
            eat screen space during a live demo. */}
        <div className="fixed right-4 top-4 z-50 hidden gap-2 sm:flex">
          <button
            onClick={toggleFramed}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>📱</span>
            Frame: {framed ? 'On' : 'Off'}
          </button>
          {framed && (
            <button
              onClick={() => setFit((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
            >
              <span>⤢</span>
              Fit to screen: {fit ? 'On' : 'Off'}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setScenarioMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
            >
              <span>🎬</span>
              Scenarios
            </button>
            {scenarioMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setScenarioMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl bg-white p-3 shadow-lg">
                  {SCENARIO_GROUPS.map((group) => (
                    <div key={group.persona} className="mb-2 last:mb-0">
                      <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-sh-ink/50">
                        {group.persona}
                      </p>
                      {group.scenarios.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => loadScenario(s)}
                          className="block w-full rounded-lg px-2 py-2 text-left text-sm font-bold text-sh-ink hover:bg-neutral-100"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => resetPrototype()}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>↺</span>
            Reset prototype
          </button>
        </div>

        {/* Mobile controls modal — summoned by tapping "Account" in the
            bottom nav. Closable via the X, the backdrop, or dragging down. */}
        {mobileControlsOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:hidden"
            onClick={() => setMobileControlsOpen(false)}
          >
            <div
              {...mobileControlsDrag.handlers}
              style={mobileControlsDrag.style}
              className="w-full max-w-[430px] rounded-t-[24px] bg-white p-5 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-sh-ink">
                  Presentation settings
                </span>
                <button
                  onClick={() => setMobileControlsOpen(false)}
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-sh-ink"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleFramed}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold text-sh-ink"
                >
                  <span>📱</span>
                  Frame: {framed ? 'On' : 'Off'}
                </button>
                {framed && (
                  <button
                    onClick={() => setFit((v) => !v)}
                    className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold text-sh-ink"
                  >
                    <span>⤢</span>
                    Fit to screen: {fit ? 'On' : 'Off'}
                  </button>
                )}
                {SCENARIO_GROUPS.map((group) => (
                  <div key={group.persona} className="mt-1">
                    <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wide text-sh-ink/50">
                      {group.persona}
                    </p>
                    <div className="flex flex-col gap-2">
                      {group.scenarios.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => loadScenario(s)}
                          className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3 text-left text-sm font-bold text-sh-ink"
                        >
                          <span>🎬</span>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => resetPrototype()}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold text-sh-ink"
                >
                  <span>↺</span>
                  Reset prototype
                </button>
              </div>
            </div>
          </div>
        )}

        {(() => {
          const frame = (
            <PhoneFrame
              framed={framed}
              bottomBar={
                showNav ? (
                  <BottomNav onAccountTap={() => setMobileControlsOpen(true)} />
                ) : undefined
              }
              overlay={
                cardAddedOpen && addedCard ? (
                  <CardAddedSheet
                    brand={addedCard.brand}
                    last4={addedCard.last4}
                    closing={cardAddedClosing}
                    onClose={closeCardAdded}
                  />
                ) : undefined
              }
            >
              <PageTransition key={resetKey}>
                <Route path="/" element={<Home />} />
                <Route path="/pay" element={<Pay />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/payment-by-services" element={<PaymentByServices />} />
                <Route path="/manage-card" element={<ManageCard />} />
                <Route path="/update-payment" element={<UpdatePaymentMethod />} />
                <Route path="/card-updated" element={<CardUpdated />} />
                <Route path="/gateway" element={<Gateway />} />
                <Route path="/review" element={<Review />} />
                <Route path="/redirecting" element={<Redirecting />} />
                <Route path="/bank" element={<BankOtp />} />
                <Route path="/success" element={<Success />} />
                <Route path="/paylater-plans" element={<PayLaterPlans />} />
                <Route path="/paylater-plan-detail" element={<PayLaterPlanDetail />} />
                <Route path="/add-egiro" element={<AddEgiroAccount />} />
                <Route path="/egiro-bank-auth" element={<EgiroBankAuth />} />
                <Route path="/legacy-bill" element={<LegacyBill />} />
                <Route path="/legacy-paynow" element={<LegacyPayNow />} />
              </PageTransition>
            </PhoneFrame>
          )

          if (!framed) {
            // No scale wrapper — the unframed screen needs an unbroken
            // definite-height chain up to the viewport so its own h-full
            // resolves and the bottom nav (position: absolute) stays
            // pinned to the visible viewport bottom instead of the page.
            return <div className="h-full w-full">{frame}</div>
          }

          return (
            <div style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}>
              <div
                style={{
                  width: FRAME_WIDTH,
                  height: FRAME_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {frame}
              </div>
            </div>
          )
        })()}
      </div>
      </SuppressStatusBarContext.Provider>
    </PaymentContext.Provider>
  )
}
