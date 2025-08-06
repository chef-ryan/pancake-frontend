import { Flex, Text, Input, QuestionHelper } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useSolanaPriorityFee } from '@pancakeswap/utils/user'
import React, { useCallback } from 'react'

export function PriorityFeeSettingField() {
  const { t } = useTranslation()
  const [priorityFee, setPriorityFee] = useSolanaPriorityFee()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.currentTarget.value, 10)
      if (!Number.isNaN(value)) {
        setPriorityFee(value)
      } else {
        setPriorityFee(0)
      }
    },
    [setPriorityFee],
  )

  return (
    <Flex flexDirection="column">
      <Flex mb="12px">
        <Text>{t('Priority Fee (lamports)')}</Text>
        <QuestionHelper text={t('Additional fee to speed up Solana transactions')} placement="top" ml="4px" />
      </Flex>
      <Input type="number" scale="sm" value={priorityFee} onChange={handleChange} min={0} placeholder="0" />
    </Flex>
  )
}
