import { defineComponent, reactive, onMounted } from 'vue'
import moment from 'moment'
import { loginSession } from '@/api/mdata'
import { getAlarmRecordId, alarmEventOperates } from '@/api/alarm'
import { getVideoFilePaths } from '@/api/linkage'
import { cubeOuaaService } from '@/api/service'
// TODO Zee(tsx 重构)
import AlarmData from '@/components/alarm-chart-components/alarm-data.vue'
import styles from './alarm-info.module.less'
import { message, ImagePreviewGroup, Image } from 'ant-design-vue'
import { openUserInfoModal } from '../../../user-modal/user-modal'
import { closeAllModal } from '../../../base-modal/modal-state'
import { openAlarmDetailModal } from '../../alarm-detail-modal'
import { openDeviceModal } from '../../../device-modal/device-modal'
import { eventInstance } from '@/pages/event/event'

export const AlarmInfo = defineComponent({
  props: {
    alarmData: {
      type: Object,
      default: {},
    }
  },
  setup (props) {
    const serveIp = window.location.protocol
    const state = reactive<any>({
      session: '',
      form: {
        handlerFileVOS: [],
      },
      handelStatusDetail: {},
      videoList: [],
      imageList: [],
    })

    const getData = async (): Promise<void> => {
      getAlarmRecordId({ id: props.alarmData.id }).then((res) => {
        state.form = {
          ...res,
          alarmTime: moment(res.alarmTime).format('YYYY-MM-DD HH:mm:ss'),
          alarmConfirmedTime: res.alarmConfirmedTime
            ? moment(res.alarmConfirmedTime).format('YYYY-MM-DD HH:mm:ss')
            : '--',
        }
        getVideoFilePathsHand(res.businessKey)
      })
    }

    function reopenAlarmModal (): void {
      openAlarmDetailModal({
        title: props.alarmData.alarmEventName,
        alarmData: props.alarmData
      })
    }

    const handleClickUser = async (userId: string): Promise<void> => {
      if (!userId) {
        message.error('人员ID异常')
        return
      }
      const result = await cubeOuaaService.getPersonInfo(userId)
      closeAllModal()
      openUserInfoModal({
        userInfo: result,
        onClose: reopenAlarmModal
      })
    }

    const getVideoFilePathsHand = (businessKey: string): void => {
      getVideoFilePaths(businessKey).then((res) => {
        state.imageList = res.filter((item) => item.type === 'PHOTOGRAPH')
        state.videoList = res.filter((item) => item.type === 'VIDEOTAPE')
      })
    }

    const getAlarmEventOperates = (): void => {
      alarmEventOperates({ id: props.alarmData.id }).then((res) => {
        const result = res.find((item) => item.alarmStatusEvent === 'PROCESSED')
        if (result) {
          const videoList = result.operationParam.fileVOS.filter(
            (item) => item.type === 'mp4' || item.type === 'AVI' || item.type === 'MKV'
          )
          const imageList = result.operationParam.fileVOS.filter(
            (item) => item.type !== 'mp4' && item.type !== 'AVI' && item.type !== 'MKV'
          )
          state.handelStatusDetail = { ...result, videoList, imageList }
        }
      })
    }

    const getSessionData = async (): Promise<void> => {
      const res = await loginSession()
      state.session = res ? res.session : null
    }

    const toDeviceInfo = (): void => {
      closeAllModal()
      openDeviceModal({
        title: state.form?.alarmTargetName,
        deviceId: props.alarmData.alarmTargetKey,
        onClose: reopenAlarmModal
      })
      eventInstance.emitEvent('locateToDevice', props.alarmData)
    }

    onMounted(() => {
      getSessionData()
      getData()
      getAlarmEventOperates()
    })

    return (): JSX.Element => (
      <div class={styles.alarmDetailInfo}>
        <div class={styles.infoItem}>
          <div class={styles.infoItemTitle}>
            <div class={styles.titleIcon} />
            <div class={styles.titleText}>报警信息</div>
          </div>
          <div class={styles.infoItemForm}>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>报警时间:</div>
              <div class={styles.formItemContent}>{state.form?.alarmTime ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>报警设备:</div>
              <div class={styles.formItemContent}>
                <a onClick={toDeviceInfo}>{state.form?.alarmTargetName ?? '--'}</a>
              </div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>报警级别:</div>
              <div class={styles.formItemContent}>{state.form?.alarmLevelName ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>设备事件:</div>
              <div class={styles.formItemContent}>{state.form?.alarmEventName ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>报警区域:</div>
              <div class={styles.formItemContent}>{state.form?.areaName ?? '--'}</div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>状态:</div>
              <div class={styles.formItemContent} style={{ color: '#ff9737' }}>
                {state.form?.alarmStatusName ?? '--'}
              </div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>处理人:</div>
              <div class={styles.formItemContent} style={{ color: '#ff9737' }}>
                {state.form?.alarmHandlerName === '' ? '--' : state.form?.alarmHandlerName}
              </div>
            </div>
            <div class={styles.formItem}>
              <div class={styles.formItemLabel}>报警通知人:</div>
              <div class={styles.formItemContent} style={{ color: '#ff9737', cursor: 'pointer' }}>
                {(state.form.alarmNotifyUsers ?? []).map((item) => (
                  <a onClick={async () => handleClickUser(item.userId)} key={item.id}>
                    {item.userName}
                    {item !== state.form.alarmNotifyUsers[state.form.alarmNotifyUsers.length - 1] ? ',' : ''}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div class={styles.infoItem}>
          <div class={styles.infoItemTitle}>
            <div class={styles.titleIcon} />
            <div class={styles.titleText}>报警快照</div>
          </div>
          <AlarmData alarmInfo={state.form} isSn={false} />
        </div>
        <div class={styles.infoItem}>
          <div class={styles.infoItemTitle}>
            <div class={styles.titleIcon} />
            <div class={styles.titleText}>现场录像</div>
          </div>
          <div class={styles.infoItemForm}>
            {state.videoList.map((item) => (
              <div class={styles.formVideo} key={item.id}>
                <video controls style={{ width: '100%', objectFit: 'fill' }}>
                  <source
                    src={
                      serveIp === 'http:'
                        ? `${item.intranetFilePath}?session=${state.session}`
                        : `${item.extranetFilePath}?session=${state.session}`
                    }
                    type='video/mp4'
                  />
                </video>
              </div>
            ))}
            {state.videoList.length === 0 && <div style={{ color: '#fff' }}>无录像</div>}
          </div>
        </div>
        <div class={styles.infoItem}>
          <div class={styles.infoItemTitle}>
            <div class={styles.titleIcon} />
            <div class={styles.titleText}>现场抓拍</div>
          </div>
          <div class={styles.infoItemForm}>
            <ImagePreviewGroup>
              {state.imageList.map((item) => (
                <div class={styles.formVideo} key={item.id}>
                  <Image
                    src={
                      serveIp === 'http'
                        ? `${item.intranetFilePath}?session=${state.session}`
                        : `${item.extranetFilePath}?session=${state.session}`
                    }
                  />
                </div>
              ))}
            </ImagePreviewGroup>
            {state.imageList.length === 0 && <div style={{ color: '#fff' }}>无抓拍</div>}
          </div>
        </div>
      </div>
    )
  }
})
