import React from "react";
import { scales, TagProps } from "./types";
import { StyledTag } from "./StyledTag";

const Tag: React.FC<React.PropsWithChildren<TagProps>> = ({
  startIcon,
  endIcon,
  children,
  variant = "primary",
  scale = scales.MD,
  outline = false,
  ...props
}) => (
  <StyledTag {...props} variant={variant} scale={scale} outline={outline}>
    {React.isValidElement(startIcon) &&
      React.cloneElement(startIcon, {
        // @ts-ignore
        mr: "0.5em",
      })}
    {children}
    {React.isValidElement(endIcon) &&
      React.cloneElement(endIcon, {
        // @ts-ignore
        ml: "0.5em",
      })}
  </StyledTag>
);

export default Tag;
