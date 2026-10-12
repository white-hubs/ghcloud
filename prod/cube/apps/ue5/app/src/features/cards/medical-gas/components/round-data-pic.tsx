import { defineComponent } from "vue";

import styles from "./round-data-pic.module.less";

export const RoundDataPic = defineComponent({
  name: "RoundDataPic",
  props: {
    img: { type: String, required: false },
    percent: { type: Number, required: false, default: 75 },
  },
  setup(props, ctx) {
    return (): JSX.Element => (
      <>
        <div class="contanier">
          <div class="dotted"></div>
          <a-progress
            stroke-color={{ "0%": "#2C8BFF", "100%": "#B2D4FF" }}
            percent={percent}
            type="circle"
            strokeLinecap="square"
            trailColor="rgba(255, 255, 255, 0.1)"
          >
            <template>
              <img src={props.img} class="icon" />
              <slot></slot>
            </template>
          </a-progress>
        </div>
      </>
    );
  },
});

export default RoundDataPic;
