import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/ton-v2-sdk'
import { AutoColumn, QuestionHelper, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/widgets'
import { useNativeCurrency } from 'hooks/tokens/useNativeCurrency'
import { styled } from 'styled-components'

import { AutoRow } from 'components/Layout/Row'
import { SUGGESTED_BASES } from 'config/constants/commonBases'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { CommonBasesType } from './types'

const ButtonWrapper = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-right: 10px;
`

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.colors.dropdown)};
  border-radius: ${({ theme }) => theme.radii['20px']};
  padding-left: 2px;
  display: flex;
  align-items: center;
  &:hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.colors.background};
  }
  background-color: ${({ theme }) => theme.colors.tertiary};
  opacity: ${({ disable }) => disable && '0.4'};
  transition: background-color 0.15s;
`

const RowWrapper = styled.div`
  white-space: nowrap;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`

export default function CommonBases({
  onSelect,
  selectedCurrency,
  commonBasesType,
}: {
  commonBasesType
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const native: any = useNativeCurrency()
  const chainId = useAtomValue(chainIdAtom)
  const { t } = useTranslation()
  const pinTokenDescText = commonBasesType === CommonBasesType.SWAP_LIMITORDER ? t('Select token') : t('Common bases')

  return (
    <AutoColumn gap="sm">
      <AutoRow>
        <Text color="textSubtle" fontSize="14px">
          {pinTokenDescText}
        </Text>
        {commonBasesType === CommonBasesType.LIQUIDITY && (
          <QuestionHelper text={t('These tokens are commonly paired with other tokens.')} ml="4px" />
        )}
      </AutoRow>
      <RowWrapper>
        <ButtonWrapper>
          <BaseWrapper
            onClick={() => {
              if (!selectedCurrency || !selectedCurrency.isNative) {
                onSelect(native)
              }
            }}
            disable={selectedCurrency?.isNative}
          >
            <CurrencyLogo currency={native} />
            <Text p="2px 6px">{native?.symbol}</Text>
          </BaseWrapper>
        </ButtonWrapper>
        {(chainId ? SUGGESTED_BASES[chainId] || [] : []).map((token: Token) => {
          if (!token) return null
          const selected = selectedCurrency?.equals(token)
          return (
            <ButtonWrapper key={`buttonBase#${token.address}`}>
              <BaseWrapper onClick={() => !selected && onSelect(token)} disable={selected}>
                <CurrencyLogo currency={token as any} style={{ borderRadius: '50%' }} />
                <Text p="2px 6px">{token.symbol}</Text>
              </BaseWrapper>
            </ButtonWrapper>
          )
        })}
      </RowWrapper>
    </AutoColumn>
  )
}
