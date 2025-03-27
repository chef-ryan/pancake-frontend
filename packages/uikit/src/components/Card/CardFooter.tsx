import shouldForwardProp from "@styled-system/should-forward-prop";
import { styled } from "styled-components";
import { space, SpaceProps } from "styled-system";

export type CardFooterProps = SpaceProps;

const CardFooter = styled.div
  .withConfig({
    shouldForwardProp,
  })
  .attrs<CardFooterProps>(({ p = "24px" }) => ({
    p,
  }))<CardFooterProps>`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  ${space}
`;

export default CardFooter;
