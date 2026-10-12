import { computed, defineComponent, reactive, ref } from "vue";

import { CubeLayout, UserSelect, useCubeTable } from "@ghcloud/cube-app-design";
import type { WarehouseVO } from "@ghcloud/cube-service-interface/emergency-supplies";
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  Page,
  PopConfirm,
  SearchOutlined,
  Select,
  Textarea,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";
import { useMapModal } from "@ghcloud/generic-component";

import { service } from "@/shared";

import styles from "./warehouse-list.module.less";

type WarehouseFormState = {
  id?: string;
  name: string;
  code: string;
  address: string;
  longitude?: number;
  latitude?: number;
  keeperPersonId?: string;
  remark: string;
};

const createInitialForm = (): WarehouseFormState => ({
  name: "",
  code: "",
  address: "",
  longitude: undefined,
  latitude: undefined,
  keeperPersonId: undefined,
  remark: "",
});

const normalizeNumber = (value?: number | string): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const formatCoordinateValue = (longitude?: number | string, latitude?: number | string): string => {
  const lng = normalizeNumber(longitude);
  const lat = normalizeNumber(latitude);
  if (lng === undefined || lat === undefined) {
    return "";
  }
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
};

const statusClass = (enabled?: boolean): string[] => [styles.statusTag, enabled ? styles.statusEnabled : styles.statusDisabled];

