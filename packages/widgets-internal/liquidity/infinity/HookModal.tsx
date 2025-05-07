import { HookData } from "@pancakeswap/infinity-sdk";
import { useTranslation } from "@pancakeswap/localization";
import { AutoColumn, Flex, FlexGap, LinkExternal, Modal, Text } from "@pancakeswap/uikit";
import Miscellaneous from "@pancakeswap/uikit/components/Svg/Icons/Miscellaneous";

const ModalTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <>
      <FlexGap gap="8px" alignItems="center">
        <Miscellaneous color="textSubtle" width="24px" height="24px" />
        <Text fontSize={24} bold>
          {children}
        </Text>
      </FlexGap>
    </>
  );
};

export const HookModal: React.FC<{
  hookData?: HookData;
  onDismiss?: () => void;
}> = ({ hookData, onDismiss }) => {
  const { t } = useTranslation();

  if (!hookData) return null;

  return (
    <Modal title={<ModalTitle />} onDismiss={onDismiss}>
      <Flex minHeight="120px" flexDirection="column" width={["100%", "100%", "100%", "480px"]}>
        <AutoColumn gap="24px">
          <AutoColumn gap="sm">
            <Text fontSize={12} color="secondary" bold textTransform="uppercase">
              {t("Description")}
            </Text>
            <Text ellipsis style={{ whiteSpace: "pre-wrap" }}>
              {hookData.description}
            </Text>
          </AutoColumn>

          <LinkExternal href={hookData.github} marginTop="auto">
            <Text fontSize={16} color="primary" bold>
              {t("View details in Docs")}
            </Text>
          </LinkExternal>
        </AutoColumn>
      </Flex>
    </Modal>
  );
};
