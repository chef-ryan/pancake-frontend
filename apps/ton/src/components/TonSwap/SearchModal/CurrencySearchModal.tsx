import { usePreviousValue } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'

import { Currency } from '@pancakeswap/routing-sdk-addon-ton'
import {
  Button,
  CopyButton,
  FlexGap,
  Heading,
  InjectedModalProps,
  MODAL_SWIPE_TO_CLOSE_VELOCITY,
  ModalBackButton,
  ModalBody,
  ModalCloseButton,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { ViewOnExplorerButton } from 'components/ViewOnExplorerButton'
import { CurrencyLogo } from 'components/widgets'
import { useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import CurrencySearch from './CurrencySearch'
import { CurrencyModalView } from './types'

const Footer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  text-align: center;
`
const StyledModalContainer = styled(ModalContainer)`
  width: 100%;
  min-width: 320px;
  max-width: 420px !important;
  min-height: calc(var(--vh, 1vh) * 90);
  ${({ theme }) => theme.mediaQueries.md} {
    min-height: auto;
  }
`

const StyledModalHeader = styled(ModalHeader)`
  border: none;
`

const StyledModalBody = styled(ModalBody)`
  padding: 4px 24px 24px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

export interface CurrencySearchModalProps extends InjectedModalProps {
  selectedCurrency?: Currency | null
  onCurrencySelect?: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  tokensToShow?: Currency[]
  showCurrencyInHeader?: boolean
}

export default function CurrencySearchModal({
  onDismiss = () => null,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = true,
  commonBasesType,
  showSearchInput,
  tokensToShow,
  showCurrencyInHeader = false,
}: CurrencySearchModalProps) {
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.search)

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onDismiss?.()
      onCurrencySelect?.(currency)
    },
    [onDismiss, onCurrencySelect],
  )

  // for token import view
  const prevView = usePreviousValue(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Currency | undefined>()

  // used for import list
  // const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const { t } = useTranslation()

  // const [, dispatch] = useListState()
  // const lists = useAllLists()
  // const adding = Boolean(listURL && lists[listURL]?.loadingRequestId)

  // const fetchList = useFetchListCallback(dispatch)

  // const [addError, setAddError] = useState<string | null>(null)

  // const handleAddList = useCallback(() => {
  //   if (adding || !listURL) return
  //   setAddError(null)
  //   fetchList(listURL)
  //     .then(() => {
  //       dispatch(enableList(listURL))
  //       setModalView(CurrencyModalView.manage)
  //     })
  //     .catch((error) => {
  //       setAddError(error.message)
  //       dispatch(removeList(listURL))
  //     })
  // }, [adding, dispatch, fetchList, listURL])

  const config = {
    [CurrencyModalView.search]: { title: t('Select a Token'), onBack: undefined },
    [CurrencyModalView.manage]: { title: t('Manage'), onBack: () => setModalView(CurrencyModalView.search) },
    [CurrencyModalView.importToken]: {
      title: t('Import Tokens'),
      onBack: () =>
        setModalView(prevView && prevView !== CurrencyModalView.importToken ? prevView : CurrencyModalView.search),
    },
    [CurrencyModalView.importList]: { title: t('Import List'), onBack: () => setModalView(CurrencyModalView.search) },
  }
  const { isMobile } = useMatchBreakpoints()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!wrapperRef.current) return
    setHeight(wrapperRef.current.offsetHeight - 330)
  }, [])

  return (
    <StyledModalContainer
      drag={isMobile ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 600 }}
      dragElastic={{ top: 0 }}
      dragSnapToOrigin
      onDragStart={() => {
        if (wrapperRef.current) wrapperRef.current.style.animation = 'none'
      }}
      // @ts-ignore
      onDragEnd={(e, info) => {
        if (info.velocity.y > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) onDismiss()
      }}
      ref={wrapperRef}
    >
      <StyledModalHeader>
        <ModalTitle>
          {config[modalView].onBack && <ModalBackButton onBack={config[modalView].onBack} />}

          {showCurrencyInHeader && selectedCurrency ? (
            <>
              <CurrencyLogo currency={selectedCurrency as any} style={{ borderRadius: '50%' }} />
              <Text p="2px 6px" bold>
                {selectedCurrency.symbol}
              </Text>
              {!selectedCurrency.isNative && (
                <FlexGap ml={isMobile ? '8px' : '4px'} alignItems="center">
                  <CopyButton
                    data-dd-action-name="Copy token address"
                    width="16px"
                    buttonColor="textSubtle"
                    text={selectedCurrency.wrapped.address}
                    tooltipMessage={t('Token address copied')}
                    defaultTooltipMessage={t('Copy token address')}
                    tooltipPlacement="top"
                  />
                  <ViewOnExplorerButton
                    address={selectedCurrency.wrapped.address}
                    chainId={selectedCurrency.chainId}
                    type="token"
                    color="textSubtle"
                    width="18px"
                    ml={isMobile ? '18px' : '12px'}
                    tooltipPlacement="top"
                  />
                  {/* <AddToWalletButton
                    data-dd-action-name="Add to wallet"
                    variant="text"
                    p="0"
                    ml={isMobile ? '21px' : '15px'}
                    height="auto"
                    width="fit-content"
                    tokenAddress={selectedCurrency.wrapped.address}
                    tokenSymbol={selectedCurrency.symbol}
                    tokenDecimals={selectedCurrency.decimals}
                    tokenLogo={
                      selectedCurrency.wrapped instanceof WrappedTokenInfo
                        ? selectedCurrency.wrapped.logoURI
                        : undefined
                    }
                    tooltipPlacement="top"
                  /> */}
                </FlexGap>
              )}
            </>
          ) : (
            <Heading>{config[modalView].title}</Heading>
          )}
        </ModalTitle>
        <ModalCloseButton onDismiss={onDismiss} />
      </StyledModalHeader>
      <StyledModalBody>
        {modalView === CurrencyModalView.search ? (
          <CurrencySearch
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={selectedCurrency}
            otherSelectedCurrency={otherSelectedCurrency}
            showCommonBases={showCommonBases}
            commonBasesType={commonBasesType}
            showSearchInput={showSearchInput}
            showImportView={() => setModalView(CurrencyModalView.importToken)}
            setImportToken={setImportToken}
            height={height}
            tokensToShow={tokensToShow}
          />
        ) : (
          ''
        )}
        {modalView === CurrencyModalView.search && (
          <Footer>
            <Button
              scale="sm"
              variant="text"
              onClick={() => setModalView(CurrencyModalView.manage)}
              className="list-token-manage-button"
            >
              {t('Manage Tokens')}
            </Button>
          </Footer>
        )}
      </StyledModalBody>
    </StyledModalContainer>
  )
}