export const WarehouseList = defineComponent({
  name: "WarehouseList",
  setup: () => {
    const query = reactive({
      keyword: "",
      status: undefined as boolean | undefined,
    });
    const page = reactive({ pageNumber: 1, pageSize: 10, total: 0 });
    const modalVisible = ref(false);
    const modalTitle = ref("新增仓库");
    const submitLoading = ref(false);
    const formRef = ref<FormExpose>();
    const formState = reactive<WarehouseFormState>(createInitialForm());
    const coordinateText = computed(() => formatCoordinateValue(formState.longitude, formState.latitude));
    const { showMapModal } = useMapModal();

    const resetForm = (): void => {
      Object.assign(formState, createInitialForm());
      formState.id = undefined;
      formRef.value?.clearValidate();
    };

    const openCreateModal = (): void => {
      resetForm();
      modalTitle.value = "新增仓库";
      modalVisible.value = true;
    };

    const openEditModal = async (id: string): Promise<void> => {
      resetForm();
      modalTitle.value = "编辑仓库";
      modalVisible.value = true;
      try {
        const detail = await service.getWarehouseDetail(id);
        Object.assign(formState, {
          id: detail.id,
          name: detail.name ?? "",
          code: detail.code ?? "",
          address: detail.address ?? "",
          longitude: normalizeNumber(detail.longitude),
          latitude: normalizeNumber(detail.latitude),
          keeperPersonId: detail.keeperPersonId ? String(detail.keeperPersonId) : undefined,
          remark: detail.remark ?? "",
        });
      } catch (error) {
        modalVisible.value = false;
        message.error((error as Error)?.message ?? "仓库详情加载失败");
      }
    };

    const openMapModal = (): void => {
      showMapModal({
        title: "选择仓库位置",
        address: formState.address,
        center:
          formState.longitude !== undefined && formState.latitude !== undefined
            ? { lng: formState.longitude, lat: formState.latitude }
            : undefined,
        modalConfirm: (data) => {
          formState.longitude = data.lng;
          formState.latitude = data.lat;
          formState.address = data.address;
        },
      });
    };

    const submitWarehouse = async (): Promise<void> => {
      await formRef.value?.validate();
      submitLoading.value = true;
      try {
        const payload: Partial<WarehouseVO> = {
          name: formState.name,
          code: formState.code,
          address: formState.address,
          longitude: formState.longitude,
          latitude: formState.latitude,
          keeperPersonId: formState.keeperPersonId,
          remark: formState.remark,
        };
        if (formState.id) {
          await service.updateWarehouse(formState.id, payload);
        } else {
          await service.createWarehouse(payload);
        }
        message.success("操作成功");
        modalVisible.value = false;
        tableApi.query();
      } finally {
        submitLoading.value = false;
      }
    };

    const deleteWarehouse = async (id: string): Promise<void> => {
      await service.deleteWarehouse(id);
      message.success("删除成功");
      tableApi.query();
    };

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: "EMERGENCY_SUPPLIES_WAREHOUSE",
      columns: [
        { title: "仓库名称", dataIndex: "name" },
        { title: "仓库编码", dataIndex: "code", width: 180 },
        { title: "地址", dataIndex: "address", ellipsis: true },
        {
          title: "GIS坐标",
          dataIndex: "longitude",
          width: 220,
          customRender: ({ record }: { record: WarehouseVO }) => formatCoordinateValue(record.longitude, record.latitude) || "--",
        },
        { title: "管理员", dataIndex: "keeperPersonName", width: 120 },
        {
          title: "状态",
          dataIndex: "status",
          width: 100,
          customRender: ({ text }: { text?: boolean }) => <span class={statusClass(text)}>{text ? "启用" : "禁用"}</span>,
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 220,
          fixed: "right",
          customRender: ({ record }: { record: { id: string; status: boolean } }) => (
            <>
              <Button type="link" size="small" onClick={() => openEditModal(record.id)}>
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                onClick={async () => {
                  await service.changeWarehouseStatus(record.id, !record.status);
                  message.success("操作成功");
                  tableApi.query();
                }}
              >
                {record.status ? "禁用" : "启用"}
              </Button>
              <PopConfirm title="确认删除该仓库？" onConfirm={() => deleteWarehouse(record.id)}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          ),
        },
      ],
      fetchApi: async () =>
        service.getWarehousePage({
          ...query,
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
        }),
      fetchLoaded: (data) => {
        page.total = data.total;
      },
    });

    const search = (): void => {
      page.pageNumber = 1;
      tableApi.query();
    };

    const slots = {
      "layout-header": () => (
        <div class={styles.headerActions}>
          <Button type="primary" onClick={openCreateModal}>
            新增仓库
          </Button>
        </div>
      ),
      "layout-content": () => (
        <div class={styles.page}>
          <div class={styles.toolbar}>
            <div class={styles.filterItem}>
              <span class={styles.filterLabel}>关键字：</span>
              <Input
                class={styles.keyword}
                v-model:value={query.keyword}
                prefix={<SearchOutlined />}
                placeholder="仓库名称/编码"
                allowClear
                onPressEnter={search}
              />
            </div>
            <Select
              class={styles.statusSelect}
              style={{ width: "120px" }}
              v-model:value={query.status}
              allowClear
              placeholder="全部状态"
              options={[
                { label: "启用", value: true },
                { label: "禁用", value: false },
              ]}
              onChange={search}
            />
            <Button type="primary" onClick={search}>
              查询
            </Button>
            <Button
              onClick={() => {
                query.keyword = "";
                query.status = undefined;
                search();
              }}
            >
              重置
            </Button>
          </div>
          <CubeTable />
          <Modal
            v-model:visible={modalVisible.value}
            title={modalTitle.value}
            width="720px"
            destroyOnClose
            confirmLoading={submitLoading.value}
            onOk={submitWarehouse}
            onCancel={() => {
              modalVisible.value = false;
            }}
          >
            <Form
              ref={formRef}
              model={formState}
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              class={styles.warehouseForm}
              rules={{
                name: [
                  {
                    required: true,
                    message: "请输入仓库名称",
                    trigger: "blur",
                  },
                ],
                code: [
                  {
                    required: true,
                    message: "请输入仓库编码",
                    trigger: "blur",
                  },
                ],
              }}
            >
              <div class={styles.formGrid}>
                <FormItem label="仓库名称" name="name">
                  <Input v-model:value={formState.name} placeholder="如：中心仓库A" maxlength={60} />
                </FormItem>
                <FormItem label="仓库编码" name="code">
                  <Input v-model:value={formState.code} placeholder="如：WH-CENTER-A" maxlength={64} />
                </FormItem>
              </div>
              <FormItem label="仓库地址" name="address">
                <Input v-model:value={formState.address} placeholder="如：A区-1号仓储楼" maxlength={200} />
              </FormItem>
              <div class={styles.formGrid}>
                <FormItem label="GIS坐标">
                  <div class={styles.coordinateField}>
                    <Input
                      value={coordinateText.value}
                      placeholder="如：104.0657,30.6598"
                      readonly
                      showCount={false}
                      title={coordinateText.value}
                    />
                    <Button type="primary" onClick={openMapModal}>
                      选择位置
                    </Button>
                  </div>
                </FormItem>
                <FormItem label="管理员">
                  <UserSelect v-model:value={formState.keeperPersonId} allowClear />
                </FormItem>
              </div>
              <FormItem label="备注">
                <Textarea v-model:value={formState.remark} placeholder="请输入备注" maxlength={200} rows={3} />
              </FormItem>
            </Form>
          </Modal>
        </div>
      ),
      "footer-page": () => (
        <Page
          current={page.pageNumber}
          pageSize={page.pageSize}
          total={page.total}
          onPageChange={(n, s) => {
            page.pageNumber = n;
            page.pageSize = s;
            tableApi.query();
          }}
        />
      ),
    };
    return () => <CubeLayout title="仓库管理" v-slots={slots} />;
  },
});
