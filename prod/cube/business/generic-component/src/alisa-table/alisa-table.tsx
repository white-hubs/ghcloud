import { authStore } from '../api/auth-store'
import { CubeCustomTableColumnModal, getAliasTableColumn, initAliasManagePluginAuth } from '@ghcloud/cube-business-alias-manage-plugin'
import { message, SettingOutlined, Table, type ColumnType } from '@ghcloud/cube-ui'
import type { TableRowSelection, Key } from 'ant-design-vue/es/table/interface'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  rowKey?: string;
  rowSelection?: TableRowSelection<unknown>;
  loading: boolean;
  dataSource: Record<string, unknown>[];
  tableCode: string;
  columns: (Record<string, unknown> & {
    code: string;
    title: string;
  })[];
  defaultExpandedRowKeys: Key[];
  scrollY?: number;
  scrollX?: number;
  applicationCode: string;
  pagination?: boolean;
}

export const AliasTable = defineComponent({
  props: ['rowKey', 'loading', 'dataSource', 'defaultExpandedRowKeys', 'tableCode', 'columns', 'scrollX', 'scrollY', 'applicationCode', 'rowSelection', 'pagination'],
  setup: (props: Props) => {
    const visible = ref(false)
    const alisaColumns = ref<ColumnType[]>([])
    onMounted(() => {
      initAliasManagePluginAuth({
        tenant: authStore.tenant,
        token: authStore.token
      })
      getAliasConfig()
    })
    watch(() => props.columns, () => {
      getAliasConfig()
    })
    const calcScrollX = computed(() => {
      const scrollX = alisaColumns.value.reduce((acc, cur) => {
        // 提取出字符串中的数字部分
        // 提取出字符串中的数字部分
        if (cur.width && Object.prototype.toString.call(cur.width) === '[object String]') {
          cur.width = (cur.width as string).replace(/[^\d]/g, '')
        }
        return acc + (Number(cur.width ?? 180))
      }, 0)
      return props.scrollX ?? scrollX
    })

    return () =>
      <>
        <Table
          rowKey={props.rowKey}
          rowSelection={props.rowSelection}
          defaultExpandedRowKeys={props.defaultExpandedRowKeys}
          columns={alisaColumns.value}
          loading={props.loading}
          dataSource={props.dataSource}
          pagination={props.pagination ?? false}
          size='small'
          scrollX={calcScrollX.value ?? 0}
          scrollY={props.scrollY}
          v-slots={{
            headerCell: (data: { column: { dataIndex: string; };title: string; }) => {
              if (alisaColumns.value.findIndex(e => e.dataIndex === data.column.dataIndex) === alisaColumns.value.length - 1 && props.tableCode) {
                return (
                  <div style='width:100%;height:100%;display:flex;align-items:center;justify-content:space-between'>
                    <span>{data.title} </span>
                    <SettingOutlined style='cursor:pointer;' onClick={() => { visible.value = true }} />
                  </div>
                )
              }
              return data.title
            }
          }}
        />
        <CubeCustomTableColumnModal
          v-model:visible={visible.value}
          columns={props.columns.map(e => {
            return {
              ...e,
              code: e.code ?? e.dataIndex
            }
          })}
          applicationCode={props.applicationCode}
          tableCode={props.tableCode}
          onSave={getAliasConfig}
          onError={(msg) => message.error(msg)}
        />
      </>
    async function getAliasConfig (): Promise<void> {
      await getAliasTableColumn({
        applicationCode: props.applicationCode,
        tableCode: props.tableCode,
        columns: props.columns.map(e => {
          return {
            ...e,
            code: e.code ?? e.dataIndex
          }
        })
      }).then((res) => {
        alisaColumns.value = res.columns
      })
    }
  }
})
