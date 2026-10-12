import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import MonitorPanel from "@/features/cards/safety-management/components/monitor-panel";
import SmallEngineeringTable from "@/features/cards/safety-management/components/small-engineering-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { projectNumStatistics, projectTrendStatistics } from "@/infrastructure/api/maintain";
import LineChart from "@/shared-ui/panel/lineChart";

import styles from "./project-record.module.less";

export const ProjectRecord = defineComponent({
  name: "ProjectRecord",
  props: {
    title: {
      type: String,
      default: "小散工程记录",
    },
  },
  setup(props) {
    // 小散工程记录数据
    const monitorPanelData = ref([
      {
        imgPath: "overView5.png",
        value: 0,
        name: "小散工程总数",
        color: "rgba(41, 137, 255, 1)",
      },
      {
        imgPath: "overView87.png",
        value: 0,
        name: "小散工程异常数",
        color: "rgba(255, 171, 16, 1)",
      },
    ]);

    const series = reactive([
      {
        data: [],
        linearGradientColor: ["rgb(86, 142, 255)", "rgb(86, 142, 255,0)"],
        smooth: false,
      },
    ]);

    const xData = reactive({
      arr: [],
    });

    // 弹窗相关
    const showModalSmall = ref(false);
    const parameterSmall = reactive({
      type: "",
      status: "",
      period: "",
      submitTime: "",
    });

    // 获取小散工程数据
    const getSmallEngineeringData = async () => {
      const res = await projectNumStatistics({
        period: moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss"),
      });
      const data = await projectTrendStatistics();

      monitorPanelData.value[0].value = res.total;
      monitorPanelData.value[1].value = res.abnormal;

      xData.arr = [];
      series[0].data = [];

      data.forEach((item) => {
        xData.arr.push(item.month + "月");
        series[0].data.push(item.num);
      });
    };

    // 点击设备处理函数
    const handelClickDevice = (item?: any) => {
      if (item === 0) {
        parameterSmall.status = "";
      } else {
        parameterSmall.status = "ABNORMAL";
      }
      parameterSmall.period =
        moment().startOf("year").format("YYYY-MM-DD 00:00:00") + "," + moment().endOf("year").format("YYYY-MM-DD HH:mm:ss");
      showModalSmall.value = true;
    };

    onMounted(() => {
      getSmallEngineeringData();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title={props.title}>
          <div class={styles.panelContainer}>
            <div class={styles.monitorPanelBox}>
              {monitorPanelData.value.map((item, index) => (
                <MonitorPanel key={item.name} monitorPanelData={item} onHandelClickItemize={() => handelClickDevice(index)} />
              ))}
            </div>
            <div class={styles.chartContainer}>
              <LineChart class={styles.lineChart} x-data={xData.arr} series={series} />
            </div>
          </div>
        </SubPanelTemplate>
        <SmallEngineeringTable showModal={showModalSmall.value} onClose={() => (showModalSmall.value = false)} parameter={parameterSmall} />
      </>
    );
  },
});
