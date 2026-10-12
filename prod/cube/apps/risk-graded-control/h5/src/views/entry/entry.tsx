import { defineComponent, type VNode } from "vue";

import { CubeNavBar, EntryMenu } from "@ghcloud/cube-app-generic-component";

import { routes } from "@/router";

import styles from "./entry.module.less";

export const Entry = defineComponent({
  name: "Entry",
  setup: () => {
    document.title = "风险分级管控";
    return (): VNode => (
      <>
        <CubeNavBar showBack title="风险分级管控" />
        <div class={styles.container}>
          <EntryMenu title="业务操作" applicationCode={__ENV__.applicationCode} routes={routes} />
        </div>
      </>
    );
  },
});
