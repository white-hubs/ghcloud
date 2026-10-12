import { Button, Icon } from "vant";
import { defineComponent, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";

import { useMetaTitle } from "../hooks/use-meta-title-hook";

import styles from "./complete.module.less";
export const CompleteInspection = defineComponent({
  setup() {
    useMetaTitle();
    const router = useRouter();
    return (): VNode => (
      <>
        <CubeNavBar showBack title="巡检完成" />
        <div class={styles.wrapper}>
          <div class={styles.content}>
            <div class={styles.icon}>
              <Icon size="80" name="checked" />
            </div>
            <div class={styles.message}>巡查结果提交成功</div>
            <Button
              block
              onClick={() => {
                router.go(-1);
              }}
            >
              返回
            </Button>
            <Button block type="primary">
              继续巡检
            </Button>
            <Button block type="primary">
              隐患整改
            </Button>
            <Button block type="primary">
              故障报修
            </Button>
          </div>
        </div>
      </>
    );
  },
});
