import { defineComponent } from 'vue'
import type { AnalysisInfo } from '../type'
import type { GradingAlarmIndicatorsData, handlerUser } from '@ghcloud/cube-safety-management-service/src/type'
import style from '../analysis.module.less'
// 在线率
const OnlineRateComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    const data = props.grandson.data as GradingAlarmIndicatorsData
    return (): JSX.Element =>
      <div><span> {props.grandson.name}：</span>设备在线数<span class={style['span-bold']}>{data?.onlineNum}</span>个,设备在线率<span class={style['span-bold']}>{data?.onlineRate}%</span></div>
  }
})

// 健康度
const HealthComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    const data = props.grandson.data as GradingAlarmIndicatorsData
    return (): JSX.Element =>
      <div><span> {props.grandson.name}：</span>设备健康度低于60的<span class={style['span-bold']}>{data?.healthBelowSixtyNumber}</span>个，占总设备的<span class={style['span-bold']}>{data?.healthBelowSixtyRate}%</span></div>
  }
})

// 质保到期率
const ExpirationComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    const data = props.grandson.data as GradingAlarmIndicatorsData
    return (): JSX.Element =>
      <div><span>  {props.grandson.name}：</span>设备到期数<span class={style['span-bold']}>{data?.expireNum}</span>个，到期率<span class={style['span-bold']}>{data?.expireRate}%</span></div>
  }
})

// 处理率
const HandleRateComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    const data = props.grandson.data as GradingAlarmIndicatorsData
    return (): JSX.Element =>
      <div><span>  {props.grandson.name}：</span>总报警数<span class={style['span-bold']}>{data?.totalAlarmNumber}</span>个，已处理<span class={style['span-bold']}>{data?.handlerAlarmNumber}</span>个，处理率<span class={style['span-bold']}>{data?.handlerRate}%</span>
        <br />
        {
          (data?.topHandlerMarkets && data?.topHandlerMarkets.length) ? <> <span>
            报警处理数前{data?.topHandlerMarkets.length}市场为：
            {data.topHandlerMarkets.map((item: handlerUser, key: number)=>{
              return `${item.marketName}(${item.onTimeHandlerRate}%)${data?.topHandlerMarkets && key < data.topHandlerMarkets.length - 1 ? '、' : ''}`;
            })}
          </span> <br /> </> : ''
        }
        {
          (data?.lowHandlerMarkets && data?.lowHandlerMarkets.length) ? <> <span>
            报警处理数后{data?.lowHandlerMarkets.length}市场为：
            {data.lowHandlerMarkets.map((item: handlerUser, key: number)=>{
              return `${item.marketName}(${item.onTimeHandlerRate}%)${data?.lowHandlerMarkets && key < data.lowHandlerMarkets.length - 1 ? '、' : ''}`;
            })}
          </span> <br /></> : ''
        }
        {
          (data?.topHandlerUsers && data?.topHandlerUsers.length) ? <> <span>
            报警处理数前{data?.topHandlerUsers.length}位为：
            {data.topHandlerUsers.map((item: handlerUser, key: number)=>{
              return `${item.userName}(${item.onTimeHandlerRate}%)${data?.topHandlerUsers && key < data.topHandlerUsers.length - 1 ? '、' : ''}`;
            })}
          </span> <br /> </> : ''
        }
        {
          (data?.lowHandlerUsers && data?.lowHandlerUsers.length) ? <> <span>
            报警处理数后{data?.lowHandlerUsers.length}位为：
            {data.lowHandlerUsers.map((item: handlerUser, key: number)=>{
              return `${item.userName}(${item.onTimeHandlerRate}%)${data?.lowHandlerUsers && key < data.lowHandlerUsers.length - 1 ? '、' : ''}`;
            })}
          </span> </> : ''
        }

      </div>
  }
})


// 处理效率
const HandleTimeComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    const data = props.grandson.data as GradingAlarmIndicatorsData
    return (): JSX.Element =>
      <div><span>  {props.grandson.name}：</span>达标处理报警数<span class={style['span-bold']}>{data?.onTimeHandlerNum}</span>，总报警处理数<span class={style['span-bold']}>{data?.totalHandlerNum}</span>，处理效率<span class={style['span-bold']}>{data?.onTimeHandlerRate}%</span>
        <br />
        {
          (data?.topOnTimeHandlerMarkets && data?.topOnTimeHandlerMarkets.length) ? <> <span>
            处理效率前{data?.topOnTimeHandlerMarkets.length}位为：
            {data.topOnTimeHandlerMarkets.map((item: handlerUser, key: number)=>{
              return `${item.marketName}${item.onTimeHandlerRate}%${data?.topOnTimeHandlerMarkets && key < data.topOnTimeHandlerMarkets.length - 1 ? '、' : ''}`;
            })}
          </span> <br /> </> : ''
        }
        {
          (data?.lowOnTimeHandlerMarkets && data?.lowOnTimeHandlerMarkets.length) ? <> <span>
            处理效率后{data?.lowOnTimeHandlerMarkets.length}位为：
            {data.lowOnTimeHandlerMarkets.map((item: handlerUser, key: number)=>{
              return `${item.marketName}${item.onTimeHandlerRate}%${data?.lowOnTimeHandlerMarkets && key < data.lowOnTimeHandlerMarkets.length - 1 ? '、' : ''}`;
            })}
          </span><br /></> : ''
        }
        {
          (data?.topOnTimeHandlerUsers && data?.topOnTimeHandlerUsers.length) ? <> <span>
            处理效率前{data?.topOnTimeHandlerUsers.length}位为：
            {data.topOnTimeHandlerUsers.map((item: handlerUser, key: number)=>{
              return `${item.username}${item.onTimeHandlerRate}%${data?.topOnTimeHandlerUsers && key < data.topOnTimeHandlerUsers.length - 1 ? '、' : ''}`;
            })}
          </span> <br /> </> : ''
        }
        {
          (data?.lowOnTimeHandlerUsers && data?.lowOnTimeHandlerUsers.length) ? <> <span>
            处理效率后{data?.lowOnTimeHandlerUsers.length}位为：
            {data.lowOnTimeHandlerUsers.map((item: handlerUser, key: number)=>{
              return `${item.username}${item.onTimeHandlerRate}%${data?.lowOnTimeHandlerUsers && key < data.lowOnTimeHandlerUsers.length - 1 ? '、' : ''}`;
            })}
          </span></> : ''
        }
      </div>
  }
})

