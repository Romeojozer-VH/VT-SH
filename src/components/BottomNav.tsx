import { useLocation, useNavigate } from 'react-router-dom'
import { AssetIcon, MaskIcon, ICON } from './icons'

interface NavItem {
  src: string
  activeSrc?: string // pre-coloured active-state icon
  label: string
  path?: string // screens that exist yet
}

const items: NavItem[] = [
  { src: ICON.navHome, activeSrc: ICON.navHomeActive, label: 'Home', path: '/' },
  { src: ICON.navHub, label: 'My Hub' },
  { src: ICON.navPay, activeSrc: ICON.navPayActive, label: 'Pay', path: '/pay' },
  { src: ICON.navShop, label: 'Shop' },
  { src: ICON.navAccount, label: 'Account' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-around border-t border-sh-line/60 bg-white px-2 pb-6 pt-2">
      {items.map((item) => {
        const active = item.path ? pathname === item.path : false
        return (
          <button
            key={item.label}
            onClick={() => item.path && navigate(item.path)}
            className={`flex flex-1 flex-col items-center gap-1 ${
              active ? 'text-sh-ink' : 'text-sh-ink/50'
            }`}
          >
            {/* Active uses the pre-coloured *-active icon when provided;
                otherwise the outline icon tinted green. Inactive is muted. */}
            {!active ? (
              <AssetIcon src={item.src} size={26} className="opacity-50" />
            ) : item.activeSrc ? (
              <AssetIcon src={item.activeSrc} size={26} />
            ) : (
              <MaskIcon src={item.src} size={26} className="text-sh-green" />
            )}
            <span className={`text-[11px] ${active ? 'font-black' : 'font-bold'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
