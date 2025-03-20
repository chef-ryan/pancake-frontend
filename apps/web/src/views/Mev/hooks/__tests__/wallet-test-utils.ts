import { vi } from 'vitest'
import { ChainId } from '@pancakeswap/chains'
import type { UseAccountReturnType, UseWalletClientReturnType, Config, Connector } from 'wagmi'

// Helper function to mock useAccountActiveChain with configurable parameters
export const mockUseAccountActiveChain = async (params: {
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
export const createMockConnector = (params?: {
  id?: string
  name?: string
  type?: string
  isMetaMask?: boolean
  chainId?: number
  getProvider?: () => Promise<any>
}) => {
  const {
    id = 'mock',
    name = 'Mock Connector',
    type = 'mock',
    isMetaMask = true,
    chainId = ChainId.BSC,
    getProvider = async () => ({}),
  } = params || {}

  // Instead of trying to create a real Connector type, let's use a simpler approach
  // that works for our testing purposes
  return {
    id,
    name,
    type,
    ready: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getProvider,
    getChainId: vi.fn().mockResolvedValue(chainId),
    getAccount: vi.fn().mockResolvedValue('0x123'),
    isAuthorized: vi.fn().mockResolvedValue(true),
    chains: [
      {
        id: chainId,
        name: 'BSC',
      },
    ],
    options: {
      shimDisconnect: true,
    },
    isMetaMask,
    // Add the missing properties required by the Connector type
    getAccounts: vi.fn().mockResolvedValue(['0x123']),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onDisconnect: vi.fn(),
    onMessage: vi.fn(),
    supportsSimulation: false,
    icon: undefined,
    rdns: undefined,
    uid: 'mock-connector',
    // Create a simple mock for the emitter
    emitter: {
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn(),
      listenerCount: vi.fn().mockReturnValue(0),
    },
  } as unknown as Connector // Use a double type assertion to bypass TypeScript's strict checking
}

// Helper function to mock useWalletClient with configurable parameters
export const mockUseWalletClient = async (walletClient?: any) => {
  const useWalletClient = await import('wagmi')
  return vi.mocked(useWalletClient.useWalletClient).mockReturnValueOnce({
    data: walletClient || {
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
  } as UseWalletClientReturnType<Config>) // Use type assertion to bypass TypeScript's strict checking
}

// Helper function to mock useAccount with configurable parameters
export const mockUseAccount = async (params?: {
  connector?: any
  address?: `0x${string}` | undefined
  addresses?: `0x${string}`[] | undefined
  chainId?: number | undefined
  isConnected?: boolean
  status?: 'connected' | 'disconnected' | 'connecting'
}) => {
  const {
    connector,
    address = '0x123',
    addresses = ['0x123'],
    chainId = ChainId.BSC,
    isConnected = true,
    status = 'connected',
  } = params || {}

  const useAccount = await import('wagmi')

  // 創建一個基本的模擬對象
  const mockResult: any = {
    connector,
    address: isConnected ? address : undefined,
    addresses: isConnected ? addresses : undefined,
    chainId: isConnected ? chainId : undefined,
    isConnected,
    isReconnecting: false,
    isDisconnected: !isConnected,
    status,
  }

  // 根據狀態設置 isConnecting
  if (status === 'connecting') {
    mockResult.isConnecting = true
  } else {
    mockResult.isConnecting = false
  }

  // 如果有 chainId 且已連接，則添加 chain 對象
  if (chainId && isConnected) {
    mockResult.chain = {
      id: chainId,
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
    }
  } else {
    mockResult.chain = undefined
  }

  return vi.mocked(useAccount.useAccount).mockReturnValueOnce(mockResult as unknown as UseAccountReturnType)
}

// Setup mock for viem/actions
export const setupViemActionsMocks = () => {
  vi.mock('viem/actions', () => ({
    addChain: vi.fn(),
  }))
}

// Setup mock for wagmi
export const setupWagmiMocks = () => {
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
}
