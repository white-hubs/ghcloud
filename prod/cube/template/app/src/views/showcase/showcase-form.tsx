import { CubeLayout, useCubeForm } from '@ghcloud/cube-app-design'
import { Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const cascaderOptions = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州', children: [{ value: 'xihu', label: '西湖区' }] },
    ],
  },
]

/**
 * useCubeForm 支持的组件类型一览 + 校验（含异步规则演示）。
 */
export const ShowcaseForm = defineComponent({
  name: 'ShowcaseForm',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()

    const schema = [
      {
        component: 'Input',
        fieldName: 'title',
        label: '标题',
        componentProps: { placeholder: '必填', maxLength: 80 },
        rules: { required: true, message: '请输入标题' },
      },
      {
        component: 'InputNumber',
        fieldName: 'count',
        label: '数量',
        defaultValue: 1,
        componentProps: { min: 0, max: 99 },
      },
      {
        component: 'Textarea',
        fieldName: 'desc',
        label: '描述',
        componentProps: { rows: 3, maxLength: 200, placeholder: '多行文本' },
      },
      {
        component: 'Select',
        fieldName: 'city',
        label: '城市',
        defaultValue: 'hz',
        componentProps: {
          options: [
            { label: '杭州', value: 'hz' },
            { label: '上海', value: 'sh' },
          ],
          allowClear: true,
        },
      },
      {
        component: 'RadioGroup',
        fieldName: 'mode',
        label: '模式',
        defaultValue: 'a',
        componentProps: {
          options: [
            { label: '模式 A', value: 'a' },
            { label: '模式 B', value: 'b' },
          ],
        },
      },
      {
        component: 'CheckboxGroup',
        fieldName: 'tags',
        label: '标签',
        defaultValue: [],
        componentProps: {
          options: [
            { label: '重要', value: 'imp' },
            { label: '紧急', value: 'urg' },
          ],
        },
      },
      {
        component: 'Switch',
        fieldName: 'enabled',
        label: '启用',
        defaultValue: true,
      },
      {
        component: 'DatePicker',
        fieldName: 'startDate',
        label: '开始日期',
        componentProps: { valueFormat: 'YYYY-MM-DD' },
      },
      {
        component: 'RangePicker',
        fieldName: 'dateRange',
        label: '日期区间',
        componentProps: { valueFormat: 'YYYY-MM-DD' },
      },
      {
        component: 'Cascader',
        fieldName: 'region',
        label: '地区',
        componentProps: { options: cascaderOptions, placeholder: '请选择' },
      },
      {
        component: 'Input',
        fieldName: 'asyncField',
        label: '异步校验字段',
        componentProps: { placeholder: '输入 ok 通过' },
        rules: {
          validator: (_rule: unknown, value: string): Promise<void> =>
            new Promise((resolve, reject) => {
              window.setTimeout(() => {
                if (value === 'ok') {
                  resolve()
                } else {
                  reject(new Error('请输入 ok'))
                }
              }, 400)
            }),
        },
      },
    ]

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema,
      showButton: false,
      handleSubmit: (values) => {
        message.success(`校验通过，字段数：${Object.keys(values).length}`)
      },
    })

    const handleValidateSubmit = (): void => {
      const p = formApi.formRef.value?.validate()
      if (!p) {
        formApi.handleSubmit()
        return
      }
      p.then(() => {
        formApi.handleSubmit()
      }).catch(() => {
        message.error('请先修正表单错误')
      })
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <Card title={t('showcase.form.cardTitle')}>
          <CubeForm />
          <div class='mt-20' style={{ display: 'flex', gap: '12px' }}>
            <Button type='primary' onClick={handleValidateSubmit}>
              提交（触发表单校验）
            </Button>
            <Button onClick={() => formApi.handleReset()}>重置</Button>
          </div>
        </Card>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · 表单'} v-slots={slots} showFooter={false} />
  },
})
