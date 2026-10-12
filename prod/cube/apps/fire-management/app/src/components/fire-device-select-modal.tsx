import { defineComponent, nextTick, reactive, shallowRef, type PropType, watch } from "vue";

import {
  AreaTreeSelect,
  DeviceTagSelect,
  IotProductCategoryTreeSelect,
  ProductSelect,
  useCubeForm,
  useCubeModal,
  useCubeTable,
} from "@ghcloud/cube-app-design";
import type { FireHostCandidateRecord } from "@ghcloud/cube-service-interface/fire-management";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { listFireHostCandidates } from "@ghcloud/cube-services-client/fire-management.client";
import { Button, Page, PopOver, message } from "@ghcloud/cube-ui";

import styles from "./fire-device-select-modal.module.less";

type SubmitResult = boolean | void | Promise<boolean | void>;
type FilterField = "productId" | "deviceProdCategoryCode" | "categoryCode" | "brandName" | "areaId" | "tagCodes" | "keyword";

export interface FireDeviceSelectionRecord {
  id: string | number;
  fireManageDeviceId?: string | number;
  deviceId?: string | number;
  code?: string;
  name?: string;
  category?: string;
  product?: string;
  brand?: string;
  region?: string;
  lntAndLat?: string;
  status?: { onlineState?: boolean };
  area?: { id?: string; name?: string; pathName?: string };
  productInfo?: {
    id?: string | number;
    name?: string;
    brandCode?: string;
    brandName?: string;
    productCategory?: { code?: string; name?: string; pathCode?: string };
  };
}

export interface FireDeviceSelectModalExpose {
  openModal: (selectedDevices?: FireDeviceSelectionRecord[]) => void;
  closeModal: () => void;
}

export interface FireDeviceSelectQuery {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  productId?: string;
  deviceProdCategoryCode?: string;
  categoryCode?: string;
  brandName?: string;
  areaId?: string;
  tagCodes?: string[];
}

export interface FireDeviceSelectPage {
  records?: FireDeviceSelectionRecord[];
  total?: number;
  pages?: number;
}

interface QueryParams {
  ids?: Array<string | number>;
  tagCodes?: string[];
  filterDeviceIds?: Array<string | number>;
}

const asIds = (value: unknown): Array<string | number> =>
  Array.isArray(value) ? value.filter((item): item is string | number => typeof item === "string" || typeof item === "number") : [];
const asCodes = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
const text = (value?: string): string => value || "--";
const TABLE_HEADER_HEIGHT = 56;
const MIN_TABLE_BODY_HEIGHT = 120;

const mapRecord = (record: FireHostCandidateRecord): FireDeviceSelectionRecord => ({
  id: record.deviceId ?? record.code ?? record.id,
  fireManageDeviceId: record.id,
  deviceId: record.deviceId ?? record.code ?? record.id,
  code: record.code ?? "",
  name: record.deviceName,
  category: record.deviceProdCategoryName ?? "",
  product: record.deviceProdName ?? "",
  brand: record.brandName ?? "",
  region: record.areaName ?? "",
  lntAndLat: record.lntAndLat ?? "",
  status: { onlineState: record.deviceStatus },
  area: { id: record.areaId ?? "", name: record.areaName ?? "", pathName: record.areaName ?? "" },
  productInfo: {
    id: record.deviceProdId ?? "",
    name: record.deviceProdName ?? "",
    brandName: record.brandName ?? "",
    productCategory: {
      code: record.deviceProdCategoryCode ?? "",
      name: record.deviceProdCategoryName ?? "",
      pathCode: record.deviceProdCategoryCodeConcat ?? "",
    },
  },
});

