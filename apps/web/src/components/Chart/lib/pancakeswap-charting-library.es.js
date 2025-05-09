function s(e, i = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return console.error("TradingView or Datafeeds not found. Make sure to load the library scripts before using this function."), null;
  const r = {
    ...{
      symbol: "AAPL",
      interval: "1D",
      fullscreen: !1,
      library_path: "https://assets.pcswap.org/web/charts/charting_library/",
      locale: "en",
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed("https://demo-feed-data.tradingview.com"),
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: "https://saveload.tradingview.com",
      charts_storage_api_version: "1.1",
      client_id: "tradingview.com",
      user_id: "public_user_id",
      theme: "Light"
    },
    ...i,
    container: typeof e == "string" ? e : e.id
  };
  return new window.TradingView.widget(r);
}
function d(e = "https://assets.pcswap.org/web/charts/charting_library/", i = "https://assets.pcswap.org/web/charts/datafeeds/") {
  return new Promise((n, r) => {
    const t = document.createElement("script");
    t.src = `${e}charting_library.standalone.js`, t.async = !0, t.onload = () => {
      const a = document.createElement("script");
      a.src = `${i}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`, a.async = !0, a.onload = () => {
        n({ TradingView: window.TradingView, Datafeeds: window.Datafeeds });
      }, a.onerror = () => r(new Error("Failed to load Datafeeds library")), document.head.appendChild(a);
    }, t.onerror = () => r(new Error("Failed to load TradingView library")), document.head.appendChild(t);
  });
}
function o() {
  return window.TradingView;
}
function c() {
  return window.Datafeeds;
}
const l = {
  createTradingViewWidget: s,
  loadTradingViewLibrary: d,
  getTradingView: o,
  getDatafeeds: c
};
export {
  s as createTradingViewWidget,
  l as default,
  c as getDatafeeds,
  o as getTradingView,
  d as loadTradingViewLibrary
};
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
