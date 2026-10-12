import { LocationIcon } from "../../../../../components/location-icon";
import styles from "./index.module.less";
import { cubeOuaaService } from "@/api/server";
import type { AlarmDetails } from "@ghcloud/cube-alarm-center-service";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import dayjs from "dayjs";
import { Cell, CellGroup, Popup, showNotify } from "vant";
import { defineComponent, onMounted, onUnmounted, reactive, type PropType } from "vue";
import "vant/es/notify/style";
enum Gender {
  MALE = "男",
  FEMALE = "女",
  NONE = "未知",
}
export const DetailsTopCard = defineComponent({
  props: {
    details: {
      type: Object as PropType<AlarmDetails>,
      default: () => {},
    },
  },
  setup: (props) => {
    const state = reactive<{
      showPopover: boolean;
      userPopup: {
        show: boolean;
        info: UserInfo;
      };
    }>({
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
    const handleAddClick = (): void => {
      if (state.showPopover) {
        state.showPopover = false;
      }
    };
    onMounted(() => {
      document.addEventListener("click", handleAddClick);
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleAddClick);
    });
    const env = getEnvironment();
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
    return (): JSX.Element => (
      <div class={styles["top-card"]}>
        <div class={styles["card-header"]}>
          <div class={styles["card-title"]}>{props.details.alarmEventName}</div>
          <div class={styles["status-level"]}>
            <div class={[styles.status, styles[props.details.alarmStatus]]}>{props.details.alarmStatusName}</div>
            <div class={[styles.level, styles[props.details.alarmLevelCode]]}>{props.details.alarmLevelName}</div>
          </div>
        </div>
        <div class={styles["card-content"]}>
          <div class={styles["content-item"]}>
            <span class={styles["item-label"]}>报警时间：</span>
            <span class={styles["item-value"]}>
              {props.details.alarmTime ? dayjs(props.details.alarmTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
            </span>
          </div>
          <div class={styles["content-item"]}>
            <span class={styles["item-label"]}>报警区域：</span>
            <span class={styles["item-value"]}>{props.details.areaName || "--"}</span>
          </div>
          <div class={styles["content-item"]}>
            <span class={styles["item-label"]}>详细位置：</span>
            <span class={styles["item-value"]}>
              <div
                class={styles["item-value-address"]}
                onClick={(e: Event) => {
                  e.stopPropagation();
                  state.showPopover = !state.showPopover;
                }}
              >
                {props.details.alarmTargetAddress || "--"}
                {state.showPopover && <div class={styles["item-value-popover"]}>{props.details.alarmTargetAddress || "--"}</div>}
              </div>

              {env === "cubeApp" && props.details.alarmTargetLongitude && (
                <LocationIcon
                  location={{
                    address: props.details.alarmTargetAddress,
                    lngAndlat: props.details.alarmTargetLongitude,
                  }}
                />
              )}
            </span>
          </div>
          <div class={styles["content-item"]}>
            <span class={styles["item-label"]}>处理人：</span>
            {props.details.alarmHandlerName && (
              <span
                style={{ color: "var(--van-primary-color)" }}
                class={styles["item-value"]}
                onClick={async () => handleClickUser(props.details.alarmHandlerBy)}
              >
                {props.details.alarmHandlerName}
              </span>
            )}
            {!props.details.alarmHandlerName && <span class={styles["item-value"]}>--</span>}
          </div>
        </div>
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
