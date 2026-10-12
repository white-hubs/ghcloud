import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Step, Steps, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const MAX_STEP = 2

const sceneMessages = {
  'zh-CN': {
    titleFallback: 'Showcase · S06',
    cardTitle: 'S06 · 分步向导',
    stepFillTitle: '填写',
    stepFillDesc: '基本信息',
    stepConfirmTitle: '确认',
    stepConfirmDesc: '检查内容',
    stepDoneTitle: '完成',
    stepDoneDesc: '结束',
    prev: '上一步',
    next: '下一步',
    reset: '重置',
    resetSuccess: '已重置步骤',
  },
  'en-US': {
    titleFallback: 'Showcase · S06',
    cardTitle: 'S06 · Step wizard',
    stepFillTitle: 'Fill in',
    stepFillDesc: 'Basic information',
    stepConfirmTitle: 'Confirm',
    stepConfirmDesc: 'Review content',
    stepDoneTitle: 'Done',
    stepDoneDesc: 'Finish',
    prev: 'Previous',
    next: 'Next',
    reset: 'Reset',
    resetSuccess: 'Steps have been reset',
  },
} as const

/**
 * Batch-1 S06：演示 CubeLayout 内容区内 Steps 与步骤导航（ref 0–2）。
 */
export const ShowcaseSceneS06 = defineComponent({
  name: 'ShowcaseSceneS06',
  setup: () => {
    const { pageTitle } = usePageName()
    const { t } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const currentStep = ref(0)

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title={t('cardTitle')}>
          <Steps current={currentStep.value} style={{ marginTop: 8 }}>
            <Step title={t('stepFillTitle')} description={t('stepFillDesc')} />
            <Step title={t('stepConfirmTitle')} description={t('stepConfirmDesc')} />
            <Step title={t('stepDoneTitle')} description={t('stepDoneDesc')} />
          </Steps>
          <div style={{ display: 'flex', gap: '12px', marginTop: 24 }}>
            <Button disabled={currentStep.value <= 0} onClick={() => (currentStep.value -= 1)}>
              {t('prev')}
            </Button>
            <Button type='primary' disabled={currentStep.value >= MAX_STEP} onClick={() => (currentStep.value += 1)}>
              {t('next')}
            </Button>
            <Button
              onClick={() => {
                currentStep.value = 0
                message.success(t('resetSuccess'))
              }}
            >
              {t('reset')}
            </Button>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('titleFallback')} v-slots={slots} showFooter={false} />
    )
  },
})
