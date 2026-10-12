import { defineComponent, ref, reactive, watch, onMounted } from "vue";

import { Page, PopOver } from "@ghcloud/cube-ui";

import { cubeMaintainService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { InspectPointTypeSelect } from "../inspect-point-type-select/inspect-point-type-select";

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
export const InspectPointSelectTable = defineComponent({
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
        formApi.updateSchema(searchFormSchema);
      },
    );

    const searchFormSchema = [
      {
        component: InspectPointTypeSelect,
        label: "类型",
        fieldName: "typeId",
        componentProps: {
          allowClear: true,
          placeholder: "类型",
        },
      },
      {
        component: DeptCascaderSelect,
        label: "部门",
        fieldName: "receiveDepId",
        componentProps: {
          allowClear: true,
          placeholder: "部门",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "pointName",
        componentProps: {
          placeholder: "现场点名称",
        },
      },
    ];
    onMounted(() => {
      formApi.updateSchema(searchFormSchema);
    });
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      cache: false,
      handleSubmit: () => {
        tableApi.query();
      },
      handleReset: () => {
        tableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });
    const columns = [
      {
        title: "名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "类别",
        dataIndex: "typeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "部门",
        dataIndex: "depName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "区域",
        dataIndex: "areaName",
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "inspect-point-select-table",
      scrollY: props.scrollY,
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          pointName: (formApi.formValues.pointName as string) ?? "",
          typeId: (formApi.formValues.typeId as string) ?? "",
          receiveDepId: (formApi.formValues.receiveDepId as string) ?? "",
        };
        return cubeMaintainService.inspectPointList(params);
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
        return {
          disabled: isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        const keyList = (keys as unknown[]).map((k) => String(k));
        selectedRowKeys.value = keyList;

        const prevMap = new Map(selectedValues.value.map((v) => [v.id, v.name]));
        const rowList = Array.isArray(rows) ? (rows as Array<(Record<string, unknown> & { id?: string; name?: string }) | undefined>) : [];

        const rowById = new Map(
          rowList
            .filter((r): r is Record<string, unknown> & { id: string; name?: string } => !!r && typeof r.id !== "undefined")
            .map((r) => [String(r.id), r]),
        );

        selectedValues.value = keyList.map((id) => {
          const row = rowById.get(id);
          const name = typeof row?.name === "string" ? row.name : (prevMap.get(id) ?? "");
          return {
            ...(row ?? {}),
            id,
            name,
          } as SelectOption;
        });
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
