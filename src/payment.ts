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
  /** How many real history entries CardUpdated's "Done" button should pop
      back through to reach doneTo, since this screen is always reached via
      a chain of real pushes (never a fixed-path replace, which would leave
      a duplicate of doneTo's own entry behind for its back button to snag
      on). Depth varies by caller: PaymentByServices → UpdatePaymentMethod →
      CardUpdated is 2; PaymentMethods → ManageCard → UpdatePaymentMethod →
      CardUpdated is 3. */
  doneToSteps?: number
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
  /** Whether to mark the Legacy user's manual bill as paid on success —
      independent of setPaidOnSuccess/the "paid" flag, since Home can
      already be in its happy/no-overdue state while this bill is still
      outstanding. */
  setLegacyBillPaidOnSuccess?: boolean
  successTitle?: string
  successDescription?: string
  doneToLabel?: string
  doneTo?: string
  /** How many real history entries Success's "Done" button should pop back
      through to reach doneTo. Omit for the default mobile-bill flow, whose
      origin (Home vs. the Pay tab) isn't knowable from this config alone —
      set it for flows with one deterministic entry point, like cancelling a
      BNPL plan, where pushing forward to doneTo would otherwise duplicate
      an ancestor entry already in history. */
  doneToSteps?: number
}

/** Which persona's scenario is currently loaded — 'supernova' is the
    original recurring-card user; 'legacy' pays a manual bill via PayNow
    on the Pay page even while Home shows the "no overdue" happy state, so
    this can't just be derived from `paid`. */
export type UserType = 'supernova' | 'legacy'

interface PaymentState {
  paid: boolean
  setPaid: (v: boolean) => void
  userType: UserType
  setUserType: (v: UserType) => void
  /** Whether the Legacy user's manual PayNow/card bill has been paid this
      session — separate from `paid`, which represents Home's overdue
      state and is already true for this persona from the start. */
  legacyBillPaid: boolean
  setLegacyBillPaid: (v: boolean) => void
  deletedIds: string[]
  deleteCard: (id: string) => void
  addedCard: AddedCard | null
  setAddedCard: (c: AddedCard | null) => void
  showCardAdded: () => void
  cardAddedOpen: boolean
  updateCtx: UpdateConfig | null
  setUpdateCtx: (c: UpdateConfig | null) => void
  /** Which sheet the screen we're popping back to should reopen, set right
      before a gateway/bank-auth sub-flow navigates away and consumed (then
      cleared) by that screen on return. Carried via context rather than
      router state so the return trip can be a plain navigate(-N) — a real
      history pop, not a replace that leaves a duplicate entry behind. */
  pendingReopenSheet: string | null
  setPendingReopenSheet: (v: string | null) => void
}

export const PaymentContext = createContext<PaymentState>({
  paid: false,
  setPaid: () => {},
  userType: 'supernova',
  setUserType: () => {},
  legacyBillPaid: false,
  setLegacyBillPaid: () => {},
  deletedIds: [],
  deleteCard: () => {},
  addedCard: null,
  setAddedCard: () => {},
  showCardAdded: () => {},
  cardAddedOpen: false,
  updateCtx: null,
  setUpdateCtx: () => {},
  pendingReopenSheet: null,
  setPendingReopenSheet: () => {},
})

export const usePayment = () => useContext(PaymentContext)
