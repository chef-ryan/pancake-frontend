interface LogoProps {
  width?: number
}
export const Logo = ({ width = 26 }: LogoProps) => {
  return <img src="/images/ton-logo.png" alt="TON" width={width} />
}
