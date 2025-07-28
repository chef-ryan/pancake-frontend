const VERSION = '0.0.34'
// https://unpkg.com/@layerzerolabs/x-pancakeswap-widget@0.0.21/element.mjs.sha384
// const SHA384 = 'AGUVeA2krFQS5NHl3wT//Pm0uIoO1uSIf6Za0Dtj1kQQQNC8qrq6TjSt7xrwgH0J'
const SHA384 = 'wy9orblleJ9xshPiuB6uHDL8DKLf/yJO5C4jYNTx43aUAJs9awXFAe8hk3tqGCM+'

export const LAYER_ZERO_JS = {
  src: `https://unpkg.com/@layerzerolabs/x-pancakeswap-widget@${VERSION}/element.mjs`,
  css: `https://unpkg.com/@layerzerolabs/x-pancakeswap-widget@${VERSION}/element.css`,
  integrity: `sha384-${SHA384}`,
}

export const PARTNER_ID = 0x0002
export const FEE_COLLECTOR = '0x68C7ABB8b1c3D1cE467E28265770F3a7ECF32654'
export const FEE_TENTH_BPS = '0'
