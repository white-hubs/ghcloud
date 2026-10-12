import { defineComponent } from 'vue'
import styles from './table.module.less'
import { Empty } from 'vant'

interface Props {
  data?: { name: string;num: number; }[];
}

export const Table = defineComponent({
  props: ['data'],
  setup: (props: Props) => {
    return (): JSX.Element=>
      <>
        <div class={styles.header}>
          <div>排名</div>
          <div>处理人</div>
          <div>处理报警数</div>
        </div>
        {
          (!props.data || props.data.length === 0)
            ? <Empty description='暂无数据' />
            : (
              <div class={styles.body}>
                {
                  props.data.map((e, index) => {
                    return (
                      <div class={styles.row} key={e.name}>
                        <div>{index + 1}</div>
                        <div>{e.name}</div>
                        <div>{e.num}</div>
                      </div>
                    )
                  })
                }
              </div>
            )
        }
      </>
  }
})
