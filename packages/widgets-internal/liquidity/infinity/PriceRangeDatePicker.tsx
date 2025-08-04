import { useTranslation } from "@pancakeswap/localization";
import { Button, ButtonMenuItem, FlexGap, Text } from "@pancakeswap/uikit";
import { useCallback, useMemo } from "react";
import styled from "styled-components";

const ButtonGroup = styled(FlexGap)``;

const StyledButton = styled(Button)<{ $isActive: boolean }>`
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.primary60 : theme.colors.textSubtle)};
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "400")};
  padding: 0 14px;
  transition: all 0.2s ease-out;
`;

export const PRESET_RANGE_ITEMS = [
  {
    label: "1D",
    value: "1D",
  },
  {
    label: "7D",
    value: "1W",
  },
  {
    label: "1M",
    value: "1M",
  },
] as const;

export type PresetRangeItem = (typeof PRESET_RANGE_ITEMS)[number];

export interface PriceRangeDatePickerProps {
  height?: string;
  value?: PresetRangeItem;
  onChange?: (range: PresetRangeItem) => void;
}

export const PriceRangeDatePicker = ({
  value = PRESET_RANGE_ITEMS[0],
  height,
  onChange,
}: PriceRangeDatePickerProps) => {
  const { t } = useTranslation();

  const activeIndex = useMemo(() => PRESET_RANGE_ITEMS.findIndex((item) => item.value === value.value), [value]);

  const onItemSelect = useCallback(
    (index: number) => {
      onChange?.(PRESET_RANGE_ITEMS[index]);
    },
    [onChange]
  );
  return (
    <FlexGap columnGap="12px" gap="12px" alignItems="center">
      <ButtonGroup>
        {PRESET_RANGE_ITEMS.map((item, index) => (
          <StyledButton
            variant="text"
            scale="xs"
            height={height || "24px"}
            key={item.value}
            onClick={() => onItemSelect(index)}
            $isActive={activeIndex === index}
          >
            {item.label}
          </StyledButton>
        ))}
      </ButtonGroup>
    </FlexGap>
  );
};
