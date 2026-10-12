import dayjs from "dayjs";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import inspect from "./components/inspect-detail/index";
import inspectRecord from "./components/inspect-record";
import modalTable from "@/features/equipment/modal-table/modal";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { inspectAnalysisTaskRecordPage } from "@/infrastructure/api/maintain";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./abnormal-statistics-engineering-inspection.module.less";

export const AbnormalStatisticsEngineeringInspection = defineComponent({
  name: "AbnormalStatisticsEngineeringInspection",
  setup(_props, ctx) {
    const inspectParameter = ref({
      id: "",
      businessType: "",
    });
    const inspectListParameter = ref({
      period: [],
      businessType: "SMALL_ENGINEERING",
      title: "工程巡查异常记录",
    });
    const alarmModalShow = ref(false);
    const inspectionRecordShow = ref(false);
    let timeFrame = ref<ModelValueItf>();
    const lists = ref([]);
    const getAlarmLevel = async () => {
      const res = await inspectAnalysisTaskRecordPage({
        pageNumber: 1,
        pageSize: 10,
        period: timeFrame.value.dateRange.join(","),
        businessType: "SMALL_ENGINEERING",
        result: "ABNORMAL",
      });
      lists.value = res.records;
    };
    const detail = (item) => {
      inspectParameter.value.id = item.id;
      inspectParameter.value.businessType = "SMALL_ENGINEERING";
      alarmModalShow.value = true;
    };
    const handleAll = () => {
      inspectListParameter.value.period = timeFrame.value.dateRange;
      inspectionRecordShow.value = true;
    };

    return (): JSX.Element => (
      <>
        <SubPanelTemplate title="工程巡查异常记录">
          <template>
            {" "}
            <div class="flex-align">
              {" "}
              <DateInlineForm
                modelValue={timeFrame.value}
                onUpdate:modelValue={(v) => {
                  timeFrame.value = v;
                }}
                onSearch={getAlarmLevel}
              />
            </div>
          </template>
          <div class="dataTitle">
            {" "}
            <div class="dataTitle-right" style="color: #5EA6FF;" onClick={handleAll}>
              {" "}
              查看更多{">>"}
            </div>
          </div>
          <div class="abnormal-statistics">
            <vue3-seamless-scroll list={lists.value} step={lists.length > 4 ? 0.5 : 0} hover singleHeight={40} waitTime={1000}>
              {lists.map((item) => (
                <div class="abnormal-statistics-item" onClick={detail(item)} key={item.id}>
                  <div class="abnormal-statistics-item-left">
                    {item?.fileVO?.path && <img src={item?.fileVO?.path} alt srcset></img>}
                    <img src={getAssetsImage("alarm-default.png")} alt srcset></img>
                  </div>
                  <div class="abnormal-statistics-item-right">
                    <div class="abnormal-statistics-item-right-top">
                      {" "}
                      <div> {dayjs(item.time).format("YYYY-MM-DD HH:mm:ss")}</div>
                    </div>
                    <div class="abnormal-statistics-item-right-middle">
                      <div class="right-middle-title"> {item.targetName}</div>
                      <div class="right-middle-type"> 异常</div>
                    </div>
                    <div class="abnormal-statistics-item-right-bottom">
                      <div> 异常项:</div>
                      <div> {item.errorItem}</div>
                    </div>
                  </div>
                </div>
              ))}
            </vue3-seamless-scroll>
          </div>
        </SubPanelTemplate>
        {alarmModalShow && (
          <inspect
            ref="inspectRef"
            title={"巡查记录详情"}
            parameter={inspectParameter.value}
            onClose={() => {
              alarmModalShow.value = false;
            }}
          ></inspect>
        )}
        {inspectionRecordShow && (
          <modal-table
            modalStyle={{ width: "900px" }}
            show={inspectionRecordShow.value}
            title="巡检记录列表"
            onClose={() => {
              inspectionRecordShow.value = false;
            }}
          >
            {" "}
            <inspect-record parameter={inspectListParameter.value}></inspect-record>
          </modal-table>
        )}
      </>
    );
  },
});

export default AbnormalStatisticsEngineeringInspection;
