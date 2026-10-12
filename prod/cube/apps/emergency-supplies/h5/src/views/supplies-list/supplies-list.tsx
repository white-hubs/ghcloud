import { Button, Empty, Search } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { statusClassNames, typeColorClass } from "./supplies-shared";
import { FilterSelect } from "@/components/filter-select/filter-select";
import { service, statusLabel } from "@/shared";

import styles from "./supplies-list.module.less";

const statusOptions = [
  { text: "全部状态", value: "" },
  { text: "启用", value: "ENABLED" },
  { text: "禁用", value: "DISABLED" },
  { text: "报废", value: "SCRAPPED" },
];

export const SuppliesList = defineComponent({
  name: "SuppliesList",
  setup: () => {
    const router = useRouter();
    const records = ref<Awaited<ReturnType<typeof service.getSuppliesPage>>["records"]>([]);
    const total = ref(0);
    const query = reactive({
      keyword: "",
      status: "" as string,
    });

    const load = async (): Promise<void> => {
      const data = await service.getSuppliesPage({
        pageNumber: 1,
        pageSize: 200,
        keyword: query.keyword || undefined,
        status: query.status || undefined,
      });
      records.value = data.records;
      total.value = data.total;
    };

    onMounted(() => {
      void load();
    });

    return () => (
      <div class={styles.page}>
        <header class={styles.appHeader}>
          <button class={styles.backButton} type="button" onClick={() => router.back()}>
            <span>‹</span>
            返回
          </button>
          <h1>应急物资台账</h1>
          <em>{total.value || records.value.length}条</em>
        </header>

        <section class={styles.contentBlock}>
          <div class={styles.filters}>
            <Search class={styles.search} v-model={query.keyword} placeholder="搜索物资名称/编码" onSearch={load} onClear={load} />
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

          {records.value.map((item) => (
            <div
              class={styles.card}
              key={item.id}
              onClick={() =>
                router.push({
                  name: "supplies-detail",
                  params: { id: item.id },
                })
              }
            >
              <div class={styles.row}>
                <div class={styles.title}>{item.name}</div>
                <span class={[styles.typeTag, typeColorClass(styles, item.typeName)]}>{item.typeName ?? "--"}</span>
                <span class={statusClassNames(styles, item.status)}>{statusLabel(item.status)}</span>
                <span class={styles.arrow}>›</span>
              </div>
              <div class={styles.meta}>
                {item.code} · {item.specification ?? "--"}
              </div>
              <div class={styles.stock}>
                {item.quantity ?? item.totalQuantity ?? 0} <span class={styles.stockUnit}>{item.unit}</span>
              </div>
            </div>
          ))}

          {records.value.length === 0 && <Empty class={styles.empty} description="暂无物资数据" />}
        </section>

        <Button class={styles.fixedButton} type="primary" block onClick={() => router.push({ name: "supplies-form" })}>
          + 新增物资 / 入库登记
        </Button>
      </div>
    );
  },
});
