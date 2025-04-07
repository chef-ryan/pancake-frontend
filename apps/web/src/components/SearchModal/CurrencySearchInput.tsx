import { useTranslation } from '@pancakeswap/localization'
import { Input, InputProps } from '@pancakeswap/uikit'
import { RefObject, useCallback, useRef } from 'react'
import { useSearchQuery } from 'state/tokenList/searchQueryAtom'
import { safeGetAddress } from 'utils'

interface CurrencySearchInputProps extends InputProps {
  inputRef?: ReturnType<typeof useRef<HTMLInputElement>> | null
  handleEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onInput?: (event: React.ChangeEvent<HTMLInputElement>) => void
  compact?: boolean
}

export const CurrencySearchInput = ({
  inputRef = null,
  handleEnter,
  onInput,
  compact = false,

  ...props
}: CurrencySearchInputProps) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useSearchQuery()

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      const checksummedInput = safeGetAddress(input)
      setSearchQuery(checksummedInput || input)
      onInput?.(event)
    },
    [setSearchQuery, onInput],
  )

  return (
    <Input
      id="token-search-input"
      placeholder={t('Search name / address')}
      scale={compact ? 'md' : 'lg'}
      autoComplete="off"
      value={searchQuery}
      ref={inputRef as RefObject<HTMLInputElement>}
      onChange={handleInput}
      onKeyDown={handleEnter}
      {...props}
    />
  )
}
