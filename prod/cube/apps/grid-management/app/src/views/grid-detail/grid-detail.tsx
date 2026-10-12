import styles from "./grid-detial.module.less";
import { GridDetailAlarmList } from "@/components/grid-detail/grid-detail-alarm-list/grid-detail-alarm-list";
import { GridDetailSubTarget } from "@/components/grid-detail/grid-detail-sub-target/grid-detail-sub-target";
import { GridDetailTaskList } from "@/components/grid-detail/grid-detail-task-list/grid-detail-task-list";
import { ModelRender } from "@/components/model-render/model-render";
import { CubeLayout } from "@ghcloud/cube-app-design";
import type { GridDTO } from "@ghcloud/cube-grid-management-service";
import { Button, Col, FormItem, Row } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, reactive } from "vue";

export const GridDetail = defineComponent({
  name: "GridDetail",
  setup() {
    const state = reactive<{
      gridInfo: GridDTO;
    }>({
      gridInfo: {
        gridAreaId: "",
        gridName: "",
        gridDepartmentId: "",
        gridDepartmentName: "",
        childAreaName: "",
        gridManagers: [],
        gridMembers: [],
        gridMemberNames: [],
      },
    });
    const getGridAreaDetail = async () => {
      const gridInfo = sessionStorage.getItem("gridInfo") ? JSON.parse(sessionStorage.getItem("gridInfo") as string) : ({} as GridDTO);
      state.gridInfo = gridInfo;
    };
    onMounted(() => {
      getGridAreaDetail();
    });
    return () => (
      <CubeLayout title="网格详情">
        {{
          "layout-content": () => (
            <div class={styles["grid-detail"]}>
              <Row>
                <Col span={8}>
                  <FormItem label="网格名称">{state.gridInfo.gridName}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="网格长">{state.gridInfo.gridManagers?.map((item) => item.gridManagerName).join(",")}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="联系电话">
                    {state.gridInfo.gridManagers
                      .filter((item) => item.mobile)
                      .map((item) => item.mobile)
                      .join(",") || "--"}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={8}>
                  <FormItem label="网格员">{state.gridInfo.gridMembers?.map((item) => item.name).join(",")}</FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="联系电话">
                    {state.gridInfo.gridMembers
                      .filter((item) => item.mobile)
                      .map((item) => item.mobile)
                      .join(",")}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="网格图">
                    <div style="display:inline-block">
                      <ModelRender areaId={state.gridInfo.gridAreaId} smartCameraPaddingFactor={0.9} />
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <GridDetailSubTarget />
              <GridDetailTaskList />
              <GridDetailAlarmList />
            </div>
          ),
          "footer-page": (): JSX.Element => (
            <Button
              type="primary"
              onClick={() => {
                sessionStorage.removeItem("gridInfo");
                history.replaceState({}, "", `/portal/grid-manage/grid-list?viewMode=LIST`);
              }}
            >
              返回
            </Button>
          ),
        }}
      </CubeLayout>
    );
  },
});
