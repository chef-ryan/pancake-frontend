import { Box, Button, FlexGap, Svg, SvgProps } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const Hr = styled.hr`
  width: 100%;
  border-color: ${({ theme }) => theme.colors.cardBorder};
`

export const TertiaryButton = styled(Button)`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.primary60};
  border: 1px solid ${({ theme }) => theme.colors.tertiary};
`

export const Dot = styled(Box)`
  width: 12px;
  min-width: 12px;
  height: 12px;
  border-radius: 50%;
`

export const ScrollableList = styled(FlexGap).attrs({
  flexDirection: 'column',
  gap: '8px',
})`
  overflow-y: auto;
  min-height: 20px;
`

export const CircleSvg = ({
  percent = 1,
  stroke = '#1FC7D4',
  ...props
}: SvgProps & { percent?: number; stroke?: string }) => (
  <Svg width="60px" height="60px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g filter="url(#filter0_i_1147_113741)">
      <circle r="10" cx="10" cy="10" fill="#7645D9" />
      <circle
        r="5"
        cx="10"
        cy="10"
        fill="transparent"
        stroke={stroke}
        strokeWidth="10"
        strokeDasharray={`calc(${percent * 100}px * 31.4 / 100) 31.4`}
        transform="rotate(-90) translate(-20)"
      />
    </g>
    <defs>
      <filter
        id="filter0_i_1147_113741"
        x={0}
        y={0}
        width={60}
        height={60}
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy={-2} />
        <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
        <feBlend in2="shape" result="effect1_innerShadow_1147_113741" />
      </filter>
    </defs>
  </Svg>
)
