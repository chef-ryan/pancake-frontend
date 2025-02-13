import { IconButton, SwapLoading } from "@pancakeswap/uikit";
import RefreshIcon from "./RefreshIcon";

export const RefreshButton: React.FC<{
  refreshDisabled: boolean;
  onRefresh: () => void;
  loading?: boolean;
  refreshDuration?: number;
}> = ({ refreshDisabled, onRefresh, refreshDuration, loading }) => {
  return (
    <IconButton
      variant="text"
      scale="sm"
      disabled={loading}
      onClick={onRefresh}
      data-dd-action-name="Swap refresh button"
      style={{ backgroundColor: loading ? "transparent" : undefined, transform: "rotate(-45deg)" }}
    >
      {loading ? (
        <SwapLoading />
      ) : (
        <RefreshIcon
          disabled={refreshDisabled}
          color="textSubtle"
          innerColor="#02919D"
          width="20px"
          duration={refreshDuration ? refreshDuration / 1000 : undefined}
        />
      )}
    </IconButton>
  );
};
