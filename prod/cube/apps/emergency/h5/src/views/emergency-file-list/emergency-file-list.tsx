import { defineComponent, onMounted, ref } from 'vue'
import styles from './emergency-file-list.module.less'
import { Cell, CellGroup, List, PullRefresh, showLoadingToast, showNotify, Tag } from 'vant'
import { useRouter } from 'vue-router'
import { cubeEmergencyService } from '@/api/server'
import type { EmergencyFilePageVO } from '@ghcloud/cube-emergency-service/src/type'
import dayjs from 'dayjs'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const EmergencyFileList = defineComponent({
  setup: () => {
    const router = useRouter()
    const loading = ref(false)
    const finished = ref(false)
    const page = {
      pageSize: 20,
      pageNumber: 0
    }
    const dataList = ref<EmergencyFilePageVO[]>([])
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        page.pageNumber++
        const res = await cubeEmergencyService.getEmergencyFilesPage({
          pageSize: page.pageSize,
          pageNumber: page.pageNumber
        })
        dataList.value = [...dataList.value, ...res.records]
        if (res.pages <= page.pageNumber || res.records.length === 0) {
          finished.value = true
        }
      } catch {
        showNotify({ type: 'danger', message: '获取预案文件列表失败' })
      } finally {
        loading.value = false
      }
    }
    const onRefresh = (): void => {
      page.pageNumber = 0
      getData()
    }
    const toDetail = async (item: EmergencyFilePageVO): Promise<void> => {
      showLoadingToast({
        message: '',
        forbidClick: true,
        loadingType: 'spinner',
      })
      router.push({
        path: '/emergency-file-detail',
        query: {
          id: item.id
        }
      })
    }

    document.title = '预案文件'
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='预案文件' />
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class={styles['file-list']}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text='暂无更多数据'
              onLoad={getData}
            >
              {
                dataList.value.map(item => {
                  return (
                    <div class={styles['file-list-item']} key={item.id} onClick={() => {
                      toDetail(item)
                    }}>
                      <CellGroup>
                        <Cell
                          title={item.name}
                          v-slots={{
                            label: () => {
                              return (
                                <>
                                  <Tag type={item.levelCode === 'IMPORTANT' ? 'danger' : 'primary'}>{item.levelCode === 'IMPORTANT' ? '重要' : '普通'}</Tag>
                                  <Tag type={dayjs().isBefore(dayjs(item.expirationDate)) ? 'success' : 'warning'} style='margin-left:1vw'>{dayjs().isBefore(dayjs(item.expirationDate)) ? '正常' : '过期'}</Tag>
                                </>
                              )
                            }
                          }}
                        />
                        <Cell
                          title=''
                          v-slots={{
                            label: () => {
                              return (
                                <>
                                  <div>文件类型：{item.emergencyFileTypeName || '--'}</div>
                                  <div class={styles['file-list-item-remark']}>
                                    <span style='white-space:nowrap'>备注：</span>
                                    <p class={styles['file-list-item-remark-content']}>{item.remark || '--'}</p>
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
