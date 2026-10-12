import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { StatusColor, StatusType, StatusObjectType } from "../my-inspection/type";
import styles from "./detail.module.less";
import { cubeDailyInspectionService } from "@/api/server";
import { Bar } from "@/components/bar/bar";
import { timeFormat } from "@/utils";
import { CubeAppBusinessBridge, cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { TaskDetailType } from "@ghcloud/cube-daily-inspection-service";
import qs from "qs";
import { Divider, Loading, Button, Popup, Picker, showDialog, showNotify } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";
interface FollowingObj {
  location: string;
  inspectionId: string;
  result: string;
  staff: string;
  state: string;
  targetCategory: string;
  targetId: string;
  targetName: string;
  time: number;
  latAndLon: string;
  targetCode: string;
  targetAddress: string;
  areaName?: string;
}

export const InspectionDetail = defineComponent({
  setup() {
    useMetaTitle();
    const loading = ref(false);
    const followingList = ref<FollowingObj[]>([]);
    const detail = ref<TaskDetailType>();
    const router = useRouter();
    const route = useRoute();
    const limitTime = ref("");
    const showPicker = ref(false);
    const currentObj = ref();
    const mapOptions = [
      { text: "高德地图", value: "gdMap" },
      { text: "百度地图", value: "bdMap" },
    ];
    const typeMap = new Map([
      ["DEVICE", "设备"],
      ["STALL", "档位"],
      ["PROPERTY", "资产"],
      ["SITE_POINT", "现场点"],
      ["RISK_SOURCE", "风险源"],
      ["SMALL_ENGINEERING", "小散工程"],
    ]);
    // 巡检记录
    const handleInspectionRecord = (id: string): void => {
      router.push({ path: "/inspection-record", query: { id } });
    };
    // 隐患排查
    const entityObject = ref();
    const handleHiddenDanger = (item: {
      inspectionId: string;
      result: string;
      staff: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number;
    }): void => {
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(item));
      sessionStorage.setItem("inspection-object-data", JSON.stringify({ ...item, taskName: "隐患单", businessType: "HIDDENDANGER" }));
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=HIDDENDANGER&processId=${item.targetId}`;
    };
    // 故障报修
    const handleFault = (item: {
      inspectionId: string;
      result: string;
      staff: string;
      state: string;
      targetCategory: string;
      targetId: string;
      targetName: string;
      time: number;
    }): void => {
      entityObject.value = {
        entityId: item.targetId,
        entityName: item.targetName,
        entityType: item.targetCategory,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(item));
      sessionStorage.setItem("inspection-object-data", JSON.stringify({ ...item, taskName: "故障单", businessType: "FAULT" }));
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=FAULT&processId=${item.targetId}`;
    };
    const normal = ref();
    const getTaskDetail = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await cubeDailyInspectionService.TaskDetail({ id: route.query.id as string });
        detail.value = data;
        followingList.value = data.inspectionObjs.sort((a, b) => {
          if (a.targetCategory === "RISK_SOURCE") {
            return 1;
          }
          if (b.targetCategory === "RISK_SOURCE") {
            return -1;
          }
          return 0;
        });
        normal.value = followingList.value.filter((x) => x.result).length;
        limitTime.value = `${JSON.parse(detail.value.limitTimeJson).day}天${JSON.parse(detail.value.limitTimeJson).hour}时${JSON.parse(detail.value.limitTimeJson).minute}分`;
      } catch (err) {
        const { errorMessage } = err as { errorMessage: string };
        showNotify({ type: "danger", message: errorMessage ?? "请求错误" });
      } finally {
        loading.value = false;
      }
    };
    onMounted(async () => {
      getTaskDetail();
      const item =
        (sessionStorage.getItem("inspection-object-data") && JSON.parse(sessionStorage.getItem("inspection-object-data") ?? "")) ?? null;
      const flowTaskId = sessionStorage.getItem("flowTaskId");
      try {
        flowTaskId &&
          item &&
          (await cubeDailyInspectionService.InspectRecordToBusiness(item.inspectionId as string, {
            targetCategory: item.targetCategory,
            targetId: item.targetId,
            targetName: item.targetName,
            businessCategory: item.businessType,
            businessId: flowTaskId,
            businessName: `巡检${detail.value?.name ?? ""}发起了${item.targetName}的${item.taskName}`,
          }));
      } catch {}
      sessionStorage.removeItem("flowTaskId");
    });

    // 移交
    const handleTransfer = async (e: Event): Promise<void> => {
      e.stopPropagation();
      router.push({ path: "/choice-staff", query: { action: "transfer", id: detail.value?.id } });
    };
    // 添加协同人
    const handleAddPartner = async (e: Event): Promise<void> => {
      e.stopPropagation();
      router.push({ path: "/choice-staff", query: { action: "add-partner", id: detail.value?.id } });
    };
    const handleInspection = async (item: FollowingObj): Promise<void> => {
      if (getEnvironment() === "cubeApp" && detail.value?.method === "SCAN_CODE") {
        try {
          // 扫码
          const code = await CubeAppBusinessBridge.handleBusinessScanCode();
          const scanCode = code.includes("https") ? (qs.parse(code)?.code?.toString() ?? code.toString()) : code.toString();
          const data = await cubeDailyInspectionService.getEntityByCode(encodeURIComponent(scanCode.toString()));
          if (item.targetId.toString() === data.entityId?.toString()) {
            router.push({ path: "/inspection-execute", query: { taskId: detail.value?.id, targetId: data?.entityId } });
          } else {
            showNotify({ type: "danger", message: "该巡检对象不匹配" });
          }
          return;
        } catch {
          showNotify({ type: "danger", message: "请求失败" });
          return;
        }
      }
      router.push({ path: "/inspection-execute", query: { taskId: detail.value?.id, targetId: item.targetId } });
    };
    const openPicker = (item: FollowingObj): void => {
      if (getEnvironment() === "cubeApp") {
        const latAndLon = item.latAndLon.split(",");
        cubeAppService.openTripartiteMap({
          type: "route",
          latitude: Number(latAndLon[1]),
          longitude: Number(latAndLon[0]),
          address: item.location,
        });
        return;
      }
      const isWeixinBrowser = /micromessenger/i.test(navigator.userAgent);
      if (isWeixinBrowser) {
        showDialog({ message: "请使用浏览器或在应用中打开" });
      } else {
        showPicker.value = true;
        currentObj.value = item;
      }
    };
    // 获取地图路径
    const getMapScheme = (mapType = "gdMap"): string => {
      const u = navigator.userAgent;
      const isAndroid = u.includes("Android") || u.includes("Adr"); // android终端
      const latAndLon = currentObj.value.latAndLon.split(",");
      const androidBaidu = (): string =>
        `bdapp://map/direction?destination=name:${currentObj.value.location}|latlng:${currentObj.value.latAndLon}&coord_type=gcj02&mode=driving&src=andr.jianghu.jianhao`;
      const iosBaidu = (): string =>
        `baidumap://map/direction?destination=name:${currentObj.value.location}|latlng:${currentObj.value.latAndLon}&coord_type=gcj02&mode=driving&src=ios.jianghu.jianhao`;
      const androidGaode = (): string =>
        `amapuri://route/plan/?sourceApplication=mhc&dlat=${latAndLon[0]}&dlon=${latAndLon[1]}&dname=${currentObj.value.location}&dev=0&t=0`;
      const iosGaode = (): string =>
        `iosamap://path?sourceApplication=mhc&dlat=${latAndLon[0]}&dlon=${latAndLon[1]}&dname=${currentObj.value.location}&dev=0&t=0`;
      if (mapType === "bdMap") {
        if (isAndroid) {
          return androidBaidu();
        }
        return iosBaidu();
      }
      if (isAndroid) {
        return androidGaode();
      }
      return iosGaode();
    };
    const changeMap = async (map: string[]): Promise<void> => {
      const url = getMapScheme(map[0]);
      window.location.href = url;
    };

    // 接收
    const handleResolve = async (): Promise<void> => {
      try {
        await cubeDailyInspectionService.AcceptTask({ id: detail.value?.id ?? "" });
        getTaskDetail();
      } catch (err) {
        const { errorMessage } = (err as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    // 处理
    const toHandle = (id: string): void => {
      router.push({ path: "/inspection-record", query: { id, handle: "handle" } });
    };
    const cancel = (id: string): void => {
      router.push({ path: "/inspection-cancel", query: { id, batch: "inspection" } });
    };
    const detailDom = (): VNode => (
      <div class={styles["cell-group"]}>
        <div class={styles.title}>
          <span>巡检对象跟踪</span>
          <div>
            <span style={{ color: "#2879ff" }}>{normal.value}</span>/<span>{detail.value?.targetNum}</span>
          </div>
        </div>
        <Divider />
        {followingList.value.map((item) => (
          <div class={styles.following} key={item.targetId}>
            <div
              class={styles.round}
              style={{ backgroundColor: `${item.result === "NORMAL" ? "#07c160" : item.result === "" ? "#c1c1c1" : "#e0120e"}` }}
            />
            <div class={styles.card}>
              <div class={styles.title}>
                <span>{item.targetName}</span>
                {/* <span v-show={item.state === 'EXECUTING'} style={{ color: '#ffaa65', fontWeight: '400' }}>待巡检</span> */}
                <span style={{ color: StatusColor.get(item.state), fontWeight: "400" }}>{StatusObjectType.get(item.state)}</span>
              </div>
              <div class={styles.content}>
                <span>
                  {typeMap.get(item.targetCategory)}：{item?.targetCode || "--"}
                </span>
                <span>{timeFormat(item.time, true) ?? "--"}</span>
              </div>
              <div class={styles.content}>
                <div>
                  <span style={{ color: "black" }}>巡检人：</span>
                  <span>{item.staff || "--"}</span>
                </div>
                <div>
                  <span style={{ color: "black" }}>巡检结果：</span>
                  <span style={{ color: item.result === "NORMAL" ? "#07c160" : item.result === "ABNORMAL" ? "rgb(224, 18, 14)" : "gray" }}>
                    {item.result === "NORMAL" ? "正常" : item.result === "" ? "--" : "异常"}
                  </span>
                </div>
              </div>
              <div class={styles.location}>
                <span>具体地址：</span>
                <span>{item.targetAddress}</span>
              </div>
              <div class={styles.location}>
                <span>所在区域：</span>
                <span>{item.areaName ?? "--"}</span>
              </div>
              <div />
              <Divider />
              <div class={styles["item-footer"]}>
                {item.state === "EXECUTING" ? (
                  <>
                    <div
                      onClick={() => {
                        handleInspection(item);
                      }}
                    >
                      巡检
                    </div>
                    <div
                      onClick={() => {
                        cancel(item.inspectionId);
                      }}
                    >
                      取消巡检
                    </div>
                    <div
                      v-show={item.latAndLon !== ""}
                      onClick={() => {
                        openPicker(item);
                      }}
                    >
                      定位导航
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => {
                        handleInspectionRecord(item.inspectionId);
                      }}
                    >
                      巡检记录
                    </div>
                    <div
                      onClick={() => {
                        handleHiddenDanger(item);
                      }}
                    >
                      隐患排查
                    </div>{" "}
                    <div
                      onClick={() => {
                        handleFault(item);
                      }}
                    >
                      故障报修
                    </div>
                    {item.state === "WAIT_REPAIR" && (
                      <div
                        onClick={() => {
                          toHandle(item.inspectionId);
                        }}
                      >
                        线下处理
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
    const ItemDom = (): VNode => (
      <div class={styles.body}>
        <div class={styles["cell-group"]}>
          <div class={styles.title}>基本信息</div>
          <Divider />
          <div class={styles.content}>
            <div>
              <span>任务编号：</span>
              <span style={{ color: "black" }}>{detail.value?.id}</span>
            </div>
            <div>
              <span>任务名称：</span>
              <span style={{ color: "black" }}>{detail.value?.name}</span>
            </div>
            <div>
              <span>责任人员：</span>
              <span style={{ color: "black" }}>{detail.value?.receiveNames}</span>
            </div>
            <div>
              <span>发布时间：</span>
              <span style={{ color: "black" }}>{timeFormat(detail.value?.createTime ?? "", true)}</span>
            </div>
            <div>
              <span>任务时限：</span>
              <span style={{ color: "black" }}>{limitTime.value}</span>
            </div>
            <div>
              <span>任务状态：</span>
              <span style={{ color: "black" }}>{StatusType.get(detail.value?.status ?? "")}</span>
            </div>
            <div>
              <span>巡检对象数：</span>
              <span style={{ color: "black" }}>{detail.value?.targetNum}</span>
            </div>
            <div>
              <span>协同人：</span>
              <span style={{ color: "black" }}>{detail.value?.assistNames ?? "--"}</span>
            </div>
          </div>
        </div>
        {detail.value?.status !== "ACCEPT" ? detailDom() : null}
      </div>
    );
    return (): VNode => (
      <div class={styles.wrapper}>
        <Bar />
        {loading.value ? (
          <Loading size="24px" vertical>
            加载中...
          </Loading>
        ) : (
          ItemDom()
        )}
        <div
          class={styles.footer}
          v-show={
            (detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds) || detail.value?.status === "ACCEPT"
          }
        >
          <Button
            type="primary"
            size="small"
            v-show={detail.value?.status === "ACCEPT"}
            onClick={() => {
              handleResolve();
            }}
          >
            接收
          </Button>
          <Button
            v-show={detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds}
            plain
            type="primary"
            size="small"
            onClick={(e: Event) => {
              handleTransfer(e);
            }}
          >
            移交
          </Button>
          <Button
            v-show={detail.value?.status === "EXECUTING" && route.query.userId === detail.value?.receiveIds}
            type="primary"
            size="small"
            onClick={(e: Event) => {
              handleAddPartner(e);
            }}
          >
            添加协同
          </Button>
        </div>
        <Popup v-model:show={showPicker.value} round position="bottom">
          <Picker
            columns={mapOptions}
            onConfirm={({ selectedValues }: { selectedValues: string[] }) => {
              changeMap(selectedValues);
              showPicker.value = false;
            }}
            onCancel={() => {
              showPicker.value = false;
            }}
          />
        </Popup>
      </div>
    );
  },
});
