import { WorkSituation } from '@/components/work-situation'
import { defineComponent, watch, type PropType, ref } from 'vue'
import dayjs from 'dayjs'
import { showNotify } from 'vant'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { cubeAlarmSafetyAnalysisService } from '@/api/server'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { goRiskList } from '@/utils'

export const FireWorkState = defineComponent({
  props: {
    period: {
      type: Array as PropType<string[]>,
      default: () => [dayjs().format('YYYY-MM-DD 00:00:00'), dayjs().format('YYYY-MM-DD HH:mm:ss')]
    }
  },
  emits: ['success'],
  setup: (props, { emit, expose }) => {
    const fireSituation = ref([
      {
        title: '消防设备数',
        imgSrc: 'device-num',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '在线设备数',
        imgSrc: 'device-online',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '离线设备数',
        imgSrc: 'device-offline',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '消防设备建档数',
        imgSrc: 'device-put-on-record',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '消防设备到期数',
        imgSrc: 'device-expire',
        value: 0,
        unit: '',
        qoq: 0
      },
    ])
    const getData = async (): Promise<void> => {
      try {
        const res = await cubeAlarmSafetyAnalysisService.safetyAnalysisDeviceStatus({
          period: props.period.join(','),
          applicationCode: ApplicationCode.FIRE
        })
        emit('success')
        fireSituation.value[0].value = res.deviceNum ?? 0
        fireSituation.value[1].value = res.normalNumber ?? 0
        fireSituation.value[2].value = res.offlineNumber ?? 0
        fireSituation.value[3].value = res.putOnRecordNumber ?? 0
        fireSituation.value[4].value = res.expireNumber ?? 0
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    watch(() => props.period, async () => {
      await getData()
    }, { deep: true, immediate: true })
    // 设备跳转
    const clickWorkSituation = (item: { title: string; }): void => {
      if (item.title === '消防设备建档数') {
        goRiskList({ typeCode: 'FIRE_FIGHTING_EQUIPMENT', typeCodeName: '消防设备', period: props.period.join(',') })
      }
      if (['消防设备数', '在线设备数', '离线设备数'].includes(item.title)) {
        const params = {
          applicationCode: ApplicationCode.FIRE,
          status: item.title === '在线设备数' ? '1' : item.title === '离线设备数' ? '0' : '',
        }
        cubeAppService.toMonitorDevicePage(JSON.stringify(params))
      }
    }
    expose({
      getData
    })
    return (): JSX.Element => (
      <WorkSituation onClickItem={clickWorkSituation} dataSource={fireSituation.value} isQOQ={false} title='消防建档情况' />
    )
  }
})
