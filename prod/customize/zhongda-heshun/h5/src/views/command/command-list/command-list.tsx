import { defineComponent, onMounted, provide, reactive, ref, watch } from 'vue'
import styles from './command-list.module.less'
import { PullRefresh, List, Empty, showNotify, Skeleton, Button, showConfirmDialog, Icon } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService, cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { BottomTabBar } from '@/components/bottom-tab-bar/bottom-tab-bar'
import { GroupSelector } from '@/components/group-selector/group-selector'
import { getAssetsFile } from '../../../utils/index'
import { useRouter } from 'vue-router'
import { CommandItem } from '@/components/command-item/command-item'
import { cubeZhongdaHeshunService } from '@/api/server'
import type { CommandVO } from '@ghcloud/cube-zhongda-heshun-service'
import { storeKill } from '@/store/kill'
import { useCommandStore } from '@/store/command'
import { AddDeviceButton } from '@/components/add-device-button/add-device-button'

export const CommandList = defineComponent({
  setup: () => {
    const commandStore = useCommandStore()
    cubeAppService.onVisibilityNativeAppBar(true)
    useMetaTitle()
    const router = useRouter()
    const store = storeKill() // 使用store
    const isWxMini = ref(false)
    const monthly = ['一号','二号','三号','四号','五号','六号','七号','八号','九号','十号','十一号','十二号','十三号','十四号','十五号','十六号','十七号','十八号','十九号','二十号','二十一号','二十二号','二十三号','二十四号','二十五号','二十六号','二十七号','二十八号','二十九号','三十号','三十一号']
    const week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    // 顶部分组切换 - 使用store中的状态
    const groupActive = ref(store.groupActive)
    const isAdmin = ref(store.isAdmin)
    provide('isAdmin', isAdmin.value)
    const groupOptions = ref<{ label: string; value: string; }[]>([])

    const dataSource = ref<CommandVO[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const skeletonLoading = ref(true)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20
    })

    const getGroupOptions = async (): Promise<void> => {
      try {
        const response = await cubeZhongdaHeshunService.getGroupPageList({
          pageNumber: 0,
          pageSize: 100,
          memberUserId: store.userInfo?.id || '',
        })
        groupOptions.value = response.records.map(item => ({
          label: item.groupName,
          value: item.id,
        }))
      } catch {}
    }

    const getDataSource = async (): Promise<{ total: number; records: CommandVO[]; }> => {
      try {
        return cubeZhongdaHeshunService.getCommandPageList({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          groupId: groupActive.value,
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON();
        showNotify({ type: 'danger', message: errorMessage || '请求失败' });
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
    
    const handleDeviceInfo = ({ index, record }: { index: number; record: CommandVO; }): void => {
      router.push({ path: '/command-create'})
      commandStore.resetStore()
      commandStore.saveName({name:record.name})
      commandStore.saveState({state:record.id})
      const display = record.display.split('&&') || []
      const deviceData = {
        commandName: '设备名称',
        deviceId: record.deviceId,
        propWriteValueList: record.propWriteValueList,
        name: display[1]
      }
      let timer = ''
      switch(record.loopType) {
        case 'EVERY_DAY':
          timer = '每天' + record.loopHour
          break
        case 'EVERY_WEEK':
          timer = '每周' + record.loopDay.split(',').map((item)=>{
            const index = Number(item) || 1
            return week[index - 1]
          }) + record.loopHour
          break
        case 'EVERY_MONTH':
          timer = '每月'+ record.loopDay.split(',').map((item)=>{
            const index = Number(item) || 1
            return monthly[index -1]
          })  + record.loopHour
          break
      }
      const timeData = {
        loopHour: record.loopHour,
        loopType: record.loopType,
        timer: timer,
        loopDay: record.loopDay.split(',') as unknown as number[],
      }
      commandStore.saveDeviceData(deviceData)
      commandStore.saveTimeData(timeData)
    }    
    // const handleDelete = (id: number): void => {
    //   // dataSource.value[index] = record
    //   // router.push({ path: '/command-create', query: { id: record.id } })
    // }
      const handleDelete = async (item: CommandVO): Promise<void> => {
        showConfirmDialog({
          title: '提示',
          message: `确定删除【${item.name}】指令吗？`,
        })
          .then(async () => {
            const params = {
              id: item.id
            }
            try {
              await cubeZhongdaHeshunService.deleteCommandPageList(params);
              showNotify({ type: 'success', message: '删除成功' });
              onRefresh()
            } catch  {
            }
          })
          .catch(() => {
          })
      };
    const getData = async (): Promise<void> => {
      dataSource.value.length = 0
      skeletonLoading.value = true
      onRefresh()
    }
    
    const handleGroupChange = (current: { label: string; value: string; }): void => {
       groupActive.value = current.value
      store.setGroupActive(current.value)
      store.setGroupChecked({ id: current.value, groupName: current.label})
      getData()
    }

    const handleAddDevice = (type: 'scan' | 'hand'): void => {
      // if(!groupActive.value){
      //   showNotify({
      //     message: '请先选择分组',
      //     type: 'danger'
      //   })
      // }
      commandStore.resetStore()
      commandStore.saveState({state:''})
      router.push('/command-create')
    }



    watch(() => store.groupActive, (newValue: string) => {
      if (newValue !== groupActive.value) {
        groupActive.value = newValue
        getData()
      }
    })
    

    onMounted(async () => {
      await store.updateGroupInfo()
      groupActive.value = store.groupActive
      isAdmin.value = store.isAdmin
      isWxMini.value = await cubeWxService.getWxEnv()
      getGroupOptions();
      getData()
    })

    
    return (): JSX.Element =>
      <div class={styles.container}>
        {/* <GroupSelector 
          activeGroup={groupActive.value} 
          groupOptions={groupOptions.value} 
          onChangeGroup={handleGroupChange} 
        /> */}

       <div class={styles['list-main']}>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['device-list-pull-refresh']}>
          {skeletonLoading.value ? (
            <div class={styles['skeleton-container']}>
              {new Array(8).fill('').map((item, index) => (
                <div class={styles['skeleton-item']} key={index}>
                  <Skeleton title row={4}>
                    <template v-slots={{template: () => (
                      <div class={styles['skeleton-item-wrap']}>
                        <div style={{flex: 1}}>
                          <Skeleton title row={1} title-width="60%" />
                          <div class={styles['skeleton-item-text']}>
                            <Skeleton title row={1} title-width="40%" />
                            <Skeleton title row={1} title-width="40%" />
                          </div>
                          <div class={styles['skeleton-item-text']}>
                            <Skeleton title row={1} title-width="40%" />
                            <Skeleton title row={1} title-width="40%" />
                          </div>
                        </div>
                      </div>
                    )}}>
                    </template>
                  </Skeleton>
                </div>
              ))}
            </div>
          ) : (
            <div  class={styles.list}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
              onLoad={onLoad}
             
            >
                {dataSource.value.length === 0 ? (
                <div class={styles.empty}>
                  <Empty
                    description="暂无指令"
                    image={getAssetsFile('device-nodata.png')}>
                    {isAdmin.value && <Button type="primary" class={styles['add-button']}  onClick={handleAddDevice}>添加指令</Button>}
                  </Empty>
                </div>
              ) : 
              <div class={styles['list-wrap']}>
                {
                  isAdmin.value &&
                  <div   class={styles.commandItem} >
                     <Icon name="add-o" class={styles.commandItemIcon} onClick={() => handleAddDevice('hand')}  />
                  </div>
                }
                {
                  dataSource.value.map((record, index) => (
                    <CommandItem
                      key={record.id}
                      record={record}
                      recordIndex={index}
                      onHandleInfo={handleDeviceInfo}
                      onHandleDelete={handleDelete}
                    />
                  ))
                }
              </div>
            }
            </List>
            </div>
          )}
        </PullRefresh>
      </div>

        {/* <BottomTabBar active="command" /> */}
      </div>
  }
})
