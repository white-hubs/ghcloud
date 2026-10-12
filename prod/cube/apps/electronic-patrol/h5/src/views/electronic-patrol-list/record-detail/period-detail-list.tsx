import { List, Cell, CellGroup, Empty, Tag, Icon } from 'vant'
import { defineComponent, type PropType } from 'vue'
import styles from './record-detail.module.less'
import dayjs from 'dayjs'
import type { ElectronTaskType } from '@ghcloud/cube-risk-management-service'

/** 巡检档案详情列表页 */
export const PeriodDetailList = defineComponent({
  props: {
    list: {
      type: Array as PropType<ElectronTaskType[]>,
      default: () => {
        return []
      }
    }
  },
  setup: (props) => {
    return (): JSX.Element =>
      <div class={styles['period-detail-list']} style={{ }}>
        <List
          style={{ height: '54vh', overflow: 'auto' }}
          finished-text={props.list.length === 0 ? '' : '暂无更多数据'}
        >
          <CellGroup>
            {
              props.list && props.list.length > 0 &&
              props.list.map((item, index) => {
                return (
                  <div class={styles['period-cell-item']} key={item.id} style={{ display: 'flex' }}>
                    <div class={styles.dot}>
                      <Icon name='checked' color={`${item.patrolResult !== 'NORMAL' ? '#FF4158' : '#6AB539'}`} />
                      {index !== props.list.length - 1
                        ? <span style={{
                          content: ' ',
                          display: 'block',
                          marginTop: '2px',
                          marginLeft: '7px',
                          width: '10px',
                          height: '65px',
                          borderLeft: '2px dotted #D0D0D0'
                        }}
                        />
                        : null}
                    </div>
                    <Cell>
                      <div>
                        <div class={styles['cell-title']}>
                          <div class={styles['name-status']}>
                            <span class={styles.name}>{item.locationName}</span>
                            <Tag color={item.patrolResult === 'NORMAL' ? '#EFFFE5' : '#ffe1e1'} text-color={item.patrolResult === 'NORMAL' ? '#6AB539' : '#FF4158'}>{item.patrolResult === 'NORMAL' ? '正常' : '异常'}</Tag>
                          </div>
                        </div>
                        <div class={styles['detail-cell-item']}>
                          <span>{item?.arae?.map((x: { name: string; }) => x.name).join('/') ?? ''}</span>
                        </div>
                        <div class={styles['detail-cell-item']}>
                          <span>{item.patrolDate ? dayjs(item.patrolDate).format('YYYY-MM-DD HH:mm') : '--'}</span>
                        </div>
                      </div>
                    </Cell>
                  </div>

                )
              })
            }
          </CellGroup>
          {(props.list.length === 0) && <Empty description='暂无数据' />}
        </List>
      </div>
  }
})
