import { defineComponent, ref, reactive, watch } from "vue";

import { Page, PopOver } from "@ghcloud/cube-ui";

import { cubeSmallEngineeringService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";

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
export const SmallEngineeringSelectTable = defineComponent({
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
        component: "Select",
        label: "状态",
        fieldName: "status",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          placeholder: "请选择状态",
          options: [
            { label: "全部", value: "" },
            { label: "进行中", value: "UNDERWAY" },
            { label: "已完成", value: "COMPLETED" },
            { label: "待验收", value: "WAIT_ACCEPT" },
          ],
        },
      },
      {
        component: DeptCascaderSelect,
        label: "监管部门",
        fieldName: "depId",
        componentProps: {
          allowClear: true,
          placeholder: "监管部门",
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "工程名称",
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
        dataIndex: "projectName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "类别",
        dataIndex: "projectTypeName",
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
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "small-engineering-select-table",
      scrollY: props.scrollY,
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: (formApi.formValues.keyword as string) ?? "",
          depId: (formApi.formValues.depId as string) ?? "",
          status: (formApi.formValues.status as string) ?? "",
        };
        return cubeSmallEngineeringService.projectScheduleList(params);
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
        return {
          disabled: isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys as string[];
        selectedValues.value = (rows as { id: string; projectName: string }[]).map((e) => ({
          ...e,
          id: e.id,
          name: e.projectName,
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
