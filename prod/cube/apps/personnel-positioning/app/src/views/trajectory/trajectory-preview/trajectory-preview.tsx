import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import {
  ArrowLeftOutlined,
  Button,
  DateRangePicker,
  Empty,
  FullscreenExitOutlined,
  FullscreenOutlined,
  Input,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  Select,
  Slider,
  Spin,
  Space,
  Tag,
  message,
} from "@ghcloud/cube-ui";

import {
  buildTrajectorySegments,
  defaultTrajectoryRange,
  filterTrajectoryPoints,
  parseRangeTime,
  quickTrajectoryRange,
  trajectoryFrame,
  trajectoryRangeError,
  trajectorySceneId,
  type TrajectoryRange,
} from "../model/trajectory-data";
import { useTrajectoryPersonSearch } from "../person-search-modal/person-search-modal";
import { useTrajectoryDetailModal } from "../trajectory-detail-modal/trajectory-detail-modal";
import { TrajectoryMap } from "../trajectory-map/trajectory-map";
import { USE_MOCK } from "@/constants/env";
import { PERSON_SOURCES } from "@/constants/positioning";
import { OUTDOOR_SCENE_ID } from "@/constants/realtime";
import { TRAJECTORY_SPEEDS } from "@/constants/trajectory";
import { useAreaBackground } from "@/hooks/use-area-background";
import { useSystemAreas } from "@/hooks/use-system-areas";
import type { PositioningPerson } from "@/models/positioning";
import { usePositioningStore } from "@/stores/positioning";
import { projectFloorCoordinate } from "@/utils/floor-coordinate";
import { formatDateTime } from "@/utils/positioning";
import { positionCoordinateText } from "@/utils/realtime";
import { areaForFloor } from "@/utils/system-areas";
import { objectListReturnTo } from "@/views/person-detail/composables/use-person-context";

import "./trajectory-preview.less";

const outdoorMap = new URL("../../../assets/outdoor-map-demo.svg", import.meta.url).href;
const PLAYBACK_DURATION_MS = 60_000;
const queryText = (value: unknown): string => (typeof value === "string" ? value : "");

