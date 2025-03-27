import clsx from "clsx";
import { cloneElement, ElementType, isValidElement } from "react";
import EXTERNAL_LINK_PROPS from "../../util/externalLinkProps";
import StyledButton from "./StyledButton";
import { ButtonProps, scales, variants } from "./types";

const Button = <E extends ElementType = "button">({
  startIcon,
  endIcon,
  external = false,
  className,
  isLoading = false,
  disabled = false,
  variant = variants.PRIMARY,
  scale = scales.MD,
  children,
  ...rest
}: ButtonProps<E>): React.JSX.Element => {
  const internalProps = external ? EXTERNAL_LINK_PROPS : {};
  const isDisabled = isLoading || disabled;

  return (
    <StyledButton
      $isLoading={isLoading}
      className={clsx(className, {
        "pancake-button--loading": isLoading,
        "pancake-button--disabled": isDisabled && !isLoading,
      })}
      disabled={isDisabled}
      variant={variant}
      scale={scale}
      {...internalProps}
      {...rest}
    >
      <>
        {isValidElement(startIcon) &&
          cloneElement(startIcon, {
            // @ts-ignore
            mr: "0.5rem",
          })}
        {children}
        {isValidElement(endIcon) &&
          cloneElement(endIcon, {
            // @ts-ignore
            ml: "0.5rem",
          })}
      </>
    </StyledButton>
  );
};

export default Button;
