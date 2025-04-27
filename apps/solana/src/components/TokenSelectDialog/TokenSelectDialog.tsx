import { useState, useCallback, forwardRef } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { useTranslation } from 'react-i18next'
import { Box, Grid, GridItem, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { colors } from '@/theme/cssVariables'
import TokenListSetting from './components/TokenListSetting'
import TokenList, { TokenListHandles } from './components/TokenList'
import TokenListUnknown from './components/TokenListUnknown'

export interface TokenSelectDialogProps {
  onSelectValue: (token: TokenInfo) => void
  isOpen: boolean
  filterFn?: (token: TokenInfo) => boolean
  onClose: () => void
}

/* eslint-disable @typescript-eslint/no-shadow */
enum PageType {
  TokenList,
  TokenListSetting,
  TokenListUnknown
}

export default forwardRef<TokenListHandles, TokenSelectDialogProps>(function TokenSelectDialog(
  { onSelectValue, isOpen, filterFn, onClose },
  ref
) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.TokenList)

  const TokenListContent = useCallback(
    () => (
      <>
        <ModalHeader>{t('common.select_a_token')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" overflowX="hidden">
          <Box height={['auto', '60vh']} flex={['1', 'unset']}>
            <TokenList
              ref={ref}
              onOpenTokenList={() => setCurrentPage(PageType.TokenListSetting)}
              onChooseToken={(token) => {
                onSelectValue(token)
              }}
              isDialogOpen={isOpen}
              filterFn={filterFn}
            />
          </Box>
        </ModalBody>
      </>
    ),
    [filterFn, isOpen, onSelectValue, ref, t]
  )

  const TokenListSettingContent = useCallback(
    () => (
      <>
        <ModalHeader>
          <Grid templateColumns="1fr 3fr 1fr" mb="24px">
            <GridItem alignSelf="center" cursor="pointer" textAlign="left" onClick={() => setCurrentPage(PageType.TokenList)}>
              <ChevronLeftIcon width="24px" fontWeight={500} />
            </GridItem>
            <GridItem textAlign="center">
              <Heading fontSize="xl" fontWeight={500} color={colors.textPrimary}>
                {t('common.token_list_settings')}
              </Heading>
            </GridItem>
            <GridItem textAlign="right" />
          </Grid>
        </ModalHeader>
        <ModalBody display="flex" flexDirection="column" overflowX="hidden">
          <Box height={['auto', '60vh']} flex={['1', 'unset']}>
            <TokenListSetting onClick={() => setCurrentPage(PageType.TokenListUnknown)} />
          </Box>
        </ModalBody>
      </>
    ),
    [t]
  )

  const TokenListUnknownContent = useCallback(
    () => (
      <>
        <ModalHeader>
          <Grid templateColumns="1fr 3fr 1fr" mb="24px">
            <GridItem alignSelf="center" cursor="pointer" textAlign="left" onClick={() => setCurrentPage(PageType.TokenListSetting)}>
              <ChevronLeftIcon width="24px" fontWeight={500} />
            </GridItem>
            <GridItem textAlign="center">
              <Heading fontSize="xl" fontWeight={500} color={colors.textPrimary}>
                {t('swap.user_added_token_list')}
              </Heading>
            </GridItem>
            <GridItem textAlign="right" />
          </Grid>
        </ModalHeader>
        <ModalBody display="flex" flexDirection="column" overflowX="hidden">
          <Box height={['auto', '60vh']} flex={['1', 'unset']}>
            <TokenListUnknown />
          </Box>
        </ModalBody>
      </>
    ),
    [t]
  )

  const renderModalContent = useCallback(() => {
    switch (currentPage) {
      case PageType.TokenList:
        return <TokenListContent />
      case PageType.TokenListSetting:
        return <TokenListSettingContent />
      case PageType.TokenListUnknown:
        return <TokenListUnknownContent />
      default:
        return null
    }
  }, [currentPage, TokenListContent, TokenListSettingContent, TokenListUnknownContent])

  const handleClose = useEvent(() => {
    onClose()
  })
  const onCloseComplete = useEvent(() => {
    setCurrentPage(PageType.TokenList)
  })
  return (
    <Modal variant="mobileFullPage" isOpen={isOpen} onClose={handleClose} onCloseComplete={onCloseComplete}>
      <ModalOverlay />
      <ModalContent>{renderModalContent()}</ModalContent>
    </Modal>
  )
})
