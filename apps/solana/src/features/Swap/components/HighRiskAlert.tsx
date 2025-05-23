import { Text, Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, ModalFooter } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import CircleInfo from '@/icons/misc/CircleInfo'
import { colors } from '@/theme/cssVariables'

export default function HighRiskAlert({
  isOpen,
  percent,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  percent: number
}) {
  const { t } = useTranslation()

  return (
    <Modal size="md" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ bg: 'rgba(28, 36, 62, 1)' }}>
        <ModalHeader display="flex" flexDirection="column" alignItems="center" gap="6" px="12" fontSize="xl">
          <CircleInfo fill={colors.semanticError} width={24} height={24} />
          <Text variant="dialogTitle">{t('High Price Impact Warning')}</Text>
        </ModalHeader>
        <ModalBody textAlign="center">
          <Text variant="title" fontSize="md" mb="6" fontWeight="400">
            {t('Price impact for this swap is %percent%')}
            <br />
            {t('Confirming may result in a poor price for this swap!')}
          </Text>
        </ModalBody>
        <ModalFooter flexDirection="column" gap="2" px="0" py="0" mt="4">
          <Button onClick={onClose} w="100%">
            {t('Cancel')}
          </Button>
          <Button variant="ghost" onClick={onConfirm} w="100%">
            {t('Swap Anyway')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
