import { defineComponent, type PropType } from "vue";

import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./patrol-content.module.less";

type PatrolItem = {
  title: string;
  value: number;
};

export const PatrolContent = defineComponent({
  name: "PatrolContent",
  props: {
    patrol: { type: Array as PropType<PatrolItem[]>, required: true },
  },
  setup(props) {
    return (): JSX.Element => (
      <div class="patrolBox">
        {props.patrol.map((item) => (
          <div class="patrolBox_item" key={item.title}>
            <div class="patrolBox_item_title">{item.title}</div>
            <div class="patrolBox_item_bg">
              <CountTo startVal={0} endVal={item.value} separator duration={4000} class="scroll-number" />
            </div>
          </div>
        ))}
      </div>
    );
  },
});

export default PatrolContent;
