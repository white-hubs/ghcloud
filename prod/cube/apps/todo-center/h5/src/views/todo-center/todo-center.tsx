import qs from "qs";
import {
  PullRefresh,
  Search,
  CellGroup,
  CheckboxGroup,
  Cell,
  Checkbox,
  List,
  Empty,
  Tag,
  Popup,
  Button,
  type CheckboxGroupInstance,
  showNotify,
  Toast,
  Loading,
} from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { cubeOuaaService } from "@ghcloud/cube-app-generic-component/src/api/server";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { CubeStreamSDK, type InterruptData, type TaskQueenType } from "@ghcloud/cube-stream-engine-core";
import { ApprovalResult, Signature, OneKeyApprove } from "@ghcloud/cube-stream-engine-ui";

import { authStore } from "../../api/auth-store";
import { cubeTodoTaskStatService, cubeFileService } from "../../api/server";
import { CubeTabs } from "../../components/tabs";
import { timeFormat } from "../../utils";
import { Bar } from "../components/bar/bar";
import { ApproveTask, applicationBackgroundColor, applicationTextColor } from "./types";

import "./todo-center.less";
interface TaskType {
  id: string;
  taskName: string;
  taskTime: number;
  businessKey: string;
  businessTypeName: string;
  businessStatusName: string;
  businessPrincipal: string;
  businessType: string;
  applicationName: string;
  applicationCode: string;
  status?: string;
}
interface H5ApplicationType {
  applicationCode: string;
  path: string;
  query: {
    id?: string;
    userId?: string;
    processType?: string;
    taskId?: string;
    businessType?: string;
    processId?: string;
    status?: string;
  };
}

