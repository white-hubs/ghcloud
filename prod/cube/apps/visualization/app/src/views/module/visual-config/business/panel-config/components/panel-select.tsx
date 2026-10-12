import { defineComponent, ref, watch } from "vue";

import type { AreaScenePanelConfig, AreaScenePanelModifyParam } from "@ghcloud/cube-service-interface/mdata";
import { getAreaScenePanelConfig } from "@ghcloud/cube-services-client/mdata.client";
import { Spin, message } from "@ghcloud/cube-ui";

import { providePanelCardDrag } from "../use-panel-card-drag";
import { PanelCardGhost } from "./panel-card-ghost";
import { PanelSelectItem } from "./panel-select-item";
import { useAuthRequest } from "@/hooks/auth-request";

import styles from "./panel-select.module.less";

/**
 * 左右面板并排编辑区：按区域层级 + 业务菜单加载 / 校验配置。
 */
export const PanelSelect = defineComponent({
  name: "PanelSelect",
  props: {
    areaId: {
      type: String,
      required: true,
    },
    sceneType: {
      type: String,
      required: true,
    },
  },
  setup(props, { expose }) {
    providePanelCardDrag();
    const loading = ref(false);
    const leftConfig = ref<AreaScenePanelConfig | AreaScenePanelModifyParam | null>(null);
    const rightConfig = ref<AreaScenePanelConfig | AreaScenePanelModifyParam | null>(null);
    const leftRef = ref<{ validate: () => Promise<void> }>();
    const rightRef = ref<{ validate: () => Promise<void> }>();

    const loadConfig = async (): Promise<void> => {
      leftConfig.value = null;
      rightConfig.value = null;
      if (!props.areaId || !props.sceneType) {
        return;
      }
      loading.value = true;
      try {
        const list = await useAuthRequest(() =>
          getAreaScenePanelConfig({
            areaId: props.areaId,
            sceneType: props.sceneType,
          }),
        );
        leftConfig.value = list.find((item) => item.panelPosition === "LEFT_PANEL") ?? null;
        rightConfig.value = list.find((item) => item.panelPosition === "RIGHT_PANEL") ?? null;
      } catch {
        message.error("获取面板配置失败");
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => [props.areaId, props.sceneType] as const,
      () => {
        void loadConfig();
      },
      { immediate: true },
    );

    const validate = async (): Promise<void> => {
      await leftRef.value?.validate();
      await rightRef.value?.validate();
    };

    const getConfig = (): AreaScenePanelModifyParam[] =>
      [leftConfig.value, rightConfig.value]
        .filter((item): item is AreaScenePanelModifyParam => Boolean(item?.panelConfig))
        .map((item) => ({
          panelConfig: item.panelConfig,
          panelPosition: item.panelPosition as "LEFT_PANEL" | "RIGHT_PANEL",
          universalPanelParam: (item as AreaScenePanelModifyParam).universalPanelParam ?? {
            tableOne: "",
            tableOneName: "",
            tableTwo: "",
            tableTwoName: "",
            tableThree: "",
            tableThreeName: "",
            items: (item as AreaScenePanelConfig).universalPanelVo?.items ?? null,
          },
        }));

    expose({
      validate,
      getConfig,
      requestAreaScenePanelConfig: loadConfig,
    });

    return () => (
      <Spin spinning={loading.value} tip="加载中..." class={styles.spin}>
        <div class={styles.row}>
          <div class={styles.col} data-panel-scroll>
            <PanelSelectItem
              ref={leftRef}
              panelPosition="LEFT_PANEL"
              config={leftConfig.value}
              onUpdate:config={(val: AreaScenePanelModifyParam | null) => {
                leftConfig.value = val;
              }}
            />
          </div>
          <div class={styles.col} data-panel-scroll>
            <PanelSelectItem
              ref={rightRef}
              panelPosition="RIGHT_PANEL"
              config={rightConfig.value}
              onUpdate:config={(val: AreaScenePanelModifyParam | null) => {
                rightConfig.value = val;
              }}
            />
          </div>
        </div>
        <PanelCardGhost />
      </Spin>
    );
  },
});

export default PanelSelect;
