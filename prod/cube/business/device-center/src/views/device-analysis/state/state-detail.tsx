import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import '@/styles/common.less'
import { LineChart } from './line-chart'
import { cubeDeviceSuperviseService } from '@/api/service'
import { logger } from '@/logger'
/** 设备通知 - 通知列表 */
export const StateDetail = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }
    const stateInfo = reactive<{
      faultNum: number;
      offLineNum: number;
      onlineTime: number;
      alarmNum: number;
    }>({
      faultNum: 0,
      offLineNum: 0,
      onlineTime: 0,
      alarmNum: 0
    })
    const deviceAnalysisList = ref<{
      xData: string[];
      yData: number[];
    }>({
      xData: [],
      yData: []
    })
    const deviceDeterioration = ref<{
      xData: string[];
      yData: number[];
    }>({
      xData: [],
      yData: []
    })
    const getTableData = async (): Promise<void> => {
      const data = await cubeDeviceSuperviseService.deviceWorkStatistics({
        deviceId: id,
        keyword: '',
        productCategoryCode: '',
        pageNumber: 1,
        pageSize: 1,
      })
      Object.assign(stateInfo, (data as { records: unknown[]; }).records[0])
      const deviceAnalysis = await cubeDeviceSuperviseService.getFaultTrend(id)
      logger.info(deviceAnalysis, 222)

      const list = (deviceAnalysis as unknown as {
        months: {
          num: number;
          timeFlag: string;
        }[];
      }).months
      logger.info(list, 111)
      deviceAnalysisList.value.xData = list.map((item) => item.timeFlag)
      deviceAnalysisList.value.yData = list.map((item) => item.num)

      const deviceDeteriorationList = await cubeDeviceSuperviseService.disadvantageAnalysis(id)
      logger.info(deviceDeteriorationList, 2222)
      deviceDeterioration.value.xData = deviceDeteriorationList.map((item) => item.time)
      deviceDeterioration.value.yData = deviceDeteriorationList.map((item) => item.value)
    }
    onMounted(() => {
      getTableData()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element=> {
        return (
          <>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px' }}>
                设备运行状态
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '24%', background: '#fafbfd', height: '90px', padding: '20px' }}>
                  <div style={{ fontSize: '17px', color: '#ccc' }}>正常运行总时间</div>
                  <div style={{ marginTop: '10px', fontSize: '18px' }}>{stateInfo.onlineTime}小时</div>
                </div>
                <div style={{ width: '24%', background: '#fafbfd', height: '90px', padding: '20px' }}>

                  <div style={{ fontSize: '17px', color: '#ccc' }}>故障总次数</div>
                  <div style={{ marginTop: '10px', fontSize: '18px' }}>{stateInfo.faultNum}次</div>
                </div>
                <div style={{ width: '24%', background: '#fafbfd', height: '90px', padding: '20px' }}>

                  <div style={{ fontSize: '17px', color: '#ccc' }}>报警总次数</div>
                  <div style={{ marginTop: '10px', fontSize: '18px' }}>{stateInfo.alarmNum}次</div>
                </div>
                <div style={{ width: '24%', background: '#fafbfd', height: '90px', padding: '20px' }}>

                  <div style={{ fontSize: '17px', color: '#ccc' }}>离线总次数</div>
                  <div style={{ marginTop: '10px', fontSize: '18px' }}>{stateInfo.offLineNum}次</div>
                </div>

              </div>

            </div>
            <div style={{ display: 'flex', marginTop: '10px' }}>

              <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px' }}>设备劣化分析</div>
                <div style={{ height: '340px' }}>
                  <LineChart
                    chartId='lineChart1'
                    areaColor='rgba(24, 144, 255, 0.04)'
                    lineColor='#1890FF'
                    xData={deviceDeterioration.value.xData}
                    yData={deviceDeterioration.value.yData}
                  />
                </div>
              </div>
              <div style={{ width: '50%' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px' }}>设备故障统计</div>
                <div style={{ height: '340px' }}>
                  <LineChart
                    chartId='lineChart2'
                    xData={deviceAnalysisList.value.xData}
                    yData={deviceAnalysisList.value.yData}
                  />
                </div>

                {/* <div style={{ fontWeight: 'bold', fontSize: '16px', padding: '10px' }}>设备故障原因</div>
                <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' /> */}

              </div>

            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element=> {
        return (
          <div>
            <Button
              type='primary' style={{ marginRight: '10px' }} onClick={async () => {
                await cubeDeviceSuperviseService.retestCheck({ deviceInstanceId: id })
                message.success('重新检测成功')
              }}
            >重新检测
            </Button>
            <Button onClick={() => {
              history.back()
            }}>返回</Button>
          </div>
        )
      }

    }
    return (): JSX.Element=>
      <>
        <Layout title='状态分析详情' v-slots={layoutSlots} />

      </>
  }
})
