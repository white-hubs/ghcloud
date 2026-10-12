import { defineComponent, reactive, shallowRef, type PropType, watch } from "vue";

import { Page, PopOver } from "@ghcloud/cube-ui";

import { cubeDeviceCenterService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { CubeLayout } from "../../../base-components/cube-layout/cube-layout";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { AreaTreeSelect } from "../../area-tree-select/area-tree-select";
import { IotProductCategoryTreeSelect } from "../../iot-device-components/iot-product-category-tree-select/iot-product-category-tree-select";
import { DeptCascaderSelect } from "../../ouaa-components/dept-cascader-select";
import { ProductSelect } from "../../product-select/product-select";
import { DeviceTagSelect } from "../device-tag-select/device-tag-select";

export interface DeviceSelectRecord {
  id: string | number;
  fireManageDeviceId?: string | number;
  deviceId?: string | number;
  code?: string;
  name?: string;
  category?: string;
  product?: string;
  brand?: string;
  region?: string;
  model?: string;
  lntAndLat?: string;
  status?: { onlineState?: boolean };
  area?: { id?: string; name?: string; pathName?: string };
  productInfo?: {
    id?: string | number;
    name?: string;
    modelName?: string;
    brandName?: string;
    productCategory?: { code?: string; name?: string; pathCode?: string };
  };
}

export interface DeviceSelectQuery {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  productId?: string;
  categoryCode?: string;
  brandName?: string;
  areaId?: string;
  departmentId?: string;
  tagCodes?: string[];
}

export interface DeviceSelectPage {
  records?: DeviceSelectRecord[];
  total?: number;
  pages?: number;
}

type FilterField = "keyword" | "productId" | "categoryCode" | "brandName" | "areaId" | "departmentId" | "tagCodes";

interface Props {
  title: string;
  value: DeviceSelectRecord[];
  multiple?: boolean;
  disabled?: boolean;
  unSelectedData?: DeviceSelectRecord[]; // 禁止选择的对象
  /** 表格 body 滚动高度，用于弹窗等固定高度容器 */
  scrollY?: number;
  /** 固定查询参数，例如业务标签、应用编码等。 */
  queryParams?: Record<string, unknown>;
  pageSize?: number;
  /** 弹窗内设为 false，避免分页读写外层页面的 URL。 */
  syncToUrl?: boolean;
  filterFields?: FilterField[];
  fetchPage?: (query: DeviceSelectQuery) => Promise<DeviceSelectPage>;
}
export const DeviceSelectTable = defineComponent({
  props: {
    title: { type: String, default: "" },
    value: { type: Array as PropType<DeviceSelectRecord[]>, default: () => [] },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    unSelectedData: { type: Array as PropType<DeviceSelectRecord[]>, default: () => [] },
    scrollY: { type: Number, default: undefined },
    queryParams: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    pageSize: { type: Number, default: 10 },
    syncToUrl: { type: Boolean, default: true },
    filterFields: {
      type: Array as PropType<FilterField[]>,
      default: () => ["productId", "categoryCode", "areaId", "departmentId", "tagCodes", "keyword"],
    },
    fetchPage: { type: Function as PropType<(query: DeviceSelectQuery) => Promise<DeviceSelectPage>>, default: undefined },
  },
  emits: ["update:value"],
  setup(props: Props, { emit }) {
    const page = reactive({
      pageNumber: 1,
      pageSize: props.pageSize ?? 10,
      total: 0,
    });
    const selectedRecordMap = shallowRef(new Map<string, DeviceSelectRecord>());

    watch(
      () => props.value,
      (newVal) => {
        const nextRecordMap = new Map(selectedRecordMap.value);
        (newVal ?? []).forEach((record) => nextRecordMap.set(String(record.id), record));
        selectedRecordMap.value = nextRecordMap;
        tableApi.setSelectedRowKeys((newVal ?? []).map((record) => record.id));
      },
    );

    const searchFormSchema = {
      productId: {
        component: ProductSelect,
        label: "所属产品",
        fieldName: "productId",
        componentProps: {
          allowClear: true,
          placeholder: "所属产品",
        },
      },
      categoryCode: {
        component: IotProductCategoryTreeSelect,
        label: "产品品类",
        fieldName: "categoryCode",
        componentProps: {
          allowClear: true,
          placeholder: "产品品类",
        },
      },
      brandName: {
        component: "Input",
        label: "设备品牌",
        fieldName: "brandName",
        componentProps: { allowClear: true, placeholder: "设备品牌" },
      },
      areaId: {
        component: AreaTreeSelect,
        label: "所在区域",
        fieldName: "areaId",
        componentProps: {
          allowClear: true,
          placeholder: "所在区域",
        },
      },
      departmentId: {
        component: DeptCascaderSelect,
        label: "维护部门",
        fieldName: "departmentId",
        componentProps: {
          allowClear: true,
          placeholder: "维护部门",
        },
      },
      tagCodes: {
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
      keyword: {
        component: "Input",
        label: "设备名称",
        fieldName: "keyword",
        componentProps: {
          placeholder: "设备名称",
        },
      },
    } satisfies Record<FilterField, Record<string, unknown>>;
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      cache: false,
      handleSubmit: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      schema: props.filterFields?.map((field) => searchFormSchema[field]) ?? [],
      showCollapseButton: true,
    });
    const columns = [
      {
        title: "设备编号",
        dataIndex: "code",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "productInfo",
        width: 150,
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
        width: 150,
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
        width: 120,
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
        width: 150,
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
      scrollY: props.scrollY,
      rowSelection: (props.multiple ?? false) ? "checkbox" : "radio",
      fetchApi: async () => {
        const query: DeviceSelectQuery = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: (formApi.formValues.keyword as string) ?? "",
          tagCodes: (formApi.formValues.tagCodes as string[]) ?? [],
          departmentId: (formApi.formValues.departmentId as string) ?? "",
          areaId: (formApi.formValues.areaId as string) ?? "",
          productId: (formApi.formValues.productId as string) ?? "",
          categoryCode: (formApi.formValues.categoryCode as string) ?? "",
          brandName: (formApi.formValues.brandName as string) ?? "",
        };
        if (props.fetchPage) return props.fetchPage(query);
        return cubeDeviceCenterService.getDeviceInstancePageAll({
          ...(props.queryParams ?? {}),
          pageNumber: query.pageNumber,
          pageSize: query.pageSize,
          keyword: query.keyword,
          tagCodes: query.tagCodes,
          anyMatchedDepartmentId: query.departmentId,
          anyMatchedAreaId: query.areaId,
          productId: query.productId,
          categoryCode: query.categoryCode,
        });
      },
      getCheckboxProps: (record: Record<string, unknown>) => {
        const isDisabled = props.unSelectedData?.some((item) => String(item.id) === String(record.id)) ?? false;
        return {
          disabled: props.disabled || isDisabled,
        };
      },
      rowSelectionChange: (keys, rows) => {
        const nextRecordMap = new Map(selectedRecordMap.value);
        (rows as DeviceSelectRecord[]).forEach((record) => nextRecordMap.set(String(record.id), record));
        selectedRecordMap.value = nextRecordMap;
        const selectedValues = keys
          .map((key) => nextRecordMap.get(String(key)))
          .filter((record): record is DeviceSelectRecord => Boolean(record));
        emit("update:value", selectedValues);
      },
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });
    selectedRecordMap.value = new Map(props.value.map((record) => [String(record.id), record]));
    tableApi.setSelectedRowKeys(props.value.map((record) => record.id));

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageSize === page.pageSize ? pageNumber : 1;
      page.pageSize = pageSize;
      tableApi.query();
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div class="cube-device-select-table__content">
          <CubeForm class="cube-device-select-table__filters" />
          <CubeTable class="cube-device-select-table__table" />
        </div>
      ),
      "footer-btn": (): JSX.Element => (
        <>
          <span style={{ marginRight: "10px" }}>已选{props.value.length}项</span>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          syncToUrl={props.syncToUrl}
          onPageChange={handleChange}
        />
      ),
    };
    return (): JSX.Element => <CubeLayout class="cube-device-select-table" v-slots={slots} showHeader={false}></CubeLayout>;
  },
});
