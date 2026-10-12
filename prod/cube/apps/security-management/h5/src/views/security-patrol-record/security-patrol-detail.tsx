import { defineComponent, ref } from 'vue'
import styles from './security-patrol-detail.module.less'
import { Empty, showNotify, Skeleton, Step, Steps, Tab, Tabs, Image } from 'vant'
import { showImagePreview } from '@ghcloud/cube-utils'
import { cubeMdataService, cubeSecurityManagementService } from '@/api/server'
import { useRoute } from 'vue-router'
import type { CameraPatrolRecord, CameraPatrolRecordDevice, CameraPatrolRecordDeviceRemark } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 巡逻详情 */
export const SecurityPatrolDetail = defineComponent({
  setup () {
    document.title = '巡逻详情'
    const route = useRoute()
    const { id } = route.query as { id: string; }
    const loading = ref(true)
    const baseInfo = ref<CameraPatrolRecord>()
    const patrolDevices = ref<CameraPatrolRecordDevice[]>([])
    const abnormalList = ref<CameraPatrolRecordDeviceRemark[]>([])
    const session = ref('')
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        await Promise.all([
          cubeSecurityManagementService.getCameraPatrolDetailById(id).then(res => {
            baseInfo.value = res
          }),
          cubeSecurityManagementService.getCameraPatrolRecordDevices(id).then(res => {
            patrolDevices.value = res
          }),
          cubeSecurityManagementService.getCameraPatrolRecordDeviceRemarks(id).then(res => {
            abnormalList.value = res
          }),
          cubeMdataService.getVideoPtzSession().then(res => {
            session.value = res.session
          })
        ])
      } catch {} finally {
        loading.value = false
      }
    }
    getData()

    const imgPreview = async (filePaths: string[]): Promise<void> => {
      if (filePaths) {
        try {
          showImagePreview(filePaths)
        } catch {
          showNotify('图片预览失败')
        }
      }
    }
    return (): JSX.Element=>
      <div class={styles.page}>
        <CubeNavBar showBack title='巡逻详情' />
        <Tabs>
          <Tab title='基础信息'>
            <Skeleton row={6} v-show={loading.value} animated style='width: 100%;' />
            {
              !loading.value &&
                <div class={styles['base-info']}>
                  <div>
                    <span>巡逻时间</span>
                    <span>{baseInfo.value ? dayjs(baseInfo.value.patrolTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                  </div>
                  <div>
                    <span>路线名称</span>
                    <span>{baseInfo.value?.cameraPatrolLineName ?? '--'}</span>
                  </div>
                  <div>
                    <span>巡逻点数</span>
                    <span>{baseInfo.value?.num ?? '--'}</span>
                  </div>
                  <div>
                    <span>巡逻异常</span>
                    <span>{baseInfo.value?.abnormalNum ?? '--'}</span>
                  </div>
                  <div>
                    <span>巡逻人员</span>
                    <span>{baseInfo.value?.userName ?? '--'}</span>
                  </div>
                  <div>
                    <span>任务耗时</span>
                    <span>{baseInfo.value?.duration ?? '--'}</span>
                  </div>
                </div>
            }
          </Tab>
          <Tab title='巡逻记录'>
            <Skeleton row={6} v-show={loading.value} animated style='width: 100%;' />
            {(!loading.value && patrolDevices.value.length === 0) && <Empty description='暂无数据' />}
            <Steps direction='vertical' active='0'>
              {
                patrolDevices.value.map(e => {
                  return (
                    <Step key={e.id}>
                      <div class={styles['patrol-detail-item']}>
                        <h3>{e.deviceName}</h3>
                        <span>{e.status === 'CAMERA_PATROL_COMPLETE' ? '已巡逻' : '未巡逻'}</span>
                      </div>
                    </Step>
                  )
                })
              }
            </Steps>
          </Tab>
          <Tab title='异常情况'>
            <Skeleton row={6} v-show={loading.value} animated style='width: 100%;' />
            {(!loading.value && abnormalList.value.length === 0) && <Empty description='暂无数据' />}
            {
              abnormalList.value.map(e => {
                const imageList = e.filePathList.map(e => e.extranetFilePath ?? '').filter(e => e !== '')
                if (session.value !== '') {
                  imageList.map(e => e += `?session=${session.value}`)
                }
                const imageUrl = imageList.length > 0 ? imageList[0] : ''
                return (
                  <div class={styles['abnormal-item']} key={e.id} onClick={() => {
                    imgPreview(imageList)
                  }}>
                    <Image src={imageUrl} width='20vw' height='20vw' />
                    <div class={styles['abnormal-item-content']}>
                      <p class={styles['abnormal-item-title']}>{e.deviceName}</p>
                      <p class={styles['abnormal-item-remark']}>情况说明：{e.remark ?? '--'}</p>
                    </div>
                  </div>
                )
              })
            }
          </Tab>
        </Tabs>
      </div>
  }
})
