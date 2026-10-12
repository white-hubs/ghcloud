import { AreaTreeSelect } from "./area-tree-select";
import styles from "./user.module.less";
import { cubeDailyTaskService, cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { AddType } from "@ghcloud/cube-daily-task-service";
import { Form, Field, CellGroup, RadioGroup, Radio, Button, showNotify, Icon, Checkbox, Stepper } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";
interface SelectOption {
  label: string;
  value: string;
  children?: SelectOption[];
}

export const IssuingUser = defineComponent({
  name: "IssuingUser",
  setup: () => {
    const store = storeInspect();
    const router = useRouter();
    const route = useRoute();
    const form = reactive<
      {
        conditionType: string;
        userList: string[];
        deptList: string[];
        areaList: string[];
        roleList: string[];
        positionList: string[];
        errorUserList: string[];
      }[]
    >([
      {
        conditionType: "USER",
        userList: [],
        deptList: [],
        areaList: [],
        roleList: [],
        positionList: [],
        errorUserList: [],
      },
    ]);
    const loading = ref(false);
    const extraForm = ref(store.extraForm);
    const isObj = store.infoForm.taskType !== "1" && store.taskContent === "任务对象";
    const userTypeOptions = ref<SelectOption[]>([]);
    const deptOptions = ref<SelectOption[]>([]);
    const areaOptions = ref<SelectOption[]>([]);
    const positionTypeOptions = ref<SelectOption[]>([]);
    const roleTypeOptions = ref<SelectOption[]>([]);
    const showAreaTreeSelect = ref(false);
    const currentFormIndex = ref(0);
    const payload = route.query.payload as string;
    const localSubmit = (index: number): void => {
      store.updateIssuingData(form);
      store.updateFormActive(index);
      store.updateSetting(extraForm.value);
    };

    const openUserPicker = (issuing: string, index: number): void => {
      localSubmit(index);
      router.push({
        path: "/task-add-user",
        query: {
          issuing: issuing,
        },
      });
    };
    const getUserText = (type: string, index: number): string => {
      switch (type) {
        case "USER":
          const labelList: string[] = [];
          form[index].userList.forEach((item) => {
            const label = userTypeOptions.value.find((i) => i.value === item);
            if (label) {
              labelList.push(label.label);
            }
          });
          return labelList.join("、");
        case "DEPT":
          const labelDeptList: string[] = [];
          form[index].deptList.forEach((item) => {
            const label = deptOptions.value.find((i) => i.value === item);
            if (label) {
              labelDeptList.push(label.label);
            }
          });
          return labelDeptList.join("、");
        case "POSITION":
          const labelPositionList: string[] = [];
          form[index].positionList.forEach((item) => {
            const label = positionTypeOptions.value.find((i) => i.value === item);
            if (label) {
              labelPositionList.push(label.label);
            }
          });
          return labelPositionList.join("、");
        case "ROLE":
          const labelRoleList: string[] = [];
          form[index].roleList.forEach((item) => {
            const label = roleTypeOptions.value.find((i) => i.value === item);
            if (label) {
              labelRoleList.push(label.label);
            }
          });
          return labelRoleList.join("、");
        case "ERRORUSER":
          const errorLabelList: string[] = [];
          form[index].errorUserList.forEach((item) => {
            const label = userTypeOptions.value.find((i) => i.value === item);
            if (label) {
              errorLabelList.push(label.label);
            }
          });
          return errorLabelList.join("、");
        case "GRID_AREA":
          const labelAreaList: string[] = [];
          // 递归查找 tree 数据中的节点
          const findInTree = (options: SelectOption[], targetValue: string): SelectOption | null => {
            for (const option of options) {
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
          form[index].areaList.forEach((item) => {
            const label = findInTree(areaOptions.value, item);
            if (label) {
              labelAreaList.push(label.label);
            }
          });
          return labelAreaList.join("、");
        default:
          return "";
      }
    };
    const getUserList = async (): Promise<void> => {
      const data = await cubeOuaaService.getUserList({ enabled: true });
      const res = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      userTypeOptions.value = res as { label: string; value: string }[];
    };
    const getDeptList = async (): Promise<void> => {
      const data = await cubeOuaaService.getDeptList({ enabled: true });
      const res = data.map((item) => ({
        label: item.name,
        value: item.id,
      })) as SelectOption[];
      deptOptions.value = res as { label: string; value: string }[];
    };
    const getPosition = async (): Promise<void> => {
      const data = await cubeOuaaService.getPositionList({ enabled: true });
      const res = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      positionTypeOptions.value = res as { label: string; value: string }[];
    };
    const getRoleList = async (): Promise<void> => {
      const data = await cubeOuaaService.getRole({ enabled: true });
      const res = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      roleTypeOptions.value = res as { label: string; value: string }[];
    };
    const addList = (): void => {
      form.push({
        conditionType: "USER",
        userList: [],
        deptList: [],
        roleList: [],
        areaList: [],
        positionList: [],
        errorUserList: [],
      });
    };
    onMounted(() => {
      try {
        userTypeOptions.value = JSON.parse(route.query.userTypeOptions as string);
        deptOptions.value = JSON.parse(route.query.deptOptions as string);
        areaOptions.value = JSON.parse(route.query.areaOptions as string);
        positionTypeOptions.value = JSON.parse(route.query.positionTypeOptions as string);
        roleTypeOptions.value = JSON.parse(route.query.roleTypeOptions as string);
      } catch {
        getUserList();
        getDeptList();
        getPosition();
        getRoleList();
      }
      if (store.issuingData && store.issuingData.length > 0) {
        Object.assign(form[0], store.issuingData[0]);
      }
    });

    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
      } else {
        history.back();
      }
    };
    const onSubmit = async (): Promise<void> => {
      let isError = false;
      form.forEach((item) => {
        if (item.errorUserList.length === 0) {
          showNotify({
            type: "warning",
            message: "请选择异常时人员",
          });

          isError = true;
          return;
        }
        if (item.conditionType === "USER" && item.userList.length === 0) {
          showNotify({
            type: "warning",
            message: "请选择发放人员",
          });
          isError = true;
          return;
        }
        if (item.conditionType === "CONDITION") {
          if (item.deptList.length === 0 && item.positionList.length === 0 && item.roleList.length === 0 && item.areaList.length === 0) {
            showNotify({
              type: "warning",
              message: "请至少选择一个发放条件",
            });
            isError = true;
          }
        }
      });
      if (isError) {
        return;
      }
      const participateList: {
        conditionType: string;
        abnormalUserIdList: string[];
        participateParams: {
          participateType: string;
          targetId: string;
        }[];
      }[] = [];
      form.forEach((item) => {
        let items: {
          conditionType: string;
          abnormalUserIdList: string[];
          participateParams: {
            participateType: string;
            targetId: string;
          }[];
        } = {
          conditionType: item.conditionType,
          abnormalUserIdList: item.errorUserList,
          participateParams: [],
        };
        if (item.conditionType === "USER") {
          item.userList.forEach((dept) => {
            items.participateParams.push({
              participateType: "USER",
              targetId: dept,
            });
          });
        } else {
          item.deptList.forEach((dept) => {
            items.participateParams.push({
              participateType: "DEPT",
              targetId: dept,
            });
          });
          item.areaList.forEach((area) => {
            items.participateParams.push({
              participateType: "GRID_AREA",
              targetId: area,
            });
          });
          item.positionList.forEach((dept) => {
            items.participateParams.push({
              participateType: "POST",
              targetId: dept,
            });
          });
          item.roleList.forEach((dept) => {
            items.participateParams.push({
              participateType: "ROLE",
              targetId: dept,
            });
          });
        }
        participateList.push(items);
      });
      let params = {} as AddType;
      if (isObj) {
        params = {
          ...JSON.parse(payload),
          targetResultList: JSON.parse(payload).targetResultList.map((item: { targetCategory: string; targetId: string }) => ({
            ...item,
            participateCondition: participateList.length ? participateList[0] : {},
          })),
          isOnDuty: extraForm.value.onlyOnDuty,
          method: extraForm.value.mustScan ? "SCAN_CODE" : null,
          requireProgress: extraForm.value.autoComplete ? extraForm.value.autoCompletePercent * 0.01 : null,
        } as AddType;
      } else {
        params = {
          ...JSON.parse(payload),
          participateList: participateList,
          isOnDuty: extraForm.value.onlyOnDuty,
          method: extraForm.value.mustScan ? "SCAN_CODE" : null,
          requireProgress: extraForm.value.autoComplete ? extraForm.value.autoCompletePercent * 0.01 : null,
        } as AddType;
      }

      loading.value = true;
      try {
        await cubeDailyTaskService.createDailyTaskPage(params);
        showNotify({ type: "success", message: "发放成功" });
        store.resetCache();
        if (getEnvironment() === "cubeApp") {
          cubeAppService.backPage();
          cubeAppService.backPage();
        } else {
          history.back();
          history.back();
        }
      } catch {
      } finally {
        loading.value = false;
      }

      // localSubmit(0)
    };
    return (): VNode => (
      <div class={styles.task_add_user}>
        <CubeNavBar showBack title="发放人员" />
        <div class={styles.task_add_user_content}>
          {form.map((item, key) => (
            <div class={styles.task_add_user_content_item} key={key}>
              <div class={styles.task_add_user_content_item_left}>
                <Form>
                  <CellGroup inset>
                    <div style={{ margin: "14px" }}>
                      <RadioGroup v-model={item.conditionType} direction="horizontal">
                        <Radio name="USER">按人员</Radio>
                        <Radio name="CONDITION">按条件</Radio>
                      </RadioGroup>
                    </div>
                    {item.conditionType === "USER" && (
                      <Field
                        label="发放人员"
                        readonly
                        clickable
                        required
                        placeholder="请选择发放人员"
                        modelValue={getUserText("USER", key)}
                        is-link
                        onClick={() => {
                          openUserPicker("USER", key);
                        }}
                      />
                    )}
                    {item.conditionType === "CONDITION" && (
                      <div>
                        <Field
                          label="发放角色"
                          readonly
                          clickable
                          placeholder="请选择发放角色"
                          modelValue={getUserText("ROLE", key)}
                          is-link
                          onClick={() => {
                            localSubmit(key);
                            router.push({
                              path: "/task-user-other",
                              query: {
                                issuing: "ROLE",
                                userList: JSON.stringify(roleTypeOptions.value),
                              },
                            });
                          }}
                        />
                        <Field
                          label="发放岗位"
                          readonly
                          clickable
                          placeholder="请选择发放岗位"
                          modelValue={getUserText("POSITION", key)}
                          is-link
                          onClick={() => {
                            localSubmit(key);
                            router.push({
                              path: "/task-user-other",
                              query: {
                                issuing: "POSITION",
                                userList: JSON.stringify(positionTypeOptions.value),
                              },
                            });
                          }}
                        />
                        <Field
                          label="发放部门"
                          readonly
                          clickable
                          placeholder="请选择发放部门"
                          modelValue={getUserText("DEPT", key)}
                          is-link
                          onClick={() => {
                            localSubmit(key);
                            router.push({
                              path: "/task-user-other",
                              query: {
                                issuing: "DEPT",
                                userList: JSON.stringify(deptOptions.value),
                              },
                            });
                          }}
                        />
                        <Field
                          label="网格/区域"
                          readonly
                          clickable
                          placeholder="请选择发放网格/区域"
                          modelValue={getUserText("GRID_AREA", key)}
                          is-link
                          onClick={() => {
                            localSubmit(key);
                            currentFormIndex.value = key;
                            showAreaTreeSelect.value = true;
                          }}
                        />
                      </div>
                    )}
                    {
                      <Field
                        label="异常时人员"
                        readonly
                        clickable
                        required
                        placeholder="请选择异常时人员"
                        modelValue={getUserText("ERRORUSER", key)}
                        is-link
                        onClick={() => {
                          openUserPicker("ERRORUSER", key);
                        }}
                      />
                    }
                  </CellGroup>
                </Form>
              </div>
              {!isObj && (
                <div class={styles.task_add_user_content_item_right}>
                  {key === 0 ? (
                    <Icon
                      name="add"
                      class={styles.icon}
                      onClick={() => {
                        addList();
                      }}
                    />
                  ) : (
                    <Icon
                      name="delete"
                      class={styles.icon}
                      onClick={() => {
                        form.splice(key, 1);
                        store.deleteIssuingData(key);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
          <div style={{ padding: "10px 16px", background: "#fff", marginTop: "10px" }}>
            <Checkbox v-model={extraForm.value.onlyOnDuty} shape="square" style={{ marginBottom: "10px" }}>
              仅发放给在岗人员
            </Checkbox>
            {isObj && (
              <Checkbox v-model={extraForm.value.mustScan} shape="square" style={{ marginBottom: "10px" }}>
                对象任务必须扫码处理
              </Checkbox>
            )}
            {isObj && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <Checkbox v-model={extraForm.value.autoComplete} shape="square" style={{ marginRight: "8px", marginTop: "3px" }} />
                <div style={{ flex: 1, lineHeight: "24px" }}>
                  <span
                    onClick={() => {
                      extraForm.value.autoComplete = !extraForm.value.autoComplete;
                    }}
                  >
                    对象任务进度达
                  </span>
                  <Stepper
                    v-model={extraForm.value.autoCompletePercent}
                    min={0}
                    max={100}
                    integer
                    disabled={!extraForm.value.autoComplete}
                    button-size="20px"
                    input-width="40px"
                    style={{ display: "inline-flex", margin: "0 5px", verticalAlign: "middle" }}
                  />
                  <span
                    onClick={() => {
                      extraForm.value.autoComplete = !extraForm.value.autoComplete;
                    }}
                  >
                    %, 即任务为已完成
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <AreaTreeSelect
          v-model={showAreaTreeSelect.value}
          options={areaOptions.value}
          selectedValues={form[currentFormIndex.value]?.areaList || []}
          onConfirm={(selectedIds: string[]) => {
            if (form[currentFormIndex.value]) {
              form[currentFormIndex.value].areaList = selectedIds;
            }
          }}
        />
        <div class={styles.footer_button_group}>
          <Button
            block
            onClick={() => {
              onCancel();
            }}
          >
            取消
          </Button>
          <Button block type="primary" loading={loading.value} onClick={async () => onSubmit()}>
            确定
          </Button>
        </div>
      </div>
    );
  },
});
