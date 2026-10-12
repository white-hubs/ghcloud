import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import { Button, MinusOutlined, PlusOutlined, AimOutlined } from "@ghcloud/cube-ui";

import { POSITIONING_DEVICE_TYPES } from "@/constants/positioning";
import { ALARM_LEVELS } from "@/constants/realtime";
import type { LocatedDevice, LocatedPerson, MapCoordinate, MonitorRegion, PositionAlarm } from "@/models/realtime";

import "./realtime-map.less";

const MAP_WIDTH = 1100;
const MAP_HEIGHT = 680;
const STATION_COLOR = "#7048ff";
const STATION_ICON_DIAMETER = 40;
const STATION_ICON_MIN_PX = 14;
const STATION_ICON_MAX_PX = 24;
const STATION_ICON_MAP_RATIO = 0.045;
const PERSON_ICON_DIAMETER = 28;
const PERSON_ICON_MIN_PX = 12;
const PERSON_ICON_MAX_PX = 20;
const PERSON_ICON_MAP_RATIO = 0.035;

function StationGlyph({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} stroke-width={2.7} stroke-linecap="round" stroke-linejoin="round">
      <circle cy={-7} r={2.5} fill={color} stroke="none" />
      <path d="M -6 -14 C -10 -11 -10 -5 -6 -2 M 6 -14 C 10 -11 10 -5 6 -2" />
      <path d="M -11 -17 C -17 -12 -17 -4 -11 1 M 11 -17 C 17 -12 17 -4 11 1" />
      <path d="M 0 -4 L 0 4 L -6 16 M 0 4 L 6 16 M -3 10 L 3 10" />
    </g>
  );
}

