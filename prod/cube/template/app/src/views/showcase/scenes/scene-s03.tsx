import { CubeLayout } from '@ghcloud/cube-app-design'
import { Alert, Button, Card } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const ShowcaseSceneS03 = defineComponent({
  name: 'ShowcaseSceneS03',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS03Title: 'Showcase · 场景 S03',
        backToHome: '返回首页',
        cardTitle: '无顶栏布局（showHeader=false）',
        alertMessage: '本场景演示 CubeLayout 在关闭顶栏时的效果。',
        descP1a: '通过将 ',
        descP1b: ' 设为 ',
        descP1c: '，页面不再渲染顶栏区域（含标题竖线与 ',
        descP1d: ' 插槽）。适用于嵌入弹层、全屏内容或自定义顶栏的页面。',
        descP2a: '底栏仍遵循 ',
        descP2b: ' 默认行为（',
        descP2c: ' 默认为 ',
        descP2d: '），可在内容区自行放置说明与操作按钮。',
      },
      'en-US': {
        showcaseSceneS03Title: 'Showcase · Scene S03',
        backToHome: 'Back to home',
        cardTitle: 'No top bar (showHeader=false)',
        alertMessage: 'This scene demonstrates CubeLayout with the top bar turned off.',
        descP1a: 'By setting ',
        descP1b: ' to ',
        descP1c:
          ', the page no longer renders the header area (including the title vertical rule and the ',
        descP1d:
          ' slot). Suitable for embedded layers, fullscreen content, or pages with a custom header.',
        descP2a: 'The footer still follows ',
        descP2b: ' default behavior (',
        descP2c: ' defaults to ',
        descP2d: '); you can place hints and action buttons in the content area.',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Button onClick={() => router.push({ name: 'demo-home' })}>{t('backToHome')}</Button>
          <Card title={t('cardTitle')}>
            <Alert
              type='info'
              showIcon
              message={t('alertMessage')}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p>
                    {t('descP1a')}
                    <code>showHeader</code>
                    {t('descP1b')}
                    <code>false</code>
                    {t('descP1c')}
                    <code>layout-header</code>
                    {t('descP1d')}
                  </p>
                  <p>
                    {t('descP2a')}
                    <code>CubeLayout</code>
                    {t('descP2b')}
                    <code>showFooter</code>
                    {t('descP2c')}
                    <code>true</code>
                    {t('descP2d')}
                  </p>
                </div>
              }
            />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS03Title')} v-slots={slots} showHeader={false} />
    )
  },
})
