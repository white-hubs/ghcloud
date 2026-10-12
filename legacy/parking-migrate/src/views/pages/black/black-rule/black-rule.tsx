import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Button, Form, FormItem, InputNumber, Select, message, type FormExpose } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import styles from './black-rule.module.less'
import { cubeParkingLotService } from "@/api/service";

/** 黑名单规则 */
export const BlackRule = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()

    const formState = reactive({
      comparisonCondition: undefined,
      thresholdValue: undefined,
      id: undefined,
    })
    const modalRules = {
      comparisonCondition: [{ required: true, message: '请选择比较操作', trigger: 'blur' }],
      thresholdValue: [{ required: true, message: '请输入黑名单违停阀值', trigger: 'blur' }],
    }
    const formRenderRef = ref<FormExpose>()
    const saveLoading = ref(false)
    const onCancel = () => {
      formRenderRef.value?.resetFields()
      history.back()
    }

    const onSubmit = async () => {
      try {
        await formRenderRef.value?.validate()
        saveLoading.value = true
        const params = {
          comparisonCondition: formState.comparisonCondition ?? '',
          thresholdValue: formState.thresholdValue,
          id: formState?.id,
        }
        await cubeParkingLotService.saveBlackConfig(params)
        message.success('操作成功')
      } catch (error) {
        const errorFields = (error as { errorFields: unknown; })?.errorFields
        const showError = !errorFields && !(error instanceof Error && error.message.includes('校验失败'))
        showError && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        saveLoading.value = false
        getData()
      }
    }
    const getData = async () => {
      try {
        const res = await cubeParkingLotService.getBlackConfig()
        Object.assign(formState, res)
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles['edit-content']}>
            {/* <div class={styles.title}>阈值规则</div> */}
            {/* <VerticalLine title='阈值规则' /> */}
            <Form layout="inline" model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px !important' } }}>
              <FormItem label='违停扣分累计' name='comparisonCondition' class={styles.formItem}>
                <Select class={styles.operator} v-model:value={formState.comparisonCondition} placeholder='请选择比较操作' options={[
                  { label: '等于', value: 'eq' },
                  { label: '大于等于', value: 'gte' },
                  { label: '小于等于', value: 'lte' },
                  { label: '大于', value: 'gt' },
                  { label: '小于', value: 'lt' },
                ]} />
              </FormItem>
              <FormItem label='' name='thresholdValue' class={styles.formItem} >
                <InputNumber class={styles.value} v-model:value={formState.thresholdValue} placeholder='请输入黑名单违停阀值' />
              </FormItem>
              <FormItem label='' >
                <span>分，纳入违停黑名单</span>
              </FormItem>
            </Form>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={onCancel}>取消</Button>
            <Button type='primary' loading={saveLoading.value} onClick={onSubmit} class={styles['ml-16']}>保存</Button>
          </>
        )
      },
    }
    return (): JSX.Element => (
      <CubeLayout title={pageTitle} v-slots={layoutSlots} />
    )
  }
})
