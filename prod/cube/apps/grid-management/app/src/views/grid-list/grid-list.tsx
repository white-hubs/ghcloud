import { defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { ListModel } from "./components/list-model/list-model";
import { ListTable } from "./components/list-table/list-table";

import styles from "./grid-list.module.less";

export const GridList = defineComponent({
  name: "GridList",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { viewMode } = route.query;
    const shoModel = ref(viewMode !== "LIST");

    watch(shoModel, (showModel) => {
      const nextViewMode = showModel ? "MODEL" : "LIST";
      if (route.query.viewMode === nextViewMode) {
        return;
      }
      void router.replace({
        query: {
          ...route.query,
          viewMode: nextViewMode,
        },
      });
    });

    return (): JSX.Element => (
      <div class={styles["grid-list-container"]}>
        <ListModel v-model:show={shoModel.value} />
        <ListTable
          show={!shoModel.value}
          onUpdate:show={() => {
            shoModel.value = !shoModel.value;
          }}
        />
      </div>
    );
  },
});
