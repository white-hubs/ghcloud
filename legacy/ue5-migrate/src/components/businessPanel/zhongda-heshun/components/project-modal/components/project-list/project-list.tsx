import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Select, Spin, Popover } from 'ant-design-vue'
import styles from './project-list.module.less'
import { closeProjectDetailModal, projectDetailModal } from '../../../project-detail-modal/project-detail-modal'
import { cubeZDDataVizService } from '@/api/service'
import { type ProjectPageVO, ProjectStatus } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import dayjs from 'dayjs'
import { createKeyPlaceMarker } from '@/components/businessPanel/zhongda-heshun/utils/gis-helper'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";
import { closeProjectModal } from '../../project-modal'

interface Props {
  info: Record<string, unknown>;
}

export const ProjectList = defineComponent({
  props: ['info'],
  setup: (props: Props) => {
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '项目所在地',
        dataIndex: 'disinfectionLocationName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '项目负责人',
        dataIndex: 'leaderName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '项目周期',
        dataIndex: 'cycleName',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ProjectPageVO; }): JSX.Element => {
          const dataRange = record?.beginTime && record?.endTime ? `${dayjs(record.beginTime).format('YYYY-MM-DD')} ~ ${dayjs(record.endTime).format('YYYY-MM-DD')}` : ''
          return <Popover content={dataRange || '--'}>{dataRange || '--'}</Popover>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: '100px',
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const statusMap: Record<string, { text: string; color: string; }> = {
            'WAITING': { text: '待开始', color: '#1890ff' },
            'PROCESSING': { text: '进行中', color: '#faad14' },
            'COMPLETED': { text: '已完成', color: '#52c41a' }
          }
          const status = statusMap[text] || { text: '--', color: '#d9d9d9' }
          return <Popover content={status.text}><span style={{ color: status.color }}>{status.text}</span></Popover>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '120px',
        align: 'center',
        customRender: ({ record }: { record: unknown; }): JSX.Element => {
          return <Button type="link" size="small" onClick={async () => handleViewDetail(record)}>详情</Button>
        }
      }
    ]

    // 数据源
    const dataSource = ref<unknown[]>([])
    const loading = ref<boolean>(false)
    const statusOptions = ref<{ label: string; value: string; }[]>([
      { label: '全部', value: '' },
      { label: '待开始', value: ProjectStatus.WAITING },
      { label: '进行中', value: ProjectStatus.PROCESSING },
      { label: '已完成', value: ProjectStatus.COMPLETED }
    ])
    const searchForm = ref({
      keyword: '',
      status: props.info.status || '',
      area: props.info.area || '',
      typeEnum: props.info.typeEnum || '',
    })

    // 查看详情
    const handleViewDetail = async (record: ProjectPageVO): Promise<void> => {
      // let doCloseCallBack = true
      closeProjectModal()
      await projectDetailModal.open({
        title: record.projectName || '项目详情',
        data: {
          ...record
        },
        onClose: ()=>{
          // doCloseCallBack && restoreTheInitialStateOfTheMap()
        },
        onLocate: (data)=>{
          // doCloseCallBack = false

          createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true)

          // 关闭详情弹窗
          closeProjectDetailModal()
          // 关闭列表弹窗
          closeProjectModal()

        }
      })
    }
    // 搜索
    const handleSearch = (): void => {
      fetchData()
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: '',
        status: '',
        area: '',
        typeEnum: '',
      }
      fetchData()
    }

    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getProjectsListAll({
          status: searchForm.value.status as ProjectStatus,
          keyword: searchForm.value.keyword,
          area: searchForm.value.area as string ?? '',
          typeEnum: searchForm.value.typeEnum as string ?? '',
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
      fetchData()
    })

    return (): JSX.Element => (
      <div class={styles['project-container']}>
        <div class={styles['project-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>状态</span>
              <Select
                v-model:value={searchForm.value.status}
                options={statusOptions.value}
                placeholder="全部"
                class={styles['select']}
                notFoundContent={'暂无数据'}
              />
            </div>
            <div class={styles['form-item']}>
              <span class={styles['label']}>项目名称</span>
              <Input
                v-model:value={searchForm.value.keyword}
                placeholder="请输入项目名称"
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
                class={styles['project-table']}
              />
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})