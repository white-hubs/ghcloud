import { List, Empty, PullRefresh, Button, CellGroup, Search, Divider, Icon, showNotify, showConfirmDialog, Popup } from 'vant'
import { defineComponent, reactive, ref } from 'vue'
import styles from './knowledge-document-list.module.less'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { cubeKnowledgeDocumentService } from '@/api/server'
import type { KnowledgeDocumentModel } from '@ghcloud/cube-knowledge-document-service'
import { showImagePreview, kkFilePreview } from '@ghcloud/cube-utils'
import { timeFormat, typeList } from '@/utils'
import { useRouter, useRoute } from 'vue-router'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
const addIcon = '/resource/v1/knowledge-document/images/add-icon.png'
import { FilterDom } from './filter/filter-dom'

/** 文档列表页 */
export const KnowledgeDocumentList = defineComponent({
  setup: () => {
    const dataSource = ref<KnowledgeDocumentModel[]>([])
    const showFilter = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const router = useRouter()
    const route = useRoute()
    const search = reactive({
      name: '',
      pageNumber: 0,
      pageSize: 20,
      total: 1,
      typeId: '',
      deptId: '',
      productId: '',
    })
    // 获取耗材分页列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeKnowledgeDocumentService.getKnowledgeDocumentList({ ...search })
        search.total = res.total
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 删除
    const handleRemove = async (e: Event, item: KnowledgeDocumentModel): Promise<void> => {
      e.stopPropagation()
      showConfirmDialog({
        title: '提示',
        message: `确定删除【${item.name}】文档吗？`,
      }).then(async () => {
        await cubeKnowledgeDocumentService.deleteKnowledgeDocument({ idList: [item.id] })
        showNotify({ type: 'success', message: '删除成功' })
        onSearch()
      }).catch(() => {
        // on cancel
      })
    }
    // 下载
    const handleDowload = async (e: Event, item: KnowledgeDocumentModel): Promise<void> => {
      e.stopPropagation()
      try {
        if (item.fileList.length === 0) {
          showNotify({ type: 'warning', message: '暂无文件' })
          return
        }
        const file = item.fileList[0];
        await cubeAppService.downloadFile({ filePath: file.path, fileName: file.name })
      } catch {}
    }
    // 查看
    const handleShow = async (e: Event, value: KnowledgeDocumentModel): Promise<void> => {
      e.stopPropagation()
      if (value.fileList.length === 0) {
        showNotify({ type: 'warning', message: '暂无文件' })
        return
      }
      const item = value.fileList[0];
      if (['zip', 'rar'].includes(item.type ?? '')) {
        showNotify({ type: 'warning', message: '暂不支持该文件类型的预览, 请到电脑端查看' })
        return
      }
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        showImagePreview([item.path], 0)
      }
    }
    const addKnowledgeDocument = (): void => {
      router.push({
        name: 'knowledge-document-edit',
      })
    }

    return (): JSX.Element =>
      <div>
        <CubeNavBar showBack title={route.query.title ?? '知识文档'} />
        <div class={styles.search}>
          <Search class={styles.keyword} v-model={search.name} placeholder='根据文档名称进行搜索' onSearch={onSearch} />
          <div class={styles.filter} onClick={() => {
            showFilter.value = true
          }}>筛选<Icon style='margin-left:2px' name='list-switch' size='18' /></div>
        </div>
        <div style={{ height: '83.5vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '83.5vh', overflow: 'auto' }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
            >
              {
                dataSource.value && dataSource.value.length > 0 &&
                dataSource.value.map((item) => {
                  return (
                    <CellGroup inset class={styles['cell-group']} key={item.id}>
                      <div class={styles.title}>
                        <span class={styles['title-name']}>{item.name}
                        </span>
                      </div>
                      <Divider style={{ margin: '10px' }} />
                      <div class={styles.content}>
                        <div><span style={{ color: '#8f8f8f' }}>文档类型：</span><span>{item.typeName}</span></div>
                        <div><span style={{ color: '#8f8f8f' }}>所属部门：</span><span>{item.deptName}</span></div>
                        <div><span style={{ color: '#8f8f8f' }}>更新时间：</span><span>{timeFormat(item.updateTime, true)}</span></div>
                      </div>
                      <Divider style={{ margin: '5px' }} />
                      <div class={styles.footer}>
                        <Button v-show={true} type='danger' size='small' onClick={(e: Event) => {
                          handleRemove(e, item)
                        }}>删除</Button>
                        <Button v-show={true} plain type='primary' size='small' onClick={(e: Event) => {
                          handleDowload(e, item)
                        }}>下载</Button>
                        <Button v-show={true} type='primary' size='small' onClick={(e: Event) => {
                          handleShow(e, item)
                        }}>查看</Button>
                      </div>
                    </CellGroup>
                  )
                })
              }
              {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
        <div class={styles['add-icon']} onClick={addKnowledgeDocument}>
          <img src={addIcon} alt='' />
        </div>
        <Popup v-model:show={showFilter.value} position='right' style={{ width: '90%', height: '100%' }}>
          <FilterDom v-model:searchForm={search} onSubmit={() => {
            onSearch()
            showFilter.value = false
          }} />
        </Popup>
      </div>
  }
})
