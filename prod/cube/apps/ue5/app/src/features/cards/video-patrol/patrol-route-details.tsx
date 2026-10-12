import { message } from "ant-design-vue";
import moment from "moment";
import { defineComponent } from "vue";
import { ref, onMounted, computed } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { cameraPatrolLine, patrolStart, videoScreenshotHK } from "@/infrastructure/api/vmonitor";
import bus from "@/infrastructure/utils/bus";
import H5Video from "@/shared-ui/panel/H5Video";
import { storeMarket } from "@/visualization-core/stores/other";

import styles from "./patrol-route-details.module.less";

export const PatrolRouteDetails = defineComponent({
  name: "PatrolRouteDetails",
  setup(_props, ctx) {
    const piniaStoreMarket = storeMarket();
    const cameraPatrolDeviceVOS = ref([]);
    const ueClient = UeClient.getInstance();
    const currentData = ref({
      id: "",
      deviceId: "",
      thirdPartyId: "",
      deviceName: "",
      name: "",
      deviceCode: "",
    });
    const modalForm = ref({
      filePathList: [],
      remark: "",
    });
    const modalRef = ref(null);
    const rules = {
      remark: [{ required: true, message: "请输入说明" }],
    };
    const loading = ref(false);
    const visible = ref(false);
    const session = ref("");
    const patrolPostData = ref({
      cameraPatrolLineId: "",
      cameraPatrolLineName: "",
      patrolTime: "",
      completeTime: "",
      deviceModifyParams: [],
    });
    const getCameraPatrolLine = async () => {
      const res = await cameraPatrolLine(piniaStoreMarket.patrolRouterId);
      patrolPostData.value.patrolTime = moment().format("YYYY-MM-DD HH:mm:ss");
      patrolPostData.value.cameraPatrolLineId = res.id;
      patrolPostData.value.cameraPatrolLineName = res.name;

      cameraPatrolDeviceVOS.value = res.cameraPatrolDeviceVOS.map((e) => {
        return {
          ...e,
          steamMediaIntranetAddress: e.streamMedia?.steamMediaIntranetAddress,
          steamMediaIpAddress: e.streamMedia?.steamMediaIntranetAddress,
        };
      });
      if (res.cameraPatrolDeviceVOS.length > 0) {
        changePatrolVideo(cameraPatrolDeviceVOS.value[0]);
      }
    };

    const h5sSessionChange = (e) => {
      session.value = e;
    };

    const getPreviewUrl = computed(() => {
      return function (url: string) {
        if (url.indexOf("http") === -1) {
          url = location.origin + url;
        }
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        //@ts-ignore
        if (!params.session) {
          params.append("session", session.value);
        }
        return urlObj.toString();
      };
    });
    const changePatrolVideo = (record) => {
      if (currentData.value.deviceId === record.deviceId) {
        return false;
      }
      currentData.value = record;
      currentData.value.name = record.deviceName;
      try {
        ueClient.send("focusActor", {
          id: currentData.value.deviceCode,
          animation: true,
        });
      } catch (error) {
        //
      }
      if (patrolPostData.value.deviceModifyParams.findIndex((item) => item.deviceId == record.deviceId) == -1) {
        const deviceData = {
          deviceId: record.deviceId,
          deviceCode: record.deviceCode,
          deviceName: record.deviceName,
          area: record.area,
          areaNames: record.areaNames,
          sort: patrolPostData.value.deviceModifyParams.length + 1,
          patrolTime: getNowTime(),
          result: "CAMERA_PATROL_NORMAL", //巡逻结果 CAMERA_PATROL_ABNORMAL 异常  CAMERA_PATROL_NORMAL 正常 CAMERA_PATROL_UNKNOWN 未知(未巡)
          status: "CAMERA_PATROL_COMPLETE", //未巡 CAMERA_PATROL_UNKNOWN CAMERA_PATROL_COMPLETE 已巡
          deviceRemarksModifyParams: [],
        };
        patrolPostData.value.deviceModifyParams.push(deviceData);
      }
    };
    const getNowTime = () => {
      return moment().format("YYYY-MM-DD HH:mm:ss");
    };
    const getVideoScreenshot = async () => {
      let data = await videoScreenshotHK(currentData.value.deviceId);
      if (data) {
        modalForm.value.filePathList.push(data);
      }
    };
    const submitExplain = () => {
      modalRef.value.validate().then(async () => {
        const index = patrolPostData.value.deviceModifyParams.findIndex((item) => item.deviceId === currentData.value.deviceId);
        if (index >= 0) {
          const params = {
            sort: patrolPostData.value.deviceModifyParams[index].deviceRemarksModifyParams.length + 1,
            remark: modalForm.value.remark,
            filePathList: JSON.stringify(
              modalForm.value.filePathList.map((e) => {
                return {
                  extranetFilePath: e.previewUrl,
                  intranetFilePath: e.previewUrl,
                };
              }),
            ),
          };
          patrolPostData.value.deviceModifyParams[index].deviceRemarksModifyParams.push(params);
          patrolPostData.value.deviceModifyParams[index].result = "CAMERA_PATROL_ABNORMAL";
        }
        cancel();
      });
    };
    const cancel = () => {
      modalRef.value.resetFields();
      modalForm.value = {
        remark: "",
        filePathList: [],
      };
      visible.value = false;
    };
    const abnormalScreenshot = () => {
      loading.value = true;
      getVideoScreenshot();
      let runCount = 0;

      let timerId = setInterval(async () => {
        runCount++;
        await getVideoScreenshot();
        if (runCount == 2) {
          clearInterval(timerId);
          setTimeout(() => {
            loading.value = false;
            visible.value = true;
          }, 3000);
        }
      }, 5000);
    };
    const submitPatrol = async () => {
      let newArray = cameraPatrolDeviceVOS.value.filter(
        (item1) => !patrolPostData.value.deviceModifyParams.some((item2) => item2.deviceId === item1.deviceId),
      );
      const noPatrolDevice = newArray.map((item, index) => {
        return {
          deviceId: item.deviceId,
          deviceCode: item.deviceCode,
          deviceName: item.deviceName,
          area: item.area,
          areaNames: item.areaNames,
          sort: patrolPostData.value.deviceModifyParams.length + index + 1,
          patrolTime: "",
          result: "CAMERA_PATROL_UNKNOWN",
          status: "CAMERA_PATROL_UNKNOWN",
          deviceRemarksModifyParams: [],
        };
      });
      patrolPostData.value.completeTime = getNowTime();
      patrolPostData.value.deviceModifyParams = [...patrolPostData.value.deviceModifyParams, ...noPatrolDevice];
      let areaFlag = true;
      patrolPostData.value.deviceModifyParams.forEach((e) => {
        if (!e.area) {
          areaFlag = false;
        }
      });
      if (areaFlag) {
        const data = await patrolStart(patrolPostData.value);
        if (data) {
          message.success("提交成功");
          exitPatrol();
        }
      } else {
        message.error("设备区域不能为空");
      }
    };
    const exitPatrol = () => {
      bus.emit("exitPatrol");
    };
    onMounted(async () => {
      getCameraPatrolLine();
      // let res = await loginSession();
      // session.value = res.session;
    });

    return (): JSX.Element => (
      <>
        <div class="patrol-router-details-box" title>
          <a-button type="primary" onClick={exitPatrol}>
            {" "}
            退出巡逻
          </a-button>
          <a-button class="endPatrol" type="primary" onClick={submitPatrol}>
            {" "}
            结束巡逻
          </a-button>
          <div class="patrol-router-details-timeline">
            <a-timeline>
              {cameraPatrolDeviceVOS.map((item) => (
                <a-timeline-item key={item.id} color={currentData?.id === item.id ? "green" : "gray"} onClick={changePatrolVideo(item)}>
                  {" "}
                  <div class="patrol-router-details-text"> {item.deviceName}</div>
                </a-timeline-item>
              ))}
            </a-timeline>
          </div>
        </div>
        <Teleport to="body">
          <div class="real-time-monitoring">
            <div class="real-time-monitoring-title"> 实时监控</div>
            <div class="real-time-monitoring-video">
              {" "}
              <H5Video cameraItem={currentData.value} control h5sProtocol={"https:"} onH5sSessionChange={h5sSessionChange}></H5Video>
            </div>
            <div class="real-time-monitoring-operate">
              {" "}
              <a-button loading={loading.value} onClick={abnormalScreenshot}>
                {" "}
                异常截图
              </a-button>
            </div>
          </div>
        </Teleport>
        {visible && (
          <a-modal
            visible={visible.value}
            onUpdate:visible={(v) => {
              visible.value = v;
            }}
            maskClosable={false}
            title="异常上报"
            onOk={submitExplain}
            onCancel={cancel}
          >
            <a-form model={modalForm.value} ref="modalRef" rules={rules}>
              <a-form-item label="巡逻点">
                {" "}
                <a-input
                  value={currentData.deviceName}
                  onUpdate:value={(v) => {
                    currentData.deviceName = v;
                  }}
                  disabled={true}
                ></a-input>
              </a-form-item>
              <a-form-item label="情况说明" name="remark">
                {" "}
                <a-textarea
                  maxlength={300}
                  value={modalForm.remark}
                  onUpdate:value={(v) => {
                    modalForm.remark = v;
                  }}
                  rows={4}
                ></a-textarea>
              </a-form-item>
              <a-form-item label="抓拍照片">
                <a-space size={16}>
                  {modalForm.filePathList.map((item, index) => (
                    <a-image key={index} width={100} src={getPreviewUrl(item.previewUrl)}></a-image>
                  ))}
                </a-space>
              </a-form-item>
            </a-form>
          </a-modal>
        )}
      </>
    );
  },
});

export default PatrolRouteDetails;
