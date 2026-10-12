import { computed, defineComponent, ref } from "vue";

import { useCubeModal } from "@ghcloud/cube-app-design";
import { Button, Select, Space } from "@ghcloud/cube-ui";

import { pointKey, trajectorySceneId } from "../model/trajectory-data";
import type { PositionPoint } from "@/models/positioning";
import { downloadCsv, formatDateTime } from "@/utils/positioning";
import { positionCoordinateText } from "@/utils/realtime";
import { StaticTable, asCubeTableColumns } from "@/utils/table-columns";

import "./trajectory-detail-modal.less";

export function useTrajectoryDetailModal(onSeek: (point: PositionPoint) => void) {
  const records = ref<PositionPoint[]>([]);
  const personName = ref("");
  const personId = ref("");
  const scene = ref("");
  const page = ref(1);
  const sceneOptions = computed(() => [
    ...new Map(records.value.map((point) => [trajectorySceneId(point), { value: trajectorySceneId(point), label: point.scene }])).values(),
  ]);
  const rows = computed(() =>
    records.value
      .filter((point) => !scene.value || trajectorySceneId(point) === scene.value)
      .map((point) => ({ ...point, key: pointKey(point) })),
  );
  const [CubeModal, modal] = useCubeModal({ title: "轨迹明细", width: "980px", wrapperClass: "pp-trajectory-detail-modal" });
  const columns = [
    { title: "位置时间", dataIndex: "at", width: 180, customRender: ({ record }: { record: PositionPoint }) => formatDateTime(record.at) },
    { title: "场景", dataIndex: "scene", width: 210 },
    {
      title: "位置坐标",
      dataIndex: "coordinate",
      width: 310,
      customRender: ({ record }: { record: PositionPoint }) => positionCoordinateText(record),
    },
    {
      title: "操作",
      dataIndex: "actions",
      width: 100,
      customRender: ({ record }: { record: PositionPoint }) => (
        <Button
          type="link"
          onClick={() => {
            onSeek(record);
            modal.close();
          }}
        >
          跳转回放
        </Button>
      ),
    },
  ];
  function exportRows(): void {
    downloadCsv(`${personName.value}-轨迹明细.csv`, [
      ["人员编号", "姓名", "位置时间", "场景", "位置坐标"],
      ...rows.value.map((point) => [
        personId.value,
        personName.value,
        formatDateTime(point.at),
        point.scene,
        positionCoordinateText(point),
      ]),
    ]);
  }
  const TrajectoryDetailModal = defineComponent({
    name: "TrajectoryDetailModal",
    setup: () => () => (
      <CubeModal
        v-slots={{
          default: () => (
            <>
              <div class="pp-trajectory-detail-modal__toolbar">
                <strong>
                  {personName.value} · {personId.value}
                </strong>
                <Select
                  aria-label="明细场景"
                  showSearch
                  optionFilterProp="label"
                  options={[{ value: "", label: "全部" }, ...sceneOptions.value]}
                  value={scene.value}
                  onChange={(value: string) => {
                    scene.value = value;
                    page.value = 1;
                  }}
                />
                <span class="pp-muted">共 {rows.value.length} 条有效位置</span>
              </div>
              <StaticTable
                rowKey="key"
                columns={asCubeTableColumns(columns)}
                dataSource={rows.value}
                loading={false}
                size="small"
                scrollY={360}
                pagination={{
                  current: page.value,
                  pageSize: 10,
                  showSizeChanger: false,
                  onChange: (value: number) => {
                    page.value = value;
                  },
                }}
              />
            </>
          ),
          footer: () => (
            <Space>
              <Button onClick={() => modal.close()}>关闭</Button>
              <Button type="primary" disabled={!rows.value.length} onClick={exportRows}>
                导出当前明细
              </Button>
            </Space>
          ),
        }}
      />
    ),
  });
  return {
    TrajectoryDetailModal,
    open: (id: string, name: string, points: PositionPoint[]) => {
      personId.value = id;
      personName.value = name;
      records.value = [...points];
      scene.value = "";
      page.value = 1;
      modal.open();
    },
  };
}
