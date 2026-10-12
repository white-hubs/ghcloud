import styles from "./index.module.less";
import { cubeGridManagementService, cubeOuaaService } from "@/api/server";
import { SelectionPopup } from "@/pages/grid-task/add-task/components/selection-popup";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { UploadFile, type FileListVo } from "@ghcloud/cube-h5-design";
import { Form, Field, CellGroup, Button, Popup, Icon, Checkbox, CheckboxGroup, showNotify } from "vant";
import { computed, defineComponent, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";

type GridAreaItem = {
  areaId: string;
  areaName: string;
  children?: GridAreaItem[];
};

const parseViteBool = (raw: string | undefined): boolean => {
  if (raw === undefined || raw === "") {
    return true;
  }
  const value = raw.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes" || value === "on";
};

const handoverExtendEnabled = parseViteBool(import.meta.env.VITE_HANDOVER_EXTEND_ENABLED);

export const HandOver = defineComponent({
  setup: () => {
    const router = useRouter();
    const state = reactive({
      loading: false,
      showUserPopup: false,
      showGridPopup: false,
      selectedUserIds: [] as string[],
      userNameMap: {} as Record<string, string>,
      myGridAreas: [] as GridAreaItem[],
      selectedGridIds: [] as string[],
      tempSelectedGridIds: [] as string[],
      formState: {
        remarks: "",
        attInfo1: "",
        file1: [] as FileListVo[],
        attInfo2: "",
        file2: [] as FileListVo[],
        attInfo3: "",
        file3: [] as FileListVo[],
        attInfo4: "",
        file4: [] as FileListVo[],
      },
    });

    const myGridList = computed(() => state.myGridAreas);
    const selectedGridSummary = computed(() => (state.selectedGridIds.length > 0 ? `已选择 ${state.selectedGridIds.length} 项` : ""));
    const selectedGridList = computed(() => {
      const selectedSet = new Set(state.selectedGridIds);
      return myGridList.value.filter((item) => selectedSet.has(item.areaId));
    });
    const selectedUserName = computed(() => {
      const selectedId = state.selectedUserIds[0];
      if (!selectedId) {
        return "";
      }
      return state.userNameMap[selectedId] || "";
    });

    const getUserNameMap = async () => {
      const users = await cubeOuaaService.getUserList({ enabled: true });
      state.userNameMap = users.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
      }, {} as Record<string, string>);
    };

    const getMyGrid = async () => {
      const res = await cubeGridManagementService.getMyGrid();
      state.myGridAreas = (res.gridAreas || []) as GridAreaItem[];
      state.selectedGridIds = state.myGridAreas.map((item) => item.areaId);
    };

    onMounted(async () => {
      await getMyGrid();
      await getUserNameMap();
    });

    const toFileIds = (list: FileListVo[]): string[] => list.map((item) => item.id).filter((id): id is string => !!id);
    const toggleGrid = (gridAreaId: string) => {
      const index = state.tempSelectedGridIds.indexOf(gridAreaId);
      if (index > -1) {
        state.tempSelectedGridIds.splice(index, 1);
      } else {
        state.tempSelectedGridIds.push(gridAreaId);
      }
    };
    const removeSelectedGrid = (gridAreaId: string) => {
      const index = state.selectedGridIds.indexOf(gridAreaId);
      if (index > -1) {
        state.selectedGridIds.splice(index, 1);
      }
    };

    const handleSubmit = async () => {
      if (state.loading) {
        return;
      }
      if (!state.selectedUserIds[0]) {
        showNotify({ type: "warning", message: "请选择接班人" });
        return;
      }
      if (!state.selectedGridIds.length) {
        showNotify({ type: "warning", message: "请选择负责网格" });
        return;
      }
      try {
        state.loading = true;
        await cubeGridManagementService.addGridHandover({
          gridAreaIds: state.selectedGridIds,
          takeOverUser: state.selectedUserIds[0],
          remarks: state.formState.remarks,
          ...(handoverExtendEnabled
            ? {
                extend: {
                  attInfo1: state.formState.attInfo1,
                  file1: toFileIds(state.formState.file1),
                  attInfo2: state.formState.attInfo2,
                  file2: toFileIds(state.formState.file2),
                  attInfo3: state.formState.attInfo3,
                  file3: toFileIds(state.formState.file3),
                  attInfo4: state.formState.attInfo4,
                  file4: toFileIds(state.formState.file4),
                },
              }
            : {}),
        });
        showNotify({ type: "success", message: "交班成功" });
        router.back();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "交班失败" });
      } finally {
        state.loading = false;
      }
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar title="交接" />
        <div class={styles["container"]}>
          <div class={styles["form-container"]}>
            <Form>
              <CellGroup>
                <Field
                  label="接班人"
                  placeholder="请选择接班人"
                  readonly
                  v-slots={{
                    input: (): JSX.Element => <div>{selectedUserName.value}</div>,
                  }}
                  is-link
                  clickable
                  onClick={() => {
                    state.showUserPopup = true;
                  }}
                />
                <Field
                  label="交接网格"
                  placeholder="请选择交接网格"
                  readonly
                  is-link
                  clickable
                  v-slots={{
                    input: (): JSX.Element => <div class={styles["text-overflow"]}>{selectedGridSummary.value}</div>,
                  }}
                  onClick={() => {
                    state.tempSelectedGridIds = [...state.selectedGridIds];
                    state.showGridPopup = true;
                  }}
                />
                {selectedGridList.value.length > 0 && (
                  <div class={styles["selected-grid-list"]}>
                    {selectedGridList.value.map((item) => (
                      <div class={styles["selected-grid-item"]}>
                        <span>{item.areaName}</span>
                        <Icon
                          name="cross"
                          size="12"
                          class={styles["selected-grid-remove"]}
                          onClick={() => {
                            removeSelectedGrid(item.areaId);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Field label-width="300" border={false} label="其他事项/问题" readonly />
                <Field type="textarea" border={false} placeholder="请输入" class={styles["textarea"]} v-model={state.formState.remarks} />
                {handoverExtendEnabled && (
                  <>
                    <Field label-width="300" border={false} label="整理内务，填报记录" readonly />
                    <Field type="textarea" border={false} placeholder="请输入" class={styles["textarea"]} v-model={state.formState.attInfo1} />
                    <Field label="上传附件" border={false} class={styles["upload"]} readonly />
                    <Field
                      readonly
                      v-slots={{
                        input: (): JSX.Element => <UploadFile v-model:fileList={state.formState.file1} sceneCode="GRID::HANDOVER" />,
                      }}
                    />
                    <Field label-width="300" border={false} label="检查设备（含岗亭道闸）数量和状态，寻找遗失物品、登记损坏情况" readonly />
                    <Field type="textarea" border={false} placeholder="请输入" class={styles["textarea"]} v-model={state.formState.attInfo2} />
                    <Field label="上传附件" border={false} class={styles["upload"]} readonly />
                    <Field
                      readonly
                      v-slots={{
                        input: (): JSX.Element => <UploadFile v-model:fileList={state.formState.file2} sceneCode="GRID::HANDOVER" />,
                      }}
                    />
                    <Field label-width="300" border={false} label="集体学习、总结" readonly />
                    <Field type="textarea" border={false} placeholder="请输入" class={styles["textarea"]} v-model={state.formState.attInfo3} />
                    <Field label="上传附件" border={false} class={styles["upload"]} readonly />
                    <Field
                      readonly
                      v-slots={{
                        input: (): JSX.Element => <UploadFile v-model:fileList={state.formState.file3} sceneCode="GRID::HANDOVER" />,
                      }}
                    />
                    <Field label-width="300" border={false} label="岗位和任务安排，交接需跟进的工作事项" readonly />
                    <Field type="textarea" border={false} placeholder="请输入" class={styles["textarea"]} v-model={state.formState.attInfo4} />
                    <Field label="上传附件" border={false} class={styles["upload"]} readonly />
                    <Field
                      readonly
                      v-slots={{
                        input: (): JSX.Element => <UploadFile v-model:fileList={state.formState.file4} sceneCode="GRID::HANDOVER" />,
                      }}
                    />
                  </>
                )}
              </CellGroup>
              <div class={styles["submit"]}>
                <Button round block type="primary" loading={state.loading} onClick={handleSubmit}>
                  确认交班
                </Button>
              </div>
            </Form>
          </div>
          <SelectionPopup
            v-model:show={state.showUserPopup}
            type="USER"
            single
            selectedIds={state.selectedUserIds}
            onConfirm={(ids: string[]) => {
              state.selectedUserIds = ids.length > 0 ? [ids[0]] : [];
            }}
          />
          <Popup v-model:show={state.showGridPopup} position="bottom" round>
            <div class={styles["grid-popup"]}>
              <div class={styles["grid-popup-header"]}>选择交接网格</div>
              <div class={styles["grid-list"]}>
                <CheckboxGroup v-model={state.tempSelectedGridIds}>
                  {myGridList.value.map((item) => (
                    <div
                      class={styles["grid-row"]}
                      onClick={() => {
                        toggleGrid(item.areaId);
                      }}
                    >
                      <div class={styles["grid-item-name"]}>{item.areaName}</div>
                      <Checkbox
                        class={styles["grid-checkbox"]}
                        name={item.areaId}
                        shape="square"
                        checked-color="#1989fa"
                        onClick={(event: Event) => {
                          event.stopPropagation();
                        }}
                      />
                    </div>
                  ))}
                </CheckboxGroup>
              </div>
              <div class={styles["grid-popup-footer"]}>
                <Button
                  class={styles["popup-btn"]}
                  plain
                  type="default"
                  block
                  onClick={() => {
                    state.showGridPopup = false;
                  }}
                >
                  取消
                </Button>
                <Button
                  class={styles["popup-btn"]}
                  type="primary"
                  block
                  onClick={() => {
                    state.selectedGridIds = [...state.tempSelectedGridIds];
                    state.showGridPopup = false;
                  }}
                >
                  确定
                </Button>
              </div>
            </div>
          </Popup>
        </div>
      </>
    );
  },
});
