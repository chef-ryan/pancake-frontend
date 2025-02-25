import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { getAssetUrl } from 'utils'

const StyledButton = styled(Button)`
  margin-left: -20px;
  z-index: 1;
`

const StyledImage = styled.img`
  z-index: 2;
`

export const HelpBunny = () => {
  const { t } = useTranslation()
  return (
    <Flex maxWidth="250px" maxHeight="132px" alignItems="end">
      <StyledImage src={getAssetUrl('ton-bunny.png')} alt={t('Need Help?')} width={128} />
      <StyledButton variant="subtle">{t('Need Help?')}</StyledButton>
    </Flex>
  )
}
