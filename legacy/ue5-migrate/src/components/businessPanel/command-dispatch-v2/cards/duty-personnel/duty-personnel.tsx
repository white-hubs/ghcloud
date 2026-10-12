import moment from "moment";
import { defineComponent, onMounted, onBeforeUnmount, reactive } from "vue";
import { CountTo } from "vue3-count-to";

import { arrangeTodayStat } from "@/api/attendance";
import DutyPersonList from "@/components/businessPanel/public/dutyPersonList.vue";
import NoData from "@/components/businessPanel/public/noData.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";

import styles from "./duty-personnel.module.less";

export const DutyPersonnel = defineComponent({
  name: "DutyPersonnel",
  setup() {
    const personStatistic = reactive({
      total: 0,
      onDutyNum: 0,
      leaveNum: 0,
    });

    let personnelInfo = reactive({
      obj: {
        arrive: 0,
        total: 0,
      },
      list: [],
    });

    let timer: any = null;

    const requestStateTotal = async () => {
      const res = await arrangeTodayStat();
      personStatistic.onDutyNum = res.workCount;
      personStatistic.leaveNum = res.totalCount - res.workCount;
      personStatistic.total = res.totalCount;
    };

    const getDutyPersonnel = async () => {
      const res = await arrangeTodayStat();
      personnelInfo.obj.arrive = res.workCount;
      personnelInfo.obj.total = res.totalCount;
      personnelInfo.list = res.staffResultList.map((item: any) => ({
        ...item,
        startWorkTime: item.startWorkTime ? moment(item.startWorkTime).format("DD日HH:mm") : null,
        endWorkTime: item.endWorkTime ? moment(item.endWorkTime).format("DD日HH:mm") : null,
      }));
    };

    const init = () => {
      getDutyPersonnel();
    };

    onMounted(() => {
      requestStateTotal();
      getDutyPersonnel();
      timer = setInterval(init, (window as any).config.pageLoopRequestTime);
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    return () => (
      <SubPanelTemplate title="当日值班人员" class={styles.monitor}>
        <div class={styles.panel}>
          <div class={styles.body}>
            <div class={styles["person-statistic"]}>
              <div class={[styles["view-statistic"], styles["flex-center"]]}>
                <div class={styles.bg}>
                  <img src={getAssetsImage("overView4.png")} />
                  <img class={[styles.rotate]} src={getAssetsImage("overView13.png")} alt="" />
                </div>
                <div class={[styles["view-content"], styles["view-left"], styles["flex-center"]]}>
                  <div class={styles.icon}>
                    <img src={getAssetsImage("overView9.png")} alt="" />
                  </div>
                  <div class={styles.content}>
                    <CountTo startVal={0} endVal={personStatistic.onDutyNum} duration={4000} class={styles["scroll-number"]}></CountTo>
                    <div class={styles.title}>在岗人员</div>
                  </div>
                </div>
                <div class={[styles["view-content"], styles["view-right"], styles["flex-center"]]}>
                  <div class={styles.content}>
                    <CountTo startVal={0} endVal={personStatistic.leaveNum} duration={4000} class={styles["scroll-number"]}></CountTo>
                    <div class={styles.title}>离岗人员</div>
                  </div>
                  <div class={styles.icon}>
                    <img src={getAssetsImage("overView11.png")} alt="" />
                  </div>
                </div>
              </div>
            </div>
            <DutyPersonList
              class={styles.operatorDuty}
              arrive={personnelInfo.obj.arrive}
              total={personnelInfo.obj.total}
              list={personnelInfo.list}
              v-show={personnelInfo.list.length > 0}
            />
            <div class={styles.body} style={{ minHeight: "150px" }} v-show={personnelInfo.list.length <= 0}>
              <NoData />
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    );
  },
});
