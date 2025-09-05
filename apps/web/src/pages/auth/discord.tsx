import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useFirebaseAuth } from '../../wallet/Privy/firebase'
import { useSocialLoginProviderAtom } from '../../wallet/Privy/atom'

export default function DiscordAuthPage() {
  const router = useRouter()
  const { loginWithCustomToken } = useFirebaseAuth()
  const [, setSocialProvider] = useSocialLoginProviderAtom()

  useEffect(() => {
    const authenticate = async () => {
      if (!router.isReady) return
      const { code, state, from } = router.query
      if (typeof code !== 'string' || typeof state !== 'string') {
        console.error('Invalid Discord auth callback parameters')
        return
      }
      const expectedState = localStorage.getItem('discordAuthState')
      if (state !== expectedState) {
        console.error('Discord OAuth state mismatch')
        return
      }
      localStorage.removeItem('discordAuthState')
      try {
        const res = await fetch('/api/auth/discord/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        })
        const data = await res.json()
        if (data.customToken) {
          setSocialProvider('discord')
          const loggedIn = await loginWithCustomToken(data.customToken)
          if (loggedIn) {
            let redirectTo = '/'
            if (typeof from === 'string') {
              try {
                const decoded = atob(decodeURIComponent(from))
                const url = new URL(decoded)
                if (url.origin === window.location.origin) {
                  redirectTo = url.toString()
                }
              } catch (error) {
                console.error('Invalid from parameter:', error)
              }
            }
            window.location.replace(redirectTo)
          }
        } else {
          console.error('No custom token returned from Discord login')
        }
      } catch (err) {
        console.error('Discord login failed:', err)
      }
    }
    authenticate()
  }, [router, loginWithCustomToken, setSocialProvider])

  return <div>Signing in with Discord...</div>
}
