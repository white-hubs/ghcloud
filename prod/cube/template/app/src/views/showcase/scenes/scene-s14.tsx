import { CubeLayout } from '@ghcloud/cube-app-design'
import { Table, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

interface SortableRow {
  key: string
  name: string
  department: string
  amount: number
}

interface RowSeed {
  key: string
  nameKey: string
  departmentKey: string
  amount: number
}

const ROW_SEEDS: RowSeed[] = [
  { key: '1', nameKey: 'personZhouBei', departmentKey: 'deptRd', amount: 1280 },
  { key: '2', nameKey: 'personChenNan', departmentKey: 'deptProduct', amount: 960 },
  { key: '3', nameKey: 'personLinDong', departmentKey: 'deptRd', amount: 1420 },
  { key: '4', nameKey: 'personWangXi', departmentKey: 'deptOps', amount: 720 },
  { key: '5', nameKey: 'personZhaoZhong', departmentKey: 'deptRd', amount: 1100 },
]

/**
 * Batch-2 S14：`CubeLayout` + 静态表格，列开启 `sorter: true`（Ant Design Vue 默认比较）。
 */
export const ShowcaseSceneS14 = defineComponent({
  name: 'ShowcaseSceneS14',
  setup: () => {
    const { pageTitle } = usePageName()

    const sceneMessages = {
      'zh-CN': {
        showcaseSceneS14Title: 'Showcase · S14 表格排序',
        colName: '名称',
        colAmount: '金额',
        colDepartment: '部门',
        personZhouBei: '周北',
        personChenNan: '陈南',
        personLinDong: '林东',
        personWangXi: '王西',
        personZhaoZhong: '赵中',
        deptRd: '研发',
        deptProduct: '产品',
        deptOps: '运营',
      },
      'en-US': {
        showcaseSceneS14Title: 'Showcase · S14 Table sorting',
        colName: 'Name',
        colAmount: 'Amount',
        colDepartment: 'Department',
        personZhouBei: 'Zhou Bei',
        personChenNan: 'Chen Nan',
        personLinDong: 'Lin Dong',
        personWangXi: 'Wang Xi',
        personZhaoZhong: 'Zhao Zhong',
        deptRd: 'R&D',
        deptProduct: 'Product',
        deptOps: 'Operations',
      },
    }

    const { t, locale } = useI18n({ inheritLocale: true, useScope: 'local', messages: sceneMessages })

    const tableModel = computed(() => {
      const _ignoreLocale = locale.value
      const columns: ColumnType<SortableRow>[] = [
        {
          title: t('colName'),
          dataIndex: 'name',
          key: 'name',
          sorter: true,
        },
        {
          title: t('colAmount'),
          dataIndex: 'amount',
          key: 'amount',
          sorter: true,
        },
        {
          title: t('colDepartment'),
          dataIndex: 'department',
          key: 'department',
        },
      ]
      const dataSource: SortableRow[] = ROW_SEEDS.map((row) => ({
        key: row.key,
        name: t(row.nameKey),
        department: t(row.departmentKey),
        amount: row.amount,
      }))
      return { columns, dataSource }
    })

    const slots = {
      'layout-content': (): JSX.Element => (
        <Table
          columns={tableModel.value.columns}
          dataSource={tableModel.value.dataSource}
          rowKey='key'
          pagination={false}
          size='small'
        />
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || t('showcaseSceneS14Title')} v-slots={slots} showTableXScroll />
    )
  },
})
