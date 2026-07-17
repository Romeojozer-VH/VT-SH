/**
 * Icon helpers backed by the exported Figma SVGs in /public/Icons.
 *
 * - AssetIcon: renders the SVG as-is (keeps its original colours). Use for
 *   multi-colour or fixed-colour icons (bell, SIM, diamond, chat, arrows…).
 * - MaskIcon: renders the SVG as a CSS mask so it can be tinted via the CSS
 *   `color` (currentColor). Use for monochrome icons that need recolouring,
 *   e.g. the active/inactive bottom-nav icons.
 */

interface IconProps {
  src: string
  size?: number
  className?: string
  alt?: string
}

export function AssetIcon({ src, size = 24, className = '', alt = '' }: IconProps) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function MaskIcon({ src, size = 24, className = '' }: IconProps) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}

/** Paths to the exported Figma assets (spaces URL-encoded). */
export const ICON = {
  bell: '/Icons/Icon-2.svg',
  alert: '/Icons/alert-circle.svg',
  alertTriangle: '/Icons/alert-triangle.svg',
  info: '/Icons/info-circle.svg',
  creditCard: '/Icons/credit-card.svg',
  sim: '/Icons/Icon-1.svg',
  wifi: '/Icons/Icon.svg',
  diamond: '/Icons/Membership.svg',
  arrow: '/Icons/arrow-right.svg',
  mobileSim2: '/Icons/Mobile-Sim2.svg',
  internet: '/Icons/Internet.svg',
  chat: '/Icons/Frame%202085663135.svg',
  illustration: '/Icons/Moment%20Card%20Image.svg',
  navHome: '/Icons/home-06.svg',
  navHomeActive: '/Icons/home-06-active.svg',
  navHub: '/Icons/blockchain-01.svg',
  navPay: '/Icons/receipt.svg',
  navPayActive: '/Icons/invoice-01-active.svg',
  navShop: '/Icons/shopping-basket-01.svg',
  navAccount: '/Icons/user.svg',
  // Pay (Payment dashboard) screen
  managePayment: '/Icons/manage-payment.svg',
  manageServices: '/Icons/manage-services.svg',
  payLater: '/Icons/pay-later.svg',
  addOn: '/Icons/add-on.svg',
  invoice: '/Icons/invoice-01.svg',
  legacyContract: '/Icons/legacy-contract.svg',
  chevron: '/Icons/chevron-right.svg',
  visa: '/Icons/Visa.svg',
  mobileSim: '/Icons/mobile-sim.svg',
} as const

export const IMG = {
  homeBg: '/Images/Home%20BG.jpg',
  homePortal: '/Illustrations/home-portal.svg',
  momentCardBg: '/Illustrations/moment-card-bg.svg',
  receiptTop: '/Illustrations/receipt-top.svg',
  receiptBottom: '/Illustrations/receipt-bottom.svg',
  rewards: '/Images/Rewards.jpg',
  promoGalaxy: '/Images/source/Screenshot%202026-06-09%20at%202.11.png',
  promoHbo: '/Images/source/image.png',
} as const
