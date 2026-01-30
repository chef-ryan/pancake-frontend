import { WalletIds } from 'src/config/walletIds'
import { wrapInstalledSafe } from 'src/config/wallets'
import { WalletConfigV3 } from 'src/types'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('wrapInstalledSafe', () => {
  let originalConsoleError: typeof console.error

  beforeEach(() => {
    originalConsoleError = console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle null input', () => {
    expect(wrapInstalledSafe(null as any)).toBeNull()
  })

  it('should handle undefined input', () => {
    expect(wrapInstalledSafe(undefined as any)).toBeUndefined()
  })

  it('should return config if no installed getter exists', () => {
    const config = { id: WalletIds.Metamask, title: 'Test' }
    const result = wrapInstalledSafe(config as any)
    expect(result).toBe(config)
  })

  it('should wrap an existing installed getter and return its value', () => {
    const config = {
      id: WalletIds.Phantom,
      title: 'Test',
      get installed() {
        return true
      },
    }
    const result = wrapInstalledSafe(config as WalletConfigV3)
    expect(result.installed).toBe(true)
  })

  it('should catch errors from the original getter and return false', () => {
    const error = new Error('Test error')
    const config = {
      id: WalletIds.Okx,
      title: 'Test',
      get installed() {
        throw error
      },
    }
    const result = wrapInstalledSafe(config as WalletConfigV3)
    expect(result.installed).toBe(false)
    expect(console.error).toHaveBeenCalledWith(`Error in installed getter for wallet ${config.id}:`, error)
  })

  it('should log "unknown" if id is missing and getter throws', () => {
    const error = new Error('Test error no id')
    const config = {
      // No id
      title: 'Test',
      get installed() {
        throw error
      },
    }
    const result = wrapInstalledSafe(config as any)
    expect(result.installed).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Error in installed getter for wallet unknown:', error)
  })
})
