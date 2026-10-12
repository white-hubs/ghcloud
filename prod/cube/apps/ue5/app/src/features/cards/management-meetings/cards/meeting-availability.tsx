import moment from "moment";
import { computed, defineComponent, onMounted, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { availabilityHours } from "@/infrastructure/api/conference";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./management-meetings-v2-shared.module.less";

type MeetingHeatmapPoint = [number, number, number];
type MeetingAvailabilityStatus = 0 | 1 | 2;

const availabilityStatusMeta: Record<MeetingAvailabilityStatus, { label: string; className: string }> = {
  0: { label: "可预定", className: "is-reservable" },
  1: { label: "不可预定", className: "is-unavailable" },
  2: { label: "已预定", className: "is-reserved" },
};

export const MeetingAvailability = defineComponent({
  name: "MeetingAvailability",
  props: {
    title: { type: String, required: false, default: "会议空闲情况" },
  },
  setup(props) {
    const xData = ref<string[]>([]);
    const yData = ref<string[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasRealAvailabilityData = ref(false);
    const meetingData = ref<
      {
        name: string;
        type: string;
        data: MeetingHeatmapPoint[];
        label: { show: boolean };
        emphasis: { itemStyle: { shadowBlur: number; shadowColor: string } };
      }[]
    >([
      {
        name: "会议室情况",
        type: "heatmap",
        data: [],
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ]);

    /** 对齐旧版：固定未来 8 小时（每小时两个半点） */
    const getTime = (): void => {
      yData.value = [];
      for (let i = 0; i < 8; i++) {
        yData.value.push(moment().add(i, "hour").format("HH:00"));
        yData.value.push(moment().add(i, "hour").format("HH:30"));
      }
    };

    const getAvailabilityHours = async (): Promise<void> => {
      try {
        // 对齐旧版：无额外查询参数
        const res = await availabilityHours();
        getTime();
        xData.value = [];
        meetingData.value[0].data = [];
        const source: Record<string, any[]> = res && typeof res === "object" ? res : {};
        const meetingRoom: Record<string, number> = {
          RESERVABLE: 0,
          UNAVAILABLE: 1,
          RESERVED: 2,
        };
        hasRealAvailabilityData.value = false;
        let index = 0;
        for (const key in source) {
          const rows = Array.isArray(source[key]) ? source[key] : [];
          xData.value.push(key);
          hasRealAvailabilityData.value = true;
          const normalizedRows = rows.map((item) => ({
            ...item,
            periodTime: String(item?.periodTime || "").split("-")[0],
          }));
          for (let i = 0; i < yData.value.length; i++) {
            const periodTime = yData.value[i];
            const found = normalizedRows.find((item) => item.periodTime === periodTime);
            if (!found) {
              normalizedRows.push({
                conferenceId: null,
                name: key,
                periodTime,
                bookRoomEnum: "UNAVAILABLE",
                num: 0,
                usageRate: null,
                unusedRate: null,
              });
            }
          }
          normalizedRows.sort((itemA, itemB) => yData.value.indexOf(itemA.periodTime) - yData.value.indexOf(itemB.periodTime));
          normalizedRows.forEach((item) => {
            meetingData.value[0].data.push([
              index,
              yData.value.indexOf(item.periodTime),
              meetingRoom[item.bookRoomEnum] ?? meetingRoom.UNAVAILABLE,
            ]);
          });
          index++;
        }
      } catch {
        xData.value = [];
        yData.value = [];
        meetingData.value[0].data = [];
        hasRealAvailabilityData.value = false;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getAvailabilityHours();
    });

    const hasData = computed(
      () => loaded.value && hasRealAvailabilityData.value && xData.value.length > 0 && meetingData.value[0].data.length > 0,
    );

    const availabilityCells = computed(() => {
      const cellMap = new Map<string, MeetingAvailabilityStatus>();
      meetingData.value[0].data.forEach(([roomIndex, timeIndex, status]) => {
        cellMap.set(`${roomIndex}-${timeIndex}`, (status as MeetingAvailabilityStatus) ?? 1);
      });
      return yData.value.map((time, timeIndex) => ({
        time,
        rooms: xData.value.map((roomName, roomIndex) => {
          const status = cellMap.get(`${roomIndex}-${timeIndex}`) ?? 1;
          return {
            roomName,
            status,
            ...availabilityStatusMeta[status],
          };
        }),
      }));
    });

    const availabilitySummary = computed(() => {
      const summary: Record<MeetingAvailabilityStatus, number> = { 0: 0, 1: 0, 2: 0 };
      meetingData.value[0].data.forEach(([, , status]) => {
        summary[(status as MeetingAvailabilityStatus) ?? 1] += 1;
      });
      return summary;
    });

    const renderAvailabilityGrid = (): JSX.Element => (
      <div class="meeting-availability-layout">
        <div class="meeting-availability-summary">
          <div class="meeting-availability-summary-item is-total">
            <span class="summary-label">会议室数</span>
            <span class="summary-value">
              {xData.value.length}
              <small>个</small>
            </span>
          </div>
          <div class="meeting-availability-summary-item is-reservable">
            <span class="summary-label">可预定</span>
            <span class="summary-value">
              {availabilitySummary.value[0]}
              <small>个</small>
            </span>
          </div>
          <div class="meeting-availability-summary-item is-reserved">
            <span class="summary-label">已预定</span>
            <span class="summary-value">
              {availabilitySummary.value[2]}
              <small>个</small>
            </span>
          </div>
          <div class="meeting-availability-summary-item is-unavailable">
            <span class="summary-label">不可预定</span>
            <span class="summary-value">
              {availabilitySummary.value[1]}
              <small>个</small>
            </span>
          </div>
        </div>

        <div class="meeting-availability-grid" style={{ "--meeting-room-count": xData.value.length || 1 }}>
          <div class="meeting-availability-grid-head">
            <div class="meeting-availability-time-head">时间</div>
            {xData.value.map((roomName) => (
              <div class="meeting-availability-room-head" title={roomName} key={roomName}>
                {roomName}
              </div>
            ))}
          </div>

          <div class="meeting-availability-grid-body">
            {availabilityCells.value.map((row) => (
              <div class="meeting-availability-grid-row" key={row.time}>
                <div class="meeting-availability-time">{row.time}</div>
                {row.rooms.map((room) => (
                  <div
                    class={["meeting-availability-cell", room.className]}
                    title={`${room.roomName} ${row.time} ${room.label}`}
                    key={`${row.time}-${room.roomName}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div class="meeting-availability-legend">
            {([0, 2, 1] as MeetingAvailabilityStatus[]).map((status) => (
              <span class={["meeting-availability-legend-item", availabilityStatusMeta[status].className]} key={status}>
                <i />
                {availabilityStatusMeta[status].label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meeting-manage-v2-body", isZoom ? "is-zoom access-control-v2-panel access-control-card-theme" : ""]}>
        <div class="meeting-manage-chart-surface">
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasData.value ? (
            <div class="meeting-manage-chart meeting-manage-availability">{renderAvailabilityGrid()}</div>
          ) : (
            <div class={["meeting-manage-empty", "is-heatmap", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="meeting-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme meeting-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meeting-availability" />,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default MeetingAvailability;
