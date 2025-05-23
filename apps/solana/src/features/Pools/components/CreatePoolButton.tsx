import { Button } from '@pancakeswap/uikit'
import { HStack, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { Desktop, Mobile } from '@/components/MobileDesktop'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import PlusIcon from '@/icons/misc/PlusIcon'
import { colors } from '@/theme/cssVariables'

export type PoolType = 'standard' | 'concentrated'

export default function CreatePoolButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  return (
    <>
      <Mobile>
        <HStack
          width={10}
          height="100%"
          border={`1px solid ${colors.primary}`}
          bg={colors.primary}
          borderRadius="2xl"
          justifyContent="center"
          onClick={onOpen}
        >
          <PlusIcon strokeWidth={2} width="16px" height="16px" color={colors.backgroundAlt} />
        </HStack>
      </Mobile>
      <Desktop>
        <Button onClick={onOpen} variant="primary" px="18px" scale="md">
          {t('liquidity.create_pool')}
        </Button>
      </Desktop>
      <CreatePoolEntryDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
