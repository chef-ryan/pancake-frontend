import { DefaultTheme, StyleSheetManager, ThemeProvider } from "styled-components";
import rtlPlugin from "stylis-plugin-rtl";
import { MatchBreakpointsProvider } from "./contexts/MatchBreakpoints/Provider";
import { ToastsProvider } from "./contexts/ToastsContext/Provider";

export const UIKitProvider: React.FC<React.PropsWithChildren<{ theme: DefaultTheme; children: React.ReactNode }>> = ({
  theme,
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <StyleSheetManager stylisPlugins={[rtlPlugin]}>
        <MatchBreakpointsProvider>
          <ToastsProvider>{children}</ToastsProvider>
        </MatchBreakpointsProvider>
      </StyleSheetManager>
    </ThemeProvider>
  );
};
