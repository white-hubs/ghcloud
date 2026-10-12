import { Button, Empty, Field, Popup, Search, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import type { DispatchOrderVO, SuppliesVO } from "@ghcloud/cube-service-interface/emergency-supplies";

import { dispatchStatusClassNames, firstItem, formatDateTime } from "./dispatch-shared";
import { DateTimeField } from "@/components/datetime-field/datetime-field";
import { FilterSelect } from "@/components/filter-select/filter-select";
import { ListOptionPicker } from "@/components/list-option-picker/list-option-picker";
import { service, statusLabel } from "@/shared";

import styles from "./dispatch-list.module.less";

type SuppliesOption = { label: string; value: string; supplies: SuppliesVO };

const statusOptions = [
  { text: "全部状态", value: "" },
  { text: "待确认", value: "PENDING" },
  { text: "已出库", value: "OUTBOUND" },
  { text: "使用中", value: "USING" },
  { text: "部分归还", value: "PARTIAL_RETURNED" },
  { text: "已归还", value: "RETURNED" },
  { text: "已核销", value: "WRITTEN_OFF" },
  { text: "已取消", value: "CANCELLED" },
];

export const DispatchList = defineComponent({
  name: "DispatchList",
  setup: () => {
    const router = useRouter();
    const records = ref<DispatchOrderVO[]>([]);
    const total = ref(0);
    const suppliesOptions = ref<SuppliesOption[]>([]);
    const createVisible = ref(false);
    const submitLoading = ref(false);
    const query = reactive({
      keyword: "",
      status: "" as string,
    });
    const stat = reactive({
      todayCount: 0,
      pendingCount: 0,
      usingCount: 0,
      monthCount: 0,
    });
    const form = reactive({
      suppliesId: "",
      quantity: 0,
      expectedReturnTime: "",
      remark: "",
    });

    const load = async (): Promise<void> => {
      const [pageData, statData] = await Promise.all([
        service.getDispatchOrderPage({
          pageNumber: 1,
          pageSize: 200,
          keyword: query.keyword || undefined,
          status: query.status || undefined,
        }),
        service.getDispatchStat(),
      ]);
      records.value = pageData.records;
      total.value = pageData.total;
      stat.todayCount = statData.todayCount;
      stat.pendingCount = statData.pendingCount;
      stat.usingCount = statData.usingCount;
      stat.monthCount = statData.monthCount;
    };

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

    const selected = (): SuppliesVO | undefined => suppliesOptions.value.find((item) => item.value === form.suppliesId)?.supplies;

    const openCreate = async (): Promise<void> => {
      if (!suppliesOptions.value.length) await loadOptions();
      form.suppliesId = "";
      form.quantity = 0;
      form.expectedReturnTime = "";
      form.remark = "";
      createVisible.value = true;
    };

    const submitCreate = async (): Promise<void> => {
      if (!form.suppliesId || !form.quantity) {
        showNotify({ type: "warning", message: "请选择物资并填写数量" });
        return;
      }
      submitLoading.value = true;
      try {
        await service.createDispatchOrder({
          expectedReturnTime: form.expectedReturnTime || undefined,
          remark: form.remark,
          items: [
            {
              suppliesId: form.suppliesId,
              warehouseId: selected()?.warehouseId,
              dispatchQuantity: form.quantity,
            },
          ],
        });
        showNotify({ type: "success", message: "操作成功" });
        createVisible.value = false;
        await load();
      } catch (error) {
        showNotify({
          type: "danger",
          message: (error as Error)?.message ?? "操作失败",
        });
      } finally {
        submitLoading.value = false;
      }
    };

    onMounted(() => {
      void loadOptions();
      void load();
    });

    return () => (
      <div class={styles.page}>
        <header class={styles.appHeader}>
          <button class={styles.backButton} type="button" onClick={() => router.back()}>
            <span>‹</span>
            返回
          </button>
          <h1>物资调用</h1>
          <i />
        </header>

        <section class={styles.contentBlock}>
          <div class={styles.statRow}>
            <div class={styles.statCard}>
              <b class={styles.statDefault}>{stat.todayCount}</b>
              <span>今日调用</span>
            </div>
            <div class={styles.statCard}>
              <b class={styles.orange}>{stat.pendingCount}</b>
              <span>待确认</span>
            </div>
            <div class={styles.statCard}>
              <b class={styles.blue}>{stat.usingCount}</b>
              <span>使用中</span>
            </div>
            <div class={styles.statCard}>
              <b class={styles.green}>{stat.monthCount}</b>
              <span>本月累计</span>
            </div>
          </div>

          <div class={styles.filters}>
            <Search class={styles.search} v-model={query.keyword} placeholder="搜索物资/单号/发起人" onSearch={load} onClear={load} />
            <FilterSelect
              title="选择状态"
              value={query.status}
              options={statusOptions}
              onChange={(value: string) => {
                query.status = value;
                void load();
              }}
            />
          </div>

          <div class={styles.countText}>{total.value || records.value.length}条</div>

          {records.value.map((order) => {
            const item = firstItem(order);
            return (
              <div
                class={styles.card}
                key={order.id}
                onClick={() =>
                  router.push({
                    name: "dispatch-detail",
                    params: { id: order.id },
                  })
                }
              >
                <div class={styles.title}>
                  <span class={styles.code}>{order.code}</span>
                  <span class={dispatchStatusClassNames(styles, order.status)}>{statusLabel(order.status)}</span>
                </div>
                <div class={styles.meta}>
                  {item?.suppliesNameSnapshot ?? "--"} · {item?.dispatchQuantity ?? 0}
                  {item?.unit ?? ""}
                </div>
                <div class={styles.meta}>
                  发起人：{order.dispatcherName ?? "--"} · {formatDateTime(order.dispatchTime)}
                </div>
                <span class={styles.arrow}>›</span>
              </div>
            );
          })}

          {records.value.length === 0 && <Empty class={styles.empty} description="暂无调用记录" />}
        </section>

        <Button class={styles.fixedButton} type="primary" block onClick={openCreate}>
          发起调用
        </Button>

        <Popup v-model:show={createVisible.value} position="bottom" round safeAreaInsetBottom>
          <div class={styles.popup}>
            <div class={styles.popupTitle}>
              发起调用
              <button
                type="button"
                onClick={() => {
                  createVisible.value = false;
                }}
              >
                ×
              </button>
            </div>
            <ListOptionPicker
              label="物资选择"
              required
              title="选择物资"
              value={form.suppliesId}
              options={suppliesOptions.value}
              placeholder="请选择物资"
              onChange={(value: string) => {
                form.suppliesId = value;
              }}
            />
            <Field v-model={form.quantity} type="number" label="调用数量" label-width={96} required placeholder="请输入数量" />
            <Field label="单位" label-width={96} modelValue={selected()?.unit ?? ""} readonly placeholder="自动填充" />
            <DateTimeField
              label="预计归还"
              title="选择预计归还时间"
              value={form.expectedReturnTime}
              placeholder="请选择时间"
              onChange={(value: string) => {
                form.expectedReturnTime = value;
              }}
            />
            <Field v-model={form.remark} label="备注" label-width={96} placeholder="调用原因说明等" />
            <div class={styles.available}>
              当前可用库存：{selected()?.availableQuantity ?? "--"}
              {selected()?.unit ?? ""}
            </div>
            <Button type="primary" block loading={submitLoading.value} onClick={submitCreate}>
              确认发起
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
