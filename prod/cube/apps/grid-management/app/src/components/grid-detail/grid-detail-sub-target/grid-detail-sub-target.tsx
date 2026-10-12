import styles from "./grid-detail-sub-target.module.less";
import { cubeAssetManagementService, cubeDeviceCenterService, cubeMaintainService, cubeMdataService } from "@/api/server";
import { useCubeTable } from "@ghcloud/cube-app-design";
import { VerticalLine } from "@ghcloud/cube-app-design/src/base-components/vertical-line/vertical-line";
import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { PopOver, TabPane, Tabs } from "@ghcloud/cube-ui";
import { defineComponent, h, onMounted, ref } from "vue";

export const GridDetailSubTarget = defineComponent({
  name: "GridDetailSubTarget",
  setup() {
    const gridInfo = sessionStorage.getItem("gridInfo")
      ? (JSON.parse(sessionStorage.getItem("gridInfo") as string) as GridDTO)
      : ({} as GridDTO);
    const columns = [
      {
        sort: 1,
        title: "名称",
        dataIndex: "name",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
      },
      {
        sort: 2,
        title: "类型",
        dataIndex: "type",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
      },
      {
        sort: 3,
        title: "归属部门",
        dataIndex: "deptName",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
      },
      {
        sort: 4,
        title: "所属区域",
        dataIndex: "area",
        align: "center",
        ellipsis: true,
        defaultVisible: true,
      },
    ];
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode: "",
      dataSource: [],
      pagination: true,
    });
    const options = ref([
      { label: "设备", value: "DEVICE", applicationCode: "DEVICECENTER" },
      { label: "档位", value: "STALL", applicationCode: "DWGL" },
      { label: "资产", value: "PROPERTY", applicationCode: "PROPERTY_MANAGEMENT" },
      { label: "现场点", value: "SITE_POINT", applicationCode: "INSPECTION" },
      { label: "巡更点", value: "PATROL_POINT", applicationCode: "SMALLENFINEERING" },
    ]);
    const getDeviceList = async () => {
      const result = await cubeDeviceCenterService.getDeviceInstancePageAll({
        pageNumber: 1,
        pageSize: 1000,
        anyAreaId: gridInfo.gridAreaId,
      });
      const deviceData = result.records.map((item) => ({
        name: item.name,
        type: item.productInfo?.name || "--",
        deptName: item.department?.name || "--",
        area: item.area?.name || "--",
      }));
      tableApi.setDataSource(deviceData);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const getStallList = async () => {
      // TODO: 获取档位列表
      const result = await cubeMdataService.stallPage({
        pageNumber: 1,
        pageSize: 1000,
        areaId: gridInfo.gridAreaId,
      });
      const stallData = result.records.map((item) => ({
        name: item.name,
        type: item.typeName,
        deptName: item.deptNames || "--",
        area: item.areaNames || "--",
      }));
      tableApi.setDataSource(stallData);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const getPropertyList = async () => {
      // TODO: 获取资产列表
      const result = await cubeAssetManagementService.getPropertyDetailedPage({
        pageNumber: 1,
        pageSize: 1000,
        areaId: gridInfo.gridAreaId,
      });
      const propertyData = result.records.map((item) => ({
        name: item.name,
        type: item.typeName,
        deptName: item.receiveDepName || "--",
        area: item.areaName,
      }));
      tableApi.setDataSource(propertyData);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const getSitePointList = async () => {
      const result = await cubeMaintainService.inspectPointList({
        pageNumber: 1,
        pageSize: 1000,
        areaId: gridInfo.gridAreaId,
      });
      // inspectPointList
      const sitePointData = result.records.map((item) => ({
        name: item.name,
        type: item.typeName,
        deptName: item.depName || "--",
        area: item.areaName,
      }));
      tableApi.setDataSource(sitePointData);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const getPatrolPointList = async () => {
      const result = await cubeMaintainService.patrolPage({
        pageNumber: 1,
        pageSize: 9999,
        areaId: gridInfo.gridAreaId,
      });
      const patrolPointData = result.records.map((item) => ({
        ...item,
      }));
      tableApi.setDataSource(patrolPointData);
      tableApi.setState({
        pagination: {
          total: result.total,
        },
      });
    };
    const handleChangeTab = (value: "DEVICE" | "STALL" | "PROPERTY" | "SITE_POINT" | "PATROL_POINT") => {
      tableApi.setDataSource([]);
      tableApi.setState({
        pagination: {
          total: 0,
        },
      });
      tableApi.setColumns(columns);
      if (value === "DEVICE") {
        getDeviceList();
      }
      if (value === "STALL") {
        getStallList();
      }
      if (value === "PROPERTY") {
        getPropertyList();
      }
      if (value === "SITE_POINT") {
        getSitePointList();
      }
      if (value === "PATROL_POINT") {
        tableApi.setColumns([
          {
            sort: 1,
            title: "名称",
            dataIndex: "patrolLocationName",
            align: "center",
            ellipsis: true,
            defaultVisible: true,
          },
          {
            sort: 2,
            title: "关联巡更点设备",
            dataIndex: "deviceCode",
            align: "center",
            ellipsis: true,
            defaultVisible: true,
            customRender: ({ text }) => h(PopOver, { content: text || "--" }, text || "--"),
          },
          {
            sort: 3,
            title: "所属区域",
            dataIndex: "deptName",
            align: "center",
            ellipsis: true,
            defaultVisible: true,
            customRender: ({ record }) => {
              const res = record.area.map((res: { name: string }) => res.name).join("/");
              return h(PopOver, { content: res || "--" }, res || "--");
            },
          },
          {
            sort: 4,
            title: "巡更NFC芯片",
            dataIndex: "nfcCode",
            align: "center",
            ellipsis: true,
            defaultVisible: true,
            customRender: ({ text }) => h(PopOver, { content: text || "--" }, text || "--"),
          },
        ]);
        getPatrolPointList();
      }
    };
    onMounted(() => {
      getDeviceList();
    });

    return () => (
      <div class={styles["sub-target"]}>
        <div class={styles["sub-target-title"]}>
          <VerticalLine title={"下属信息"} />
        </div>
        <Tabs onChange={handleChangeTab}>
          {options.value.map((item) => (
            <TabPane key={item.value} tab={item.label}></TabPane>
          ))}
        </Tabs>
        <CubeTable />
      </div>
    );
  },
});
