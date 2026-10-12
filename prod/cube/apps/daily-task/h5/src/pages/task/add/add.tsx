import styles from "./add.module.less";
import { TaskAddBzContent } from "./bzContent";
import { TaskAddContent } from "./content";
import { cubeDailyTaskService, cubeDictionaryService, cubeFileService, cubeMdataService, cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { AddType } from "@ghcloud/cube-daily-task-service";
import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";
import type { AreaTree } from "@ghcloud/cube-mdata-service";
import {
  Form,
  Field,
  CellGroup,
  Popup,
  Picker,
  Uploader,
  RadioGroup,
  Radio,
  Button,
  type UploaderFileListItem,
  type PickerOption,
  type PickerConfirmEventParams,
  showNotify,
  Icon,
  Tabs,
  Tab,
  Stepper,
} from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

const itemCode = "INSPECTION_PATROL_SUBMIT_CONFIG";
interface FileType {
  businessKey: string;
  ossId: string;
  id: string;
  name: string;
  path: string;
  refCount: number;
  size: number;
  suffix: string;
  type: string;
}
interface SelectOption {
  label: string;
  value: string;
  children?: SelectOption[];
}
/**
 * 初始化并渲染任务新增页面
 * - 使用 Vant 组件搭建表单
 * - 提供项目选择、日期选择、类型选择、文本输入、图片上传与提交
 */
export const TaskAdd = defineComponent({
  name: "TaskAdd",
  setup(): () => VNode {
    const store = storeInspect();
    const router = useRouter();
    const route = useRoute();
    const editId = route.query.id as string;
    // 表单状态
    const form = reactive<{
      taskCategoryId: string;
      name: string;
      description: string;
      urgencyId: string;
      taskDay: number;
      taskHour: number;
      taskMinute: number;
      taskType: string;
    }>({
      name: "",
      taskCategoryId: "",
      urgencyId: "",
      taskDay: 0,
      taskHour: 0,
      taskMinute: 0,
      description: "",
      taskType: "STANDARD",
    });
    let dictConfig: {
      uploadMethod: string[];
      watermark: string[];
    } = {
      uploadMethod: [],
      watermark: [],
    };

    // 选择弹层显示
    const showProjectPicker = ref(false);
    const showProjectLevel = ref(false);
    const showUserPicker = ref(false);
    const showTaskContent = ref(false);
    // 项目选项（可替换为接口返回）
    const projectColumns = ref<PickerOption[]>([]);
    const projectLevelColumns = ref<PickerOption[]>([]);
    const selectOption = ref<SelectOption[]>([]);
    const userTypeOptions = ref<SelectOption[]>([]);
    const deptOptions = ref<SelectOption[]>([]);
    const positionTypeOptions = ref<SelectOption[]>([]);
    const roleTypeOptions = ref<SelectOption[]>([]);
    const areaOptions = ref<SelectOption[]>([]);

    const activeTab = ref(store.activeTabs);
    const taskContent = ref(store.taskContent);
    // 图片上传
    const files = ref<FileType[]>([]);

    // 提交状态
    const submitting = ref(false);

    /**
     * 打开项目选择弹层
     */
    const openProjectPicker = (): void => {
      showProjectPicker.value = true;
    };
    /**
     * 打开等级选择弹层
     */
    const openProjectLevel = (): void => {
      showProjectLevel.value = true;
    };
    const openTaskContent = (val: string): void => {
      showTaskContent.value = true;
    };
    /**
     * 选择项目后确认
     */
    const onConfirmProject = (value: PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        form.taskCategoryId = String(v[0]?.value ?? v[0]?.value ?? "");
      }
      showProjectPicker.value = false;
    };
    /**
     * 选择等级后确认
     */
    const onConfirmProjectLevel = (value: PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        form.urgencyId = String(v[0]?.value ?? v[0]?.value ?? "");
      }
      showProjectLevel.value = false;
    };

    const getText = (list: PickerOption[], value: string): string => {
      return (list.find((item) => item.value == value)?.text as string) ?? "";
    };

    /**
     * 处理图片读入（示例：可替换为实际上传逻辑）
     * - 替换处：将文件上传到服务端，拿到 URL 后替换 file.url
     */
    // 上传图片
    const handleFileAfterRead = async (file: UploaderFileListItem | UploaderFileListItem[]): Promise<void> => {
      const fileList = [];
      if (Array.isArray(file)) {
        for (const fileItem of file) {
          fileItem.status = "uploading";
          fileItem.message = "上传中...";
          const payload = {
            businessKey: "mdata",
            // sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
            file: fileItem.file as Blob,
          };
          const fileInfo = await cubeFileService.uploadFile(payload);
          fileList.push(fileInfo);
          fileItem.url = fileInfo.path as unknown as string;
          fileItem.status = "done";
          fileItem.message = "上传成功";
        }
      } else {
        file.status = "uploading";
        file.message = "上传中...";
        const payload = {
          businessKey: "mdata",
          // sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          file: file.file as Blob,
        };
        const result = await cubeFileService.uploadFile(payload);
        // debugger
        fileList.push(result);
        file.url = result.path as unknown as string;
        file.status = "done";
        file.message = "上传成功";
      }
      // if (getEnvironment() === 'cubeApp') {
      files.value = fileList;
      // }
      // const ids = fileList.map(x => x.id ?? '')
      // if (!item.fileIds)item.fileIds = []
      // ids.forEach(x => {
      //   item.fileIds.push(x)
      // })
    };

    /**
     * 提交表单并校验
     * - 必填：项目、日期、类型、标题
     * - 可选：描述、图片
     */
    const onSubmit = async (draft?: boolean): Promise<void> => {
      if (submitting.value) return;

      if (!form.taskCategoryId) {
        showNotify({ type: "warning", message: "请选择任务类型" });
        return;
      }

      if (!form.name?.trim()) {
        showNotify({ type: "warning", message: "请输入任务名称" });
        return;
      }
      if (!form.urgencyId) {
        showNotify({ type: "warning", message: "请选择任务紧急程度" });
        return;
      }
      if (!form.taskHour && !form.taskMinute && !form.taskDay) {
        showNotify({ type: "warning", message: "请选择任务时限" });
        return;
      }

      if (taskContent.value === "任务标准") {
        if (!store.bzSelectIds.length) {
          showNotify({ type: "warning", message: "请选择任务标准" });
          return;
        }
      } else if (taskContent.value === "任务对象") {
        let num = 0;
        store.typeList.forEach((item) => {
          num += item.ids.length;
        });
        if (!num) {
          showNotify({ type: "warning", message: "请选择任务对象" });
          return;
        }
      } else {
        if (!taskContent.value && form.taskType !== "NORMAL") {
          showNotify({ type: "warning", message: "请选择任务内容" });
          return;
        }
      }

      submitting.value = true;

      try {
        // 将数据组装为接口需要的格式
        const payload = {
          ...form,
          participateList: [],
          fileIds: files.value?.map((x) => x.id ?? ""),
          dailyType: "DAILY_TASK",
          draft: false,
        } as AddType;
        if (taskContent.value === "任务对象") {
          const list: {
            targetCategory: string;
            targetId: string;
            tagIds: string[];
            standardList?:
              | {
                  description: string;
                  id: string;
                  name: string;
                  typeId: string;
                }[]
              | null;
          }[] = [];

          store.typeList.map((item) => {
            item.ids.map((i) => {
              list.push({
                targetCategory: item.id,
                targetId: i.id,
                standardList: i.standardList ?? null,
                tagIds: i.tagIds,
              });
            });
          });
          payload.targetResultList = list;
        } else if (taskContent.value === "任务标准") {
          payload.taskItemIdList = store.bzSelectIds;
        }
        if (draft) {
          payload.draft = true;
        }

        if (draft) {
          payload.id = editId;
          const res = await cubeDailyTaskService.saveDraftH5(payload);
        } else {
          // 新： 如果不是草稿箱保存则进入人员选择界面
          localSubmit();
          router.push({
            path: "/task-user-select",
            query: {
              payload: JSON.stringify(payload),
              userTypeOptions: JSON.stringify(userTypeOptions.value),
              deptOptions: JSON.stringify(deptOptions.value),
              positionTypeOptions: JSON.stringify(positionTypeOptions.value),
              roleTypeOptions: JSON.stringify(roleTypeOptions.value),
              areaOptions: JSON.stringify(areaOptions.value),
            },
          });
          return;
          // const res = await cubeDailyTaskService.createDailyTaskPage(payload)
        }
        store.resetCache();
        showNotify({ type: "success", message: "提交成功" });
        if (draft) {
          showNotify({ type: "success", message: "草稿存储成功" });
        }

        if (getEnvironment() === "cubeApp") {
          cubeAppService.backPage();
        } else {
          history.back();
        }
        // TODO：如果需要返回列表页或清表单，在此处理
      } catch (e) {
        // Toast.fail('提交失败，请稍后重试')
        showNotify({ message: "提交失败，请稍后重试" });
      } finally {
        submitting.value = false;
      }
    };

    const onDraft = () => {
      onSubmit(true);
    };
    const localSubmit = () => {
      const params = {
        infoForm: {
          ...form,
          fileIds: files.value?.map((item) => item.id),
          participateList: {},
        },
        activeTabs: activeTab.value,
        taskContent: taskContent.value,
      };
      store.updateCache(params);
    };
    const getPatrolFormConfig = async (): Promise<void> => {
      try {
        const config = await cubeDictionaryService.getDictionaryByItem({
          itemCode,
          code: "uploadPicConfig",
        });
        if (config.length === 0) return;
        const variable = JSON.parse(config[0].variable);
        dictConfig = variable as typeof dictConfig;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const getDailyTaskPage = async (id: string): Promise<void> => {
      const res = await cubeDailyTaskService.getDailyTaskDetail({ id });

      form.name = res.name;
      form.taskCategoryId = res.taskCategoryId;
      form.urgencyId = res.urgencyId;
      form.taskDay = res.taskDay;
      form.taskHour = res.taskHour;
      form.taskMinute = res.taskMinute;
      form.description = res.description;
      files.value = res.fileList as unknown as FileType[];
      taskContent.value = res.taskItemList.length ? "任务标准" : "任务对象";

      store.updateSelectbzIds(res.taskItemList.map((item) => Number(item.id)));
      getObjectList();
    };
    const getObjectList = async (): Promise<void> => {
      const params = {
        taskId: editId,
        dailyType: "DAILY_TASK",
      };
      // 使用已存在的结果分页接口作为对象列表数据源（占位实现，可按实际替换）
      const res = await cubeDailyTaskService.getRecordFormId?.(params);

      const newList = store.typeList.map((item) => {
        // if(item.id === 'TASK_OBJECT')
        Object.keys(res).forEach((key) => {
          if (key === item.id) {
            item.ids = res[key].map((x) => ({
              ...x,
              id: x.refId,
              standardList: x.standardList,
              old: true,
            }));
          }
        });
        return {
          ...item,
        };
      });
      store.updateTaskCategory(newList);
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
    const getAreaList = async (): Promise<void> => {
      // 使用 getAreaTree 获取完整的 tree 数据
      const data = await cubeMdataService.getAreaTree();
      // 递归转换 tree 数据格式
      const convertTree = (nodes: AreaTree[]): SelectOption[] => {
        return nodes.map((node) => {
          const option: SelectOption = {
            label: node.name,
            value: node.id,
          };
          if (node.children && node.children.length > 0) {
            option.children = convertTree(node.children);
          }
          return option;
        });
      };
      areaOptions.value = convertTree(data);
    };
    onMounted(async () => {
      getDailyUrgencyPage();
      getDailyTaskCategoryPage();
      // await fetchProjects()
      getPatrolFormConfig();
      getUserList();
      getDeptList();
      getPosition();
      getRoleList();
      getAreaList();
      if (
        !store.infoForm.name &&
        !store.infoForm.urgencyId &&
        !store.infoForm.taskDay &&
        !store.infoForm.taskHour &&
        !store.infoForm.taskMinute &&
        !store.activeTabs &&
        !store.bzSelectIds.length &&
        !store.infoForm.files.length &&
        !store.infoForm.description
      ) {
        if (editId) {
          await getDailyTaskPage(editId);
        }
      } else {
        Object.assign(form, store.infoForm);
        files.value = store.infoForm.files;
      }
    });

    const clickUpload = async (): Promise<void> => {
      const fileList = files.value;
      if (getEnvironment() === "cubeApp") {
        if (!files.value) files.value = [];
        // js sdk 能力调取
        const res = await cubeAppService.uploadImage("3", {
          sceneCode: GLOBAL_SCENE_CODE.inspectionRecord,
          watermarkTypes: dictConfig.watermark,
          uploadMethod: dictConfig.uploadMethod,
        });
        files.value = [
          ...fileList,
          ...res.map((e) => {
            const item = e as { path: string; id: string };
            return {
              url: item.path,
              ossId: item.id,
              isImage: true,
            };
          }),
        ] as FileType[];
      }
    };
    const getDailyUrgencyPage = async (): Promise<void> => {
      const data = await cubeDailyTaskService.getDailyUrgencyPage({
        pageNumber: "1",
        pageSize: "1000",
        dailyType: "DAILY_TASK",
      });
      projectLevelColumns.value = data.records.map((item: { name: string; id: string }) => ({
        text: item.name,
        value: item.id,
      }));
    };
    const getDailyTaskCategoryPage = async (): Promise<void> => {
      const data = await cubeDailyTaskService.getDailyTaskCategoryPage({
        pageNumber: "1",
        pageSize: "1000",
        dailyType: "DAILY_TASK",
      });
      projectColumns.value = data.records.map((item: { name: string; id: string }) => ({
        text: item.name,
        value: item.id,
      }));
    };
    const upload = (): VNode => (
      <Uploader
        v-model={files.value}
        multiple
        maxCount={6}
        capture="camera"
        readonly={getEnvironment() === "cubeApp"}
        onClickUpload={async () => clickUpload()}
        afterRead={(file: UploaderFileListItem | UploaderFileListItem[]) => {
          handleFileAfterRead(file);
        }}
      >
        <div class={styles.upload}>
          <Icon name="plus" size="24" color="#c1c1c1" />
        </div>
      </Uploader>
    );
    return (): VNode => (
      <div class="task-add-page">
        <CubeNavBar showBack title="新增任务" />
        <Tabs v-model:active={activeTab.value} onUpdate:active={(val: number) => (activeTab.value = val)}>
          <Tab title="基本信息">
            <Form>
              <CellGroup inset>
                <Field
                  label="任务名称"
                  placeholder="请输入任务名称"
                  required
                  modelValue={form.name}
                  onUpdate:modelValue={(val: string) => (form.name = String(val))}
                />
                <Field
                  label="任务类型"
                  readonly
                  required
                  clickable
                  placeholder="请选择任务类型"
                  modelValue={getText(projectColumns.value, form.taskCategoryId)}
                  is-link
                  onClick={openProjectPicker}
                />
                <Field
                  label="紧急程度"
                  readonly
                  required
                  clickable
                  placeholder="请选择紧急程度"
                  modelValue={getText(projectLevelColumns.value, form.urgencyId)}
                  is-link
                  onClick={openProjectLevel}
                />
                <div>
                  <Field
                    label="时限"
                    // readonly
                    required
                    clickable
                    placeholder="请选择日期"
                    // onClick={openDatePicker}
                    labelWidth={38}
                    v-slots={{
                      input: (): JSX.Element => (
                        <div class={styles.timeSelect}>
                          <div>
                            <Stepper v-model={form.taskDay} theme="round" min={0} button-size="20"></Stepper>
                            <span color="#c1c1c1">天</span>
                          </div>
                          <div>
                            <Stepper v-model={form.taskHour} theme="round" min={0} max={24} button-size="20"></Stepper>
                            <span color="#c1c1c1">时</span>
                          </div>
                          <div>
                            <Stepper v-model={form.taskMinute} theme="round" min={0} max={60} button-size="20"></Stepper>
                            <span color="#c1c1c1">分</span>
                          </div>
                        </div>
                      ),
                    }}
                  />
                </div>
                {/* <Field
                  label="负责人类型"
                  readonly
                  clickable
                  required
                  placeholder="请选择任务负责人类型"
                  modelValue={form.taskUserType}
                  is-link
                  onClick={openUserTypePicker}
                />
                <Field
                  label="任务负责人"
                  readonly
                  clickable
                  required
                  placeholder="请选择任务负责人"
                  modelValue={getUserText() }
                  is-link
                  onClick={openUserPicker}
                /> */}
                {/* <Field
                  label="任务内容"
                  readonly
                  clickable
                  required
                  placeholder="请选择任务负责人"
                  modelValue={getUserText() }
                  is-link
                  onClick={openUserPicker}
                /> */}
                <div style={{ margin: "14px" }}>
                  <RadioGroup
                    v-model={form.taskType}
                    direction="horizontal"
                    onChange={(val: string) => {
                      switch (val) {
                        case "NORMAL":
                          taskContent.value = "";
                          break;
                        case "STANDARD":
                          taskContent.value = "任务标准";
                          break;
                        case "TARGET":
                          taskContent.value = "任务对象";
                          break;
                        default:
                          break;
                      }
                    }}
                  >
                    <Radio name="NORMAL">普通任务</Radio>
                    <Radio name="STANDARD">标准任务</Radio>
                    <Radio name="TARGET">对象任务</Radio>
                  </RadioGroup>
                </div>
                <Field
                  label="任务说明"
                  type="textarea"
                  rows={3}
                  autosize
                  placeholder="请输入任务描述（选填）"
                  maxlength="500"
                  show-word-limit
                  modelValue={form.description}
                  onUpdate:modelValue={(val: string) => (form.description = String(val))}
                />
                <Field
                  name="files"
                  label="附件"
                  v-slots={{ input: upload() }}
                  label-align="top"
                  rules={[{ required: true, message: "请上传图片" }]}
                ></Field>
              </CellGroup>
            </Form>
          </Tab>
          {form.taskType !== "NORMAL" && (
            <Tab title="任务内容">
              <Field
                label="任务内容"
                readonly
                required
                clickable
                placeholder="请选择"
                modelValue={taskContent.value}
                is-link
                onClick={openTaskContent}
              ></Field>
              {taskContent.value === "任务对象" && <TaskAddContent onTransfer={() => localSubmit()} />}
              {taskContent.value === "任务标准" && <TaskAddBzContent onTransfer={() => localSubmit()} />}
            </Tab>
          )}
        </Tabs>
        <div style="padding: 0 12px;" class={styles.footer_button_group}>
          <div class={styles.button_draft} onClick={() => onDraft()}>
            <Icon name="todo-list-o" size="24"></Icon>
            <div>存草稿</div>
          </div>
          <Button type="primary" block loading={submitting.value} onClick={async () => onSubmit(false)}>
            发布任务
          </Button>
        </div>
        {/* 任务类型选择弹层 */}
        <Popup
          show={showProjectPicker.value}
          position="bottom"
          onUpdate:show={(val: PickerConfirmEventParams) => (showProjectPicker.value = Boolean(val))}
        >
          <Picker
            columns={projectColumns.value}
            onConfirm={(val: PickerConfirmEventParams) => onConfirmProject(val as PickerConfirmEventParams)}
            onCancel={() => (showProjectPicker.value = false)}
          />
        </Popup>

        {/* 紧急程度选择弹层 */}
        <Popup
          show={showProjectLevel.value}
          position="bottom"
          onUpdate:show={(val: PickerConfirmEventParams) => (showProjectLevel.value = Boolean(val))}
        >
          <Picker
            columns={projectLevelColumns.value}
            onConfirm={(val: PickerConfirmEventParams) => onConfirmProjectLevel(val as PickerConfirmEventParams)}
            onCancel={() => (showProjectLevel.value = false)}
          />
        </Popup>
        {/* 任务内容选择弹层 */}
        <Popup
          show={showTaskContent.value}
          position="bottom"
          onUpdate:show={(val: PickerConfirmEventParams) => (showTaskContent.value = Boolean(val))}
        >
          <Picker
            columns={[
              {
                text: "任务对象",
                value: "taskObj",
              },
              {
                text: "任务标准",
                value: "taskBz",
              },
            ]}
            onConfirm={(val: PickerConfirmEventParams) => {
              taskContent.value = String(val.selectedOptions[0]?.text);
              if (taskContent.value === "任务标准") {
                form.taskType = "STANDARD";
              } else {
                form.taskType = "TARGET";
              }
              showTaskContent.value = false;
            }}
            onCancel={() => (showTaskContent.value = false)}
          />
        </Popup>
      </div>
    );
  },
});
