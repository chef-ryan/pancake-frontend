import { Currency } from "@pancakeswap/sdk";
import { ArrowForwardIcon, AutoColumn, Row, RowFixed, Text } from "@pancakeswap/uikit";
import { CurrencyLogo } from "./CurrencyLogo";

interface DualCurrencyDisplayProps {
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  inputAmount?: string;
  outputAmount?: string;
  inputTextColor?: string;
  outputTextColor?: string;
  inputChainName?: string;
  outputChainName?: string;
  overrideIcon?: React.ReactNode;
}
export const DualCurrencyDisplay = ({
  inputAmount,
  outputAmount,
  inputTextColor,
  outputTextColor,
  inputCurrency,
  outputCurrency,
  inputChainName,
  outputChainName,
  overrideIcon,
}: DualCurrencyDisplayProps) => {
  return (
    <Row justifyContent="space-around">
      <AutoColumn justify="center">
        <CurrencyLogo currency={inputCurrency} size="40px" showChainLogo />

        <Text color={inputTextColor} bold ellipsis>
          {inputAmount}&nbsp;
          {inputCurrency?.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" bold>
          {inputChainName}
        </Text>
      </AutoColumn>
      <RowFixed my="auto">{overrideIcon || <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />}</RowFixed>
      <AutoColumn justify="center">
        <CurrencyLogo currency={outputCurrency} size="40px" showChainLogo />

        <Text bold ellipsis color={outputTextColor}>
          {outputAmount}&nbsp;{outputCurrency?.symbol}
        </Text>

        <Text color="textSubtle" fontSize="12px" bold>
          {outputChainName}
        </Text>
      </AutoColumn>
    </Row>
  );
};
