import { computed, defineComponent, onMounted, reactive, ref, type Ref } from 'vue'
import { Button, Col, Form, FormItem, Input, Row, Select, Textarea, message, type FormExpose } from '@ghcloud/cube-ui'
import { CubeLayout, InspectItemContentTable, InspectItemModalTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import styles from './inspect-standard-form.module.less'
import type { DefaultOptionType } from 'ant-design-vue/es/select'
import { cubeDailyInspectionService, cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import { InspectBusinessType, type InspectItemVO } from '@ghcloud/cube-daily-inspection-service'
import type { InspectItemContent } from '@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-item-content-table/type'

interface Items {
  imageFlag?: boolean | undefined;
  name?: string | undefined;
  resultId?: string | undefined;
  resultItemValue?: string | undefined;
  itemTag?: string | undefined;
  imageResult?: string | undefined;
  remarkResult?: string | undefined;
  businessType?: InspectBusinessType;
  referType?: InspectBusinessType;
}
export const InspectStandardForm = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const { type, id } = route.query as { type: string; id: string; }

    const inspectItemModalTableRef = ref<{ openModal: (record?: unknown) => void; }>()
    const inspectItemContentTableRef = ref<{ isValid: Ref<boolean>; dataSource: Ref<InspectItemContent[]>; checkData: () => Promise<void>; addContent: () => void; initContent: (data?: unknown) => void; }>()

    const inspectItems = ref<InspectItemContent[]>([])

    const formRenderRef = ref<FormExpose>()
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      remark: string | undefined;
      types: string[] | undefined;
      enable: boolean | undefined;
    }>({
      id: undefined,
      name: undefined,
      remark: undefined,
      types: undefined,
      enable: true,
    })
    const modalRules = {
      name: [{ required: true, message: '请输入标准名称', trigger: 'blur' }],
      types: [{ required: true, message: '请选择关联小散工程', trigger: 'blur' }],
    }
    const projectTypeList = ref<DefaultOptionType[]>([])
    const queryProjectType = async (): Promise<void> => {
      projectTypeList.value = await cubeSmallEngineeringService.getProjectTypeList() as unknown as DefaultOptionType[]
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
            referType: InspectBusinessType.SMALL_ENGINEERING,
          }
        })
        saveLoading.value = true
        const params = {
          name: formState.name,
          remark: formState.remark,
          standardItems: (newResult ?? []) as unknown as Items[],
          enable: formState.enable,
          standardTypeRefers: [
            {
              targetCategory: InspectBusinessType.SMALL_ENGINEERING,
              targetTypes: formState.types
            }
          ],
          businessType: InspectBusinessType.SMALL_ENGINEERING,
        }
        if (type === 'add') {
          await cubeDailyInspectionService.addInspectStandard(params)
        }
        if (type === 'edit') {
          await cubeDailyInspectionService.updateInspectStandard(id, params)
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
    const handleModalEnter = (record: InspectItemVO[]): void => {
      const tableIds = inspectItems.value.map(e => e.id)
      record.forEach(e => {
        if (!tableIds.includes(e.id)) {
          inspectItems.value.push({
            ...(e as unknown as InspectItemContent),
            imageResult: e?.imageResult?.split(',') ?? [],
            remarkResult: e?.remarkResult?.split(',') ?? [],
          })
        }
      })
      inspectItemContentTableRef.value?.initContent(inspectItems.value)
    }
    const getData = async (id: string): Promise<void> => {
      try {
        const res = await cubeDailyInspectionService.getInspectStandardDetail(id, { businessType: InspectBusinessType.SMALL_ENGINEERING })
        if (res) {
          formState.remark = res?.remark
          formState.name = res?.name
          formState.enable = res?.enable
          formState.types = res?.standardTypeRefers?.[0]?.targetTypes
          inspectItems.value = (res?.standardItems ?? [])?.map(e => {
            return {
              ...e,
              imageResult: e?.imageResult ? e?.imageResult?.split(',') : [],
              remarkResult: e?.remarkResult ? e?.remarkResult?.split(',') : [],
            }
          })
        }
      } catch {
      }
    }
    onMounted(() => {
      queryProjectType()
      if (id) {
        getData(id)
      }
    })
    const onCancel = (): void => {
      formRenderRef.value?.resetFields()
      history.back()
    }
    const handleCall = (): void => {
      inspectItemModalTableRef.value?.openModal()
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
            <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: '110px' } }}>
              <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
                <Col xxl={8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label='标准名称' name='name'>
                    <Input v-model:value={formState.name} placeholder='请输入标准名称' />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
                <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label='关联小散工程' name='types'>
                    <Select v-model:value={formState.types} mode='multiple' fieldNames={{ label: 'name', value: 'id' }} options={projectTypeList.value} placeholder='请选择关联小散工程' />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
                <Col xxl={12} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label='标准说明' name='remark'>
                    <Textarea v-model:value={formState.remark} placeholder='请输入标准说明' />
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <div class={styles.title}>巡检项</div>
            <InspectItemContentTable
              ref={inspectItemContentTableRef}
              v-model:value={inspectItems.value}
              businessType={InspectBusinessType.SMALL_ENGINEERING}
              showAdd
              action={type}
            >
              <Button type='primary' onClick={handleCall} class={styles['ml-16']}>调用巡检项</Button>
            </InspectItemContentTable>
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
      <>
        <CubeLayout title={`${title.value}`} v-slots={layoutSlots} />
        <InspectItemModalTable title='调用巡检项' ref={inspectItemModalTableRef} onEnter={handleModalEnter} />
      </>
    )
  }
})
