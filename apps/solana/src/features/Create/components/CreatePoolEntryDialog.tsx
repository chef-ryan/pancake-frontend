import { Button } from '@pancakeswap/uikit'
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'
import { Desktop, Mobile } from '@/components/MobileDesktop'

type CreateTarget = 'legacy-amm' | 'standard-amm' | 'concentrated-liquidity' | 'standard-farm' | 'clmm-lock' | 'cpmm-lock'

export function CreatePoolEntryDialog({
  isOpen,
  onClose,
  defaultType = 'concentrated-liquidity'
}: {
  isOpen: boolean
  onClose: () => void
  defaultType?: CreateTarget
}) {
  const router = useRouter()
  const [type, setType] = useState<CreateTarget>(defaultType)
  const onConfirm = useCallback(() => {
    let to = ''
    const query = { ...router.query }
    switch (type) {
      case 'legacy-amm':
        query.type = 'legacy-amm'
        to = '/liquidity/create-pool'
        break
      case 'standard-amm':
        to = '/liquidity/create-pool'
        break
      case 'concentrated-liquidity':
        to = '/clmm/create-pool'
        break
      case 'standard-farm':
        to = '/liquidity/create-farm'
        break
      case 'clmm-lock':
        to = '/clmm/lock'
        break
      case 'cpmm-lock':
        to = '/liquidity/lock'
        break
      default:
        break
    }
    router.push({
      pathname: to,
      query
    })
  }, [router, type])

  return (
    <>
      <Mobile>
        <CreatePoolEntryMobileDrawer isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryMobileDrawer>
      </Mobile>
      <Desktop>
        <CreatePoolEntryModal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryModal>
      </Desktop>
    </>
  )
}

type CreatePoolEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  onConfirm?: () => void
}

function CreatePoolEntryModal({ isOpen, onClose, onConfirm, children }: CreatePoolEntryModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent gap="24px">
        <ModalHeader py="24px" fontSize="16px" fontWeight={600}>
          {t('create_pool.modal_title')}
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          <VStack w="full">
            <Button width="100%" variant="primary" onClick={onConfirm}>
              {t('button.continue')}
            </Button>
            <Button width="100%" variant="text" onClick={onClose}>
              {t('button.cancel')}
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function CreatePoolEntryMobileDrawer({
  isOpen,
  onClose,
  onConfirm,
  children
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t('create_pool.modal_title')}</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter mt={4}>
          <VStack w="full">
            <Button variant="primary" onClick={onConfirm}>
              {t('button.continue')}
            </Button>
            <Button variant="text" onClick={onClose}>
              {t('button.cancel')}
            </Button>
          </VStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function CreatePoolEntryDialogBody({ type, onChange }: { type: CreateTarget; onChange: (val: CreateTarget) => void }) {
  const { t } = useTranslation()
  const isCreatePool = ['concentrated-liquidity', 'standard-amm', 'legacy-amm'].includes(type)
  return (
    <Flex direction="column" gap={4}>
      <CreateBlock
        title={t('create_pool.modal_section_header_pool')}
        description=""
        renderPoolType={
          isCreatePool
            ? () => (
                <>
                  <Stack flexDirection={['column']} mt={5} gap={5}>
                    <PoolTypeItem
                      isActive={type === 'concentrated-liquidity'}
                      content={
                        <Box>
                          <Text whiteSpace="nowrap" fontSize="md" fontWeight={600}>
                            {t('create_pool.modal_tab_concentrated')}
                          </Text>
                          <Text fontSize="xs" color={colors.textSubtle}>
                            {t('create_pool.modal_tab_concentrated_desc')}
                          </Text>
                        </Box>
                      }
                      onClickSelf={() => onChange('concentrated-liquidity')}
                    />
                    <PoolTypeItem
                      isDisabled
                      isActive={false}
                      content={
                        <Box>
                          <Flex alignItems="flex-end" gap="2px">
                            <Text whiteSpace="nowrap" fontSize="md" fontWeight={600}>
                              {t('create_pool.modal_tab_standard_amm')}
                            </Text>
                            <Text fontSize="sm" color={colors.textSubtle}>
                              Coming Soon
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color={colors.textSubtle}>
                            {t('create_pool.modal_tab_standard_amm_desc')}
                          </Text>
                        </Box>
                      }
                    />
                  </Stack>
                </>
              )
            : undefined
        }
        onClick={() => onChange('concentrated-liquidity')}
      />
    </Flex>
  )
}
function CreateBlock(props: {
  title: string
  description: React.ReactNode
  selected?: boolean
  onClick?: () => void
  detailLinkUrl?: string
  renderPoolType?: () => React.ReactNode
}) {
  return (
    <Box
      backgroundColor={colors.inputBg}
      p={4}
      borderRadius={8}
      position="relative"
      cursor="pointer"
      borderWidth="1.5px"
      borderColor={props.selected ? colors.secondary : 'transparent'}
      onClick={props.onClick}
    >
      <Flex justify="space-between">
        <Text fontSize="14px" fontWeight="600">
          {props.title}
        </Text>
        {props.selected && <CircleCheck width={16} height={16} fill={colors.secondary} />}
      </Flex>

      <Box color={props.selected ? colors.textSecondary : colors.textTertiary} fontSize="sm">
        {props.description}
      </Box>

      {props.renderPoolType && <Box mt={2}>{props.renderPoolType()}</Box>}
    </Box>
  )
}

function PoolTypeItem({
  content,
  isActive,
  onClickSelf,
  isSuggested,
  isDisabled
}: {
  content: React.ReactNode
  isActive?: boolean
  onClickSelf?: () => void
  isSuggested?: boolean
  isDisabled?: boolean
}) {
  const domRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const el = domRef.current
    const handleClick = (ev: MouseEvent) => {
      ev.stopPropagation()
      if (!isDisabled) {
        onClickSelf?.()
      }
    }

    el?.addEventListener('click', handleClick)
    return () => {
      el?.removeEventListener('click', handleClick)
    }
  }, [isDisabled, onClickSelf])

  return (
    <HStack
      ref={domRef}
      flexGrow={1}
      color={isActive ? colors.textPrimary : colors.textSubtle}
      bg={isActive ? colors.backgroundAlt : 'transparent'}
      px={4}
      py={2}
      rounded="md"
      position="relative"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
    >
      {isSuggested && (
        <Box position="absolute" top={0} right={2} transform="auto" translateY="-50%">
          <Badge variant="crooked">{t('badge.suggested')}</Badge>
        </Box>
      )}
      {content}
    </HStack>
  )
}
