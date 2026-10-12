import { message } from "ant-design-vue";
import moment from "moment";
import { defineComponent, onMounted, reactive, type PropType } from "vue";

import AlarmData from "../alarm-chart-components/alarm-data";
import Modal from "@/features/equipment/modal-table/modal";
import { getAlarmRecordId, alarmEventOperates } from "@/infrastructure/api/alarm";
import { getVideoFilePaths } from "@/infrastructure/api/linkage";
import { loginSession } from "@/infrastructure/api/mdata";
import { cubeOuaaService } from "@/infrastructure/api/service";

import "./info.module.less";

const genderObj: Record<string, string> = {
  NONE: "保密",
  MALE: "男",
  FEMALE: "女",
};

const formatDateTime = (value?: string | number | Date | null): string => {
  if (!value) return "--";
  return new Date(value).toLocaleString().replaceAll("/", "-");
};

const mediaUrl = (item: any, session: string | null, serveIp: string): string => {
  const path = serveIp === "http:" ? item?.intranetFilePath : item?.extranetFilePath;
  if (!path) return "";
  return session ? `${path}?session=${session}` : path;
};

export const AlarmInfo = defineComponent({
  name: "AlarmInfo",
  props: {
    id: { type: [String, Number] as PropType<string | number | null>, default: null },
  },
  emits: ["toDeviceInfo"],
  setup(props, { emit }) {
    const serveIp = window.location.protocol;
    const state = reactive<{
      session: string | null;
      form: Record<string, any>;
      handelStatusDetail: Record<string, any>;
      userInfoModal: {
        visible: boolean;
        userInfo: Record<string, any>;
      };
      videoList: any[];
      imageList: any[];
    }>({
      session: (window as any).videoSession ?? null,
      form: {
        handlerFileVOS: [],
        alarmNotifyUsers: [],
      },
      handelStatusDetail: {},
      userInfoModal: {
        visible: false,
        userInfo: {
          gender: "",
          name: "",
          mobile: "",
          organizations: [{ name: "" }],
          positions: [{ name: "" }],
        },
      },
      videoList: [],
      imageList: [],
    });

    const getVideoFilePathshand = (businessKey: string): void => {
      void getVideoFilePaths(businessKey).then((res: any[]) => {
        state.imageList = (res || []).filter((item) => item.type === "PHOTOGRAPH");
        state.videoList = (res || []).filter((item) => item.type === "VIDEOTAPE");
      });
    };

    const getData = (): void => {
      if (!props.id) return;
      void getAlarmRecordId({ id: props.id }).then((res: any) => {
        state.form = {
          ...res,
          alarmTime: moment(res.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          alarmConfirmedTime: res.alarmConfirmedTime ? moment(res.alarmConfirmedTime).format("YYYY-MM-DD HH:mm:ss") : "--",
          alarmNotifyUsers: res.alarmNotifyUsers || [],
        };
        getVideoFilePathshand(res.businessKey);
      });
    };

    const handleClickUser = async (userId?: string): Promise<void> => {
      if (!userId) {
        message.error("人员ID异常");
        return;
      }
      const result = await cubeOuaaService.getPersonInfo(userId);
      state.userInfoModal.userInfo = result;
      state.userInfoModal.visible = true;
    };

    const getAlarmEventOperates = (): void => {
      if (!props.id) return;
      void alarmEventOperates({ id: props.id }).then((res: any[]) => {
        const result = (res || []).find((item) => item.alarmStatusEvent == "PROCESSED");
        if (result) {
          const fileVOS = result.operationParam?.fileVOS || [];
          const videoList = fileVOS.filter((item: any) => item.type == "mp4" || item.type == "AVI" || item.type == "MKV");
          const imageList = fileVOS.filter((item: any) => item.type !== "mp4" && item.type !== "AVI" && item.type !== "MKV");
          state.handelStatusDetail = { ...result, videoList, imageList };
        }
      });
    };

    const getSessionData = async (): Promise<void> => {
      const res = await loginSession();
      state.session = res ? res.session : null;
    };

    const toDevaceInfo = (): void => {
      emit("toDeviceInfo", state.form);
    };

    onMounted(() => {
      void getSessionData();
      getData();
      getAlarmEventOperates();
    });

    const renderSectionTitle = (text: string): JSX.Element => (
      <div class="info-item-title">
        <div class="title-icon"></div>
        <div class="title-text">{text}</div>
      </div>
    );

    return (): JSX.Element => {
      const form = state.form;
      const notifyUsers: any[] = form.alarmNotifyUsers || [];
      const showResultBlock =
        form.alarmStatus == "ALARM_HANDLER" || form.alarmStatus == "ALARM_SUSPEND" || form.alarmStatus === "ALARM_PROGRESS_CONFIRMED";

      return (
        <>
          <div class="alarmDetail-info">
            <div class="info-item">
              {renderSectionTitle("报警信息")}
              <div class="info-item-form">
                <div class="form-item">
                  <div class="form-item-label">报警时间:</div>
                  <div class="form-item-content">{form?.alarmTime ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">报警设备:</div>
                  <div class="form-item-content">
                    <a onClick={toDevaceInfo}>{form?.alarmTargetName ?? "--"}</a>
                  </div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">报警级别:</div>
                  <div class="form-item-content">{form?.alarmLevelName ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">设备事件:</div>
                  <div class="form-item-content">{form?.alarmEventName ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">报警区域:</div>
                  <div class="form-item-content">{form?.areaName ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">状态:</div>
                  <div class="form-item-content status-warning">{form?.alarmStatusName ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">处理人:</div>
                  <div class="form-item-content status-warning">{form?.alarmHandlerName == "" ? "--" : form?.alarmHandlerName || "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">报警通知人:</div>
                  <div class="form-item-content status-warning notify-users">
                    {notifyUsers.length
                      ? notifyUsers.map((item, index) => (
                          <a key={item.id || item.userId || index} onClick={() => void handleClickUser(item.userId)}>
                            {item.userName}
                            {index < notifyUsers.length - 1 ? <span>,</span> : null}
                          </a>
                        ))
                      : "--"}
                  </div>
                </div>
              </div>
            </div>

            <div class="info-item">
              {renderSectionTitle("报警快照")}
              <AlarmData alarmInfo={form} isSn={false} />
            </div>

            <div class="info-item">
              {renderSectionTitle("现场录像")}
              <div class="info-item-form">
                {state.videoList.map((item) => (
                  <div class="form-video" key={item.id}>
                    <video controls style={{ width: "100%", objectFit: "fill" }}>
                      <source src={mediaUrl(item, state.session, serveIp)} type="video/mp4" />
                    </video>
                  </div>
                ))}
                {state.videoList.length === 0 && <div class="empty-tip">无录像</div>}
              </div>
            </div>

            <div class="info-item">
              {renderSectionTitle("现场抓拍")}
              <div class="info-item-form">
                <a-image-preview-group>
                  {state.imageList.map((item) => (
                    <div class="form-video" key={item.id}>
                      <a-image src={mediaUrl(item, state.session, serveIp)} />
                    </div>
                  ))}
                </a-image-preview-group>
                {state.imageList.length === 0 && <div class="empty-tip">无抓拍</div>}
              </div>
            </div>

            {showResultBlock && (
              <div>
                {(form.handler || (form.followUps && form.followUps.length)) && (
                  <div class="info-item">
                    {renderSectionTitle("处理结果")}
                    {(form.followUps || []).map((item: any) => (
                      <div class="info-item-form" key={item.id}>
                        <div class="form-item">
                          <div class="form-item-label">跟进记录:</div>
                          <div class="form-item-content">
                            <a-tooltip title={item.content}>
                              <div class="ellipsis-four" style={{ width: "150px" }}>
                                {item.content}
                              </div>
                            </a-tooltip>
                          </div>
                        </div>
                        <div class="form-item" style={{ width: "60%" }}>
                          <div class="form-item-label" style={{ paddingRight: "8px" }}>
                            现场图片:
                          </div>
                          <div class="form-item-content">
                            {(item.files || []).map((file: any) => (
                              <div class="form-image" key={file.id}>
                                <a-image src={file.path} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.alarmStatus === "ALARM_HANDLER" && (
                      <div class="info-item-form">
                        <div class="form-item">
                          <div class="form-item-label">处理结果:</div>
                          <div class="form-item-content">{form?.handler?.alarmHandlerResultName ?? "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label">处理时间:</div>
                          <div class="form-item-content">{formatDateTime(form?.handler?.createTime)}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label">报警原因:</div>
                          <a-tooltip title={form?.handler?.recordHandlerReason?.alarmReason}>
                            <div class="form-item-content ellipsis">{form?.handler?.recordHandlerReason?.alarmReason || "--"}</div>
                          </a-tooltip>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label">现场图片:</div>
                          <div class="form-item-content">
                            {(form?.handler?.fileVOS || []).map((item: any) => (
                              <div class="form-image" key={item.id}>
                                <a-image src={item.path} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label">处理说明:</div>
                          <div class="form-item-content">{form?.handler?.alarmHandlerResultRemark ?? "--"}</div>
                        </div>
                        <div class="form-item">
                          <div class="form-item-label">处理人员:</div>
                          <div class="form-item-content">
                            <a-tooltip placement="topLeft" title={form?.handler?.createUserName}>
                              <a
                                onClick={() => void handleClickUser(form?.handler?.userId)}
                                style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", width: "200px" }}
                              >
                                {form?.handler?.createUserName}
                              </a>
                            </a-tooltip>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {form.alarmStatus == "ALARM_SUSPEND" && (
                  <div class="info-item">
                    {renderSectionTitle("报警挂起")}
                    <div class="info-item-form">
                      <div class="form-item">
                        <div class="form-item-label">预计处理时间:</div>
                        <div class="form-item-content">{formatDateTime(form?.suspend?.estimatedProcessTime)}</div>
                      </div>
                      <div class="form-item">
                        <div class="form-item-label">挂起原因:</div>
                        <div class="form-item-content">{form?.suspend?.remark || "--"}</div>
                      </div>
                      <div class="form-item">
                        <div class="form-item-label">处理时间:</div>
                        <div class="form-item-content">{formatDateTime(form?.suspend?.createTime)}</div>
                      </div>
                      <div class="form-item" style={{ width: "100%" }}>
                        <div class="form-item-label">现场图片:</div>
                        <div class="form-item-content">
                          {(form?.suspend?.fileVOS || []).map((item: any) => (
                            <div class="form-image" key={item.id}>
                              <a-image src={item.path} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div class="form-item">
                        <div class="form-item-label">操作挂起人员:</div>
                        <div class="form-item-content">
                          <a-tooltip placement="topLeft" title={form?.suspend?.createUserName}>
                            <a
                              onClick={() => void handleClickUser(form?.suspend?.userId)}
                              style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", width: "200px" }}
                            >
                              {form?.suspend?.createUserName}
                            </a>
                          </a-tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Modal
            show={state.userInfoModal.visible}
            title="用户信息"
            onClose={() => {
              state.userInfoModal.visible = false;
            }}
            width="600px"
            zIndex={3400}
            wrapClassName="modal-table-alarm user-modal"
          >
            <div class="user-info">
              <div class="info-item-form">
                <div class="form-item">
                  <div class="form-item-label">姓名:</div>
                  <div class="form-item-content">{state.userInfoModal.userInfo.name ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">电话号码:</div>
                  <div class="form-item-content">{state.userInfoModal.userInfo.mobile ?? "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">性别:</div>
                  <div class="form-item-content">
                    {genderObj[state.userInfoModal.userInfo.gender] ?? state.userInfoModal.userInfo.gender ?? "--"}
                  </div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">所属部门:</div>
                  <div class="form-item-content">{state.userInfoModal.userInfo.organizations?.[0]?.name || "--"}</div>
                </div>
                <div class="form-item">
                  <div class="form-item-label">职位:</div>
                  <div class="form-item-content">{state.userInfoModal.userInfo.positions?.[0]?.name || "--"}</div>
                </div>
              </div>
            </div>
          </Modal>
        </>
      );
    };
  },
});

export default AlarmInfo;
