import { CubeLayout } from '@ghcloud/cube-app-design'
import { Card, TypographyText } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export const ShowcaseSceneS04 = defineComponent({
  name: 'ShowcaseSceneS04',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS04Title: 'Showcase · S04',
        contentCardTitle: '内容占位',
        scenePlaceholderBody: 'S04 场景占位，后续替换为实际内容。',
      },
      'en-US': {
        showcaseSceneS04Title: 'Showcase · S04',
        contentCardTitle: 'Content placeholder',
        scenePlaceholderBody: 'S04 scene placeholder; replace with real content later.',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title={t('contentCardTitle')}>
          <TypographyText type='secondary'>{t('scenePlaceholderBody')}</TypographyText>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS04Title')} v-slots={slots} showFooter={false} />
    )
  },
})
