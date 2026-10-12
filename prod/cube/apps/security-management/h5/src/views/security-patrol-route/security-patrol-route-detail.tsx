import { defineComponent, onMounted, ref } from 'vue'
import styles from './security-patrol-route-detail.module.less'
import { Button, Cell, CellGroup, closeToast, Field, Form, Popup, Radio, RadioGroup, showFailToast, showLoadingToast, showNotify, showToast, Image } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { cubeMdataService, cubeSecurityManagementService } from '@/api/server'
import { CameraPatrolResult, CameraPatrolStatus, type CameraPatrolDeviceVO } from '@ghcloud/cube-security-management-service'
import { CubePlayer } from '@ghcloud/cube-player'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

/** 视频巡逻 */
export const SecurityPatrolRouteDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const { id } = route.query
    const router = useRouter()
    const cameraNum = ref(0)
    const loading = ref(false)
    const routeName = ref('')
    const cameraPatrolDeviceVOS = ref<CameraPatrolDeviceVO[]>([])
    const cameraSelect = ref<CameraPatrolDeviceVO>()
    const pageLoadTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const showPop = ref(false)
    const videoAccessMode = ref('H5S')
    const session = ref('')
    const patrolPostData: {
      cameraPatrolLineId: string;
      cameraPatrolLineName: string;
      patrolTime: string;
      completeTime: string;
      deviceModifyParams: {
        /**
         * 巡逻设备区域
         */
        area: string;
        /**
         * 巡逻设备区域名称
         */
        areaNames: string;
        /**
         * 设备编号
         */
        deviceCode: string;
        /**
         * 巡逻设备主键
         */
        deviceId: string;
        /**
         * 设备名称
         */
        deviceName: string;
        /**
         * 巡逻状态描述
         */
        deviceRemarksModifyParams: {
          'sort': string;
          'remark': string;
          'filePathList': string[];
        }[];
        /**
         * 巡逻时间
         */
        patrolTime: string;
        /**
         * 巡逻结果
         */
        result: CameraPatrolResult;
        /**
         * 序号
         */
        sort: number;
        /**
         * 巡逻状态
         */
        status: CameraPatrolStatus;
      }[];
    } = {
      cameraPatrolLineId: '',
      cameraPatrolLineName: '',
      patrolTime: '',
      completeTime: '',
      deviceModifyParams: [],
    }

    const deviceModifyParamsItem = ref<{
      cameraSelect: CameraPatrolDeviceVO | null;
      remark: string;
      filePathList: Record<string, string>[];
    }>({
      cameraSelect: null,
      remark: '',
      filePathList: [],
    })

    const handleShowPop = async (): Promise<void> => {
      deviceModifyParamsItem.value.filePathList.length = 0
      deviceModifyParamsItem.value.remark = ''
      if (cameraSelect.value) {
        deviceModifyParamsItem.value.cameraSelect = cameraSelect.value
      }
      
      // 视频截图
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '视频截图1/3',
      })

      try {
        for (let i = 0; i < 3; i++) {
          if (i > 0) {
            toast.message = `视频截图${i + 1}/3`
          }
          await videoScreenshot()
        }
        closeToast()
      } catch {
        closeToast()
        showNotify('视频截图失败')
      } finally {
        showPop.value = true
      }
    }
    const endPatrol = async (): Promise<void> => {
      patrolPostData.cameraPatrolLineId = id as string
      patrolPostData.cameraPatrolLineName = routeName.value
      patrolPostData.patrolTime = pageLoadTime
      patrolPostData.completeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

      const newArray = cameraPatrolDeviceVOS.value.filter(item => !patrolPostData.deviceModifyParams.some(ele => ele.deviceId === item.deviceId))
      const noPatrolDevice = newArray.map((item, index) => {
        return {
          deviceId: item.deviceId,
          deviceCode: item.deviceCode,
          deviceName: item.deviceName,
          area: item.area,
          areaNames: item.areaNames,
          sort: patrolPostData.deviceModifyParams.length + index + 1,
          patrolTime: '',
          result: CameraPatrolResult.unknown,
          status: CameraPatrolStatus.unknown,
          deviceRemarksModifyParams: [],
        }
      })
      patrolPostData.deviceModifyParams = [
        ...patrolPostData.deviceModifyParams,
        ...noPatrolDevice,
      ]

      try {
        showLoadingToast({
          message: '提交中...',
          forbidClick: true,
          duration: 0,
        })
        await cubeSecurityManagementService.createCameraPatrolRecord(patrolPostData)
        showToast('提交成功')
        router.go(-1)
      } catch {
        closeToast()
        showFailToast('提交失败')
      }
    }

    onMounted(async () => {
      // TODO(zhangzheng) 获取主应用下的config.js 目前没有信息源可以区分用哪种播放器
      fetch(window.location.origin + '/config.js', { method: 'GET' })
        .then(async response => response.text())
        .then(code => {
          // 创建一个新的script元素
          const script = document.createElement('script')
          // 设置script的内容为获取到的代码
          script.textContent = code
          // 将script元素添加到body中
          document.body.appendChild(script)
          if (window.config?.feature && window.config.feature?.videoAccessMode === 'HK') {
            videoAccessMode.value = 'HK'
          } else {
            videoAccessMode.value = 'H5S'
          }
        })

      cubeMdataService.getVideoPtzSession().then(res => {
        session.value = res.session
      })

      try {
        loading.value = true
        showLoadingToast({ message: '加载中...', forbidClick: true })
        await cubeSecurityManagementService.getCameraPatrolLineById(id as string).then(res => {
          cameraNum.value = res.cameraNum
          routeName.value = res.name
          cameraPatrolDeviceVOS.value = res.cameraPatrolDeviceVOS
          if (res.cameraPatrolDeviceVOS.length) {
            cameraSelect.value = res.cameraPatrolDeviceVOS[0]
            changeVideo()
          }
        })
        closeToast()
        loading.value = false
      } catch {
        closeToast()
        showNotify({ type: 'danger', message: '加载失败' })
      }
    })

    /** 截图 */
    async function videoScreenshot (): Promise<void> {
      return new Promise((resolve, reject) => {
        cubeSecurityManagementService.videoScreenshot({deviceId:cameraSelect.value?.deviceId ?? ''}).then(res => {
          
          deviceModifyParamsItem.value.filePathList.push(res)
          setTimeout(() => {
            resolve()
          }, 1000)
        }).catch(error => {
          reject(error)
        })
      })
    }

    /** 切换视频 */
    function changeVideo (): void {
      if (patrolPostData.deviceModifyParams.findIndex(item => (item as { deviceId: string; }).deviceId === cameraSelect.value?.deviceId) === -1) {
        const deviceData = {
          deviceId: cameraSelect.value?.deviceId,
          deviceCode: cameraSelect.value?.deviceCode,
          deviceName: cameraSelect.value?.deviceName,
          area: cameraSelect.value?.area,
          areaNames: cameraSelect.value?.areaNames,
          sort: patrolPostData.deviceModifyParams.length + 1,
          patrolTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          result: 'CAMERA_PATROL_NORMAL', // 巡逻结果 CAMERA_PATROL_ABNORMAL 异常  CAMERA_PATROL_NORMAL 正常 CAMERA_PATROL_UNKNOWN 未知(未巡)
          status: 'CAMERA_PATROL_COMPLETE', // 未巡 CAMERA_PATROL_UNKNOWN CAMERA_PATROL_COMPLETE 已巡
          deviceRemarksModifyParams: []
        }
        patrolPostData.deviceModifyParams.push(deviceData as never)
      }
    }

    /** 异常上报 */
    function submitExplain (): void {
      if (deviceModifyParamsItem.value.remark.trim() === '') {
        showFailToast('请输入情况描述')
        return
      }
      const index = patrolPostData.deviceModifyParams.findIndex(item => (item as { deviceId: string; }).deviceId === cameraSelect.value?.deviceId)
      if (index !== -1) {
        const params = {
          sort: patrolPostData.deviceModifyParams[index].deviceRemarksModifyParams.length + 1,
          remark: deviceModifyParamsItem.value.remark,
          filePathList: JSON.stringify(
            deviceModifyParamsItem.value.filePathList.map(e => {
              return {
                fileId:e.id,
                extranetFilePath: e.previewUrl,
                intranetFilePath: e.previewUrl,
              }
            })
          ),
        }
        patrolPostData.deviceModifyParams[index].deviceRemarksModifyParams.push(params as never)
        patrolPostData.deviceModifyParams[index].result = CameraPatrolResult.abnormal
      }
      showPop.value = false
    }


    return (): JSX.Element=>
      <>
        <CubeNavBar showBack title='路线详情' />
        <div class={styles['security-patrol-route-detail']}>
          {
            !loading.value &&
            <>
              <CellGroup inset>
                <Cell title={routeName.value} value={`巡逻点数：${cameraNum.value}`} />
                <Cell class={styles['camera-preview']}>
                  <CubePlayer
                    deviceId={cameraSelect.value?.deviceId ?? ''}
                  />
                </Cell>
              </CellGroup>

              <RadioGroup style='margin-top:3vw' v-model={cameraSelect.value}>
                <CellGroup inset>
                  {
                    cameraPatrolDeviceVOS.value.map(e => {
                      return (
                        <Cell
                          key={e.id}
                          title={e.deviceName}
                          clickable
                          onClick={() => {
                            cameraSelect.value = e
                            changeVideo()
                          }}
                          v-slots={{
                            'right-icon': () => <Radio name={e} />
                          }}
                        />
                      )
                    })
                  }
                </CellGroup>
              </RadioGroup>

              <div class={styles['btn-group']}>
                <Button size='small' onClick={handleShowPop}>异常上报</Button>
                <Button size='small' type='primary' onClick={endPatrol}>结束巡逻</Button>
              </div>
            </>
          }

          <Popup
            position='bottom'
            style={{ minHeight: '30%' }}
            v-model:show={showPop.value}
          >
            <Form>
              <CellGroup inset>
                <Field
                  modelValue={deviceModifyParamsItem.value.cameraSelect?.deviceName}
                  name='巡逻点'
                  label='巡逻点'
                  readonly
                />
                <Field
                  v-model={deviceModifyParamsItem.value.remark}
                  type='textarea'
                  name='情况说明'
                  label='情况说明'
                  placeholder='请输入描述信息'
                  required
                />
                <Field
                  name='现场情况'
                  label='现场情况'
                  v-slots={{
                    input: () => {
                      if (deviceModifyParamsItem.value.filePathList.length > 0) {
                        return deviceModifyParamsItem.value.filePathList.map((e, i) => {
                          return <Image src={e.previewUrl} key={i} width='20vw' height='20vw' style='margin-right:2vw' />
                        })
                      } 
                      return '暂无视频抓拍'
                    }
                  }}
                />
                <Button type='primary' block onClick={submitExplain} style='margin-bottom:3vw'>提交</Button>
              </CellGroup>
            </Form>
          </Popup>
        </div>
      </>
  }
})
