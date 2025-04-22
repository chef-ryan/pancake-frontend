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
          width={12}
          height="100%"
          border="1px solid #22D1F8"
          borderRadius="md"
          justifyContent="center"
          color={colors.secondary}
          onClick={onOpen}
        >
          <PlusIcon width="16px" height="16px" />
        </HStack>
      </Mobile>
      <Desktop>
        <Button onClick={onOpen} variant="primary" p="18px" scale="sm">
          {t('liquidity.create_pool')}
        </Button>
      </Desktop>
      <CreatePoolEntryDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
