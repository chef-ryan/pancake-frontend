import { ArrowUpIcon, AutoColumn, Box, CheckmarkCircleIcon, ColumnCenter, Text } from "@pancakeswap/uikit";
import { ReactNode, useRef } from "react";
import { ConfirmModalState, StepTitleAnimationContainer } from "./ApproveModalContent";
import { FadePresence, PendingSwapConfirmationIcon } from "./Logos";
import TokenTransferInfo, { TokenTransferInfoProps } from "./TokenTransferInfo";
import { AnimationType } from "./styles";
import { useUnmountingAnimation } from "./useUnmountingAnimation";

type SwapPendingModalContentProps = {
  title: string;
  currentStep: ConfirmModalState;
  children?: ReactNode;
  spinnerSize?: number;
} & Omit<TokenTransferInfoProps, "symbolA" | "symbolB">;

export const SwapPendingModalContent: React.FC<SwapPendingModalContentProps> = ({
  title,
  currencyA,
  currencyB,
  amountA,
  amountB,
  currentStep,
  children,
  spinnerSize,
  invert = false,
  size,
}) => {
  const symbolA = currencyA?.symbol;
  const symbolB = currencyB?.symbol;

  const currentStepContainerRef = useRef<HTMLDivElement>(null);
  useUnmountingAnimation(currentStepContainerRef, () => AnimationType.EXITING);

  return (
    <Box width="100%">
      {currentStep === ConfirmModalState.SUBMITTED ? (
        <FadePresence $scale>
          <Box margin="auto auto 22px auto" width="fit-content">
            <ArrowUpIcon color="success" width={80} height={80} />
          </Box>
        </FadePresence>
      ) : currentStep === ConfirmModalState.COMPLETED ? (
        <FadePresence>
          <Box margin="auto auto 22px auto" width="fit-content">
            <CheckmarkCircleIcon color="success" width={80} height={80} />
          </Box>
        </FadePresence>
      ) : (
        <Box mb="16px">
          <ColumnCenter>
            <PendingSwapConfirmationIcon size={spinnerSize} />
          </ColumnCenter>
        </Box>
      )}
      <AutoColumn gap="12px" justify="center">
        <StepTitleAnimationContainer
          ref={currentStep === ConfirmModalState.PENDING_CONFIRMATION ? currentStepContainerRef : undefined}
        >
          <Text bold textAlign="center">
            {title}
          </Text>
          <TokenTransferInfo
            symbolA={symbolA}
            symbolB={symbolB}
            amountA={amountA}
            amountB={amountB}
            currencyA={currencyA}
            currencyB={currencyB}
            invert={invert}
            size={size}
          />
          {children}
        </StepTitleAnimationContainer>
      </AutoColumn>
    </Box>
  );
};
