import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/ton-v2-sdk'

import { ArrowForwardIcon, CircleLoader, Column, QuestionHelper, Text } from '@pancakeswap/uikit'
import { formatBigInt, formatNumber } from '@pancakeswap/utils/formatBalance'
import { LightGreyCard } from 'components/Card'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { CurrencyLogo } from 'components/widgets/CurrencyLogo'
import { useNativeCurrency } from 'hooks/tokens/useNativeCurrency'
import { useAtomValue } from 'jotai'
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react'
import { FixedSizeList } from 'react-window'
import { styled } from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { currencyKey } from 'utils/tokens/currency'

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`

const FixedContentRow = styled.div`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-gap: 16px;
  align-items: center;
`

// function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
//   return <StyledBalanceText title={balance.toExact()}>{formatAmount(balance, 4)}</StyledBalanceText>
// }

const MenuItem = styled(RowBetween)<{ disabled: boolean; selected: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) minmax(0, 72px);
  grid-gap: 10px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  &:hover {
    background-color: ${({ theme, disabled }) => !disabled && theme.colors.background};
  }
  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}) {
  const userAddress = useAtomValue(addressAtom)

  // const { t } = useTranslation()
  const key = currencyKey(currency)

  const { data: balanceRaw, isLoading: isBalanceLoading } = useAtomValue(balanceAtom(currency))

  const balance = useMemo(
    () => formatBigInt(balanceRaw, currency.decimals, currency.decimals),
    [balanceRaw, currency.decimals],
  )

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size="28px" />

      <Column>
        <Text bold>{currency?.symbol}</Text>
        {/* <Text color="textSubtle" small ellipsis maxWidth="200px">
          {!isOnSelectedList && customAdded && `${t('Added by user')} •`} {currency?.name}
        </Text> */}
      </Column>
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {userAddress && balance !== undefined ? (
          <StyledBalanceText title={balance}>{formatNumber(Number(balance), 0)}</StyledBalanceText>
        ) : userAddress && isBalanceLoading ? (
          <CircleLoader />
        ) : (
          <ArrowForwardIcon />
        )}
      </RowFixed>
    </MenuItem>
  )
}

export default function CurrencyList({
  height,
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showNative,
  showImportView,
  setImportToken,
  breakIndex,
}: {
  height: number | string
  currencies: Currency[]
  inactiveCurrencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showNative: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
  breakIndex: number | undefined
}) {
  const native = useNativeCurrency()

  const itemData: (Currency | undefined)[] = useMemo(() => {
    let formatted: (Currency | undefined)[] = showNative
      ? [native, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies]

    if (breakIndex !== undefined) {
      formatted = [...formatted.slice(0, breakIndex), undefined, ...formatted.slice(breakIndex, formatted.length)]
    }
    return formatted
  }, [breakIndex, currencies, inactiveCurrencies, showNative, native])

  const { t } = useTranslation()

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Currency = data[index]

      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))
      const otherSelected = Boolean(otherCurrency && currency && otherCurrency.equals(currency))

      const handleSelect = () => onCurrencySelect(currency)
      // const token = currency.wrapped
      // const showImport = index > currencies.length

      if (index === breakIndex || !data) {
        return (
          <FixedContentRow style={style}>
            <LightGreyCard padding="8px 12px" borderRadius="8px">
              <RowBetween>
                <Text small>{t('Expanded results from inactive Token Lists')}</Text>
                <QuestionHelper
                  text={t(
                    "Tokens from inactive lists. Import specific tokens below or click 'Manage' to activate more lists.",
                  )}
                  ml="4px"
                />
              </RowBetween>
            </LightGreyCard>
          </FixedContentRow>
        )
      }

      // if (showImport && token) {
      //   return (
      //     <ImportRow
      //       onCurrencySelect={handleSelect}
      //       style={style}
      //       token={token}
      //       showImportView={showImportView}
      //       setImportToken={setImportToken}
      //       dim
      //     />
      //   )
      // }
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      )
    },
    [selectedCurrency, otherCurrency, breakIndex, onCurrencySelect, t],
  )

  const itemKey = useCallback((index: number, data: any) => `${currencyKey(data[index])}-${index}`, [])

  return (
    <FixedSizeList
      height={height}
      ref={fixedListRef as any}
      width="100%"
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  )
}
