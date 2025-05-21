import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { styled } from "styled-components";
import { flexbox } from "styled-system";
import Box from "./Box";
import { FlexProps } from "./types";

const Flex = styled(Box)<FlexProps>`
  display: flex;
  ${flexbox}
`;

const StyledMotionFlex = styled.div<FlexProps>`
  display: flex;
  ${flexbox}
`;

export const MotionFlex = React.forwardRef<HTMLDivElement, FlexProps & { animation?: anime.AnimeParams }>(
  ({ animation, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      if (animation && combinedRef.current) {
        anime({ targets: combinedRef.current, ...animation });
      }
    }, [animation]);

    return (
      <StyledMotionFlex ref={combinedRef} {...props}>
        {children}
      </StyledMotionFlex>
    );
  }
);

export default Flex;
