import { computed, defineComponent, onMounted, reactive, ref, Teleport, watch, type PropType } from "vue";

import type { DeviceInstance } from "@ghcloud/cube-service-interface/device-center";
import type { BusinessAreaNode } from "@ghcloud/cube-service-interface/mdata";
import {
  bindVisualDevices,
  countAreaEmptyDevices,
  listVisualBoundDevices,
  unbindVisualDevices,
} from "@ghcloud/cube-services-client/device-center.client";
import { Button, Cascader, Form, FormItem, Input, Page, PopConfirm, Select, Table, message } from "@ghcloud/cube-ui";
import { DeviceModalTable } from "@ghcloud/generic-component";

import { CONFIG_SHELL_TITLE_EXTRA_ID } from "../../config-shell";
import { ASSOCIATION_DATA_TYPE_OPTIONS, type AssociationDataType } from "./association.types";
import { useAssociationTableScroll } from "./use-association-table-scroll";
import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./device-association.module.less";

const buildVisualTag = (sceneType: string): string => `custom.app::visual.${sceneType}`;

interface SelectedDevice {
  id: string;
  name: string;
}

/**
 * 设备关联面板。
 */
export const DevicePanel = defineComponent({
  name: "DevicePanel",
  props: {
    sceneType: { type: String, required: true },
    areaOptions: { type: Array as PropType<BusinessAreaNode[]>, default: () => [] },
    dataType: { type: String as PropType<AssociationDataType>, required: true },
    onDataTypeChange: { type: Function as PropType<(value: AssociationDataType) => void>, required: true },
  },
  setup(props) {
    const { tableWrapRef, tableScrollY } = useAssociationTableScroll();
    const titleExtraReady = ref(false);
    const loading = ref(false);
    const emptyAreaCount = ref(0);
    const selectedRowKeys = ref<string[]>([]);
    const batchRemoving = ref(false);
    const deviceModalRef = ref<{ openModal: () => void }>();
    const selectedDevices = ref<SelectedDevice[]>([]);
    const tableData = ref<DeviceInstance[]>([]);
    const search = reactive({
      keyword: "",
      areaId: [] as string[],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const visualTag = computed(() => (props.sceneType ? buildVisualTag(props.sceneType) : ""));

    const loadEmptyAreaCount = async (): Promise<void> => {
      if (!props.sceneType) {
        emptyAreaCount.value = 0;
        return;
      }
      try {
        const res = await useAuthRequest(() => countAreaEmptyDevices({ tagCodes: [visualTag.value] }));
        emptyAreaCount.value = res?.totalNum ?? 0;
      } catch {
        emptyAreaCount.value = 0;
      }
    };

    const loadDevices = async (): Promise<void> => {
      if (!props.sceneType) {
        tableData.value = [];
        search.total = 0;
        return;
      }
      loading.value = true;
      try {
        const anyAreaId = search.areaId?.length ? search.areaId[search.areaId.length - 1] : undefined;
        const result = await useAuthRequest(() =>
          listVisualBoundDevices({
            pageNumber: search.pageNumber,
            pageSize: search.pageSize,
            keyword: search.keyword.trim() || undefined,
            anyAreaId,
            tagCodes: [visualTag.value],
          }),
        );
        tableData.value = result.records;
        search.total = result.total;
      } catch {
        message.error("加载关联设备失败");
        tableData.value = [];
        search.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const handleQuery = (): void => {
      search.pageNumber = 1;
      void loadDevices();
      void loadEmptyAreaCount();
    };

    const handleReset = (): void => {
      search.keyword = "";
      search.areaId = [];
      search.pageNumber = 1;
      void loadDevices();
      void loadEmptyAreaCount();
    };

    const openBind = (): void => {
      selectedDevices.value = [];
      deviceModalRef.value?.openModal();
    };

    const handleBind = async (devices: SelectedDevice[]): Promise<void> => {
      if (!devices.length) {
        message.warning("请选择关联设备");
        return;
      }
      try {
        await useAuthRequest(() =>
          bindVisualDevices({
            sceneType: props.sceneType,
            businessIds: devices.map((device) => device.id),
            deviceBindWay: "APPOINT_EQUIPMENT",
          }),
        );
        message.success("关联成功");
        search.pageNumber = 1;
        selectedRowKeys.value = [];
        await loadDevices();
        await loadEmptyAreaCount();
      } catch {
        message.error("关联失败");
      }
    };

    const handleUnbind = async (ids: string[]): Promise<void> => {
      if (!ids.length) {
        return;
      }
      try {
        await useAuthRequest(() =>
          unbindVisualDevices({
            sceneType: props.sceneType,
            businessIds: ids,
          }),
        );
        message.success("删除成功");
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => !ids.includes(id));
        if (tableData.value.length === ids.length && search.pageNumber > 1) {
          search.pageNumber -= 1;
        }
        await loadDevices();
        await loadEmptyAreaCount();
      } catch {
        message.error("删除失败");
      }
    };

    const columns = [
      { title: "设备名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "设备编号", dataIndex: "code", key: "code", width: 220, ellipsis: true },
      {
        title: "设备区域",
        key: "area",
        width: 220,
        ellipsis: true,
        customRender: ({ record }: { record: DeviceInstance }) => record.area?.pathName || record.areaName || "--",
      },
      {
        title: "操作",
        key: "action",
        width: 100,
        customRender: ({ record }: { record: DeviceInstance }) => (
          <PopConfirm title="确定要删除该数据吗?" onConfirm={() => void handleUnbind([record.id])}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </PopConfirm>
        ),
      },
    ];

    const rowSelection = computed(() => ({
      selectedRowKeys: selectedRowKeys.value,
      preserveSelectedRowKeys: true,
      onChange: (keys: Array<string | number>) => {
        selectedRowKeys.value = keys.map(String);
      },
    }));

    onMounted(() => {
      titleExtraReady.value = Boolean(document.getElementById(CONFIG_SHELL_TITLE_EXTRA_ID));
      void loadDevices();
      void loadEmptyAreaCount();
    });

    watch(
      () => props.sceneType,
      () => {
        search.pageNumber = 1;
        search.keyword = "";
        search.areaId = [];
        selectedRowKeys.value = [];
        void loadDevices();
        void loadEmptyAreaCount();
      },
    );

    return () => (
      <>
        {titleExtraReady.value ? (
          <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
            <Button type="primary" onClick={openBind}>
              添加设备
            </Button>
          </Teleport>
        ) : null}

        <Form layout="inline" class={styles.filterBar}>
          <FormItem label="数据类型">
            <Select
              value={props.dataType}
              options={[...ASSOCIATION_DATA_TYPE_OPTIONS]}
              style={{ width: "180px" }}
              onUpdate:value={(val: string) => {
                props.onDataTypeChange((val || "DEVICE") as AssociationDataType);
              }}
            />
          </FormItem>
          <FormItem label="设备区域">
            <Cascader
              value={search.areaId}
              options={props.areaOptions}
              changeOnSelect
              allowClear
              showSearch
              placeholder="请选择区域"
              style={{ width: "200px" }}
              fieldNames={{ label: "name", value: "id", children: "children" }}
              onUpdate:value={(val: string[]) => {
                search.areaId = val ?? [];
              }}
            />
          </FormItem>
          <FormItem>
            <Input
              value={search.keyword}
              maxlength={20}
              showCount
              allowClear
              placeholder="请输入名称搜索"
              style={{ width: "220px" }}
              onUpdate:value={(val: string) => {
                search.keyword = (val ?? "").replace(/\s+/g, "");
              }}
              onPressEnter={handleQuery}
            />
          </FormItem>
          <FormItem>
            <div class={styles.filterActions}>
              <Button type="primary" onClick={handleQuery}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </FormItem>
        </Form>

        {emptyAreaCount.value > 0 ? (
          <p class={styles.warn}>
            以下有 <span class={styles.warnNum}>{emptyAreaCount.value}</span>{" "}
            个设备的所在区域为空，会导致可视化模型上展示不出来，请到物联设备台账中补充。
          </p>
        ) : null}

        <div ref={tableWrapRef} class={styles.tableWrap}>
          <Table
            columns={columns}
            dataSource={tableData.value}
            loading={loading.value}
            pagination={false}
            rowKey="id"
            rowSelection={rowSelection.value}
            scrollX={920}
            scrollY={tableScrollY.value}
            size="middle"
          />
        </div>

        <div class={styles.footer}>
          <div class={styles.footerLeft}>
            <Button
              type="primary"
              danger
              disabled={!selectedRowKeys.value.length}
              loading={batchRemoving.value}
              onClick={() => {
                batchRemoving.value = true;
                void handleUnbind([...selectedRowKeys.value]).finally(() => {
                  batchRemoving.value = false;
                });
              }}
            >
              批量删除
            </Button>
            <span class={styles.selectedCount}>已选 {selectedRowKeys.value.length} 条数据</span>
          </div>
          <div class={styles.footerPage}>
            <Page
              current={search.pageNumber}
              pageSize={search.pageSize}
              total={search.total}
              onPageChange={(pageNumber: number, pageSize: number) => {
                search.pageNumber = pageNumber;
                search.pageSize = pageSize;
                void loadDevices();
              }}
            />
          </div>
        </div>

        <DeviceModalTable
          ref={deviceModalRef}
          v-model:value={selectedDevices.value}
          multiple
          filterTagCodes={visualTag.value ? [visualTag.value] : []}
          onOk={(devices: SelectedDevice[]) => {
            void handleBind(devices);
          }}
        />
      </>
    );
  },
});

export default DevicePanel;
