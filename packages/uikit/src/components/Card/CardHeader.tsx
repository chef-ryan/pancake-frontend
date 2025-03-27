import shouldForwardProp from "@styled-system/should-forward-prop";
import { styled } from "styled-components";
import { space, SpaceProps } from "styled-system";
import { CardTheme } from "./types";

export interface CardHeaderProps extends SpaceProps {
  variant?: keyof CardTheme["cardHeaderBackground"];
}

const CardHeader = styled.div
  .withConfig({
    shouldForwardProp,
  })
  .attrs<CardHeaderProps>(({ p = "24px", variant = "default" }) => ({
    p,
    variant,
  }))<CardHeaderProps>`
  background: ${({ theme, variant }) =>
    theme.card.cardHeaderBackground[variant as keyof typeof theme.card.cardHeaderBackground]};
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
  ${space}
`;

export default CardHeader;
