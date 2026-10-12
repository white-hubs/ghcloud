import { initAuthStore as initStreamEngineAuthStore } from "@ghcloud-legacy/streamengine-pc-migrate/src/api/auth-store";
import { embeddedFlowDetailBackKey } from "@ghcloud-legacy/streamengine-pc-migrate/src/components/form/embedded-navigation";
import StreamEngineIndex from "@ghcloud-legacy/streamengine-pc-migrate/src/views/Index/index.vue";
import Antd, { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { createPinia } from "pinia";
import { createApp, defineComponent, h, nextTick, onBeforeUnmount, ref, watch, type App as VueApp, type PropType } from "vue";
import { createMemoryHistory, createRouter, RouterView } from "vue-router";

import { Drawer } from "@ghcloud/cube-ui";
import { initGenericComponentAuth } from "@ghcloud/generic-component";

import { authStore } from "@/api/auth-store";

import "@ghcloud-legacy/streamengine-pc-migrate/src/style/common.less";

import styles from "./fault-record-detail-drawer.module.less";

/** 与 fault-repair ConfigProvider 前缀一致，复用已加载的 antd 样式 */
const ANT_PREFIX = "cube-fault-repair-app";

export interface FaultRecordDetailParams {
  businessType: string;
  processInstanceId: string;
  currentTaskId?: string;
  status?: string;
  title?: string;
}

function buildDetailQuery(params: FaultRecordDetailParams): Record<string, string> {
  const query: Record<string, string> = {
    businessType: params.businessType,
    processInstanceId: params.processInstanceId,
    type: "detail",
    notOperates: "true",
  };
  if (params.currentTaskId) {
    query.currentTaskId = params.currentTaskId;
  }
  if (params.status) {
    query.status = params.status;
  }
  if (params.title) {
    query.title = params.title;
  }
  return query;
}

function normalizeToken(token: string): string {
  return token.replace(/^Bearer\s+/i, "");
}

function syncStreamEngineAuth(): void {
  const { tenant } = authStore;
  const token = authStore.token ? normalizeToken(authStore.token) : "";
  // 宿主鉴权齐全时写入；否则交给 streamengine 回退 sessionStorage
  const auth = tenant && token ? { tenant, token } : undefined;
  initStreamEngineAuthStore(auth);
  if (auth) {
    initGenericComponentAuth(auth);
  }
}

export const FaultRecordDetailDrawer = defineComponent({
  name: "FaultRecordDetailDrawer",
  props: {
    open: { type: Boolean, default: false },
    detailParams: { type: Object as PropType<FaultRecordDetailParams | undefined>, default: undefined },
    title: { type: String, default: "报修详情" },
  },
  emits: {
    close: (): boolean => true,
  },
  setup: (props, { emit }) => {
    const hostRef = ref<HTMLDivElement | null>(null);
    let embeddedApp: VueApp | null = null;

    const unmountEmbedded = (): void => {
      embeddedApp?.unmount();
      embeddedApp = null;
      if (hostRef.value) {
        hostRef.value.innerHTML = "";
      }
    };

    const mountEmbedded = async (params: FaultRecordDetailParams): Promise<void> => {
      unmountEmbedded();
      await nextTick();
      const host = hostRef.value;
      if (!host) {
        return;
      }

      syncStreamEngineAuth();

      const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: "/", component: StreamEngineIndex }],
      });
      await router.replace({ path: "/", query: buildDetailQuery(params) });

      const app = createApp({
        setup: () => () => h(ConfigProvider, { locale: zhCN, prefixCls: ANT_PREFIX }, { default: () => h(RouterView) }),
      });
      app.use(router);
      app.use(createPinia());
      app.use(Antd);
      app.provide(embeddedFlowDetailBackKey, () => emit("close"));
      app.mount(host);
      embeddedApp = app;
    };

    watch(
      () => [props.open, props.detailParams] as const,
      async ([open, detailParams]) => {
        if (!open || !detailParams) {
          unmountEmbedded();
          return;
        }
        // Drawer destroyOnClose 后需等宿主节点挂载
        await nextTick();
        await nextTick();
        if (!hostRef.value) {
          return;
        }
        await mountEmbedded(detailParams);
      },
    );

    onBeforeUnmount(() => {
      unmountEmbedded();
    });

    return (): JSX.Element => (
      <Drawer
        visible={props.open}
        title={props.title}
        placement="right"
        width="80%"
        destroyOnClose
        rootClassName="fault-record-detail-drawer"
        onClose={() => {
          unmountEmbedded();
          emit("close");
        }}
      >
        <div class={styles.body}>
          <div ref={hostRef} class={styles.host} />
        </div>
      </Drawer>
    );
  },
});
