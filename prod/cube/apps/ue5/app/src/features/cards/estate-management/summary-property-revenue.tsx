import { defineComponent } from "vue";
import { ref, reactive, onMounted, computed } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import RingChart from "@/shared-ui/panel/charts/ring/ring";

import styles from "./summary-property-revenue.module.less";

export const SummaryPropertyRevenue = defineComponent({
  name: "SummaryPropertyRevenue",
  setup(_props, ctx) {
    const pieData = ref([
      {
        name: "水费",
        value: 10,
        color: "#328BF7",
      },
      {
        name: "电费",
        value: 20,
        color: "#19F8F7",
      },
      {
        name: "修缮费",
        value: 30,
        color: "#FFC700",
      },
      {
        name: "物管费",
        value: 40,
        color: "#EF424A",
      },
    ]);
    let equipmentData = reactive({
      deviceNum: 0,
    });
    const statisticValueStyle = computed(() => (index) => {
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: pieData[index]?.color,
      };
    });
    const statisticStyle = computed(() => {
      return {
        fontSize: "16px",
        color: "#FFFFFF",
        paddingLeft: "16px",
      };
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate>
          <div class="chart">
            {" "}
            <RingChart pieData={pieData.value} seriesName="设备类型统计" total={equipmentData.deviceNum}></RingChart>
          </div>
          <div class="statistic-lenged">
            {pieData.map((item, index) => (
              <div class="statistic-item">
                <a-statistic value={item.value} valueStyle={statisticStyle.value}>
                  <template>
                    <div class="title flex-start">
                      <div class="box" style={statisticValueStyle(index)}></div>
                      <span> {item.name}</span>
                    </div>
                  </template>
                  <template>
                    {" "}
                    <span> {item.ratio}</span>
                  </template>
                </a-statistic>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default SummaryPropertyRevenue;
