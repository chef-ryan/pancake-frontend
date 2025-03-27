import { styled } from "styled-components";
import { ASSET_CDN } from "../../util/endpoints";
import { Box } from "../Box";

const SwapLoading = styled(Box).attrs(({ width = "18px", height = "18px" }) => ({
  width,
  height,
}))`
  background-image: url(${ASSET_CDN}/web/swap-spinner.png);
  background-size: contain;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default SwapLoading;
