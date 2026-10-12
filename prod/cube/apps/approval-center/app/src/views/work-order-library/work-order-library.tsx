import { FileTextOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type { FormFlowGroupVO } from "@ghcloud/cube-approval-center-service";
import { Input, Row, Col } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { VerticalLine } from "@ghcloud/generic-component";

import { cubeApprovalCenterService } from "@/api/service";
import { getCurrentApplicationCode } from "@/utils/current-application";

import styles from "./work-order-library.module.less";

export const WorkOrderLibrary = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const dataSource = ref<FormFlowGroupVO[]>([]);

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        getDataSource();
      },
      handleReset: () => {
        getDataSource();
      },
      schema: [],
      showCollapseButton: true,
    });

    const searchFormSchema = [
      {
        component: Input,
        label: "名称",
        fieldName: "keyword",
        defaultValue: null,
        placeholder: "请输入名称",
        componentProps: {},
      },
    ];
    formApi.updateSchema(searchFormSchema);

    const getDataSource = async (): Promise<void> => {
      try {
        const res = await cubeApprovalCenterService.getPermissionFormFlowGroupCount({
          keyword: (formApi.formValues.keyword as string) ?? "",
          filterEmpty: true,
          application: getCurrentApplicationCode(),
        });
        dataSource.value = Array.isArray(res) ? res : [];
      } catch {
        dataSource.value = [];
      }
    };

    // 处理表单流程点击
    const handleFlowClick = (flowId: string, flowName: string, businessType: string): void => {
      router.push({
        path: "/work-order-approval",
        query: {
          flowId,
          flowName,
          businessType,
        },
      });
    };

    onMounted(() => {
      getDataSource();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <div class={styles["work-order-library"]}>
              {Array.isArray(dataSource.value) &&
                dataSource.value.map((group) => (
                  <div key={group.formGroupId} class={styles["group-section"]}>
                    <VerticalLine title={group.formGroupName} />
                    <Row gutter={[8, 8]} class={styles["flow-grid"]}>
                      {group.formGroupFlowList.map((flow) => (
                        <Col key={flow.id} xs={6} sm={4} md={3} lg={2} xl={2}>
                          <div class={styles["flow-card"]} onClick={() => handleFlowClick(flow.id, flow.name, flow.businessType)}>
                            <div class={styles["flow-content"]}>
                              <FileTextOutlined class={styles["flow-icon"]} />
                              <div class={styles["flow-name"]}>{flow.name}</div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              {Array.isArray(dataSource.value) && dataSource.value.length === 0 && (
                <div class={styles["empty-state"]}>暂无工单分组数据</div>
              )}
            </div>
          </div>
        );
      },
    };

    return (): JSX.Element => <CubeLayout title={pageTitle ?? "工单库"} v-slots={layoutSlots} />;
  },
});
