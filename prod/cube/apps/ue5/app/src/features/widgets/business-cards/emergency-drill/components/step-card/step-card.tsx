import { defineComponent } from "vue";

import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./step-card.module.less";

interface Props {
  step?: number;
  title?: string;
  active?: boolean;
}
export const StepCard = defineComponent({
  name: "StepCard",
  props: ["step", "title", "active"],
  setup(props: Props, { slots }) {
    return (): JSX.Element => (
      <div class={styles.emergencyStep}>
        <div class={[styles.stepContainer, props.active ? styles.active : ""]}>
          <div class={[styles.stepHead, props.active ? styles.active : ""]}>
            <div class={styles.stepNumber}>
              {props.step}
              <img class={styles.stepIcon} src={getAssetsImage(props.active ? "step-active.png" : "step.png")} />
            </div>
            <div class={styles.stepTitle}>
              <span class={styles.text}>{props.title}</span>
              <span class={styles.textRight}>
                <span class={styles.title}>{slots["title"]?.()}</span>
                <span class={styles.tag}>{slots["title-tag"]?.()}</span>
              </span>
            </div>
          </div>
          <div class={styles.stepContent}>{slots["content"]?.()}</div>
        </div>
      </div>
    );
  },
});
