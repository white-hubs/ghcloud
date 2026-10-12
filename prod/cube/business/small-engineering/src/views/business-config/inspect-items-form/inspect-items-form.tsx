import { computed, defineComponent, onMounted, reactive, ref, type Ref } from 'vue'
import { Button, Col, Form, FormItem, Input, Row, message, type FormExpose } from '@ghcloud/cube-ui'
import { CubeLayout, InspectItemContentTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import styles from './inspect-items-form.module.less'
import { useRoute } from 'vue-router'
import type { InspectItemContent } from '@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-item-content-table/type'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import { cubeDailyInspectionService } from '@/api/server'

interface Items {
  imageFlag?: boolean | undefined;
  name?: string | undefined;
  resultId?: string | undefined;
  resultItemValue?: string | undefined;
  itemTag?: string | undefined;
  imageResult?: string | undefined;
  remarkResult?: string | undefined;
  businessType?: InspectBusinessType;
}
export const InspectItemsForm = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const { type, id } = route.query as { type: string; id: string; }

    const formRenderRef = ref<FormExpose>()
    const inspectItemContentTableRef = ref<{ isValid: Ref<boolean>; dataSource: Ref<InspectItemContent[]>; checkData: () => Promise<void>; addContent: () => void; }>()
    const inspectItems = ref<InspectItemContent[]>([])

    const formState = reactive<{
      id: string | undefined;
      alias: string | undefined;
    }>({
      id: undefined,
      alias: undefined,
    })
    const modalRules = {
      alias: [{ required: true, message: '请输入巡检项名称', trigger: 'blur' }],
    }
    const saveLoading = ref(false)
    const onSubmit = async (): Promise<void> => {
      try {
        if (type === 'detail') {
          onCancel()
          return
        }
        await formRenderRef.value?.validate()
        const result = await inspectItemContentTableRef.value?.checkData() as unknown as Items[]

        const newResult = result?.map(e => {
          return {
            ...e,
            imageResult: Array.isArray(e.imageResult) && e.imageResult?.join(','),
            remarkResult: Array.isArray(e.remarkResult) && e.remarkResult?.join(','),
          }
        })
        saveLoading.value = true
        const params = {
          alias: formState.alias,
          items: newResult as unknown as Items[],
          referType: InspectBusinessType.SMALL_ENGINEERING,
          businessType: InspectBusinessType.SMALL_ENGINEERING,
        }
        if (type === 'add') {
          await cubeDailyInspectionService.addInspectItemTemplate(params)
        }
        if (type === 'edit') {
          await cubeDailyInspectionService.updateInspectItemTemplate(id, params)
        }
        message.success('操作成功')
        setTimeout(() => {
          onCancel()
        }, 500)
      } catch (error) {
        const errorFields = (error as { errorFields: unknown; })?.errorFields
        const showError = !errorFields && !(error instanceof Error && error.message.includes('校验失败'))
        showError && message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        saveLoading.value = false
      }
    }
    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyInspectionService.getInspectItemTemplateDetail(id, { businessType: InspectBusinessType.SMALL_ENGINEERING })
        if (res) {
          formState.alias = res?.alias

          inspectItems.value.push({
            id: res?.id,
            name: res?.name,
            resultId: res?.resultId,
            resultItemValue: res?.resultItemValue,
            imageResult: res?.imageResult ? res?.imageResult?.split(',') : [],
            remarkResult: res?.remarkResult ? res?.remarkResult?.split(',') : [],
            itemTag: res?.itemTag,
            options: (res?.resultVO?.options || [])?.map(e => {
              return {
                itemName: e?.itemName,
                itemValue: e?.itemValue,
                errorFlag: e?.errorFlag
              }
            })
          })
        }
      } catch {
      }
    }
    onMounted(() => {
      if (id) {
        getData(id)
      }
      if (type === 'add') {
        inspectItemContentTableRef.value?.addContent()
      }
    })
    const onCancel = (): void => {
      formRenderRef.value?.resetFields()
      history.back()
    }
    const title = computed(() => {
      const titleMap = new Map([
        ['add', '新增'],
        ['edit', '编辑'],
        ['detail', '详情'],
      ])
      return `${titleMap.get(type) ?? ''}${pageTitle}`
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class={styles['edit-content']}>
            <div class={styles.title}>基础信息</div>
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '100px' } }}>
              <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
                <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label='巡检项名称' name='alias'>
                    <Input v-model:value={formState.alias} placeholder='请输入巡检项名称' />
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div class={styles.title}>巡检项内容</div>
            <InspectItemContentTable
              ref={inspectItemContentTableRef}
              v-model:value={inspectItems.value}
              businessType={InspectBusinessType.SMALL_ENGINEERING}
              action={type}
            />
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
      <CubeLayout title={`${title.value}`} v-slots={layoutSlots} />
    )
  }
})
