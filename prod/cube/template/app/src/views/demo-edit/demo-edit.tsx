import { useCubeForm } from '@ghcloud/cube-app-design'
import { TemplateDemoStatus } from '@ghcloud/cube-service-interface/template-demo'
import {
  createTemplateDemo,
  getTemplateDemoDetail,
  updateTemplateDemo,
} from '@ghcloud/cube-services-client/template-demo.client'
import { useAuthRequest } from '@ghcloud/cube-services-client/auth-request'
import { Button, Card, Space, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { STATUS_OPTIONS } from '../demo-list/demo-list.const'

/**
 * 编辑示例。演示：
 * - 根据 `route.query.id` 判断新增/编辑模式
 * - `useCubeForm` schema 式表单
 * - 表单校验（componentProps.rules）
 * - 提交流（`createXxx`/`updateXxx` 二选一）
 */
export const DemoEdit = defineComponent({
  name: 'DemoEdit',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const submitting = ref(false)
    const id = ref<string>((route.query.id ?? '') as string)
    const isEdit = ref<boolean>(Boolean(id.value))

    const schema = [
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: {
          placeholder: '请输入名称',
          maxLength: 50,
        },
        rules: { required: true, message: '请输入名称' },
      },
      {
        component: 'Select',
        fieldName: 'status',
        label: '状态',
        defaultValue: TemplateDemoStatus.Active,
        componentProps: {
          options: STATUS_OPTIONS.filter((item) => item.value !== ''),
        },
        rules: { required: true, message: '请选择状态' },
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        componentProps: {
          placeholder: '选填',
          rows: 3,
          maxLength: 200,
        },
      },
    ]

    const doSubmit = async (values: Record<string, unknown>): Promise<void> => {
      submitting.value = true
      try {
        if (isEdit.value) {
          await useAuthRequest(() => updateTemplateDemo({
            id: id.value,
            name: values.name as string,
            status: values.status as TemplateDemoStatus,
            remark: values.remark as string | undefined,
          }))
          message.success('更新成功')
        } else {
          await useAuthRequest(() => createTemplateDemo({
            name: values.name as string,
            status: values.status as TemplateDemoStatus,
            remark: values.remark as string | undefined,
          }))
          message.success('创建成功')
        }
        void router.push({ name: 'demo-list' })
      } catch (error) {
        message.error((error as Error).message || '提交失败')
      } finally {
        submitting.value = false
      }
    }

    const [CubeForm, formApi] = useCubeForm({
      layout: 'vertical',
      schema,
      showButton: false,
      handleSubmit: (values) => {
        void doSubmit(values)
      },
    })

    onMounted(async () => {
      if (!isEdit.value) {
        return
      }
      const detail = await useAuthRequest(() => getTemplateDemoDetail(id.value))
      if (detail) {
        formApi.setFormValues({
          name: detail.name,
          status: detail.status,
          remark: detail.remark ?? '',
        })
      }
    })

    return (): JSX.Element => (
      <div class='pd-20'>
        <Card title={isEdit.value ? '编辑示例' : '新建示例'}>
          <CubeForm />
          <Space class='mt-20'>
            <Button onClick={() => router.back()}>取消</Button>
            <Button type='primary' loading={submitting.value} onClick={() => formApi.handleSubmit()}>
              保存
            </Button>
          </Space>
        </Card>
      </div>
    )
  },
})
