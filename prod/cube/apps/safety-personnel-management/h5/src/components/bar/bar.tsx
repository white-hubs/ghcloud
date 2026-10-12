import { Icon, NavBar } from "vant";
import { defineComponent, ref, watch, type VNode } from "vue";
import { useRoute } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import styles from "./bar.module.less";

export const Bar = defineComponent({
  props: {
    name: {
      type: String,
      default: "",
    },
    showBack: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const route = useRoute();
    const title = ref("");

    watch(
      () => route.meta,
      () => {
        title.value = String(route.meta.title ?? "");
      },
      { immediate: true },
    );

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
          title={props.name || title.value}
          v-slots={{
            left: () => (props.showBack ? <Icon name="arrow-left" size="20" color="#505a66" onClick={handleBack} /> : null),
            right: () => slots.right?.(),
          }}
        />
      </div>
    );
  },
});
