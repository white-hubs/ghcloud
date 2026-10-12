
import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
import { Empty, Icon, Image, showNotify } from 'vant'
import { cubeSmallEngineeringService } from '@/api/server'
import { useRoute } from 'vue-router'
import type { FeedbackDetailRecord, FileVO } from '@ghcloud/cube-small-engineering-service'
import { typeList, imgType, type FileState } from '@/utils'
import { kkFilePreview } from '@ghcloud/cube-utils'
import { showImagePreview } from '@ghcloud/cube-utils'

export const ResultProgress = defineComponent({
  setup: () => {
    const { id } = useRoute().query as { id: string; }
    const state = reactive<{
      dataSource: FeedbackDetailRecord[];
    }>({
      dataSource: []
    })
    const getList = async (): Promise<void> => {
      state.dataSource = await cubeSmallEngineeringService.getFeedbackByScheduleId({
        scheduleId: id,
        feedbackType: 'CHECK_ACCEPT'
      })
    }
    onMounted(() => {
      getList()
    })
    const preview = (item: FileVO, ind: number): void => {
      if (['zip', 'rar'].includes(item.type ?? '')) {
        showNotify({ type: 'warning', message: '暂不支持该文件类型的预览, 请到电脑端查看' })
        return
      }
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item as unknown as FileState)
      } else {
        const imgList = (state.dataSource[ind].problemFileList ?? []).filter(f => imgType.includes(f?.type ?? '')) || []
        showImagePreview(imgList.map(f => {
          return `${f?.path}`
        }))
      }
    }
    const fileSlots = {
      loading: (): JSX.Element => {
        return <Icon name='description-o' size='20' />
      }
    }
    return (): JSX.Element => (
      <div class={styles.processing}>
        {!!state.dataSource.length &&
          state.dataSource.map((item, index) => {
            return (
              <div class={styles.recordItem} key={`${item.id}${item.username}`}>
                <div class={styles.stepIcon} />
                <div class={styles.time}>
                  {item?.feedbackTime ? dayjs(item?.feedbackTime).format('YYYY-MM-DD HH:mm') : '--'}
                </div>
                <div class={styles.result}>
                  <div class={styles.person}>验收人：{item?.username || '--'}</div>
                  <div class={styles.person}>验收部门：{item?.FeedbackDepName || '--'}</div>
                  <div class={styles.person}>验收内容：{item?.description || '--'}</div>
                  <div class={styles.person}>验收结果：{item?.result === 'QUALIFIED' ? '验收合格' : item?.result === 'DISQUALIFICATION' ? '验收不合格' : '--'}
                  </div>
                  <div class={styles.person}>内容：
                    {item?.description || '--'}
                    <div>
                      {
                        item?.problemFileList?.map((e) => {
                          return (
                            <div class={typeList.includes(e.type ?? '') ? '' : styles.imgWarp} key={`${e.path}${e.id}`} onClick={() => {
                              preview(e, index)
                            }}>
                              {
                                typeList.includes(e.type ?? '')
                                  ? (
                                    <div class={styles.imgItem}>
                                      <Image v-slots={fileSlots} class={styles.fileImg} />
                                      <div class={styles.fileName}>{e.name}</div>
                                    </div>
                                  )
                                  : (
                                    <div class={styles.imgItem}>
                                      <Image src={e.path} class={styles.fileImg} />
                                    </div>
                                  )
                              }
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        {!state.dataSource.length && <Empty description='暂无工程结果记录' />}
      </div>
    )
  }
})
