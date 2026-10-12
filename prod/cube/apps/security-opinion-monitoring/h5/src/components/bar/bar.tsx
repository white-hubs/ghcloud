import { Button, Icon, NavBar, Popup } from "vant";
import { defineComponent, ref, watch, type VNode } from "vue";
import { useRoute } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import styles from "./bar.module.less";

export const Bar = defineComponent({
  emits: ["reset", "submit", "right"],
  props: {
    rightName: {
      type: String,
      default: "筛选",
    },
    isShowRight: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      default: "",
    },
    onlyText: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit, slots }) {
    const route = useRoute();
    const showRight = ref(false);
    const meta = ref<{ title: string; isFilter: boolean }>({ title: "", isFilter: false });

    watch(
      () => route.meta,
      () => {
        meta.value.title = route.meta.title as string;
        meta.value.isFilter = route.meta.isFilter as boolean;
      },
      { immediate: true },
    );

    const onClickRight = (): void => {
      if (!props.onlyText) {
        showRight.value = true;
      }
      emit("right");
    };

    const submit = (): void => {
      emit("submit");
      showRight.value = false;
    };

    const handleBack = (): void => {
      if (getEnvironment() === "cubeApp") {
        void cubeAppService.backPage();
        return;
      }
      history.back();
    };

    return (): VNode => (
      <div class={styles.bar}>
        <NavBar
          title={props.name ? props.name : meta.value.title}
          v-slots={{
            left: () => <Icon name="arrow-left" size="20" color="#646566" onClick={handleBack} />,
            right: () =>
              props.isShowRight && meta.value.isFilter ? (
                <span class={styles.rightText} onClick={onClickRight}>
                  {props.rightName}
                </span>
              ) : null,
          }}
        />
        <Popup v-model:show={showRight.value} position="right" style={{ width: "90%", height: "100%" }}>
          {slots.default?.()}
          <div class={styles.button}>
            <div class={styles.reset} onClick={() => emit("reset")}>
              重置
            </div>
            <Button type="primary" block onClick={submit}>
              确定
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