export const TrajectoryPreview = defineComponent({
  name: "TrajectoryPreview",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = usePositioningStore();
    const areas = useSystemAreas();
    const personId = computed(() => queryText(route.params.id));
    const person = computed(() => store.state.persons.find((item) => item.id === personId.value));
    const historyPoints = computed(() => store.positionsFor(personId.value));
    const appliedRange = computed<TrajectoryRange>(() => {
      const value: TrajectoryRange = [queryText(route.query.start), queryText(route.query.end)];
      return trajectoryRangeError(value) ? defaultTrajectoryRange(historyPoints.value) : value;
    });
    const range = ref<TrajectoryRange>([...appliedRange.value]);
    const personInput = ref(person.value?.name ?? "");
    const pointsInRange = computed(() => filterTrajectoryPoints(historyPoints.value, appliedRange.value));
    const segments = computed(() => buildTrajectorySegments(pointsInRange.value, USE_MOCK ? store.history(personId.value) : [], !USE_MOCK));
    const points = computed(() => segments.value.flatMap((segment) => segment.points));
    const axisStart = computed(() => (points.value[0] ? Date.parse(points.value[0].at) : parseRangeTime(appliedRange.value[0])));
    const axisEnd = computed(() =>
      Math.max(axisStart.value, points.value.length ? Date.parse(points.value.at(-1)!.at) : parseRangeTime(appliedRange.value[1])),
    );
    const cursor = ref(0);
    const playbackStarted = ref(false);
    const selectedScene = ref("");
    const playing = ref(false);
    const speed = ref(1);
    const expanded = ref(false);
    const resetVersion = ref(0);
    const imageFailed = ref(false);
    const sceneOptions = computed(() => [
      ...new Map(segments.value.map((segment) => [segment.sceneId, { value: segment.sceneId, label: segment.scene }])).values(),
    ]);
    const sceneName = computed(() => sceneOptions.value.find((item) => item.value === selectedScene.value)?.label ?? "暂无场景");
    const visibleSegments = computed(() => segments.value.filter((segment) => segment.sceneId === selectedScene.value));
    const selectedFloorId = computed(() => visibleSegments.value[0]?.points[0]?.floorId || "");
    const selectedAreaId = computed(() =>
      selectedScene.value === OUTDOOR_SCENE_ID || !selectedFloorId.value
        ? OUTDOOR_SCENE_ID
        : (areaForFloor(areas.byId.value, selectedFloorId.value, selectedScene.value)?.key ?? OUTDOOR_SCENE_ID),
    );
    const areaBackground = useAreaBackground(selectedAreaId, areas.byId);
    const frame = computed(() => trajectoryFrame(segments.value, cursor.value));
    const currentPoint = computed(() => frame.value?.point);
    const backgroundUrl = computed(() => (selectedScene.value === OUTDOOR_SCENE_ID ? outdoorMap : areaBackground.url.value));
    const isIndoor = computed(() => selectedScene.value !== OUTDOOR_SCENE_ID);
    const indoorMapReady = computed(
      () =>
        isIndoor.value &&
        selectedAreaId.value !== OUTDOOR_SCENE_ID &&
        areaBackground.loadedId.value === selectedAreaId.value &&
        areaBackground.floorId.value === selectedFloorId.value &&
        Boolean(areaBackground.url.value && areaBackground.axis.value) &&
        !imageFailed.value,
    );
    const visibleIndoorPoints = computed(() => visibleSegments.value.flatMap((segment) => segment.points));
    const hasUnmappedIndoorPoints = computed(
      () =>
        indoorMapReady.value &&
        visibleIndoorPoints.value.some(
          (item) => item.floorId !== selectedFloorId.value || !projectFloorCoordinate(item, areaBackground.axis.value),
        ),
    );
    const returnLabel = computed(() =>
      route.query.from === "detail" ? "人员详情" : route.query.from === "realtime" ? "实时定位" : "定位对象",
    );
    let timer: ReturnType<typeof setInterval> | undefined;
    let lastTick = 0;
    let loadVersion = 0;

    async function loadData(): Promise<void> {
      if (!personId.value) return;
      pause();
      playbackStarted.value = false;
      if (areas.error.value) void areas.load();
      const version = ++loadVersion;
      const id = personId.value;
      const [startTime, endTime] = appliedRange.value;
      await Promise.all([store.loadPerson(id).catch(() => undefined), ...(USE_MOCK ? [store.refreshBindings(id)] : [])]);
      if (version !== loadVersion) return;
      await store.refreshTrack(id, startTime, endTime);
      if (version !== loadVersion) return;
      personInput.value = person.value?.name ?? "";
      selectedScene.value = sceneOptions.value[0]?.value ?? "";
      cursor.value = axisStart.value;
      resetVersion.value += 1;
    }

    function pause(): void {
      if (timer) clearInterval(timer);
      timer = undefined;
      playing.value = false;
    }
    function setCursor(at: number, sceneId?: string): void {
      cursor.value = Math.max(axisStart.value, Math.min(axisEnd.value, at));
      const location = trajectoryFrame(segments.value, cursor.value);
      selectedScene.value = sceneId || location?.segment.sceneId || selectedScene.value;
    }
    function seek(at: number, sceneId?: string): void {
      pause();
      setCursor(at, sceneId);
      playbackStarted.value = true;
    }
    function restart(): void {
      pause();
      setCursor(axisStart.value, sceneOptions.value[0]?.value);
      playbackStarted.value = false;
      imageFailed.value = false;
      resetVersion.value += 1;
    }
    function play(): void {
      if (playing.value) {
        pause();
        return;
      }
      if (!points.value.length) return;
      if (cursor.value >= axisEnd.value) restart();
      playbackStarted.value = true;
      if (points.value.length === 1) return;
      playing.value = true;
      lastTick = performance.now();
      timer = setInterval(() => {
        const tick = performance.now();
        const playbackScale = Math.max(1, (axisEnd.value - axisStart.value) / PLAYBACK_DURATION_MS);
        setCursor(cursor.value + (tick - lastTick) * speed.value * playbackScale);
        lastTick = tick;
        if (cursor.value >= axisEnd.value) pause();
      }, 200);
    }
    function applyPerson(selected: PositioningPerson): void {
      pause();
      personInput.value = selected.name;
      if (selected.id === personId.value && range.value[0] === appliedRange.value[0] && range.value[1] === appliedRange.value[1]) {
        void loadData().catch((error: unknown) => message.error((error as Error).message));
        return;
      }
      void router.replace({
        name: "trajectory",
        params: { id: selected.id },
        query: {
          ...route.query,
          start: range.value[0],
          end: range.value[1],
          scene: undefined,
          cursor: undefined,
          originId: route.query.from === "detail" ? route.query.originId || personId.value : undefined,
        },
      });
    }
    const people = useTrajectoryPersonSearch(applyPerson);
    function query(): void {
      const error = trajectoryRangeError(range.value);
      if (error) {
        message.warning(error);
        return;
      }
      const text = personInput.value.trim();
      if (!text) {
        message.warning("请输入姓名或人员编号");
        return;
      }
      if (person.value && [person.value.name, person.value.personNumber, person.value.id].includes(text)) {
        applyPerson(person.value);
      } else {
        people.open(text);
      }
    }
    function reset(): void {
      pause();
      range.value = defaultTrajectoryRange(historyPoints.value);
      if (range.value[0] === appliedRange.value[0] && range.value[1] === appliedRange.value[1]) {
        void loadData().catch((error: unknown) => message.error((error as Error).message));
      } else {
        void router.replace({ query: { ...route.query, start: range.value[0], end: range.value[1] } });
      }
    }
    function back(): void {
      pause();
      const returnTo = objectListReturnTo(route.query.returnTo);
      void router.push(
        route.query.from === "detail"
          ? { name: "person-detail", params: { id: queryText(route.query.originId) || personId.value }, query: { returnTo } }
          : returnTo,
      );
    }
    const details = useTrajectoryDetailModal((point) => seek(Date.parse(point.at), trajectorySceneId(point)));
    function openDetails(): void {
      pause();
      if (person.value) details.open(person.value.personNumber || person.value.id, person.value.name, points.value);
    }

    watch(
      [personId, () => route.query.start, () => route.query.end],
      () => {
        pause();
        loadVersion++;
        range.value = [...appliedRange.value];
        void loadData().catch((error: unknown) => message.error((error as Error).message));
      },
      { immediate: true },
    );
    watch(selectedScene, () => {
      imageFailed.value = false;
      resetVersion.value += 1;
    });
    onMounted(() => {
      void areas.load();
    });
    onBeforeUnmount(pause);

    return () => (
      <>
        <CubeLayout
          title="历史轨迹"
          showFooter={false}
          v-slots={{
            "layout-header": () => (
              <Space>
                <Button disabled={!points.value.length} onClick={openDetails}>
                  轨迹点 / 导出
                </Button>
                <Button
                  disabled={store.loading.track}
                  onClick={() => void loadData().catch((error: unknown) => message.error((error as Error).message))}
                >
                  <ReloadOutlined />
                  刷新
                </Button>
                <Button onClick={back}>
                  <ArrowLeftOutlined />
                  返回{returnLabel.value}
                </Button>
              </Space>
            ),
            "layout-content": () => (
              <div class={["pp-trajectory", { "is-expanded": expanded.value }]}>
                <div class="pp-trajectory__query">
                  <label>定位对象</label>
                  <Input
                    aria-label="轨迹定位对象"
                    placeholder="搜索姓名或人员编号"
                    v-model:value={personInput.value}
                    onPressEnter={query}
                  />
                  <Button onClick={() => people.open(personInput.value)}>搜索人员</Button>
                  <label>查询时间</label>
                  <DateRangePicker
                    showTime
                    valueFormat="YYYY-MM-DD HH:mm:ss"
                    format="YYYY-MM-DD HH:mm:ss"
                    value={range.value}
                    onChangePicker={(value: TrajectoryRange) => {
                      range.value = value;
                    }}
                  />
                  <Button type="primary" onClick={query}>
                    查询轨迹
                  </Button>
                  <Button onClick={reset}>重置</Button>
                  <div class="pp-trajectory__quick">
                    <span class="pp-muted">支持跨日期查询</span>
                    {[
                      { label: "今天", days: 1 },
                      { label: "昨天", days: 1, yesterday: true },
                      { label: "近3天", days: 3 },
                      { label: "近7天", days: 7 },
                    ].map((item) => (
                      <Button
                        size="small"
                        key={item.label}
                        onClick={() => {
                          range.value = quickTrajectoryRange(item.days, item.yesterday);
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {person.value ? (
                  <div class="pp-trajectory__body">
                    <aside class="pp-trajectory__summary">
                      <div class="pp-trajectory__panel-title">
                        <strong>轨迹摘要</strong>
                        <Tag color={PERSON_SOURCES[person.value.source].color}>{PERSON_SOURCES[person.value.source].personType}</Tag>
                      </div>
                      <div class="pp-trajectory__scroll">
                        <div class="pp-trajectory__person">
                          <span class="pp-person-avatar">{person.value.name.slice(-1)}</span>
                          <div>
                            <strong>{person.value.name}</strong>
                            <p>{person.value.personNumber || person.value.id}</p>
                          </div>
                        </div>
                        <p class="pp-muted">
                          {person.value.organization} · {person.value.post}
                        </p>
                        <h4>轨迹概况</h4>
                        {points.value.length > 1 ? (
                          <dl>
                            <dt>轨迹起点</dt>
                            <dd>
                              {points.value[0]!.scene}
                              <small>{formatDateTime(points.value[0]!.at)}</small>
                            </dd>
                            <dt>轨迹终点</dt>
                            <dd>
                              {points.value.at(-1)!.scene}
                              <small>{formatDateTime(points.value.at(-1)!.at)}</small>
                            </dd>
                            <dt>轨迹点数</dt>
                            <dd>{points.value.length} 个</dd>
                          </dl>
                        ) : (
                          <p class="pp-muted">{points.value.length === 1 ? "查询时段仅有一个轨迹点" : "所选时间范围内暂无轨迹数据"}</p>
                        )}
                        <h4>轨迹分段</h4>
                        {segments.value.length ? (
                          segments.value.map((segment, index) => (
                            <div key={segment.id}>
                              {segment.gapBefore && (
                                <div class="pp-trajectory__gap">
                                  暂无轨迹数据
                                  <small>
                                    {formatDateTime(segments.value[index - 1]?.points.at(-1)?.at)} — {formatDateTime(segment.points[0]!.at)}
                                  </small>
                                </div>
                              )}
                              <button
                                type="button"
                                class={["pp-trajectory__segment", { "is-active": frame.value?.segment.id === segment.id }]}
                                onClick={() => seek(Date.parse(segment.points[0]!.at), segment.sceneId)}
                              >
                                <strong>{segment.scene}</strong>
                                <small>
                                  {formatDateTime(segment.points[0]!.at)}
                                  <br />至 {formatDateTime(segment.points.at(-1)!.at)}
                                </small>
                                <span>{positionCoordinateText(segment.points[0]!)}</span>
                              </button>
                            </div>
                          ))
                        ) : (
                          <Empty description="暂无轨迹分段" />
                        )}
                      </div>
                    </aside>
                    <section class="pp-trajectory__map-panel">
                      <div class="pp-trajectory__map-header">
                        <strong>{sceneName.value}</strong>
                        <Select
                          aria-label="轨迹场景"
                          showSearch
                          optionFilterProp="label"
                          value={selectedScene.value || undefined}
                          options={sceneOptions.value}
                          onChange={(value: string) => {
                            pause();
                            selectedScene.value = value;
                          }}
                        />
                        <Button
                          type="text"
                          aria-label={expanded.value ? "收起地图" : "展开地图"}
                          onClick={() => {
                            expanded.value = !expanded.value;
                          }}
                        >
                          {expanded.value ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        </Button>
                      </div>
                      <div class="pp-trajectory__map-content">
                        {(isIndoor.value ? indoorMapReady.value : Boolean(backgroundUrl.value && !imageFailed.value)) ? (
                          <>
                            <TrajectoryMap
                              backgroundUrl={backgroundUrl.value}
                              coordinateAxis={isIndoor.value ? areaBackground.axis.value : null}
                              floorId={selectedFloorId.value}
                              sceneId={selectedScene.value}
                              sceneName={sceneName.value}
                              segments={visibleSegments.value}
                              cursor={cursor.value}
                              playbackStarted={playbackStarted.value}
                              startPoint={points.value[0]}
                              endPoint={points.value.at(-1)}
                              currentPoint={currentPoint.value}
                              resetVersion={resetVersion.value}
                              onSelectPoint={(point) => seek(Date.parse(point.at), trajectorySceneId(point))}
                              onImageError={() => {
                                imageFailed.value = true;
                              }}
                            />
                            {hasUnmappedIndoorPoints.value && (
                              <div class="pp-trajectory__map-notice">部分轨迹点超出平面图范围，已跳过绘制</div>
                            )}
                          </>
                        ) : isIndoor.value && (areas.loading.value || areaBackground.loading.value) ? (
                          <div class="pp-trajectory__empty">
                            <Spin tip="正在加载楼层平面图" />
                          </div>
                        ) : isIndoor.value && visibleIndoorPoints.value.length ? (
                          <div class="pp-trajectory__indoor-points">
                            <p class="pp-muted">
                              {imageFailed.value
                                ? "楼层平面图加载失败"
                                : areaBackground.error.value ||
                                  areas.error.value ||
                                  (areaBackground.url.value && !areaBackground.axis.value
                                    ? "楼层平面图未配置有效坐标系，以下展示坐标列表"
                                    : selectedAreaId.value === OUTDOOR_SCENE_ID
                                      ? "当前楼层未匹配定位区域，以下展示坐标列表"
                                      : "当前楼层未配置平面图，以下展示坐标列表")}
                            </p>
                            {visibleIndoorPoints.value.map((point) => (
                              <button
                                type="button"
                                key={`${point.at}-${point.terminalId}`}
                                onClick={() => seek(Date.parse(point.at), trajectorySceneId(point))}
                              >
                                <strong>{formatDateTime(point.at)}</strong>
                                <span>
                                  {point.buildingName || "未识别楼栋"} · {point.floorName || "未识别楼层"}
                                </span>
                                <span>{positionCoordinateText(point)}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div class="pp-trajectory__empty">
                            <Empty
                              description={
                                !points.value.length
                                  ? "所选时间范围内暂无轨迹数据"
                                  : imageFailed.value
                                    ? "当前地图加载失败"
                                    : "当前场景暂无可展示轨迹"
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div class="pp-trajectory__position">
                        <span>
                          <b>位置时间：</b>
                          {formatDateTime(currentPoint.value?.at)}
                        </span>
                        <span>{currentPoint.value ? positionCoordinateText(currentPoint.value) : "暂无轨迹数据"}</span>
                      </div>
                      <div class="pp-trajectory__playback">
                        <Button type="primary" disabled={!points.value.length} onClick={play}>
                          {playing.value ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                          {playing.value ? "暂停" : playbackStarted.value && cursor.value >= axisEnd.value ? "重新播放" : "播放"}
                        </Button>
                        <Button aria-label="回到轨迹起点" disabled={!points.value.length} onClick={restart}>
                          <ReloadOutlined />
                        </Button>
                        <Select
                          aria-label="播放倍速"
                          options={TRAJECTORY_SPEEDS.map((value) => ({ value, label: `${value}×` }))}
                          v-model:value={speed.value}
                        />
                        <span>{formatDateTime(new Date(cursor.value).toISOString())}</span>
                      </div>
                      <div class="pp-trajectory__slider">
                        <Slider
                          aria-label="轨迹回放时间"
                          min={axisStart.value}
                          max={Math.max(axisStart.value + 1, axisEnd.value)}
                          step={1000}
                          value={cursor.value}
                          disabled={points.value.length < 2}
                          tipFormatter={(value: number) => formatDateTime(new Date(value).toISOString())}
                          onChange={(value: number) => seek(value)}
                        />
                        <div>
                          <span>{formatDateTime(new Date(axisStart.value).toISOString())}</span>
                          <span>{formatDateTime(new Date(axisEnd.value).toISOString())}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div class="pp-trajectory__empty">
                    <Empty description={personId.value ? "定位对象不存在，请重新搜索" : "请按姓名或人员编号选择定位对象"} />
                    <Button type="primary" onClick={() => people.open(personInput.value)}>
                      搜索定位对象
                    </Button>
                  </div>
                )}
              </div>
            ),
          }}
        />
        <people.PersonSearchModal />
        <details.TrajectoryDetailModal />
      </>
    );
  },
});
