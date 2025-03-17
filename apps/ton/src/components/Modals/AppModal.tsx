import { Heading, ModalTitle, ModalV2, MotionModal, useMatchBreakpoints } from '@pancakeswap/uikit'
import { appModalAtom } from 'atoms/modals/appModalAtom'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { GrabberBar } from '../Misc/GrabberBar'

export const AppModal = () => {
  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd

  const [modalData, setModalData] = useAtom(appModalAtom)

  const { isOpen, title, content, closeable, onClose, ...props } = modalData

  const handleDismiss = useCallback(() => {
    if (!closeable) return
    setModalData((prev) => ({ ...prev, isOpen: false }))
    onClose?.()
  }, [closeable, onClose, setModalData])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={handleDismiss} closeOnOverlayClick={closeable}>
      <MotionModal
        title={title}
        onDismiss={handleDismiss}
        headerBorderColor="transparent"
        minWidth={[null, null, null, '360px']}
        minHeight="240px"
        overrideHeaderContent={isSmallScreen ? <GrabberBar mt="2px" /> : title ? null : <></>}
        hideCloseButton={!closeable}
        bodyPadding="16px 24px 32px"
        {...props}
      >
        {title && isSmallScreen && (
          <ModalTitle mb="32px">
            <Heading scale="md" width="100%">
              {title}
            </Heading>
          </ModalTitle>
        )}
        {content}
      </MotionModal>
    </ModalV2>
  )
}
