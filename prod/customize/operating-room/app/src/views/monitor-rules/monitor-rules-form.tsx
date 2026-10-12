import { computed, defineComponent, onBeforeMount, onMounted, ref, type Ref, nextTick } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, SyncOutlined, message, PlusOutlined, Spin } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui'
import style from '@/assets/style.module.less'
import { FileUpload, VerticalLine } from '@ghcloud/generic-component'
import { TargetSetTable } from '@/components/business/target-set-table.tsx/target-set-table'
import { cubeDeviceCenterService, cubeOperatingRoomService } from '@/api/service'
import type { RuleNormParam } from '@ghcloud/cube-operating-room-service/src/types'
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service'
import { DeviceFormItem } from '@/components/business/device-form-item/device-form-item'
import type { NorthProdListDetail } from '@ghcloud/cube-iot-center-service'

interface FormDataState {
  name?: string;
  area?: { value: string; }[] | undefined;
  ruleNormList: RuleNormParam[];
  picUrl: { id: string | number | null; }[] | FileState[];
  file?: string | FileState | undefined;
  deviceList: { deviceName: string; deviceId: string; }[];
  deviceDTO?: { deviceName: string; deviceId: string; }[];
  productId?: string | string[] | undefined;
  device: {
    productId: string | string[] | undefined;
    deviceList: { deviceName: string; deviceId: string; }[];
  };
  areaOptions?: string;
}

