import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeTable } from "@ghcloud/cube-app-design";
import type { DispatchItemVO, DispatchOrderVO, DispatchStatVO, SuppliesVO } from "@ghcloud/cube-service-interface/emergency-supplies";
import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Page,
  PopConfirm,
  SearchOutlined,
  Select,
  Textarea,
  message,
} from "@ghcloud/cube-ui";

import { service, statusLabel } from "@/shared";

import styles from "./dispatch-order-list.module.less";

type Option = { label: string; value: string; supplies: SuppliesVO };
type ActionType = "outbound" | "return" | "writeoff";

const firstItem = (record?: DispatchOrderVO): DispatchItemVO | undefined => record?.items?.[0];

const remainQuantity = (item?: DispatchItemVO): number => {
  if (!item) return 0;
  return Math.max(Number(item.outboundQuantity ?? 0) - Number(item.totalReturned ?? 0) - Number(item.totalWriteoff ?? 0), 0);
};

const statusClass = (status?: string): string[] => [
  styles.statusTag,
  status === "PENDING" ? styles.statusWarn : status === "CANCELLED" || status === "WRITTEN_OFF" ? styles.statusDanger : "",
];

export const DispatchOrderList = defineComponent({
  name: "DispatchOrderList",
  setup: () => {
    const query = reactive({
      keyword: "",
      status: undefined as string | undefined,
    });
    const page = reactive({ pageNumber: 1, pageSize: 10, total: 0 });
    const stat = reactive<DispatchStatVO>({
      todayCount: 0,
      pendingCount: 0,
      usingCount: 0,
      monthCount: 0,
    });
    const suppliesOptions = ref<Option[]>([]);
    const createVisible = ref(false);
    const detailVisible = ref(false);
    const actionVisible = ref(false);
    const actionType = ref<ActionType>("outbound");
    const currentOrder = ref<DispatchOrderVO>();
    const currentItem = computed(() => firstItem(currentOrder.value));
    const createForm = reactive({
      suppliesId: undefined as string | undefined,
      dispatchQuantity: undefined as number | undefined,
      unit: "",
      expectedReturnTime: "",
      remark: "",
    });
    const actionForm = reactive({
      quantity: undefined as number | undefined,
      operateTime: "",
      reason: undefined as string | undefined,
      remark: "",
    });

    const loadOptions = async (): Promise<void> => {
      const data = await service.getSuppliesPage({
        pageNumber: 1,
        pageSize: 500,
        status: "ENABLED",
      });
      suppliesOptions.value = data.records.map((item) => ({
        label: `${item.name}（可用 ${item.availableQuantity ?? 0}${item.unit}）`,
        value: item.id,
        supplies: item,
      }));
    };

    const loadStat = async (): Promise<void> => {
      Object.assign(stat, await service.getDispatchStat());
    };

    const selectedSupplies = computed(() => suppliesOptions.value.find((item) => item.value === createForm.suppliesId)?.supplies);

    const resetCreate = (): void => {
      createForm.suppliesId = undefined;
      createForm.dispatchQuantity = undefined;
      createForm.unit = "";
      createForm.expectedReturnTime = "";
      createForm.remark = "";
    };

    const openCreate = async (): Promise<void> => {
      resetCreate();
      createVisible.value = true;
      if (!suppliesOptions.value.length) await loadOptions();
    };

    const submitCreate = async (): Promise<void> => {
      if (!createForm.suppliesId) {
        message.warning("请选择物资");
        return;
      }
      if (!createForm.dispatchQuantity || createForm.dispatchQuantity <= 0) {
        message.warning("请输入调用数量");
        return;
      }
      await service.createDispatchOrder({
        expectedReturnTime: createForm.expectedReturnTime || undefined,
        remark: createForm.remark,
        items: [
          {
            suppliesId: createForm.suppliesId,
            warehouseId: selectedSupplies.value?.warehouseId,
            dispatchQuantity: createForm.dispatchQuantity,
          },
        ],
      });
      message.success("操作成功");
      createVisible.value = false;
      tableApi.query();
      loadStat();
    };

    const openDetail = async (id: string): Promise<void> => {
      currentOrder.value = await service.getDispatchOrderDetail(id);
      detailVisible.value = true;
    };

    const openAction = async (record: DispatchOrderVO, type: ActionType): Promise<void> => {
      currentOrder.value = await service.getDispatchOrderDetail(record.id);
      actionType.value = type;
      const item = currentItem.value;
      actionForm.quantity = type === "outbound" ? Number(item?.dispatchQuantity ?? 0) : remainQuantity(item);
      actionForm.operateTime = new Date().toISOString().slice(0, 16).replace("T", " ");
      actionForm.reason = undefined;
      actionForm.remark = "";
      actionVisible.value = true;
    };

    const submitAction = async (): Promise<void> => {
      if (!currentOrder.value || !currentItem.value) return;
      if (!actionForm.quantity || actionForm.quantity <= 0) {
        message.warning("请输入数量");
        return;
      }
      if (actionType.value === "outbound") {
        await service.confirmDispatchOutbound(currentOrder.value.id, {
          quantity: actionForm.quantity,
          outboundTime: actionForm.operateTime,
          remark: actionForm.remark,
        });
      } else if (actionType.value === "return") {
        await service.returnDispatchItem(currentItem.value.id, {
          quantity: actionForm.quantity,
          operateTime: actionForm.operateTime,
          remark: actionForm.remark,
        });
      } else {
        if (!actionForm.reason) {
          message.warning("请选择核销原因");
          return;
        }
        await service.writeoffDispatchItem(currentItem.value.id, {
          quantity: actionForm.quantity,
          operateTime: actionForm.operateTime,
          reason: actionForm.reason,
          remark: actionForm.remark,
        });
      }
      message.success("操作成功");
      actionVisible.value = false;
      tableApi.query();
      loadStat();
    };

    const confirmUsing = async (id: string): Promise<void> => {
      await service.confirmDispatchUsing(id);
      message.success("操作成功");
      tableApi.query();
      loadStat();
    };

    const cancelOrder = async (id: string): Promise<void> => {
      await service.cancelDispatchOrder(id);
      message.success("操作成功");
      tableApi.query();
      loadStat();
    };

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      tableCode: "EMERGENCY_SUPPLIES_DISPATCH",
      columns: [
        { title: "调用单号", dataIndex: "code", width: 170 },
        {
          title: "物资名称",
          dataIndex: "items",
          width: 150,
          customRender: ({ record }: { record: DispatchOrderVO }) => firstItem(record)?.suppliesNameSnapshot ?? "--",
        },
        {
          title: "数量",
          dataIndex: "items",
          width: 80,
          customRender: ({ record }: { record: DispatchOrderVO }) => firstItem(record)?.dispatchQuantity ?? "--",
        },
        {
          title: "单位",
          dataIndex: "items",
          width: 80,
          customRender: ({ record }: { record: DispatchOrderVO }) => firstItem(record)?.unit ?? "--",
        },
        { title: "发起人", dataIndex: "dispatcherName", width: 110 },
        { title: "发起时间", dataIndex: "dispatchTime", width: 170 },
        { title: "出库确认人", dataIndex: "outboundConfirmerName", width: 120 },
        { title: "出库时间", dataIndex: "outboundTime", width: 170 },
        { title: "预计归还时间", dataIndex: "expectedReturnTime", width: 170 },
        {
          title: "状态",
          dataIndex: "status",
          width: 110,
          customRender: ({ text }: { text?: string }) => <span class={statusClass(text)}>{statusLabel(text)}</span>,
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 300,
          fixed: "right",
          customRender: ({ record }: { record: DispatchOrderVO }) => (
            <div class={styles.actionCell}>
              {record.status === "PENDING" && (
                <Button type="primary" size="small" class={styles.btnPrimary} onClick={() => openAction(record, "outbound")}>
                  确认出库
                </Button>
              )}
              {record.status === "PENDING" && (
                <PopConfirm title="确认取消该调用？" onConfirm={() => cancelOrder(record.id)}>
                  <Button type="default" danger size="small" class={styles.btnCancel}>
                    取消
                  </Button>
                </PopConfirm>
              )}
              {record.status === "OUTBOUND" && (
                <Button type="primary" size="small" class={styles.btnPrimary} onClick={() => confirmUsing(record.id)}>
                  确认使用
                </Button>
              )}
              {(record.status === "USING" || record.status === "PARTIAL_RETURNED") && (
                <Button type="primary" size="small" class={styles.btnPrimary} onClick={() => openAction(record, "return")}>
                  归还登记
                </Button>
              )}
              {(record.status === "OUTBOUND" || record.status === "USING" || record.status === "PARTIAL_RETURNED") && (
                <Button type="default" size="small" class={styles.btnSecondary} onClick={() => openAction(record, "writeoff")}>
                  {record.status === "OUTBOUND" ? "直接核销" : "核销登记"}
                </Button>
              )}
              <Button type="default" size="small" class={styles.btnSecondary} onClick={() => openDetail(record.id)}>
                查看详情
              </Button>
            </div>
          ),
        },
      ],
      fetchApi: async () =>
        service.getDispatchOrderPage({
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

    onMounted(() => {
      loadOptions();
      loadStat();
    });

    const slots = {
      "layout-header": () => (
        <div class={styles.headerActions}>
          <Button type="primary" onClick={openCreate}>
            + 发起调用
          </Button>
        </div>
      ),
      "layout-content": () => (
        <div class={styles.page}>
          <div class={styles.statGrid}>
            <div class={styles.statCard}>
              <span>今日调用</span>
              <strong>{stat.todayCount}</strong>
              <em>较昨日统计待接入</em>
            </div>
            <div class={styles.statCard}>
              <span>待确认</span>
              <strong class={styles.orange}>{stat.pendingCount}</strong>
              <em>需尽快处理</em>
            </div>
            <div class={styles.statCard}>
              <span>使用中</span>
              <strong class={styles.green}>{stat.usingCount}</strong>
              <em>已出库未归还</em>
            </div>
            <div class={styles.statCard}>
              <span>本月累计</span>
              <strong>{stat.monthCount}</strong>
              <em>本月调用总数</em>
            </div>
          </div>
          <div class={styles.toolbar}>
            <div class={styles.filterItem}>
              <span class={styles.filterLabel}>关键字：</span>
              <Input
                class={styles.keyword}
                v-model:value={query.keyword}
                prefix={<SearchOutlined />}
                placeholder="物资名称/调用单/发起人"
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
                { label: "待确认", value: "PENDING" },
                { label: "已出库", value: "OUTBOUND" },
                { label: "使用中", value: "USING" },
                { label: "部分归还", value: "PARTIAL_RETURNED" },
                { label: "已归还", value: "RETURNED" },
                { label: "已核销", value: "WRITTEN_OFF" },
                { label: "已取消", value: "CANCELLED" },
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
            v-model:visible={createVisible.value}
            title="发起物资调用"
            width="560px"
            destroyOnClose
            onOk={submitCreate}
            onCancel={() => {
              createVisible.value = false;
            }}
          >
            <Form model={createForm} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
              <FormItem label="物资选择" required>
                <Select
                  v-model:value={createForm.suppliesId}
                  options={suppliesOptions.value}
                  placeholder="请选择物资"
                  onChange={() => {
                    createForm.unit = selectedSupplies.value?.unit ?? "";
                  }}
                />
              </FormItem>
              <div class={styles.formGrid}>
                <FormItem label="调用数量" required>
                  <InputNumber style={{ width: "100%" }} v-model:value={createForm.dispatchQuantity} min={1} placeholder="请输入数量" />
                </FormItem>
                <FormItem label="单位">
                  <Input value={selectedSupplies.value?.unit ?? ""} disabled placeholder="自动填充" />
                </FormItem>
              </div>
              <FormItem label="预计归还时间">
                <DatePicker
                  v-model:value={createForm.expectedReturnTime}
                  showTime
                  valueFormat="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </FormItem>
              <FormItem label="备注">
                <Textarea v-model:value={createForm.remark} rows={3} placeholder="调用原因说明等" />
              </FormItem>
              <div class={styles.readonlyText}>
                当前可用库存：
                {selectedSupplies.value?.availableQuantity ?? "--"}
                {selectedSupplies.value?.unit ?? ""}
              </div>
            </Form>
          </Modal>
          <Modal
            v-model:visible={detailVisible.value}
            title="调用详情"
            width="560px"
            footer={null}
            destroyOnClose
            onCancel={() => {
              detailVisible.value = false;
            }}
          >
            <div class={styles.detailList}>
              <p>
                <span>调用单号</span>
                <b>{currentOrder.value?.code ?? "--"}</b>
              </p>
              <p>
                <span>物资名称</span>
                <b>{currentItem.value?.suppliesNameSnapshot ?? "--"}</b>
              </p>
              <p>
                <span>调用数量</span>
                <b>{currentItem.value ? `${currentItem.value.dispatchQuantity} ${currentItem.value.unit}` : "--"}</b>
              </p>
              <p>
                <span>已归还</span>
                <b class={styles.green}>{currentItem.value ? `${currentItem.value.totalReturned} ${currentItem.value.unit}` : "--"}</b>
              </p>
              <p>
                <span>已核销</span>
                <b>{currentItem.value ? `${currentItem.value.totalWriteoff} ${currentItem.value.unit}` : "--"}</b>
              </p>
              <p>
                <span>未完结</span>
                <b class={styles.red}>{currentItem.value ? `${remainQuantity(currentItem.value)} ${currentItem.value.unit}` : "--"}</b>
              </p>
              <p>
                <span>发起人</span>
                <b>{currentOrder.value?.dispatcherName ?? "--"}</b>
              </p>
              <p>
                <span>发起时间</span>
                <b>{currentOrder.value?.dispatchTime ?? "--"}</b>
              </p>
              <p>
                <span>出库确认人</span>
                <b>{currentOrder.value?.outboundConfirmerName ?? "--"}</b>
              </p>
              <p>
                <span>出库时间</span>
                <b>{currentOrder.value?.outboundTime ?? "--"}</b>
              </p>
              <p>
                <span>预计归还</span>
                <b>{currentOrder.value?.expectedReturnTime ?? "--"}</b>
              </p>
              <p>
                <span>备注</span>
                <b>{currentOrder.value?.remark ?? "--"}</b>
              </p>
              <p>
                <span>状态</span>
                <b>
                  <span class={statusClass(currentOrder.value?.status)}>{statusLabel(currentOrder.value?.status)}</span>
                </b>
              </p>
            </div>
          </Modal>
          <Modal
            v-model:visible={actionVisible.value}
            title={actionType.value === "outbound" ? "确认出库" : actionType.value === "return" ? "归还登记" : "核销登记"}
            width="560px"
            destroyOnClose
            onOk={submitAction}
            onCancel={() => {
              actionVisible.value = false;
            }}
          >
            <div class={styles.detailList}>
              <p>
                <span>调用单号</span>
                <b>{currentOrder.value?.code ?? "--"}</b>
              </p>
              <p>
                <span>物资名称</span>
                <b>{currentItem.value?.suppliesNameSnapshot ?? "--"}</b>
              </p>
              <p>
                <span>{actionType.value === "outbound" ? "申请数量" : "出库数量"}</span>
                <b>
                  {currentItem.value
                    ? `${actionType.value === "outbound" ? currentItem.value.dispatchQuantity : currentItem.value.outboundQuantity} ${currentItem.value.unit}`
                    : "--"}
                </b>
              </p>
            </div>
            <Form model={actionForm} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
              <div class={styles.formGrid}>
                <FormItem
                  label={actionType.value === "outbound" ? "实际出库数量" : actionType.value === "return" ? "归还数量" : "核销数量"}
                  required
                >
                  <InputNumber style={{ width: "100%" }} v-model:value={actionForm.quantity} min={1} />
                </FormItem>
                {actionType.value === "writeoff" && (
                  <FormItem label="核销原因" required>
                    <Select
                      v-model:value={actionForm.reason}
                      placeholder="请选择原因"
                      options={[
                        { label: "消耗使用", value: "USED" },
                        { label: "损坏报废", value: "DAMAGED" },
                        { label: "遗失", value: "LOST" },
                      ]}
                    />
                  </FormItem>
                )}
              </div>
              <FormItem label={actionType.value === "outbound" ? "出库时间" : "操作时间"}>
                <DatePicker
                  v-model:value={actionForm.operateTime}
                  showTime
                  valueFormat="YYYY-MM-DD HH:mm"
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: "100%" }}
                />
              </FormItem>
              <FormItem label="备注">
                <Textarea
                  v-model:value={actionForm.remark}
                  rows={3}
                  placeholder={actionType.value === "outbound" ? "出库备注" : "操作备注"}
                />
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
    return () => <CubeLayout title="物资调用" v-slots={slots} />;
  },
});
