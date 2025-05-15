import { Button, Box, VStack, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalV2, MotionModal, useMatchBreakpoints, useModalV2, Text, Checkbox } from '@pancakeswap/uikit'
import { colors } from '@/theme/cssVariables'
import { setStorageItem, getStorageItem } from '@/utils/localStorage'

const DISCLAIMER_KEY = '_r_have_agreed_disclaimer_'

function DisclaimerModal() {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, onDismiss } = useModalV2()
  const [userHaveAgree, setUserHaveAgree] = useState(false)
  const { isMobile } = useMatchBreakpoints()

  const confirmDisclaimer = () => {
    setStorageItem(DISCLAIMER_KEY, 1)
    onDismiss()
  }

  useEffect(() => {
    const haveAgreedDisclaimer = getStorageItem(DISCLAIMER_KEY)
    if (!haveAgreedDisclaimer || haveAgreedDisclaimer !== '1') {
      setIsOpen(true)
    }
  }, [setIsOpen])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('disclaimer.title')}
        onDismiss={onDismiss}
        minWidth={[null, null, '370px']}
        maxWidth={['100%', '100%', '370px']}
        minHeight={isMobile ? '500px' : undefined}
        headerPadding="2px 14px 0 24px"
      >
        <VStack spacing={6}>
          <Box bgColor={colors.background} p={6} m="-6" mb={0}>
            <Box
              bgColor={colors.backgroundAlt}
              borderColor={colors.cardBorder01}
              borderWidth="1px"
              borderStyle="solid"
              rounded="3xl"
              flex="1"
              p="4"
              overflowY="auto"
              maxH={{ base: '20rem', md: '28rem' }}
            >
              <Text mb="3" fontSize="14px">
                {t('disclaimer.text1')}
              </Text>
            </Box>
          </Box>
          <label htmlFor="disclaimer-checkbox" style={{ display: 'block', cursor: 'pointer', width: '100%' }}>
            <Flex width="full" justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary}>
                {t('disclaimer.agree_terms')}
              </Text>
              <Checkbox scale="sm" id="disclaimer-checkbox" checked={userHaveAgree} onChange={(e) => setUserHaveAgree(e.target.checked)} />
            </Flex>
          </label>

          <Flex width="full" justifyContent="center">
            <Button width="full" onClick={confirmDisclaimer} isDisabled={!userHaveAgree}>
              {t('disclaimer.enter')}
            </Button>
          </Flex>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}

export default DisclaimerModal