export const RealtimeMap = defineComponent({
  name: "RealtimeMap",
  props: {
    backgroundUrl: { type: String, required: true },
    preserveImageRatio: { type: Boolean, default: false },
    sceneName: { type: String, required: true },
    locations: { type: Array as PropType<LocatedPerson[]>, default: () => [] },
    devices: { type: Array as PropType<LocatedDevice[]>, default: () => [] },
    regions: { type: Array as PropType<MonitorRegion[]>, default: () => [] },
    alarms: { type: Array as PropType<PositionAlarm[]>, default: () => [] },
    selectedPersonId: { type: String, default: "" },
    selectedDeviceId: { type: String, default: "" },
    selectedRegionId: { type: String, default: "" },
    showRegions: { type: Boolean, default: true },
    eventPoint: { type: Object as PropType<MapCoordinate | null>, default: null },
    eventLabel: { type: String, default: "告警发生位置" },
    resetVersion: { type: Number, default: 0 },
  },
  emits: {
    selectPerson: (_id: string) => true,
    selectDevice: (_id: string) => true,
    selectRegion: (_id: string) => true,
    clear: () => true,
    imageError: () => true,
  },
  setup(props, { emit, slots }) {
    const svgElement = ref<SVGSVGElement>();
    const size = ref({ width: MAP_WIDTH, height: MAP_HEIGHT });
    const imageSize = ref({ width: MAP_WIDTH, height: MAP_HEIGHT });
    const imageRect = computed(() => {
      if (!props.preserveImageRatio) return { x: 0, y: 0, width: MAP_WIDTH, height: MAP_HEIGHT };
      const scale = Math.min(MAP_WIDTH / imageSize.value.width, MAP_HEIGHT / imageSize.value.height);
      const width = imageSize.value.width * scale;
      const height = imageSize.value.height * scale;
      return { x: (MAP_WIDTH - width) / 2, y: (MAP_HEIGHT - height) / 2, width, height };
    });
    const mapX = (percentage: number) => imageRect.value.x + (percentage * imageRect.value.width) / 100;
    const mapY = (percentage: number) => imageRect.value.y + (percentage * imageRect.value.height) / 100;
    const zoom = ref(1);
    // 标记保持屏幕尺寸，缩放和侧栏尺寸变化时姓名仍清晰可读。
    const markerScale = computed(() => Math.max(MAP_WIDTH / size.value.width, MAP_HEIGHT / size.value.height) / zoom.value);
    // 图形随平面图可视短边调整；只缩放图形，标签保持可读。
    const imageShortSide = computed(() => {
      const mapToScreen = Math.min(size.value.width / MAP_WIDTH, size.value.height / MAP_HEIGHT);
      return Math.min(imageRect.value.width, imageRect.value.height) * mapToScreen;
    });
    const stationIconScale = computed(
      () =>
        Math.max(STATION_ICON_MIN_PX, Math.min(STATION_ICON_MAX_PX, imageShortSide.value * STATION_ICON_MAP_RATIO)) / STATION_ICON_DIAMETER,
    );
    const personIconScale = computed(
      () => Math.max(PERSON_ICON_MIN_PX, Math.min(PERSON_ICON_MAX_PX, imageShortSide.value * PERSON_ICON_MAP_RATIO)) / PERSON_ICON_DIAMETER,
    );
    const alarmLevels = computed(() => {
      const people = new Map<string, 1 | 2 | 3>();
      const regions = new Map<string, 1 | 2 | 3>();
      for (const alarm of props.alarms) {
        if (alarm.personId && alarm.level < (people.get(alarm.personId) ?? Infinity)) {
          people.set(alarm.personId, alarm.level);
        }
        if (alarm.regionId && alarm.level < (regions.get(alarm.regionId) ?? Infinity)) {
          regions.set(alarm.regionId, alarm.level);
        }
      }
      return { people, regions };
    });
    let resizeObserver: ResizeObserver | undefined;
    onMounted(() => {
      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) {
          size.value = { width: Math.max(1, entry.contentRect.width), height: Math.max(1, entry.contentRect.height) };
        }
      });
      if (svgElement.value) {
        resizeObserver.observe(svgElement.value);
      }
    });
    onBeforeUnmount(() => resizeObserver?.disconnect());
    const center = ref({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
    const viewBox = computed(() => {
      const width = MAP_WIDTH / zoom.value;
      const height = MAP_HEIGHT / zoom.value;
      return `${center.value.x - width / 2} ${center.value.y - height / 2} ${width} ${height}`;
    });
    let drag: { x: number; y: number; cx: number; cy: number; ratio: number } | undefined;
    let moved = false;
    function reset(): void {
      zoom.value = 1;
      center.value = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
    }
    function scale(delta: number): void {
      zoom.value = Math.min(4, Math.max(0.75, zoom.value + delta));
    }
    function startDrag(event: PointerEvent): void {
      if (event.button !== 0) {
        return;
      }
      const svg = event.currentTarget as SVGSVGElement;
      const matrix = svg.getScreenCTM();
      if (!matrix) {
        return;
      }
      moved = false;
      drag = { x: event.clientX, y: event.clientY, cx: center.value.x, cy: center.value.y, ratio: matrix.a };
      svg.setPointerCapture(event.pointerId);
    }
    function moveDrag(event: PointerEvent): void {
      if (!drag) {
        return;
      }
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        moved = true;
      }
      if (moved) {
        center.value = {
          x: Math.max(0, Math.min(MAP_WIDTH, drag.cx - dx / drag.ratio)),
          y: Math.max(0, Math.min(MAP_HEIGHT, drag.cy - dy / drag.ratio)),
        };
      }
    }
    function select(event: Event, kind: "person" | "region", id: string): void {
      event.stopPropagation();
      if (kind === "person") {
        emit("selectPerson", id);
      } else {
        emit("selectRegion", id);
      }
    }
    function keySelect(event: KeyboardEvent, kind: "person" | "region", id: string): void {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(event, kind, id);
      }
    }
    watch(() => [props.backgroundUrl, props.resetVersion], reset);
    watch(
      () => [props.backgroundUrl, props.preserveImageRatio],
      ([url, preserve], _, onCleanup) => {
        imageSize.value = { width: MAP_WIDTH, height: MAP_HEIGHT };
        if (!preserve || !url) return;
        const image = new Image();
        let active = true;
        onCleanup(() => {
          active = false;
        });
        image.onload = () => {
          if (active && image.naturalWidth && image.naturalHeight) {
            imageSize.value = { width: image.naturalWidth, height: image.naturalHeight };
          }
        };
        image.src = String(url);
      },
      { immediate: true },
    );

    return () => (
      <div class="pp-realtime-map">
        <svg
          ref={svgElement}
          aria-label={`${props.sceneName}定位地图`}
          viewBox={viewBox.value}
          onPointerdown={startDrag}
          onPointermove={moveDrag}
          onPointerup={() => {
            drag = undefined;
          }}
          onPointercancel={() => {
            drag = undefined;
            moved = true;
          }}
          onClick={() => {
            if (!moved) {
              emit("clear");
            }
            moved = false;
          }}
          onWheel={(event) => {
            event.preventDefault();
            scale(event.deltaY < 0 ? 0.25 : -0.25);
          }}
        >
          <image
            href={props.backgroundUrl}
            x={imageRect.value.x}
            y={imageRect.value.y}
            width={imageRect.value.width}
            height={imageRect.value.height}
            preserveAspectRatio={props.preserveImageRatio ? "xMidYMid meet" : "none"}
            onError={() => emit("imageError")}
          />
          {props.showRegions &&
            props.regions.map((region) => {
              const level = alarmLevels.value.regions.get(region.id);
              const selected = props.selectedRegionId === region.id;
              const color = level ? ALARM_LEVELS[level].stroke : "#1890ff";
              return (
                <g
                  key={region.id}
                  role="button"
                  tabindex={0}
                  aria-label={`监控区域：${region.name}`}
                  aria-pressed={selected}
                  class={["pp-realtime-map__region", { "is-selected": selected }]}
                  onPointerdown={(event) => event.stopPropagation()}
                  onClick={(event) => select(event, "region", region.id)}
                  onKeydown={(event) => keySelect(event, "region", region.id)}
                >
                  <polygon
                    points={region.boundary.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(" ")}
                    fill={color}
                    fill-opacity={selected ? 0.2 : 0.07}
                    stroke={color}
                    stroke-width={selected ? 4 : 2}
                    stroke-dasharray={selected ? undefined : "7 5"}
                  />
                  <text
                    transform={`translate(${mapX(region.label.x)} ${mapY(region.label.y)}) scale(${markerScale.value})`}
                    text-anchor="middle"
                    fill={color}
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          {slots.overlay?.({ markerScale: markerScale.value, mapX, mapY })}
          {props.locations.map((location) => {
            if (!location.coordinate) {
              return null;
            }
            const level = alarmLevels.value.people.get(location.person.id);
            const selected = props.selectedPersonId === location.person.id;
            const color = level ? ALARM_LEVELS[level].stroke : location.terminal.online === "online" ? "#1890ff" : "#8c8c8c";
            const labelY = 14 * personIconScale.value + 5;
            return (
              <g
                key={location.person.id}
                role="button"
                tabindex={0}
                aria-label={`人员：${location.person.name}`}
                aria-pressed={selected}
                transform={`translate(${mapX(location.coordinate.x)} ${mapY(location.coordinate.y)}) scale(${markerScale.value})`}
                class={["pp-realtime-map__person", { "is-selected": selected, "has-critical-alarm": level === 1 }]}
                onPointerdown={(event) => event.stopPropagation()}
                onClick={(event) => select(event, "person", location.person.id)}
                onKeydown={(event) => keySelect(event, "person", location.person.id)}
              >
                <rect x={-34} y={-25} width={68} height={75} fill="transparent" pointer-events="all" />
                {(selected || level) && (
                  <circle
                    class="pp-realtime-map__halo"
                    r={25 * personIconScale.value}
                    fill={color}
                    fill-opacity="0.16"
                    stroke={color}
                    stroke-width={selected ? 3 : 1}
                  />
                )}
                <g transform={`scale(${personIconScale.value})`}>
                  <circle r={14} fill={color} stroke="white" stroke-width={3} />
                  <circle cy={-3} r={3} fill="white" />
                  <path d="M -5 6 Q 0 -1 5 6" fill="white" />
                </g>
                <rect x={-34} y={labelY} width={68} height={25} rx={4} fill="white" stroke={selected ? color : "#d9d9d9"} />
                <text y={labelY + 17} text-anchor="middle" fill="#262626">
                  {location.person.name}
                </text>
              </g>
            );
          })}
          {props.devices.map((device) => {
            if (!device.coordinate) return null;
            const level = device.personId ? alarmLevels.value.people.get(device.personId) : undefined;
            const selected = props.selectedDeviceId === device.id;
            const station = device.deviceType === POSITIONING_DEVICE_TYPES.station;
            const color = level ? ALARM_LEVELS[level].stroke : device.online ? (station ? STATION_COLOR : "#1890ff") : "#8c8c8c";
            const labelY = (station ? 20 * stationIconScale.value : 14 * personIconScale.value) + 5;
            return (
              <g
                key={device.id}
                role="button"
                tabindex={0}
                aria-label={`${station ? "定位基站" : "定位终端"}：${device.label}`}
                aria-pressed={selected}
                transform={`translate(${mapX(device.coordinate.x)} ${mapY(device.coordinate.y)}) scale(${markerScale.value})`}
                class={["pp-realtime-map__person", { "is-selected": selected, "has-critical-alarm": level === 1 }]}
                onPointerdown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  emit("selectDevice", device.id);
                }}
                onKeydown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    emit("selectDevice", device.id);
                  }
                }}
              >
                <rect x={-46} y={-26} width={92} height={77} fill="transparent" pointer-events="all" />
                {(selected || level) && (
                  <circle
                    class="pp-realtime-map__halo"
                    r={25 * (station ? stationIconScale.value : personIconScale.value)}
                    fill={color}
                    fill-opacity="0.16"
                    stroke={color}
                    stroke-width={selected ? 3 : 1}
                  />
                )}
                {station ? (
                  <g transform={`scale(${stationIconScale.value})`}>
                    <circle r={20} fill="white" fill-opacity="0.9" stroke={selected ? color : "#d9d9d9"} stroke-width={1} />
                    <StationGlyph color={color} />
                  </g>
                ) : (
                  <g transform={`scale(${personIconScale.value})`}>
                    <circle r={14} fill={color} stroke="white" stroke-width={3} />
                    <rect x={-4} y={-5} width={8} height={10} rx={2} fill="white" />
                  </g>
                )}
                <rect x={-46} y={labelY} width={92} height={25} rx={4} fill="white" stroke={selected ? color : "#d9d9d9"} />
                <text y={labelY + 17} text-anchor="middle" fill="#262626">
                  {device.label}
                </text>
              </g>
            );
          })}
          {props.eventPoint && (
            <g
              transform={`translate(${mapX(props.eventPoint.x)} ${mapY(props.eventPoint.y)}) scale(${markerScale.value})`}
              class="pp-realtime-map__event"
            >
              <circle r={24} fill="#f5222d" fill-opacity="0.16" />
              <circle r={10} fill="#f5222d" stroke="white" stroke-width={3} />
              <text y={-32} text-anchor="middle" fill="#cf1322">
                {props.eventLabel}
              </text>
            </g>
          )}
        </svg>
        <div class="pp-realtime-map__controls">
          <Button aria-label="放大地图" disabled={zoom.value >= 4} onClick={() => scale(0.25)}>
            <PlusOutlined />
          </Button>
          <span>{Math.round(zoom.value * 100)}%</span>
          <Button aria-label="缩小地图" disabled={zoom.value <= 0.75} onClick={() => scale(-0.25)}>
            <MinusOutlined />
          </Button>
          <Button aria-label="地图复位" onClick={reset}>
            <AimOutlined />
          </Button>
        </div>
        <div class="pp-realtime-map__legend">
          {slots.legend ? (
            slots.legend()
          ) : (
            <>
              {props.devices.some((device) => device.deviceType === POSITIONING_DEVICE_TYPES.terminal) && (
                <>
                  <span class="is-terminal" />
                  终端
                </>
              )}
              {props.devices.some((device) => device.deviceType === POSITIONING_DEVICE_TYPES.station) && (
                <>
                  <svg class="pp-realtime-map__station-legend" viewBox="-20 -20 40 40" aria-hidden="true">
                    <StationGlyph color={STATION_COLOR} />
                  </svg>
                  基站
                </>
              )}
              <span class="is-online" />
              在线
              <span class="is-offline" />
              离线
              <span class="is-alarm" />
              告警<span class="pp-muted">拖动平移 · 滚轮缩放</span>
            </>
          )}
        </div>
      </div>
    );
  },
});
