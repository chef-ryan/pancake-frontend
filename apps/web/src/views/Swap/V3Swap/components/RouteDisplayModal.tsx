import { useTranslation } from '@pancakeswap/localization'
import { Route, RouteType } from '@pancakeswap/smart-router'
import { AutoColumn, Flex, Modal, ModalV2, QuestionHelper, Text, UseModalV2Props, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { memo, useMemo } from 'react'

import { RoutingSettingsButton } from 'components/Menu/GlobalSettings/SettingsModalV2'
import { CurrencyLogoWrapper, RouterBox, RouterTypeText } from 'views/Swap/components/RouterViewer'
import { useHookDiscount } from 'views/SwapSimplify/hooks/useHookDiscount'
import { Currency } from '@pancakeswap/sdk'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { BridgeRoutesDisplay } from './RouteDisplay/BridgeRoutesDisplay'
import { EVMPairNodes } from './RouteDisplay/pairNode'
import { JupPairNodes } from './RouteDisplay/JupPairNodes'
import { Pair } from './RouteDisplay/types'

export type RouteDisplayEssentials = Pick<Route, 'path' | 'pools' | 'inputAmount' | 'outputAmount' | 'percent' | 'type'>

interface Props extends UseModalV2Props {
  routes: RouteDisplayEssentials[]
}

export const RouteDisplayModal = memo(function RouteDisplayModal({ isOpen, onDismiss, routes }: Props) {
  const { t } = useTranslation()
  const isBridgeRouting = routes?.some((route) => route.type === RouteType.BRIDGE)

  return (
    <ModalV2 closeOnOverlayClick isOpen={isOpen} onDismiss={onDismiss} minHeight="0">
      <Modal
        title={
          <Flex justifyContent="center">
            {t('Route')}{' '}
            <QuestionHelper
              text={t('Routing through these tokens resulted in the best price for your trade.')}
              ml="4px"
              placement="top-start"
            />
          </Flex>
        }
        style={{ minHeight: '0' }}
        bodyPadding="24px"
      >
        {isBridgeRouting ? (
          <BridgeRoutesDisplay routes={routes} />
        ) : (
          <AutoColumn gap="56px" height="100%">
            {routes.map((route, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <RouteDisplay key={i} route={route} />
            ))}
            <RoutingSettingsButton />
          </AutoColumn>
        )}
      </Modal>
    </ModalV2>
  )
})

interface RouteDisplayProps {
  route: RouteDisplayEssentials
}

export const RouteDisplay = memo(function RouteDisplay({ route }: RouteDisplayProps) {
  const { hookDiscount, category } = useHookDiscount(route.pools)
  const { path, pools, inputAmount, outputAmount } = route
  const { currency: inputCurrency } = inputAmount
  const { currency: outputCurrency } = outputAmount
  const { targetRef, tooltip, tooltipVisible } = useTooltip(<Text>{inputCurrency.symbol}</Text>, {
    placement: 'right',
  })

  const {
    targetRef: outputTargetRef,
    tooltip: outputTooltip,
    tooltipVisible: outputTooltipVisible,
  } = useTooltip(<Text>{outputCurrency.symbol}</Text>, {
    placement: 'right',
  })

  const pairs = useMemo<Pair[]>(() => {
    if (path.length <= 1) {
      return []
    }

    const currencyPairs: Pair[] = []
    for (let i = 0; i < path.length - 1; i += 1) {
      currencyPairs.push([path[i], path[i + 1]])
    }
    return currencyPairs
  }, [path])

  const pairNodes =
    route.type === RouteType.SVM ? (
      <JupPairNodes pairs={pairs} pools={pools} />
    ) : (
      <EVMPairNodes
        pairs={pairs}
        pools={pools}
        routePoolsLength={route.pools.length}
        hookDiscount={hookDiscount}
        category={category}
      />
    )

  return (
    <AutoColumn gap="24px">
      <RouterBox justifyContent="space-between" alignItems="center">
        <CurrencyLogoWrapper
          size={{
            xs: '32px',
            md: '48px',
          }}
          ref={targetRef}
        >
          {route.type === RouteType.SVM ? (
            <SolanaCurrencyLogo currencyId={inputCurrency.wrapped.address} chainId={inputCurrency.chainId} />
          ) : (
            <CurrencyLogo size="100%" currency={inputCurrency} />
          )}
          <RouterTypeText fontWeight="bold">{Math.round(route.percent)}%</RouterTypeText>
        </CurrencyLogoWrapper>
        {tooltipVisible && tooltip}
        {pairNodes}
        <CurrencyLogoWrapper
          size={{
            xs: '32px',
            md: '48px',
          }}
          ref={outputTargetRef}
        >
          {route.type === RouteType.SVM ? (
            <SolanaCurrencyLogo currencyId={outputCurrency.wrapped.address} chainId={outputCurrency.chainId} />
          ) : (
            <CurrencyLogo size="100%" currency={outputCurrency} />
          )}
        </CurrencyLogoWrapper>
        {outputTooltipVisible && outputTooltip}
      </RouterBox>
    </AutoColumn>
  )
})

function SolanaCurrencyLogo({ currencyId, chainId }: { currencyId: string; chainId: number }) {
  // NOTE: wonder why? check parseSVMTradeIntoSVMOrder.ts
  const unifiedCurrency = useUnifiedCurrency(currencyId, chainId)
  return <CurrencyLogo size="100%" currency={unifiedCurrency as Currency} />
}
