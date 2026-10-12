import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import areaOpions from "./area.json";
import DevicePanelTemplat from "./devicePanelTemplat";
import { associatedVideos } from "@/infrastructure/api/device";
import { getDeviceInfo, runningAttr } from "@/infrastructure/api/equipment";
import { loginSession } from "@/infrastructure/api/mdata";
import { MachinePanelInformation, PorkArrangeStatus } from "@/infrastructure/api/models/slide";
import { arrangeLastInfo } from "@/infrastructure/api/slide";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import H5Video from "@/shared-ui/panel/H5Video";
import NoData from "@/shared-ui/panel/noData";

import styles from "./tallying-modal.module.less";

export const TallyingModal = defineComponent({
  name: "TallyingModal",
  props: {
    id: { type: String, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const ReportingData = ref(0);
    const TallyingData = ref(0);
    const addressData = ref([]);
    const activeKey = ref("basic");
    const deviceData = reactive<any>({});
    const sessionData = ref("");
    const address = ref("");
    const deviceStatus = ref("");
    const inspectData = ref({
      normalTask: 0,
      abnormalTask: 0,
    });
    let deviceStatusType = {
      ALARM: "报警",
      TROUBLE: "故障",
      OFFLINE: "离线",
      NORMAL: "正常",
    };
    const cameraList = ref([]);
    const tallyMachineData = reactive<MachinePanelInformation>({
      porkArrange: {
        slices: 0,
        porkReportSlices: 0,
        weight: 0,
        porkReportWeight: 0,
      },
      porkArrangeAuditStatus: "",
      porkArrangeDetail: {
        picPaths: "",
        supplierId: "",
        label: "",
        weight: 0,
        porkArrangeTime: "",
        footMarkCode: "",
        goodsCategoryId: "",
        goodsCategoryName: "",
        id: "",
        picFilePaths: [],
        porkReportCode: "",
      },
      porkArrangeStatus: "",
      porkReport: {
        pratiqueCode: "",
        abattoirCode: "",
        abattoirId: "",
        abattoirName: "",
        arrivedTime: "",
        code: "",
        files: [],
        goodsCategoryName: "",
        id: "",
        pratiqueCodes: [],
        reportSlices: 0,
        reportTime: "",
        reportWeight: 0,
        vehiclePlate: "",
      },
      porkReportStatAudit: {
        porkReportAuditFailedNum: 0,
        porkReportAuditPassedNum: 0,
        total: 0,
      },
      porkStatArrangeAudit: {
        porkArrangeAuditFailedNum: 0,
        porkArrangeAuditPassedNum: 0,
        total: 0,
      },
      supplierInfo: {
        address: "",
        area: "",
        code: "",
        fileVO: "",
        id: "",
        liaison: "",
        name: "",
        phone: "",
      },
    });
    const closeDevicePanel = () => {
      emit("close");
    };
    const getAreaName = (value, arr) => {
      arr.forEach((item) => {
        if (value.indexOf(item.value) > -1) {
          addressData.value.push(item.label);
        }
        if (item.children && item.children.length > 0) {
          getAreaName(value, item.children);
        }
      });
      return addressData.value;
    };
    // 获取理货机面板数据
    const getTallyMachineInfo = async () => {
      let res = await arrangeLastInfo(props.id);
      if (res) {
        Object.assign(tallyMachineData, res);
      }
      let state = await runningAttr(props.id);

      state.deviceAttributesOfRunning.forEach((item) => {
        if (item.attributeCode === "faultState") {
          Number(item.translatedValue) === 0 ? (deviceStatus.value = "正常") : (deviceStatus.value = "故障");
        }
      });
      //设备数据
      let data = await getDeviceInfo(props.id);

      Object.assign(deviceData, data.detail);
      //监控视频
      associatedVideos(props.id).then((res) => {
        cameraList.value = res;
      });
      // 获取Session
      let session = await loginSession();
      sessionData.value = session.session;
      addressData.value = [];
      address.value = getAreaName(tallyMachineData.supplierInfo.area, areaOpions).join("/");
      ReportingData.value =
        Number(
          ((tallyMachineData.porkReportStatAudit.porkReportAuditPassedNum / tallyMachineData.porkReportStatAudit.total) * 100).toFixed(2),
        ) || 0;
      TallyingData.value =
        Number(
          ((tallyMachineData.porkStatArrangeAudit.porkArrangeAuditPassedNum / tallyMachineData.porkStatArrangeAudit.total) * 100).toFixed(
            2,
          ),
        ) || 0;
    };
    onMounted(() => {
      getTallyMachineInfo();
    });

    return (): JSX.Element => (
      <>
        <device-panel-templat color={"#fff"} onCloseDevicePanel={closeDevicePanel} class="modal-table-device" title={deviceData.name}>
          <a-tabs
            activeKey={activeKey}
            onUpdate:activeKey={(v) => {
              activeKey.value = v;
            }}
          >
            <a-tab-pane key="basic" tab="理货机信息">
              <div class="model-top">
                <div class="model-personnel">
                  <div class="personnel-headSculpture">
                    {" "}
                    <img
                      src={
                        tallyMachineData.supplierInfo.fileVO ? tallyMachineData.supplierInfo.fileVO : getAssetsImage("head-sculpture.png")
                      }
                      alt
                    ></img>
                  </div>
                  <div class="personnel-info">
                    <div class="personnel-name"> {tallyMachineData.supplierInfo.name}</div>
                    <div class="personnel-infoRow">
                      <span class="personnel-label"> 联系人：</span>
                      <span class="personnel-label"> {tallyMachineData.supplierInfo.liaison || "--"}</span>
                    </div>
                    <div class="personnel-infoRow">
                      <span class="personnel-label"> 所在区域：</span>
                      <span class="personnel-label"> {address || "--"}</span>
                    </div>
                  </div>
                </div>
                <div class="quantityTally">
                  <div class="quantityTally-title"> 该批次理货总片数</div>
                  <div class="quantityTally-total">
                    <span style="color:#FFAB10 ;"> {tallyMachineData.porkArrange.slices}</span>
                    <span>/{tallyMachineData.porkArrange.slices}</span>
                    <span style="font-size: 12px;"> 片</span>
                  </div>
                </div>
                <div class="TallyingWeight">
                  <div class="quantityTally-title"> 该批次理货总重量</div>
                  <count-to startVal={0} endVal={Number(tallyMachineData.porkArrange.weight)} decimals={2}></count-to>
                  <span class="unit"> kg</span>
                </div>
                <div class="tallyingStatus">
                  <img src={getAssetsImage(tallyMachineData.porkArrangeStatus + ".png")} alt></img>
                  <div class={tallyMachineData.porkArrangeStatus}> {PorkArrangeStatus[tallyMachineData.porkArrangeStatus]}</div>
                </div>
              </div>
              <div class="middle-foot">
                <div class="cargo—info">
                  <p> 重量：</p>
                  <p style={{ color: "#2989ff" }}>
                    {tallyMachineData.porkArrangeDetail.weight}
                    kg
                  </p>
                </div>
                <div class="cargo—info">
                  <p> 电子标签：</p>
                  <p> {tallyMachineData.porkArrangeDetail.label || "--"}</p>
                </div>
                <div class="cargo—info">
                  <p> 理货编码：</p>
                  <p> {tallyMachineData.porkArrangeDetail.footMarkCode || "--"}</p>
                </div>
                <div class="cargo—info">
                  <p> 时 间：</p>
                  <p>
                    {tallyMachineData.porkArrangeDetail.porkArrangeTime
                      ? moment(tallyMachineData.porkArrangeDetail.porkArrangeTime).format("YYYY-MM-DD HH:mm:ss") || "--"
                      : "--"}
                  </p>
                </div>
              </div>
              <div>
                <p class="data-title"> 报备数据</p>
                <div class="flex-box report">
                  <div class="odd-bg" style="text-align: center;">
                    <div style="margin-top: 10px;"> 报备单号</div>
                    <div class="odd-numbers" title={tallyMachineData.porkReport.code}>
                      {" "}
                      {tallyMachineData.porkReport.code}
                    </div>
                  </div>
                  <div>
                    <p>
                      <span class="item-title"> 来货车辆：</span>
                      <span class="item">{tallyMachineData.porkReport.vehiclePlate || "--"}</span>
                    </p>
                    <p>
                      <span class="item-title"> 报备重量：</span>
                      <span class="item">
                        {tallyMachineData.porkReport.reportWeight}
                        kg
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span class="item-title"> 报备片数：</span>
                      <span class="item">{tallyMachineData.porkReport.reportSlices || "--"}片</span>
                    </p>
                    <p>
                      <span class="item-title"> 屠 宰 场：</span>
                      <span class="item">{tallyMachineData.porkReport.abattoirName || "--"}</span>
                    </p>
                  </div>
                  <div>
                    <p class="status-title"> 报备情况</p>
                    <div class="flex-box">
                      <a-progress type="circle" size={[20, 20]} percent={ReportingData} format={(percent) => `${percent}%`} />
                      <div class="status">
                        <p> 报备总数</p>
                        <p>{tallyMachineData.porkReportStatAudit.total}次</p>
                      </div>
                      <div class="status">
                        <p> 审核不通过</p>
                        <p>
                          <span style={{ color: "#E93434" }}> {tallyMachineData.porkReportStatAudit.porkReportAuditFailedNum}</span>次
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p class="status-title"> 理货情况</p>
                    <div class="flex-box">
                      <a-progress type="circle" percent={TallyingData} format={(percent) => `${percent}%`} />
                      <div class="status">
                        <p> 理货次数</p>
                        <p>{tallyMachineData.porkStatArrangeAudit.total}次</p>
                      </div>
                      <div class="status">
                        <p> 审核不通过</p>
                        <p>
                          <span style={{ color: "#FFAB10" }}> {tallyMachineData.porkStatArrangeAudit.porkArrangeAuditFailedNum}</span>次
                        </p>
                      </div>
                    </div>
                  </div>
                  <div></div>
                  <div></div>
                </div>
                <p style="margin:5px 0">
                  <span class="item-title"> 检疫证号：</span>
                  <span class="item">{tallyMachineData.porkReport.pratiqueCode || "--"}</span>
                </p>
                <p>
                  <span class="item-title"> 检疫证明：</span>
                  <span class="prove">
                    {tallyMachineData.porkReport.files.map((item) => (
                      <a-image src={item.path} />
                    ))}
                  </span>
                </p>
              </div>
              <div>
                <p class="data-title"> 设备数据</p>
                <div>
                  <span class="item-title"> 通信状态：</span>
                  <span style={{ color: "#2989FF" }}> {deviceData.communicationStatus}</span>
                  <span style="margin-left: 10px;" class="item-title">
                    {" "}
                    故障状态：
                  </span>
                  <span style={{ color: "#2989FF" }}> {deviceStatus}</span>
                </div>
                <div class="flex-box device">
                  <div>
                    <span class="item-title"> 设备编码：</span>
                    <span> {deviceData.code}</span>
                  </div>
                  <div>
                    <span class="item-title"> 品牌型号：</span>
                    <span> {deviceData.modelName}</span>
                  </div>
                  <div>
                    <span class="item-title"> 运维部门：</span>
                    <span> {deviceData.departmentName}</span>
                  </div>
                  <div>
                    <span class="item-title"> 所在区域：</span>
                    <span> {deviceData.areaName}</span>
                  </div>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="video" tab="视频信息" force-render>
              <div class="middle">
                <div class="model-middle">
                  {cameraList.length > 0 && (
                    <template>
                      {cameraList.map((item, index) => (
                        <div class="middle-video" key={index}>
                          {" "}
                          <H5Video cameraItem={item} idStr={item.token + index}></H5Video>
                        </div>
                      ))}
                    </template>
                  )}
                  <NoData />
                  <div class="middle-right">
                    {tallyMachineData.porkArrangeDetail.picPaths.split(",").map((item) => (
                      <div class="middle-img">
                        {" "}
                        <a-image width={170} src={item + "?session=" + sessionData} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </device-panel-templat>
      </>
    );
  },
});

export default TallyingModal;
