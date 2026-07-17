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
