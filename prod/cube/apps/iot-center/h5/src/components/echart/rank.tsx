import { defineComponent, type PropType } from 'vue'
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
    }
  },
  setup (props) {
    return (): JSX.Element =>
      <div class={styles.table}>
        <table>
          <thead style={props.headStyle}>
            <tr>
              {props.head.map(x =>
                <th key={x.key}>{x.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {props.data.map((item, index) =>
              <tr key={index}>
                {props.head.map(x =>
                  <td key={x.key}>
                    <div
                      style={{
                        // width: `${x.key === 'rank' ? '22px' : '105px'}`,
                        height: '22px', 
                        borderRadius: '50%',
                        width: `${x.key === 'rank' ? '100%' : '100%'}`,
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
