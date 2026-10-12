import { CubeLayout } from '@ghcloud/cube-app-design'
import { Breadcrumb, BreadcrumbItem, Button, Card, Step, Steps, TabPane, Tabs, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const ShowcaseLayout = defineComponent({
  name: 'ShowcaseLayout',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const currentStep = ref(0)
    const activeTab = ref('1')

    const slots = {
      'layout-header': (): JSX.Element => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: '1 1 auto',
            minWidth: 0,
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Breadcrumb style={{ margin: 0 }}>
            <BreadcrumbItem>{t('showcase.layout.breadcrumbTemplate')}</BreadcrumbItem>
            <BreadcrumbItem>{t('showcase.layout.breadcrumbShowcase')}</BreadcrumbItem>
            <BreadcrumbItem>{t('showcase.layout.breadcrumbLayout')}</BreadcrumbItem>
          </Breadcrumb>
          <Button style={{ flexShrink: 0 }} onClick={() => router.push({ name: 'demo-home' })}>
            返回首页
          </Button>
        </div>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('showcase.layout.cardTitle')}>
          <Tabs v-model:activeKey={activeTab.value}>
            <TabPane key='1' tab={t('showcase.layout.tabWizard')}>
              <Steps current={currentStep.value} style={{ marginTop: 16 }}>
                <Step title='填写' description='基本信息' />
                <Step title='确认' description='检查内容' />
                <Step title='完成' description='mock 提交' />
              </Steps>
              <div style={{ display: 'flex', gap: '12px', marginTop: 24 }}>
                <Button disabled={currentStep.value <= 0} onClick={() => (currentStep.value -= 1)}>
                  上一步
                </Button>
                <Button
                  type='primary'
                  disabled={currentStep.value >= 2}
                  onClick={() => (currentStep.value += 1)}
                >
                  下一步
                </Button>
                <Button
                  onClick={() => {
                    currentStep.value = 0
                    message.success('已重置步骤（mock）')
                  }}
                >
                  重置
                </Button>
              </div>
            </TabPane>
            <TabPane key='2' tab={t('showcase.layout.tabHelp')}>
              <p>{t('showcase.layout.layoutHelpParagraph')}</p>
            </TabPane>
          </Tabs>
        </Card>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 布局'} v-slots={slots} showFooter={false} />
  },
})
