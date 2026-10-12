import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './group.module.less'
import { PullRefresh, List, Empty, showNotify, Skeleton, Button, Cell, Popup, Loading, Form, Field, type FormInstance, Checkbox, SwipeCell, showConfirmDialog, Search, Radio, RadioGroup } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService, cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { useRouter } from 'vue-router'
import { cubeZhongdaHeshunService } from '@/api/server'
import type { GroupVO } from '@ghcloud/cube-zhongda-heshun-service'
import { storeKill } from '@/store/kill'

export const Group = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(true)
    useMetaTitle()
    const store = storeKill()
    const router = useRouter()
    const isWxMini = ref(false)
    
    const dataSource = ref<GroupVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const skeletonLoading = ref(true)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      keyword: ''
    })
    const formRef = ref<FormInstance>()
    const state = reactive({
      loading: false,
      showPicker: false,
      formState: {
        id: '',
        groupName: '',
        description: ''
      },
      checked: store.groupActive || '',
    })
    const getDataSource = async (): Promise<{ total: number; records: GroupVO[]; }> => {
      try {
        const res = await cubeZhongdaHeshunService.getGroupPageList({
          pageNumber: 1,
          pageSize: 999,
          keyword: search.keyword || '',
          memberUserId: store.userInfo?.id || '',
        })
        return { total: res.total, records: res.records };
      } catch {
        return { total: 0, records: [] };
      }
    };
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        setTimeout(() => {
          loading.value = false
          refreshing.value = false
          skeletonLoading.value = false
        }, 1000)
      }
    }

    const onRefresh = async (): Promise<void> => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      skeletonLoading.value = true
      onRefresh()
    }
    
    onMounted(async () => {
      isWxMini.value = await cubeWxService.getWxEnv()
      await getData()
    })
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const onClear = (): void => {
      search.pageNumber = 0
      search.keyword = ''
      finished.value = false
      onLoad()
    }

    const onEnter = (): void => {
      store.setGroupActive(state.checked)

      const group = dataSource.value.find(item => item.id === state.checked)
      store.setGroupChecked(group ?? {})

      cubeWxService.postMessage({
        action: 'updateGroupActive',
        groupActive: group
      }, false)
      
      setTimeout(() => {
        if (isWxMini.value) {
          cubeWxService.backHome('/pages/mine/mine')
        } else {
          router.push({ path: '/device'})
        }
      }, 1500)
    }

    const handleDelete = async (e: Event, item: GroupVO): Promise<void> => {
      showConfirmDialog({
        title: '提示',
        message: `确定删除【${item.groupName}】分组吗？`,
      })
        .then(async () => {
          try {
            await cubeZhongdaHeshunService.deleteGroup(item.id)
            showNotify({ type: 'success', message: '删除成功' })
            getData()
          } catch {
          }
        })
        .catch(() => {
        })
    }
    const handleEdit = async (e: Event, item: GroupVO): Promise<void> => {
      e.stopPropagation()
      state.showPicker = true
      state.formState.id = item.id
      state.formState.groupName = item.groupName
    }
    const handleAdd = (): void => {
      state.showPicker = true
      state.formState.id = ''
    }

    const onCancel = () => {
      state.showPicker = false
    }
    const handleSubmit = async (): Promise<void> => {
      if (!state.formState.groupName) {
        showNotify({
          type: 'warning',
          message: '请填写分组名称'
        })
        return
      }
      formRef.value?.validate().then(async () => {
        try {
          state.loading = true
          if (state.formState.id) {
            const params = {
              id: state.formState.id,
              groupName: state.formState.groupName,
            }
            await cubeZhongdaHeshunService.updateGroup(params)
            showNotify({ type: 'success', message: '修改成功' })
          } else {
            const params = {
              groupName: state.formState.groupName,
            }
            await cubeZhongdaHeshunService.addGroup(params)
            showNotify({ type: 'success', message: '创建成功' })
          }
          state.showPicker = false
          getData()
        } catch {
        } finally {
          state.loading = false
          state.formState = {
            id: '',
            groupName: '',
            description: '',
        }
        }
      })
    }
    const radioRefs = ref<(InstanceType<typeof Radio> | null)[]>([]);
    const toggle = (index: number) => {
      radioRefs.value[index].toggle();
    };
    return (): JSX.Element =>
      <>
        <div class={styles.container}>
          <div class={styles.search}>
            <Search class={styles.keyword} v-model={search.keyword} placeholder='根据分组名称进行搜索' onSearch={onSearch} onClear={onClear} shape="round" clearable />
          </div>
          <div class={styles.group}>
            <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['list-pull-refresh']}>
              {skeletonLoading.value ? (
                new Array(3).fill('').map((item,index) => (
                  <Skeleton class={styles['skeleton-item']} title key={index} />
                ))
              ) : (
              <List
                v-model:loading={loading.value}
                finished={finished.value}
                finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                onLoad={onLoad}
              >
                { dataSource.value.length === 0 ? (
                  <div class={styles.empty}>
                    <Empty description="暂无数据" />
                  </div>
                ) : 
                <div class={styles['list-wrap']}>
                  <RadioGroup v-model={state.checked} v-model:checked={state.checked} >
                  {
                    dataSource.value.map((record, index) => (
                      <SwipeCell key={index} v-slots={{
                          right: () => <Button square type='danger' text='删除' onClick={ (e: Event) => handleDelete(e, record) } style={{ width: '50px', height: '100%'}} />
                        }}>
                          <Cell 
                            title={record.groupName} 
                            clickable
                            onClick={ () => state.checked = record.id }
                            v-slots={{
                              icon: () => <Radio name={record.id} ref={(el: InstanceType<typeof Radio> | null) => { radioRefs.value[index] = el }} style={{ margin: '0 10px' }} />,
                              'right-icon': () => <Button icon='edit'  onClick={ (e: Event) => handleEdit(e, record) } style={{ background: 'transparent', border: 'none', whitespace: 'nowrap' }} />
                            }}
                            style={{ padding: '0 2px', height: '50px', display: 'flex', alignItems: 'center' }}
                           />
                      </SwipeCell>
                    ))
                  }
                  </RadioGroup>
                </div>
              }
              </List>
            )}
          </PullRefresh>
          <div class={styles.bottom} >
            <Button class={styles['bottom-add']} onClick={handleAdd} icon='add-o' >创建新分组</Button>
            <Button type='primary' class={styles['bottom-enter']} onClick={onEnter}>确认</Button>
          </div>
        </div>
      </div>
      <Popup 
        v-model:show={state.showPicker} 
        position="bottom" 
        round
        closeOnClickOverlay={true}
        onClickOverlay={onCancel}
        closeable
        teleport='#app'
      >
        <div class={styles.form}>
          <div class={styles['add-title']}>创建分组</div>
          {state.loading && <Loading type='spinner' size='24px' vertical>加载中...</Loading>}
          <Form ref={formRef} label-width='70px'>
            <Field
              v-model={state.formState.groupName}
              rules={[{ required: true, message: '选输入分组名称' }]}
              label='分组名称'
              placeholder='请输入分组名称'
              required
              maxlength='100'
              show-word-limit
            />
          </Form>
          <div class={styles['bottom-wrap']}> 
            <Button class={styles['bottom-btn']} block type='primary' loading={state.loading} onClick={handleSubmit}>保存</Button>
          </div>
        </div>
      </Popup>
    </>
  }
})
