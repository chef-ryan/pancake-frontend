import { useRouter } from 'next/router'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonMenu, ButtonMenuItem, Flex } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'

const IfoTabButtons: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()

  let activeIndex = 0
  if (router.pathname.includes('/ifo/history')) {
    activeIndex = 1
  }

  return (
    <Flex justifyContent="center" mb="16px">
      <ButtonMenu activeIndex={activeIndex} scale="sm" variant="subtle">
        <ButtonMenuItem as={NextLinkFromReactRouter} to="/ifo">
          {t('Latest')}
        </ButtonMenuItem>
        <ButtonMenuItem as={NextLinkFromReactRouter} to="/ifo/history">
          {t('Finished')}
        </ButtonMenuItem>
      </ButtonMenu>
    </Flex>
  )
}

export default IfoTabButtons
