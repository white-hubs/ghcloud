import { defineComponent, onMounted, reactive } from 'vue'
import { Row, Col, Spin } from '@ghcloud/cube-ui'
import { GVerticalLine } from '@/components/common/vertical-line'
import { basicInfoState, deviceRuningState } from '../../index-config.tsx'
import './index.less'
import { MeterCharts } from './charts/meter-charts'
import { getDeviceMonitorRuningAttr, getDeviceDetail } from '@/api/device-center'
import { useRoute } from 'vue-router'
export const DeviceInfoTab = defineComponent({
  setup: () => {
    const route = useRoute()
    const state = reactive<{ runingState: Record<string, string>;basicInfo: Record<string, unknown>;loading: boolean; }>({
      runingState: {},
      basicInfo: {},
      loading: true
    })
    const getDeviceRuningData = async (): Promise<void> => {
      const { data } = await getDeviceMonitorRuningAttr(route.params.id as string)
      state.runingState = data
    }
    const getDeviceInfo = async (): Promise<void> => {
      const { data } = await getDeviceDetail(route.params.id as string)
      state.basicInfo = data
    }

    onMounted(async () => {
      try {
        state.loading = true
        await getDeviceRuningData()
        await getDeviceInfo()
      } catch {
      } finally {
        state.loading = false
      }
    })
    return (): JSX.Element => (
      <>
        <Spin spinning={state.loading}>
          <div class='basic-info'>
            <GVerticalLine title='基本信息' />
            <Row style={{ marginTop: '20px', padding: '0 20px' }} gutter={[32, 16]}>
              {basicInfoState.map(item => {
                return (
                  <Col span={item.span} style={{ marginBottom: '10px' }} key={item.field}>
                    <div>
                      <span style={{ marginRight: '10px' }}>{item.label}:</span>
                      <span>{item.render(state.basicInfo[item.field]?.toString() ?? '--')}</span>
                      {item.field === 'status' && <span>{state.runingState.status ? '在线' : '离线'}</span>}
                    </div>
                  </Col>
                )
              })}

            </Row>
          </div>
          {/* 实时运行数据 */}
          <div class='working-data' style={{ marginTop: '20px' }}>
            <GVerticalLine title='实时运行数据' />
            <Row style={{ marginTop: '20px', padding: '0 20px' }} gutter={[32, 16]}>
              {deviceRuningState.map(item => {
                return (
                  <Col span={item.span} style={{ marginBottom: '10px' }} key={item.field}>
                    <div>
                      <span style={{ marginRight: '10px' }}>{item.label}:</span>
                      <span>{item.render(state.runingState[item.field])}</span>
                    </div>
                  </Col>
                )
              })}

            </Row>
          </div>
          <div class='monitoring-data' style={{ marginTop: '20px' }}>
            <GVerticalLine title='钛泡运行实时监测数据' />
            <Row style={{ padding: '0 20px' }}>
              <Col span={12}>
                <div style={{ marginTop: '16px' }}>汰泡温度</div>
                <div style={{ paddingRight: '30px' }}>
                  <div style={{ background: '#fafafa', padding: '30px', marginTop: '20px' }}>
                    <Row>
                      <Col span={12}>
                        <div>
                          <span>初始温度: </span>
                          <span>
                            {state.runingState.oTiBubblesTemperature}℃
                          </span>
                        </div>
                        <div style={{ marginTop: '24px' }}>
                          <span>钛泡低温保护设置: </span>
                          <span>
                            {state.runingState.tiBubblesLower}℃
                          </span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                          <div class='charts'>
                            <MeterCharts value={Number(state.runingState.tiBubblesTemperature)} title='汰泡实时温度' />
                          </div>
                        </div>
                      </Col>
                    </Row>

                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginTop: '16px', paddingLeft: '30px' }}>汰泡水温度</div>
                <div style={{ paddingLeft: '30px' }}>
                  <div style={{ background: '#fafafa', padding: '30px', marginTop: '20px' }}>
                    <Row>
                      <Col span={12}>
                        <div>
                          <span>初始温度: </span>
                          <span>
                            {state.runingState.oWaterTemperature}℃
                          </span>
                        </div>
                        <div style={{ marginTop: '24px' }}>
                          <span>面板目标温度: </span>
                          <span>
                            {state.runingState.controlBoxTemperture}℃
                          </span>
                        </div>

                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                          <div class='charts'>
                            <MeterCharts value={Number(state.runingState.waterTemperature)} title='汰泡内水温度' />
                            {/* <ThermometerCharts value={Number(state.runingState.waterTemperature)} title='汰泡内水温度' /> */}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                </div>
              </Col>
            </Row>
          </div>
        </Spin>

      </>

    )
  }
})