export const MonitorRulesForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res += '新增监测规则'
      } else if (action === 'edit') {
        res += '编辑监测规则'
      } else {
        res += '监测规则详情'
      }
      return res
    })
    const refreshLoading = ref(false)
    const handleRefresh = async (): Promise<void> => {
      try {
        refreshLoading.value = true
        if (formData.value.device.productId) {
          const pId = Array.isArray(formData.value.device.productId) ? formData.value.device.productId : [formData.value.device.productId]
          await getIotProductDetail(pId)
        }
        if (id && formDataCache.value.productId === formData.value?.device.productId) {
          await getRuleInfo(id as string, false)
        }
      } catch {
      } finally {
        refreshLoading.value = false
      }
    }


    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        // 基本信息
        { title: '规则名称', key: 'name', componentName: 'TextInput', required: true, width: 50, componentProps: { maxlength: 30, placeholder: '请输入规则名称' } },
        {
          title: '选择手术室',
          key: 'device',
          customComponent: DeviceFormItem,
          componentProps: {
            onProductChange: (value: string[]): void => {
              formData.value.device.productId = value
              if (value) {
                getIotProductDetail(value)
              } else {
                formData.value.ruleNormList = []
              }
              // 编辑时更新值
              if (action !== 'add' && id && formDataCache.value.productId === value) {
                getRuleInfo(id as string, false)
              }
            }
          },
          required: true
        },
        {
          title: '背景图',
          key: 'picUrl',
          customComponent: FileUpload,
          required: false,
          componentProps: {
            sceneCode: GLOBAL_SCENE_CODE.medicalCleanliness,
            value: formData.value.picUrl,
            type: 'picture-card',
            maxNum: 1,
            size: 100 * 1024,
            showtext: true,
            typelist: ['.png', '.jpeg', 'jpg', '.mp4'],
            customText: '支持10M以内png,jpeg,jpg的图片，或者100M以内的mp4视频'
          }
        },
      ]
      res.push(
        // 指标设置
        {
          title: '指标设置',
          key: 'layoutTitle',
          customComponent: () => {
            return (
              <>
                <div style={{ display: 'flex' }}>
                  <VerticalLine title='指标设置' />
                  <div style={{ margin: '0 10px' }}>
                    <Button type='primary' onClick={() => targetSetTableRef.value?.showNormModal()}><PlusOutlined />添加指标</Button>
                  </div>
                  {
                    action !== 'add' && <Button style={{ marginLeft: '10px' }} type='primary' onClick={handleRefresh}><SyncOutlined spin={refreshLoading.value} />刷新</Button>
                  }
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

    const formData = ref<FormDataState>({
      productId: '',
      name: '',
      // area: undefined,
      file: undefined,
      ruleNormList: [],
      picUrl: [],
      deviceList: [],
      device: {
        productId: [],
        deviceList: []
      }
    })
    const formDataCache = ref<FormDataState>({
      name: '',
      file: undefined,
      ruleNormList: [],
      picUrl: [],
      deviceList: [],
      device: {
        productId: [],
        deviceList: []
      }
    })

    const checkDevice = async (rule: unknown, value: {
      productId: string | string[] | undefined;
      deviceList: { deviceName: string; deviceId: string; }[];
    }): Promise<void> => {
      if (!value.productId?.length || value.productId === '') {
        return Promise.reject(new Error('请选择所属产品'))
      }
      if (!value.deviceList.length) {
        return Promise.reject(new Error('请选择手术室设备'))
      }
      return Promise.resolve()
    }
    const customValidatesRules = {
      device: { trigger: 'change', validator: checkDevice, required: true } satisfies RuleObject,
    }

    const targetSetTableRef = ref<{ showNormModal: () => void; validateForm: () => Promise<void>; isValid: Ref<boolean>; }>()
    const areaOptions = ref<{ label: string;value: string; }[]>([])
    const areaChange = (data: { label: string; value: string; }[]): void => {
      areaOptions.value = data
    }
    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()

      await targetSetTableRef.value?.validateForm()
      if (!targetSetTableRef.value?.isValid) return
      try {
        saveLoading.value = true
        const params = {
          name: formData.value.name,
          productId: formData.value.device?.productId ?? '',
          deviceIds: formData.value.device?.deviceList ? formData.value.device?.deviceList.map((e: { deviceId: string; }) => {
            return e.deviceId
          }).join(',') : '',
          file: formData.value.picUrl.length > 0 ? formData.value.picUrl[0].id : undefined,
          ruleNormList: formData.value.ruleNormList ? [...formData.value.ruleNormList] : [],
          areaOptions: JSON.stringify(areaOptions.value ?? '')
        }
        if (params.ruleNormList && params.ruleNormList?.length > 0) {
          params.ruleNormList = params.ruleNormList.map(e => {
            e.display = e.display ? 1 : 0
            return e
          })
        }
        if (formData.value.device?.deviceList && formData.value.device?.deviceList?.length > 50) {
          message.error('监测规则最多关联50个设备')
          return
        }
        if (action === 'add') {
          await cubeOperatingRoomService.addRule(params)
        } else {
          await cubeOperatingRoomService.updateRule({ id: id as unknown as number, ...params })
        }
        message.success('操作成功')
        history.back()
      } catch {
      } finally {
        saveLoading.value = false
      }
    }
    const getRuleInfo = async (id: string, refreshDevice: boolean = true): Promise<void> => {
      const res = await cubeOperatingRoomService.getRuleDetail({ id })
      // 指标数据处理
      const resData = res as FormDataState
      try {
        areaOptions.value = resData?.areaOptions ? JSON.parse(resData?.areaOptions) : []
      } catch {
        areaOptions.value = []
      }
      if (resData.ruleNormList) {
        const addList = formData.value.ruleNormList.filter(e => resData.ruleNormList.findIndex(ele => ele.normCode === e.normCode) === -1)
        resData.ruleNormList = [...resData.ruleNormList, ...(addList || [])]
      }
      if (refreshDevice) {
        formData.value = resData
        formDataCache.value = { ...formData.value }
        formData.value.picUrl = formData.value?.file && typeof formData.value?.file === 'object' ? [formData.value?.file] : []
        formData.value.device = formData.value?.device || {}
        formData.value.device.deviceList = formData.value?.deviceDTO ?? []
        formData.value.device.productId = formData.value?.productId
      } else {
        formData.value.ruleNormList.forEach(rule => {
          resData.ruleNormList.forEach(res => {
            if (rule.normCode === res.normCode) {
              rule.upperLimit = res.upperLimit ?? null
              rule.lowerLimit = res.lowerLimit ?? null
              rule.display = res.display ?? 0
              rule.showArea = res.showArea
              rule.sort = res.sort ?? 0
              rule.unit = rule.unit ?? res.unit ?? ''
              rule.dataType = rule.dataType ?? res.dataType ?? ''
              rule.normName = rule.normName ?? res.normName ?? ''
            }
          })
        })
      }
    }
    // 获取产品对应的属性
    const getIotProductDetail = async (prodIds: string[]): Promise<void> => {
      const result: NorthProdListDetail[] = await cubeDeviceCenterService.getProdListDetail({ prodIds })
      if (result[0].productPropVoList) {
        formData.value.ruleNormList = result[0]?.productPropVoList.map(e => {
          return {
            normName: e.propName,
            normCode: e.propCode,
            display: 0,
            unit: e.unitName,
            dataType: e.dataType,
            upperLimit: null,
            lowerLimit: null,
          }
        })
      }
    }
    const scrollY = ref(0)
    const getTableScrollY = (): void => {
      const formDom = document.querySelector('.operating-room-form')
      const tabsDom = document.querySelector('.operating-room-tabs-nav')
      if (formDom) {
        const formOuterHeight = formDom.clientHeight
        const layoutContent = formDom.parentElement?.parentElement?.clientHeight ?? 0
        const height = layoutContent - formOuterHeight
        if (tabsDom) {
          scrollY.value = height - tabsDom.clientHeight - 100
        } else {
          scrollY.value = height
        }
      }
    }

    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          await getRuleInfo(id as string)
        }
      }
      init.value = true
      nextTick(() => {
        getTableScrollY()
      })
      window.addEventListener('resize', getTableScrollY)
    })
    onBeforeMount(() => {
      window.removeEventListener('resize', getTableScrollY)
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
                customValidatesRules={customValidatesRules}
                labelWidth='150px'
                v-model:formData={formData.value}
                ref={dynamicFormRenderRef}
                style={{ margin: '20px 20px 0 20px' }}
              />
              <Spin spinning={refreshLoading.value}>
                <TargetSetTable ref={targetSetTableRef} v-model:value={formData.value.ruleNormList} prodId={formData.value.device.productId ?? formData.value.productId} areaList={areaOptions.value} onCustomArea={areaChange} scrollY={scrollY.value} />
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
