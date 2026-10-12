import { defineComponent, onMounted, reactive } from "vue";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";
import { service } from "@/shared";

import styles from "./home.module.less";

export const Home = defineComponent({
  name: "Home",
  setup: () => {
    const overview = reactive({
      typeCount: 0,
      totalQuantity: 0,
      warningCount: 0,
      pendingCount: 0,
      usingCount: 0,
      monthCount: 0,
    });

    const loadOverview = async (): Promise<void> => {
      const data = await service.getSuppliesOverview();
      overview.typeCount = data.typeCount ?? 0;
      overview.totalQuantity = data.totalQuantity ?? 0;
      overview.warningCount = data.warningCount ?? 0;
      overview.pendingCount = data.pendingCount ?? 0;
      overview.usingCount = data.usingCount ?? 0;
      overview.monthCount = data.monthCount ?? 0;
    };

    onMounted(() => {
      void loadOverview();
    });

    return () => (
      <div class={styles.page}>
        <CubeNavBar showBack title="应急物资" />
        <section class={styles.contentBlock}>
          <div class={styles.entryMenu}>
            <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
          </div>
          <div class={styles.panel}>
            <h2>库存总览</h2>
            <div class={styles.statGrid}>
              <div class={styles.statItem}>
                <strong class={styles.blue}>{overview.typeCount || "-"}</strong>
                <span>物资品类</span>
              </div>
              <div class={styles.statItem}>
                <strong class={styles.green}>{overview.totalQuantity || "-"}</strong>
                <span>库存总量</span>
              </div>
              <div class={styles.statItem}>
                <strong class={styles.orange}>{overview.warningCount || "-"}</strong>
                <span>预警/临期</span>
              </div>
            </div>
          </div>
          <div class={styles.panel}>
            <h2>调用统计</h2>
            <div class={styles.statGrid}>
              <div class={styles.statItem}>
                <strong class={styles.blue}>{overview.pendingCount}</strong>
                <span>待确认</span>
              </div>
              <div class={styles.statItem}>
                <strong class={styles.green}>{overview.usingCount}</strong>
                <span>使用中</span>
              </div>
              <div class={styles.statItem}>
                <strong class={styles.purple}>{overview.monthCount}</strong>
                <span>本月调用</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  },
});
