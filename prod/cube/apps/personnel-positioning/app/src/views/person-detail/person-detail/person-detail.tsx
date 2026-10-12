import { computed, defineComponent, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import {
  ArrowLeftOutlined,
  Alert,
  Button,
  ClockCircleOutlined,
  Empty,
  EnvironmentOutlined,
  Spin,
  TabPane,
  Tabs,
  Tag,
  type ColumnType,
} from "@ghcloud/cube-ui";

import { USE_MOCK } from "@/constants/env";
import { BINDING_REASON_LABELS, DEVICE_TYPES, PERSON_SOURCES, POSITIONING_DEVICE_TYPES } from "@/constants/positioning";
import { OUTDOOR_SCENE_ID } from "@/constants/realtime";
import type { BindingRecord, PositionPoint } from "@/models/positioning";
import { formatDateTime, normalizeDateTime } from "@/utils/positioning";
import { positionCoordinateText } from "@/utils/realtime";
import { StaticTable, asCubeTableColumns } from "@/utils/table-columns";
import { usePersonContext } from "@/views/person-detail/composables/use-person-context";
import { usePersonLiveLocation } from "@/views/person-detail/composables/use-person-live-location";
import { PositionMap } from "@/views/person-detail/position-map/position-map";
import { RealtimeMap } from "@/views/realtime/realtime-map/realtime-map";

import "./person-detail.less";

interface HistoryRow extends BindingRecord {
  terminalType: string;
}

export const PersonDetail = defineComponent({
  name: "PersonDetail",
  setup() {
    const router = useRouter();
    const context = usePersonContext();
    const live = usePersonLiveLocation(context.personId);
    const activeTab = shallowRef("position");
    const imageFailed = shallowRef(false);
    watch(live.background.url, () => {
      imageFailed.value = false;
    });
    const point = computed<PositionPoint | undefined>(() => {
      if (USE_MOCK) return context.latestPoint.value;
      const value = live.location.value;
      if (!value?.locationTime) return undefined;
      const outdoor = value.coordinateType === "OUTDOOR";
      if (
        outdoor
          ? !Number.isFinite(value.longitude) || !Number.isFinite(value.latitude)
          : !Number.isFinite(value.coordinateX) || !Number.isFinite(value.coordinateY)
      )
        return undefined;
      return {
        personId: context.personId.value,
        terminalId: value.positioningDeviceId,
        at: normalizeDateTime(value.locationTime),
        sceneId: outdoor
          ? OUTDOOR_SCENE_ID
          : live.areaId.value !== OUTDOOR_SCENE_ID
            ? live.areaId.value
            : value.positioningAreaId || value.floorId || "indoor",
        scene: [value.buildingName, value.floorName].filter(Boolean).join(" · ") || (outdoor ? "室外位置" : "室内位置"),
        x: value.coordinateX ?? Number.NaN,
        y: value.coordinateY ?? Number.NaN,
        ...(value.deviceNumber !== undefined ? { terminalNumber: value.deviceNumber } : {}),
        ...(value.coordinateType !== undefined ? { coordinateType: value.coordinateType } : {}),
        ...(value.online !== undefined ? { online: value.online ? ("online" as const) : ("offline" as const) } : {}),
        ...(value.battery !== undefined ? { battery: value.battery } : {}),
        ...(value.lastKnown !== undefined ? { lastKnown: value.lastKnown } : {}),
        ...(value.longitude !== undefined ? { longitude: value.longitude } : {}),
        ...(value.latitude !== undefined ? { latitude: value.latitude } : {}),
        ...(value.coordinateZ !== undefined ? { z: value.coordinateZ } : {}),
        ...(value.buildingId !== undefined ? { buildingId: value.buildingId } : {}),
        ...(value.buildingName !== undefined ? { buildingName: value.buildingName } : {}),
        ...(value.floorId !== undefined ? { floorId: value.floorId } : {}),
        ...(value.floorName !== undefined ? { floorName: value.floorName } : {}),
      };
    });
    const floorMapReady = computed(
      () =>
        !USE_MOCK &&
        live.location.value?.coordinateType !== "OUTDOOR" &&
        Boolean(live.location.value?.floorId) &&
        live.background.loadedId.value === live.areaId.value &&
        live.background.floorId.value === live.location.value?.floorId &&
        Boolean(live.background.url.value) &&
        !imageFailed.value,
    );
    const mapTerminals = computed(() =>
      point.value && live.coordinate.value
        ? [
            {
              id: point.value.terminalId,
              deviceType: POSITIONING_DEVICE_TYPES.terminal,
              label: context.person.value?.name || "当前位置",
              personId: context.personId.value,
              online: live.location.value?.online,
              coordinate: live.coordinate.value,
            },
          ]
        : [],
    );
    const mapWarning = computed(() => {
      if (!floorMapReady.value) return "";
      if (!live.background.axis.value) return "楼层平面图未配置有效坐标系，无法绘制人员位置";
      if (point.value && !live.coordinate.value) return "当前坐标超出平面图范围，无法绘制人员位置";
      return "";
    });
    const positionStatus = computed(() => {
      if (USE_MOCK) return context.positionStatus.value;
      if (!context.binding.value && !context.person.value?.bound) return { label: "未绑定", color: "default" };
      if (context.terminal.value && !context.terminal.value.enabled) return { label: "终端已停用", color: "default" };
      if (live.location.value?.online === false) return { label: "离线", color: "default" };
      if (live.location.value?.online === true)
        return point.value ? { label: "在线", color: "green" } : { label: "暂无位置", color: "orange" };
      return point.value ? { label: "状态未知", color: "orange" } : { label: "暂无位置", color: "orange" };
    });
    const isLive = computed(() =>
      Boolean(
        context.binding.value &&
        context.terminal.value?.enabled !== false &&
        (USE_MOCK ? context.terminal.value?.online === "online" : live.location.value?.online === true) &&
        point.value,
      ),
    );
    const emptyDescription = computed(() => {
      if (live.error.value) return live.error.value;
      if (!context.binding.value && !context.person.value?.bound) return "当前未绑定定位终端，暂无实时位置";
      if (context.terminal.value && !context.terminal.value.enabled) return "当前终端已停用，暂无可展示的位置记录";
      return "当前绑定期间暂无定位数据，等待首次上报";
    });
    const positionNote = computed(() => {
      if (!USE_MOCK) {
        if (live.location.value?.online === false) return "终端当前离线，展示最后一次定位记录。";
        return "位置、电量和在线状态由物联属性接口返回。";
      }
      const terminal = context.terminal.value;
      if (!terminal) return "终端信息不可用，展示最后记录的位置。";
      if (!terminal.enabled) return "终端已停用，展示最后记录的位置。";
      if (terminal.online === "offline") return "终端当前离线，展示最后一次定位记录。";
      return "位置、电量和在线状态由物联属性接口返回。";
    });
    const historyRows = computed<HistoryRow[]>(() =>
      context.bindings.value.map((record) => {
        const device = context.store.state.devices.find((item) => item.id === record.terminalId);
        return { ...record, terminalType: device ? DEVICE_TYPES[device.type].label : "—" };
      }),
    );
    const historyColumns: ColumnType<HistoryRow>[] = [
      { title: "终端编号", dataIndex: "terminalNumber", width: 160 },
      { title: "终端类型", dataIndex: "terminalType", width: 140 },
      {
        title: "绑定状态",
        dataIndex: "endedAt",
        width: 130,
        customRender: ({ record }) => (
          <Tag color={record.endedAt ? "default" : "green"}>
            {record.endedAt ? (record.endAction === "replace" ? "已换绑" : "已解绑") : "当前绑定"}
          </Tag>
        ),
      },
      { title: "开始时间", dataIndex: "startedAt", width: 190, customRender: ({ text }) => formatDateTime(text) },
      { title: "结束时间", dataIndex: "endedAt", width: 190, customRender: ({ text }) => (text ? formatDateTime(text) : "至今") },
      {
        title: "操作原因",
        dataIndex: "reason",
        width: 150,
        customRender: ({ record }) => {
          const reason = record.endedAt ? record.endReason : record.actionReason;
          return reason ? BINDING_REASON_LABELS[reason as keyof typeof BINDING_REASON_LABELS] || reason : "—";
        },
      },
      { title: "操作人", dataIndex: "operator", width: 160 },
    ];

    watch(context.personId, () => {
      activeTab.value = "position";
    });

    function backToList(): void {
      void router.push(context.returnTo.value);
    }
    function viewTrajectory(): void {
      void router.push({
        name: "trajectory",
        params: { id: context.personId.value },
        query: { returnTo: context.returnTo.value, from: "detail" },
      });
    }
    function renderSummary() {
      const person = context.person.value;
      if (!person) return null;
      return (
        <section class="positioning-detail__summary" aria-label="人员基本信息">
          <div class="positioning-detail__identity">
            <div class="positioning-detail__avatar">{person.name.slice(-2)}</div>
            <div>
              <div class="positioning-detail__name">
                {person.name}
                <Tag color={PERSON_SOURCES[person.source].color}>{PERSON_SOURCES[person.source].personType}</Tag>
              </div>
              <span class="positioning-detail__secondary">人员编号：{person.personNumber || person.id}</span>
            </div>
          </div>
          <dl class="positioning-detail__facts">
            <div>
              <dt>所属组织</dt>
              <dd>{person.organization}</dd>
            </div>
            <div>
              <dt>岗位</dt>
              <dd>{person.post}</dd>
            </div>
            <div>
              <dt>当前终端</dt>
              <dd>
                {context.binding.value?.terminalNumber || person.deviceNumber || "未绑定"}
                {context.terminal.value && (
                  <span class="positioning-detail__device-type">{DEVICE_TYPES[context.terminal.value.type].label}</span>
                )}
              </dd>
            </div>
            <div>
              <dt>定位状态</dt>
              <dd>
                <Tag color={positionStatus.value.color}>{positionStatus.value.label}</Tag>
              </dd>
            </div>
          </dl>
        </section>
      );
    }
    function renderCurrentPosition() {
      const person = context.person.value;
      const currentPoint = point.value;
      const showPosition = Boolean(currentPoint || (!USE_MOCK && live.location.value?.floorId));
      if (!person) return null;
      return (
        <section class="positioning-detail__position">
          <div class="positioning-detail__position-heading">
            <div>
              <h3>位置概览</h3>
              <p>查看人员位置与最后更新时间</p>
            </div>
            <Tag color="blue">物联位置</Tag>
          </div>
          {!USE_MOCK && live.error.value && <Alert type="warning" showIcon message={live.error.value} />}
          {mapWarning.value && <Alert type="warning" showIcon message={mapWarning.value} />}
          {showPosition ? (
            <div class="positioning-detail__position-grid">
              {floorMapReady.value ? (
                <div class="positioning-detail__floor-map">
                  <RealtimeMap
                    sceneName={
                      currentPoint?.scene ||
                      [live.location.value?.buildingName, live.location.value?.floorName].filter(Boolean).join(" · ") ||
                      "室内位置"
                    }
                    backgroundUrl={live.background.url.value}
                    preserveImageRatio
                    devices={mapTerminals.value}
                    selectedDeviceId={live.location.value?.positioningDeviceId || ""}
                    showRegions={false}
                    onImageError={() => {
                      imageFailed.value = true;
                    }}
                  />
                </div>
              ) : USE_MOCK && currentPoint?.coordinateType === "OUTDOOR" ? (
                <PositionMap
                  scene={currentPoint.scene}
                  point={currentPoint}
                  label={`${person.name} · ${isLive.value ? "当前位置" : "最后位置"}`}
                  muted={!isLive.value}
                />
              ) : (
                <div class="positioning-detail__indoor-placeholder">
                  {live.background.loading.value ? <Spin /> : <EnvironmentOutlined />}
                  <strong>
                    {live.background.loading.value
                      ? "正在加载楼层平面图"
                      : currentPoint?.coordinateType === "OUTDOOR"
                        ? "室外位置"
                        : "室内位置"}
                  </strong>
                  {currentPoint?.coordinateType === "OUTDOOR" ? (
                    <span>{positionCoordinateText(currentPoint)}</span>
                  ) : (
                    <>
                      <span>{currentPoint?.buildingName || live.location.value?.buildingName || "未识别楼栋"}</span>
                      <span>{currentPoint?.floorName || live.location.value?.floorName || "未识别楼层"}</span>
                    </>
                  )}
                  <span>
                    {currentPoint?.coordinateType === "OUTDOOR"
                      ? "当前仅展示经纬度，暂无室外地图"
                      : USE_MOCK
                        ? "本期不绘制室内地图"
                        : imageFailed.value
                          ? "平面图加载失败"
                          : live.background.error.value ||
                            live.areas.error.value ||
                            (!live.areaId.value || live.areaId.value === OUTDOOR_SCENE_ID
                              ? "当前楼层未匹配定位区域"
                              : "当前楼层未配置平面图")}
                  </span>
                </div>
              )}
              <aside class="positioning-detail__position-card">
                <div class="positioning-detail__card-title">
                  <EnvironmentOutlined />
                  <span>{isLive.value ? "当前位置" : currentPoint ? "最后记录位置" : "暂无有效坐标"}</span>
                  <Tag color={positionStatus.value.color}>{positionStatus.value.label}</Tag>
                </div>
                <div class="positioning-detail__scene-name">
                  {currentPoint?.scene ||
                    [live.location.value?.buildingName, live.location.value?.floorName].filter(Boolean).join(" · ") ||
                    "室内位置"}
                </div>
                <dl class="positioning-detail__position-meta">
                  <div>
                    <dt>位置坐标</dt>
                    <dd>{currentPoint ? positionCoordinateText(currentPoint) : "暂无有效坐标"}</dd>
                  </div>
                  <div>
                    <dt>
                      <ClockCircleOutlined /> 最后更新时间
                    </dt>
                    <dd>{currentPoint ? formatDateTime(currentPoint.at) : "—"}</dd>
                  </div>
                </dl>
                <p class="positioning-detail__position-note">{positionNote.value}</p>
                <Button block type="primary" ghost onClick={viewTrajectory}>
                  查看历史轨迹
                </Button>
              </aside>
            </div>
          ) : (
            <div class="positioning-detail__empty">
              {live.loading.value && !USE_MOCK ? (
                <Spin tip="正在查询人员位置" />
              ) : (
                <Empty description={emptyDescription.value}>
                  <Button type="primary" ghost onClick={viewTrajectory}>
                    查看历史轨迹
                  </Button>
                </Empty>
              )}
            </div>
          )}
        </section>
      );
    }
    function renderBindingHistory() {
      return (
        <section class="positioning-detail__history">
          <div class="positioning-detail__position-heading">
            <div>
              <h3>绑定记录</h3>
              <p>当前绑定与历史记录，共 {historyRows.value.length} 条</p>
            </div>
          </div>
          <StaticTable
            rowKey="id"
            columns={asCubeTableColumns(historyColumns)}
            dataSource={historyRows.value}
            loading={false}
            pagination={false}
            scrollX={1120}
          />
        </section>
      );
    }

    return () => (
      <CubeLayout
        title="人员定位详情"
        showFooter={false}
        v-slots={{
          "layout-header": () => (
            <Button icon={<ArrowLeftOutlined />} onClick={backToList}>
              返回列表
            </Button>
          ),
          "layout-content": () => (
            <div class="positioning-detail">
              {context.person.value ? (
                <>
                  {renderSummary()}
                  <div class="positioning-detail__tabs">
                    <Tabs
                      activeKey={activeTab.value}
                      onTabChange={(key: string | number) => {
                        activeTab.value = String(key);
                      }}
                    >
                      <TabPane key="position" tab="实时位置">
                        {renderCurrentPosition()}
                      </TabPane>
                      <TabPane key="bindings" tab="绑定记录">
                        {renderBindingHistory()}
                      </TabPane>
                    </Tabs>
                  </div>
                </>
              ) : (
                <div class="positioning-detail__empty">
                  <Empty description="人员不存在或已不在定位对象中">
                    <Button type="primary" onClick={backToList}>
                      返回列表
                    </Button>
                  </Empty>
                </div>
              )}
            </div>
          ),
        }}
      />
    );
  },
});
