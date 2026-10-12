import { getAlarmNum } from "@/api/alarm";
import "./card.less";
import { authStore } from "@/api/auth-store";
import { electronTaskOverview, getFaultNum, getHiddenDangerNum, getInspectNum } from "@/api/maintain";
import { getRiskSourceNum, getTaskByPropertyIdNum } from "@/api/property";
import { safetyCultivateStatistic } from "@/api/safety-education";
import { useStore } from "@/store";
import { getAssetsImge } from "@/utils/common";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import moment from "moment";
import { Tab, Tabs, Tag, Icon, showDialog } from "vant";
import { defineComponent, ref, watch, type VNode } from "vue";
import { useRouter } from "vue-router";
/** 二维码中转页 */
export const Card = defineComponent({
  props: {
    cardData: {
      type: Object,
      default: () => {},
    },
    entityObject: {
      type: Object,
      default: () => ({
        entityId: "",
        entityName: "",
        entityType: "",
      }),
    },
  },
  setup: (props) => {
    const store = useStore();
    const { currentRoute } = useRouter();
    const code: string = currentRoute.value.query.code as string;
    const cardItem = ref<{ label: string; value: string }[]>([]);
    const period = ref();
    const status = ref<{ color: string; value: string }>({ color: "primary", value: "" });
    const riskSourceList = ref();
    const router = useRouter();
    // H5详情
    const h5Detail = ["STALL", "RISK_SOURCE", "SITE_POINT"];
    // H5统计页
    const h5StatisticalList = [
      { name: "secureEdu", path: "/apps/secure-edu/h5/#/qrcode-transfer-list", query: { entityId: "" } },
      { name: "riskResource", path: "/risk-resource", query: { riskSourceList: "" } },
      { name: "alarmNum", path: "/apps/alarm-center/h5/#/alarm-records", query: { entityId: "" } },
      { name: "faultNum", path: "/apps/fault-repair/h5#/fault-list", query: { entityId: "" } },
      { name: "hiddenDangerNum", path: "/apps/hidden-danger/h5#/hidden-danger-list", query: { entityId: "" } },
      { name: "inspectNum", path: "/apps/daily-inspection/h5#/file-detail", query: { entityId: "" } },
      { name: "patrolNum", path: "/apps/electronic-patrol/h5#/electronicPatrolRecord", query: { entityId: "" } },
    ];
    const statisticsNum = ref({
      riskSourceNum: 0,
      alarmNum: 0,
      inspectNum: 0,
      hiddenDangerNum: 0,
      faultNum: 0,
      inventoryNum: 0,
      detectionNum: 0,
      patrolNum: 0,
      secureEduNum: 0,
    });
    // 获取卡片详情
    const getCard = (): void => {
      const deviceManager = (props.cardData?.baseArchivesInfo?.manager as { id: string; name: string }[]) ?? [];
      const deviceManagerStr = deviceManager.length > 0 ? deviceManager.map((x: { name: string }) => x.name).join(",") : "--";
      switch (props.entityObject.entityType) {
        case "SITE_POINT":
          cardItem.value = [
            { label: "类型:", value: props.cardData?.typeName ?? "--" },
            { label: "管理部门:", value: props.cardData?.depName ?? "--" },
            { label: "所属区域:", value: props.cardData?.areaName ?? "--" },
          ];
          break;
        case "PROPERTY":
          getStatus(props.cardData?.status ?? "--");
          cardItem.value = [
            { label: "资产类别:", value: props.cardData?.typeName ?? "--" },
            { label: "使用部门:", value: props.cardData?.receiveDepName ?? "--" },
            { label: "使用人:", value: props.cardData?.receiveUserName ?? "--" },
            { label: "维护部门:", value: props.cardData?.maintenanceDepName ?? "--" },
          ];
          break;
        case "STALL":
          cardItem.value = [
            { label: "档位类型:", value: props.cardData?.typeName ?? "--" },
            { label: "所属部门:", value: (props.cardData.deptNames as []).join("/") ?? "--" },
            { label: "所属区域:", value: (props.cardData.areaNames as []).join("/") ?? "--" },
          ];
          break;
        case "RISK_SOURCE":
          cardItem.value = [
            { label: "风险源类型:", value: props.cardData?.typeName ?? "--" },
            { label: "使用部门:", value: props.cardData?.receiveDepName ?? "--" },
            { label: "所在区域:", value: props.cardData?.areaName ?? "--" },
            { label: "维护部门:", value: props.cardData?.maintenanceDepName ?? "--" },
          ];
          break;
        case "DEVICE":
          getDeviceStatus(props.cardData?.communicationStatus ?? "");
          cardItem.value = [
            { label: "管理部门:", value: props.cardData?.baseArchivesInfo?.department?.name ?? "--" },
            { label: "管理人:", value: deviceManagerStr },
            { label: "所属区域:", value: props.cardData?.baseArchivesInfo?.area?.pathName ?? "--" },
          ];
          break;
        case "PATROL_POINT":
          getDeviceStatus(props.cardData?.communicationStatus ?? "");

          props.cardData.area = props.cardData.area.map((e: { name: string }) => e.name);
          cardItem.value = [{ label: "所属区域:", value: props.cardData.area.join("-") ?? "" }];
          break;
        default:
          cardItem.value = [];
      }
    };
    // 获取状态
    const getStatus = (item: string): void => {
      switch (item) {
        case "UNDER":
          status.value.value = "审批中";
          status.value.color = "#1989fa";
          break;
        case "LEAVE_UNUSED":
          status.value.value = "闲置";
          status.value.color = "#1989fa";
          break;
        case "MAKE_USE_OF":
          status.value.value = "在用";
          status.value.color = "#07c160";
          break;
        case "WEED_OUT":
          status.value.value = "报废";
          status.value.color = "#c1c1c1";
          break;
        case "DELETE":
          status.value.value = "已删除";
          status.value.color = "#ee0a24";
          break;
        case "REPAIR_REPORT":
          status.value.value = "报修";
          status.value.color = "primary";
          break;
      }
    };
    // 获取设备状态
    const getDeviceStatus = (item: string): void => {
      status.value.value = item;
      switch (item) {
        case "离线":
          status.value.color = "#2F8DFF";
          break;
        case "正常":
          status.value.color = "#FFAB10";
          break;
        case "故障":
          status.value.color = "#F14545";
          break;
        case "报警":
          status.value.color = "#19F8F7";
          break;
      }
    };
    const tabsList = ref([
      { title: "本周", name: "week" },
      { title: "本月", name: "month" },
      { title: "本年", name: "year" },
    ]);
    const activeName = ref("");
    // 转换时间
    const convertTime = (time: string): string[] => {
      let dateRange: string[] = [];
      const dateFormat = "YYYY-MM-DD HH:mm:ss";
      if (time === "week") {
        dateRange = [moment().isoWeekday(1).format("YYYY-MM-DD 00:00:00"), moment().isoWeekday(7).format(dateFormat)];
      } else if (time === "month") {
        dateRange = [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];
      } else if (time === "year") {
        dateRange = [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(dateFormat)];
      }
      return dateRange;
    };
    interface DetailIdsType {
      hiddenDangerIds: string[];
      faultIds: string[];
    }
    const detailIds = ref<DetailIdsType>({
      hiddenDangerIds: [],
      faultIds: [],
    });
    // 获取统计的数据
    const getStatisticsNum = (params: { period: string; deviceIds: string }): void => {
      getInspectNum(params).then((res) => {
        // 巡检次数
        statisticsNum.value.inspectNum = res;
      });
      getHiddenDangerNum(params).then((res) => {
        // 整改次数
        statisticsNum.value.hiddenDangerNum = res.length;
        detailIds.value.hiddenDangerIds = res;
      });
      getFaultNum(params).then((res) => {
        // 报修次数
        statisticsNum.value.faultNum = res.length;
        detailIds.value.faultIds = res;
      });
      getAlarmNum(params).then((res) => {
        // 报警次数
        statisticsNum.value.alarmNum = res.alarmNum;
      });
      electronTaskOverview({ period: params.period, locationId: params.deviceIds, admin: false }).then((res) => {
        // 巡更次数
        statisticsNum.value.patrolNum = res.finished;
      });
      // 风险源列表数据，档位stallId，现场点sitePointId，其他不传
      if (props.entityObject.entityType === "STALL") {
        getRiskSourceNum({
          stallId: params.deviceIds,
        }).then((res) => {
          riskSourceList.value = res.records;
          // 风险源数
          statisticsNum.value.riskSourceNum = res.total;
          const riskSource = h5StatisticalList.find((x) => x.path === "/risk-resource")?.query;
          if (riskSource) {
            riskSource.riskSourceList = JSON.stringify(riskSourceList.value);
          }
        });
      } else if (props.entityObject.entityType === "SITE_POINT") {
        getRiskSourceNum({
          sitePointId: params.deviceIds,
        }).then((res) => {
          riskSourceList.value = res.records;
          // 风险源数
          statisticsNum.value.riskSourceNum = res.total;
          const riskSource = h5StatisticalList.find((x) => x.path === "/risk-resource")?.query;
          if (riskSource) {
            riskSource.riskSourceList = JSON.stringify(riskSourceList.value);
          }
        });
      } else {
        statisticsNum.value.riskSourceNum = 0;
      }
      getTaskByPropertyIdNum({ period: params.period, propertyId: params.deviceIds, status: "FINISH" }).then((res) => {
        // 盘点次数
        statisticsNum.value.inventoryNum = res.total;
      });
      // 安全教育
      safetyCultivateStatistic({ objId: params.deviceIds, period: params.period }).then((res) => {
        statisticsNum.value.secureEduNum = res.recordNum;
      });
      const safety = h5StatisticalList.find((x) => x.name === "secureEdu")?.query;
      if (safety) {
        safety.entityId = props.cardData?.id;
      }
    };
    // 切换日期
    const changeTab = async (tab: string): Promise<void> => {
      activeName.value = tab;
      period.value = convertTime(tab);
      const params = {
        period: period.value.join(","),
        deviceIds: String(props.cardData?.id ?? ""),
      };
      if (props.cardData?.id) {
        getStatisticsNum(params);
      }
    };
    // 点击次数跳转
    const clickNum = async (type: string, num: number): Promise<void> => {
      if (num === 0) {
        showDialog({
          title: "提示",
          message: "暂无业务数据。",
        });
        return;
      }
      const params = {
        applicationCode: "",
        objectId: props.cardData.id,
        startTime: period.value[0],
        endTime: period.value[1],
        dynamicParams: [] as string[] | boolean,
      };
      switch (type) {
        case "inspectNum":
          params.applicationCode = "INSPECTION";
          break;
        case "hiddenDangerNum":
          params.applicationCode = "HIDDENDANGER";
          params.dynamicParams = detailIds.value.hiddenDangerIds;
          break;
        case "faultNum":
          params.applicationCode = "FAULT";
          params.dynamicParams = detailIds.value.faultIds;
          break;
        case "inventoryNum":
          params.applicationCode = "PROPERTY_MANAGEMENT";
          break;
        case "alarmNum":
          params.applicationCode = "ALARM_CENTER";
          break;
        case "outsourceNum":
          params.applicationCode = "OUTSOURCE_REPAIR";
          break;
        case "patrolNum":
          params.applicationCode = "ELECTRONIC_PATROL";
          params.dynamicParams = false;
          break;
      }
      const findH5List = h5StatisticalList.find((x) => x.name === type);
      // H5应用跳转
      if (findH5List) {
        if (["alarmNum", "secureEdu", "faultNum", "hiddenDangerNum", "inspectNum", "patrolNum"].includes(findH5List.name)) {
          const tenant = (JSON.parse(sessionStorage.getItem("GH-NowEnterprise") as unknown as string) as { code: string }).code;
          window.location.href = `${findH5List.path}?entityId=${props.cardData.id}&sourceApp=qrCodeTransfer&period=${period.value}&detailIds=${JSON.stringify(detailIds.value)}&entity=${JSON.stringify(props.entityObject)}&&isLogin=${!!authStore.token}&tenant=${tenant}`;
          return;
        }
        router.push({ path: findH5List.path, query: findH5List.query ?? {} });
        return;
      }
      if (store.inGhApp) {
        cubeAppService.onQrcodeReceived(code);
        await cubeAppService.openBusinessStatsRecord(JSON.stringify(params));
      } else {
        showDialog({
          title: "提示",
          message: "暂不支持该功能，请使用app操作",
        });
      }
    };
    // 点击卡片跳转
    const clickCard = async (): Promise<void> => {
      // 跳转H5详情
      const findH5 = h5Detail.find((x) => x === props.entityObject.entityType);
      const tenant = (JSON.parse(sessionStorage.getItem("GH-NowEnterprise") as unknown as string) as { code: string }).code;
      if (findH5 === "STALL") {
        window.location.href = `/apps/gear/h5/#/gear-detail?id=${props.cardData.id}&isLogin=${!!authStore.token}&tenant=${tenant}`;
        return;
      }
      if (findH5 === "RISK_SOURCE") {
        window.location.href = `/apps/risk-management/h5/#/risk-detail?id=${props.cardData.id}&isLogin=${!!authStore.token}&tenant=${tenant}`;
        return;
      }
      if (findH5 === "SITE_POINT") {
        window.location.href = `/apps/daily-inspection/h5/#/scene-point-detail?id=${props.cardData.id}&isLogin=${!!authStore.token}&tenant=${tenant}`;
        return;
      }
      // 跳转APP详情
      if (store.inGhApp) {
        cubeAppService.onQrcodeReceived(code);
        await cubeAppService.openObjectDetails();
      }
    };
    watch(
      () => props.cardData,
      () => {
        getCard();
        period.value = convertTime("week");
        const params = {
          period: period.value.join(","),
          deviceIds: String(props.cardData?.id ?? ""),
        };
        getStatisticsNum(params);
      },
    );
    const statisticsListDom = (): VNode => {
      if (authStore.token) {
        return (
          <>
            <div
              class="num-item"
              onClick={() => {
                clickNum("riskResource", statisticsNum.value.riskSourceNum);
              }}
            >
              <div>
                风险源数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.riskSourceNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("alarmNum", statisticsNum.value.alarmNum);
              }}
            >
              <div>
                报警数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.alarmNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("inspectNum", statisticsNum.value.inspectNum);
              }}
            >
              <div>
                巡检次数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.inspectNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("hiddenDangerNum", statisticsNum.value.hiddenDangerNum);
              }}
            >
              <div>
                整改次数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.hiddenDangerNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("faultNum", statisticsNum.value.faultNum);
              }}
            >
              <div>
                报修次数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.faultNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("inventoryNum", statisticsNum.value.inventoryNum);
              }}
            >
              <div>
                盘点次数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.inventoryNum ?? 0}</div>
            </div>
            <div class="num-item">
              <div>
                检测次数
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.detectionNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("patrolNum", statisticsNum.value.patrolNum);
              }}
            >
              <div>
                电子巡更
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.patrolNum ?? 0}</div>
            </div>
            <div
              class="num-item"
              onClick={() => {
                clickNum("secureEdu", statisticsNum.value.secureEduNum);
              }}
            >
              <div>
                安全教育
                <Icon name="arrow" />
              </div>
              <div>{statisticsNum.value.secureEduNum ?? 0}</div>
            </div>
          </>
        );
      }
      return (
        <>
          <div
            class="num-item"
            onClick={() => {
              clickNum("inspectNum", statisticsNum.value.inspectNum);
            }}
          >
            <div>
              巡检次数
              <Icon name="arrow" />
            </div>
            <div>{statisticsNum.value.inspectNum ?? 0}</div>
          </div>
          <div
            class="num-item"
            onClick={() => {
              clickNum("faultNum", statisticsNum.value.faultNum);
            }}
          >
            <div>
              报修次数
              <Icon name="arrow" />
            </div>
            <div>{statisticsNum.value.faultNum ?? 0}</div>
          </div>
        </>
      );
    };

    return (): VNode => (
      <div class="card">
        <div class="card-title" onClick={async () => clickCard()}>
          <img src={getAssetsImge("device.png")} alt="" width="40" height="40" />
          <div>
            <div class="title">
              <div>
                <span>{props.cardData?.name ?? props.cardData?.baseArchivesInfo.name ?? ""}</span>
                <Tag color={status.value.color}>{status.value.value ?? ""}</Tag>
              </div>
              <Icon name="arrow" />
            </div>
            <div class="card-content">
              {cardItem.value.map((item) => (
                <p key={item.value}>
                  <div>{item.label}</div>
                  <div>{item.value}</div>
                </p>
              ))}
            </div>
          </div>
        </div>
        <div class="tabs">
          <div class="static">数据统计</div>
          <Tabs v-model={activeName} onChange={changeTab}>
            {tabsList.value.map((item) => (
              <Tab key={item.name} name={item.name} title={item.title}>
                <div class="statistics-num">{statisticsListDom()}</div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    );
  },
});
