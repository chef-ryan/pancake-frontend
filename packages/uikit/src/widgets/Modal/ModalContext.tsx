import { DismissableLayer } from "@radix-ui/react-dismissable-layer";
import anime from "animejs";
import React, { createContext, useCallback, useMemo, useRef, useState, useEffect } from "react";
import get from "lodash/get";
import { isMobile } from "react-device-detect";
import { createPortal } from "react-dom";
import { styled } from "styled-components";
import { Overlay } from "../../components/Overlay";
import { useIsomorphicEffect } from "../../hooks/useIsomorphicEffect";
import {
  animationHandler,
  animationMap,
  animationVariants,
  appearAnimation,
  disappearAnimation,
} from "../../util/animationToolkit";
import getPortalRoot from "../../util/getPortalRoot";
import { mountAnimation, unmountAnimation } from "./BottomDrawer/styles";
import { ModalContainer } from "./styles";
import { Handler } from "./types";


interface ModalsContext {
  isOpen: boolean;
  nodeId: string;
  modalNode: React.ReactNode;
  setModalNode: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  onPresent: (node: React.ReactNode, newNodeId: string, closeOverlayClick: boolean) => void;
  onDismiss: Handler;
}

export const StyledModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndices.modal - 1};
  will-change: opacity;
  opacity: 0;
  &.appear {
    animation: ${appearAnimation} 0.3s ease-in-out forwards;
    ${ModalContainer} {
      animation: ${mountAnimation} 0.3s ease-in-out forwards;
      ${({ theme }) => theme.mediaQueries.md} {
        animation: none;
      }
    }
  }
  &.disappear {
    animation: ${disappearAnimation} 0.3s ease-in-out forwards;
    ${ModalContainer} {
      animation: ${unmountAnimation} 0.3s ease-in-out forwards;
      ${({ theme }) => theme.mediaQueries.md} {
        animation: none;
      }
    }
  }
`;

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

export const Context = createContext<ModalsContext>({
  isOpen: false,
  nodeId: "",
  modalNode: null,
  setModalNode: () => null,
  onPresent: () => null,
  onDismiss: () => null,
});

const ModalProvider: React.FC<
  React.PropsWithChildren<{
    portalProvider?: React.FC<React.PropsWithChildren>;
  }>
> = ({ children, portalProvider: NestProvider = React.Fragment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalNode, setModalNode] = useState<React.ReactNode>();
  const [nodeId, setNodeId] = useState("");
  const [closeOnOverlayClick, setCloseOnOverlayClick] = useState(true);
  const animationRef = useRef<HTMLDivElement>(null);

  useIsomorphicEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  const handlePresent = useCallback((node: React.ReactNode, newNodeId: string, closeOverlayClick: boolean) => {
    setModalNode(node);
    setIsOpen(true);
    setNodeId(newNodeId);
    setCloseOnOverlayClick(closeOverlayClick);
  }, []);

  const handleDismiss = useCallback(() => {
    setModalNode(undefined);
    setIsOpen(false);
    setNodeId("");
    setCloseOnOverlayClick(true);
  }, []);

  const handleOverlayDismiss = useCallback(() => {
    if (closeOnOverlayClick) {
      const customOnDismiss = get(modalNode, "props.customOnDismiss") as any;
      customOnDismiss?.();
      handleDismiss();
    }
  }, [closeOnOverlayClick, handleDismiss, modalNode]);

  const providerValue = useMemo(() => {
    return { isOpen, nodeId, modalNode, setModalNode, onPresent: handlePresent, onDismiss: handleDismiss };
  }, [isOpen, nodeId, modalNode, setModalNode, handlePresent, handleDismiss]);

  const handleAnimationStart = useCallback(() => animationHandler(animationRef.current), []);

  const portal = useMemo(() => getPortalRoot(), []);

  return (
    <Context.Provider value={providerValue}>
      <NestProvider>
        {portal &&
          createPortal(
            isOpen && (
              <DismissableLayer
                role="dialog"
                disableOutsidePointerEvents={false}
                onEscapeKeyDown={handleOverlayDismiss}
              >
                <AnimePresence isVisible={isOpen}>
                  <StyledModalWrapper
                    ref={animationRef}
                    onAnimationStart={handleAnimationStart}
                    {...animationMap}
                    variants={animationVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Overlay onClick={handleOverlayDismiss} />
                    {React.isValidElement(modalNode) &&
                      React.cloneElement(modalNode, {
                        // @ts-ignore
                        onDismiss: handleDismiss,
                      })}
                  </StyledModalWrapper>
                </AnimePresence>
              </DismissableLayer>
            ),
            portal
          )}
        {children}
      </NestProvider>
    </Context.Provider>
  );
};

export default ModalProvider;
