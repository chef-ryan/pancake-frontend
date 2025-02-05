import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, Flex, Input, QuestionHelper, Text } from '@pancakeswap/uikit'
import { settingsAtom } from 'atoms/settings/settingsAtom'
import { DEFAULT_DEADLINE } from 'config/constants/settings'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { PrimaryOutlineButton, VerticalDivider } from 'styles/inputStyles'

const THREE_DAYS_IN_SECONDS = 60 * 60 * 24 * 3

export const TransactionDeadlineSettings = (props: BoxProps) => {
  const { t } = useTranslation()
  const [settings, setSettings] = useAtom(settingsAtom)
  const { transactionDeadline: ttl } = settings

  const [deadlineInput, setDeadlineInput] = useState('')

  const deadlineInputIsValid =
    deadlineInput === '' || (ttl !== undefined && (Number(ttl) / 60).toString() === deadlineInput)

  const deadlineError = deadlineInput !== '' && !deadlineInputIsValid

  const parseCustomDeadline = (value: string) => {
    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 60 && valueAsInt < THREE_DAYS_IN_SECONDS) {
        setSettings((prev) => ({ ...prev, transactionDeadline: valueAsInt }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Box {...props}>
        <Flex alignItems="center">
          <Text small>{t('Tx deadline')}</Text>
          <QuestionHelper
            text={t('Your transaction will revert if it is left confirming for longer than this time.')}
            placement="top"
            ml="4px"
          />
        </Flex>
        <Flex alignItems="center">
          <Box position="relative" width="128px" mt="4px">
            <Input
              scale="md"
              inputMode="numeric"
              pattern="^[0-9]+$"
              isWarning={!!deadlineError}
              placeholder={(Number(ttl) / 60).toString()}
              value={deadlineInput}
              onChange={(event) => {
                if (event.currentTarget.validity.valid) {
                  setDeadlineInput(event.target.value)
                }
              }}
              onBlur={(event) => {
                if (event.currentTarget.validity.valid) {
                  parseCustomDeadline(event.target.value)
                }
              }}
              style={{
                paddingRight: '48px',
              }}
            />
            <Flex position="absolute" right="8px" top="8px" alignItems="center">
              <VerticalDivider bg="inputSecondary" />
              <Text color="textSubtle">{t('Mins')}</Text>
            </Flex>
          </Box>
          <PrimaryOutlineButton
            ml="8px"
            mt="3px"
            variant="text"
            scale="sm"
            onClick={() => {
              setDeadlineInput('')
              parseCustomDeadline((DEFAULT_DEADLINE / 60).toString())
            }}
          >
            {t('Reset')}
          </PrimaryOutlineButton>
        </Flex>
      </Box>
    </>
  )
}
