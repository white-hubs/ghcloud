import { defineComponent, onMounted, ref } from 'vue'
import styles from './broadcast-record.module.less'
import { Cell, CellGroup, List, PullRefresh, showNotify } from 'vant'
import { cubeBroadcastService } from '@/api/server'
import type { BroadcastPlayRecord } from '@ghcloud/cube-broadcast-center-service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const BroadcastRecord = defineComponent({
  setup: () => {
    const loading = ref(false)
    const finished = ref(false)
    const page = {
      pageSize: 20,
      pageNumber: 0
    }
    const msgList = ref<BroadcastPlayRecord[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        page.pageNumber++
        const res = await cubeBroadcastService.getBroadcastPlayRecordPage({
          pageSize: page.pageSize,
          pageNumber: page.pageNumber,
        })
        msgList.value = [...msgList.value, ...res.records]
        if (res.pages <= page.pageNumber || res.records.length === 0) {
          finished.value = true
        }
      } catch {
        showNotify({ type: 'danger', message: '获取广播记录失败' })
      } finally {
        loading.value = false
      }
    }
    const onRefresh = (): void => {
      page.pageNumber = 0
      getData()
    }

    document.title = '广播记录'
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='广播记录' />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class={styles['record-list']}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text='暂无更多数据'
              onLoad={getData}
            >
              {
                msgList.value.map(item => {
                  return (
                    <div class={styles['record-list-item']} key={item.id}>
                      <CellGroup>
                        <Cell title={item.broadcastTemplateName} />
                        <Cell
                          title=''
                          v-slots={{
                            label: () => {
                              return (
                                <>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>操作人员：</span>
                                    <span class={styles.value}>{item.operatorByName}</span>
                                  </div>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>操作部门：</span>
                                    <span class={styles.value}>{item.operatorByDeptName}</span>
                                  </div>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>广播时间：</span>
                                    <span class={styles.value}>{item.broadcastTime}</span>
                                  </div>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>广播终端：</span>
                                    <span class={styles.value}>{item.broadcastPlayDevices}</span>
                                  </div>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>广播次数：</span>
                                    <span class={styles.value}>{item.broadcastPlayNum}</span>
                                  </div>
                                  <div class={styles['record-info-item']}>
                                    <span class={styles.label}>广播内容：</span>
                                    <span class={styles.value}>{item.broadcastPlayContent}</span>
                                  </div>
                                </>
                              )
                            }
                          }}
                        />
                      </CellGroup>
                    </div>
                  )
                })
              }
            </List>
          </div>
        </PullRefresh>
      </>
  }
})
