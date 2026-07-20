import { useEffect, useRef, useState } from 'react'
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
import type { AddedCard, UpdateConfig } from './payment'
import Redirecting from './screens/Redirecting'
import BankOtp from './screens/BankOtp'
import Success from './screens/Success'
import PayLaterPlans from './screens/PayLaterPlans'
import PayLaterPlanDetail from './screens/PayLaterPlanDetail'
import AddEgiroAccount from './screens/AddEgiroAccount'
import EgiroBankAuth from './screens/EgiroBankAuth'

const STORAGE_KEY = 'sh-phone-framed'
const FIT_KEY = 'sh-phone-fit'
const FRAME_WIDTH = 418
const FRAME_HEIGHT = 844

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
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const deleteCard = (id: string) =>
    setDeletedIds((p) => (p.includes(id) ? p : [...p, id]))
  const [addedCard, setAddedCard] = useState<AddedCard | null>(null)
  const [updateCtx, setUpdateCtx] = useState<UpdateConfig | null>(null)
  const [pendingReopenSheet, setPendingReopenSheet] = useState<string | null>(null)
  const [cardAddedOpen, setCardAddedOpen] = useState(false)
  const [cardAddedClosing, setCardAddedClosing] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false)
  const mobileControlsDrag = useSheetDrag(() => setMobileControlsOpen(false))

  // Two-finger tap — on mobile the prototype controls are hidden (they'd
  // otherwise eat screen space during a live demo); this gesture summons
  // them as a closable modal instead. Desktop keeps the always-visible bar.
  //
  // In practice the two fingers almost never lift in the same event — one
  // touchend fires with the other finger still down, then a second touchend
  // fires once it lifts too. So state can't be cleared on the first partial
  // lift (that would throw away tracking before the gesture ever finishes);
  // movement is instead checked incrementally across every touchend and the
  // tap/cancel decision only made once every finger is up.
  const twoFingerTouch = useRef<{
    time: number
    points: { x: number; y: number }[]
    moved: boolean
  } | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      twoFingerTouch.current = {
        time: Date.now(),
        points: Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY })),
        moved: false,
      }
    } else if (e.touches.length > 2) {
      // a third finger joined mid-gesture — no longer a clean two-finger tap
      twoFingerTouch.current = null
    }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const state = twoFingerTouch.current
    if (!state) return
    for (const t of Array.from(e.changedTouches)) {
      const nearest = state.points.reduce(
        (best, p) => Math.min(best, Math.hypot(t.clientX - p.x, t.clientY - p.y)),
        Infinity,
      )
      if (nearest > 24) state.moved = true
    }
    if (e.touches.length !== 0) return // wait for every finger to lift
    twoFingerTouch.current = null
    if (state.moved || Date.now() - state.time > 400) return
    setMobileControlsOpen((v) => !v)
  }
  const handleTouchCancel = () => {
    twoFingerTouch.current = null
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

  const resetPrototype = () => {
    setPaid(false)
    setDeletedIds([])
    setAddedCard(null)
    setUpdateCtx(null)
    setPendingReopenSheet(null)
    setCardAddedOpen(false)
    setResetKey((k) => k + 1)
    navigate('/')
  }

  return (
    <PaymentContext.Provider
      value={{
        paid,
        setPaid,
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className={
          framed
            ? 'touch-pan-y flex min-h-screen w-full items-center justify-center bg-neutral-200 py-8'
            : `touch-pan-y flex w-full justify-center overflow-hidden bg-neutral-200 ${
                isMobile ? 'h-[100dvh]' : 'h-screen'
              }`
        }
      >
        {/* Prototype controls — desktop only; on mobile these are hidden and
            summoned via a two-finger tap (see the modal below) so they don't
            eat screen space during a live demo. */}
        <div className="fixed right-4 top-4 z-50 hidden gap-2 sm:flex">
          <button
            onClick={() => setFramed((v) => !v)}
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
          <button
            onClick={() => setPaid((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>💳</span>
            Overdue: {paid ? 'Off' : 'On'}
          </button>
          <button
            onClick={resetPrototype}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>↺</span>
            Reset prototype
          </button>
        </div>

        {/* Mobile controls modal — summoned by a two-finger tap anywhere on
            the page. Closable via the X, the backdrop, or tapping again. */}
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
                  onClick={() => setFramed((v) => !v)}
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
                <button
                  onClick={() => setPaid((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold text-sh-ink"
                >
                  <span>💳</span>
                  Overdue: {paid ? 'Off' : 'On'}
                </button>
                <button
                  onClick={resetPrototype}
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
              bottomBar={showNav ? <BottomNav /> : undefined}
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
