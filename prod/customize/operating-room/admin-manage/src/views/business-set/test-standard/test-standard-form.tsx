import { computed, defineComponent, onMounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { Layout } from '@/components/layout/layout'
import { Button, message, PlusOutlined, Spin } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import style from '@/assets/style.module.less'
import { TargetSetTable } from '@/components/business/target-set-table.tsx/target-set-table'
import { cubeOperatingRoomService } from '@/api/service'
import type { TestStandardVO } from '@ghcloud/cube-operating-room-service'
import type { StandardLeveTab } from '@/types/test-standard-type'

export const TestStandardForm = defineComponent({
  setup () {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res += '新增检测标准'
      } else if (action === 'edit') {
        res += '编辑检测标准'
      } else {
        res += '检测标准详情'
      }
      return res
    })

    const readonly = action === 'detail'

    const targetSetTableRef = ref<{ showModal: () => void; validateForm: () => Promise<void>; isValid: Ref<boolean>; }>()

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '检测依据', key: 'name', componentName: 'TextInput', required: true, componentProps: { maxlength: 50, placeholder: '请输入检测依据名称' } },
      ]
      res.push(
        // 指标设置
        {
          title: '检测指标',
          key: 'layoutTitle',
          customComponent: () => {
            return (
              <>
                <div style={{ display: 'flex' }}>
                  <VerticalLine title='检测指标' />
                  {!readonly && <div style={{ margin: '0 10px' }}>
                    <Button type='primary' onClick={() => targetSetTableRef.value?.showModal()}><PlusOutlined />添加指标</Button>
                  </div>}
                </div>
              </>
            )
          },
          removeLabel: true
        },
      )

      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })

    const formData = ref<TestStandardVO>({
      id: '',
      name: '',
      standards: [],
    })
    const tabValues = ref<StandardLeveTab[]>([])
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()

      await targetSetTableRef.value?.validateForm()
      if (!targetSetTableRef.value?.isValid) return
      try {
        saveLoading.value = true
        const params = {
          id: formData.value.id,
          name: formData.value.name,
          standards: tabValues.value,
        }
        if (action === 'edit') {
          await cubeOperatingRoomService.updateTestStandard(params)
        } else {
          await cubeOperatingRoomService.addTestStandard(params)
        }
        message.success('操作成功')
        history.back()
      } catch {
      } finally {
        saveLoading.value = false
      }
    }
    const refreshLoading = ref(false)
    const { scrollY } = useTableScroll()


    const getTestStandardDetails = async (): Promise<void> => {
      try {
        refreshLoading.value = true
        const res = await cubeOperatingRoomService.getTestStandardDetails(id as string)
        formData.value = res
        mapDataToTabData()
      } catch {
      } finally {
        refreshLoading.value = false
      }
    }

    const mapDataToTabData = (): void => {
      tabValues.value = formData.value.standards.map((item) => {
        return {
          ...item,
          isEditName: false,
          tabIndex: Math.random().toString(36).substring(2, 9),
          properties: item.properties.map((item) => {
            return {
              ...item,
              minValOrigin: item.minVal,
              maxValOrigin: item.maxVal,
              isEdit: false
            }
          }),
        }
      })
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          await getTestStandardDetails()
        }
      }
      init.value = true
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | void => {
        if (!init.value) {
          return
        }
        return (
          <>
            <div class={style['attendance-group-form']}>
              <DynamicFormRender
                formOptions={options.value}
                labelWidth='85px'
                v-model:formData={formData.value}
                ref={dynamicFormRenderRef}
                style={{ margin: '20px 20px 0 20px', width: '500px' }}
              />
              <Spin spinning={refreshLoading.value}>
                <TargetSetTable ref={targetSetTableRef} readonly={readonly} v-model:value={tabValues.value} scrollY={scrollY.value} />
              </Spin>
            </div>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />

  }
})