import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

/** Batch S01：演示 CubeLayout 三槽位（header / content / footer-page） */
export const ShowcaseSceneS01 = defineComponent({
  name: 'ShowcaseSceneS01',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS01Title: 'Showcase · 场景 S01',
        contentAreaPlaceholder: '内容区占位',
        contentBodyPlaceholder: '此处为正文占位，可替换为业务组件。',
        footerSlotDemo: 'footer slot demo',
      },
      'en-US': {
        showcaseSceneS01Title: 'Showcase · Scene S01',
        contentAreaPlaceholder: 'Content area placeholder',
        contentBodyPlaceholder:
          'Placeholder for main content; replace with business components.',
        footerSlotDemo: 'footer slot demo',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button type='primary'>{pageTitle || t('showcaseSceneS01Title')}</Button>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('contentAreaPlaceholder')}>
          <p>{t('contentBodyPlaceholder')}</p>
        </Card>
      ),
      'footer-page': (): JSX.Element => <div>{t('footerSlotDemo')}</div>,
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS01Title')} v-slots={slots} />
    )
  },
})
