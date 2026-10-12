import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import type { LedgerInfo } from '@/types/device-type'
import { AreaTreeSelect } from '@/components/business/area-tree-select/area-tree-select'
import { DeptSelect } from '@/components/business/dept-select/dept-select'
import { DMap } from './components/map'
import { cubeDeviceCenterInternalService, cubeDeviceCenterService, cubeFileService } from '@/api/service'
import dayjs from 'dayjs'
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service'
import { logger } from '@/logger'
import { BindTagTable } from '@/views/device-ledger/components/bind-custom-tag-table'
import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'
import { VerticalLine } from '@ghcloud/generic-component'
import { DeviceSpatialCoordinateBindingInput } from '@/components/business/device-spatial-coordinate-binding-modal/device-spatial-coordinate-binding-input'

interface InfoState {
  deviceId: string ;
  areaIds: string[];
  picture: { id: number | null; }[] | FileState[];
  departmentId?: string | undefined;
  manager: { id: string; name: string; }[];
  managerIds: string[];
  lntAndLat?: string | undefined;
  locationDes?: string | undefined;
  unitPrice?: number | undefined;
  purchaseDate?: string | undefined;
  productionDate?: string | undefined;
  usefulLife?: number | undefined;
  deviceCode?: string | undefined;
  deviceName?: string | undefined;
  deviceTagList?: DeviceTagDetail[];
  spatialCoordinates?: string | undefined;
}

