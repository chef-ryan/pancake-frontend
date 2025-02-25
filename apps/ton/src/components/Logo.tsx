import { getAssetUrl } from 'utils'

interface LogoProps {
  width?: number
}
export const Logo = ({ width = 26 }: LogoProps) => {
  return <img src={getAssetUrl('ton-logo.png')} alt="TON" width={width} />
}
