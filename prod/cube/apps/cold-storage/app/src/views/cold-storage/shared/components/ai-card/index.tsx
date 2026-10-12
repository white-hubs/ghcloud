import { defineComponent } from "vue";

import { Tag } from "@ghcloud/cube-ui";

import "./index.less";

export const AiCard = defineComponent({
  name: "AiCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      default: "AI 增强",
    },
  },
  setup: (props) => () => (
    <section class="cs-ai-card">
      <div>
        <b>{props.title}</b>
        <p>{props.text}</p>
      </div>
      <Tag color="purple">{props.badge}</Tag>
    </section>
  ),
});
