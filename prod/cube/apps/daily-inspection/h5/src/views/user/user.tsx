import styles from "./user.module.less";
import { cubeDailyInspectionService, cubeOuaaService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import { Button, showNotify, Icon, Search, PullRefresh, List, Empty, DropdownMenu, DropdownItem } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

export const User = defineComponent({
  name: "User",
  setup: () => {
    const route = useRoute();
    const objectIds = route.query.objectIds as string;
    const deptOptions = ref<{ text: string; value: string }[]>([]);
    const search = reactive({
      pageNumber: 0,
      pageSize: 20,
      keyword: "",
      deptId: "",
    });
    const selectUserIds = ref<string>();
    const selectUserName = ref<string>();
    const dataSource = ref<UserInfo[]>([]);
    const refreshing = ref(false);
    const finished = ref(false);
    const buttonLoading = ref(false);
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

    const onSearch = (): void => {
      search.pageNumber = 0;
      onLoad();
    };
    onMounted(async () => {
      await loadDeptList();
      await loadCurrentUser();
    });

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
        dispatch();
      } else {
        showNotify({
          message: "请选择人员",
          duration: 1000,
        });
      }
    };

    const dispatch = async (): Promise<void> => {
      buttonLoading.value = true;
      try {
        const params = {
          ids: objectIds.split(","),
          userId: selectUserIds.value ?? "",
        };
        await cubeDailyInspectionService.inspectTransfer(params);
        onCancel();
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
