import {
  defineComponent,
  reactive,
  onMounted,
  ref,
} from 'vue'
import { cubeDeviceCenterService, cubeVisualizationService } from '@/api/service'
import type { Pagination, ProductIotCategoryTree } from '@ghcloud/cube-iot-center-service'
import { cubeAlarmCenterService } from '@ghcloud/cube-safety-supervision-app/src/api/server'
import { Button, Cascader, Form, FormItem, Select, Tag, Space, Spin } from 'ant-design-vue';
import styles from './nearby-equipment.module.less'
import NoData from "@/components/businessPanel/public/noData.vue";
import { openDeviceModal } from '../../../device-modal/device-modal'
import { closeAllModal } from '../../../base-modal/modal-state'
import { eventInstance } from '@/pages/event/event'
import { openAlarmDetailModal } from '../../alarm-detail-modal'
import type { AlarmNearbyDevice } from '../../../../../../../../../prod/cube/apps/alarm-center/service/src/type'
import { UeClient } from '@ghcloud/cube-visual-sdk'

export const NearbyEquipment = defineComponent({
  props: {
    alarmData: {
      type: Object,
      default: {},
    }
  },
  setup (props) {
    let modelServerUrl = ''
    const loading = ref(true);
    const formState = reactive({
      productCategoryCode: [],
      productId: undefined,
      pageNumber: 1,
      pageSize: 100
    })
    const productCategoryOptions = ref<ProductIotCategoryTree[]>([])
    const productOptions = ref<{ label: string; value: string; }[]>([])
    const filterOption = (input, option): boolean => {
      return (option.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
    const data = ref<(AlarmNearbyDevice & { occlusion?: boolean; })[]>([]);
    const tableHeader = ['设备编号', '设备名称', '所属产品', '产品品类', '设备状态', '直接可视', '操作']
    const recordItem = ref<AlarmNearbyDevice>()
    const tableScroll = ref({
      y: 0
    })
    function reopenAlarmModal (): void {
      openAlarmDetailModal({
        title: props.alarmData.alarmEventName,
        alarmData: props.alarmData
      })
    }
    const toDeviceInfo = (): void => {
      closeAllModal()
      openDeviceModal({
        title: recordItem.value?.name,
        deviceId: recordItem.value?.id,
        onClose: reopenAlarmModal
      })
      eventInstance.emitEvent('locateToDevice', props.alarmData)
    }
    const openDevice = (item): void =>{
      recordItem.value = item
      toDeviceInfo()
    }
    const handleSubmit = async (): Promise<void> => {
      getScrollY()
      try {
        loading.value = true
        const firstPage = await cubeAlarmCenterService.getAlarmRecordDeviceList({
          alarmRecordId: props.alarmData.id,
          pageNumber: formState.pageNumber,
          pageSize: formState.pageSize,
          productId: formState.productId,
          categoryCode: formState.productCategoryCode.length ? formState.productCategoryCode.at(-1) : undefined,
        })
        const queryTask: Promise<Pagination<unknown>>[] = []
        if (firstPage.pages > 1) {
          for (let i = 2; i <= firstPage.pages; i++) {
            queryTask.push(cubeAlarmCenterService.getAlarmRecordDeviceList({
              alarmRecordId: props.alarmData.id,
              pageNumber: i,
              pageSize: formState.pageSize,
              productId: formState.productId,
              categoryCode: formState.productCategoryCode.length ? formState.productCategoryCode.at(-1) : undefined,
            }))
          }
        }
        await Promise.all(queryTask).then(res => {
          data.value.length = 0
          // @ts-ignore
          data.value = [...firstPage.records, ...res.map(e => e.records)]
        })
        modelServerUrl && await queryModelServer()
      } catch {
      } finally {
        loading.value = false
      }
    }
    const queryModelServer = async (): Promise<void> => {
      const ueClient = UeClient.getInstance()
      const res = await ueClient.sendAsync('occlusionDetection', {
        sourceActorId: props.alarmData.alarmTargetCode,
        targetActorIds: data.value.map(item => item.code),
      });
      (res as { occlusion: boolean[]; }).occlusion.forEach((item, i) => {
        data.value[i].occlusion = item
      });
    }
    const handleReset = (): void => {
      formState.productCategoryCode = []
      formState.productId = undefined
      formState.pageNumber = 1
      handleSubmit()
    }
    const getScrollY = (): void => {
      tableScroll.value.y = document.body.clientHeight - 380
    }
    onMounted(async () => {
      getScrollY()
      cubeDeviceCenterService.getIotProductCategoryTree().then((res) => {
        productCategoryOptions.value = res
      })
      cubeDeviceCenterService.getProductListAll().then(res => {
        productOptions.value = res.map(item => {
          return {
            value: item.id ?? '',
            label: item.prodName ?? ''
          }
        })
      })
      const projectList = await cubeVisualizationService.getVisualProjectList()
      if (projectList.length === 0){
        return
      }
      const modalConfigString = await cubeVisualizationService.getModalConfigByProjectId(projectList[0].id)
      const modalConfig = JSON.parse(modalConfigString)
      const modelServer = modalConfig.ue5.modelServer
      if (modelServer.length > 0){
        modelServerUrl = modelServer[0].url
      }
      handleSubmit()
    })

    return (): JSX.Element => (
      <div>
        <Form layout="inline" style={{ margin: '10px 0' }} class={styles['nearby-form']}>
          <FormItem label="产品品类">
            <Cascader
              popupClassName={styles['nearby-product-category']}
              class={styles['nearby-product-category-body']}
              v-model:value={formState.productCategoryCode}
              options={productCategoryOptions.value}
              fieldNames={{ label: 'categoryName', value: 'categoryCodeConcat', children: 'children' }}
              placeholder="请选择"
            />
          </FormItem>
          <FormItem label="所属产品">
            <Select
              v-model:value={formState.productId}
              placeholder="请选择"
              options={productOptions.value}
              showSearch
              style={{ width: '180px' }}
              filterOption={filterOption}
            />
          </FormItem>
          <FormItem>
            <Space>
              <Button type="primary" onClick={handleSubmit}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </FormItem>
        </Form>
        <div class={styles["table_header"]}>
          {tableHeader.map((item, index) =>{
            return <div key={index}>{ item }</div>
          })}
        </div>
        <Spin spinning={loading.value}>
          <div class={styles["table_content"]}>
            {(data.value && data.value.length) ?
              data.value.map((item, index) =>{
                return <div class={styles['content']} key={index}>
                  <div>{item.code ?? '--'}</div>
                  <div>{item.name ?? '--'}</div>
                  <div>{item.productInfo?.name ?? '--'}</div>
                  <div>{item.productInfo.productCategory?.name ?? '--'}</div>
                  <div>{ item.status?.onlineState ? <Tag color="green">在线</Tag> : <Tag color="red">离线</Tag>}</div>
                  <div>{item.occlusion ? <Tag color="red">否</Tag> : <Tag color="blue">是</Tag>}</div>
                  <div style={{ cursor: 'pointer', color: '#2989FF' }} onClick={() => {
                    openDevice(item)
                  }}>详情</div>
                </div>
              })
              : <div class={styles["no-content"]}>
                <NoData />
              </div>}
            {/* </div> */}
          </div>
        </Spin>
      </div>
    )
  }
})
