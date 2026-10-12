import { defineComponent, ref, reactive, watch } from "vue";

import { Page, PopOver } from "@ghcloud/cube-ui";

import { cubeAssetManagementService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { PropertyTypeSelect } from "../property-type-select/property-type-select";

interface SelectOption {
  id: string;
  name: string;
}

interface Props {
  title: string;
  value: SelectOption[];
  multiple?: boolean;
  unSelectedData?: SelectOption[]; // 禁止选择的对象
  scrollY?: number;
}
export const PropertySelectTable = defineComponent({
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
        component: PropertyTypeSelect,
        label: "类型",
        fieldName: "typeId",
        componentProps: {
          allowClear: true,
          placeholder: "资产类型",
        },
      },
      {
        component: DeptCascaderSelect,
        label: "部门",
        fieldName: "receiveDepId",
        componentProps: {
          allowClear: true,
          placeholder: "使用部门",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "资产名称",
        },
      },
    ];
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
        dataIndex: "receiveDepName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "区域",
        dataIndex: "areaName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "property-select-table",
      scrollY: props.scrollY,
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: (formApi.formValues.keyword as string) ?? "",
          typeId: (formApi.formValues.typeId as string) ?? "",
          receiveDepId: (formApi.formValues.receiveDepId as string) ?? "",
          status: "",
          areaId: "",
          sourceId: "",
          purchaseStartDate: "",
          purchaseEndDate: "",
          usageDate: "",
        };
        return cubeAssetManagementService.getPropertyDetailedPage(params);
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

        const prevMap = new Map(selectedValues.value.map((v) => [v.id, v]));
        const rowList = Array.isArray(rows) ? (rows as ((Record<string, unknown> & { id?: string; name?: string }) | undefined)[]) : [];

        const rowById = new Map(
          rowList
            .filter((r): r is Record<string, unknown> & { id: string; name?: string } => !!r && r.id !== undefined)
            .map((r) => [String(r.id), r]),
        );

        selectedValues.value = keyList.map((id) => {
          const row = rowById.get(id);
          const previous = prevMap.get(id);
          return {
            ...(previous ?? {}),
            ...(row ?? {}),
            id,
            name: row?.name ?? previous?.name ?? "",
          };
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
