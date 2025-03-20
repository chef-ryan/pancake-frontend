import { ChainId } from '@pancakeswap/chains'
import { renderHook, act } from '@testing-library/react'
import { createWagmiWrapper } from 'testUtils'
import { WalletType } from 'views/Mev/types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { BSCMevGuardChain } from 'utils/mevGuardChains'
import { MethodNotFoundRpcError } from 'viem'
import { addChain } from 'viem/actions'
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
import {
  createMockConnector,
  mockUseAccount,
  mockUseAccountActiveChain,
  mockUseWalletClient,
  setupViemActionsMocks,
  setupWagmiMocks,
} from './wallet-test-utils'

// Setup mocks for external dependencies
setupViemActionsMocks()
setupWagmiMocks()

describe('MEV Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useWalletSupportsAddEthereumChain', () => {
    test('should return false when connector is not available', async () => {
      await mockUseAccount({
        connector: undefined,
        address: undefined,
        addresses: undefined,
        chainId: undefined,
        isConnected: false,
        status: 'disconnected',
      })

      const { result } = renderHook(() => useWalletSupportsAddEthereumChain(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.walletSupportsAddEthereumChain).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })

    test('should return true for MetaMask wallet that supports addEthereumChain', async () => {
      await mockUseAccount({
        connector: createMockConnector(),
        address: '0x123',
        addresses: ['0x123'],
        chainId: ChainId.BSC,
        isConnected: true,
        status: 'connected',
      })

      const { result } = renderHook(() => useWalletSupportsAddEthereumChain(), {
        wrapper: createWagmiWrapper(),
      })

      await vi.waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.walletSupportsAddEthereumChain).toBe(true)
    })
  })

  describe('useIsMEVEnabled', () => {
    test('should return false when not connected to BSC', async () => {
      await mockUseAccountActiveChain({
        account: '0x123',
        chainId: ChainId.ETHEREUM,
        status: 'connected',
      })

      const { result } = renderHook(() => useIsMEVEnabled(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.isMEVEnabled).toBe(false)
    })

    test('should return true when connected to BSC with MEV RPC', async () => {
      await mockUseAccountActiveChain({
        account: '0x123',
        chainId: ChainId.BSC,
        status: 'connected',
      })

      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...(actual as any),
          isBSCMevRpc: vi.fn().mockReturnValue(true),
        }
      })

      const { result } = renderHook(() => useIsMEVEnabled(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current.isMEVEnabled).toBe(true)
    })
  })

  describe('useShouldShowMEVToggle', () => {
    test('should return false when MEV is already enabled', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...(actual as any),
          useIsMEVEnabled: vi.fn().mockReturnValue({ isMEVEnabled: true }),
        }
      })

      const { result } = renderHook(() => useShouldShowMEVToggle(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current).toBe(false)
    })

    test('should return false when wallet does not support addEthereumChain', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...(actual as any),
          useIsMEVEnabled: vi.fn().mockReturnValue({ isMEVEnabled: false }),
          useWalletSupportsAddEthereumChain: vi.fn().mockReturnValue({
            walletSupportsAddEthereumChain: false,
            isLoading: false,
          }),
        }
      })

      const { result } = renderHook(() => useShouldShowMEVToggle(), {
        wrapper: createWagmiWrapper(),
      })

      expect(result.current).toBe(false)
    })

    test('should return true when wallet supports addEthereumChain and MEV is not enabled', async () => {
      vi.mock('../index', async () => {
        const actual = await vi.importActual('../index')
        return {
          ...(actual as any),
          useIsMEVEnabled: vi.fn().mockReturnValue({ isMEVEnabled: false }),
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
    test('should add MEV RPC to wallet', async () => {
      const mockWalletClient = {
        account: {
          address: '0x123',
        },
        request: vi.fn(),
      }
      await mockUseWalletClient(mockWalletClient)

      const mockConnector = createMockConnector()

      await mockUseAccount({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chainId: ChainId.BSC,
        isConnected: true,
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
      await mockUseWalletClient(mockWalletClient)

      await mockUseAccount({
        connector: createMockConnector(),
        address: '0x123',
        addresses: ['0x123'],
        chainId: ChainId.BSC,
        isConnected: true,
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
      await mockUseWalletClient(mockWalletClient)

      const mockConnector = createMockConnector()

      await mockUseAccount({
        connector: mockConnector,
        address: '0x123',
        addresses: ['0x123'],
        chainId: ChainId.BSC,
        isConnected: true,
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
      await mockUseAccount({
        connector: undefined,
        address: undefined,
        addresses: undefined,
        chainId: undefined,
        isConnected: false,
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
      await mockUseAccount({ connector: mockConnector })

      const getWalletTypeSpy = vi.spyOn(await import('../index'), 'getWalletType')

      renderHook(() => useWalletType(), {
        wrapper: createWagmiWrapper(),
      })

      expect(getWalletTypeSpy).toHaveBeenCalledWith(mockConnector)
    })
  })
})
