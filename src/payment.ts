import { createContext, useContext } from 'react'
import type { CardBrand } from './components/CardLogo'

export interface AddedCard {
  id: string
  brand: CardBrand
  last4: string
  status: string
}

export interface UpdateService {
  icon: string
  eyebrow: string
  title: string
}
export interface UpdateOption {
  id: string
  brand: CardBrand
  last4: string
  status: string
}
export interface UpdateCurrent {
  id?: string
  brand: CardBrand
  last4: string
  expires: string
  warn?: boolean
}
/** Config for the reusable "Update your payment method" screen. */
export interface UpdateConfig {
  description?: string | null
  services?: UpdateService[]
  current?: UpdateCurrent
  options?: UpdateOption[]
  back?: string
  doneTo?: string
}

/** Config threaded as router state through the whole Review → CVV →
    Redirecting → BankOtp → Success payment flow, so the same flow can be
    reused for contexts other than "pay the overdue mobile bill" (e.g.
    paying off a cancelled Pay Later plan's balance). Forwarded unchanged
    at every navigate() call in the chain. Omit to get the default mobile
    bill behaviour everywhere. */
export interface PaymentFlowConfig {
  title?: string
  /** Which card is preselected on entry. Defaults to the expired Visa
      (existing "you need to update your card" narrative) — override for
      flows where the payment should be immediately payable. */
  defaultCardId?: string
  receipt?: {
    eyebrow: string
    name: string
    description?: string
    date: string
    amount: string
    statusLabel?: string
    lineItems?: [string, string][]
  }
  /** Whether to flip the global "mobile bill is paid" flag on success.
      Default true (existing behaviour) — set false for unrelated flows
      like cancelling a BNPL plan. */
  setPaidOnSuccess?: boolean
  successTitle?: string
  successDescription?: string
  doneToLabel?: string
  doneTo?: string
}

interface PaymentState {
  paid: boolean
  setPaid: (v: boolean) => void
  deletedIds: string[]
  deleteCard: (id: string) => void
  addedCard: AddedCard | null
  setAddedCard: (c: AddedCard | null) => void
  showCardAdded: () => void
  cardAddedOpen: boolean
  updateCtx: UpdateConfig | null
  setUpdateCtx: (c: UpdateConfig | null) => void
}

export const PaymentContext = createContext<PaymentState>({
  paid: false,
  setPaid: () => {},
  deletedIds: [],
  deleteCard: () => {},
  addedCard: null,
  setAddedCard: () => {},
  showCardAdded: () => {},
  cardAddedOpen: false,
  updateCtx: null,
  setUpdateCtx: () => {},
})

export const usePayment = () => useContext(PaymentContext)
