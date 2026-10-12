import { cubeBusinessTagService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { DeviceTagSelect } from "../../../business-components/device-components/device-tag-select/device-tag-select";
import { AreaTreeSelect } from "../../area-tree-select/area-tree-select";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { ProductSelect } from "../../product-select/product-select";
import { Page, PopOver } from "@ghcloud/cube-ui";
import { defineComponent, ref, reactive, watch } from "vue";

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
export const TagDeviceSelectTable = defineComponent({
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
      },
    );

    const searchFormSchema = [
      {
        component: ProductSelect,
        label: "所属产品",
        fieldName: "productId",
        componentProps: {
          allowClear: true,
          placeholder: "所属产品",
        },
      },
      {
        component: AreaTreeSelect,
        label: "所在区域",
        fieldName: "anyMatchedAreaId",
        componentProps: {
          allowClear: true,
          placeholder: "所在区域",
        },
      },
      {
        component: DeptCascaderSelect,
        label: "维护部门",
        fieldName: "anyMatchedDepartmentId",
        componentProps: {
          allowClear: true,
          placeholder: "维护部门",
        },
      },
      {
        component: DeviceTagSelect,
        label: "设备标签",
        fieldName: "tagCodes",
        defaultValue: [],
        componentProps: {
          allowClear: true,
          placeholder: "设备标签",
          multiple: true,
          maxTagCount: 3,
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "设备名称",
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
    });
    const columns = [
      {
        title: "设备编号",
        dataIndex: "code",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "productInfo",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: { productInfo: { name: string } } }): JSX.Element => {
          const res = record.productInfo?.name;
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
      {
        title: "产品品类",
        dataIndex: "productInfo",
        ellipsis: true,
        align: "center",
        customRender: ({
          record,
        }: {
          record: { productInfo: { productCategory: { name: string } }; deviceProdCategoryName: string };
        }): JSX.Element => {
          const res = record.productInfo?.productCategory?.name;
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
      {
        title: "维护部门",
        dataIndex: "department",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: { department: { name: string } } }): JSX.Element => {
          const res = record.department ? record.department?.name || "--" : "--";
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        align: "center",
        ellipsis: true,
        customRender: ({ record }: { record: { area: { pathName: string }; areaName: string } }): JSX.Element => {
          const res = record.area?.pathName;
          return <PopOver content={res || "--"}>{res || "--"}</PopOver>;
        },
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "device-select-table",
      rowKey: "id",
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          name: (formApi.formValues.keyword as string) ?? "",
          tagIds: (formApi.formValues.tagIds as string[]) ?? [],
          deptId: (formApi.formValues.anyMatchedDepartmentId as string) ?? "",
          tagCodes: (formApi.formValues.tagCodes as string[]) ?? [],
          anyMatchedAreaId: (formApi.formValues.anyMatchedAreaId as string) ?? "",
          productId: (formApi.formValues.productId as string) ?? "",
        };
        return cubeBusinessTagService.getTagDevicePageList(params);
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => item.id === record.id) ?? false;
        return {
          disabled: isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        selectedRowKeys.value = keys as string[];
        selectedValues.value = (rows as { id: string; name: string; code: string; tagIds: string[]; tagNames: string }[]).map((e, i) => ({
          id: e?.id || (keys[i] as string),
          name: e?.name || "--",
          code: e?.code || "",
          tagIds: e?.tagIds || [],
          tagNames: e?.tagNames || "--",
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
