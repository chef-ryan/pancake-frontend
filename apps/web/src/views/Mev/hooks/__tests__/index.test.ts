import { ChainId } from '@pancakeswap/chains'
import { act, renderHook } from '@testing-library/react-hooks'
import { createWagmiWrapper } from 'testUtils'
import { BSCMevGuardChain } from 'utils/mevGuardChains'
import { MethodNotFoundRpcError } from 'viem'
import { addChain } from 'viem/actions'

import { WalletType } from 'views/Mev/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  walletConnectSupportDefaultMevOnBSC,
  walletSupportCustomRPCNative,
  walletSupportDefaultMevOnBSC,
  walletSupportManualRPCConfig,
} from '../../constant'
import {
  getWalletType,
  useAddMevRpc,
  useIsMEVEnabled,
  useShouldShowMEVToggle,
  useWalletSupportsAddEthereumChain,
  useWalletType,
} from '../index'

// Helper function to mock useAccountActiveChain with configurable parameters
const mockUseAccountActiveChain = async (params: {
  account?: `0x${string}`
  chainId?: number
  status?: 'connected' | 'disconnected' | 'connecting'
  connector?: any
}) => {
  const { account, chainId = ChainId.BSC, status = 'connected', connector } = params
  const useAccountActiveChain = await import('hooks/useAccountActiveChain')
  return vi.mocked(useAccountActiveChain.default).mockReturnValueOnce({
    account,
    chainId,
    status,
    connector,
  })
}

// Helper function to create a mock connector with configurable parameters
const createMockConnector = (params?: {
  id?: string
  name?: string
  type?: string
  isMetaMask?: boolean
  chainId?: number
  getProvider?: () => Promise<any>
}) => {
  const {
    id = 'mock',
    name = 'Mock Wallet',
    type = 'mock',
    isMetaMask = true,
    chainId = ChainId.BSC,
    getProvider = vi.fn().mockResolvedValue({
      isMetaMask,
    }),
  } = params || {}

  return {
    id,
    name,
    type,
    uid: 'test-connector',
    connect: vi.fn().mockResolvedValue({ accounts: ['0x123'], chainId }),
    disconnect: vi.fn(),
    getProvider,
    getAccounts: vi.fn().mockResolvedValue(['0x123']),
    getChainId: vi.fn().mockResolvedValue(chainId),
    isAuthorized: vi.fn().mockResolvedValue(true),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onDisconnect: vi.fn(),
    emitter: {
      uid: 'emitter-uid',
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
      listenerCount: vi.fn(),
      _emitter: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
        eventNames: vi.fn().mockReturnValue([]),
        listeners: vi.fn().mockReturnValue([]),
        listenerCount: vi.fn().mockReturnValue(0),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
      },
    },
  }
}

// Mock dependencies
vi.mock('viem/actions', () => ({
  addChain: vi.fn(),
}))

// Update the wagmi mock
vi.mock('wagmi', async (importOriginal) => {
  const actual = await importOriginal()

  // Create a mock wallet connector inside the mock function
  const createConnectorMock = (isMetaMask = true) => ({
    id: 'mock',
    name: 'Mock Wallet',
    type: 'mock',
    uid: 'test-connector',
    connect: vi.fn().mockResolvedValue({ accounts: ['0x123'], chainId: ChainId.BSC }),
    disconnect: vi.fn(),
    getProvider: vi.fn().mockResolvedValue({
      isMetaMask,
    }),
    getAccounts: vi.fn().mockResolvedValue(['0x123']),
    getChainId: vi.fn().mockResolvedValue(ChainId.BSC),
    isAuthorized: vi.fn().mockResolvedValue(true),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onDisconnect: vi.fn(),
    emitter: {
      uid: 'emitter-uid',
      on: vi.fn(),
      off: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
      listenerCount: vi.fn(),
      _emitter: {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
        eventNames: vi.fn().mockReturnValue([]),
        listeners: vi.fn().mockReturnValue([]),
        listenerCount: vi.fn().mockReturnValue(0),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
      },
    },
  })

  return {
    ...(actual as any),
    useAccount: vi.fn(() => ({
      connector: createConnectorMock(),
      address: '0x123',
      addresses: ['0x123'],
      chain: {
        id: ChainId.BSC,
        name: 'BSC',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://bsc-dataseed.binance.org/'],
          },
          public: {
            http: ['https://bsc-dataseed.binance.org/'],
          },
        },
      },
      chainId: ChainId.BSC,
      isConnected: true,
      isReconnecting: false,
      isConnecting: false,
      isDisconnected: false,
      status: 'connected',
    })),
    useWalletClient: vi.fn(() => ({
      data: {
        account: {
          address: '0x123',
        },
        request: vi.fn(),
      },
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
      status: 'success',
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      queryKey: ['walletClient'],
      isInitialLoading: false,
      isPaused: false,
    })),
  }
})

