import { ArrowUpIcon, AutoColumn, Box, ColumnCenter, Spinner, Text } from "@pancakeswap/uikit";
import { ReactNode } from "react";
import TokenTransferInfo, { TokenTransferInfoProps } from "./TokenTransferInfo";

type SwapPendingModalContentProps = {
  title: string;
  showIcon?: boolean;
  children?: ReactNode;
  spinnerSize?: number;
} & Omit<TokenTransferInfoProps, "symbolA" | "symbolB">;

export const SwapPendingModalContentV1: React.FC<SwapPendingModalContentProps> = ({
  title,
  showIcon,
  currencyA,
  currencyB,
  amountA,
  amountB,
  children,
  invert = false,
  size,
  spinnerSize,
}) => {
  const symbolA = currencyA?.symbol;
  const symbolB = currencyB?.symbol;

  return (
    <Box width="100%">
      {showIcon ? (
        <Box margin="auto auto 36px auto" width="fit-content">
          <ArrowUpIcon color="success" width={80} height={80} />
        </Box>
      ) : (
        <Box mb="16px">
          <ColumnCenter>
            <Spinner size={spinnerSize} />
          </ColumnCenter>
        </Box>
      )}
      <AutoColumn gap="12px" justify="center">
        <Text bold textAlign="center">
          {title}
        </Text>
        <TokenTransferInfo
          size={size}
          symbolA={symbolA}
          symbolB={symbolB}
          amountA={amountA}
          amountB={amountB}
          currencyA={currencyA}
          currencyB={currencyB}
          invert={invert}
        />
        {children}
      </AutoColumn>
    </Box>
  );
};
