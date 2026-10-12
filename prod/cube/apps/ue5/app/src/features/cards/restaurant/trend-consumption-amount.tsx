import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { canteenConsumptionAmount } from "@/infrastructure/api/onecard";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import styles from "./trend-consumption-amount.module.less";

export const TrendConsumptionAmount = defineComponent({
  name: "TrendConsumptionAmount",
  setup(_props, ctx) {
    const reservationData = ref<{ title: string; value: number }[]>([
      {
        title: "今日消费金额",
        value: 0,
      },
      {
        title: "本周消费金额",
        value: 0,
      },
      {
        title: "本月消费金额",
        value: 0,
      },
    ]);

    const fetchData = async () => {
      const dateFormat = "YYYY-MM-DD 23:59:59";

      const timeRanges = {
        今日消费金额: {
          startTime: moment().format("YYYY-MM-DD 00:00:00"),
          endTime: moment().format(dateFormat),
        },
        本周消费金额: {
          startTime: moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
          endTime: moment().endOf("week").add(1, "days").format(dateFormat),
        },
        本月消费金额: {
          startTime: moment().startOf("month").format("YYYY-MM-DD 00:00:00"),
          endTime: moment().endOf("month").format(dateFormat),
        },
      };

      const promises = reservationData.value.map(async (item: { title: string; value: number }) => {
        const range = timeRanges[item.title as keyof typeof timeRanges];
        if (range) {
          try {
            const res = await canteenConsumptionAmount({
              period: `${range.startTime},${range.endTime}`,
            });
            if (typeof res === "number") {
              item.value = res;
            } else if (res && typeof res?.amount === "number") {
              item.value = res?.amount;
            } else if (res && typeof res?.data === "number") {
              item.value = res?.data;
            }
          } catch (error) {}
        }
      });

      await Promise.all(promises);
    };

    onMounted(() => {
      fetchData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="消费金额展示">
          <div class="appointment-statistics">
            {reservationData.map((item) => (
              <div class="statistics-item" key={item.title}>
                <div class="statistics-box">
                  <div class="monitorPanel-left">
                    <div class="bg">
                      <img src={getAssetsImage("overView4.png")} alt />
                      <img class="rotate aniamtion-electric-fan" src={getAssetsImage("money1.png")} alt />
                    </div>
                  </div>
                  <div class="monitorPanel-right">
                    <div class="statistics-value"> {item.value}</div>
                    <div class="statistics-title"> {item.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SubPanelTemplate>
      </>
    );
  },
});

export default TrendConsumptionAmount;
