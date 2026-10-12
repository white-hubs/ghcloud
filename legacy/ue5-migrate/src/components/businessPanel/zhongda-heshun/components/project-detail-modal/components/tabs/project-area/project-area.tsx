import { defineComponent, ref, onMounted } from 'vue'
import { Table, Spin, Popover } from 'ant-design-vue'
import styles from './project-area.module.less'
import type { AreaInfoVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import { cubeZDDataVizService } from '@/api/service'
import type { ColumnsType } from 'ant-design-vue/es/table'
import NoData from "@/components/businessPanel/public/noData.vue";

interface Props {
  info: Record<string, unknown>;
  projectId?: string | number;
}
export const ProjectArea = defineComponent({
  props: ['info', 'projectId'],
  setup: (props: Props) => {
    const columns: ColumnsType = [
      {
        title: '序号',
        dataIndex: 'index',
        width: '80px',
        align: 'center',
        customRender: ({ index }: { index: number; }): number => index + 1
      },
      {
        title: '区域',
        dataIndex: 'areaName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
      {
        title: '详情',
        dataIndex: 'areaDetail',
        ellipsis: true,
        // align: 'center',
        width: '55%',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <Popover content={text || '--'}>{text || '--'}</Popover>
        }
      },
    ]

    const dataSource = ref<AreaInfoVO[]>([])
    const loading = ref<boolean>(false)

    // 获取数据
    const fetchData = async (): Promise<void> => {
      loading.value = true
      try {
        const res = await cubeZDDataVizService.getAreasListAll((props.info?.id || '') as string)
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
      <div class={styles['area-container']}>
        <div class={styles['area-content']}>
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
                class={styles['area-table']}
              />
            </div>
          </Spin>
        </div>
      </div>
    )
  }
})