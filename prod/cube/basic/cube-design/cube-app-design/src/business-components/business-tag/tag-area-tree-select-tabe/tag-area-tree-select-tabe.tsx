import { cubeBusinessTagService } from "../../../api/service";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import type { AreaModel } from "@ghcloud/cube-business-tag-service";
import { PopOver, Table } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, ref, watch } from "vue";

interface SelectOption {
  id: string;
  name: string;
  code: string;
  tagIds: string[];
  tagNames: string;
}

interface Props {
  title: string;
  value: SelectOption[];
  multiple?: boolean;
  checkStrictly?: boolean;
  unSelectedData?: Record<string, unknown>[];
}
export const TagAreaTreeSelectTable = defineComponent({
  props: ["title", "value", "multiple", "checkStrictly", "unSelectedData"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const dataSource = ref<AreaModel[]>([]);

    const selectedValues = ref<SelectOption[]>(props.value ?? []);
    const selectedRowKeys = ref<string[]>(props.value ? props.value.map((e) => e.id) : []);

    watch(
      () => props.value,
      (newVal) => {
        selectedValues.value = newVal ?? [];
        selectedRowKeys.value = selectedValues.value.map((e) => e.id);
      },
    );

    onMounted(() => {
      queryData();
    });

    const queryData = async (): Promise<void> => {
      const res = await cubeBusinessTagService.getTagAreaTreeList({});
      dataSource.value = res || [];
    };

    const columns = [
      {
        title: "区域名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "区域编号",
        dataIndex: "code",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];

    const slots = {
      "layout-content": (): JSX.Element => (
        <div>
          <Table
            columns={columns}
            dataSource={dataSource.value}
            rowKey="id"
            pagination={false}
            scrollY={500}
            rowSelection={{
              type: props.multiple ? "checkbox" : "radio",
              checkStrictly: props.checkStrictly ?? false,
              selectedRowKeys: selectedRowKeys.value,
              getCheckboxProps: (record: Record<string, unknown>) => {
                const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
                return {
                  disabled: isDisabled,
                };
              },
              onChange: (selectedRowKeys: string[], selectedRows: AreaModel[]) => {
                // 过滤掉父级节点
                const filteredRows = selectedRows.filter((item) => item.children === null || item.children.length === 0);
                selectedValues.value = filteredRows.map((e) => ({
                  id: e.id,
                  name: e.name,
                  code: e.code,
                  tagIds: e.tagIds || [],
                  tagNames: e.tagNames || "--",
                }));
                emit("update:value", selectedValues.value);
              },
            }}
          />
        </div>
      ),
      "footer-btn": (): JSX.Element => (
        <>
          <span style={{ marginRight: "10px" }}>已选{selectedValues.value.length}项</span>
        </>
      ),
    };
    return (): JSX.Element => <CubeLayout v-slots={slots} showHeader={false}></CubeLayout>;
  },
});
