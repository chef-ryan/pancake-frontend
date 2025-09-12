import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { BodyText } from '../BodyText'
import { AdButton } from '../Button'
import { AdCard } from '../Card'
import { AdPlayerProps, RemoteAds } from '../ads.types'
import { getImageUrl } from '../utils'

interface JsonAdsProps extends AdPlayerProps {
  ad: RemoteAds
}

export const JsonAds: React.FC<JsonAdsProps> = ({ ad, ...props }) => {
  const { t } = useTranslation()

  return (
    <AdCard imageUrl={getImageUrl(ad.imgUrl)} {...props}>
      {ad.texts && (
        <BodyText mb="0">
          {ad.texts.map((item, index) => {
            if (typeof item === 'string') {
              return item
            }
            const content = t(item.i18nText)
            if (item.highlight) {
              return (
                <Text key={index} as="span" fontSize="inherit" color="secondary" bold style={item.style}>
                  {content}
                </Text>
              )
            }
            if (item.style) {
              return (
                <Text key={index} as="span" fontSize="inherit" style={item.style}>
                  {content}
                </Text>
              )
            }
            return content
          })}
        </BodyText>
      )}
      {ad.actions?.map((action, idx) => {
        if (action.type === 'button') {
          const external = action.external ?? true
          return (
            <AdButton
              key={idx}
              href={action.link}
              isExternalLink={external}
              externalIcon={external}
              style={action.style}
            >
              {t(action.i18nText)}
            </AdButton>
          )
        }
        return null
      })}
    </AdCard>
  )
}
