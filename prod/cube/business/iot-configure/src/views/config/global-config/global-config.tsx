import { defineComponent, reactive, ref, onMounted } from 'vue'
import { Layout } from '@/components/layout/layout'
import './global-config.less'
import { Button, Form, FormItem, InputNumber, Select, message } from '@ghcloud/cube-ui'
import { VerticalLine } from '@/components/vertical-line/vertical-line'
import { getGlobalConfig, saveGlobalConfig } from '@/api/config'

export const GlobalConfig = defineComponent({
  setup: () => {
    const formState = reactive({
      reportStrategy: undefined,
      intervalReportMill: undefined,
      changeUpVal: undefined,
    })
    const escalationOptions = ref([
      { label: '变化上报', value: 'change-up' },
      { label: '定时上报', value: 'period-up' }
    ])
    const loading = ref(false)
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await getGlobalConfig()
        if (res.data) {
          Object.assign(formState, res.data)
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getData()
    })
    const submitLoading = ref(false)
    const save = async (): Promise<void> => {
      try {
        submitLoading.value = true
        await saveGlobalConfig(formState)
        message.success('操作成功')
        getData()
      } catch {
      } finally {
        submitLoading.value = false
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class='configBox'>
              <VerticalLine title='数据上报策略' style='margin-bottom:16px;' />
              <Form layout='inline'>
                <FormItem label='上报方式'>
                  <Select placeholder='请选择上报方式' v-model:value={formState.reportStrategy} style={{ width: '180px' }} options={escalationOptions} />
                </FormItem>
                <FormItem label='间隔时长'>
                  <InputNumber placeholder='请输入间隔时长' addon-after='毫秒' v-model:value={formState.intervalReportMill} />
                </FormItem>
                {
                  formState.reportStrategy === 'change-up' &&
                  <FormItem label='变化值'>
                    <InputNumber placeholder='请输入变化值' precision={9} v-model:value={formState.changeUpVal} />
                  </FormItem>
                }
              </Form>
            </div>
          </>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            <Button>取消</Button>
            <Button class='m10' type='primary' loading={submitLoading.value} onClick={save}>保存</Button>
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title='全局配置' showFooter v-slots={layoutSlots} />
      </>
  }
})
