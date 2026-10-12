import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Spin, Popover } from 'ant-design-vue'
import styles from './task-key-place.module.less'
import { cubeZDDataVizService } from '@/api/service'
import type { KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import type { ColumnsType } from 'ant-design-vue/es/table'
import { modalManager } from '@/pages/widget/modal/modal-manager'

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}

export const TaskKeyPlace = defineComponent({
  props: ['info', 'projectId'],
  emits: ['locate'],
  setup: (props: Props, { emit }) => {
    const projectId = props.info?.id || ''
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: '序号',
        dataIndex: 'index',
        width: '80px',
        customRender: ({ index }: { index: number; }): number => index + 1
      },
      {
        title: '重点场所名称',
        dataIndex: 'placeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '场所分类',
        dataIndex: 'placeTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '详细位置',
        dataIndex: 'placeDetail',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '备注',
        dataIndex: 'placeDescription',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '100px',
        customRender: ({ record }: { record: KeyPlacePageVO; }): JSX.Element => {
          const hasPosition = record.longitude !== null && record.latitude !== null
          if (hasPosition) {
            return <Button type="link" size="small" onClick={() => handleViewDetails(record)}>定位</Button>
          } else {
            return <Popover content={'该场所未配置经纬度'}>
              <Button type="link" size="small" disabled>定位</Button>
            </Popover>
          }
        }
      }
    ]

    const dataSource = ref<KeyPlacePageVO[]>([])
    const loading = ref<boolean>(false)
    const searchForm = ref({
      keyword: '',
    })

    const leftOptions = ref([])
    const activeLeftOption = ref('')
    const getLeftOptions = async (): Promise<void> => {
      const res = await cubeZDDataVizService.getKeyPlaceDistribution({
        projectId: projectId as string
      })
      leftOptions.value = res.map(item => ({
        name: item.keyName,
        count: item.number,
        id: item.keyId
      }))
      activeLeftOption.value = leftOptions.value[0]?.id
      getGroupData(activeLeftOption.value)
    }
    const handleViewDetails = (record: KeyPlacePageVO): void => {
      modalManager.clearStack()
      emit('locate', record)
    }

    // 搜索
    const handleSearch = (): void => {
      getGroupData(activeLeftOption.value)
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: '',
      }
      getGroupData(activeLeftOption.value)
    }

    const handleLeftOptionClick = (id: string): void => {
      activeLeftOption.value = id
      getGroupData(activeLeftOption.value)
    }

    const getGroupData = async (dataTypeId?: string): Promise<void> => {
      loading.value = true
      try {
        const projectId = props.info?.id || ''
        const res = await cubeZDDataVizService.getKeyPlacesListAll({
          keyword: searchForm.value.keyword,
          dataTypeId: dataTypeId || '',
          projectId: projectId as string
        })
        dataSource.value = res
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    onMounted(() => {
      getLeftOptions()
    })

    return (): JSX.Element => (
      <div class={styles['key-place-container']}>
        <div class={styles['left-options']}>
          {leftOptions.value.length === 0 && <NoData />}
          {leftOptions.value.map((option, index) => (
            <div
              key={index}
              class={`${styles['option-item']} ${option.id === activeLeftOption.value ? styles['active'] : ''}`}
              onClick={() => handleLeftOptionClick(option.id)}
            >
              <span class={styles['option-name']}>{option.name}</span>
              <span class={styles['option-count']}>{option.count}</span>
            </div>
          ))}
        </div>
        <div class={styles['key-place-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>场所名称：</span>
              <Input
                v-model:value={searchForm.value.keyword}
                placeholder="请输入场所名称"
                class={styles['input']}
              />
            </div>
            <div class={styles['form-buttons']}>
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </div>

          <Spin spinning={loading.value}>
            <div class={styles['table-container']}>
              <Table
                columns={columns}
                dataSource={dataSource.value}
                rowKey="id"
                scroll={{ y: 350 }}
                pagination={{
                  showSizeChanger: true,
                  total: dataSource.value.length,
                  showTotal: (total) => `共 ${total} 条`,
                  defaultCurrent: 1,
                  defaultPageSize: 10,
                  locale: {
                    jump_to: '跳转到',
                    page: '页',
                    items_per_page: '条/页'
                  }
                }}
                locale={{ emptyText: <NoData /> }}
                class={styles['key-place-table']}
              />
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})