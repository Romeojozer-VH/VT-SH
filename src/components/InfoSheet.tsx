import { AssetIcon, ICON } from './icons'
import { SheetPortal } from './sheetPortal'

/** Small "what is this?" info bottom sheet — icon, title, optional rate
    row, description. Shared by DeviceDollars / Balance left / etc. */
export default function InfoSheet({
  icon,
  title,
  rate,
  description,
  closing,
  onClose,
}: {
  icon: string
  title: string
  rate?: { left: string; right: string }
  description: string
  closing: boolean
  onClose: () => void
}) {
  return (
    <SheetPortal>
      <div className="absolute inset-0 z-[70] flex flex-col justify-end">
        <div
          className={`absolute inset-0 bg-[#141414]/85 ${
            closing ? 'sheet-scrim-out' : 'sheet-scrim'
          }`}
          onClick={onClose}
        />
        <div
          className={`relative z-10 rounded-t-[24px] bg-white px-5 pb-12 pt-6 ${
            closing ? 'sheet-panel-out' : 'sheet-panel'
          }`}
        >
          <div className="flex justify-end">
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

          <div className="flex flex-col gap-4">
            <AssetIcon src={icon} size={48} />
            <h3 className="text-[24px] font-black leading-8 text-sh-ink">{title}</h3>
            {rate && (
              <div className="flex items-center gap-1">
                <AssetIcon src={ICON.money03} size={16} />
                <span className="text-[14px] leading-[18px] text-sh-ink">
                  {rate.left}
                </span>
                <span className="text-[14px] leading-[18px] text-sh-ink">=</span>
                <span className="text-[14px] font-bold leading-[18px] text-sh-ink">
                  {rate.right}
                </span>
              </div>
            )}
            <p className="text-[16px] leading-6 text-sh-ink">{description}</p>
          </div>
        </div>
      </div>
    </SheetPortal>
  )
}
