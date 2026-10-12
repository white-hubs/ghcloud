import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

import DeviceStatistics from "@/features/cards/security-overview/components/device-statistics";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { sourceLedgerPage } from "@/infrastructure/api/property";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./fire-equipment-statistics.module.less";

export const FireEquipmentStatistics = defineComponent({
  name: "FireEquipmentStatistics",
  props: {
    title: {
      type: String,
      default: "消防设备统计",
    },
  },
  setup(props) {
    // 时间选择器数据
    const fireControlTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });

    // 表格数据
    const listData = ref([]);
    const column = reactive([
      {
        title: "设备名称",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "设备类型",
        dataIndex: "typeName",
      },
      {
        title: "使用年限",
        dataIndex: "usageDate",
        width: 140,
      },
      {
        title: "状态",
        dataIndex: "status",
        slots: {
          customRender: "status",
        },
      },
    ]);

    // 设备统计数据
    const deviceStatisticsData = reactive({
      title: "到期设备数",
      total: 0,
    });

    // 弹窗相关
    const alarmModalShow = ref(false);
    const parameter = reactive({
      dateRange: [],
    });

    // 获取消防设备统计数据
    const getFireControlCount = async () => {
      const params = {
        status: "EXPIRE",
        typeCode: "FIRE_FIGHTING_EQUIPMENT",
      };
      const data = await sourceLedgerPage(params);
      deviceStatisticsData.total = data.total;
      listData.value = data.records.map((e) => {
        return {
          ...e,
          status: e.status === "EXPIRE" ? "已过期" : "正常",
          usageDate: e.usageDate ? dayjs(e.usageDate).format("YYYY-MM-DD") : "-",
        };
      });
    };

    // 统计数据更新
    const fireControlStat = () => {
      getFireControlCount();
    };

    // 点击行处理函数
    const clickRow = () => {
      parameter.dateRange = fireControlTime.value.dateRange;
      alarmModalShow.value = true;
    };

    onMounted(() => {
      fireControlStat();
    });

    return (): JSX.Element => (
      <>
        <SubPanelTemplate
          title={props.title}
          class={styles["alarm-event"]}
          v-slots={{
            extra: () => <DateInlineForm v-model:modelValue={fireControlTime.value} onSearch={fireControlStat} />,
          }}
        >
          {listData.value.length > 0 ? (
            <>
              <DeviceStatistics imgPath="89-icon.png" statistic={deviceStatisticsData} onHandelClickItemize={clickRow} />
              <RollTable
                column={column}
                data={listData.value}
                limitScrollNum={4}
                v-slot={{
                  alarmStatus: ({ record }) => (
                    <>
                      {record.expireStatus === "EXPIRE" && <span style="color: #f14545">已过期</span>}
                      {record.expireStatus === "NOT_EXPIRED" && <span style="color: #00f27b">已处理</span>}
                    </>
                  ),
                }}
              ></RollTable>
            </>
          ) : (
            <NoData />
          )}
        </SubPanelTemplate>
        <ModalAlarmTable showModal={alarmModalShow.value} onClose={() => (alarmModalShow.value = false)} parameter={parameter} />
      </>
    );
  },
});
