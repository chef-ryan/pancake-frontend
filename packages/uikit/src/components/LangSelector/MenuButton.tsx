import { styled } from "styled-components";
import Button from "../Button/Button";

const MenuButton = styled(Button).attrs(({ variant = "text", size = "sm" }) => ({
  variant,
  size,
}))`
  color: ${({ theme }) => theme.colors.text};
  padding: 0 8px;
  border-radius: 8px;
`;

export default MenuButton;
