import { Currency } from "@pancakeswap/sdk";
import { Text, Box, Flex, ArrowForwardIcon } from "@pancakeswap/uikit";
import { CurrencyLogo } from "../components/CurrencyLogo";

type CurrencyInfoProps = {
  amount: string;
  symbol?: string;
  currency?: Currency;
  invert?: boolean;
  size?: "sm" | "md";
};

export type TokenTransferInfoProps = {
  symbolA?: string;
  symbolB?: string;
  amountA: string;
  amountB: string;
  currencyA?: Currency;
  currencyB?: Currency;
} & Pick<CurrencyInfoProps, "invert" | "size">;

const sizeMap = {
  sm: {
    logoSize: "20px",
    fontSize: "14px",
  },
  md: {
    logoSize: "24px",
    fontSize: "16px",
  },
};

const CurrencyInfo = ({ amount, symbol, currency, invert, size = "sm" }: CurrencyInfoProps) => {
  return invert ? (
    <>
      <CurrencyLogo mr="4px" size={sizeMap[size].logoSize} currency={currency} />
      <Text fontSize={sizeMap[size].fontSize}>{`${amount} ${symbol}`}</Text>
    </>
  ) : (
    <>
      <Text mr="4px" fontSize={sizeMap[size].fontSize}>{`${amount} ${symbol}`}</Text>
      <CurrencyLogo size={sizeMap[size].logoSize} currency={currency} />,
    </>
  );
};

const TokenTransferInfo: React.FC<TokenTransferInfoProps> = ({
  symbolA,
  symbolB,
  amountA,
  amountB,
  currencyA,
  currencyB,
  invert,
  size,
}) => {
  return (
    <Flex>
      <Flex>
        <CurrencyInfo size={size} currency={currencyA} symbol={symbolA} amount={amountA} invert={invert} />
      </Flex>
      <Box m="0 8px">
        <ArrowForwardIcon color="textSubtle" />
      </Box>
      <Flex>
        <CurrencyInfo size={size} currency={currencyB} symbol={symbolB} amount={amountB} invert={invert} />
      </Flex>
    </Flex>
  );
};

export default TokenTransferInfo;
