import { computed, defineComponent, onMounted, reactive, watch, type PropType } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import { Button, Page, Space, Tag, type ColumnType } from "@ghcloud/cube-ui";

import { DEVICE_TYPES, ENABLE_STATES, ONLINE_OPTIONS, ONLINE_STATES, optionsOf } from "@/constants/positioning";
import type { PositioningDevice } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { formatDateTime, positiveInt } from "@/utils/positioning";

import "./terminal-page.less";

const textValue = (value: unknown): string => (typeof value === "string" ? value : "");
const displayText = (value: unknown): string => (value === undefined || value === null || value === "" ? "—" : String(value));
const ellipsisText = (value: unknown): JSX.Element => {
  const text = displayText(value);
  return (
    <span class="pp-terminal-page__ellipsis" title={text}>
      {text}
    </span>
  );
};

export const TerminalPage = defineComponent({
  name: "TerminalPage",
  props: {
    refreshVersion: { type: Number, required: true },
    onOpenDetail: { type: Function as PropType<(device: PositioningDevice) => void>, required: true },
    onToggleEnabled: { type: Function as PropType<(device: PositioningDevice) => void>, required: true },
  },
  setup(props) {
    const store = usePositioningStore();
    const route = useRoute();
    const router = useRouter();
    const search = reactive({
      keyword: textValue(route.query.keyword),
      online: textValue(route.query.online),
      enabled: textValue(route.query.enabled),
      pageNumber: positiveInt(route.query.pageNumber, 1),
      pageSize: positiveInt(route.query.pageSize, 10),
      total: 0,
    });
    const devices = computed(() => store.state.devices.filter((device) => device.kind === "terminal"));
    const counts = computed(() => ({
      total: devices.value.length,
      online: devices.value.filter((device) => device.online === "online").length,
      offline: devices.value.filter((device) => device.online === "offline").length,
      disabled: devices.value.filter((device) => !device.enabled).length,
    }));

    function writeQuery(): void {
      void router.replace({
        query: {
          tab: "terminal",
          keyword: search.keyword || undefined,
          online: search.online || undefined,
          enabled: search.enabled || undefined,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
        },
      });
    }
    function refresh(): void {
      tableApi.query();
    }

    const columns: ColumnType<PositioningDevice>[] = [
      {
        dataIndex: "id",
        title: "终端编号",
        width: 220,
        ellipsis: true,
        customRender: ({ record }) => {
          const deviceNumber = displayText(record.deviceNumber || record.id);
          return (
            <Button type="link" class="pp-terminal-page__device-id" title={deviceNumber} onClick={() => props.onOpenDetail(record)}>
              {deviceNumber}
            </Button>
          );
        },
      },
      {
        dataIndex: "type",
        title: "终端类型",
        width: 135,
        ellipsis: true,
        customRender: ({ record }) => ellipsisText(DEVICE_TYPES[record.type].label),
      },
      {
        dataIndex: "productCategoryName",
        title: "设备产品",
        width: 200,
        ellipsis: true,
        customRender: ({ record }) => ellipsisText(record.productCategoryName),
      },
      {
        dataIndex: "online",
        title: "在线状态",
        width: 110,
        ellipsis: true,
        customRender: ({ record }) => <Tag color={ONLINE_STATES[record.online].color}>{ONLINE_STATES[record.online].label}</Tag>,
      },
      {
        dataIndex: "battery",
        title: "电量",
        width: 100,
        ellipsis: true,
        customRender: ({ record }) =>
          record.battery === null ? (
            ellipsisText("—")
          ) : (
            <span
              class={["pp-terminal-page__ellipsis", { "pp-terminal-page__battery-low": record.battery <= 20 }]}
              title={`${record.battery}%`}
            >
              {record.battery}%
            </span>
          ),
      },
      {
        dataIndex: "enabled",
        title: "启停状态",
        width: 105,
        ellipsis: true,
        customRender: ({ record }) => (
          <Tag color={record.enabled ? "blue" : "default"}>{record.enabled ? ENABLE_STATES.enabled : ENABLE_STATES.disabled}</Tag>
        ),
      },
      {
        dataIndex: "lastSyncTime",
        title: "最近同步时间",
        width: 185,
        ellipsis: true,
        customRender: ({ record }) => ellipsisText(formatDateTime(record.lastSyncTime)),
      },
      {
        dataIndex: "action",
        title: "操作",
        width: 130,
        customRender: ({ record }) => (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => props.onOpenDetail(record)}>
              详情
            </Button>
            <Button type="link" size="small" danger={record.enabled} onClick={() => props.onToggleEnabled(record)}>
              {record.enabled ? ENABLE_STATES.disabled : ENABLE_STATES.enabled}
            </Button>
          </Space>
        ),
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: "id",
      tableCode: "PERSONNEL_POSITIONING_DEVICE_TERMINAL",
      pagination: false,
      fetchApi: () =>
        store.queryDevices("terminal", {
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          keyword: search.keyword || undefined,
          online: search.online ? search.online === "online" : undefined,
          enabled: search.enabled ? search.enabled === "enabled" : undefined,
        }),
      fetchLoaded: (data) => {
        search.total = data.total;
      },
    });
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      isCollapsed: false,
      cache: false,
      schema: [
        {
          component: "Input",
          fieldName: "keyword",
          label: "关键词",
          componentProps: { placeholder: "终端编号 / 设备产品", allowClear: true },
        },
        {
          component: "Select",
          fieldName: "online",
          label: "在线状态",
          componentProps: { placeholder: "全部", allowClear: true, options: ONLINE_OPTIONS, onChange: () => undefined },
        },
        {
          component: "Select",
          fieldName: "enabled",
          label: "启停状态",
          componentProps: { placeholder: "全部", allowClear: true, options: optionsOf(ENABLE_STATES), onChange: () => undefined },
        },
      ],
      handleSubmit: (values) => {
        Object.assign(search, {
          keyword: textValue(values.keyword).trim(),
          online: textValue(values.online),
          enabled: textValue(values.enabled),
          pageNumber: 1,
        });
        writeQuery();
        refresh();
      },
      handleReset: () => {
        Object.assign(search, { keyword: "", online: "", enabled: "", pageNumber: 1 });
        writeQuery();
        refresh();
      },
    });
    formApi.setFormValues({
      keyword: search.keyword,
      online: search.online || undefined,
      enabled: search.enabled || undefined,
    });

    function changePage(pageNumber: number, pageSize: number): void {
      search.pageNumber = pageSize === search.pageSize ? pageNumber : 1;
      search.pageSize = positiveInt(pageSize, 10);
      writeQuery();
      refresh();
    }
    watch(
      () => props.refreshVersion,
      () => refresh(),
    );
    onMounted(() => {
      void store.refreshDevices("terminal").then(refresh);
    });

    return () => (
      <section class="pp-device-page pp-terminal-page">
        <div class="pp-device-summary">
          <span>
            定位终端 <strong>{counts.value.total}</strong>
          </span>
          <span>
            <i class="pp-device-dot online" />
            在线 <strong>{counts.value.online}</strong>
          </span>
          <span>
            <i class="pp-device-dot offline" />
            离线 <strong>{counts.value.offline}</strong>
          </span>
          <span>
            停用 <strong>{counts.value.disabled}</strong>
          </span>
        </div>
        <CubeForm />
        <CubeTable />
        <div class="pp-device-page__pagination">
          <Page current={search.pageNumber} pageSize={search.pageSize} total={search.total} syncToUrl={false} onPageChange={changePage} />
        </div>
      </section>
    );
  },
});
