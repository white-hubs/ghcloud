import { CubeLayout } from '@ghcloud/cube-app-design'
import { Breadcrumb, BreadcrumbItem, Card, TypographyText } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Batch-1 S07：演示 CubeLayout header 区静态面包屑导航。
 */
export const ShowcaseSceneS07 = defineComponent({
  name: 'ShowcaseSceneS07',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS07Title: 'Showcase · S07',
        breadcrumbTemplate: '模板',
        breadcrumbShowcase: 'Showcase',
        breadcrumbS07: 'S07',
        cardTitle: 'S07 · 面包屑',
        cardDescription: 'Header 区域为静态 Breadcrumb 路径，无路由联动。',
      },
      'en-US': {
        showcaseSceneS07Title: 'Showcase · S07',
        breadcrumbTemplate: 'Template',
        breadcrumbShowcase: 'Showcase',
        breadcrumbS07: 'S07',
        cardTitle: 'S07 · Breadcrumb',
        cardDescription: 'Header uses a static Breadcrumb trail; not wired to the router.',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-header': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <Breadcrumb>
            <BreadcrumbItem>{t('breadcrumbTemplate')}</BreadcrumbItem>
            <BreadcrumbItem>{t('breadcrumbShowcase')}</BreadcrumbItem>
            <BreadcrumbItem>{t('breadcrumbS07')}</BreadcrumbItem>
          </Breadcrumb>
        </div>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('cardTitle')}>
          <TypographyText type='secondary'>{t('cardDescription')}</TypographyText>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS07Title')} v-slots={slots} showFooter={false} />
    )
  },
})
