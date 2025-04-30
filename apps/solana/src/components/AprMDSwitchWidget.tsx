import { Box, Button, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { SwapHorizIcon } from '@pancakeswap/uikit'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CircleCheck from '@/icons/misc/CircleCheck'
import SquareDIcon from '@/icons/misc/SquareDIcon'
import SquareMIcon from '@/icons/misc/SquareMIcon'
import { SvgIcon } from '@/icons/type'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import ResponsiveModal from './ResponsiveModal'
import Tooltip from './Tooltip'

export default function AprMDSwitchWidget(props: SvgIcon) {
  const { t } = useTranslation()
  const appAprMode = useAppStore((s) => s.aprMode)
  const setAprModeAct = useAppStore((s) => s.setAprModeAct)
  const [aprMode, setAprMode] = useState<'M' | 'D'>('M')
  const [isAprDialogOpen, setIsAprDialogOpen] = useState(false)
  const toggleAprMode = () => {
    setAprModeAct(aprMode === 'D' ? 'M' : 'D')
  }

  useEffect(() => {
    setAprMode(appAprMode)
  }, [appAprMode])

  const text = {
    D: {
      title: t('apr_dialog.mode_D_title'),
      description: t('apr_dialog.mode_D_desc_brief')
    },
    M: {
      title: t('apr_dialog.mode_M_title'),
      description: t('apr_dialog.mode_M_desc_brief')
    }
  }
  return (
    <>
      <Tooltip
        label={(handlers) => (
          <SimpleGrid gridTemplateColumns="auto auto" alignItems="center" rowGap={2}>
            <Text fontSize="sm">{aprMode === 'D' ? text.D.title : text.M.title}</Text>
            <Button variant="ghost" size="sm" justifySelf="end" width="fit-content" onClick={toggleAprMode}>
              <HStack color={colors.primary60}>
                <SwapHorizIcon color={colors.primary60} />
                <Text>{t('button.switch')}</Text>
              </HStack>
            </Button>
            <Box gridColumn="span 2">
              <Text fontSize="xs">
                {aprMode === 'D' ? text.D.description : text.M.description}
                <Text
                  as="span"
                  size="sm"
                  color={colors.textLink}
                  cursor="pointer"
                  ml={2}
                  onClick={() => {
                    setIsAprDialogOpen(true)
                    handlers?.close?.()
                  }}
                >
                  {t('common.learn_more')}
                </Text>
              </Text>
            </Box>
          </SimpleGrid>
        )}
      >
        <Box onClick={toggleAprMode}>
          {aprMode === 'D' ? <SquareDIcon color={colors.textSubtle} {...props} /> : <SquareMIcon color={colors.textSubtle} {...props} />}
        </Box>
      </Tooltip>
      <AprCalcDialog
        isOpen={isAprDialogOpen}
        onClose={() => {
          setIsAprDialogOpen(false)
        }}
      />
    </>
  )
}

export function AprCalcDialog(props: { isOpen: boolean; onClose(): void }) {
  const appAprMode = useAppStore((s) => s.aprMode)
  const setAprModeAct = useAppStore((s) => s.setAprModeAct)
  const [aprMode, setAprMode] = useState<'M' | 'D'>('M')
  const { t } = useTranslation()
  useEffect(() => {
    setAprMode(appAprMode)
  }, [appAprMode])

  const choices: {
    aprCalcMethod: 'M' | 'D'
    title: string
    description: string
  }[] = [
    {
      aprCalcMethod: 'D',
      title: t('apr_dialog.mode_D_title'),
      description: t('apr_dialog.mode_D_desc')
    },
    {
      aprCalcMethod: 'M',
      title: t('apr_dialog.mode_M_title'),
      description: t('apr_dialog.mode_M_desc')
    }
  ]
  return (
    <ResponsiveModal
      size="lg"
      title={t('apr_dialog.modal_title')}
      showFooter
      hasSecondaryButton={false}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <Box color={colors.textPrimary}>
        <Text>{t('apr_dialog.desc')}</Text>
        <Text color={colors.semanticWarning}>{t('apr_dialog.warning_note')}</Text>
      </Box>

      <VStack alignItems="stretch" spacing={2} my={4}>
        {/* choice */}
        {choices.map((choice) => {
          const isCurrent = choice.aprCalcMethod === aprMode
          return (
            <SimpleGrid
              key={choice.title}
              gridTemplateColumns="auto auto"
              rowGap={3}
              py={3}
              px={5}
              rounded="xl"
              bg={colors.backgroundDark}
              border={`1.5px ${isCurrent ? colors.secondary : 'transparent'} solid`}
              onClick={() => setAprModeAct(choice.aprCalcMethod)}
            >
              <Text color={colors.textPrimary} fontWeight={500}>
                {choice.title}
              </Text>
              <Box justifySelf="end">{isCurrent ? <CircleCheck width={16} height={16} fill={colors.secondary} /> : <Box />}</Box>
              <Text gridColumn="1 / -1" fontSize="sm" color={colors.textTertiary}>
                {choice.description}
              </Text>
            </SimpleGrid>
          )
        })}
      </VStack>
    </ResponsiveModal>
  )
}
