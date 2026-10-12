import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui'
import style from '@/assets/style.module.less'
import { VerticalLine } from '@ghcloud/generic-component'
import { cubeDictionaryService } from '@/api/service'
import type { OfflineService } from '@ghcloud/cube-operating-room-service'
import { OperateRoomDictionaryKey } from '@/api/dictionary-key'

/** 离线设置 */
export const ServiceSet = defineComponent({
  setup: () => {
    const goBack = (): void => {
      history.back()
    }
    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '工控机地址', key: 'ipcUrl', componentName: 'TextareaInput', required: true, width: 50, componentProps: { maxlength: 500 } },
        { title: '账号', key: 'ipcAccount', componentName: 'TextInput', required: true, width: 50, componentProps: { maxlength: 200 } },
        { title: '密码', key: 'ipcPassword', componentName: 'PasswordInput', required: true, width: 50, componentProps: { maxlength: 200 } },

        { title: 'IOT平台', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: 'IOT平台' }, removeLabel: true },

        { title: 'IOT平台地址', key: 'iotUrl', componentName: 'TextareaInput', required: true, width: 50, componentProps: { maxlength: 500 } },
        { title: '账号', key: 'iotAccount', componentName: 'TextInput', required: true, width: 50, componentProps: { maxlength: 200 } },
        { title: '密码', key: 'iotPassword', componentName: 'PasswordInput', required: true, width: 50, componentProps: { maxlength: 200 } },
      ]
      return res
    })

    const formData = ref<OfflineService>({
      ipcUrl: null,
      ipcAccount: null,
      ipcPassword: null,
      iotUrl: null,
      iotAccount: null,
      iotPassword: null,
    })

    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params = JSON.stringify(formData.value)

        if (!id.value) {
          await cubeDictionaryService.addDataDictionary({
            itemCode: OperateRoomDictionaryKey.OPERATING_OFFLINE_SERVICE_SET,
            name: '离线设置',
            variable: params,
          })
        } else {
          await cubeDictionaryService.updateDataDictionary({
            id: id.value,
            itemCode: OperateRoomDictionaryKey.OPERATING_OFFLINE_SERVICE_SET,
            variable: params,
            name: dictionaryInfo.value.name,
            code: dictionaryInfo.value.code,
            remarks: dictionaryInfo.value.remarks,
            version: dictionaryInfo.value.version,
          })
        }
        message.success('操作成功')
        getInfo()
      } catch {
      } finally {
        saveLoading.value = false
      }
    }
    const id = ref('')
    const dictionaryInfo = ref()

    const getInfo = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({ itemCode: OperateRoomDictionaryKey.OPERATING_OFFLINE_SERVICE_SET })
      if (res.length > 0) {
        const data = res[0]
        id.value = data.id
        formData.value = data.variable && typeof data.variable === 'string' ? JSON.parse(data.variable) : {}
        dictionaryInfo.value = data
      }
    }

    onMounted(async () => {
      getInfo()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <div class={style['attendance-group-form']}>
              <DynamicFormRender
                formOptions={options.value}
                labelWidth='150px'
                v-model:formData={formData.value}
                ref={dynamicFormRenderRef}
                style={{ margin: '20px' }}
              />
            </div>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title='离线设置' v-slots={layoutSlots} />
  }
})
