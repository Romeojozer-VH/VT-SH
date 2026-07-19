import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, ICON, IMG } from '../components/icons'
import StatusBar from '../components/StatusBar'
import type { PaymentFlowConfig } from '../payment'

const SG_BANKS = [
  'DBS/POSB',
  'OCBC',
  'UOB',
  'Standard Chartered',
  'Citibank',
  'Maybank',
  'HSBC',
  'Bank of China',
  'CIMB Bank',
  'RHB Bank',
  'Trust Bank',
  'GXS Bank',
  'MariBank',
]

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex w-full flex-col gap-2 border-b border-[#b9b9b9] py-2 focus-within:border-sh-green">
      <label className="text-[14px] font-black leading-[18px] tracking-[0.15px] text-sh-ink">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-transparent text-[16px] leading-6 text-sh-ink placeholder:text-sh-ink/40 focus:outline-none"
      />
    </div>
  )
}

export default function AddEgiroAccount() {
  const navigate = useNavigate()
  const location = useLocation()

  const st = location.state as {
    returnTo?: string
    reopen?: string
    flow?: PaymentFlowConfig
  } | null
  const returnTo = st?.returnTo ?? '/update-payment'
  const reopen = st?.reopen
  const flow = st?.flow

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bank, setBank] = useState('')
  const [agreed, setAgreed] = useState(false)

  const canSave = name.trim() !== '' && email.trim() !== '' && bank !== '' && agreed

  const save = () => {
    navigate('/redirecting', {
      state: { next: '/egiro-bank-auth', bank, name, email, returnTo, reopen, flow },
    })
  }

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

      {/* Back button */}
      <div className="relative z-10 px-5 pt-[18px]">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(20,20,20,0.1)] active:scale-95"
        >
          <AssetIcon src={ICON.arrow} size={22} className="rotate-180" />
        </button>
      </div>

      {/* White content panel */}
      <div className="relative z-10 mt-3 flex flex-1 flex-col rounded-t-[24px] bg-[#fafafa] px-5 pb-8 pt-6">
        <h1 className="text-[24px] font-bold leading-8 text-sh-ink">
          Add an eGIRO account
        </h1>

        <div className="mt-6 flex flex-col gap-3">
          <Field
            label="Name"
            placeholder="Name on bank account"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label="Email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex w-full flex-col gap-2 border-b border-[#b9b9b9] py-2 focus-within:border-sh-green">
            <label className="text-[14px] font-black leading-[18px] tracking-[0.15px] text-sh-ink">
              Bank
            </label>
            <div className="relative flex items-center gap-4">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className={`w-full flex-1 appearance-none bg-transparent text-[16px] leading-6 focus:outline-none ${
                  bank ? 'text-sh-ink' : 'text-sh-ink/40'
                }`}
              >
                <option value="" disabled>
                  Select a bank
                </option>
                {SG_BANKS.map((b) => (
                  <option key={b} value={b} className="text-sh-ink">
                    {b}
                  </option>
                ))}
              </select>
              <AssetIcon
                src={ICON.chevron}
                size={16}
                className="pointer-events-none absolute right-0 rotate-90"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setAgreed((v) => !v)}
          className="mt-6 flex items-start gap-3 text-left"
        >
          <span
            className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] border-2 ${
              agreed ? 'border-sh-green bg-sh-green' : 'border-[#b9b9b9] bg-white'
            }`}
          >
            {agreed && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#141414"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <p className="text-[14px] leading-5 text-sh-ink">
            By proceeding, you agree to our eGIRO payment submission{' '}
            <span className="font-bold underline">T&amp;Cs</span>
          </p>
        </button>

        <div className="mt-auto pt-8">
          <button
            onClick={save}
            disabled={!canSave}
            className={`h-14 w-full rounded-full text-[16px] font-black transition ${
              canSave
                ? 'bg-sh-green text-sh-ink active:scale-[0.99]'
                : 'cursor-not-allowed bg-sh-green/45 text-sh-ink/50'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
