import { cubeBusinessTagService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { InspectPointTypeSelect } from "../../../business-components/inspect-components/inspect-point-type-select/inspect-point-type-select";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { BusinessTagSelect } from "../business-tag-select/business-tag-select";
import { Page, PopOver } from "@ghcloud/cube-ui";
import { defineComponent, ref, reactive, watch, onMounted } from "vue";

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
  unSelectedData?: SelectOption[];
}
export const TagInspectPointSelectTable = defineComponent({
  props: ["title", "value", "multiple", "unSelectedData"],
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
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          name: (formApi.formValues.pointName as string) ?? "",
          tagIds: (formApi.formValues.tagIds as string[]) ?? [],
          depId: (formApi.formValues.receiveDepId as string) ?? "",
          typeId: (formApi.formValues.typeId as string) ?? "",
        };
        return cubeBusinessTagService.getTagSitePointPageList(params);
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
        return {
          disabled: isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys as string[];
        selectedValues.value = (rows as { id: string; name: string; codeNum: string; tagIds: string[]; tagNames: string }[]).map((e) => ({
          id: e.id,
          name: e.name || "--",
          code: e.codeNum ?? "",
          tagIds: e?.tagIds || [],
          tagNames: e.tagNames || "--",
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
