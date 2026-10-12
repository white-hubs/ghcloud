import { DosageChart } from "./components/dosage-chart/dosage-chart";
import styles from "./device-detail.module.less";
import EnumerateAttribute from "./enumerate-attribute";
import SetStringAttribute from "./set-string-attribute";
import SetValueAttribute from "./set-value-attribute";
import SwitchAttribute from "./switch-attribute";
import { authStore } from "@/api/auth-store";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService, cubeZhongdaHeshunService } from "@/api/server";
import { DeviceControlCard } from "@/components/device-control-card/device-control-card";
import { storeKill } from "@/store/kill";
import { getAssetsFile } from "@/utils";
import { getAuthHeaders, getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { GHIotSocket } from "@ghcloud/cube-iot-socket";
import { Field, Icon, showConfirmDialog, showNotify, PullRefresh } from "vant";
import { computed, defineComponent, onMounted, onUnmounted, provide, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";
interface DeviceAttrItem {
  dataWrite: number;
  dataType: string;
  propCode: string;
  propName: string;
  propValue: string;
  unitName: string;
  newCode: string;
  dataConstraint: [];
}
/**
 * 设备详情页面组件
 */
interface DeviceInfo {
  modelName: string;
  code: string;
  name: string;
  productCategory: {
    name: string;
    code?: string;
  };
  brandName: string;
  deviceState: number;
  iotDeviceNumberCode: string;
  areaName: string;

  fileVO: {
    path: string;
  };
}

type DeviceType = Record<
  string | any,
  {
    tags: {
      tagCode: string;
    }[];
  }
>;
export const DeviceDetail = defineComponent({
  name: "DeviceDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = storeKill();
    const isAdmin = ref(store.isAdmin);
    provide("isAdmin", isAdmin.value);
    const name = ref("");
    const edit = ref(false);
    const id = route.params.id as string;
    const state = reactive<{ loading: boolean }>({
      loading: false,
    });
    const baseArchivesInfo = reactive({
      area: {
        pathName: "",
      },
      name: "",
      code: "",
      status: {
        onlineState: null,
      },
    });
    const deviceInfo = reactive<Record<string, any>>({});
    const dataList = computed(() =>
      propsCodeList.value
        .map((item: any) => ({
          ...item,
          propValue: attributeValue.value[item.propCode],
        }))
        .filter((item) => item.propCode !== "pressure" && item.dataWrite === 0),
    );
    const newReadAndWritData = computed(() => propsCodeList.value.filter((item: any) => item.dataWrite !== 0));
    const iotSocket = ref();
    const subscribeRealTimeData = ref();
    const attributeValue = ref<Record<string, string | number>>({});
    const initIotWebSocket = async (): Promise<void> => {
      if (getEnvironment() === "cubeApp") {
        const { Authorization: authorization, tenant, terminal } = getAuthHeaders();
        const token = authorization.slice(7);
        iotSocket.value = new GHIotSocket({
          accessToken: token.replace("Bearer ", ""),
          tenant,
          terminal,
        });
      } else {
        const info = { ...authStore, terminal: "bimops-manage-web", accessToken: authStore.token };
        iotSocket.value = new GHIotSocket(info);
      }
      iotSocket.value.onmessage(messageMsg);
    };

    const messageMsg = (message: { msgType: string; content: string }): unknown => {
      switch (message.msgType) {
        case "WELCOME":
          break;
        case "SUBSCRIBE_PUSH":
          subscribeRealTimeData.value = JSON.parse(message.content).msg;

          if (subscribeRealTimeData.value.deviceId === id) {
            subscribeRealTimeData.value.updates.forEach((item: { key: string | number; value: string }) => {
              if (attributeValue.value.hasOwnProperty(item.key)) {
                attributeValue.value[item.key] = item.value;
              }
            });
          }
          break;
        default:
          return false;
      }
    };
    const dataType = ref("");
    const tagCode = [
      "builtin.usage::ups",
      "builtin.usage::battery",
      "builtin.usage::temp",
      "builtin.usage::fire",
      "builtin.usage::combustible.gas.monitor",
      "builtin.usage::electrical.monitor",
      "builtin.usage::liquid.level.sensors",
    ];
    const editBasicInfo = async (): Promise<void> => {
      try {
        const params = {
          deviceId: id,
          name: name.value,
          deviceNumber: baseArchivesInfo?.code,
        };
        const data = await cubeDeviceCenterInternalService.updateDevice(params);
        getBasicData();
      } catch {}
    };
    const getBasicData = async (): Promise<void> => {
      try {
        state.loading = true;
        const data = (await cubeDeviceCenterInternalService.getDeviceInfo(id)) as any;
        Object.assign(deviceInfo, data);
        Object.assign(baseArchivesInfo, data.baseArchivesInfo);
        name.value = data?.baseArchivesInfo?.name || "";
        const res = (await cubeDeviceCenterService.getDeviceTagCode([id])) as unknown as DeviceType;
        tagCode.forEach((element) => {
          res[id].tags.forEach((item: { tagCode: string }) => {
            if (element === item.tagCode) {
              dataType.value = item.tagCode;
            }
          });
        });
      } catch (error) {
      } finally {
        state.loading = false;
      }
    };

    // Status Grid Data - Computed for cleaner template
    const statusItems = computed(() => [
      { label: "在线状态", value: requestData.value?.onlineState ? "在线" : "离线", icon: "cluster-o" },
      { label: "电池电量", value: "--", icon: "gold-coin-o" },
      { label: "信号强度", value: "--", icon: "bar-chart-o" },
    ]);

    const deviceData = ref<{ attributeCode: string; value: string }[]>([]);
    const readData = ref([]);
    const readAndWritData = ref([]);
    const propsCodeList = ref([]);
    const requestData = ref();
    const hydraulicsData = ref();
    const refreshing = ref(false);

    const getattributeValue = async (): Promise<void> => {
      const data = await iotSocket.value.deviceDetail({
        deviceId: id,
        withSnapShot: true,
        withPropertySpec: true,
      });
      if (data) {
        propsCodeList.value = data.deviceInfo.productPropVoList;
        requestData.value = data.deviceInfo;
        deviceData.value = data.dataArr;
        subscribeRealTimeData.value = data.dataArr;
        const excludeCode = ["hydraulic", "natural_gas_concentration"];
        readData.value = data.dataArr.filter(
          (item: { permission: string; attributeCode: string }) => item.permission === "READ" && !excludeCode.includes(item.attributeCode),
        );
        // 读写数据
        readAndWritData.value = data.dataArr.filter((item: { permission: string }) => item.permission === "READ_WRITE");
        // // 将设备所有属性用对象包装起来，方便订阅过来的数据填充值
        attributeValue.value = Object.fromEntries(
          deviceData.value.map((item: { attributeCode: string; value: string }) => [item.attributeCode, item.value]),
        );
        hydraulicsData.value = deviceData.value.filter((item) => item.attributeCode === "hydraulics");
      }
    };

    const onRefresh = async () => {
      try {
        await getBasicData();
        await getattributeValue();
      } finally {
        refreshing.value = false;
      }
    };

    const unbindDevice = async (): Promise<void> => {
      showConfirmDialog({
        title: "提示",
        message: `确定解绑【${deviceInfo?.baseArchivesInfo?.name}】吗？`,
      })
        .then(async () => {
          try {
            try {
              state.loading = true;
              const param = {
                productId: requestData.value.productId,
                deviceIds: [id],
                deviceCode: requestData.value.deviceNumber,
                groupId: store.groupActive,
              };
              await cubeZhongdaHeshunService.updateDeviceUnbindBatch(param);
              showNotify({ type: "success", message: "解绑成功" });
              setTimeout(() => {
                router.back();
              }, 500);
            } catch (error) {
            } finally {
              state.loading = false;
            }
          } catch {}
        })
        .catch(function(){});
    };
    onMounted(async () => {
      await store.updateGroupInfo();
      isAdmin.value = store.isAdmin;
      await getBasicData();
      await initIotWebSocket();
      await getattributeValue();
    });
    onUnmounted(() => {
      iotSocket.value?.unsubscribe();
      iotSocket.value?.dispose();
    });
    const operateDom = (item: DeviceAttrItem): VNode | null => {
      let dom: VNode | null = null;
      switch (item.dataType.toLowerCase()) {
        case "enum":
          dom = (
            <div style={{ marginLeft: "10px", marginBottom: "10px" }}>
              <div class={styles["monitor-item"]}>
                <label>{item.propName}</label>
              </div>
              <EnumerateAttribute curValue={attributeValue.value[item.propCode] as string} attributeItem={item} deviceId={id} />
            </div>
          );
          break;
        case "boolean":
          dom = (
            <div style={{ marginLeft: "10px", marginTop: "10px" }}>
              <div class={styles["monitor-item"]}>
                <label>{item.propName}</label>
              </div>
              <SwitchAttribute attributeItem={item} curValue={Number(attributeValue.value[item.propCode])} deviceId={id} />
            </div>
          );
          break;
        case "string":
          dom = <SetStringAttribute curValue={attributeValue.value[item.propCode] as string} attributeItem={item} deviceId={id} />;
          break;
        default:
          dom = <SetValueAttribute curValue={attributeValue.value[item.propCode] as string} attributeItem={item} deviceId={id} />;
          break;
      }
      return dom;
    };
    const showLabel = (item: any) => {
      if (item.dataType === "boolean" || item.dataType === "enum") {
        if (item.propValue === "") {
          return "--";
        }
        const labelList = item.dataConstraint?.find((i: any) => i.value == item.propValue);
        const label = labelList ? labelList.label : "";
        return `${label || "--"}`;
      }
      return `${item.propValue || "--"}${item.unitName}`;
    };
    return () => (
      <div class={styles.container}>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles["device-detail-pull-refresh"]}>
          {/* 顶部导航栏 */}
          {/* <NavBar
          title="设备详情"
          left-arrow
          // onClickLeft={handleBack}
          class={styles.navbar}
        /> */}

          <div class={styles.deviceCard}>
            <div class={styles.deviceHeader}>
              <div class={styles.deviceInfo}>
                <div class={styles.deviceIcon}>
                  <img src={getAssetsFile("device-default.png")} alt="设备图标" />
                </div>
                <div class={styles.deviceName}>
                  {!edit.value ? (
                    <div>
                      {decodeURIComponent(deviceInfo?.baseArchivesInfo?.name || "")}{" "}
                      <img
                        onClick={() => {
                          edit.value = true;
                        }}
                        src={getAssetsFile("edit.png")}
                        alt=""
                      />
                    </div>
                  ) : (
                    <Field
                      label=""
                      v-model={name.value}
                      placeholder="输入设备名称"
                      size="small"
                      onBlur={() => {
                        edit.value = false;
                        if (deviceInfo.baseArchivesInfo) {
                          deviceInfo.baseArchivesInfo.name = name.value;
                        }
                        editBasicInfo();
                      }}
                      class={styles.nameInput}
                    />
                  )}
                  <div class={styles.deviceCode}>{deviceInfo?.productInfo?.name}</div>
                </div>
              </div>
              {isAdmin.value && (
                <div class={styles.unbindBtn} onClick={async () => unbindDevice()}>
                  解绑
                </div>
              )}
            </div>

            <div class={styles.statusGrid}>
              <div class={styles.statusItem}>
                <div class={styles.statusIcon}>
                  <img src={getAssetsFile("status.png")} alt="" />
                </div>
                <div class={styles.statusValueItem}>
                  <div class={styles.statusLabel}>运行状态</div>
                  <div class={styles.statusValue} style={{ color: requestData.value?.onlineState ? "#4CAF50" : "#999" }}>
                    {requestData.value?.onlineState ? "在线" : "离线"}
                  </div>
                </div>
              </div>
              {dataList.value.map((item) => {
                if (item.propName === "在线状态") {
                  return null;
                }
                if (item.propCode === "mosquito_dosage_ml" || ["药量", "驱蚊剩余药量", "驱蚊药量", "剩余药量"].includes(item.propName)) {
                  return null;
                }
                return (
                  <div class={styles.statusItem} key={item.propCode}>
                    <div class={styles.statusIcon}>
                      {item.propCode === "mosquito_status" ? (
                        <img src={getAssetsFile("mosquitoes.png")} alt="" />
                      ) : (
                        <img src={getAssetsFile("irrigation.png")} alt="" />
                      )}
                    </div>
                    <div class={styles.statusValueItem}>
                      <div class={styles.statusLabel}>{item.propName}</div>
                      <div class={styles.statusValue}>{showLabel(item)} </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            {dataList.value.map((item) => {
              if (item.propCode === "mosquito_dosage_ml" || ["药量", "驱蚊剩余药量", "驱蚊药量", "剩余药量"].includes(item.propName)) {
                const min = item.dataConstraint?.[0] ?? 0;
                let max = item.dataConstraint?.[1] ?? 100;
                return (
                  <div key={item.propCode} class={styles.dosageChart}>
                    <div class={styles.dosageChart_title}>剩余药水量</div>
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                      <DosageChart
                        current={Number(item.propValue || 0)}
                        min={Number(min)}
                        max={Number(max)}
                        unit={item.unitName}
                        name={item.propName}
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
          {newReadAndWritData.value.length && requestData.value?.onlineState ? (
            <div class={styles.deviceCard}>
              {newReadAndWritData.value?.map((item: any) => (
                <div key={item.propCode}>{operateDom(item)}</div>
              ))}
            </div>
          ) : (
            ""
          )}
          {/*
        <div class={styles.section}>
          <div class={styles.sectionTitle}>消杀模式</div>
          <div class={styles.modeSelector}>
            <div
              class={`${styles.modeItem} ${state.activeMode === '药液' ? styles.modeActive : ''}`}
              onClick={() => switchMode('药液')}
            >
              药液
            </div>
            <div
              class={`${styles.modeItem} ${state.activeMode === '喷雾' ? styles.modeActive : ''}`}
              onClick={() => switchMode('喷雾')}
            >
              喷雾
            </div>
          </div>
        </div> */}

          {/* <div class={styles.section}>
          <Cell title="时长" value="请选择" is-link />
          <Cell title="药液浓度" value="请选择" is-link />
        </div>

        <div class={styles.powerBtnContainer}>
          <div class={styles.powerBtn} onClick={toggleDevice}>
            <Icon name="play-circle-o" size="40" color="#1578FF" />
          </div>
        </div> */}

          {/* 底部标签栏 */}
          {/* <BottomTabBar active="device" /> */}
          {requestData.value ? (
            <DeviceControlCard
              deviceId={id}
              deviceName={decodeURIComponent(deviceInfo?.baseArchivesInfo?.name)}
              readonly={!requestData.value?.onlineState}
            />
          ) : (
            ""
          )}
        </PullRefresh>
      </div>
    );
  },
});

export default DeviceDetail;
