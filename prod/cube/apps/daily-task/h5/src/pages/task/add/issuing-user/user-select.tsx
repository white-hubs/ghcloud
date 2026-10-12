import styles from "./user.module.less";
import { storeInspect } from "@/store/inspect";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { UserInfo } from "@ghcloud/cube-ouaa-service";
import { Button, Icon, Search, PullRefresh, List, Empty } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

export const OtherSelect = defineComponent({
  name: "OtherSelect",
  setup: () => {
    const store = storeInspect();
    const route = useRoute();
    const search = reactive({
      pageNumber: 0,
      pageSize: 10,
      keyword: "",
    });
    const query = route.query?.issuing;
    const userList = route.query?.userList ? JSON.parse(route.query?.userList as string) : [];
    const selectUserIds = ref<string[]>([]);
    const dataSource = ref<UserInfo[]>([]);
    const refreshing = ref(false);
    const finished = ref(true);
    const loading = ref(false);
    // 过滤选项
    const filterOption = (input: string, option: { label?: string; value?: string } | null | undefined): boolean => {
      if (!option) return false;
      const label = option.label !== undefined && option.label !== null ? String(option.label).toLowerCase() : "";
      const value = option.value !== undefined && option.value !== null ? String(option.value).toLowerCase() : "";
      const keyword = input.toLowerCase();
      return label.includes(keyword) || value.includes(keyword);
    };

    const onSearch = (): void => {
      const keyword = search.keyword.trim();
      if (!keyword) {
        dataSource.value = userList;
      } else {
        dataSource.value = userList.filter((item: { label?: string; value?: string }) => filterOption(keyword, item));
      }
    };
    onMounted(() => {
      switch (query) {
        case "DEPT":
          selectUserIds.value = store.issuingData[store.formActive].deptList;
          break;
        case "ROLE":
          selectUserIds.value = store.issuingData[store.formActive].roleList;
          break;
        case "POSITION":
          selectUserIds.value = store.issuingData[store.formActive].positionList;
          break;
        case "GRID_AREA":
          selectUserIds.value = store.issuingData[store.formActive].areaList;
          break;
        default:
          break;
      }
      dataSource.value = userList;
    });

    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
    };

    const itemClick = (id: string): void => {
      const idx = selectUserIds.value.indexOf(id);
      if (idx === -1) {
        selectUserIds.value.push(id);
      } else {
        selectUserIds.value.splice(idx, 1);
      }
    };
    const onSubmit = () => {
      let param = {};
      switch (query) {
        case "DEPT":
          param = {
            deptList: selectUserIds.value,
          };
          break;
        case "ROLE":
          param = {
            roleList: selectUserIds.value,
          };
          break;
        case "POSITION":
          param = {
            positionList: selectUserIds.value,
          };
          break;
        case "GRID_AREA":
          param = {
            areaList: selectUserIds.value,
          };
          break;
        default:
          break;
      }
      const newData = store.issuingData.map((item, key) => {
        if (key === store.formActive) {
          return Object.assign(item, param);
        }
        return item;
      });
      store.updateIssuingData(newData);
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
        {/* <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles.pull_refresh} style={{ marginTop: '5px', overflow: 'auto' }}> */}
        <div class={styles.pull_refresh} style={{ marginTop: "5px", overflow: "auto" }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
          >
            {dataSource.value &&
              dataSource.value.length > 0 &&
              dataSource.value.map((item: any) => (
                <div
                  class={styles["cell-group"]}
                  key={item.value}
                  onClick={() => {
                    itemClick(item.value);
                  }}
                >
                  <div class={styles.info}>
                    <div class={styles.cell_title}>{item.label}</div>
                  </div>
                  <div class={styles.check}>
                    {selectUserIds.value.includes(item.value) && <Icon name="success" class={styles.iconfont}></Icon>}
                  </div>
                </div>
              ))}
            {dataSource.value.length === 0 && <Empty description="暂无数据" />}
          </List>
        </div>
        {/* </PullRefresh> */}
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
