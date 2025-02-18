import { useTranslation } from '@pancakeswap/localization'
import { type BoxProps, Flex, PreTitle, QuestionHelper, Text, Toggle, Box } from '@pancakeswap/uikit'
import { settingsAtom } from 'atoms/settings/settingsAtom'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export const RoutingPreference = (props: BoxProps) => {
  const { t } = useTranslation()
  const [{ allowMultihops }, setSettings] = useAtom(settingsAtom)

  const toggleAllowMultihops = useCallback(() => {
    setSettings((p) => ({ ...p, allowMultihops: !allowMultihops }))
  }, [allowMultihops, setSettings])

  return (
    <Box {...props}>
      <PreTitle mb="16px">{t('Routing preference')}</PreTitle>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <Text fontSize="14px">{t('Allow Multihops')}</Text>
          <QuestionHelper
            text={
              <Flex flexDirection="column">
                <Text mr="5px">
                  {t(
                    'Multihops enables token swaps through multiple hops between several pools to achieve the best deal.',
                  )}
                </Text>
                <Text mr="5px" mt="1em">
                  {t(
                    'Turning this off will only allow direct swap, which may cause higher slippage or even fund loss.',
                  )}
                </Text>
              </Flex>
            }
            placement="top"
            ml="4px"
          />
        </Flex>

        <Toggle
          id="toggle-disable-multihop-button"
          checked={allowMultihops}
          scale="sm"
          onChange={toggleAllowMultihops}
        />
      </Flex>
    </Box>
  )
}