export const DeviceLedgerForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query as { action: string; id: string; }
    const goBack = (): void => {
      history.back()
    }

    /** 标题 */
    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res = '新增台账'
      } else if (action === 'edit') {
        res = '编辑台账'
      }
      return res
    })
    const deviceTagList = ref<DeviceTagDetail[]>([])
    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '设备基本信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '设备基本信息' }, removeLabel: true },
        { title: '三维模型编码', key: 'deviceCode', width: 46, componentName: 'TextInput', readonly: false, required: false },
        { title: '设备名称', key: 'deviceName', width: 46, componentName: 'TextInput', readonly: true, required: false },
        {
          title: '所在区域',
          key: 'areaIds',
          width: 46,
          customComponent: AreaTreeSelect,
          componentProps: { width: '100%' },
          required: false
        },
        {
          title: '安装图片',
          key: 'picture',
          width: 46,
          componentName: 'FileUpload',
          componentProps: {
            sceneCode: GLOBAL_SCENE_CODE.deviceCenter,
            value: formData.picture,
            multiple: false,
            customText: '支持上传图片（.png/.jpeg/.jpg）',
            type: 'picture-card'
          },
          required: false
        },
        { title: '维护部门', key: 'departmentId', width: 46, customComponent: DeptSelect, componentProps: { width: '100%' }, required: false },
        { title: '维护人员', key: 'manager', width: 46, componentName: 'UserPickerInput', required: false, componentProps: { title: '选择设备管理员', placeholder: '选择设备管理员' } },
        {
          title: '设备位置',
          key: 'lntAndLat',
          width: 46,
          customComponent: DMap,
          required: false,
          componentProps: {
            value: formData.lntAndLat,
            address: formData.locationDes,
            isDetail: action === 'detail',
            onAddressName: (val: string): void => {
              formData.locationDes = val
            }
          }
        },
        { title: '详细地址', key: 'locationDes', width: 46, componentName: 'TextareaInput', required: false, componentProps: { maxlength: 200 } },
        {
          title: '空间坐标',
          key: 'spatialCoordinates',
          width: 46,
          customComponent: DeviceSpatialCoordinateBindingInput,
          required: false,
          componentProps: {
            value: formData.spatialCoordinates,
            selectedDevices: selectedDevices.value,
            onUpdateValue: (val: string): void=>{
              formData.spatialCoordinates = val
            },
          },
        },
        { title: '生产日期', key: 'productionDate', width: 46, componentName: 'DateTime', componentProps: { valueFormat: 'YYYY-MM-DD ', placeholder: '请选择生产日期' }, required: false },
        { title: '采购日期', key: 'purchaseDate', width: 46, componentName: 'DateTime', componentProps: { valueFormat: 'YYYY-MM-DD ', placeholder: '请选择采购日期' }, required: false },
        { title: '采购单价（元）', key: 'unitPrice', width: 46, componentName: 'NumberInput', componentProps: { placeholder: '请输入采购单价' }, required: false },
        { title: '使用寿命（月）', key: 'usefulLife', width: 46, componentName: 'NumberInput', componentProps: { placeholder: '请输入使用寿命' }, required: false },

        { title: '设备标签信息', key: 'layoutTitle', customComponent: VerticalLine, componentProps: { title: '设备标签信息' }, removeLabel: true, customClass: 'mt-20' },
        {
          title: '设备标签',
          key: 'deviceTagList',
          width: 92,
          customComponent: BindTagTable,
          required: false,
          componentProps: {
            // bindTagList: formData.lntAndLat,
            isDetail: action === 'detail',
            onChange: (tags: DeviceTagDetail[]): void=> {
              logger.debug(tags, '==== tags')
              deviceTagList.value = tags
            }
          }
        },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })
    const formData = reactive<InfoState>({
      deviceId: id,
      areaIds: [],
      picture: [],
      departmentId: '',
      managerIds: [],
      manager: [],
      lntAndLat: '',
      locationDes: '',
      unitPrice: undefined,
      purchaseDate: '',
      productionDate: '',
      usefulLife: undefined,
      deviceCode: '',
      deviceName: '',
      deviceTagList: []
    })
    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        handleTagModal()
        saveLoading.value = true
        const params = {
          deviceId: id,
          areaIds: formData.areaIds,
          deviceCode: formData.deviceCode,
          departmentId: formData.departmentId,
          managerIds: Array.isArray(formData.manager) ? formData.manager.map((item) => item.id) : formData.managerIds,
          lntAndLat: formData.lntAndLat,
          locationDes: formData.locationDes,
          unitPrice: formData.unitPrice,
          purchaseDate: formData.purchaseDate,
          productionDate: formData.productionDate,
          usefulLife: formData.usefulLife,
          picture: formData.picture.length ? formData.picture[0].id : '',
          spatialCoordinates: formData.spatialCoordinates || undefined
        }
        await cubeDeviceCenterService.updateDeviceInstance(params)
        message.success('操作成功')
        saveLoading.value = false
        history.back()
      } catch {
      } finally {
        saveLoading.value = false
      }
    }
    const handleTagModal = async (): Promise<void> => {
      try {
        await cubeDeviceCenterInternalService.deviceBindCustomerTags({
          deviceId: id,
          tagIds: deviceTagList.value.map((item) => item.id ?? '').filter((item) => item !== '')
        })
        // message.success('设备标签关联成功')
      } catch {
      }
    }

    const state = reactive<{
      baseInfo: LedgerInfo;
      loading: boolean;
    }>({
      baseInfo: {},
      loading: true,
    })
    const selectedDevices = computed(()=>{
      if (state.baseInfo.baseArchivesInfo?.code){
        return [
          {
            id: state.baseInfo.baseArchivesInfo?.id,
            deviceCode: state.baseInfo.baseArchivesInfo?.code,
            deviceName: state.baseInfo.baseArchivesInfo?.name
          }
        ]
      }
      return []
    })
    const getDeviceInfo = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: id })
        state.baseInfo = res as unknown as LedgerInfo
        formData.deviceName = state.baseInfo.baseArchivesInfo?.name
        formData.deviceCode = state.baseInfo.baseArchivesInfo?.code
        formData.manager = state.baseInfo.baseArchivesInfo?.manager ?? []
        formData.departmentId = state.baseInfo.baseArchivesInfo?.department?.id
        formData.areaIds = state.baseInfo.baseArchivesInfo?.area?.pathId.split('-') ?? []
        formData.lntAndLat = state.baseInfo.expandInfo?.lntAndLat
        formData.locationDes = state.baseInfo.expandInfo?.locationDes
        formData.spatialCoordinates = state.baseInfo.expandInfo?.spatialCoordinates
        if (state.baseInfo.expandInfo?.purchaseInfo?.purchaseDate) formData.purchaseDate = dayjs(state.baseInfo.expandInfo?.purchaseInfo?.purchaseDate).format('YYYY-MM-DD')
        formData.unitPrice = state.baseInfo.expandInfo?.purchaseInfo?.unitPrice
        formData.usefulLife = state.baseInfo.expandInfo?.factoryInfo?.usefulLife
        if (state.baseInfo.expandInfo?.factoryInfo?.productionDate) formData.productionDate = dayjs(state.baseInfo.expandInfo?.factoryInfo?.productionDate).format('YYYY-MM-DD')
        if (state.baseInfo.baseArchivesInfo?.picture) {
          const pictureId = Array.isArray(state.baseInfo.baseArchivesInfo?.picture) ? state.baseInfo.baseArchivesInfo?.picture[0].id : state.baseInfo.baseArchivesInfo?.picture
          const fileInfo: FileState = await cubeFileService.getFileInfo(pictureId)
          formData.picture = fileInfo ? [fileInfo] : []
        }
        cubeDeviceCenterInternalService.getDeviceTagDetails(id).then(res => {
          deviceTagList.value = res
          formData.deviceTagList = res
        })
      } catch {

      }
    }
    const init = ref(false)
    onMounted(async () => {
      if (action !== 'add') {
        if (id) {
          dynamicFormRenderRef.value?.formRef.clearValidate()
          await getDeviceInfo()
          init.value = true
        }
      } else {
        init.value = true
      }
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element | void => {
        if (!init.value) {
          return
        }
        return (
          <DynamicFormRender
            formOptions={options.value}
            labelWidth='150px'
            v-model:formData={formData}
            ref={dynamicFormRenderRef}
            style={{ margin: '20px' }}
          />
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
