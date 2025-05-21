import shouldForwardProp from "@styled-system/should-forward-prop";
import React, { useRef, useEffect } from "react";
import anime from "animejs";
import { keyframes, styled } from "styled-components";
import { borderRadius, layout, space } from "styled-system";
import { disappearAnimation } from "../../util/animationToolkit";
import { animation as ANIMATION, SkeletonProps, SkeletonV2Props, variant as VARIANT } from "./types";

export const softAppearAnimation = keyframes`
  from { opacity:0.2 }
  to { opacity:1 }
`;

const waves = keyframes`
   from {
        left: -150px;
    }
    to   {
        left: 100%;
    }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const AnimationWrapper = styled.div`
  position: relative;
  will-change: opacity;
  opacity: 0;
  &.appear {
    animation: ${softAppearAnimation} 0.3s ease-in-out forwards;
  }
  &.disappear {
    animation: ${disappearAnimation} 0.3s ease-in-out forwards;
  }
`;

const SkeletonWrapper = styled.div.withConfig({ shouldForwardProp })<SkeletonProps>`
  position: relative;
  ${layout}
  ${space} /* overflow: hidden; */
`;

const Root = styled.div.withConfig({ shouldForwardProp })<SkeletonProps>`
  min-height: 20px;
  display: block;
  background-color: ${({ theme, isDark }) => (isDark ? theme.colors.inputSecondary : theme.colors.backgroundDisabled)};
  border-radius: ${({ variant, theme }) =>
    variant === VARIANT.CIRCLE
      ? theme.radii.circle
      : variant === VARIANT.ROUND
      ? theme.radii.default
      : theme.radii.small};
  ${layout}
  ${space}
  ${borderRadius}
`;

const Pulse = styled(Root)`
  animation: ${pulse} 2s infinite ease-out;
  transform: translate3d(0, 0, 0);
`;

const Waves = styled(Root)`
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  &:before {
    content: "";
    position: absolute;
    background-image: linear-gradient(90deg, transparent, rgba(243, 243, 243, 0.5), transparent);
    top: 0;
    left: -150px;
    height: 100%;
    width: 150px;
    animation: ${waves} 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`;

const Skeleton: React.FC<React.PropsWithChildren<SkeletonProps>> = ({
  variant = VARIANT.RECT,
  animation = ANIMATION.PULSE,
  ...props
}) => {
  if (animation === ANIMATION.WAVES) {
    return <Waves variant={variant} {...props} />;
  }

  return <Pulse variant={variant} {...props} />;
};

export const SkeletonV2: React.FC<React.PropsWithChildren<SkeletonV2Props>> = ({
  variant = VARIANT.RECT,
  animation = ANIMATION.PULSE,
  isDataReady = false,
  children,
  wrapperProps,
  skeletonTop = "0",
  skeletonLeft = "0",
  width,
  height,
  mr,
  ml,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDataReady && contentRef.current) {
      anime({ targets: contentRef.current, opacity: [0, 1], duration: 300, easing: "easeInOutQuad" });
    } else if (!isDataReady && skeletonRef.current) {
      anime({ targets: skeletonRef.current, opacity: [0, 1], duration: 300, easing: "easeInOutQuad" });
    }
  }, [isDataReady]);

  return (
    <SkeletonWrapper
      width={isDataReady ? "auto" : width}
      height={isDataReady ? "auto" : height}
      mr={mr}
      ml={ml}
      id="Skeleton-SkeletonWrapper"
      {...wrapperProps}
    >
      {isDataReady ? (
        <div id="Skeleton-AnimationWrapper-isDataReady-true" ref={contentRef} style={{ opacity: 0 }}>
          {children}
        </div>
      ) : (
        <div
          id="Skeleton-AnimationWrapper-isDataReady-false"
          ref={skeletonRef}
          style={{ position: "absolute", top: skeletonTop, left: skeletonLeft, opacity: 0 }}
        >
          {animation === ANIMATION.WAVES ? (
            <Waves variant={variant} {...props} width={width} height={height} id="Skeleton-Waves-Animation" />
          ) : (
            <Pulse variant={variant} {...props} width={width} height={height} id="Skeleton-Pulse-Animation" />
          )}
        </div>
      )}
    </SkeletonWrapper>
  );
};

export default Skeleton;
