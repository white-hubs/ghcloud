import { defineComponent, onMounted, reactive, ref } from 'vue'
import './resources-list.less'
import { DropdownItem, DropdownMenu, List, PullRefresh } from 'vant'
import { useRouter } from 'vue-router'
import { cubeOperatingRoomService, cubeOuaaService } from '@/api/server'
import { authStore } from '@/api/auth-store.ts'
import type { ItemDetailsVo } from '@ghcloud/cube-operating-room-service'

export const ResourcesList = defineComponent({
  setup: () => {
    const departmentSelectionValue = ref('')
    const router = useRouter()
    const loading = ref(false)
    const pageData = reactive({
      pageNumber: 0,
      pageSize: 10,
    })
    const listLoading = reactive({
      loading: false,
      finished: false
    })
    const option = ref([
      {
        text: '全部',
        value: '1'
      },
      {
        text: '全部1',
        value: '2'
      },
      {
        text: '全部3',
        value: '3'
      },
    ])
    const deviceList = ref<ItemDetailsVo[]>([])
    const goDetail = (item: ItemDetailsVo): void => {
      router.push({
        path: '/resources-detail',
        query: {
          id: item.id,
          deptId: departmentSelectionValue.value,
        }
      })
    }
    const onRefresh = (): void => {
      pageData.pageNumber = 0
      deviceList.value = []
      listLoading.finished = false
      onLoad()
    }
    const onLoad = async (): Promise<void> => {
      loading.value = true
      pageData.pageNumber++
      const res = await cubeOperatingRoomService.getResourceItemDetailList({
        deptId: departmentSelectionValue.value,
        tenant: authStore.tenant,
        pageSize: 10,
        pageNumber: pageData.pageNumber
      })
      if (pageData.pageNumber >= res.pages) {
        listLoading.finished = true
      }
      listLoading.loading = false
      loading.value = false
      deviceList.value = deviceList.value.concat(res.records)
    }
    const getResourceDeptDeviceTree = async (): Promise<void> => {
      const res = await cubeOuaaService.getDeptList({ tenant: authStore.tenant, enabled: true })
      option.value = res.map(e => {
        return {
          text: e.name,
          value: e.id
        }
      })
      option.value.unshift({
        text: '全部科室',
        value: ''
      })
    }
    onMounted(() => {
      document.title = '物品查询'
      getResourceDeptDeviceTree()
    })
    return (): JSX.Element =>
      <div class='resources-list-box'>
        <div class='department-selection'>
          <DropdownMenu>
            <DropdownItem onChange={onRefresh} v-model={departmentSelectionValue.value} options={option.value} />
          </DropdownMenu>
        </div>
        <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
          <div class='list-page'>
            <List
              v-model:loading={listLoading.loading}
              finished={listLoading.finished}
              finished-text='没有更多了'
              onLoad={onLoad}
            >
              {
                deviceList.value.map((item) => {
                  return (
                    <div onClick={() => {
                      goDetail(item)
                    }} key={item.id} class='resources-list-item'>
                      <div class='resources-list-item-header'>
                        <span class='header-left'>{item.deviceName}</span>
                        <span class='header-right'>&gt; </span>
                      </div>
                      {

                        item.itemList.slice(0, 3).map((e) => {
                          return (
                            <div key={e.id} class='resources-list-item-content'>
                              <div class='resources-list-item-device-left'>
                                <div class='device-name'>{e.name}</div>
                                <div class='device-type'>厂家名称：{e.manufacturer}</div>

                              </div>
                              <div class='resources-list-item-device-right'>
                                <span class='device-number'>{e.number || 0}</span>
                                <span class='device-unit'>台</span>
                              </div>
                            </div>
                          )
                        })
                      }

                    </div>
                  )
                })
              }
            </List>
          </div>
        </PullRefresh>
      </div>
  }
})
