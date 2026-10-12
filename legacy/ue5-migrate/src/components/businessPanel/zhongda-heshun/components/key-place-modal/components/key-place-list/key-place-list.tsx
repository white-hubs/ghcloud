import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Select, Spin, Popover } from 'ant-design-vue'
import styles from './key-place-list.module.less'
import { cubeZDDataVizService } from '@/api/service'
import { DataType, type KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { ProjectSelect } from '../../../project-select/project-select'
import { projectStore } from '@/components/businessPanel/zhongda-heshun/store/project'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";

interface Props {
  info: Record<string, unknown>;
}

export const KeyPlaceList = defineComponent({
  props: ['info'],
  emits: ['locate'],
  setup: (props: Props, { emit }) => {
    const store = projectStore()
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: '编号',
        dataIndex: 'id',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
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
        title: '所属项目',
        dataIndex: 'projectName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '120px',
        customRender: ({ record }: { record: KeyPlacePageVO; }): JSX.Element => {
          const hasPosition = record.longitude !== null && record.latitude !== null
          if (hasPosition) {
            return <Button type="link" size="small" onClick={(e)=>{
              e.stopPropagation()
              handleViewLocation(record)
            }}>定位</Button>
          } else {
            return <Popover content={'该场所未配置经纬度'}>
              <Button type="link" size="small" disabled>定位</Button>
            </Popover>
          }
        }
      }
    ]
    const dataSource = ref<unknown[]>([])
    const loading = ref<boolean>(false)
    const dataTypeOptions = ref<{ name: string; id: string; }[]>([])
    const searchForm = ref({
      keyword: '',
      dataTypeId: '',
      projectId: store.currentProject?.id as string || '',
      area: props.info?.area || '',
    })
    // 查看定位
    const handleViewLocation = (record: KeyPlacePageVO): void => {
      emit('locate', record)
    }

    // 搜索
    const handleSearch = (): void => {
      fetchData()
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: '',
        dataTypeId: '',
        projectId: '',
        area: ''
      }
      fetchData()
    }
    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getKeyPlacesListAll({
          projectId: searchForm.value?.projectId,
          dataTypeId: searchForm.value.dataTypeId,
          keyword: searchForm.value.keyword,
          area: searchForm.value.area as string || '',
        })
        dataSource.value = res
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    const getSelectData = async (): Promise<void> => {
      const res = await cubeZDDataVizService.getDataTypeListAll({ dataType: DataType.PLACE })
      dataTypeOptions.value = res?.map(item => {
        return {
          name: item.dataName,
          id: item.id
        }
      })
      searchForm.value.dataTypeId = dataTypeOptions.value?.find(e => e.name === props.info?.dataTypeName)?.id
      fetchData()
    }

    onMounted(() => {
      getSelectData()
      fetchData()
    })

    return (): JSX.Element => (
      <div class={styles['key-place-container']}>
        <div class={styles['key-place-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>分类</span>
              <Select
                v-model:value={searchForm.value.dataTypeId}
                options={dataTypeOptions.value}
                field-names={{ label: 'name', value: 'id' }}
                placeholder="全部"
                class={styles['select']}
                allowClear
                optionFilterProp='name'
                showSearch
                notFoundContent={'暂无数据'}
              />
            </div>
            <div class={styles['form-item']}>
              <span class={styles['label']}>所属项目</span>
              <ProjectSelect v-model:value={searchForm.value.projectId} class={styles['select']} />
            </div>
            <div class={styles['form-item']}>
              <span class={styles['label']}>场所名称</span>
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
                  showTotal: (total) => `共 ${total} 条`,
                  total: dataSource.value.length,
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