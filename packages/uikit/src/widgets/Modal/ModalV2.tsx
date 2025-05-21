import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import anime from "animejs";
import React, { createContext, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { createPortal } from "react-dom";
import { BoxProps } from "../../components/Box";
import { Overlay } from "../../components/Overlay";
import { animationHandler, animationMap, animationVariants } from "../../util/animationToolkit";
import getPortalRoot from "../../util/getPortalRoot";
import { StyledModalWrapper } from "./ModalContext";

const AnimePresence: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  onExitComplete?: () => void;
}> = ({ children, isVisible, onExitComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (isVisible) {
        anime({
          targets: containerRef.current,
          opacity: [0, 1],
          duration: 300,
          easing: "easeInOutQuad",
        });
      } else if (containerRef.current.style.opacity !== "0") {
        anime({
          targets: containerRef.current,
          opacity: [1, 0],
          duration: 300,
          easing: "easeInOutQuad",
          complete: onExitComplete,
        });
      }
    }
  }, [isVisible, onExitComplete]);

  if (!isVisible && containerRef.current?.style.opacity === "0") {
    return null;
  }

  return (
    <div ref={containerRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
};


export interface ModalV2Props {
  isOpen?: boolean;
  onDismiss?: () => void;
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
}

export const ModalV2Context = createContext<{
  onDismiss?: () => void;
}>({});

export type UseModalV2Props = ReturnType<typeof useModalV2>;
export function useModalV2() {
  const [isOpen, setIsOpen] = useState(false);

  const onDismiss = useCallback(() => setIsOpen(false), []);
  const onOpen = useCallback(() => setIsOpen(true), []);

  return useMemo(
    () => ({
      onDismiss,
      onOpen,
      isOpen,
      setIsOpen,
    }),
    [onDismiss, onOpen, isOpen]
  );
}

export function ModalV2({
  isOpen,
  onDismiss,
  closeOnOverlayClick,
  children,
  disableOutsidePointerEvents = false,
  ...props
}: ModalV2Props & BoxProps & { disableOutsidePointerEvents?: boolean }) {
  const animationRef = useRef<HTMLDivElement>(null);

  const handleOverlayDismiss = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (closeOnOverlayClick) {
      onDismiss?.();
    }
  };
  const portal = getPortalRoot();

  const providerValue = useMemo(() => ({ onDismiss }), [onDismiss]);

  if (portal) {
    return createPortal(
      <ModalV2Context.Provider value={providerValue}>
        {isOpen && (
          <DismissableLayer
            role="dialog"
            disableOutsidePointerEvents={disableOutsidePointerEvents}
            onEscapeKeyDown={handleOverlayDismiss}
          >
            <AnimePresence isVisible={isOpen}>
              <StyledModalWrapper
                ref={animationRef}
                // @ts-ignore
                onAnimationStart={() => animationHandler(animationRef.current)}
                {...animationMap}
                variants={animationVariants}
                transition={{ duration: 0.3 }}
                {...props}
              >
                <Overlay onClick={handleOverlayDismiss} />
                {children}
              </StyledModalWrapper>
            </AnimePresence>
          </DismissableLayer>
        )}
      </ModalV2Context.Provider>,
      portal
    );
  }

  return null;
}
