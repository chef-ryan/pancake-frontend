import shouldForwardProp from "@styled-system/should-forward-prop";
import { DefaultTheme, styled } from "styled-components";
import { layout, space, typography } from "styled-system";
import getThemeValue from "../../util/getThemeValue";
import { TextProps } from "./types";

interface ThemedProps extends TextProps {
  theme: DefaultTheme;
}

const getColor = ({ color, theme }: ThemedProps) => {
  return getThemeValue(theme, `colors.${color}`, color);
};

const Text = styled.div
  .attrs<TextProps>((props) => {
    const title =
      typeof props.title !== "undefined"
        ? props.title
        : props.ellipsis && typeof props.children === "string"
        ? props.children
        : undefined;
    return {
      ...props,
      title,
      color: props.color ?? "text",
      small: props.small ?? false,
      fontSize: props.fontSize ?? "16px",
      ellipsis: props.ellipsis ?? false,
    };
  })
  .withConfig({
    shouldForwardProp,
  })<TextProps>`
  color: ${getColor};
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  line-height: 1.5;
  ${({ textTransform }) => textTransform && `text-transform: ${textTransform};`}
  ${({ strikeThrough }) => strikeThrough && `text-decoration: line-through;`}
  ${({ ellipsis }) =>
    ellipsis &&
    `white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;`}

  ${space}
  ${typography}
  ${layout}

  ${({ small }) => small && `font-size: 14px;`}
`;

export default Text;