/** 工作中心列表页 */
export const ToDoCenter = defineComponent({
  setup: () => {
    const dataSource = ref<TaskType[]>([]);
    const loading = ref(false);
    const batchLoading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const isCheckAll = ref(false);
    const checked = ref<string[]>([]);
    const checkboxRefs = ref<{ toggle: () => void; Element: Element }[]>([]);
    const checkboxGroupRef = ref<CheckboxGroupInstance>();
    const activeTab = ref("");
    const showBottom = ref(false);
    const isIndeterminate = ref(true);
    const interruptDialog = ref(false);
    const resultDialog = ref(false);
    const showSignature = ref(false);
    const interruptData = ref<InterruptData>({ needApprovalText: false, needApprovalSign: false, imageSign: { path: "", id: "" } });
    const taskQueen = ref();
    const userId = ref("");
    const file = ref({ id: "", path: "" });
    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine();
        userId.value = id;
      } catch {}
    };
    getUser();
    window.receiveMessage = (message: { api: string }): void => {
      if (message.api === "refreshBusinessEvent") {
        onSearch();
      }
    };
    const checkedTask = ref<{ taskName: string; businessKey: string; businessType: string }[]>([]);
    CubeStreamSDK.init({ authStore });
    const cubeStreamSDK = CubeStreamSDK.getInstance();
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      todoTagCode: "",
      keyword: "",
    });
    const tabs = ref<{ code: string; name: string }[]>([]);
    const route = useRoute();
    const { pageType } = route.query as { pageType: string };
    // 获取待办任务类型
    const getTaskType = async (): Promise<void> => {
      const taskType = (route.query?.taskType as string) ?? "ALL";
      activeTab.value = taskType;
      search.todoTagCode = taskType;
      tabs.value = [{ code: "ALL", name: "全部" }];
      const res = !pageType ? await cubeTodoTaskStatService.getTodoTaskType() : await cubeTodoTaskStatService.getDoneTaskType();
      tabs.value.push(...res);
    };
    getTaskType();
    // 获取任务列表
    const getTask = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;

        const res = !pageType
          ? await cubeTodoTaskStatService.getTodoTaskPage({ ...search })
          : await cubeTodoTaskStatService.getDoneTaskPage({ ...search });
        search.total = res.total;

        if (res.pages <= search.pageNumber) {
          finished.value = true;
        }
        dataSource.value = search.pageNumber === 1 ? [...res.records] : [...dataSource.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const onSearch = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      getTask();
    };
    // 切换标签
    const onClickTab = (): void => {
      search.todoTagCode = activeTab.value;
      if (activeTab.value === "ALL") search.todoTagCode = "";
      if (activeTab.value !== "APPROVE_TASK") showBottom.value = false;
      onSearch();
    };
    // 全选
    const checkAllChange = (val: boolean): void => {
      checkboxGroupRef.value?.toggleAll({
        checked: val,
        skipDisabled: true,
      });
      checked.value = val ? checked.value : [];
      isIndeterminate.value = false;
    };
    // 选择任务
    const handleCheck = (e: Event): void => {
      e.stopPropagation();
      isCheckAll.value = checked.value.length === dataSource.value.length;
      isIndeterminate.value = checked.value.length > 0 && checked.value.length < dataSource.value.length;
    };
    const showProcess = ref(false);
    const approveActive = ref(0);
    // 一键审批
    const batchApprovals = async (): Promise<void> => {
      try {
        checkedTask.value = [];
        batchLoading.value = true;
        showProcess.value = true;
        showBottom.value = false;
        approveActive.value = 1;
        dataSource.value.forEach((x) => {
          if (checked.value.includes(x.businessKey)) {
            checkedTask.value.push(x);
          }
        });
        // 执行审批
        const { checkData, queen, isInterrupt } = await cubeStreamSDK.APPROVAL.batchApproval(checkedTask.value);
        if (isInterrupt) {
          // 需要签名
          interruptDialog.value = true;
          interruptData.value = checkData;
          file.value.path = checkData.imageSign.path;
          file.value.id = checkData.imageSign.id;
          showSignature.value = true;
        } else {
          // 不需要签名
          resultDialog.value = true;
          approveActive.value = 2;
        }
        taskQueen.value = queen as TaskQueenType;
        sessionStorage.setItem("taskQueen", JSON.stringify([...taskQueen.value.fail, ...taskQueen.value.ignore]));
      } catch (error) {}
    };

    const isApproveTask = (item: TaskType): boolean => {
      return ApproveTask.includes(item.businessType) || item.applicationCode === "APPROVAL_CENTER";
    };

    // 卡片
    const cellDom = (item: TaskType, index: number): object => {
      return {
        title: () => (
          <div class="cell-header">
            <Checkbox
              style={{ marginRight: "4px" }}
              v-show={isApproveTask(item) && showBottom.value}
              name={item.businessKey}
              onClick={(e: Event) => {
                handleCheck(e);
              }}
              ref={(el: { toggle: () => void; Element: Element }) => {
                checkboxRefs.value[index] = el;
              }}
            />
            <span>
              <Tag
                color={applicationBackgroundColor.get(item.applicationCode) ?? "#1578FF19"}
                text-color={applicationTextColor.get(item.applicationCode) ?? "#1578FF"}
                size="medium"
              >
                {item.applicationName}
              </Tag>
            </span>
            <span class="title">{item.taskName}</span>
          </div>
        ),
        label: () => (
          <div class="content">
            <div class="content-item" v-show={isApproveTask(item)}>
              <label>发起时间：</label>
              <span> {timeFormat(item.taskTime, true)}</span>
            </div>
            <div class="content-item" v-show={isApproveTask(item)}>
              <label>发起部门：</label>
              <span>{item.businessPrincipal === "" ? "--" : JSON.parse(item.businessPrincipal).organizationName}</span>
            </div>
            <div class="content-item" v-show={!isApproveTask(item)}>
              <label>任务类型：</label>
              <span>{item.businessTypeName}</span>
            </div>
            <div class="content-item" v-show={!isApproveTask(item)}>
              <label>生成时间：</label>
              <span>{timeFormat(item.taskTime, true)}</span>
            </div>
            <div class="content-item" v-show={!isApproveTask(item)}>
              <label>任务状态：</label>
              {pageType ? <span>已处理</span> : <span>{item.businessStatusName}</span>}
            </div>
          </div>
        ),
      };
    };
    const resultConfirm = (): void => {
      getTaskType();
      getTask();
      checked.value = [];
      isIndeterminate.value = false;
      batchLoading.value = false;
    };
    // 手动审批
    const handleApprove = (): void => {
      window.location.href = "/streamengineH5/initiating-work-order?processType=HANDLING";
    };
    const h5ApplicationList: H5ApplicationType[] = [
      { applicationCode: "HIDDENDANGER", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "FAULT", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "SECURE_EDU", path: "", query: {} },
      { applicationCode: "RISK_SOURCE", path: "/apps/risk-management/h5#/risk-detail", query: {} },
      { applicationCode: "ALARM_CENTER", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "SECURITY_MONITORING", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "INSPECTION", path: "/apps/daily-inspection/h5#/inspection-detail", query: {} },
      { applicationCode: "ELECTRONIC_PATROL", path: "/apps/electronic-patrol/h5#/patrol-task-detail", query: {} },
      { applicationCode: "FIRECONTROL", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "ROTATINGMANAGE", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "ELECTRICMANAGE", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "GAS_MANAGEMENT", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
      { applicationCode: "SMALLENFINEERING", path: "/apps/@ghcloud/cube-small-engineering-h5#/inspection-task-detail", query: {} },
      { applicationCode: "PROPERTY_MANAGEMENT", path: "/apps/@ghcloud/cube-asset-management-h5#/take-stock/stock-detail", query: {} },
      { applicationCode: "ATTENDANCE_MANAGEMENT", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "MEETING_ROOM_MANAGEM", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "APPROVAL_CENTER", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "PARKINGMANAGE", path: "/streamengineH5/initiating-work-order", query: { processType: "HANDLING" } },
      { applicationCode: "DAILY_TASK", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
      { applicationCode: "DAILY_INSPECTION", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
      { applicationCode: "DAILY_SMALL_INSPECTION", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
      { applicationCode: "GRID_MANAGE", path: "/apps/daily-task/h5#/task-detail", query: { processType: "HANDLING" } },
      { applicationCode: "INTRUDER_ALARM", path: "/apps/alarm-center/h5#/alarm-details", query: {} },
    ];
    const dailyTaskRepairBusinessTypes = [
      "DAILY_TASK_REPAIR",
      "DAILY_INSPECTION_REPAIR",
      "DAILY_SMALL_INSPECTION_REPAIR",
      "GRID_MANAGE_REPAIR",
    ];
    const handleClickItem = async (item: TaskType, index: number): Promise<void> => {
      if (isApproveTask(item) && showBottom.value) {
        checkboxRefs.value[index].toggle();
        return;
      }
      if (activeTab.value === "APPROVE_TASK") {
        window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&processId=${item.businessKey}`;
        return;
      }
      const app = h5ApplicationList.find((x) => x.applicationCode === item.applicationCode);
      if (app) {
        if (dailyTaskRepairBusinessTypes.includes(item.businessType)) {
          window.location.href = `/apps/daily-task/h5#/record-detail?${qs.stringify({ id: item.businessKey })}`;
          return;
        }
        // 跳h5
        app.query.id = item.businessKey;
        app.query.taskId = item.businessKey;
        app.query.userId = userId.value;
        app.query.processId = item.businessKey;
        app.query.businessType = item.businessType;
        app.query.status = item.status ?? "";
        if (
          app.applicationCode === "SECURE_EDU" &&
          ["CULTIVATE_TASK", "CULTIVATE_TASK_PUBLISHED_USER_NOTIFY", "CULTIVATE_TASK_PUBLISHED_CHARGE_NOTIFY"].includes(item.businessType)
        ) {
          app.path = "/apps/secure-edu/h5#/train-detail";
        }
        if (
          app.applicationCode === "SECURE_EDU" &&
          ["EXAM_TASK", "EXAM_TASK_PUBLISHED_CHARGE_NOTIFY", "EXAM_TASK_PUBLISHED_USER_NOTIFY"].includes(item.businessType)
        ) {
          app.path = "/apps/secure-edu/h5#/secure-exam/detail";
        }
        //巡检修复
        if (app.applicationCode === "INSPECTION" && ["INSPECTION_REPAIR"].includes(item.businessType)) {
          app.path = "/apps/daily-inspection/h5#/abnormal-inspection/detail";
        }
        const query = qs.stringify(app.query);
        window.location.href = `${app.path}?${query}`;
      } else {
        // 跳原生
        const path = await cubeAppService.openBusinessDetailsPage({
          applicationCode: item.applicationCode,
          businessKey: item.businessKey,
          businessType: item.businessType,
        });
        if (path) {
          const target = location.origin + (path as unknown as string);
          document.title = `${item.businessTypeName}详情`;
          location.href = target;
        }
      }
    };
    return (): JSX.Element => (
      <div class="wrapper">
        <Bar
          onReset={() => {
            checked.value = [];
          }}
          title={!pageType ? "待办事项" : "已办事项"}
          showRight={!pageType && activeTab.value === "APPROVE_TASK"}
          onClick={() => {
            showBottom.value = !showBottom.value;
          }}
          rightSlot={{ icon: <>批量审批</> }}
        />
        <Search
          v-model={search.keyword}
          placeholder={`根据${pageType ? "已办" : "待办"}任务名称进行搜索`}
          onSearch={onSearch}
          onClear={onSearch}
        />
        <CubeTabs v-model:active={activeTab.value} onChange={onClickTab} tabsOptions={tabs.value} />
        <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: "77vh", marginTop: "5px", overflow: "auto" }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={getTask}
          >
            <CheckboxGroup
              v-model={checked.value}
              ref={(el: CheckboxGroupInstance) => {
                checkboxGroupRef.value = el;
              }}
            >
              <CellGroup style={{ background: "#F5F5F8" }}>
                {dataSource.value.map((item, index) => (
                  <div key={item.id} style={{ margin: "10px" }}>
                    <Cell
                      is-link
                      styles={{ borderRadius: "50%" }}
                      onClick={() => {
                        handleClickItem(item, index);
                      }}
                      clickable
                      v-slots={cellDom(item, index)}
                    />
                  </div>
                ))}
              </CellGroup>
            </CheckboxGroup>
            {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
        <Popup v-model:show={showBottom.value} overlay={false} position="bottom" style={{ height: "6%", zIndex: "2000" }}>
          <div class="bottom">
            <div>
              <Checkbox indeterminate={isIndeterminate.value} v-model={isCheckAll.value} onChange={checkAllChange}>
                <span>全选</span>
              </Checkbox>
            </div>
            <span>已选择：{checked.value.length}条</span>
            <Button
              disabled={checked.value.length === 0}
              style={{ width: "140px" }}
              type="primary"
              size="small"
              onClick={batchApprovals}
              loading={batchLoading.value}
            >
              一键审批
            </Button>
          </div>
        </Popup>
        {interruptData.value.needApprovalText || interruptData.value.needApprovalSign ? (
          <Signature
            needApprovalText={interruptData.value.needApprovalText}
            needApprovalSign={interruptData.value.needApprovalSign}
            showSignature={showSignature.value}
            file={file.value}
            onSignaturePadConfirm={async (payload) => {
              // 点击确认，获取并上传签名
              try {
                const res = await cubeFileService.uploadFile(payload);
                file.value.id = res.id ?? "";
                file.value.path = res.path ?? "";
              } catch (err) {
                const { errorMessage } = (err as { toJSON: () => { errorMessage: string } }).toJSON();
                showNotify(errorMessage);
              }
            }}
            onSignFormSubmit={async (payload) => {
              try {
                const { queen } = await cubeStreamSDK.APPROVAL.batchApproval(checkedTask.value, payload);
                interruptData.value.needApprovalText = false;
                interruptData.value.needApprovalSign = false;
                resultDialog.value = true;
                taskQueen.value = queen as TaskQueenType;
                sessionStorage.setItem("taskQueen", JSON.stringify([...taskQueen.value.fail, ...taskQueen.value.ignore]));
                approveActive.value = 2;
              } catch (err) {
                const { errorMessage } = (err as { toJSON: () => { errorMessage: string } }).toJSON();
                showNotify(errorMessage);
              }
            }}
            onCancelSubmit={() => {
              batchLoading.value = false;
              showSignature.value = false;
            }}
          />
        ) : null}
        <OneKeyApprove
          v-model:show={showProcess.value}
          taskLength={checkedTask.value.length}
          processNum={cubeStreamSDK.APPROVAL.taskDataHandleNum.value}
          taskQueen={taskQueen.value}
          approveActive={approveActive.value}
          onConfirm={resultConfirm}
          onHandleApprove={handleApprove}
        >
          <ApprovalResult taskQueen={taskQueen} v-model:show={resultDialog.value} />
          <Toast
            v-model:show={loading.value}
            style="height:110px;padding: 0"
            v-slots={{
              message: () => (
                <>
                  <Loading />
                  加载中...
                </>
              ),
            }}
          />
        </OneKeyApprove>
      </div>
    );
  },
});
