import { defineComponent, ref, reactive, watch } from "vue";

import { Page, PopOver } from "@ghcloud/cube-ui";

import { cubeMaintainService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { AreaTreeSelect } from "../../area-tree-select/area-tree-select";

interface SelectOption {
  id: string;
  name: string;
}

interface Props {
  title: string;
  value: SelectOption[];
  multiple?: boolean;
  unSelectedData?: SelectOption[];
  scrollY?: number;
}
export const PatrolPointSelectTable = defineComponent({
  props: ["title", "value", "multiple", "unSelectedData", "scrollY"],
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const selectedValues = ref<SelectOption[]>(props.value ?? []);
    const selectedRowKeys = ref<string[]>(props.value ? props.value.map((e) => e.id) : []);

    watch(
      () => props.value,
      (newVal) => {
        selectedValues.value = newVal ?? [];
        selectedRowKeys.value = selectedValues.value.map((e) => e.id);
        tableApi.setSelectedRowKeys(selectedRowKeys.value);
      },
    );

    const searchFormSchema = [
      {
        component: AreaTreeSelect,
        label: "所属区域",
        fieldName: "areaId",
        componentProps: {
          allowClear: true,
          placeholder: "所属区域",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡更点名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
      cache: false,
    });
    const columns = [
      {
        title: "名称",
        dataIndex: "patrolLocationName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "区域",
        dataIndex: "area",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: { name: string }[] }): JSX.Element => {
          const name = text.map((e) => e.name).join("/");
          return <PopOver content={name || "--"}>{name || "--"}</PopOver>;
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "patrol-point-select-table",
      scrollY: props.scrollY,
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: (formApi.formValues.keyword as string) ?? "",
          areaId: (formApi.formValues.areaId as string) ?? "",
        };
        return cubeMaintainService.patrolPage(params);
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
        return {
          disabled: isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys as string[];
        selectedValues.value = (rows as { id: string; patrolLocationName: string }[]).map((e) => ({
          ...e,
          id: e.id,
          name: e.patrolLocationName,
        }));
        emit("update:value", selectedValues.value);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });
    tableApi.setSelectedRowKeys(selectedRowKeys.value);

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-btn": (): JSX.Element => (
        <>
          <span style={{ marginRight: "10px" }}>已选{selectedValues.value.length}项</span>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
      ),
    };
    return (): JSX.Element => <CubeLayout v-slots={slots} showHeader={false}></CubeLayout>;
  },
});
