import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders, handleCors } from 'edge/cors'
import stringify from 'fast-json-stable-stringify'
import {
  PAYMASTER_CONTRACT_WHITELIST,
  ZYFI_PAYMASTER_URL,
  ZYFI_SPONSORED_PAYMASTER_URL,
  paymasterInfo,
} from 'config/paymaster'
import { calculateGasMargin } from 'utils'
import { decodeFunctionData, erc20Abi } from 'viem'

export const config = {
  runtime: 'edge',
}

type Hex = `0x${string}`

export default async function handler(req: NextRequest) {
  // CORS (handles OPTIONS preflight too)
  const cors = handleCors(req)
  if (cors) return cors

  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: getCorsHeaders(req) })
  }

  try {
    const { call, account, gasTokenAddress } = await req.json()

    if (!call || !account || !gasTokenAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: getCorsHeaders(req) })
    }

    const gasTokenInfo = paymasterInfo[gasTokenAddress as string]
    const isSponsored = gasTokenInfo?.discount === 'FREE'

    if (isSponsored) {
      let isTransactionWhitelisted =
        Array.isArray(PAYMASTER_CONTRACT_WHITELIST) &&
        PAYMASTER_CONTRACT_WHITELIST.includes((call.address as string).toLowerCase())

      // Allow ERC20 approve for sponsored tx even if target isn't on whitelist
      try {
        const decoded = decodeFunctionData({
          data: call.calldata as Hex,
          abi: erc20Abi,
        })
        if (decoded.functionName === 'approve') {
          isTransactionWhitelisted = true
        }
      } catch {
        // ignore decode errors; likely not an ERC20 approve
      }

      if (!isTransactionWhitelisted) {
        return NextResponse.json(
          { error: 'Transaction type not whitelisted for Paymaster' },
          { status: 400, headers: getCorsHeaders(req) },
        )
      }
    }

    const PAYMASTER_URL = isSponsored ? ZYFI_SPONSORED_PAYMASTER_URL : ZYFI_PAYMASTER_URL
    const gas = calculateGasMargin(BigInt(call.gas), 2000n)

    const body = {
      feeTokenAddress: gasTokenAddress,
      gasLimit: Number(gas),
      txData: {
        from: account as string,
        to: call.address as string,
        value: call.value as string | number,
        data: call.calldata as Hex,
      },
      ...(isSponsored && { sponsorshipRatio: 100 }),
    }

    const resp = await fetch(PAYMASTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': isSponsored ? process.env.ZYFI_API_KEY ?? '' : '',
      },
      body: stringify(body),
    })

    const json = await resp.json().catch(() => ({}))

    return new NextResponse(JSON.stringify(json), {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(req),
      },
    })
  } catch (error: any) {
    // Avoid leaking raw Error objects; send message only
    return NextResponse.json(
      { error: error?.message ?? 'Internal Server Error' },
      { status: 500, headers: getCorsHeaders(req) },
    )
  }
}
