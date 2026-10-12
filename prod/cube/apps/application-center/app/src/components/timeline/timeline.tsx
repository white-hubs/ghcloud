import { defineComponent, type VNode } from 'vue'
import styles from './timeline.module.less'

export interface TimelineItemData {
  key?: string | number;
  dot?: VNode;
  left?: VNode;
  right?: VNode;
}

export interface TimelineProps {
  items: TimelineItemData[];
  lineColor?: string;
  dotColor?: string;
}

export const Timeline = defineComponent({
  props: {
    items: {
      type: Array as () => TimelineItemData[],
      required: true
    },
    lineColor: {
      type: String,
      default: '#E4E2E2'
    },
    dotColor: {
      type: String,
      default: '#E4E2E2'
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <div class={styles['timeline-wrapper']}>
        {props.items.map((item, index) => {
          const isLast = index === props.items.length - 1

          return (
            <div
              key={item.key || index}
              class={[
                styles['timeline-item'],
                isLast ? styles['timeline-item-last'] : ''
              ]}
            >
              {/* 左侧内容 */}
              <div class={styles['timeline-left']}>
                {item.left}
              </div>

              {/* 时间线段：小圆圈 + 连接线 */}
              <div class={styles['timeline-segment']}>
                {/* 时间线节点（小圆圈） */}
                <div class={styles['timeline-node-wrapper']}>
                  {item.dot || (
                    <div
                      class={styles['timeline-node']}
                      style={{ borderColor: props.dotColor }}
                    ></div>
                  )}
                </div>

                {/* 连接线（只有非末尾项才显示） */}
                {!isLast && (
                  <div
                    class={styles['timeline-line']}
                    style={{ backgroundColor: props.lineColor }}
                  ></div>
                )}
              </div>

              {/* 右侧内容 */}
              <div class={styles['timeline-right']}>
                {item.right}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})