describe('MEV Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useWalletSupportsAddEthereumChain', () => {
    test('should return false when connector is not available', async () => {
      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: undefined,
        address: undefined,
        addresses: undefined,
        chain: undefined,
        chainId: undefined,
        isConnected: false,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: true,
        status: 'disconnected',
      })

      const { result } = renderHook(() => useWalletSupportsAddEthereumChain(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.walletSupportsAddEthereumChain).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    test('should return true for MetaMask wallet that supports addEthereumChain', async () => {
      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: createMockConnector(),
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      const { result, waitForNextUpdate } = renderHook(() => useWalletSupportsAddEthereumChain(), {
        wrapper: createWagmiWrapper(),
      })

      await waitForNextUpdate()

      expect(result.current.walletSupportsAddEthereumChain).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    test('should return false for non-MetaMask wallet', async () => {
      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: createMockConnector({ isMetaMask: false }),
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      const { result, waitForNextUpdate } = renderHook(() => useWalletSupportsAddEthereumChain(), {
        wrapper: createWagmiWrapper(),
      })

      await waitForNextUpdate()

      expect(result.current.walletSupportsAddEthereumChain).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('useIsMEVEnabled', () => {
    test('should return false when account is not available', async () => {
      await mockUseAccountActiveChain({
        account: undefined,
        status: 'disconnected',
        connector: undefined,
      })

      const { result } = renderHook(() => useIsMEVEnabled(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.isMEVEnabled).toBe(false)
      expect(result.current.isMEVProtectAvailable).toBe(true)
    })

    test('should return true for wallet with default MEV on BSC', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...actual,
          useWalletType: vi.fn().mockReturnValue({
            walletType: WalletType.mevDefaultOnBSC,
            isLoading: false,
          }),
        }
      })

      const { result } = renderHook(() => useIsMEVEnabled(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.isMEVEnabled).toBe(true)
      expect(result.current.isMEVProtectAvailable).toBe(true)
    })

    test('should return false for non-BSC chain', async () => {
      await mockUseAccountActiveChain({
        account: '0x123',
        chainId: ChainId.ETHEREUM,
        connector: createMockConnector(),
      })

      const { result } = renderHook(() => useIsMEVEnabled(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.isMEVEnabled).toBe(false)
      expect(result.current.isMEVProtectAvailable).toBe(false)
    })
  })

  describe('useShouldShowMEVToggle', () => {
    test('should return false when MEV is already enabled', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...actual,
          useIsMEVEnabled: vi.fn().mockReturnValue({
            isMEVEnabled: true,
            isLoading: false,
            isMEVProtectAvailable: true,
          }),
          useWalletType: vi.fn().mockReturnValue({
            walletType: WalletType.nativeSupportCustomRPC,
            isLoading: false,
          }),
          useWalletSupportsAddEthereumChain: vi.fn().mockReturnValue({
            walletSupportsAddEthereumChain: true,
            isLoading: false,
          }),
        }
      })

      const { result } = renderHook(() => useShouldShowMEVToggle(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current).toBe(false)
    })

    test('should return true when conditions are met to show toggle', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...actual,
          useIsMEVEnabled: vi.fn().mockReturnValue({
            isMEVEnabled: false,
            isLoading: false,
            isMEVProtectAvailable: true,
          }),
          useWalletType: vi.fn().mockReturnValue({
            walletType: WalletType.nativeSupportCustomRPC,
            isLoading: false,
          }),
          useWalletSupportsAddEthereumChain: vi.fn().mockReturnValue({
            walletSupportsAddEthereumChain: true,
            isLoading: false,
          }),
        }
      })

      const { result } = renderHook(() => useShouldShowMEVToggle(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current).toBe(true)
    })
  })

  describe('useAddMevRpc', () => {
    test('should call addChain with correct parameters', async () => {
      const mockWalletClient = {
        account: {
          address: '0x123',
        },
        request: vi.fn(),
      }
      const { useWalletClient } = await import('wagmi')
      vi.mocked(useWalletClient).mockReturnValueOnce({
        data: mockWalletClient,
        error: null,
        isError: false,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        status: 'success',
        isLoadingError: false,
        isRefetchError: false,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: vi.fn(),
        fetchStatus: 'idle',
        queryKey: ['walletClient'],
        isInitialLoading: false,
        isPaused: false,
      })

      const mockConnector = createMockConnector()

      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      const onSuccess = vi.fn()
      const onBeforeStart = vi.fn()
      const onFinish = vi.fn()

      const { result } = renderHook(() => useAddMevRpc(onSuccess, onBeforeStart, onFinish), {
        wrapper: createWagmiWrapper(),
      })

      await act(async () => {
        await result.current.addMevRpc()
      })

      expect(onBeforeStart).toHaveBeenCalledTimes(1)
      expect(addChain).toHaveBeenCalledWith(mockWalletClient, { chain: BSCMevGuardChain })
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onFinish).toHaveBeenCalledTimes(1)
    })

    test('should call addChain twice for MetaMask wallet', async () => {
      const mockWalletClient = {
        account: {
          address: '0x123',
        },
        request: vi.fn(),
      }
      const { useWalletClient } = await import('wagmi')
      vi.mocked(useWalletClient).mockReturnValueOnce({
        data: mockWalletClient,
        error: null,
        isError: false,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        status: 'success',
        isLoadingError: false,
        isRefetchError: false,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: vi.fn(),
        fetchStatus: 'idle',
        queryKey: ['walletClient'],
        isInitialLoading: false,
        isPaused: false,
      })

      const mockConnector = createMockConnector()

      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      const { result } = renderHook(() => useAddMevRpc(), {
        wrapper: createWagmiWrapper(),
      })

      await act(async () => {
        await result.current.addMevRpc()
      })

      expect(addChain).toHaveBeenCalledTimes(2)
    })

    test('should handle errors properly', async () => {
      const mockWalletClient = {
        account: {
          address: '0x123',
        },
        request: vi.fn(),
      }
      const { useWalletClient } = await import('wagmi')
      vi.mocked(useWalletClient).mockReturnValueOnce({
        data: mockWalletClient,
        error: null,
        isError: false,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        status: 'success',
        isLoadingError: false,
        isRefetchError: false,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        errorUpdateCount: 0,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isPlaceholderData: false,
        isRefetching: false,
        isStale: false,
        refetch: vi.fn(),
        fetchStatus: 'idle',
        queryKey: ['walletClient'],
        isInitialLoading: false,
        isPaused: false,
      })

      const mockConnector = createMockConnector()

      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      vi.mocked(addChain).mockRejectedValueOnce(new MethodNotFoundRpcError(new Error('Method not found')))
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const onFinish = vi.fn()
      const { result } = renderHook(() => useAddMevRpc(undefined, undefined, onFinish), {
        wrapper: createWagmiWrapper(),
      })

      await act(async () => {
        await result.current.addMevRpc()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('wallet_addEthereumChain is not supported')
      expect(onFinish).toHaveBeenCalledTimes(1)
    })
  })

  describe('getWalletType', () => {
    test('should return mevNotSupported for undefined connector', async () => {
      const result = await getWalletType(undefined)
      expect(result).toBe(WalletType.mevNotSupported)
    })

    test('should return mevDefaultOnBSC for WalletConnect with supported wallet', async () => {
      const mockConnector = createMockConnector({
        getProvider: vi.fn().mockResolvedValue({
          isWalletConnect: true,
          session: {
            peer: {
              metadata: {
                name: walletConnectSupportDefaultMevOnBSC[0],
              },
            },
          },
        }),
      })

      const result = await getWalletType(mockConnector)
      expect(result).toBe(WalletType.mevDefaultOnBSC)
    })

    test('should return mevOnlyManualConfig for wallets that support manual RPC config', async () => {
      const mockConnector = createMockConnector({
        getProvider: vi.fn().mockResolvedValue({
          [walletSupportManualRPCConfig[0]]: true,
        }),
      })

      const result = await getWalletType(mockConnector)
      expect(result).toBe(WalletType.mevOnlyManualConfig)
    })

    test('should return mevDefaultOnBSC for wallets with default MEV on BSC', async () => {
      const mockConnector = createMockConnector({
        getProvider: vi.fn().mockResolvedValue({
          [walletSupportDefaultMevOnBSC[0]]: true,
        }),
      })

      const result = await getWalletType(mockConnector)
      expect(result).toBe(WalletType.mevDefaultOnBSC)
    })

    test('should return nativeSupportCustomRPC for wallets with custom RPC support', async () => {
      const mockConnector = createMockConnector({
        getProvider: vi.fn().mockResolvedValue({
          [walletSupportCustomRPCNative[0]]: true,
        }),
      })

      const result = await getWalletType(mockConnector)
      expect(result).toBe(WalletType.nativeSupportCustomRPC)
    })
  })

  describe('useWalletType', () => {
    test('should return mevNotSupported when connector is not available', async () => {
      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: undefined,
        address: undefined,
        addresses: undefined,
        chain: undefined,
        chainId: undefined,
        isConnected: false,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: true,
        status: 'disconnected',
      })

      const { result } = renderHook(() => useWalletType(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.walletType).toBe(WalletType.mevNotSupported)
      expect(result.current.isLoading).toBe(false)
    })

    test('should call getWalletType with connector', async () => {
      const mockConnector = createMockConnector()

      const { useAccount } = await import('wagmi')
      vi.mocked(useAccount).mockReturnValueOnce({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chain: {
          id: ChainId.BSC,
          name: 'BSC',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
            public: {
              http: ['https://bsc-dataseed.binance.org/'],
            },
          },
        },
        chainId: ChainId.BSC,
        isConnected: true,
        isReconnecting: false,
        isConnecting: false,
        isDisconnected: false,
        status: 'connected',
      })

      const getWalletTypeSpy = vi.spyOn(await import('../index'), 'getWalletType')

      renderHook(() => useWalletType(), {
        wrapper: createWagmiWrapper(),
      })

      expect(getWalletTypeSpy).toHaveBeenCalledWith(mockConnector)
    })
  })
})
