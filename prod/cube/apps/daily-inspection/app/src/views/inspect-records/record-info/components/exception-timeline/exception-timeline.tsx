import { defineComponent, type PropType } from 'vue'
import styles from './exception-timeline.module.less'
import { Empty, Image, ImagePreviewGroup } from '@ghcloud/cube-ui'
import { RepairStatusColor, RepairStatusMap, type RecordHandledManuallyPO } from '@ghcloud/cube-daily-inspection-service'
import dayjs from 'dayjs'

export const ExceptionTimeline = defineComponent({
  props: {
    exceptionRecords: {
      type: Array as PropType<RecordHandledManuallyPO[]>,
      default: () => []
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        {props.exceptionRecords.length === 0 &&
          <Empty description='暂无异常处理记录' />}
        <div class={styles['timeline-container']}>
          {props.exceptionRecords.map((record, index) => {
            return (
              <div class={styles['timeline-item']} key={index}>
                <div class={styles['timeline-marker']}>
                  <div class={styles.dot}></div>
                  <div class={styles.line}></div>
                </div>
                <div class={styles['timeline-content']}>
                  <div class={styles['timeline-header']}>
                    <div class={styles.time}>{record?.updateTime ? dayjs(record?.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--'}</div>
                    <div class={styles.handler}>{record?.userName || '--'}</div>
                  </div>
                  <div class={styles['timeline-body']}>
                    <div class={styles['result-item']}>
                      <div><label>处理结果:</label> <span style={{ color: RepairStatusColor.get(record?.repairStatus || '')}}>{record.repairStatus ? RepairStatusMap.get(record.repairStatus) :  '--'}</span></div>
                      <div><label>说明:</label> <span>{record?.content || '--'}</span></div>
                      {!!record.fileList?.length &&
                        <ImagePreviewGroup>
                          {record.fileList.map((file, n) => {
                            return (
                              <Image
                                key={file.id || n}
                                src={file.path}
                                style={{ width: '100px', height: '100px' }}
                                width={100}
                                height={100}
                              />
                            )
                          })}
                        </ImagePreviewGroup>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})