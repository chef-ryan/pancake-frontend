import dynamic from 'next/dynamic'

const BodyText = dynamic(() => import('./BodyText').then((mod) => mod.BodyText), { ssr: false })
const Button = dynamic(() => import('./Button').then((mod) => mod.AdButton), { ssr: false })
const Card = dynamic(() => import('./Card').then((mod) => mod.AdCard), { ssr: false })
const AdPlayer = dynamic(() => import('./CardLayouts').then((mod) => mod.AdPlayer), { ssr: false })
const DesktopCard = dynamic(() => import('./CardLayouts').then((mod) => mod.DesktopCard), { ssr: false })
const MobileCard = dynamic(() => import('./CardLayouts').then((mod) => mod.MobileCard), { ssr: false })

export const AdPanel = {
  DesktopCard,
  MobileCard,
  AdPlayer,
  Card,
  BodyText,
  Button,
}
