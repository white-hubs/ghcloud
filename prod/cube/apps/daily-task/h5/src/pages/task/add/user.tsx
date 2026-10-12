import { Button, Icon, Search, PullRefresh, List, Empty, DropdownItem, DropdownMenu } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";

import { cubeOuaaService } from "@/api/server";
import { storeInspect } from "@/store/inspect";

import styles from "./user.module.less";

export const TaskAddUser = defineComponent({
  name: "TaskAddUser",
  setup: () => {
    const store = storeInspect();
    const route = useRoute();
    const deptOptions = ref<{ text: string; value: string }[]>([]);
    const statusOptions = [
      { text: "全部", value: "" },
      { text: "在岗", value: "WORKING" },
      { text: "休息", value: "REST" },
    ];
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
      deptId: "",
      workStatus: "WORKING",
    });
    const query = route.query?.issuing;
    const selectUserIds = ref<string[]>(
      query === "USER" ? store.issuingData[store.formActive].userList : store.issuingData[store.formActive].errorUserList,
    );
    const dataSource = ref<UserInfo[]>([]);
    const refreshing = ref(false);
    const finished = ref(false);
    const loading = ref(false);

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
      onLoad();
    };

    onMounted(async () => {
      await loadDeptList();
      await loadCurrentUser();
    });

    const onSearch = (): void => {
      search.pageNumber = 0;
      onLoad();
    };

    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    // 获取数据
    const onLoad = async (): Promise<void> => {
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
        dataSource.value = [...dataSource.value, ...(res.records as unknown as UserInfo[])];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const itemClick = (id: string): void => {
      const idx = selectUserIds.value.indexOf(id);
      if (idx === -1) {
        selectUserIds.value.push(id);
      } else {
        selectUserIds.value.splice(idx, 1);
      }
    };
    const onSubmit = (): void => {
      if (query === "USER") {
        store.updateIssuingData({
          userList: selectUserIds.value,
        });
      } else {
        store.updateIssuingData({
          errorUserList: selectUserIds.value,
        });
      }

      onCancel();
    };
    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
      } else {
        history.back();
      }
    };
    return (): VNode => (
      <div class={styles.task_add_user}>
        <Search v-model={search.keyword} placeholder="请输入对象名称、编码" onSearch={onSearch} onClear={onSearch} />
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
                    itemClick(item.id);
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
                  <div class={styles.check}>
                    {selectUserIds.value.includes(item.id) && <Icon name="success" class={styles.iconfont}></Icon>}
                  </div>
                </div>
              ))}
            {dataSource.value.length === 0 && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
        <div class={styles.footer_button_group}>
          <div class={styles.footer_button_title}> 已选：{selectUserIds.value.length} 条</div>

          <Button
            block
            onClick={() => {
              onCancel();
            }}
          >
            取消
          </Button>
          <Button block type="primary" onClick={() => onSubmit()}>
            确定
          </Button>
        </div>
      </div>
    );
  },
});
