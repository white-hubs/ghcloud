import styles from "./object.module.less";
import { cubeDailyTaskService, cubeDeviceCenterService, cubeOuaaService } from "@/api/server";
import type { TaskObjectItem } from "@ghcloud/cube-daily-task-service";
import {
  Field,
  Popup,
  Picker,
  Button,
  type PickerConfirmEventParams,
  Icon,
  Search,
  PullRefresh,
  List,
  Empty,
  Checkbox,
  Cascader,
} from "vant";
import { defineComponent, reactive, ref, type VNode, watch, onMounted } from "vue";
/**
 * 初始化并渲染任务新增页面
 * - 使用 Vant 组件搭建表单
 * - 提供项目选择、日期选择、类型选择、文本输入、图片上传与提交
 */
export const TabsBody = defineComponent({
  name: "TabsBody",
  emits: ["reset", "submit", "change", "back"],
  props: {
    id: {
      type: String,
      default: "",
    },
    api: {
      type: String,
      default: "",
    },
    appApi: {
      type: String,
      default: "",
    },
    selected: {
      type: Array,
      default: () => [],
    },
  },
  setup: (props, { emit }) => {
    const search = reactive({
      name: "",
      label: "",
      tagId: "",
      deptId: "",
      dept: "",
      pageNumber: 0,
      pageSize: 10,
      dailyType: "dailyTask",
    });
    const showPopUp = ref(false);
    // const showLableType = ref(false)
    const showLable = ref(false);
    const showDept = ref(false);
    // const labelTypeList = ref([
    //    { text: '类型1', value: 'a' },
    //    { text: '类型2', value: 'a' },
    // ])
    const labelList = ref<{ text: string; value: string }[]>([]);
    const deptList = ref<{ text: string; value: string }[]>([]);
    const dataSource = ref<TaskObjectItem[]>([]);
    const refreshing = ref(false);
    const finished = ref(false);
    const loading = ref(false);
    const cascaderValue = ref<string>("");

    type TagTreeNode = { id: string; name: string; childList?: TagTreeNode[] };
    type CascaderOption = { text: string; value: string; children?: CascaderOption[] | null; selectable?: boolean };

    /**
     * 将标签树转换为级联选项（所有节点可选）
     */
    const buildCascaderOptions = (nodes: TagTreeNode[] = []): CascaderOption[] => {
      return nodes.map((n) => ({
        text: String(n.name ?? ""),
        value: String(n.id ?? ""),
        selectable: true,
        children: buildCascaderOptions(n.childList ?? []).length ? buildCascaderOptions(n.childList ?? []) : null,
      }));
    };
    const onSearch = (): void => {
    };
    const searchDom = {
      action: (): VNode => (
        <Icon
          name="filter-o"
          onClick={() => {
            showPopUp.value = true;
          }}
          size="20"
        />
      ),
    };
    onMounted(() => {
      getTag();
      getDeptList();
    });

    const onConfirmDept = (value: PickerConfirmEventParams): void => {
      const v = (value as PickerConfirmEventParams).selectedOptions;
      if (v) {
        search.dept = String(v[0]?.text ?? v[0]?.text ?? "");
        search.deptId = String(v[0]?.value ?? v[0]?.value ?? "");
      }
      showDept.value = false;
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
        const newSearch = {
          ...search,
          pageNumber: search.pageNumber.toString(),
          pageSize: search.pageSize.toString(),
          keyword: search.name,
          tagIds: search.tagId ? search.tagId.split(",") : null,
          deptId: search.deptId,
        };
        // 使用类型断言，将 props.api 断言为 keyof CubeDailyTaskService
        const res = await cubeDailyTaskService[props.api as keyof typeof cubeDailyTaskService](newSearch);
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
      } catch (error) {
        finished.value = true;
      } finally {
        //  finished.value = true
        loading.value = false;
        refreshing.value = false;
      }
    };
    const getAllID = async (): Promise<{ id: string; typeId: string; tagIds: string[] }[]> => {
      const res = await cubeDailyTaskService[props.appApi as keyof typeof cubeDailyTaskService](search);
      return res;
    };
    /**
     * 拉取标签树并生成可选的级联选项
     */
    const getTag = async (): Promise<void> => {
      const res = await cubeDailyTaskService.getTagTreeList({});
      labelList.value = buildCascaderOptions(res ?? []);
    };
    const getDeptList = async (): Promise<void> => {
      const data = await cubeOuaaService.getDeptList({ enabled: true });
      const res = data.map((item) => {
        return {
          text: item.name,
          value: item.id,
        };
      });
      deptList.value = res as { text: string; value: string }[];
    };
    const boxSelected = ref(false);
    const selectedIds = ref<
      {
        id: string;
        typeId: string;
        old?: boolean;
        tagIds: string[];
      }[]
    >(
      (props.selected as {
        id: string;
        typeId: string;
        tagIds: string[];
      }[]) ?? [],
    );
    // const notSelectedIds = ref<string[]>([])
    const itemClick = (id: string, typeId: string, tagIds: string[]): void => {
      if (selectedIds.value.find((item) => item.id === id)) {
        selectedIds.value = selectedIds.value.filter((item) => item.id !== id);
        if (boxSelected.value) {
          boxSelected.value = false;
        }
      } else {
        selectedIds.value.push({ id, typeId, old: false, tagIds: tagIds });
      }
      emit("change", selectedIds.value);
    };
    const onSubmit = (): void => {
      emit("submit");
    };

    const allCheckMethods = async () => {
      if (!boxSelected.value) {
        selectedIds.value = await getAllID();
      } else {
        selectedIds.value = [];
      }
      emit("change", selectedIds.value);
      // notSelectedIds.value = []
      boxSelected.value = !boxSelected.value;
    };
    const reset = () => {
      search.label = "";
      search.tagId = "";
      search.deptId = "";
      search.dept = "";
      cascaderValue.value = "";
      showPopUp.value = false;
      dataSource.value = [];
      search.pageNumber = 0;
      onLoad();
    };

    /**
     * 处理标签级联“每一步”变化，允许选择非最后一级即结束
     */
    const onChangeLabel = (value: { selectedOptions: { text: string; value: string }[] }): void => {
      const path = value?.selectedOptions ?? [];
      const last = path[path.length - 1];
      search.label = last?.text ?? "";
      search.tagId = last?.value ?? "";
    };
    const onSubmitLabel = () => {
      showLable.value = false;
    };
    return (): VNode => (
      <div class={styles.task_object_body}>
        <Search
          v-model={search.name}
          placeholder="请输入对象名称、编码"
          show-action
          v-slots={searchDom}
          onSearch={onSearch}
          onClear={onSearch}
        />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: "72vh", marginTop: "5px", overflow: "auto" }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {dataSource.value &&
              dataSource.value.length > 0 &&
              dataSource.value.map((item: TaskObjectItem) => (
                <div
                  class={styles["cell-group"]}
                  key={item.id}
                  onClick={() => {
                    itemClick(item.id, item.typeId, item.tagIds);
                  }}
                >
                  <div class={styles.info}>
                    <div class={styles.cell_title}>{item.name}</div>
                    <div class={styles.cell}>
                      <div class={styles.label}>类型：</div>
                      <div class={styles.value}>{item.typeName ?? "-"}</div>
                    </div>
                    <div class={styles.cell}>
                      <div class={styles.label}>部门：</div>
                      <div class={styles.value}>{item.departmentNames ?? "-"}</div>
                    </div>
                    <div class={styles.cell}>
                      <div class={styles.label}>所属区域：</div>
                      <div class={styles.value}>{item.areaName ?? "-"}</div>
                    </div>
                    <div class={styles.cell}>
                      <div class={styles.label}>业务标签：</div>
                      <div class={styles.value}>{item.tagNames ?? "-"}</div>
                    </div>
                  </div>
                  {selectedIds.value.find((i) => i.id === item.id) && (
                    <div class={styles.check}>
                      <Icon name="success" class={styles.iconfont}></Icon>
                    </div>
                  )}
                </div>
              ))}
            {dataSource.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
        <div class={styles.footer_button_group}>
          <div
            class={styles.button_all}
            onClick={() => {
              allCheckMethods();
            }}
          >
            <Checkbox modelValue={boxSelected.value} shape="square" />
            <div class={styles.table_cell}>全选</div>
          </div>
          <Button type="primary" block onClick={onSubmit}>
            确定
          </Button>
        </div>
        <Popup v-model:show={showPopUp.value} position="right" style={{ width: "90vw", height: "100vh" }}>
          {/* <div class={styles.title}>标签类型</div>
          <div class={styles.screen}>
            <Field
              v-model={search.labelType}
              is-link
              readonly
              name='startTime'
              placeholder='选择标签类型'
              onClick={() => {
                showLableType.value = true
              }}
            />
          </div> */}
          {/* <div class={styles.title}>标签</div>
          <div class={styles.screen}>
            <Field
              v-model={search.label}
              is-link
              readonly
              name="startTime"
              placeholder="选择标签"
              onClick={() => {
                showLable.value = true;
              }}
            />
          </div> */}
          <div class={styles.title}>部门</div>
          <div class={styles.screen}>
            <Field
              v-model={search.dept}
              is-link
              readonly
              name="startTime"
              placeholder="选择部门"
              onClick={() => {
                showDept.value = true;
              }}
            />
          </div>
          {/* <Popup v-model:show={showLableType.value} position='bottom'>
            <Picker
              columns={labelTypeList.value}
              onConfirm={(val:PickerConfirmEventParams) => onConfirmLableType(val)}
              onCancel={() => (showLableType.value = false)}
            />
          </Popup> */}
          <Popup v-model:show={showLable.value} position="bottom">
            <Button class={styles.button_label} type="primary" onClick={onSubmitLabel}>
              确定
            </Button>
            <Cascader
              options={labelList.value}
              closeable={false}
              v-model:value={cascaderValue.value}
              // fieldNames={{ text: 'name', value: 'id',children: 'childList' }}
              title="选择标签"
              // onUpdate:modelValue={(val: string | number) => { cascaderValue.value = String(val ?? '') }}
              onChange={onChangeLabel}
              // onFinish={(payload: { selectedOptions: { text: string; value: string }[] }) => onFinishLabel(payload)}
              // onFinish={onFinishLabel}
            />
          </Popup>
          <Popup v-model:show={showDept.value} position="bottom">
            <Picker
              columns={deptList.value}
              onConfirm={(val: PickerConfirmEventParams) => onConfirmDept(val)}
              onCancel={() => (showDept.value = false)}
            />
          </Popup>
          <div class={styles.footer_button_group_popup}>
            <Button block onClick={() => reset()}>
              重置
            </Button>
            <Button
              block
              type="primary"
              onClick={() => {
                showPopUp.value = false;
                dataSource.value = [];
                search.pageNumber = 0;
                onLoad();
              }}
            >
              确定
            </Button>
          </div>
        </Popup>
      </div>
    );
  },
});
