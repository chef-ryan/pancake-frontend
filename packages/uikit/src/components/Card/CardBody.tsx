import shouldForwardProp from "@styled-system/should-forward-prop";
import { styled } from "styled-components";
import { space, SpaceProps } from "styled-system";

export type CardBodyProps = SpaceProps;

const CardBody = styled.div
  .withConfig({
    shouldForwardProp,
  })
  .attrs<CardBodyProps>(({ p = ["16px", null, "24px"] }) => ({
    p,
  }))<CardBodyProps>`
  ${space}
`;

export default CardBody;
