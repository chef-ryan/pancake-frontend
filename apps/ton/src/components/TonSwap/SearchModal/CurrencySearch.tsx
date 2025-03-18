import { useDebounce, useSortedTokensByQuery } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { AutoColumn, Box, Column, Input, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { createFilterToken } from 'utils/tokens/filterTokens'

import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import Row from 'components/Layout/Row'
import { useNativeCurrency } from 'hooks/tokens/useNativeCurrency'
import { useAtomValue } from 'jotai'
import { balanceMultipleAtom } from 'ton/logic/balanceMultipleAtom'
import { isAddress } from 'ton/utils/address'
import { getAssetUrl } from 'utils'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'

interface CurrencySearchProps {
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showSearchInput?: boolean
  showCommonBases?: boolean
  commonBasesType?: string
  showImportView: () => void
  setImportToken: (token: Currency) => void
  height?: number
  tokensToShow?: Currency[]
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  commonBasesType,
  showSearchInput = true,
  showImportView,
  setImportToken,
  height,
  tokensToShow,
}: CurrencySearchProps) {
  const { t } = useTranslation()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const { data: activeList } = useAtomValue(fetchListAtom)
  const allTokens = useMemo(() => activeList || [], [activeList])

  const { isMobile } = useMatchBreakpoints()

  const native = useNativeCurrency()

  const showNative: boolean = useMemo(() => {
    if (tokensToShow) return false
    const s = debouncedQuery.toLowerCase().trim()
    return native && native.symbol?.toLowerCase?.()?.indexOf(s) !== -1
  }, [debouncedQuery, native, tokensToShow])

  const filteredTokens: Currency[] = useMemo(() => {
    const filterToken = createFilterToken(debouncedQuery, (address) => isAddress(address))
    return Object.values(tokensToShow || allTokens).filter(filterToken)
  }, [tokensToShow, allTokens, debouncedQuery])

  const filteredQueryTokens = useSortedTokensByQuery(filteredTokens, debouncedQuery)

  const balances = useAtomValue(balanceMultipleAtom(filteredQueryTokens))
  const filteredSortedTokens: Currency[] = useMemo(() => {
    return filteredQueryTokens
      .map((token, index) => ({ token, balance: balances[index] }))
      .toSorted((a, b) => Number((b.balance || 0n) - (a.balance || 0n)))
      .map(({ token }) => token)
  }, [filteredQueryTokens, balances])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
    },
    [onCurrencySelect],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus()
  }, [isMobile])

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = input
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === native.symbol.toLowerCase().trim()) {
          handleCurrencySelect(native)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokens, handleCurrencySelect, native],
  )

  const CurrencyListRows = useMemo(
    () =>
      filteredSortedTokens?.length ? (
        <Box mx="-24px" mt="20px">
          <CurrencyList
            height={isMobile ? (showCommonBases ? height || 250 : height ? height + 80 : 350) : 390}
            showNative={showNative}
            currencies={filteredSortedTokens}
            inactiveCurrencies={[]}
            breakIndex={filteredSortedTokens ? filteredSortedTokens.length : undefined}
            onCurrencySelect={handleCurrencySelect}
            otherCurrency={otherSelectedCurrency}
            selectedCurrency={selectedCurrency}
            fixedListRef={fixedList}
            showImportView={showImportView}
            setImportToken={setImportToken}
          />
        </Box>
      ) : (
        <Column mt="16px" style={{ padding: '20px', height: '100%', alignItems: 'center' }}>
          <img src={getAssetUrl('laptop-bunny.png')} alt="No results" width="100px" />
          <Text color="textSubtle" textAlign="center" mt="16px" mb="20px">
            {t('No tokens found')}
          </Text>
        </Column>
      ),
    [
      filteredSortedTokens,
      handleCurrencySelect,
      otherSelectedCurrency,
      selectedCurrency,
      setImportToken,
      showNative,
      showImportView,
      t,
      showCommonBases,
      isMobile,
      height,
    ],
  )

  return (
    <>
      <AutoColumn gap="16px">
        {showSearchInput && (
          <Row>
            <Input
              id="token-search-input"
              placeholder={t('Search by name')}
              scale="lg"
              autoComplete="off"
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}
            />
          </Row>
        )}
        {showCommonBases && (
          <CommonBases
            onSelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            commonBasesType={commonBasesType}
          />
        )}
      </AutoColumn>
      {CurrencyListRows}
    </>
  )
}

export default CurrencySearch
