import { cubeDeviceSuperviseService } from '@/api/service'
import type { AlarmRecordDetail } from '@/types/alarm-type'
import { Form, FormItem, ImagePreviewGroup, Spin, Image } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import dayjs from 'dayjs'
import { defineComponent, onMounted, ref } from 'vue'
import { TabPaneAlarmSnapShot } from './tab-pane-alarm-snapshot'
import { useRoute } from 'vue-router'

interface Props {
  id: string;
  businessKey: string;
  alarmStatus: string;
}
/** 设备报警详情-报警详情 */
export const TabPaneAlarmDetail = defineComponent({
  props: ['id', 'businessKey', 'alarmStatus'],
  setup: (props: Props) => {
    const { tenant } = useRoute().query as { tenant: string; }
    const detailState = ref<AlarmRecordDetail>()
    const spinning = ref<boolean>(false)
    const getDetailData = async (): Promise<void> => {
      spinning.value = true
      try {
        const res = await cubeDeviceSuperviseService.getAlarmRecordDetail(props.id, tenant)
        if (res) {
          const data = res as AlarmRecordDetail
          detailState.value = data
          spinning.value = false
        }
      } catch {
      } finally {
        spinning.value = false
      }
    }
    onMounted(() => {
      getDetailData()
    })

    return (): JSX.Element =>
      <>
        <VerticalLine title='报警信息' />
        <Spin spinning={spinning.value}>
          <Form style={{ margin: '10px 0 0 40px' }}>
            <FormItem label='报警时间' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmTime ? dayjs(detailState.value?.alarmTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
            <FormItem label='报警设备' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmTargetName || '--'}</FormItem>
            <FormItem label='报警级别' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmLevelName || '--'}</FormItem>
            <FormItem label='报警健康值' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmThreshold || '--'}</FormItem>
            <FormItem label='报警区域' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.areaName || '--'}</FormItem>
            <FormItem label='处理人' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmHandlerName || '--'}</FormItem>
            <FormItem label='超时状态' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmHandlerTimeoutStatusName || '--'}</FormItem>
            <FormItem label='处理状态' style='width:33%;display:inline-flex;text-align: left;'>{detailState.value?.alarmStatusName || '--'}</FormItem>
            <FormItem style='width:33%;display:inline-flex;text-align: left;' />
          </Form>
          <TabPaneAlarmSnapShot id={props.id} businessKey={props.businessKey} alarmStatus={props.alarmStatus} />
          {
            detailState.value?.alarmStatus && ['ALARM_SUSPEND', 'ALARM_HANDLER'].includes(detailState.value?.alarmStatus) &&
              <VerticalLine title={detailState.value?.alarmStatus === 'ALARM_SUSPEND'
                ? '报警挂起'
                : detailState.value?.alarmStatus === 'ALARM_HANDLER' ? '处理结果' : ''}
              />
          }
          {
            detailState.value?.alarmStatus === 'ALARM_HANDLER' &&
              <>
                <Form style={{ margin: '10px 0 0 40px' }}>
                  <FormItem label='处理结果' style='width:50%;display:inline-flex'>{detailState.value?.alarmHandlerResultName || '--'}</FormItem>
                  <FormItem label='处理说明' style='width:50%;display:inline-flex'>{detailState.value?.handler?.alarmHandlerResultRemark || '--'}</FormItem>
                  {
                    detailState.value?.handler?.fileVOS?.length > 0 &&
                      <FormItem label='现场图片' style='width:50%;display:inline-flex'>
                        <>
                          <ImagePreviewGroup>
                            {detailState.value?.handler?.fileVOS.map((item: { id?: number; path?: string; }) => {
                              return <Image src={item?.path || ''} width={100} key={item.id || ''} />
                            })}
                          </ImagePreviewGroup>
                        </>
                      </FormItem>
                  }
                  <FormItem label='处理时间' style='width:50%;display:inline-flex'>{detailState.value?.handler?.createTime ? dayjs(detailState.value?.handler?.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                  <FormItem label='处理人员' style='width:50%;display:inline-flex'>{detailState.value?.handler?.createUserName || '--'}</FormItem>
                </Form>
              </>
          }
          {
            detailState.value?.alarmStatus === 'ALARM_SUSPEND' &&
              <>
                <Form style={{ margin: '10px 0 0 40px' }}>
                  <FormItem label='预计处理时间' style='width:50%;display:inline-flex'>{detailState.value?.suspend?.estimatedProcessTime ? dayjs(detailState.value?.suspend?.estimatedProcessTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                  <FormItem label='挂起原因' style='width:50%;display:inline-flex'>{detailState.value?.suspend?.remark || '--'}</FormItem>
                  {
                    detailState.value?.suspend?.fileVOS?.length > 0 &&
                      <FormItem label='现场图片' style='width:50%;display:inline-flex'>
                        <>
                          <ImagePreviewGroup>
                            {detailState.value?.suspend?.fileVOS.map((item: { id?: number; path?: string; }) => {
                              return <Image src={item?.path || ''} width={100} key={item.id || ''} />
                            })}
                          </ImagePreviewGroup>
                        </>
                      </FormItem>
                  }
                  <FormItem label='挂起时间' style='width:50%;display:inline-flex'>{detailState.value?.suspend?.createTime ? dayjs(detailState.value?.suspend?.createTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</FormItem>
                  <FormItem label='操作挂起人员' style='width:50%;display:inline-flex'>{detailState.value?.suspend?.createUserName || '--'}</FormItem>
                </Form>
              </>
          }
        </Spin>
      </>
  }
})
