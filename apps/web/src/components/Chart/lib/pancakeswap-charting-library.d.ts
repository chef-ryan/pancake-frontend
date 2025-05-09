// Type definitions for PancakeSwap Charting Library
// Project: https://github.com/pancakeswap/charting-library

// TradingView widget options interface
export interface TradingViewWidgetOptions {
  symbol?: string;
  interval?: string;
  fullscreen?: boolean;
  container?: string;
  library_path?: string;
  locale?: string;
  datafeed?: any;
  disabled_features?: string[];
  enabled_features?: string[];
  charts_storage_url?: string;
  charts_storage_api_version?: string;
  client_id?: string;
  user_id?: string;
  theme?: 'Light' | 'Dark';
  [key: string]: any;
}

// TradingView widget interface
export interface TradingViewWidget {
  remove?: () => void;
  [key: string]: any;
}

/**
 * Create a TradingView widget
 * @param container - Container ID or DOM element
 * @param options - Widget options
 * @returns TradingView widget instance
 */
export function createTradingViewWidget(
  container: string | HTMLElement,
  options?: TradingViewWidgetOptions
): TradingViewWidget | null;

/**
 * Load the TradingView library
 * @param libraryPath - Library path
 * @param datafeedPath - Datafeed path
 * @returns Promise that resolves when loading is complete
 */
export function loadTradingViewLibrary(
  libraryPath?: string,
  datafeedPath?: string
): Promise<{ TradingView: any; Datafeeds: any }>;

/**
 * Get the TradingView namespace
 * @returns The TradingView namespace
 */
export function getTradingView(): any;

/**
 * Get the Datafeeds namespace
 * @returns The Datafeeds namespace
 */
export function getDatafeeds(): any;

// Default export
declare const _default: {
  createTradingViewWidget: typeof createTradingViewWidget;
  loadTradingViewLibrary: typeof loadTradingViewLibrary;
  getTradingView: typeof getTradingView;
  getDatafeeds: typeof getDatafeeds;
};

export default _default;
