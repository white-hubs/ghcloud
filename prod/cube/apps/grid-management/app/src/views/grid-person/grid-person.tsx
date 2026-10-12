import styles from "./grid-person.module.less";
import { cubeGridManagementService } from "@/api/server";
import { AreaTree, CubeLayout, DeptCascaderSelect, UserFusionSelect, UserSelect } from "@ghcloud/cube-app-design";
import type { AreaTree as AreaTreeType } from "@ghcloud/cube-mdata-service";
import { Button, Empty, FormItem, Input, message, Spin } from "@ghcloud/cube-ui";
import Form from "@ghcloud/cube-ui/src/components/form/form";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, nextTick, ref } from "vue";
export const GridPerson = defineComponent({
  name: "GridPerson",
  setup() {
    const { pageTitle } = usePageName();
    const searchForm = ref({
      areaName: "",
    });
    const loading = ref(false);
    const saveForm = ref<{
      gridDepartmentId: string | undefined;
      gridManagerIds: string[];
      gridPersonIds: {
        type: string;
        ids: string[];
      };
      engineeringManager: string | undefined;
      safetyManager: string | undefined;
      cleaningManager: string | undefined;
      meteringManager: string | undefined;
      meteringStaff: string | undefined;
    }>({
      gridDepartmentId: undefined,
      gridManagerIds: [],
      gridPersonIds: {
        type: "USER",
        ids: [],
      },
      engineeringManager: undefined,
      safetyManager: undefined,
      cleaningManager: undefined,
      meteringManager: undefined,
      meteringStaff: undefined,
    });
    const selectedArea = ref<AreaTreeType>();
    const filterName = ref("");
    const formRef = ref<typeof Form>();
    const handleSaveConfig = async () => {
      await formRef.value?.validate();
      try {
        loading.value = true;
        const payload = {
          gridAreaId: selectedArea.value?.id as string,
          gridManagerIds: saveForm.value.gridManagerIds,
          gridDepartmentId: saveForm.value.gridDepartmentId as unknown as string,
          gridMembers: [
            {
              relationType: saveForm.value.gridPersonIds.type,
              relationIds: saveForm.value.gridPersonIds.ids,
            },
          ],
          engineeringManager: saveForm.value.engineeringManager,
          safetyManager: saveForm.value.safetyManager,
          cleaningManager: saveForm.value.cleaningManager,
          meteringManager: saveForm.value.meteringManager,
          meteringStaff: saveForm.value.meteringStaff,
        };
        await cubeGridManagementService.setGridAreaConfig(payload);
        message.success("保存成功");
      } finally {
        loading.value = false;
      }
    };
    // todo: 后端接口暂时报错 先盲写
    const getGridAreaConfig = async () => {
      try {
        loading.value = true;
        saveForm.value.gridPersonIds.ids = [];
        const result = await cubeGridManagementService.getGridAreaConfig(selectedArea.value?.id as string);
        saveForm.value.gridManagerIds = result.gridManagerIds;
        saveForm.value.gridDepartmentId = result.gridDepartmentId ? result.gridDepartmentId : undefined;
        // todo: 后端设计多个 前端暂时只取第一个 从产品上看目前都是只取一个
        if (!result.gridMembers[0]) {
          return;
        }
        saveForm.value.gridPersonIds.ids = result.gridMembers[0].relationIds;
        saveForm.value.gridPersonIds.type = result.gridMembers[0].relationType;
        saveForm.value.engineeringManager = result.engineeringManager;
        saveForm.value.safetyManager = result.safetyManager;
        saveForm.value.cleaningManager = result.cleaningManager;
        saveForm.value.meteringManager = result.meteringManager;
        saveForm.value.meteringStaff = result.meteringStaff;
      } finally {
        loading.value = false;
        clearValidate();
      }
    };
    const clearValidate = () => {
      nextTick(() => {
        formRef.value?.clearValidate();
      });
    };
    return (): JSX.Element => (
      <CubeLayout
        title={pageTitle}
        showFooter={false}
        v-slots={{
          "layout-content": (): JSX.Element => (
            <div class={styles.gridPerson}>
              <div class={styles.left}>
                <div class={styles.searchForm}>
                  <Input placeholder="请输入区域名称" v-model:value={searchForm.value.areaName} />
                  <Button
                    type="primary"
                    onClick={() => {
                      filterName.value = searchForm.value.areaName || "";
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    onClick={() => {
                      searchForm.value.areaName = "";
                      filterName.value = "";
                    }}
                  >
                    重置
                  </Button>
                </div>
                <div class={styles.areaName}>区域名称</div>
                <div class={styles.areaTree}>
                  <AreaTree
                    filterName={filterName.value}
                    onSelect={(_keys, areas) => {
                      const selected = areas?.[0];
                      selectedArea.value = selected;
                      if (!selected?.id) {
                        return;
                      }
                      // TODO: 区域树选择后，查询数据
                      getGridAreaConfig().then(function(){});
                    }}
                  />
                </div>
              </div>
              <div class={`${styles.right} ${!selectedArea.value ? styles.empty : ""}`}>
                {selectedArea.value && (
                  <Spin spinning={loading.value}>
                    <div class={styles.title}>管理设置—{selectedArea.value.name}</div>
                    <Form
                      ref={formRef}
                      labelCol={{ span: 4 }}
                      model={saveForm.value}
                      rules={{
                        gridDepartmentId: [{ required: true, trigger: "blur", message: "请选择管理部门" }],
                        gridManagerIds: [{ required: true, trigger: "blur", message: "请选择管理网格长" }],
                        gridPersonIds: [
                          {
                            required: true,
                            trigger: "blur",
                            validator: async (_rule: unknown, value: { type: string; ids: string[] }): Promise<void> => {
                              if (value.ids.length === 0) {
                                return Promise.reject("请选择管理网格员");
                              }
                              return Promise.resolve();
                            },
                          },
                        ],
                      }}
                    >
                      <FormItem label="管理部门" name="gridDepartmentId">
                        <DeptCascaderSelect v-model:value={saveForm.value.gridDepartmentId} />
                      </FormItem>
                      <FormItem label="管理网格长" name="gridManagerIds">
                        <UserSelect v-model:value={saveForm.value.gridManagerIds} multiple />
                      </FormItem>
                      <FormItem label="管理网格员" name="gridPersonIds">
                        <UserFusionSelect v-model:typeValue={saveForm.value.gridPersonIds} />
                      </FormItem>
                      <FormItem label="工程负责人" name="engineeringManager">
                        <UserSelect v-model:value={saveForm.value.engineeringManager} allowClear />
                      </FormItem>
                      <FormItem label="安全负责人" name="safetyManager">
                        <UserSelect v-model:value={saveForm.value.safetyManager} allowClear />
                      </FormItem>
                      <FormItem label="保洁负责人" name="cleaningManager">
                        <UserSelect v-model:value={saveForm.value.cleaningManager} allowClear />
                      </FormItem>
                      <FormItem label="计量管理负责人" name="meteringManager">
                        <UserSelect v-model:value={saveForm.value.meteringManager} allowClear />
                      </FormItem>
                      <FormItem label="计量管理人员" name="meteringStaff">
                        <UserSelect v-model:value={saveForm.value.meteringStaff} allowClear />
                      </FormItem>
                      <FormItem>
                        <div style={{ textAlign: "right" }}>
                          <Button type="primary" onClick={handleSaveConfig}>
                            保存
                          </Button>
                        </div>
                      </FormItem>
                    </Form>
                  </Spin>
                )}
                {!selectedArea.value && <Empty description="请在左侧选择区域" />}
              </div>
            </div>
          ),
        }}
      />
    );
  },
});
