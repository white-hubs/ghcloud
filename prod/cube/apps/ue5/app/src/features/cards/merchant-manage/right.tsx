import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationContractCount, visualizationPrice, visualizationProportion } from "@/infrastructure/api/merchant";
import planPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import pieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./right.module.less";

export const Right = defineComponent({
  name: "Right",
  setup(_props, ctx) {
    const colors = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
    const proportionTime = ref<ModelValueItf>();
    const statisticsType = ref("honestyScore");
    const secureType = ref("honesty_score");
    const typeList = [
      {
        label: "诚信经营",
        value: "honestyScore",
      },
      {
        label: "商品质量",
        value: "zScoreAvg",
      },
      {
        label: "诚实守信",
        value: "sScoreAvg",
      },
      {
        label: "服务态度",
        value: "tScoreAvg",
      },
      {
        label: "环境卫生",
        value: "wScoreAvg",
      },
    ];
    const typeList1 = [
      {
        label: "诚信经营",
        value: "honesty_score",
      },
      {
        label: "商品质量",
        value: "z_score",
      },
      {
        label: "诚实守信",
        value: "s_score",
      },
      {
        label: "服务态度",
        value: "t_score",
      },
      {
        label: "环境卫生",
        value: "w_score",
      },
    ];
    const proportionData = reactive({
      arr: [],
      throughNum: 0,
    });
    const roundPieData = reactive({
      arr: [],
      throughNum: 0,
    });
    const columns = ref([
      {
        title: "商户",
        dataIndex: "companyName",
      },
      {
        title: "管理档位",
        dataIndex: "deviceName",
      },
      {
        title: "商户姓名",
        dataIndex: "owner",
      },
      {
        title: "诚信经营值",
        dataIndex: "data",
      },
    ]);
    const listData = ref([]);
    // 诚信经营占比
    const changeSecureTime = async () => {
      let res = await visualizationProportion({ code: secureType.value });
      proportionData.throughNum = 0;
      proportionData.arr = res.map((item, index) => {
        proportionData.throughNum += item.value;
        return {
          label: item.name,
          value: item.value,
          color: colors[index],
        };
      });
    };
    // 诚信经营值统计
    const changeStatisticsTime = async () => {
      listData.value = await visualizationPrice();
      listData.value.forEach((item) => {
        item.sScoreAvg = Number(item.sScoreAvg) + "星";
        item.tScoreAvg = Number(item.tScoreAvg) + "星";
        item.wScoreAvg = Number(item.wScoreAvg) + "星";
        item.zScoreAvg = Number(item.zScoreAvg) + "星";
        item.honestyScore = Number(item.honestyScore) + "星";
      });
      changeType();
    };
    const changeType = () => {
      typeList.forEach((item) => {
        if (item.value === statisticsType.value) {
          columns.value[columns.value.length - 1].title = item.label;
          columns.value[columns.value.length - 1].dataIndex = item.value;
        }
      });
    };
    // 商户合同统计
    const changeProportionTime = async () => {
      let res = await visualizationContractCount({ period: proportionTime.value.dateRange.join(",") });
      roundPieData.throughNum = 0;
      roundPieData.arr = res.map((item, index) => {
        roundPieData.throughNum += item.value;
        return {
          label: item.name,
          value: item.value,
          color: colors[index],
        };
      });
    };
    onMounted(() => {
      changeStatisticsTime();
      changeSecureTime();
    });

    return (): JSX.Element => (
      <>
        <div>
          <SubPanelTemplate title="诚信经营占比">
            <a-select
              onChange={changeSecureTime}
              value={secureType.value}
              onUpdate:value={(v) => {
                secureType.value = v;
              }}
              style="height: 28px;margin-bottom: 10px;"
            >
              {typeList1.map((item, i) => (
                <a-select-option value={item.value}> {item.label}</a-select-option>
              ))}
            </a-select>
            <div class="equipmentAlarm">
              <planPie pie-data={proportionData.arr}>
                <div class="content">
                  <div class="pie-center">
                    {proportionData.throughNum}
                    (次)
                  </div>
                  <div> 评价次数总数</div>
                </div>
              </planPie>
              <pieList roundPieData={proportionData.arr}></pieList>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="诚信经营值统计">
            <a-select
              onChange={changeType}
              value={statisticsType.value}
              onUpdate:value={(v) => {
                statisticsType.value = v;
              }}
              style="height: 28px;margin-bottom: 10px;"
            >
              {typeList.map((item, i) => (
                <a-select-option value={item.value}> {item.label}</a-select-option>
              ))}
            </a-select>
            <div class="body">
              {" "}
              <RollTable column={columns.value} data={listData.value}></RollTable>
            </div>
          </SubPanelTemplate>
          <SubPanelTemplate title="商户合同统计">
            <template>
              {" "}
              <DateInlineForm
                modelValue={proportionTime.value}
                onUpdate:modelValue={(v) => {
                  proportionTime.value = v;
                }}
                onSearch={changeProportionTime}
              ></DateInlineForm>
            </template>
            <div class="equipmentAlarm">
              <planPie pie-data={roundPieData.arr}>
                <div class="content">
                  <div> 合同总数</div>
                  <div class="pie-center">
                    {roundPieData.throughNum}
                    (个)
                  </div>
                </div>
              </planPie>
              <pieList roundPieData={roundPieData.arr}></pieList>
            </div>
          </SubPanelTemplate>
        </div>
      </>
    );
  },
});

export default Right;
