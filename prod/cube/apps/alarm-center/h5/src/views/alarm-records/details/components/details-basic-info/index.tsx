import { cubeDeviceCenterService, cubeFileService, cubeOuaaService } from "../../../../../api/server";
import { showImagePreview } from "../../../../../hook/use-image-preview";
import type { SnapshotVo } from "../../details";
import { AlarmValue } from "../alarm-value";
import { Card } from "../custom-card";
import styles from "./index.module.less";
import type { AlarmDetails } from "@ghcloud/cube-alarm-center-service";
import type { FileVOState } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import dayjs from "dayjs";
import "vant/es/notify/style";
import { Image, Field, Popup, CellGroup, Cell, showNotify } from "vant";
import { defineComponent, onMounted, onUnmounted, reactive, type PropType } from "vue";

const formatSeconds = (value: number): string => {
  let secondTime: number | string = value;
  let minuteTime: number | string = 0;
  let hourTime: number | string = 0;
  if (secondTime > 60) {
    minuteTime = (secondTime / 60).toFixed(1).slice(0, -2);
    secondTime = (secondTime % 60).toFixed(1).slice(0, -2);
    if (Number(minuteTime) > 60) {
      hourTime = (Number(minuteTime) / 60).toFixed(1).slice(0, -2);
      minuteTime = (Number(minuteTime) % 60).toFixed(1).slice(0, -2);
    }
  }
  if (Number(secondTime) === 0) {
    secondTime = "00";
  } else if (Number(secondTime) < 10) {
    secondTime = `0${secondTime}`;
  }
  if (Number(minuteTime) === 0) {
    minuteTime = "00";
  } else if (Number(minuteTime) < 10) {
    minuteTime = `0${minuteTime}`;
  }
  if (Number(hourTime) === 0) {
    hourTime = "00";
  } else if (Number(hourTime) < 10) {
    hourTime = `0${hourTime}`;
  }
  const result = `${hourTime === "00" ? "" : hourTime + "小时"}${minuteTime === "00" ? "" : minuteTime + "分钟"}${secondTime}秒`;
  return result;
};
enum Gender {
  MALE = "男",
  FEMALE = "女",
  NONE = "未知",
}
export const DetailsBasicInfo = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {},
    },
    snapshotData: {
      type: Array as PropType<SnapshotVo[]>,
      default: () => [],
    },
  },
  emits: ["thirdPartyId"],
  setup: (props, { emit }) => {
    const state = reactive<{
      installFile: string;
      showPopover: boolean;
      userPopup: {
        show: boolean;
        info: UserInfo;
      };
    }>({
      installFile: "",
      showPopover: false,
      userPopup: {
        show: false,
        info: {
          id: "",
          code: "",
          name: "",
          mobile: "",
          gender: "MALE",
          workStatus: "",
          remark: "",
          enabled: false,
          entryDate: null,
          photographKey: null,
          organizations: [],
          managedOrganizations: [],
          organization: null,
          positions: [],
          createTime: 0,
          lastLoginTime: 0,
          fileVO: {
            id: "",
            name: "",
            path: "",
          },
          tenants: [],
          roles: [],
          fileId: null,
        },
      },
    });
    const handleAddClick = async (): Promise<void> => {
      if (state.showPopover) {
        state.showPopover = false;
      }
    };
    const handlePreview = (files: FileVOState[], index: number): void => {
      const filesPath = files.map((file) => file.path).filter((path) => path) as unknown as string[];
      showImagePreview(filesPath, index);
    };
    onMounted(() => {
      document.addEventListener("click", handleAddClick);
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleAddClick);
    });
    const getDeviceDetails = async (): Promise<void> => {
      try {
        const result = await cubeDeviceCenterService.getDeviceDetails(props.details.alarmTargetKey);
        emit("thirdPartyId", result.baseArchivesInfo.thirdPartyId ?? "");
        const fileId = result.baseArchivesInfo.picture ? result.baseArchivesInfo.picture : result.productInfo.picture;
        if (fileId) {
          const fileInfo = await cubeFileService.getFileInfo(fileId);
          state.installFile = fileInfo.path as unknown as string;
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const handleClickUser = async (userId: string): Promise<void> => {
      if (!userId) {
        showNotify({
          type: "warning",
          message: "用户ID异常",
        });
        return;
      }
      const result = await cubeOuaaService.getPersonInfo(userId);
      state.userPopup.info = result;
      state.userPopup.show = true;
    };
    onMounted(() => {
      getDeviceDetails();
    });

    const toNativeDeviceDetails = (): void => {
      cubeAppService.openBusinessDetailsPage({
        applicationCode: "EQUIPMENT_SUPERVISION",
        businessKey: props.details.alarmTargetKey,
        businessType: "",
      });
    };

    return (): JSX.Element => (
      <div class={styles.basicInfo}>
        {/* <Card title='位置信息'>
          <div class={styles.cellContainer}>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警区域</div>
              <div class={styles.cellValue}>{props.details.areaName || '--'}</div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>详细位置</div>
              <div
                class={styles.cellValue} onClick={(e: Event) => {
                  e.stopPropagation()
                  state.showPopover = !state.showPopover
                }}
              >
                {props.details.alarmTargetAddress || '--'}
                {state.showPopover &&
                  <div class={styles['item-value-popover']}>
                    {props.details.alarmTargetAddress || '--'}
                  </div>}
              </div>
            </div>
            <div class={styles.customImageCell}>
              <div class={styles.cellLabel}>安装位置</div>
              <div class={styles.cellValue}>
                <Image
                  onClick={() => {
                    handlePreview([{
                      path: state.installFile,
                      id: ''
                    }], 0)
                  }} src={state.installFile} style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden' }}
                />
              </div>
            </div>
          </div>
        </Card> */}
        <Card title="报警信息">
          <div class={styles.cellContainer}>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警时间</div>
              <div class={styles.cellValue}>
                {props.details.alarmTime ? dayjs(props.details.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
              </div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警设备</div>
              <div class={styles.cellValue} onClick={toNativeDeviceDetails}>
                <span style={{ color: "var(--van-primary-color)" }}>{props.details.alarmTargetName || "--"}</span>
              </div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警级别</div>
              <div class={styles.cellValue}>{props.details.alarmLevelName || "--"}</div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警事件</div>
              <div class={styles.cellValue}>{props.details.alarmEventName || "--"}</div>
            </div>
            {props.snapshotData.length > 0 &&
              props.snapshotData.map((item) => (
                <AlarmValue key={item.propCode} label={item.propName} value={item.propValue} unit={item.unit} />
              ))}
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>处理时限</div>
              <div class={styles.cellValue}>{props.details.processingTime || "--"}</div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>超时状态</div>
              <div class={styles.cellValue}>{props.details.alarmHandlerTimeoutStatusName || "--"}</div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>处理状态</div>
              <div class={styles.cellValue}>{props.details.alarmStatusName || "--"}</div>
            </div>
            <div class={styles.customCell}>
              <div class={styles.cellLabel}>报警通知人</div>
              <div class={styles.cellValue}>
                {props.details?.alarmNotifyUsers?.map((item, index) => (
                  <span key={item.id}>
                    <span
                      onClick={() => {
                        handleClickUser(item.userId);
                      }}
                      style={{ color: "var(--van-primary-color)" }}
                    >
                      {item.userName}
                    </span>
                    {props.details.alarmNotifyUsers.length - 1 !== index && <span>, </span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
        {(props.details.handler || (props.details.followUps && !!props.details.followUps.length)) && (
          <Card title="报警处理">
            {props.details.followUps && !!props.details.followUps.length && (
              <>
                {props.details.followUps.map((item) => (
                  <div class={styles.cellContainer} key={item.id}>
                    <div class={styles.customCell}>
                      <div class={styles.cellLabel}>处理跟进记录</div>
                      <div class={styles.cellValue}>{item.content || "--"}</div>
                    </div>
                    {!!item.files.length && (
                      <div
                        class={styles.customImageCell}
                        style={{
                          borderBottom: "1px solid #f8f9f9",
                          paddingBottom: "4px",
                        }}
                      >
                        <div class={styles.cellLabel}>现场图片</div>
                        <div class={styles.cellValue} style={{ display: "flex", flexWrap: "wrap" }}>
                          {item.files.map((fileItem, index) => (
                            <Image
                              onClick={() => {
                                handlePreview(item.files, index);
                              }}
                              key={fileItem.id}
                              src={fileItem.path}
                              style={{ width: "60px", height: "60px", marginRight: "10px", borderRadius: "6px", overflow: "hidden" }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {props.details.alarmStatus === "ALARM_HANDLER" && props.details.handler && (
              <div class={styles.cellContainer}>
                <div class={styles.customCell}>
                  <div class={styles.cellLabel}>处理结果</div>
                  <div class={styles.cellValue}>{props.details.handler.alarmHandlerResultName}</div>
                </div>
                <div class={styles.customCell}>
                  <div class={styles.cellLabel}>报警原因</div>
                  <div class={styles.cellValue}>{props.details.handler.recordHandlerReason?.alarmReason ?? "--"}</div>
                </div>
                <div class={styles.customCell}>
                  <div class={styles.cellLabel}>处理时间</div>
                  <div class={styles.cellValue}>
                    {props.details.handler.createTime ? dayjs(props.details.handler.createTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
                  </div>
                </div>
                <div class={styles.customCell}>
                  <div class={styles.cellLabel}>处理人员</div>
                  <div
                    class={styles.cellValue}
                    style={{ color: "var(--van-primary-color)" }}
                    onClick={async () => handleClickUser(props.details?.handler?.userId as unknown as string)}
                  >
                    {props.details.handler.createUserName}
                  </div>
                </div>
                <div class={styles.customCell}>
                  <div class={styles.cellLabel}>任务耗时</div>
                  <div class={styles.cellValue}>{formatSeconds(props.details.processingTime)}</div>
                </div>
                {!!props.details.handler.fileVOS.length && (
                  <div class={styles.customImageCell}>
                    <div class={styles.cellLabel}>现场图片</div>
                    <div class={styles.cellValue} style={{ display: "flex", flexWrap: "wrap" }}>
                      {props.details.handler.fileVOS.map((item, index) => (
                        <Image
                          onClick={() => {
                            handlePreview(props.details.handler?.fileVOS as unknown as FileVOState[], index);
                          }}
                          key={item.id}
                          src={item.path}
                          style={{ width: "60px", height: "60px", marginRight: "10px", borderRadius: "6px", overflow: "hidden" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div class={styles.customImageCell}>
                  <div class={styles.cellLabel}>处理说明</div>
                  <div class={styles.cellValue}>
                    <Field
                      v-model={props.details.handler.alarmHandlerResultRemark}
                      rows="2"
                      autosize
                      readonly
                      type="textarea"
                      placeholder="请输入留言"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
        {props.details.suspend && (
          <Card title="报警挂起">
            <div class={styles.cellContainer}>
              <div class={styles.customCell}>
                <div class={styles.cellLabel}>挂起人员</div>
                <div
                  class={styles.cellValue}
                  style={{ color: "var(--van-primary-color)" }}
                  onClick={async () => handleClickUser(props.details?.suspend?.userId as unknown as string)}
                >
                  {props.details.suspend.createUserName || "--"}
                </div>
              </div>
              <div class={styles.customCell}>
                <div class={styles.cellLabel}>挂起时间</div>
                <div class={styles.cellValue}>
                  {props.details.suspend.createTime ? dayjs(props.details.suspend.createTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </div>
              </div>
              <div class={styles.customCell}>
                <div class={styles.cellLabel}>预计处理时间</div>
                <div class={styles.cellValue}>
                  {props.details.suspend.estimatedProcessTime
                    ? dayjs(props.details.suspend.estimatedProcessTime).format("YYYY-MM-DD HH:mm:ss")
                    : "--"}
                </div>
              </div>
              {!!props.details.suspend.fileVOS.length && (
                <div class={styles.customImageCell}>
                  <div class={styles.cellLabel}>现场图片</div>
                  <div class={styles.cellValue} style={{ display: "flex", flexWrap: "wrap" }}>
                    {props.details.suspend.fileVOS.map((item, index) => (
                      <Image
                        onClick={() => {
                          handlePreview(props.details.suspend?.fileVOS as unknown as FileVOState[], index);
                        }}
                        key={item.id}
                        src={item.path}
                        style={{ width: "60px", marginRight: "10px", height: "60px", borderRadius: "6px", overflow: "hidden" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div class={styles.customImageCell}>
                <div class={styles.cellLabel}>挂起原因</div>
                <div class={styles.cellValue}>
                  <Field v-model={props.details.suspend.remark} rows="2" autosize readonly type="textarea" placeholder="请输入留言" />
                </div>
              </div>
            </div>
          </Card>
        )}
        <Popup v-model:show={state.userPopup.show} teleport="body" round>
          <div style={{ width: "300px" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "center",
                padding: "10px 0",
              }}
            >
              {state.userPopup.info.name}
            </div>
            <CellGroup inset>
              <Cell title="电话号码" value={state.userPopup.info.mobile} />
              <Cell title="性别" value={Gender[state.userPopup.info.gender]} />
              <Cell title="所属部门" value={state.userPopup.info.organizations[0] ? state.userPopup.info.organizations[0].name : "--"} />
              <Cell title="职位" value={state.userPopup.info.positions[0] ? state.userPopup.info.positions[0].name : "--"} />
            </CellGroup>
          </div>
        </Popup>
      </div>
    );
  },
});
