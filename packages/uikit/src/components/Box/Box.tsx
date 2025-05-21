import React, { useEffect, useRef } from "react";
import anime from "animejs";
import shouldForwardProp from "@styled-system/should-forward-prop";
import { styled } from "styled-components";
import { background, border, layout, position, space, color } from "styled-system";
import { BoxProps } from "./types";

const StyledMotionBox = styled.div.withConfig({})<BoxProps>`
  ${background}
  ${border}
  ${layout}
  ${position}
  ${space}
`;

export const MotionBox = React.forwardRef<HTMLDivElement, BoxProps & { animation?: anime.AnimeParams }>(
  ({ animation, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    useEffect(() => {
      if (animation && combinedRef.current) {
        anime({
          targets: combinedRef.current,
          ...animation,
        });
      }
    }, [animation, combinedRef]);

    return (
      <StyledMotionBox ref={combinedRef} {...props}>
        {children}
      </StyledMotionBox>
    );
  }
);

const Box = styled.div.withConfig({
  shouldForwardProp,
})<BoxProps>`
  ${background}
  ${border}
  ${layout}
  ${position}
  ${space}
  ${color}
`;

export default Box;
