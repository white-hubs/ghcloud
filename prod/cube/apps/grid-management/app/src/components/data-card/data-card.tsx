import styles from "./data-card.module.less";
import { Skeleton } from "@ghcloud/cube-ui";
import { defineComponent } from "vue";

interface DataCardProps {
  title: string;
  loading: boolean;
}

export const DataCard = defineComponent({
  name: "DataCard",
  props: {
    title: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: DataCardProps, { slots }) {
    return (): JSX.Element => (
      <div class={styles["data-card"]}>
        <div class={styles["title"]}>
          <span>{props.title}</span>
          {slots.titleExtra?.()}
        </div>
        <div class={styles["content"]}>
          <Skeleton loading={props.loading} active paragraph={{ rows: 6 }}>
            {slots.default?.()}
          </Skeleton>
        </div>
      </div>
    );
  },
});
