import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Space, Button, message } from '@ghcloud/cube-ui'
import { cubeParkingLotService } from "@/api/service";
import { useRoute } from 'vue-router'
import styles from './car-management-edit.module.less'
import { BasicInfo } from './components/basic-info'
import { IllegalParkingList } from './components/illegal-parking-list'
import type { FileVOState } from "@ghcloud/cube-protocol";

export const CarManagementEdit = defineComponent({
  setup: () => {
    const route = useRoute()
    const formState = reactive<{
      vehicleNo: string;
      vehicleNoColor: string | undefined;
      customerName: string;
      vehicleTypeCode: string | undefined;
      vehicleTypeName: string;
      customerMobile: string;
      fileList: FileVOState[];
    }>({
      vehicleNo: '',
      vehicleNoColor: undefined,
      customerName: '',
      vehicleTypeCode: undefined,
      vehicleTypeName: '',
      customerMobile: '',
      fileList: []
    })
    const loading = ref(false)
    const basicInfoRef = ref<{ handleSubmit: () => Promise<unknown> }>()

    const title = computed(() => {
      const titleType = {
        info: '车辆详情',
        create: '新增车辆',
        edit: '编辑车辆',
      }
      return titleType[route.query?.type as keyof typeof titleType] || '新增车辆'
    })

    const isInfo = computed(() => route.query?.type === 'info')

    const handleSubmit = async () => {
      try {
        const formData = await basicInfoRef.value?.handleSubmit()
        loading.value = true
        let params: { [key: string]: unknown } = {};
        if (formData) {
          params = { ...formData }
        } else {
          params = {}
        }
        Object.assign(params, {id: route.query?.id as string ?? '' })
        if (!params.id) delete params.id
        await cubeParkingLotService.saveVehicleInfo({...params })
        message.success('保存成功')
        setTimeout(() => {
          history.back()
        }, 500)
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    const getDetails = async () => {
      const id = route.query?.id as string
      if (!id) return
      try {
        const res = await cubeParkingLotService.getVehicleDetail(id)
        Object.assign(formState, res)
        if (res?.fileVOList) formState.fileList = res.fileVOList as unknown as FileVOState[]
      } catch {
      }
    }

    onMounted(() => {
      if (route.query?.id) {
        getDetails()
      }
    })

    const layoutSlots = {
      'layout-content': () => (
        <div class={styles['edit-content']} style={{ overflow: 'hidden' }}>
          <BasicInfo ref={basicInfoRef} initFormState={formState} />
          {isInfo.value && <IllegalParkingList vehicleNo={formState.vehicleNo} />}
        </div>
      ),
      'footer-page': () => (
        <Space>
          <Button onClick={() => history.back()}>返回</Button>
          {!isInfo.value && (
            <Button type='primary' loading={loading.value} onClick={handleSubmit}>
              保存
            </Button>
          )}
        </Space>
      ),
    }

    return () => <CubeLayout title={title.value} v-slots={layoutSlots} showTableXScroll={false} />
  },
})
