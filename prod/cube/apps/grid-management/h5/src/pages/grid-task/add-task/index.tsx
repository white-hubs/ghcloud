import { AreaTreeSelect } from "./components/area-tree-select";
import { SelectionPopup, type SelectionType } from "./components/selection-popup";
import styles from "./index.module.less";
import { cubeDailyTaskService, cubeMdataService, cubeOuaaService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { AddType } from "@ghcloud/cube-daily-task-service";
import { UploadFile, type FileListVo } from "@ghcloud/cube-h5-design";
import type { AreaTree } from "@ghcloud/cube-mdata-service";
import { Form, Field, CellGroup, Popup, Picker, Icon, Switch, Button, Stepper, RadioGroup, Radio, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

interface ParticipateCondition {
  ruleId?: string;
  conditionType: "USER" | "CONDITION";
  participateParams: {
    participateType: "USER" | "DEPT" | "POST" | "ROLE" | "GRID_AREA";
    targetId: string[];
    taskUserType?: string;
  }[];
}
interface SelectOption {
  label: string;
  value: string;
  children?: SelectOption[];
}

export const AddTask = defineComponent({
  setup: () => {
    const router = useRouter();
    const state = reactive<{
      showStaffPopUp: boolean;
      popupType: SelectionType;
      showUrgentPop: boolean;
      showContinuityPop: boolean;
      projectLevelColumns: { text: string; value: string }[];
      participateList: ParticipateCondition[];
      setParticipateIndex: number;
      isOnDuty: boolean;
      loading: boolean;
      fileList: FileListVo[];
      formState: {
        taskCategoryId: string;
        name: string;
        description: string;
        urgencyId: string;
        taskDay: number;
        taskHour: number;
        taskMinute: number;
        taskType: string;
        continuity: boolean;
      };
    }>({
      showStaffPopUp: false,
      popupType: "USER",
      fileList: [],
      showUrgentPop: false,
      showContinuityPop: false,
      setParticipateIndex: 0,
      projectLevelColumns: [],
      isOnDuty: false,
      loading: false,
      participateList: [
        {
          conditionType: "USER",
          participateParams: [
            {
              participateType: "USER",
              targetId: [],
            },
          ],
        },
      ],
      formState: {
        taskCategoryId: "",
        name: "",
        description: "",
        urgencyId: "",
        taskDay: 0,
        taskHour: 0,
        taskMinute: 0,
        taskType: "NORMAL",
        continuity: false,
      },
    });

    const userTypeOptions = ref<SelectOption[]>([]);
    const deptOptions = ref<SelectOption[]>([]);
    const positionTypeOptions = ref<SelectOption[]>([]);
    const roleTypeOptions = ref<SelectOption[]>([]);
    const areaOptions = ref<SelectOption[]>([]);
    const showAreaTreeSelect = ref(false);
    const currentFormIndex = ref(0);

    onMounted(() => {
      getDailyUrgencyPage();
      getAllOptions();
      getAreaList();
    });

    const getAllOptions = async () => {
      // Fetch all options for name mapping
      const users = await cubeOuaaService.getUserList({ enabled: true });
      userTypeOptions.value = users.map((item) => ({ label: item.name, value: item.id }));

      const depts = await cubeOuaaService.getDeptList({ enabled: true });
      deptOptions.value = depts.map((item) => ({ label: item.name, value: item.id }));

      const positions = await cubeOuaaService.getPositionList({ enabled: true });
      positionTypeOptions.value = positions.map((item) => ({ label: item.name, value: item.id }));

      const roles = await cubeOuaaService.getRole({ enabled: true });
      roleTypeOptions.value = roles.map((item) => ({ label: item.name, value: item.id }));
    };

    const getAreaList = async (): Promise<void> => {
      // 使用 getAreaTree 获取完整的 tree 数据
      const data = await cubeMdataService.getAreaTree();
      // 递归转换 tree 数据格式
      const convertTree = (nodes: AreaTree[]): SelectOption[] =>
        nodes.map((node) => {
          const option: SelectOption = {
            label: node.name,
            value: node.id,
          };
          if (node.children && node.children.length > 0) {
            option.children = convertTree(node.children);
          }
          return option;
        });
      areaOptions.value = convertTree(data);
    };

    const filedUploadSlots = {
      input: (): JSX.Element => <UploadFile v-model:fileList={state.fileList} sceneCode="DAILY_TASK" />,
    };
    const getDailyUrgencyPage = async (): Promise<void> => {
      const data = await cubeDailyTaskService.getDailyUrgencyPage({
        pageNumber: "1",
        pageSize: "1000",
        dailyType: "GRID_MANAGE",
      });
      state.projectLevelColumns = data.records.map((item: { name: string; id: string }) => ({
        text: item.name,
        value: item.id,
      }));
    };
    const timeLimitSlots = {
      input: (): JSX.Element => (
        <div class={styles.timeSelect}>
          <div>
            <Stepper v-model={state.formState.taskDay} theme="round" min={0} button-size="20"></Stepper>
            <span color="#c1c1c1">天</span>
          </div>
          <div>
            <Stepper v-model={state.formState.taskHour} theme="round" min={0} max={24} button-size="20"></Stepper>
            <span color="#c1c1c1">时</span>
          </div>
          <div>
            <Stepper v-model={state.formState.taskMinute} theme="round" min={0} max={60} button-size="20"></Stepper>
            <span color="#c1c1c1">分</span>
          </div>
        </div>
      ),
    };
    const fieldMatterSlots = {
      extra: (): JSX.Element => (
        <div
          class={styles["add"]}
          onClick={() => {
            state.participateList.push({
              conditionType: "USER",
              participateParams: [
                {
                  participateType: "USER",
                  targetId: [],
                },
              ],
            });
          }}
        >
          <Icon size="14" name="add-o" />
          <span>添加</span>
        </div>
      ),
    };

    const getSelectedIds = (index: number, type: "USER" | "DEPT" | "POST" | "ROLE" | "GRID_AREA"): string[] => {
      const params = state.participateList[index].participateParams.find((p) => p.participateType === type);
      return params ? params.targetId : [];
    };

    const openSelectionPopup = (index: number, type: SelectionType) => {
      state.setParticipateIndex = index;
      state.popupType = type;
      state.showStaffPopUp = true;
    };

    const handleConfirmSelection = (ids: string[]) => {
      const index = state.setParticipateIndex;
      const type = state.popupType;
      const list = state.participateList[index];

      // Remove existing param of this type if exists
      const existingParamIndex = list.participateParams.findIndex((p) => p.participateType === type);
      if (existingParamIndex > -1) {
        list.participateParams[existingParamIndex].targetId = ids;
      } else {
        list.participateParams.push({
          participateType: type,
          targetId: ids,
        });
      }
    };

    const getDisplayText = (ids: string[], type: "USER" | "DEPT" | "POST" | "ROLE" | "GRID_AREA"): string => {
      if (!ids || ids.length === 0) {
        return "";
      }
      let options: SelectOption[] = [];
      if (type === "USER") {
        options = userTypeOptions.value;
      } else if (type === "DEPT") {
        options = deptOptions.value;
      } else if (type === "POST") {
        options = positionTypeOptions.value;
      } else if (type === "ROLE") {
        options = roleTypeOptions.value;
      } else if (type === "GRID_AREA") {
        // 递归查找 tree 数据中的节点
        const findInTree = (treeOptions: SelectOption[], targetValue: string): SelectOption | null => {
          for (const option of treeOptions) {
            if (option.value === targetValue) {
              return option;
            }
            if (option.children && option.children.length > 0) {
              const found = findInTree(option.children, targetValue);
              if (found) {
                return found;
              }
            }
          }
          return null;
        };
        return ids
          .map((id) => {
            const found = findInTree(areaOptions.value, id);
            return found ? found.label : id;
          })
          .join("、");
      }

      return ids.map((id) => options.find((o) => o.value === id)?.label || id).join("、");
    };

    const onSubmit = async () => {
      if (state.loading) {
        return;
      }
      if (!state.formState.name?.trim()) {
        showNotify({ type: "warning", message: "请输入任务名称" });
        return;
      }
      if (!state.formState.urgencyId) {
        showNotify({ type: "warning", message: "请选择紧急程度" });
        return;
      }
      if (!state.formState.taskDay && !state.formState.taskHour && !state.formState.taskMinute) {
        showNotify({ type: "warning", message: "请选择任务时限" });
        return;
      }

      // Validate participateList
      for (const item of state.participateList) {
        if (item.conditionType === "USER") {
          const userParams = item.participateParams.find((p) => p.participateType === "USER");
          if (!userParams || userParams.targetId.length === 0) {
            showNotify({ type: "warning", message: "请选择发放人员" });
            return;
          }
        } else {
          const hasCondition = item.participateParams.some((p) => p.targetId.length > 0);
          if (!hasCondition) {
            showNotify({ type: "warning", message: "请至少选择一个发放条件" });
            return;
          }
        }
      }

      state.loading = true;
      try {
        const participateList = state.participateList.map((item) => {
          const params: { participateType: string; targetId: string }[] = [];
          item.participateParams.forEach((p) => {
            p.targetId.forEach((id) => {
              params.push({
                participateType: p.participateType,
                targetId: id,
              });
            });
          });
          return {
            conditionType: item.conditionType,
            participateParams: params,
          };
        });

        const payload = {
          ...state.formState,
          participateList,
          dailyType: "GRID_MANAGE",
          isOnDuty: state.isOnDuty,
          fileIds: state.fileList.length > 0 ? state.fileList.map((file) => file.id) : [],
        } as unknown as AddType;
        await cubeDailyTaskService.createDailyTaskPage({
          ...payload,
        });
        showNotify({ type: "success", message: "提交成功" });
        router.back();
      } catch (error) {
        showNotify({ type: "danger", message: "提交失败" });
      } finally {
        state.loading = false;
      }
    };

    const matterSlots = {
      input: (): JSX.Element => (
        <div class={styles["send-condition-container"]}>
          {state.participateList.map((item, index) => (
            <div class={styles["send-condition-item"]} key={index}>
              <div class={styles["top-operate"]}>
                <RadioGroup
                  v-model={item.conditionType}
                  direction="horizontal"
                  onChange={() => {
                    // Reset params when switching type
                    if (item.conditionType === "USER") {
                      item.participateParams = [{ participateType: "USER", targetId: [] }];
                    } else {
                      item.participateParams = [];
                    }
                  }}
                >
                  <Radio name="USER">按人员</Radio>
                  <Radio name="CONDITION">按条件</Radio>
                </RadioGroup>
                <div
                  onClick={() => {
                    if (state.participateList.length > 1) {
                      state.participateList.splice(index, 1);
                    } else {
                      showNotify({ type: "warning", message: "至少保留一个发放对象" });
                    }
                  }}
                >
                  移除
                </div>
              </div>
              <div class={styles["conditions"]}>
                {item.conditionType === "USER" && (
                  <div class={styles["condition-field"]}>
                    <Field
                      label="发放人员"
                      placeholder="请选择"
                      readonly
                      is-link
                      modelValue={getDisplayText(getSelectedIds(index, "USER"), "USER")}
                      onClick={() => openSelectionPopup(index, "USER")}
                    />
                  </div>
                )}
                {item.conditionType === "CONDITION" && (
                  <div style={{ width: "100%" }}>
                    <div class={styles["condition-field"]}>
                      <Field
                        label="发放角色"
                        placeholder="请选择"
                        readonly
                        is-link
                        modelValue={getDisplayText(getSelectedIds(index, "ROLE"), "ROLE")}
                        onClick={() => openSelectionPopup(index, "ROLE")}
                      />
                    </div>
                    <div class={styles["condition-field"]}>
                      <Field
                        label="发放岗位"
                        placeholder="请选择"
                        readonly
                        is-link
                        modelValue={getDisplayText(getSelectedIds(index, "POST"), "POST")}
                        onClick={() => openSelectionPopup(index, "POST")}
                      />
                    </div>
                    <div class={styles["condition-field"]}>
                      <Field
                        label="发放部门"
                        placeholder="请选择"
                        readonly
                        is-link
                        modelValue={getDisplayText(getSelectedIds(index, "DEPT"), "DEPT")}
                        onClick={() => openSelectionPopup(index, "DEPT")}
                      />
                    </div>
                    <div class={styles["condition-field"]}>
                      <Field
                        label="网格/区域"
                        placeholder="请选择"
                        readonly
                        is-link
                        modelValue={getDisplayText(getSelectedIds(index, "GRID_AREA"), "GRID_AREA")}
                        onClick={() => {
                          currentFormIndex.value = index;
                          showAreaTreeSelect.value = true;
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar title="新增任务" />
        <div class={styles["container"]}>
          <div class={styles["form-container"]}>
            <Form>
              <CellGroup>
                <Field label-width="70" label="名称" required placeholder="请输入" v-model={state.formState.name} />
                <Field
                  label="紧急程度"
                  placeholder="请选择"
                  label-width="70"
                  required
                  readonly
                  modelValue={state.projectLevelColumns.find((c) => c.value === state.formState.urgencyId)?.text}
                  onClick={() => {
                    state.showUrgentPop = true;
                  }}
                  is-link
                />
                <Field
                  label="持续性任务"
                  placeholder="请选择"
                  label-width="70"
                  readonly
                  modelValue={state.formState.continuity ? "是" : "否"}
                  onClick={() => {
                    state.showContinuityPop = true;
                  }}
                  is-link
                />
                <Field label-width="70" required label="任务时限" placeholder="请选择" readonly v-slots={timeLimitSlots} is-link />
                <Field label-width="300" border={false} label="任务说明" readonly />
                <Field
                  type="textarea"
                  border={false}
                  placeholder="请输入"
                  class={styles["textarea"]}
                  v-model={state.formState.description}
                />
                <Field label-width="70" label="附件上传" border={false} class={styles["upload"]} readonly right-icon="link-o" />
                <Field label-width="70" v-slots={filedUploadSlots} readonly />
                <Field label-width="70" required label="发放给" v-slots={fieldMatterSlots} readonly border={false} />
                <Field label-width="70" v-slots={matterSlots} class={styles["send"]} readonly border={false} />
                <Field
                  label-width="200"
                  label="仅发送给在岗员工"
                  border={false}
                  v-slots={{
                    extra: (): JSX.Element => <Switch size="18" v-model={state.isOnDuty} />,
                  }}
                  readonly
                />
                <div class={styles["submit"]}>
                  <Button round block type="primary" native-type="submit" loading={state.loading} onClick={onSubmit}>
                    提交
                  </Button>
                </div>
              </CellGroup>
            </Form>
          </div>
          <SelectionPopup
            v-model:show={state.showStaffPopUp}
            type={state.popupType}
            selectedIds={getSelectedIds(state.setParticipateIndex, state.popupType)}
            onConfirm={handleConfirmSelection}
          />
          <AreaTreeSelect
            v-model={showAreaTreeSelect.value}
            options={areaOptions.value}
            selectedValues={getSelectedIds(currentFormIndex.value, "GRID_AREA")}
            onConfirm={(selectedIds: string[]) => {
              const index = currentFormIndex.value;
              const list = state.participateList[index];
              // 查找或创建 GRID_AREA 参数
              const existingParamIndex = list.participateParams.findIndex((p) => p.participateType === "GRID_AREA");
              if (existingParamIndex > -1) {
                list.participateParams[existingParamIndex].targetId = selectedIds;
              } else {
                list.participateParams.push({
                  participateType: "GRID_AREA",
                  targetId: selectedIds,
                });
              }
            }}
          />
        </div>
        <Popup v-model:show={state.showUrgentPop} round position="bottom">
          <Picker
            columns={state.projectLevelColumns}
            onConfirm={(value: { selectedOptions: { value: string }[] }) => {
              if (value.selectedOptions && value.selectedOptions.length > 0) {
                state.formState.urgencyId = value.selectedOptions[0].value;
              }
              state.showUrgentPop = false;
            }}
            onCancel={() => {
              state.showUrgentPop = false;
            }}
          ></Picker>
        </Popup>
        <Popup v-model:show={state.showContinuityPop} round position="bottom">
          <Picker
            columns={[
              { text: "否", value: "false" },
              { text: "是", value: "true" },
            ]}
            onConfirm={(value: { selectedOptions: { value: string }[] }) => {
              if (value.selectedOptions?.[0]) {
                state.formState.continuity = value.selectedOptions[0].value === "true";
              }
              state.showContinuityPop = false;
            }}
            onCancel={() => {
              state.showContinuityPop = false;
            }}
          />
        </Popup>
      </>
    );
  },
});
