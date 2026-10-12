import moment from "moment";
import { computed, defineComponent, onMounted, ref, provide } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords } from "@/infrastructure/api/alarm";
import { cubeFileService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { getAssetsImage, getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./blacklist-alarm-list.module.less";

const titleIcon = getThemeImage("alarm-record.png");

type AlarmItem = {
  alarmTime?: string;
  pictures?: string;
  businessSnapshot?: {
    name?: string;
    sex?: string;
    phone?: string;
    pictures?: string;
  };
  [key: string]: unknown;
};

export const BlacklistAlarmList = defineComponent({
  name: "BlacklistAlarmList",
  setup() {
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_YEAR", dateRange: [] });
    const listData = ref<AlarmItem[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasData = computed(() => listData.value.length > 0);

    const getAlarmLevel = async (): Promise<void> => {
      try {
        const params = {
          applicationCode: "VISITOR_MANAGEMENT",
          period: timeFrame.value.dateRange?.join(",") ?? "",
          pageSize: 50,
          pageNumber: 1,
        };
        const res: { records?: AlarmItem[] } = await alarmrecords(params);
        const mapped = (res?.records ?? []).map((item) => {
          let businessSnapshot = item.businessSnapshot as AlarmItem["businessSnapshot"] | string | undefined;
          if (typeof businessSnapshot === "string") {
            try {
              businessSnapshot = JSON.parse(businessSnapshot);
            } catch {
              businessSnapshot = undefined;
            }
          }
          return {
            ...item,
            alarmTime: item.alarmTime ? moment(item.alarmTime as string).format("YYYY-MM-DD") : "--",
            businessSnapshot,
          };
        });

        for (const row of mapped) {
          const pictureId = row.businessSnapshot?.pictures?.split(",")?.[0];
          if (pictureId) {
            try {
              const file = await cubeFileService.getFileInfo(pictureId);
              row.pictures = file?.path;
            } catch {
              // keep fallback image
            }
          }
        }
        listData.value = mapped;
      } catch {
        listData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openAlarmModal = (item: AlarmItem): void => {
      if (window.config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...item, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", item);
      }
    };

    onMounted(() => {
      void getAlarmLevel();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["visor-blacklist-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {!loaded.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : !hasData.value ? (
          <div class={["empty-panel", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        ) : (
          <div class={["alarm-list", isZoom ? "is-zoom" : ""]}>
            {listData.value.map((item, index) => (
              <div
                class="alarm-item"
                key={`${String(item.alarmTime)}-${index}`}
                onClick={() => {
                  openAlarmModal(item);
                }}
              >
                <div class="alarm-item-left">
                  <img src={item.pictures ?? getAssetsImage("overView45.png")} alt="" class="alarm-avatar" />
                </div>
                <div class="alarm-item-right">
                  <div class="alarm-item-name">
                    <span class="name">{item.businessSnapshot?.name || "--"}</span>
                    <span class="time">{item.alarmTime}</span>
                  </div>
                  <div class="alarm-item-row">性别：{item.businessSnapshot?.sex || "--"}</div>
                  <div class="alarm-item-row">联系方式：{item.businessSnapshot?.phone || "--"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root visor-blacklist-v2-root">
        <SubPanelTemplate
          title="黑名单预警"
          class="visual-v2-sub-panel v2-panel-card visor-blacklist-v2-panel"
          zoomable
          zoom-title="黑名单预警详情"
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = {
                      timeType: v?.timeType || "THIS_YEAR",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={getAlarmLevel}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default BlacklistAlarmList;