// 分析中及待分析
const BeAnalyzedComponents = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],
  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    return (): JSX.Element =>
      <div><span>  {props.grandson.name}</span></div>
  }
})
export const AnalysisTextComponentsGroup = defineComponent({
  props: ['data', 'childrenItem', 'grandson'],

  setup (props: { data: AnalysisInfo;childrenItem: AnalysisInfo;grandson: AnalysisInfo; }) {
    return (): JSX.Element =>{
      const renderComponent = (): JSX.Element => {
        const type = props.grandson.metric ?? 'Unknown';
        switch (type) {
          case 'HEADQUARTERS_DEVICE_ONLINE_RATE':
            return (
              <OnlineRateComponents
                data={props.data}
                childrenItem={props.childrenItem}
                grandson={props.grandson}
              />
            )

          case 'HEADQUARTERS_DEVICE_HEALTH_LEVEL':
            return (
              <HealthComponents
                data={props.data}
                childrenItem={props.childrenItem}
                grandson={props.grandson}
              />
            )
          case 'HEADQUARTERS_DEVICE_EXPIRATION_RATE':
            return (
              <ExpirationComponents
                data={props.data}
                childrenItem={props.childrenItem}
                grandson={props.grandson}
              />
            )
          case 'HEADQUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_WATER_PRESSURE_ALARM_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_HAND_ALARM_HANDLER_RATE_RANK_METRIC':
          case 'HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_RATE_RANK_METRIC':
          case "HEADQUARTERS_ILLEGAL_PARKING_ALARM_HANDLER_RATE_RANK_METRIC":
          case 'HEADQUARTERS_TRAFFIC_JAM_ALARM_HANDLER_RATE_RANK_METRIC':
            // 电动车
          case 'QUARTERS_ALARM_USER_HANDLER_RATE_RANK_METRIC':
            return (
              <HandleRateComponents
                data={props.data}
                childrenItem={props.childrenItem}
                grandson={props.grandson}
              />
            )
          case 'HEADQUARTERS_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_ONE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_TWO_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_THREE_LEVEL_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_WP_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_MCP_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_FLAME_SMOG_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_ILOR_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
          case 'HEADQUARTERS_TC_ALARM_HANDLER_TIMEOUT_EFFICIENCY':
            return (
              <HandleTimeComponents
                data={props.data}
                childrenItem={props.childrenItem}
                grandson={props.grandson}
              />
            )
            // case 'PROJECT_COMPLETED_RATE':
            //   return (
            //     <LooseHandleRateComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )
            // case 'PROJECT_ACCEPTANCE_RATE':
            //   return (
            //     <LooseWorksRateComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )
            // case 'INSPECT_HANDLE_RATE_RANK_METRIC':
            //   return (
            //     <InspectionHandleRateComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )
            // case 'INSPECT_HANDLE_EFFICIENCY_RANK_METRIC':
            //   return (
            //     <InspectionHandleTimeComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )
            // case 'INSPECT_RECORD_NUM_METRIC':
            //   return (
            //     <InspectionTimeComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )
            // case 'INSPECT_ERROR_RATE':
            //   return (
            //     <InspectionErrorComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )

            // case 'ELECTRON_HANDLE_RATE_RANK_METRIC':
            //   return (
            //     <ElectronicHandleComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )

            // case 'ELECTRON_HANDLE_EFFICIENCY_RANK_METRIC':
            //   return (
            //     <ElectronicTimeComponents
            //       data={props.data}
            //       childrenItem={props.childrenItem}
            //       grandson={props.grandson}
            //     />
            //   )

          // case 'HIDDEN_DANGER_DEAL_RATE_RANK_METRIC':
          // case 'FAULT_ORDER_COMPLETED_RATE_RANK_METRIC':
          //   return (
          //     <DangerAndFaultHandleComponents
          //       data={props.data}
          //       childrenItem={props.childrenItem}
          //       grandson={props.grandson}
          //     />
          //   )
          // case 'HIDDEN_DANGER_DEAL_EFFICIENCY_RANK_METRIC':
          // case 'FAULT_ORDER_COMPLETED_EFFICIENCY_RANK_METRIC':
          //   return (
          //     <DangerAndFaultTimeComponents
          //       data={props.data}
          //       childrenItem={props.childrenItem}
          //       grandson={props.grandson}
          //     />
          //   )
          default:
            return (
              <div>Unknown component type</div>
            )
        }
      }
      const analysisComponent = (): JSX.Element =>{
        return <BeAnalyzedComponents
          data={props.data}
          childrenItem={props.childrenItem}
          grandson={props.grandson}
        />
      }
      return <div class={style["analysis-container"]}>{(props.grandson.analysisStatus === 'Analyzed' || props.grandson.analysisStatus === 'AIAnalyzing') ? renderComponent() : analysisComponent()}</div>
    }

  }
})