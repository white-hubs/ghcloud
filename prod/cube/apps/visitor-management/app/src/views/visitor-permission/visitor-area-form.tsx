import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import '@/assets/style.less'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import { cubeVisitorManagementService } from '@/api/service'
import { AreaPeriodTable } from './components/area-period-table'
import type { DetailList, DetailListState, TimeListState } from '@ghcloud/cube-visitor-management-service'
import { AreaTreeSelect } from '@/components/area-tree-select/area-tree-select'

interface InfoState {
  areaName?: string;
  id: number | string;
  areaIds: string | string[] | undefined;
  visitDetailList: DetailListState[] | undefined; // 访问时段(日期+时间段)
  visitDates: string[] | undefined; // 日期段
}

export const VisitorAreaForm = defineComponent({
  setup: () => {
    const { action, areaId, id } = useRoute().query as { action: string; areaId: string; id: string; }
    const goBack = (): void => {
      history.back()
    }

    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res = '新增访问区域'
      } else if (action === 'edit') {
        res = '编辑访问区域'
      }
      return res
    })
    const timeTableList = ref<DetailListState[]>([])
    const formData = reactive<InfoState>({
      id,
      visitDetailList: undefined,
      visitDates: undefined,
      areaIds: areaId,
      areaName: ''
    })
    const formRenderRef = ref<FormExpose>()
    const saveLoading = ref(false)

    const checkTimeList = async (): Promise<void> => {
      if (timeTableList.value.length === 0) {
        return Promise.reject(new Error('请添加访问时间设置'))
      }
      return Promise.resolve()
    }
    const modalRules = {
      areaIds: [{ required: true, message: '请选择所在区域', trigger: 'blur' }],
      visitDetailList: [{ required: true, validator: checkTimeList, trigger: 'blur' }],
    }
    const save = async (): Promise<void> => {
      const formVal = { ...formData }
      formRenderRef.value?.validate().then(async () => {
        try {
          saveLoading.value = true
          const params = {
            visitPeriods: '',
            id,
            areaId: formVal.areaIds?.toString() ?? '',
            areaName: formVal.areaName ?? '',
            detailList: timeTableList.value.map(e => {
              return {
                period: `${e.startDateStr},${e.endDateStr}`,

                timeList: e.timeList && (e.timeList as TimeListState[])?.map(t => {

                  return {
                    ...t,
                    timeStr: t.timeStr,
                    nextDayBool: t.nextDayBool,
                    startTimeStr: t.startTimeStr ? t.startTimeStr : t.startTime?.toString() + ':00',
                    endTimeStr: t.endTimeStr ? t.endTimeStr : t.endTime?.toString() + ':59',
                  }
                })
              }
            }) as DetailList[]
          }
          params.visitPeriods = JSON.stringify(params.detailList)
          if (action === 'add') {
            await cubeVisitorManagementService.addLampArea(params)
          } else if (action === 'edit') {
            await cubeVisitorManagementService.updateLampArea({
              ...params,
              areaId
            })
          }
          message.success('操作成功')
          saveLoading.value = false
          history.back()
        } catch (error) {
          message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
        } finally {
          saveLoading.value = false
        }
      })
    }
    const getAreaDetail = async (): Promise<void> => {
      try {
        const res = await cubeVisitorManagementService.getLampAreaDetail({ areaId })
        formData.areaIds = ['string', 'number'].includes(typeof res?.areaId) ? [res?.areaId.toString()] : res?.areaId ?? []
        formData.visitDates = res.visitDates ? JSON.parse(res.visitDates) : [] // 日期
        formData.visitDetailList = res.detailList ?? []
        formData.areaName = res.areaName
        timeTableList.value = res.detailList
      } catch (error) {
        // message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
      }
    }
    const getAreaName = (value: { name: string; id: string; }): void => {
      formData.areaName = value.name
    }
    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (areaId) {
          formRenderRef.value?.resetFields()
          Object.assign(formData, {
            visitPeriods: undefined,
            visitDates: undefined,
            areaIds: undefined,
          })
          await getAreaDetail()
          init.value = true
        }
      } else {
        init.value = true
      }
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | undefined => {
        if (!init.value) {
          return
        }
        return (
          <>
            <div class='mt-20'>
              <Form model={formData} rules={modalRules} ref={formRenderRef} label-col={{ style: { width: '150px' } }}>
                <FormItem label='所在区域' name='areaIds'>
                  <AreaTreeSelect v-model:value={formData.areaIds} onChange={getAreaName} style={{ width: '300px' }} placeholder='请选择所在区域' />
                </FormItem>
                <FormItem label='访问时间设置' name='visitDetailList'>
                  <AreaPeriodTable
                    v-model:value={formData.visitDetailList} onChange={(tableList: DetailListState[]) => {
                      timeTableList.value = tableList
                    }}
                  />
                </FormItem>
              </Form>
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
    return (): JSX.Element=> <Layout title={title.value} v-slots={layoutSlots} />
  }
})
