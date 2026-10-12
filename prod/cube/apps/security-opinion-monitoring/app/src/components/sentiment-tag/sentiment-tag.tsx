import { defineComponent } from "vue";

import type { Sentiment } from "@ghcloud/cube-service-interface/security-opinion";
import { Tag } from "@ghcloud/cube-ui";

import { SENTIMENT_LABEL } from "@/constants";

import styles from "./sentiment-tag.module.less";

const COLOR_MAP: Record<Sentiment, string> = {
  positive: "success",
  neutral: "processing",
  negative: "error",
  unknown: "default",
};

export const SentimentTag = defineComponent({
  props: {
    sentiment: { type: String as () => Sentiment, required: true },
  },
  setup(props) {
    return (): JSX.Element => (
      <Tag color={COLOR_MAP[props.sentiment]} class={styles.tag}>
        {SENTIMENT_LABEL[props.sentiment]}
      </Tag>
    );
  },
});
