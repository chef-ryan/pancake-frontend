import { getAuth } from 'firebase-admin/auth'
import { firebaseAdmin } from 'lib/firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_STATE_LENGTH = 21
const stateRegex = /^[a-zA-Z0-9_-]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code, state } = req.body ?? {}

  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    res.status(400).json({ error: 'Invalid code or state' })
    return
  }

  if (state.length > MAX_STATE_LENGTH) {
    res.status(400).json({ error: 'State parameter too long' })
    return
  }

  if (!stateRegex.test(state)) {
    // only allow alphanumeric + underscore
    res.status(400).json({ error: 'Invalid state format' })
    return
  }

  try {
    // 1. Exchange authorization code for access token
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    })

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
    if (!tokenRes.ok) {
      const errData = await tokenRes.json()
      throw new Error(`Token exchange failed: ${errData.error || tokenRes.status}`)
    }

    const tokenData = await tokenRes.json()
    const { access_token: accessToken } = tokenData

    // 2. Retrieve Discord user information
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userRes.json()
    const discordId = userData.id

    // 3. Issue Firebase custom token
    await firebaseAdmin() // Ensure Admin SDK is initialized
    const customToken = await getAuth().createCustomToken(`discord:${discordId}`)

    // 4. Return token to frontend
    res.status(200).json({ customToken })
  } catch (err) {
    console.error('[Discord login error]:', err)
    res.status(500).json({ error: 'Discord authentication failed' })
  }
}
