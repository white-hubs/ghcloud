import type { TableRowSelection, Key } from "ant-design-vue/es/table/interface";
import { computed, defineComponent, onMounted, type PropType, ref, watch } from "vue";

import { CubeCustomTableColumnModal, getAliasTableColumn, initAliasManagePluginAuth } from "@ghcloud/cube-business-alias-manage-plugin";
import { message, SettingOutlined, Table, type ColumnType } from "@ghcloud/cube-ui";

import { getAppAuthStore } from "../../../../utils";
export const AliasTable = defineComponent({
  props: {
    rowKey: {
      type: String,
      default: "id",
    },
    rowSelection: {
      type: Object as () => TableRowSelection<unknown> | null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    dataSource: {
      type: Array as () => unknown[],
      default: () => [],
    },
    tableCode: {
      type: String,
      require: true,
      default: "",
    },
    columns: {
      type: Array as () => ColumnType[],
      default: () => [],
    },
    defaultExpandedRowKeys: {
      type: Array as () => Key[],
      default: () => [],
    },
    scrollX: {
      type: Number,
    },
    scrollY: {
      type: Number,
    },
    pagination: {
      type: [Boolean, Object] as PropType<boolean | Record<string, unknown>>,
      default: false,
    },
    customRow: {
      type: Function,
    },
  },
  emits: ["change"],
  setup: (props, { emit }) => {
    const visible = ref(false);
    const appAuthStore = getAppAuthStore();
    // 测试使用
    const { applicationCode } = appAuthStore;
    const { authStore } = appAuthStore;
    const alisaColumns = ref<ColumnType[]>([]);
    const scrollY = ref<number | undefined>(undefined);
    const getAliasConfig = async (): Promise<void> => {
      const { columns } = await getAliasTableColumn({
        applicationCode,
        tableCode: props.tableCode,
        columns: props.columns.map((e) => ({
          ...e,
          code: e.dataIndex as string,
          title: e.title as string,
        })),
      });
      const leftFixed = columns.filter((column) => column.fixed === "left" || column.fixed === true);
      const rightFixed = columns.filter((column) => column.fixed === "right");
      const normal = columns.filter((column) => column.fixed !== "left" && column.fixed !== true && column.fixed !== "right");
      alisaColumns.value = [...leftFixed, ...normal, ...rightFixed];
    };
    onMounted(() => {
      calcScrollY();
      if (!props.tableCode) {
        alisaColumns.value = props.columns;
        return;
      }
      initAliasManagePluginAuth({
        tenant: String(authStore.tenant),
        token: authStore.token,
      });
      getAliasConfig();
    });
    watch(
      () => props.columns,
      () => {
        if (!props.tableCode) {
          alisaColumns.value = props.columns;
          return;
        }
        getAliasConfig();
      },
    );
    const calcScrollX = computed(() => {
      const scrollX = alisaColumns.value.reduce((acc, cur) => {
        // 提取出字符串中的数字部分
        if (cur.width && Object.prototype.toString.call(cur.width) === "[object String]") {
          cur.width = (cur.width as string).replace(/[^\d]/g, "");
        }
        return acc + Number(cur.width ?? 180);
      }, 0);
      return props.scrollX ?? scrollX;
    });
    const calcScrollY = (): void => {
      const layoutContent = document.getElementById("cube-layout-content");
      const searchContent = document.getElementById("cube-query-form-container");
      if (!layoutContent) {
        scrollY.value = undefined;
        return;
      }
      if (!searchContent) {
        scrollY.value = undefined;
        return;
      }
      scrollY.value = layoutContent.clientHeight - searchContent.clientHeight - 40;
    };

    return (): JSX.Element => (
      <>
        <Table
          {...props}
          rowKey={props.rowKey}
          rowSelection={props.rowSelection}
          defaultExpandedRowKeys={props.defaultExpandedRowKeys}
          columns={alisaColumns.value}
          loading={props.loading}
          dataSource={props.dataSource}
          pagination={props.pagination ?? false}
          size="small"
          scrollX={calcScrollX.value ?? 0}
          scrollY={props.scrollY ?? scrollY.value}
          v-slots={{
            headerCell: (data: { column: { dataIndex: string }; title: string }) => {
              if (
                alisaColumns.value.findIndex((e) => e.dataIndex === data.column.dataIndex) === alisaColumns.value.length - 1 &&
                props.tableCode
              ) {
                return (
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:space-between">
                    <span>{data.title} </span>
                    <SettingOutlined
                      style="cursor:pointer;"
                      onClick={() => {
                        visible.value = true;
                      }}
                    />
                  </div>
                );
              }
              return data.title;
            },
          }}
        />
        {props.tableCode && (
          <CubeCustomTableColumnModal
            v-model:visible={visible.value}
            columns={props.columns.map((e) => ({
              ...e,
              code: e.dataIndex as string,
              title: e.title as string,
            }))}
            applicationCode={applicationCode}
            tableCode={props.tableCode}
            onSave={() => {
              getAliasConfig();
              emit("change", alisaColumns.value);
            }}
            onError={(msg) => message.error(msg)}
          />
        )}
      </>
    );
  },
});
