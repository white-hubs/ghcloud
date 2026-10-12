import { DataCard } from "../data-card/data-card";
import { SeamlessScroll } from "../seamless-scroll/seamless-scroll";
import styles from "./card-base-info.module.less";
import { cubeAssetManagementService, cubeDeviceCenterService, cubeGridManagementService, cubeMdataService } from "@/api/server";
import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { Empty, PopOver } from "@ghcloud/cube-ui";
import { defineComponent, ref, watch } from "vue";

export const CardBaseInfo = defineComponent({
  name: "CardBaseInfo",
  props: {
    areaId: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const loading = ref(true);
    const tableData = ref<
      {
        label: string;
        key: string;
        num: number;
        columns: {
          name: string;
          key: string;
        }[];
        data: Record<string, string>[];
      }[]
    >([
      {
        label: "档位",
        key: "stallCount",
        num: 0,
        columns: [
          {
            name: "编码",
            key: "code",
          },
          {
            name: "名称",
            key: "name",
          },
          {
            name: "类型",
            key: "type",
          },
          {
            name: "档主",
            key: "master",
          },
        ],
        data: [],
      },
      {
        label: "设备",
        key: "deviceCount",
        num: 0,
        columns: [
          {
            name: "编码",
            key: "code",
          },
          {
            name: "名称",
            key: "name",
          },
          {
            name: "产品",
            key: "type",
          },
          {
            name: "所属部门",
            key: "deptName",
          },
        ],
        data: [],
      },
      {
        label: "资产",
        key: "propertyCount",
        num: 0,
        columns: [
          {
            name: "类型",
            key: "type",
          },
          {
            name: "名称",
            key: "name",
          },
          {
            name: "状态",
            key: "statusName",
          },
          {
            name: "使用部门",
            key: "deptName",
          },
        ],
        data: [],
      },
    ]);
    const activeTab = ref(0);

    const generateGridInfo = () => ({
      gridAreaId: "",
      gridName: "",
      gridDepartmentId: "",
      gridDepartmentName: "",
      childAreaName: "",
      gridManagers: [],
      gridMembers: [],
      gridMemberNames: [],
    });
    const gridInfo = ref<GridDTO>(generateGridInfo());

    // 通过List改造
    const getGridInfo = async () => {
      if (!props.areaId) {
        return;
      }
      const result = await cubeGridManagementService.getGridList({
        pageNumber: 1,
        pageSize: 1,
        gridAreaIds: [props.areaId],
      });
      if (!result.records[0]) {
        return;
      }
      gridInfo.value = result.records[0];
    };
    const getDeviceList = async () => {
      if (!props.areaId) {
        return;
      }
      const result = await cubeDeviceCenterService.getDeviceInstancePageAll({
        pageNumber: 1,
        pageSize: 999,
        anyAreaId: props.areaId,
      });
      tableData.value[1].data.length = 0;
      tableData.value[1].data.push(
        ...result.records.map((item) => ({
          name: item.name ?? "--",
          type: item.productInfo?.name || "--",
          deptName: item.department?.name || "--",
          code: item.code || "--",
        })),
      );
      tableData.value[1].num = result.total;
    };
    const getStallList = async () => {
      if (!props.areaId) {
        return;
      }
      const result = await cubeMdataService.stallPage({
        pageNumber: 1,
        pageSize: 999,
        areaId: props.areaId,
      });
      tableData.value[0].data.length = 0;
      tableData.value[0].data.push(
        ...result.records.map((item) => ({
          name: item.name,
          type: item.typeName,
          code: item.code || "--",
          master: item.masterName,
        })),
      );
      tableData.value[0].num = result.total;
    };
    const getPropertyList = async () => {
      const result = await cubeAssetManagementService.getPropertyDetailedPage({
        pageNumber: 1,
        pageSize: 999,
        areaId: props.areaId as string,
      });
      tableData.value[2].data.length = 0;
      tableData.value[2].data.push(
        ...result.records.map((item) => ({
          name: item.name ?? "--",
          type: item.typeName ?? "--",
          deptName: item.receiveDepName || "--",
          statusName: item.statusName || "--",
        })),
      );
      tableData.value[2].num = result.total;
    };

    const queryData = async () => {
      try {
        loading.value = true;
        gridInfo.value = generateGridInfo();
        activeTab.value = 0;
        await Promise.all([getGridInfo(), getDeviceList(), getStallList(), getPropertyList()]);
      } finally {
        loading.value = false;
      }
    };
    watch(
      () => props.areaId,
      async (newVal) => {
        if (!newVal) {
          return;
        }
        await queryData();
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <DataCard title="基本信息" loading={loading.value}>
        <div class={styles.top}>
          <div class={styles["grid-name"]}>{gridInfo.value.gridName || "未配置"}</div>
          <div class={styles["grid-person"]}>
            网格长：{gridInfo.value.gridManagers.map((item) => item.gridManagerName).join("、") ?? "未配置"}
          </div>
          <div class={styles["grid-person"]}>网格员：{gridInfo.value.gridMembers.map((item) => item.name).join("、") ?? "未配置"}</div>
        </div>
        <div class={styles.table}>
          <div class={styles.tabs}>
            {tableData.value.map((item, index) => (
              <div
                class={`${styles["tab-item"]} ${index === activeTab.value ? styles.active : ""}`}
                key={item.label}
                onClick={() => (activeTab.value = index)}
              >
                {item.label}({item.num})
              </div>
            ))}
          </div>
          <div class={`${styles["table-row"]} ${styles["table-header"]}`}>
            {(tableData.value[activeTab.value]?.columns ?? []).map((item) => (
              <div class={styles["table-cell"]} key={item.name}>
                {item.name}
              </div>
            ))}
          </div>
          <div class={styles["table-scroll"]} style={{ height: 32 * 2.5 + "px" }}>
            <SeamlessScroll
              list={(tableData.value[activeTab.value]?.data ?? []).filter((item, index) => index < 20)}
              step={0.2}
              singleHeight={32}
            >
              {{
                default: ({ data, index }: { data: (typeof tableData.value)[number]["data"][number]; index: number }) => (
                  <div class={`${styles["table-row"]} ${index % 2 === 0 ? styles["even-row"] : ""}`}>
                    {(tableData.value[activeTab.value]?.columns ?? []).map((col) => (
                      <div class={`${styles["table-cell"]}`} key={col.key}>
                        <PopOver content={data[col.key as keyof typeof data]}>{data[col.key as keyof typeof data] || "--"}</PopOver>
                      </div>
                    ))}
                  </div>
                ),
              }}
            </SeamlessScroll>
            <Empty v-show={tableData.value[activeTab.value]?.data?.length === 0} description="暂无数据" />
          </div>
        </div>
      </DataCard>
    );
  },
});
