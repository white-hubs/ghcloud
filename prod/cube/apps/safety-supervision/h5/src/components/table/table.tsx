import { defineComponent, type VNode, type PropType, type CSSProperties } from 'vue'
import styles from './table.module.less'
import { Empty } from 'vant'
/**
 * author:jiangrui
 * table
 * 通用表格组件 若需要新增其他属性等请新增字段
 */
type ColumnsRender = (row: Record<string, string>) => VNode
export interface CloumnsState {
  title: string; // 标题
  dataIndex: string; // 对应索引
  key: string;// 对应索引
  align?: CSSProperties['textAlign']; // 对齐方法
  render?: ColumnsRender; // 自定义渲染方式

}
export const Table = defineComponent({
  props: {
    columns: {
      type: Array as PropType<CloumnsState[]>,
      default: () => []
    },
    dataSource: {
      type: Array as PropType<Record<string, string>[]>,
      default: () => []
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <>
        {props.columns.length !== 0 &&
          <div class={styles.table}>
            <div class={styles['table-head']}>
              {props.columns.map(item => {
                return <div key={item.dataIndex} style={{ textAlign: item.align ?? 'center' }}>{item.title}</div>
              })}
            </div>
            {props.dataSource.length !== 0 &&
              <div class={styles['table-content']}>
                {
                  props.dataSource.map((item, index) => {
                    return (
                      <div class={styles['table-row']} key={index}>
                        {props.columns.map(cloumnItem => {
                          return <div key={cloumnItem.dataIndex} style={{ textAlign: cloumnItem.align ?? 'center' }}>{cloumnItem.render ? cloumnItem.render(item) : item[cloumnItem.key]}</div>
                        })}
                      </div>
                    )
                  })
                }
              </div>}
            {!props.dataSource.length &&
              <>
                <div class={styles['table-empty']}>
                  <Empty description='暂无数据' imageSize={60} />
                </div>

              </>}

          </div>}

      </>
    )
  }
})
