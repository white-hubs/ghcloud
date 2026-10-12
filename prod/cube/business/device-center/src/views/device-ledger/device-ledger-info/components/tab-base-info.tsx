import { defineComponent, onMounted, reactive } from 'vue'
import { Descriptions, DescriptionsItem, Spin } from '@ghcloud/cube-ui'
import '@/styles/common.less'
import { logger } from '@/logger'
import { baseInfoState } from './base-config'
import { cubeDeviceCenterInternalService, cubeDeviceCenterService, cubeFileService } from '@/api/service'
import type { BaseArchivesInfo, ExpandInfoType, LedgerInfo } from '@/types/device-type'
import type { FileState } from '@ghcloud/cube-file-service'
import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'

export const TabBaseInfo = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  setup (props) {
    const state = reactive<{
      baseInfo: LedgerInfo;
      loading: boolean;
    }>({
      baseInfo: {} satisfies LedgerInfo,
      loading: true
    })

    const getDeviceInfo = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id })
        state.baseInfo = res as unknown as LedgerInfo
        if (state.baseInfo.baseArchivesInfo?.picture) {
          const pictureId = Array.isArray(state.baseInfo.baseArchivesInfo?.picture) ? state.baseInfo.baseArchivesInfo?.picture[0].id : state.baseInfo.baseArchivesInfo?.picture
          cubeFileService.getFileInfo(pictureId).then((res) => {
            const fileInfo: FileState = res
            if (state.baseInfo.baseArchivesInfo) state.baseInfo.baseArchivesInfo.picturePath = fileInfo.path ?? ''
          })
        }
        cubeDeviceCenterInternalService.getDeviceTagDetails(props.id).then((res) => {
          state.baseInfo.deviceTagList = res
        })
      } catch {
      }
    }

    onMounted(async () => {
      try {
        state.loading = true
        await getDeviceInfo()
      } catch (error) {
        logger.error(error)
      } finally {
        state.loading = false
      }
    })
    return (): JSX.Element =>
      <>
        <Spin spinning={state.loading}>
          <Descriptions class='mt-20px'>
            {baseInfoState.map(item => {
              return (
                <DescriptionsItem label={item.label} key={`${item.label}-${item.name}`}>
                  {item.name && item.render(state.baseInfo[item.name] as BaseArchivesInfo & ExpandInfoType & DeviceTagDetail[])}
                </DescriptionsItem>
              )
            })}

          </Descriptions>

        </Spin>
      </>
  }
})
