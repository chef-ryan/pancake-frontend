import { Heading, ModalTitle, ModalV2, MotionModal, useMatchBreakpoints } from '@pancakeswap/uikit'
import { appModalAtom } from 'atoms/modals/appModalAtom'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { GrabberBar } from './GrabberBar'

export const AppModal = () => {
  const { isMobile, isMd } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isMd

  const [modalData, setModalData] = useAtom(appModalAtom)

  const { isOpen, title, content, closeable } = modalData

  const handleDismiss = useCallback(() => {
    if (!closeable) return
    setModalData((prev) => ({ ...prev, isOpen: false }))
  }, [closeable, setModalData])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={handleDismiss} closeOnOverlayClick={closeable}>
      <MotionModal
        title={title}
        onDismiss={handleDismiss}
        headerBorderColor="transparent"
        minWidth="400px"
        overrideHeaderContent={isSmallScreen ? <GrabberBar mt="2px" /> : null}
        hideCloseButton={!closeable}
      >
        {isSmallScreen && (
          <ModalTitle mb="24px">
            <Heading scale="lg" width="100%">
              {title}
            </Heading>
          </ModalTitle>
        )}
        {content}
      </MotionModal>
    </ModalV2>
  )
}
