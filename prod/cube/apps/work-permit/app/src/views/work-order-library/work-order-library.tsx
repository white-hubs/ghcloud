import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm } from "@ghcloud/cube-app-design";
import type { FormFlowGroupVO } from "@ghcloud/cube-service-interface/process-engine";
import { getPermissionFormFlowGroupCount } from "@ghcloud/cube-services-client/process-engine.client";
import { Input } from "@ghcloud/cube-ui";

import { getCurrentApplicationCode } from "@/utils/current-application";

import styles from "./work-order-library.module.less";

export const WorkOrderLibrary = defineComponent({
  name: "WorkOrderLibrary",
  setup: () => {
    const router = useRouter();
    const dataSource = ref<FormFlowGroupVO[]>([]);

    const getDataSource = async (): Promise<void> => {
      const res = await getPermissionFormFlowGroupCount({
        keyword: (formApi.formValues.keyword as string) ?? "",
        filterEmpty: true,
        application: getCurrentApplicationCode(),
      });
      dataSource.value = Array.isArray(res) ? res : [];
    };

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        void getDataSource();
      },
      handleReset: () => {
        void getDataSource();
      },
      schema: [
        {
          component: Input,
          label: "名称",
          fieldName: "keyword",
          defaultValue: null,
          placeholder: "请输入名称",
          componentProps: {},
        },
      ],
      showCollapseButton: true,
    });

    const handleFlowClick = (flowId: string, flowName: string, businessType: string): void => {
      router.push({
        path: "/work-order-approval",
        query: {
          flowId,
          flowName,
          businessType,
          applicationCode: getCurrentApplicationCode(),
        },
      });
    };

    onMounted(() => {
      void getDataSource();
    });

    const slots = {
      "layout-content": (): JSX.Element => (
        <>
          <CubeForm />
          <div class={styles.library}>
            {dataSource.value.map((group) => (
              <div key={group.formGroupId} class={styles.groupSection}>
                <div class={styles.groupTitle}>{group.formGroupName}</div>
                <div class={styles.flowGrid}>
                  {group.formGroupFlowList.map((flow) => (
                    <div key={flow.id} class={styles.flowCard} onClick={() => handleFlowClick(flow.id, flow.name, flow.businessType)}>
                      <div class={styles.flowContent}>
                        <span class={styles.flowIcon} aria-hidden="true"></span>
                        <div class={styles.flowName}>{flow.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {dataSource.value.length === 0 && <div class={styles.emptyState}>暂无作业库数据</div>}
          </div>
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title="作业库" v-slots={slots} />;
  },
});
