import { defineComponent, ref, onMounted } from 'vue'
import { Table, Button, Input, Spin, Popover, message } from 'ant-design-vue'
import styles from './project-materials.module.less'
import { cubeZDDataVizService } from '@/api/service'
import type { ProjectMaterialInfoVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import dayjs from 'dayjs'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";
import { kkFilePreview } from '@ghcloud/cube-utils'

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}

export const ProjectMaterials = defineComponent({
  props: ['info', 'projectId'],
  setup: (props: Props) => {
    const columns: ColumnsType = [
      {
        title: '序号',
        dataIndex: 'index',
        width: '80px',
        customRender: ({ index }: { index: number; }): number => index + 1
      },
      {
        title: '文件名称',
        dataIndex: 'fileName',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ProjectMaterialInfoVO; }): JSX.Element => {
          const name = record.fileName;
          return <Popover content={name || '--'}>
            {
              <Button type="link" size="small" onClick={() => kkFilePreview(record.file)}>{name}</Button> || '--'
            }
          </Popover>
        }
      },
      {
        title: '文件类型',
        dataIndex: 'fileTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '上传人',
        dataIndex: 'uploadUserName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '上传时间',
        dataIndex: 'uploadTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const textVal = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : ''
          return <Popover content={textVal || '--'}>{textVal || '--'}</Popover>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: '120px',
        customRender: ({ record }: { record: ProjectMaterialInfoVO; }): JSX.Element => {
          return <Button type="link" size="small" onClick={() => handleDownload(record)}>下载</Button>
        }
      },
    ]
    // 数据源
    const dataSource = ref<ProjectMaterialInfoVO[]>([])
    const loading = ref<boolean>(false)
    const searchForm = ref({
      keyword: '',
      projectId: props.info?.id
    })

    // 下载文件
    const handleDownload = (item: ProjectMaterialInfoVO): void => {
      const url = item.file?.path?.startsWith('http') ? item.file?.path : `${location.origin}${item.file?.path}`
      if (!url) {
        message.warning('没有可下载的项目资料')
        return
      }
      const link = document.createElement('a')
      link.href = url
      link.download = item?.file?.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      message.success('下载成功')
    }

    // 搜索
    const handleSearch = (): void => {
      fetchData()
    }

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: '',
        projectId: props.info?.id
      }
      fetchData()
    }

    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getMaterialsListAll({
          keyword: searchForm.value.keyword,
          projectId: (searchForm.value.projectId || '') as string,
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
      <div class={styles['materials-container']}>
        <div class={styles['materials-content']}>
          <div class={styles['search-form']}>
            <div class={styles['form-item']}>
              <span class={styles['label']}>资料查询</span>
              <Input
                v-model:value={searchForm.value.keyword}
                placeholder="请输入文件名称"
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
                class={styles['materials-table']}
              />
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})