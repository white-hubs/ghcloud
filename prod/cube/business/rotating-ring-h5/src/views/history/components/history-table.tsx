
import { defineComponent, watch, reactive } from 'vue'
import './history-table.less'
import dayjs from 'dayjs'
import { Line } from '@/components/charts/line'

/** 历史数据列表 */
export const HistoryTable = defineComponent({
  props: {
    historyData: {
      type: Array,
      default: [],
    },
    deviceData: {
      type: Array,
      default: [],
    },
  },
  setup: (props) => {
    const state = reactive<any>({
      historyChangeData: [],
      deviceData: []
    })

    watch(
      () => props.historyData,
      n => {
        Object.assign(state, {
          historyChangeData: Object.values(n),
          deviceData: props.deviceData
        })
      },
      { immediate: true, deep: true },
    )
    return () => (
      <div>
        {
          state.historyChangeData.map((item: any, index: number) => {
            let dataType = ''
            let device : { dataType: string; propName: string; dataConstraint: {value:any;label:string; }[] } = {
              dataType: '',
              propName: '',
              dataConstraint: []
            }
            if(state.deviceData.length > 0) {
              device = state.deviceData.find((d: { propCode: string }) => d.propCode === Object.keys(props.historyData)[index]) ?? state.deviceData[0]
              dataType = device?.dataType
              if(device?.dataConstraint && Array.isArray(item)){
                item.map(e => {
                  const valueTranslate = device?.dataConstraint.find((ele: { value:any })=>ele.value.toString()===e.value.toString())?.label||e.value
                  e.valueTranslate = valueTranslate
                  return e
                })
              }
            }
            return (
              <div>
                {
                  ['string','boolean','enum'].includes(dataType) &&
                  <div class='history-table' key={index}>
                    <div class='title'>
                      {`历史${device?.propName}数据`}
                    </div>

                    <div class='list'>
                      <div class='head'>
                        <span>值</span>
                        <span>更新时间</span>
                      </div>
                      {
                        Array.isArray(item) && item.length > 0
                         ?
                         item.map((t: any, index2: any) => {
                          return (
                            <div class='content' key={index2}>
                              <span>{t.valueTranslate ?? t.value ?? '--'}</span>
                              <span>{t.ts ? dayjs(t.ts).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
                            </div>
                          )
                        })
                        :
                        <div class='no-data'>暂无数据</div>
                      }
                    </div>
                  </div>
                }
              </div>
            )
          })

        }
      </div>
    )
  },
})
