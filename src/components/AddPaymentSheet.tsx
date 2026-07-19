import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, ICON } from './icons'
import CardLogo, { type CardBrand } from './CardLogo'
import { SheetPortal } from './sheetPortal'
import type { PaymentFlowConfig } from '../payment'

const addOptions: {
  kind: CardBrand | 'egiro'
  name: string
  note?: string
}[] = [
  { kind: 'visa', name: 'Visa' },
  { kind: 'mastercard', name: 'Mastercard' },
  { kind: 'amex', name: 'AMEX' },
  {
    kind: 'egiro',
    name: 'eGIRO',
    note: 'Please note that eGIRO approval may take some time.',
  },
]

/** "Add a payment method" bottom sheet — shared across the app. Parent owns
    the open/closing state and mounts it: {open && <AddPaymentSheet .../>} */
export default function AddPaymentSheet({
  closing,
  onClose,
  reopen,
  flow,
}: {
  closing: boolean
  onClose: () => void
  /** which sheet to reopen on the parent after returning from the gateway */
  reopen?: string
  /** current payment-flow config, forwarded through the gateway round trip
      so it survives the remount when the parent screen reopens */
  flow?: PaymentFlowConfig
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <SheetPortal>
      <div className="absolute inset-0 z-[60] flex flex-col justify-end">
        <div
          className={`absolute inset-0 bg-[#141414]/85 ${
            closing ? 'sheet-scrim-out' : 'sheet-scrim'
          }`}
          onClick={onClose}
        />
        <div
          className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-8 pt-6 ${
            closing ? 'sheet-panel-out' : 'sheet-panel'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-black leading-6 text-sh-ink">
              Add a payment method
            </h3>
            <button onClick={onClose} aria-label="Close" className="text-sh-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="mt-10 flex flex-col gap-2">
            {addOptions.map((o) => (
              <button
                key={o.kind}
                onClick={() =>
                  o.kind === 'egiro'
                    ? navigate('/add-egiro', {
                        state: { returnTo: pathname, reopen, flow },
                      })
                    : navigate('/redirecting', {
                        state: {
                          next: '/gateway',
                          brand: o.kind,
                          returnTo: pathname,
                          reopen,
                          flow,
                        },
                      })
                }
                className="flex flex-col rounded-[16px] border border-sh-line bg-white p-4 text-left shadow-[0_2px_8px_rgba(20,20,20,0.08)] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {o.kind === 'egiro' ? (
                    <span className="w-8 text-[13px] font-black leading-none">
                      <span className="text-[#e6007e]">e</span>
                      <span className="text-[#4b2e83]">GIRO</span>
                    </span>
                  ) : (
                    <CardLogo brand={o.kind} />
                  )}
                  <span className="flex-1 text-[16px] font-bold text-sh-ink">
                    {o.name}
                  </span>
                  <AssetIcon src={ICON.chevron} size={20} />
                </div>
                {o.note && (
                  <div className="mt-2 flex items-start gap-1.5 text-[13px] leading-5 text-sh-ink/60">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mt-px shrink-0"
                    >
                      <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" />
                      <path
                        d="M12 11v5M12 8h.01"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{o.note}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SheetPortal>
  )
}
