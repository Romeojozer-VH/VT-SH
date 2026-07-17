import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import PhoneFrame from './components/PhoneFrame'
import BottomNav from './components/BottomNav'
import CardAddedSheet from './components/CardAddedSheet'
import { PaymentContext } from './payment'
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

const STORAGE_KEY = 'sh-phone-framed'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const showNav = location.pathname === '/' || location.pathname === '/pay'
  const [framed, setFramed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === null ? true : saved === 'true'
  })
  const [paid, setPaid] = useState(false)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const deleteCard = (id: string) =>
    setDeletedIds((p) => (p.includes(id) ? p : [...p, id]))
  const [addedCard, setAddedCard] = useState<AddedCard | null>(null)
  const [updateCtx, setUpdateCtx] = useState<UpdateConfig | null>(null)
  const [cardAddedOpen, setCardAddedOpen] = useState(false)
  const [cardAddedClosing, setCardAddedClosing] = useState(false)
  const [resetKey, setResetKey] = useState(0)

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

  const resetPrototype = () => {
    setPaid(false)
    setDeletedIds([])
    setAddedCard(null)
    setUpdateCtx(null)
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
      }}
    >
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-200 py-8">
        {/* Prototype controls */}
        <div className="fixed right-4 top-4 z-50 flex gap-2">
          <button
            onClick={() => setFramed((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>📱</span>
            Frame: {framed ? 'On' : 'Off'}
          </button>
          <button
            onClick={resetPrototype}
            className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-sh-ink shadow-md backdrop-blur transition hover:bg-white"
          >
            <span>↺</span>
            Reset prototype
          </button>
        </div>

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
          <Routes key={resetKey}>
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
          </Routes>
        </PhoneFrame>
      </div>
    </PaymentContext.Provider>
  )
}
