import { AppstoreOutlined } from "@ant-design/icons-vue";
import { defineComponent, inject, onBeforeUnmount, onMounted, reactive } from "vue";

import { MFRootEventNameEnum, publisher } from "@ghcloud/cube-mf-root";
import type { FrequentMenu } from "@ghcloud/cube-ouaa-service";
import { Empty, Image, Spin, message } from "@ghcloud/cube-ui";

import { cubeOuaaService } from "../../../api/service";
import { applicationIconMapKey, resolveFrequentMenuIcon } from "../../../context/application-icons";

import "./quick-entry.less";

export default defineComponent({
  name: "QuickEntry",
  setup() {
    const applicationIconsPromise = inject(applicationIconMapKey, Promise.resolve({}));
    let navigationUnlockTimer: ReturnType<typeof setTimeout> | undefined;
    const state = reactive({
      list: [] as FrequentMenu[],
      applicationIcons: {} as Readonly<Record<string, string>>,
      loading: false,
      navigatingMenuId: null as FrequentMenu["id"] | null,
    });

    const getData = async (): Promise<void> => {
      state.loading = true;
      try {
        const [menus, applicationIcons] = await Promise.all([cubeOuaaService.getFrequentMenus(), applicationIconsPromise]);
        state.list = menus;
        state.applicationIcons = applicationIcons;
      } catch {
        state.list = [];
        message.error("快捷入口加载失败，请稍后重试");
      } finally {
        state.loading = false;
      }
    };

    const goPage = (menu: FrequentMenu): void => {
      if (state.navigatingMenuId !== null) return;

      state.navigatingMenuId = menu.id;
      publisher.publish(MFRootEventNameEnum.MF_ROOT_TO_APPLICATION, {
        code: menu.applicationCode,
        path: menu.path,
      });
      navigationUnlockTimer = setTimeout(() => {
        state.navigatingMenuId = null;
      }, 1000);
    };

    onMounted(() => {
      void getData();
    });

    onBeforeUnmount(() => {
      if (navigationUnlockTimer) {
        clearTimeout(navigationUnlockTimer);
      }
    });

    return (): JSX.Element => (
      <aside class="quick-entry">
        <h2>业务快捷入口</h2>
        <div class="quick-entry__content">
          {state.loading ? (
            <div class="quick-entry__state">
              <Spin tip="快捷入口加载中" />
            </div>
          ) : state.list.length > 0 ? (
            <div class={["quick-entry__list", { "quick-entry__list--full": state.list.length === 6 }]}>
              {state.list.map((menu) => {
                const icon = resolveFrequentMenuIcon(menu, state.applicationIcons);
                return (
                  <button
                    key={menu.id}
                    class="quick-entry__item"
                    type="button"
                    title={`${menu.name}${menu.applicationName ? ` · ${menu.applicationName}` : ""}`}
                    disabled={state.navigatingMenuId !== null}
                    onClick={() => goPage(menu)}
                  >
                    <span class={["quick-entry__icon", { "quick-entry__icon--fallback": !icon }]}>
                      {icon ? <Image src={icon} preview={false} /> : <AppstoreOutlined />}
                    </span>
                    <span class="quick-entry__label">
                      <strong>{menu.name}</strong>
                      <small>{menu.applicationName}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div class="quick-entry__state">
              <Empty description="暂无快捷入口" />
            </div>
          )}
        </div>
      </aside>
    );
  },
});
