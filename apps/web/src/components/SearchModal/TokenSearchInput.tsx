import { ChainId } from '@pancakeswap/chains'
import { useDebounce } from '@pancakeswap/hooks'
import { Input, Row } from '@pancakeswap/uikit'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useState } from 'react'
import { safeGetAddress } from 'utils'

export default function TokenSearchInput({ fixedList, filteredSortedTokens, handleCurrencySelect }) {
  const [selectedChainId, setSelectedChainId] = useState<ChainId | undefined>(selectedCurrency?.chainId)

  const native = useNativeCurrency(selectedChainId)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = safeGetAddress(input)
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

  return (
    <Row>
      <Input
        id="token-search-input"
        placeholder={t('Search by name or paste address')}
        scale="lg"
        autoComplete="off"
        value={searchQuery}
        ref={inputRef as RefObject<HTMLInputElement>}
        onChange={handleInput}
        onKeyDown={handleEnter}
      />
    </Row>
  )
}
