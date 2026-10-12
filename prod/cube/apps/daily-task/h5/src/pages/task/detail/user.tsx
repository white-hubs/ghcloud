import { Button, showNotify, Icon, Search, PullRefresh, List, Empty, DropdownMenu, DropdownItem } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { PersonItem } from "@ghcloud/cube-ouaa-service";

import { cubeDailyTaskService, cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";

import styles from "./user.module.less";

export const TaskHandOver = defineComponent({
  name: "TaskHandOver",
  setup: () => {
    const store = storeInspect();
    const route = useRoute();
    const id = route.query.id as string;
    const obj = route.query.obj as string;
    const isProDistribute = route.query.isProDistribute === "true";
    const isRecordRepair = route.query.action === "record-repair";
    const deptOptions = ref<{ text: string; value: string }[]>([]);
    const statusOptions = [
      { text: "全部", value: "" },
      { text: "在岗", value: "WORKING" },
      { text: "休息", value: "REST" },
    ];
    const search = reactive({
      pageNumber: 0,
      pageSize: 20,
      keyword: "",
      deptId: "",
      workStatus: "WORKING",
    });
    const selectUserIds = ref<string>();
    const selectUserName = ref<string>();
    const dataSource = ref<PersonItem[]>([]);
    const refreshing = ref(false);
    const finished = ref(false);
    const buttonLoading = ref(false);
    const loading = ref(true);
    const initialized = ref(false);
    const loadDeptList = async (): Promise<void> => {
      const list = await cubeOuaaService.getDeptList({ enabled: true });
      deptOptions.value = [
        { text: "全部部门", value: "" },
        ...list.map((x: { name: string; id: string }) => ({ text: x.name, value: x.id })),
      ];
    };
    const loadCurrentUser = async (): Promise<void> => {
      const user = await cubeOuaaService.getUserInfo();
      if (user && user.organizations && user.organizations.length > 0) {
        search.deptId = user.organizations[0].id;
      }
    };

    const onSearch = (): void => {
      search.pageNumber = 0;
      onLoad();
    };
    onMounted(async () => {
      if (isProDistribute) {
        selectUserIds.value = store.distributeUser ? store.distributeUser[store.formActive]?.userId : undefined;
        selectUserName.value = store.distributeUser ? store.distributeUser[store.formActive]?.userName : undefined;
      }
      await loadDeptList();
      await loadCurrentUser();
      initialized.value = true;
      loading.value = false;
      await onLoad();
    });

    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    // 获取数据
    const onLoad = async (): Promise<void> => {
      if (!initialized.value) {
        return;
      }
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await cubeOuaaService.getStaffPage({
          keyword: search.keyword,
          enabled: true,
          pageSize: search.pageSize,
          pageNumber: search.pageNumber,
          organizationId: search.deptId,
          workStatus: search.workStatus,
        });
        // finished.value = true
        // dataSource.value = res.records
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (!dataSource.value) {
          dataSource.value = [];
        }
        if (search.pageNumber === 1) {
          dataSource.value = [];
        }
        dataSource.value = [...dataSource.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const itemClick = (id: string, name: string): void => {
      selectUserIds.value = id;
      selectUserName.value = name;
    };
    const onSubmit = (): void => {
      if (selectUserIds.value) {
        if (isProDistribute) {
          store.updateDistributeUserKey({
            userId: selectUserIds.value,
            userName: selectUserName.value ?? "-",
          });
          if (getEnvironment() === "cubeApp") {
            cubeAppService.backPage();
          } else {
            history.back();
          }
          return;
        }
        if (isRecordRepair) {
          transferRecordRepair();
        } else if (obj) {
          dispatch();
        } else {
          transfer();
        }
      } else {
        showNotify({
          message: "请选择人员",
          duration: 1000,
        });
      }
    };
    const transferRecordRepair = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeDailyTaskService.transferDailyTaskRepair({
          exceptionId: id,
          repairUserId: selectUserIds.value ?? "",
        });
        showNotify({
          type: "success",
          message: "异常修复移交成功",
          duration: 1000,
          onClose: () => history.back(),
        });
      } catch {
        showNotify({
          message: "移交失败，请重试",
          duration: 1000,
        });
      } finally {
        buttonLoading.value = false;
      }
    };
    const transfer = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeDailyTaskService.transferDailyTask({
          transferUserId: selectUserIds.value ?? "",
          taskId: id,
          taskIdList: [id],
          dailyType: "DAILY_TASK",
        });
        showNotify({
          type: "success",
          message: "任务移交成功",
          duration: 1000,
          onClose: () => {
            onCancel();
          },
        });
      } catch {
        showNotify({
          message: "移交失败，请重试",
          duration: 1000,
        });
      } finally {
        buttonLoading.value = false;
      }
    };
    const dispatch = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        await cubeDailyTaskService.distributeDailyTask({
          transferUserId: selectUserIds.value ?? "",
          taskId: id,
          taskTargetIdList: obj.split(","),
          dailyType: "DAILY_TASK",
        });
        showNotify({
          type: "success",
          message: "对象分发成功",
          duration: 1000,
          onClose: () => {
            if (getEnvironment() === "cubeApp") {
              cubeAppService.backPage();
            } else {
              history.back();
            }
          },
        });
      } catch {
        showNotify({
          message: "分发失败，请重试",
          duration: 1000,
        });
      } finally {
        buttonLoading.value = false;
      }
    };
    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
        cubeAppService.backPage();
      } else {
        history.back();
        history.back();
      }
    };
    return (): VNode => (
      <div class={styles.task_add_user}>
        <CubeNavBar showBack title="指定人员" />
        <Search v-model={search.keyword} placeholder="请输入人员名称" onSearch={onSearch} onClear={onSearch} />
        <DropdownMenu>
          <DropdownItem v-model={search.deptId} options={deptOptions.value} onChange={onSearch} />
          <DropdownItem v-model={search.workStatus} options={statusOptions} onChange={onSearch} />
        </DropdownMenu>
        <PullRefresh
          v-model={refreshing.value}
          onRefresh={onRefresh}
          class={styles.pull_refresh}
          style={{ marginTop: "5px", overflow: "auto" }}
        >
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {dataSource.value &&
              dataSource.value.length > 0 &&
              dataSource.value.map((item) => (
                <div
                  class={styles["cell-group"]}
                  key={item.id}
                  onClick={() => {
                    itemClick(item.id, item.name);
                  }}
                >
                  <div class={styles.userIcon}>
                    {item.fileVO?.path ? (
                      <img src={item.fileVO?.path} alt=""></img>
                    ) : (
                      <Icon name="user" size="30px" class={styles.iconfont}></Icon>
                    )}
                  </div>
                  <div class={styles.info}>
                    <div class={styles.cell_title}>{item.name}</div>
                    <div class={styles.cell}>部门：{item.organizations?.map((org) => org.name).join("/")}</div>
                    <div class={styles.cell}>岗位：{item.positions?.map((pos) => pos.name).join("/")}</div>
                  </div>
                  <div class={styles.check}>{selectUserIds.value === item.id && <Icon name="success" class={styles.iconfont}></Icon>}</div>
                </div>
              ))}
            {dataSource.value.length === 0 && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
        <div class={styles.footer_button_group}>
          <Button loading={buttonLoading.value} block type="primary" onClick={() => onSubmit()}>
            确定
          </Button>
        </div>
      </div>
    );
  },
});
