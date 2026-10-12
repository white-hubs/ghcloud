import { CubeLayout } from '@ghcloud/cube-app-design'
import { TabPane, Tabs } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const ShowcaseSceneS05 = defineComponent({
  name: 'ShowcaseSceneS05',
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref('s05-a')

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS05Title: 'Showcase · 场景 S05',
        tabA: '标签 A',
        tabB: '标签 B',
        contentTabA: '标签 A 的内容（S05）。',
        contentTabB: '标签 B 的内容（S05）。',
      },
      'en-US': {
        showcaseSceneS05Title: 'Showcase · Scene S05',
        tabA: 'Tab A',
        tabB: 'Tab B',
        contentTabA: 'Content for tab A (S05).',
        contentTabB: 'Content for tab B (S05).',
      },
    }

    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Tabs v-model:activeKey={activeKey.value}>
          <TabPane key='s05-a' tab={t('tabA')}>
            <p>{t('contentTabA')}</p>
          </TabPane>
          <TabPane key='s05-b' tab={t('tabB')}>
            <p>{t('contentTabB')}</p>
          </TabPane>
        </Tabs>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS05Title')} v-slots={slots} showFooter={false} />
    )
  },
})
