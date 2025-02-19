import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, Button, Flex, FlexGap, Input, Message, Text } from '@pancakeswap/uikit'
import { escapeRegExp } from '@pancakeswap/utils/escapeRegExp'
import { settingsAtom } from 'atoms/settings/settingsAtom'
import { Slippage } from 'config/constants/settings'
import { useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { VerticalDivider } from 'styles/inputStyles'
import { SlippageError } from 'types/settings'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

const ButtonsContainer = styled(FlexGap).attrs({ flexWrap: 'wrap', gap: '4px' })`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 1px;
  width: fit-content;

  box-shadow: ${({ theme }) => theme.shadows.inset};
`

const StyledButton = styled(Button)`
  min-width: 64px;
  height: 52px;
`

export const SlippageSettings = (props: BoxProps) => {
  const { t } = useTranslation()
  const [slippageInput, setSlippageInput] = useState('')
  const [settings, setSettings] = useAtom(settingsAtom)
  const { slippage } = settings

  const isSlippageValid = useMemo(
    () => slippageInput === '' || (slippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2),
    [slippage, slippageInput],
  )

  const slippageError = useMemo(() => {
    if (slippageInput !== '' && !isSlippageValid) {
      return SlippageError.InvalidInput
    }
    if (isSlippageValid && slippage < 50) {
      // Slippage < 0.5%
      return SlippageError.RiskyLow
    }
    if (isSlippageValid && slippage > 2000) {
      // Slippage > 20%
      return SlippageError.RiskyVeryHigh
    }
    if (isSlippageValid && slippage > 100) {
      // Slippage > 1%
      return SlippageError.RiskyHigh
    }

    return undefined
  }, [slippageInput, isSlippageValid, slippage])

  const parseCustomSlippage = useCallback(
    (value: string) => {
      if (value === '' || inputRegex.test(escapeRegExp(value))) {
        setSlippageInput(value)

        try {
          const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
          if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
            // Slippage example value: 0.5% => 50
            setSettings((prev) => ({ ...prev, slippage: valueAsIntFromRoundedFloat }))
          }
        } catch (error) {
          console.error(error)
        }
      }
    },
    [setSlippageInput, setSettings],
  )

  return (
    <Box {...props}>
      <Text small>{t('Slippage Tolerance')}</Text>
      <ButtonsContainer mt="8px">
        <StyledButton
          scale="sm"
          onClick={() => {
            setSlippageInput('')
            setSettings((prev) => ({ ...prev, slippage: Slippage.LOW }))
          }}
          variant={slippage === Slippage.LOW ? 'subtle' : 'light'}
        >
          {Slippage.LOW / 100}%
        </StyledButton>
        <StyledButton
          scale="sm"
          onClick={() => {
            setSlippageInput('')
            setSettings((prev) => ({ ...prev, slippage: Slippage.MEDIUM }))
          }}
          variant={slippage === Slippage.MEDIUM ? 'subtle' : 'light'}
        >
          {Slippage.MEDIUM / 100}%
        </StyledButton>
        <StyledButton
          scale="sm"
          onClick={() => {
            setSlippageInput('')
            setSettings((prev) => ({ ...prev, slippage: Slippage.HIGH }))
          }}
          variant={slippage === Slippage.HIGH ? 'subtle' : 'light'}
        >
          {Slippage.HIGH / 100}%
        </StyledButton>
        <Flex ml="8px" pr="8px" alignItems="center">
          <Box position="relative" width="82px">
            <Input
              scale="md"
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]{0,2}$"
              placeholder={(slippage / 100).toFixed(2)}
              value={slippageInput}
              onBlur={() => {
                parseCustomSlippage((slippage / 100).toFixed(2))
              }}
              onChange={(event) => {
                if (event.currentTarget.validity.valid) {
                  parseCustomSlippage(event.target.value.replace(/,/g, '.'))
                }
              }}
              isWarning={!isSlippageValid}
              isSuccess={![10, 50, 100].includes(slippage)}
              style={{
                paddingRight: '28px',
              }}
            />
            <Flex position="absolute" right="8px" top="8px" alignItems="center">
              <VerticalDivider bg="inputSecondary" />
              <Text color="textSubtle"> %</Text>
            </Flex>
          </Box>
        </Flex>
      </ButtonsContainer>

      {!!slippageError && (
        <Message
          mt="8px"
          variant={
            slippageError === SlippageError.InvalidInput
              ? 'primary'
              : slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh
              ? 'warning'
              : 'danger'
          }
        >
          <Text>
            {slippageError === SlippageError.InvalidInput
              ? t('Enter a valid slippage percentage')
              : slippageError === SlippageError.RiskyLow
              ? t('Your transaction may fail')
              : t('Your transaction may be frontrun')}
            .<br />
            <Text
              as="button"
              role="button"
              onClick={() => {
                setSlippageInput('')
                setSettings((prev) => ({ ...prev, slippage: Slippage.DEFAULT }))
              }}
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'inline-block',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
              bold
            >
              {t('Reset slippage settings')}
            </Text>{' '}
            {t('to avoid potential loss')}.
          </Text>
        </Message>
      )}
    </Box>
  )
}