/** 消防管理本地设备选择组件，直接维护候选主机接口与筛选参数。 */
export const FireDeviceSelectModal = defineComponent({
  name: "FireDeviceSelectModal",
  props: {
    visible: { type: Boolean, default: undefined },
    title: { type: String, default: "选择设备" },
    width: { type: String, default: "1280px" },
    multiple: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    selectedDevices: { type: Array as PropType<FireDeviceSelectionRecord[]>, default: () => [] },
    unSelectedData: { type: Array as PropType<FireDeviceSelectionRecord[]>, default: () => [] },
    queryParams: { type: Object as PropType<QueryParams>, default: undefined },
    pageSize: { type: Number, default: 20 },
    filterFields: {
      type: Array as PropType<FilterField[]>,
      default: () => ["productId", "deviceProdCategoryCode", "areaId", "tagCodes", "keyword"],
    },
    fetchPage: { type: Function as PropType<(query: FireDeviceSelectQuery) => Promise<FireDeviceSelectPage>>, default: undefined },
    submit: { type: Function as PropType<(devices: FireDeviceSelectionRecord[]) => SubmitResult>, default: undefined },
    requireSelection: { type: Boolean, default: false },
    confirmText: { type: String, default: "确定" },
    cancelText: { type: String, default: "取消" },
    footerTip: { type: String, default: "" },
  },
  emits: ["update:visible", "confirm", "closed", "selectionChange"],
  setup(props, { emit, expose }) {
    const page = reactive({ pageNumber: 1, pageSize: props.pageSize, total: 0 });
    const selected = shallowRef<FireDeviceSelectionRecord[]>([]);
    const selectedMap = shallowRef(new Map<string, FireDeviceSelectionRecord>());
    const tableRegionRef = shallowRef<HTMLDivElement | null>(null);
    let resizeObserver: ResizeObserver | undefined;

    const fields = {
      productId: {
        component: ProductSelect,
        label: "所属产品",
        fieldName: "productId",
        componentProps: { allowClear: true, placeholder: "所属产品" },
      },
      deviceProdCategoryCode: {
        component: IotProductCategoryTreeSelect,
        label: "产品品类",
        fieldName: "deviceProdCategoryCode",
        componentProps: { allowClear: true, placeholder: "产品品类" },
      },
      categoryCode: {
        component: IotProductCategoryTreeSelect,
        label: "产品品类",
        fieldName: "categoryCode",
        componentProps: { allowClear: true, placeholder: "产品品类" },
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
        componentProps: { allowClear: true, placeholder: "所在区域" },
      },
      tagCodes: {
        component: DeviceTagSelect,
        label: "设备标签",
        fieldName: "tagCodes",
        defaultValue: [],
        componentProps: { allowClear: true, placeholder: "设备标签", multiple: true, maxTagCount: 3 },
      },
      keyword: {
        component: "Input",
        label: "设备名称",
        fieldName: "keyword",
        componentProps: { allowClear: true, placeholder: "设备名称" },
      },
    } satisfies Record<FilterField, Record<string, unknown>>;
    const [SearchForm, formApi] = useCubeForm({
      layout: "horizontal",
      cache: false,
      schema: props.filterFields.map((field) => fields[field]),
      showCollapseButton: true,
      handleSubmit: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        page.pageNumber = 1;
        tableApi.query();
      },
    });
    const columns = [
      {
        title: "设备编号",
        dataIndex: "code",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ text: value }: { text?: string }) => <PopOver content={text(value)}>{text(value)}</PopOver>,
      },
      {
        title: "设备名称",
        dataIndex: "name",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ text: value }: { text?: string }) => <PopOver content={text(value)}>{text(value)}</PopOver>,
      },
      {
        title: "所属产品",
        dataIndex: "productInfo",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: FireDeviceSelectionRecord }) => (
          <PopOver content={text(record.productInfo?.name)}>{text(record.productInfo?.name)}</PopOver>
        ),
      },
      {
        title: "产品品类",
        dataIndex: "category",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: FireDeviceSelectionRecord }) => (
          <PopOver content={text(record.productInfo?.productCategory?.name)}>{text(record.productInfo?.productCategory?.name)}</PopOver>
        ),
      },
      {
        title: "所在区域",
        dataIndex: "area",
        width: 150,
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: FireDeviceSelectionRecord }) => (
          <PopOver content={text(record.area?.pathName || record.area?.name)}>{text(record.area?.pathName || record.area?.name)}</PopOver>
        ),
      },
    ];
    const [DeviceTable, tableApi] = useCubeTable({
      autoFetch: false,
      columns,
      tableCode: "fire-device-select-table",
      rowKey: "id",
      rowSelection: props.multiple ? "checkbox" : "radio",
      fetchApi: async () => {
        const query: FireDeviceSelectQuery = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: String(formApi.formValues.keyword ?? ""),
          areaId: String(formApi.formValues.areaId ?? ""),
          tagCodes: asCodes(formApi.formValues.tagCodes),
          productId: String(formApi.formValues.productId ?? ""),
          deviceProdCategoryCode: String(formApi.formValues.deviceProdCategoryCode ?? ""),
          categoryCode: String(formApi.formValues.categoryCode ?? ""),
          brandName: String(formApi.formValues.brandName ?? ""),
        };
        if (props.fetchPage) return props.fetchPage(query);
        const fixedTagCodes = asCodes(props.queryParams?.tagCodes);
        const result = await useAuthRequest(() =>
          listFireHostCandidates({
            pageNumber: query.pageNumber,
            pageSize: query.pageSize,
            keyword: query.keyword,
            areaId: query.areaId,
            tagCodes: [...new Set([...fixedTagCodes, ...(query.tagCodes ?? [])])],
            productId: query.productId,
            deviceProdCategoryCode: query.deviceProdCategoryCode,
            ids: asIds(props.queryParams?.ids),
            filterDeviceIds: asIds(props.queryParams?.filterDeviceIds),
          }),
        );
        return { ...result, records: (result.records ?? []).map(mapRecord) };
      },
      fetchLoaded: (result) => {
        page.total = result.total;
      },
      getCheckboxProps: (record: Record<string, unknown>) => ({
        disabled: Boolean(props.disabled || props.unSelectedData.some((item) => item.id === record.id)),
      }),
      rowSelectionChange: (keys, rows) => {
        const next = new Map(selectedMap.value);
        (rows as FireDeviceSelectionRecord[]).forEach((record) => next.set(String(record.id), record));
        selectedMap.value = next;
        selected.value = keys.map((key) => next.get(String(key))).filter((record): record is FireDeviceSelectionRecord => Boolean(record));
        if (!props.multiple) selected.value = selected.value.slice(0, 1);
        emit("selectionChange", [...selected.value]);
      },
    });
    const sync = (devices: FireDeviceSelectionRecord[]): void => {
      selected.value = [...devices];
      selectedMap.value = new Map(devices.map((device) => [String(device.id), device]));
      tableApi.setSelectedRowKeys(devices.map((device) => device.id));
    };
    const updateTableHeight = (): void => {
      const height = tableRegionRef.value?.clientHeight ?? 0;
      if (height <= 0) return;
      tableApi.setState({ scrollY: Math.max(MIN_TABLE_BODY_HEIGHT, height - TABLE_HEADER_HEIGHT) });
    };
    const observe = (): void => {
      resizeObserver?.disconnect();
      if (!tableRegionRef.value) return;
      resizeObserver = new ResizeObserver(updateTableHeight);
      resizeObserver.observe(tableRegionRef.value);
      updateTableHeight();
    };
    const resetFilters = (): void => {
      formApi.setFormValues({
        productId: null,
        deviceProdCategoryCode: null,
        categoryCode: null,
        brandName: null,
        areaId: null,
        tagCodes: [],
        keyword: null,
      });
      page.pageNumber = 1;
      page.pageSize = props.pageSize;
      page.total = 0;
    };
    const closeModal = (): void => modalApi.close();
    const openModal = (devices: FireDeviceSelectionRecord[] = props.selectedDevices): void => {
      page.pageNumber = 1;
      page.pageSize = props.pageSize;
      sync(devices);
      modalApi.open();
      void nextTick().then(() => {
        observe();
        tableApi.query();
      });
    };
    const confirm = async (): Promise<void> => {
      if (props.requireSelection && !selected.value.length) {
        message.warning("请至少选择一个设备");
        return;
      }
      modalApi.setConfirmLoading(true);
      try {
        if ((await props.submit?.([...selected.value])) === false) return;
        emit("confirm", [...selected.value]);
        closeModal();
      } finally {
        modalApi.setConfirmLoading(false);
      }
    };
    const [SelectionModal, modalApi] = useCubeModal({
      title: props.title,
      width: props.width,
      centered: true,
      closeOnClickModal: false,
      wrapperClass: styles["device-select-modal"],
      onConfirm: () => void confirm(),
      onClosed: () => {
        resizeObserver?.disconnect();
        resetFilters();
        emit("update:visible", false);
        emit("closed");
      },
    });
    watch(
      () => props.visible,
      (value) => {
        if (value) openModal();
        else if (modalApi.state.isOpen) closeModal();
      },
      { immediate: true },
    );
    watch(
      () => props.selectedDevices,
      (devices) => {
        if (modalApi.state.isOpen) sync(devices);
      },
    );
    const changePage = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      tableApi.query();
    };
    expose({ openModal, closeModal } satisfies FireDeviceSelectModalExpose);
    return () => (
      <SelectionModal
        v-slots={{
          default: () => (
            <div class={styles["device-select-content"]}>
              <div class={styles["device-select-form"]}>
                <SearchForm />
              </div>
              <div ref={tableRegionRef} class={styles["device-select-table"]}>
                <DeviceTable />
              </div>
              <div class={styles["device-select-pagination"]}>
                <span class={styles["device-select-summary"]}>已选{selected.value.length}项</span>
                <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={changePage} />
              </div>
            </div>
          ),
          footer: () => (
            <div class={styles["device-select-footer"]}>
              {props.footerTip && <span class={styles["device-select-footer-tip"]}>{props.footerTip}</span>}
              <Button onClick={closeModal}>{props.cancelText}</Button>
              <Button type="primary" loading={Boolean(modalApi.state.confirmLoading)} onClick={() => modalApi.confirm()}>
                {props.confirmText}
              </Button>
            </div>
          ),
        }}
      />
    );
  },
});
