import { defineComponent, onMounted, ref } from 'vue'
import './resources-detail.less'
import { Grid, GridItem, Image, showImagePreview, TextEllipsis } from 'vant'
import { useRoute } from 'vue-router'
import type { ItemDetailsVo } from '@ghcloud/cube-operating-room-service'
import { authStore } from '@/api/auth-store'
import { cubeOperatingRoomService } from '@/api/server'

export const ResourcesDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const deviceDetails = ref<ItemDetailsVo>()
    const getResourceItemDetailList = async (): Promise<void> => {
      const res = await cubeOperatingRoomService.getResourceItemDetailList({
        tenant: authStore.tenant,
        deptId: (route.query as { deptId: string; id: string; }).deptId || '',
        id: (route.query as { deptId: string; id: string; }).id || '',
        pageSize: 1,
        pageNumber: 1
      })
      deviceDetails.value = Array.isArray(res.records) && res.records.length
        ? res.records[0]
        : {
          id: '',
          deviceId: '',
          deviceCode: '',
          deviceName: '',
          machinesId: '',
          machinesCode: '',
          deptId: '',
          deptName: '',
          arguments: '',
          fileIds: '',
          fileList: [],
          itemList: [],
        }
    }
    const viewPicture = (index: number): void => {
      showImagePreview({ images: deviceDetails.value?.fileList.map((e: { path: string; }) => e.path) || [], startPosition: index })
    }
    onMounted(() => {
      document.title = '物品详情'
      getResourceItemDetailList()
    })
    return (): JSX.Element =>
      <div class='resources-list-box'>
        <div class='resources-list-item'>
          <div class='resources-list-item-header'>
            <span class='header-left'>{deviceDetails.value?.deviceName}</span>
          </div>
          {

            deviceDetails.value?.itemList.map(e => {
              return (
                <div key={e.id} class='resources-list-item-content'>
                  <div class='resources-list-item-device-left'>
                    <div class='device-name'>{e.name}</div>
                    <div class='device-type'>厂家名称：{e.manufacturer}</div>

                  </div>
                  <div class='resources-list-item-device-right'>
                    <span class='device-number'>{e.number}</span>
                    <span class='device-unit'>台</span>
                  </div>
                </div>
              )
            })

          }

        </div>
        <div class='crew-info'>
          <div class='crew-info-title'>
            {deviceDetails.value?.machinesCode}
          </div>
          <div class='crew-info-content'>
            <div class='crew-info-content-title'>
              机组铭牌参数：
            </div>
            <TextEllipsis
              class='text-ellipsis'
              rows='5'
              content={deviceDetails.value?.arguments}
              expand-text='查看更多'
              collapse-text='收起'
            />
          </div>
          <div class='crew-info-img'>
            <div class='crew-info-title'>
              机组铭牌附件：
            </div>
            <Grid border={false} column-num={(deviceDetails.value?.fileList && deviceDetails.value?.fileList.length <= 5) ? deviceDetails.value?.fileList.length : 5}>
              {
                deviceDetails.value?.fileList?.map((e, i) => {
                  return (
                    <GridItem key={e.id}>
                      <Image
                        onClick={() => {
                          viewPicture(i)
                        }}
                        src={e.path}
                      />
                    </GridItem>
                  )
                })
              }
            </Grid>
          </div>
        </div>
      </div>
  }
})
