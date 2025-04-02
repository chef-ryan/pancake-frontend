import { Box, BoxProps, HelpIcon } from "@pancakeswap/uikit";
import Image from "next/image";
import { memo } from "react";
import { ASSET_CDN } from "../../utils/endpoints";

export const ChainLogo = memo(
  ({
    chainId,
    width = 24,
    height = 24,
    ...props
  }: { chainId?: number; width?: number; height?: number } & BoxProps) => {
    const icon = chainId ? (
      <Image
        alt={`chain-${chainId}`}
        style={{ maxHeight: `${height}px` }}
        src={`${ASSET_CDN}/web/chains/${chainId}.png`}
        width={width}
        height={height}
        unoptimized
      />
    ) : (
      <HelpIcon width={width} height={height} />
    );
    return <Box {...props}>{icon}</Box>;
  }
);
