import { defineComponent, type PropType, type VNode } from 'vue'
import styles from './rank.module.less'
export const Rank = defineComponent({
  props: {
    data: {
      type: Array as PropType<Record<string, string | number | boolean>[]>,
      default: () => {
        return [{ rank: '1', person: '33', time: 'dd' }]
      }
    },
    head: {
      type: Array as PropType<{ title: string; key: string; }[]>,
      default: () => {
        return [{ title: '排名', key: 'rank' }, { title: '处理人', key: 'person' }, { title: '处理耗时(分钟)', key: 'time' }]
      }
    },
    headStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    border: {
      type: Boolean,
      default: false
    },
  },
  setup (props) {
    return (): VNode =>
      <div class={styles.table}>
        <table>
          <thead
            style={{
              ...props.headStyle,
              borderTop: `${props.border ? '1px solid var(--van-primary-color)' : ''}`,
              borderLeft: `${props.border ? '1px solid var(--van-primary-color)' : ''}`,
              borderRight: `${props.border ? '1px solid var(--van-primary-color)' : ''}`
            }}
          >
            <tr>
              {props.head.map(x =>
                <th
                  key={x.key} style={{
                    borderLeft: `${props.border ? '1px solid var(--van-primary-color)' : ''}`,
                    width: `${x.key === 'rank' ? '36px' : '200px'}`,
                  }}
                >{x.title}
                </th>)}
            </tr>
          </thead>
          <tbody>
            {props.data.map((item, index) =>
              <tr key={index}>
                {props.head.map(x =>
                  <td
                    key={x.key} style={{
                      border: `${props.border ? '1px solid var(--van-primary-color)' : ''}`,
                      width: `${x.key === 'rank' ? '36px' : '200px'}`,
                    }}
                  >
                    <div
                      style={{
                        width: `${x.key === 'rank' ? '26px' : '200px'}`,
                        height: '26px',
                        lineHeight: '26px',
                        borderRadius: '50%',
                        color: `${x.key === 'rank' && (index === 0 || index === 1 || index === 2 ? '#ffffff' : '#1F3140')}`,
                        background: `${x.key === 'rank' && (index === 0 ? '#eb383e' : index === 1 ? '#ee8e36' : index === 2 ? '#2e6af2' : 'rgba(0,0,0,0)')}`
                      }}
                    >{item[x.key]}
                    </div>
                  </td>)}
              </tr>)}
          </tbody>
        </table>
      </div>
  }
})
