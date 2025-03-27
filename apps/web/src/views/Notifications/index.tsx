import dynamic from 'next/dynamic'
import { Box } from '@pancakeswap/uikit'
import { useSubscription } from '@web3inbox/react'
import { useInitializeNotifications } from 'hooks/useInitializeNotifications'
import React, { memo, useCallback, useEffect, useState } from 'react'
import NotificationMenu from './components/NotificationDropdown/NotificationMenu'
import { ViewContainer } from './styles'
import { PAGE_VIEW } from './types'
import { disableGlobalScroll, enableGlobalScroll } from './utils/toggleEnableScroll'

const OnBoardingView = dynamic(() => import('./containers/OnBoardingView'), { ssr: false })
const NotificationView = dynamic(() => import('./containers/NotificationView'), { ssr: false })
const NotificationSettings = dynamic(() => import('./containers/NotificationSettings'), { ssr: false })

const Notifications = () => {
  const { isReady } = useInitializeNotifications()

  if (!isReady) return null
  return <NotificationsWidget />
}

const NotificationsWidget = memo(() => {
  const [viewIndex, setViewIndex] = useState<PAGE_VIEW>(PAGE_VIEW.OnboardView)

  const { data: subscription } = useSubscription()
  const isSubscribed = Boolean(subscription)

  const toggleSettings = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()

      if (viewIndex === PAGE_VIEW.OnboardView || viewIndex === PAGE_VIEW.SettingsView)
        setViewIndex(PAGE_VIEW.NotificationView)
      else setViewIndex(PAGE_VIEW.SettingsView)
    },
    [setViewIndex, viewIndex],
  )

  useEffect(() => {
    if (!isSubscribed) setViewIndex(PAGE_VIEW.OnboardView)
    if (isSubscribed) setViewIndex(PAGE_VIEW.NotificationView)
  }, [isSubscribed])

  return (
    <NotificationMenu viewIndex={viewIndex} subscriptionId={subscription?.topic}>
      <Box tabIndex={-1} onMouseEnter={disableGlobalScroll} onMouseLeave={enableGlobalScroll}>
        <ViewContainer $viewIndex={viewIndex}>
          <OnBoardingView />

          <NotificationView toggleSettings={toggleSettings} subscription={subscription} />

          <NotificationSettings toggleSettings={toggleSettings} />
        </ViewContainer>
      </Box>
    </NotificationMenu>
  )
})

export default Notifications
