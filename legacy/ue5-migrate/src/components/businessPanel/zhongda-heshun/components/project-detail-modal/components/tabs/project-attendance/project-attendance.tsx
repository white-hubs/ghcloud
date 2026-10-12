import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Spin, Select, Popover, ImagePreviewGroup, Image } from 'ant-design-vue'
import styles from './project-attendance.module.less'
import { cubeZDDataVizService } from '@/api/service'
import { type CheckInVo } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";
import dayjs from 'dayjs'

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}

export const ProjectAttendance = defineComponent({
  props: ['info', 'projectId'],
  setup: (props: Props) => {
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: '打卡时间',
        dataIndex: 'createTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const textVal = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <Popover content={textVal || '--'}>{textVal || '--'}</Popover>
        }
      },
      {
        title: '打卡人员',
        dataIndex: 'checkUserName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '打卡地点',
        dataIndex: 'locationName',
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
        customRender: ({ record }: { record: CheckInVo; }): JSX.Element => {
          return <Button type="link" size="small" onClick={async () => handleViewDetail(record)}>查看图片</Button>
        }
      }
    ]
    const dataSource = ref<CheckInVo[]>([])
    const loading = ref<boolean>(false)
    const searchForm = ref({
      userName: '',
      projectId: props.info?.id
    })
    const previewVisible = ref<boolean>(false)
    const previewImages = ref<string[]>([])
    const previewIndex = ref<number>(0)

    const handleViewDetail = async (record: CheckInVo): Promise<void> => {
      // 预览图片
      const imgs =  record?.fileVOList
      if (imgs && imgs.length) {
        previewImages.value = imgs.map(item => item.path?.startsWith('http') ? item.path : `${location.origin}${item.path}`).filter(Boolean) as string[]
        previewIndex.value = 0
        previewVisible.value = true
      }
    }
    // 搜索
    const handleSearch = (): void => {
      fetchData()
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        userName: '',
        projectId: props.info?.id
      }
      fetchData()
    }

    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getCheckInList({
          userName: searchForm.value.userName,
          projectId: (searchForm.value.projectId || '') as string,
        })
        // dataSource.value = res
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
      <div class={styles['task-container']}>
        <div class={styles['task-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>考勤查询</span>
              <Input
                v-model:value={searchForm.value.userName}
                placeholder="打卡人员"
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
                class={styles['task-table']}
              />
            </div>
          </Spin>
          <div id='myPreview' style={{ display: 'none' }}>
            <ImagePreviewGroup
              {...{
                preview: {
                  visible: previewVisible.value,
                  onVisibleChange: (vis: boolean) => (previewVisible.value = vis),
                  current: previewIndex.value,
                  onChange: (curr: number) => (previewIndex.value = curr)
                }
              }}
            >
              {previewImages.value.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                />
              ))}
            </ImagePreviewGroup>
          </div>
        </div>
      </div>
    )
  }
})