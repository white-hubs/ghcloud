import { defineComponent } from "vue";

import ChartData from "./components/chart-data";

import "./humidity.module.less";

export const Humidity = defineComponent({
  name: "HumidityNew",
  props: {
    data: { type: Object, default: () => ({}) },
    productPropVoList: { type: Array, default: () => [] },
    deviceInfo: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return (): JSX.Element => (
      <>
        <div class="title">现场数据</div>
        <ChartData productPropVoList={props.productPropVoList} data={props.data} />
      </>
    );
  },
});

export default Humidity;
