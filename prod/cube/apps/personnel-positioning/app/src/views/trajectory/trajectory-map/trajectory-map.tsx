import { defineComponent, type PropType } from "vue";

import { pointKey, trajectoryPointsUntil, trajectoryProgressCoordinates, trajectorySceneId } from "../model/trajectory-data";
import { OUTDOOR_SCENE_ID } from "@/constants/realtime";
import type { PositionPoint } from "@/models/positioning";
import type { MapCoordinate, PositionAlarm } from "@/models/realtime";
import type { TrajectorySegment } from "@/models/trajectory";
import { projectFloorCoordinate, type FloorCoordinateAxis } from "@/utils/floor-coordinate";
import { formatDateTime } from "@/utils/positioning";
import { mapCoordinate } from "@/utils/realtime";
import { RealtimeMap } from "@/views/realtime/realtime-map/realtime-map";

import "./trajectory-map.less";

interface ProjectedPoint {
  point: PositionPoint;
  coordinate: MapCoordinate;
}

export const TrajectoryMap = defineComponent({
  name: "TrajectoryMap",
  props: {
    backgroundUrl: { type: String, required: true },
    coordinateAxis: { type: Object as PropType<FloorCoordinateAxis | null>, default: null },
    floorId: { type: String, default: "" },
    sceneId: { type: String, required: true },
    sceneName: { type: String, required: true },
    segments: { type: Array as PropType<TrajectorySegment[]>, required: true },
    cursor: { type: Number, required: true },
    playbackStarted: { type: Boolean, default: false },
    startPoint: { type: Object as PropType<PositionPoint | undefined>, default: undefined },
    endPoint: { type: Object as PropType<PositionPoint | undefined>, default: undefined },
    currentPoint: { type: Object as PropType<PositionPoint | undefined>, default: undefined },
    alarms: { type: Array as PropType<PositionAlarm[]>, default: () => [] },
    resetVersion: { type: Number, default: 0 },
  },
  emits: { selectPoint: (_point: PositionPoint) => true, selectAlarm: (_id: string) => true, imageError: () => true },
  setup(props, { emit }) {
    const isIndoor = () => props.sceneId !== OUTDOOR_SCENE_ID;
    const project = (point: PositionPoint): MapCoordinate | null =>
      isIndoor() ? (point.floorId === props.floorId ? projectFloorCoordinate(point, props.coordinateAxis) : null) : mapCoordinate(point);
    function projectedRuns(points: PositionPoint[]): ProjectedPoint[][] {
      const runs: ProjectedPoint[][] = [];
      let connected = false;
      for (const point of points) {
        const coordinate = project(point);
        if (!coordinate) {
          connected = false;
          continue;
        }
        if (!connected) runs.push([]);
        runs.at(-1)!.push({ point, coordinate });
        connected = true;
      }
      return runs;
    }
    function playerCoordinate(): MapCoordinate | null {
      const current = props.currentPoint;
      if (!current || trajectorySceneId(current) !== props.sceneId) return null;
      for (const segment of props.segments) {
        for (const run of projectedRuns(segment.points)) {
          if (!run.some(({ point }) => pointKey(point) === pointKey(current))) continue;
          const progress = trajectoryProgressCoordinates(run, props.cursor);
          return progress.at(-1) ?? null;
        }
      }
      return project(current);
    }
    function selectPoint(event: Event, point: PositionPoint): void {
      event.stopPropagation();
      emit("selectPoint", point);
    }
    function keyActivate(event: KeyboardEvent, action: () => void): void {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        action();
      }
    }
    return () => (
      <RealtimeMap
        class="pp-trajectory-map"
        backgroundUrl={props.backgroundUrl}
        preserveImageRatio={isIndoor()}
        sceneName={props.sceneName}
        resetVersion={props.resetVersion}
        onImageError={() => emit("imageError")}
        v-slots={{
          overlay: ({
            markerScale,
            mapX,
            mapY,
          }: {
            markerScale: number;
            mapX: (value: number) => number;
            mapY: (value: number) => number;
          }) => (
            <>
              {props.segments.flatMap((segment) =>
                projectedRuns(segment.points).map((run, runIndex) => {
                  const drawn = props.playbackStarted ? trajectoryProgressCoordinates(run, props.cursor) : [];
                  const line = drawn.map(({ x, y }) => `${mapX(x)},${mapY(y)}`).join(" ");
                  return (
                    <g key={`${segment.id}-${runIndex}`}>
                      {drawn.length > 1 && (
                        <g pointer-events="none">
                          <polyline class="pp-trajectory-map__line-shadow" points={line} />
                          <polyline class="pp-trajectory-map__line" points={line} />
                        </g>
                      )}
                      {trajectoryPointsUntil(run, props.cursor, props.playbackStarted).map(({ point, coordinate }) => {
                        const multiple = props.startPoint && props.endPoint && pointKey(props.startPoint) !== pointKey(props.endPoint);
                        const endpoint =
                          multiple && props.startPoint && pointKey(point) === pointKey(props.startPoint)
                            ? "start"
                            : multiple && props.endPoint && pointKey(point) === pointKey(props.endPoint)
                              ? "end"
                              : "";
                        return (
                          <g
                            key={pointKey(point)}
                            transform={`translate(${mapX(coordinate.x)} ${mapY(coordinate.y)}) scale(${markerScale})`}
                            class="pp-trajectory-map__point"
                            role="button"
                            tabindex={0}
                            aria-label={`位置 ${formatDateTime(point.at)}`}
                            onPointerdown={(event) => event.stopPropagation()}
                            onClick={(event) => selectPoint(event, point)}
                            onKeydown={(event) => keyActivate(event, () => emit("selectPoint", point))}
                          >
                            <circle r={12} fill="transparent" pointer-events="all" />
                            <circle
                              r={endpoint ? 8 : 4}
                              fill={endpoint === "start" ? "#52c41a" : endpoint === "end" ? "#ff4d4f" : "white"}
                              stroke={endpoint ? "white" : "#1890ff"}
                              stroke-width={2}
                            />
                            {endpoint && (
                              <text y={endpoint === "start" ? -15 : 24} text-anchor="middle">
                                {endpoint === "start" ? "轨迹起点" : "轨迹终点"}
                              </text>
                            )}
                            <title>{formatDateTime(point.at)}</title>
                          </g>
                        );
                      })}
                    </g>
                  );
                }),
              )}
              {props.alarms
                .filter((alarm) => alarm.coordinate && alarm.sceneId === props.sceneId)
                .map((alarm) => (
                  <g
                    key={alarm.id}
                    class="pp-trajectory-map__alarm"
                    transform={`translate(${mapX(alarm.coordinate!.x)} ${mapY(alarm.coordinate!.y)}) scale(${markerScale})`}
                    role="button"
                    tabindex={0}
                    aria-label={`告警 ${alarm.id}`}
                    onPointerdown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      emit("selectAlarm", alarm.id);
                    }}
                    onKeydown={(event) => keyActivate(event, () => emit("selectAlarm", alarm.id))}
                  >
                    <path d="M 0 -18 L 13 4 L -13 4 Z" fill="#f5222d" stroke="white" stroke-width={2} />
                    <text y={0} text-anchor="middle" fill="white">
                      !
                    </text>
                  </g>
                ))}
              {props.playbackStarted &&
                props.currentPoint &&
                (() => {
                  const p = playerCoordinate();
                  if (!p) return null;
                  return (
                    <g
                      class="pp-trajectory-map__player"
                      transform={`translate(${mapX(p.x)} ${mapY(p.y)}) scale(${markerScale})`}
                      pointer-events="none"
                    >
                      <circle r={18} fill="#1890ff" fill-opacity="0.18" />
                      <circle r={8} fill="#1890ff" stroke="white" stroke-width={3} />
                    </g>
                  );
                })()}
            </>
          ),
          legend: () => (
            <div class="pp-trajectory-map__legend">
              {props.startPoint && props.endPoint && pointKey(props.startPoint) !== pointKey(props.endPoint) && (
                <>
                  <span>
                    <i class="is-start" />
                    轨迹起点
                  </span>
                  <span>
                    <i class="is-end" />
                    轨迹终点
                  </span>
                </>
              )}
              <span>
                <i class="is-track" />
                轨迹 / 位置
              </span>
              <span>
                <i class="is-alarm" />
                告警
              </span>
              <span class="pp-muted">拖动平移 · 滚轮缩放</span>
            </div>
          ),
        }}
      />
    );
  },
});
