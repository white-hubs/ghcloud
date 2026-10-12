import { cubeOuaaService } from "../../../api/service";
import { ChoiceDepartment } from "../choice-department/choice-department";
import styles from "./choice-staff.module.less";
import type { PersonItem } from "@ghcloud/cube-ouaa-service";
import {
  Button,
  Cell,
  CellGroup,
  Empty,
  Field,
  Icon,
  List,
  Popup,
  PullRefresh,
  Radio,
  RadioGroup,
  Search,
  CheckboxGroup,
  Checkbox,
} from "vant";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

export const ChoiceStaff = defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "search"],
  setup(props, { emit }) {
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: "",
      organizationId: "",
    });
    watch(
      () => props.visible,
      () => {
        showStaffPopUp.value = props.visible;
      },
    );
    const department = ref("");
    const showStaffPopUp = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const showPopUp = ref(false);
    const showDepartmentPicker = ref(false);
    const concatList = ref<PersonItem[]>([]);
    onMounted(() => {
      onLoad();
    });
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true;
        search.pageNumber++;
        const res = await cubeOuaaService.getStaffPage(search);
        if (res.total <= search.pageSize) {
          finished.value = true;
        }
        if (res.records.length < search.pageSize) {
          finished.value = true;
        }
        if (!concatList.value) {
          concatList.value = [];
        }
        if (search.pageNumber === 1) {
          concatList.value = [];
        }
        concatList.value = [...concatList.value, ...res.records];
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0;
      finished.value = false;
      onLoad();
    };
    const chosenContactId = ref("");
    const chosenContactIds = ref<string[]>([]);
    const cellDom = (item: PersonItem): object => ({
      title: () => (
        <div class={styles.card}>
          {item.fileVO?.path ? (
            <div style={{ borderRadius: "50%" }}>
              <img src={item.fileVO?.path} alt="" width={44} height={44} />
            </div>
          ) : (
            <div class={styles.icon}>
              <Icon name="contact-o" size="40" />
            </div>
          )}
          <div class={styles.title}>
            <div>
              <span>{item.name}</span>
            </div>
            <div class={styles.detail}>
              <span>部门：</span>
              <span>{item.organizations.map((x) => x.name).join("-")}</span>
            </div>
            <div class={styles.detail}>
              <span>电话：</span>
              <span>{item.mobile}</span>
            </div>
          </div>
        </div>
      ),
      "right-icon": () => (props.multiple ? <Checkbox name={item.id} /> : <Radio name={item.id} />),
    });
    const searchDom = {
      action: (): JSX.Element => (
        <div
          onClick={() => {
            showPopUp.value = true;
          }}
        >
          筛选
        </div>
      ),
    };
    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0;
      search.organizationId = "";
      onLoad();
    };
    // 执行操作
    const handleSearch = async (): Promise<void> => {
      showStaffPopUp.value = false;
      emit("update:visible", false);
      const users = concatList.value.filter((item) =>
        props.multiple ? chosenContactIds.value.includes(item.id) : chosenContactId.value === item.id,
      );
      const payload = props.multiple ? { ids: chosenContactIds.value, users } : { id: chosenContactId.value, user: users[0] };
      emit("search", payload);
    };
    const handleDepartment = (item: { id: string; name: string }): void => {
      department.value = item.name;
      showDepartmentPicker.value = false;
      search.organizationId = item.id;
    };
    // 根据部门筛选人员
    const searchStaff = (): void => {
      search.pageNumber = 0;
      search.keyword = "";
      onLoad();
      showPopUp.value = false;
    };
    return (): JSX.Element => (
      <Popup v-model:show={showStaffPopUp.value} position="right" style={{ width: "100vw", height: "100vh" }}>
        <Search
          v-model={search.keyword}
          placeholder="根据人员姓名进行搜索"
          show-action
          v-slots={searchDom}
          onSearch={onSearch}
          onClear={onSearch}
        />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: "87vh", overflow: "auto" }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={concatList.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            {!props.multiple && (
              <RadioGroup v-model={chosenContactId.value}>
                <CellGroup inset>
                  {concatList.value.map((item) => (
                    <Cell
                      clickable
                      key={item.id}
                      onClick={() => {
                        chosenContactId.value = item.id;
                      }}
                      v-slots={cellDom(item)}
                    />
                  ))}
                </CellGroup>
              </RadioGroup>
            )}
            {props.multiple && (
              <CheckboxGroup v-model={chosenContactIds.value}>
                <CellGroup inset>
                  {concatList.value.map((item) => (
                    <Cell clickable key={item.id} v-slots={cellDom(item)} />
                  ))}
                </CellGroup>
              </CheckboxGroup>
            )}

            {concatList.value.length === 0 && search.pageNumber === 1 && <Empty description="暂无数据" />}
          </List>
        </PullRefresh>
        <div style="display:flex">
          <Button
            size="small"
            block
            onClick={() => {
              showStaffPopUp.value = false;
              emit("update:visible", false);
            }}
            style="margin:0 10px"
          >
            取消
          </Button>
          <Button size="small" type="primary" block onClick={handleSearch} style="margin:0 10px">
            提交
          </Button>
        </div>
        {/* 选择部门 */}
        <Popup v-model:show={showPopUp.value} position="right" style={{ width: "100vw", height: "100vh" }}>
          <div style={{ margin: "10px" }}>人员部门</div>
          <div class={styles.screen}>
            <Field
              v-model={department.value}
              is-link
              readonly
              name="startTime"
              placeholder="选择部门"
              onClick={() => {
                showDepartmentPicker.value = true;
              }}
            />
          </div>
          <Popup v-model:show={showDepartmentPicker.value} position="right" style={{ width: "100vw", height: "100vh" }}>
            <ChoiceDepartment
              chosen={{ id: search.organizationId, name: department.value }}
              onChosen={(item: { id: string; name: string }) => {
                handleDepartment(item);
              }}
            />
          </Popup>

          <div style={{ margin: "16px", display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              style={{ marginRight: "16px" }}
              onClick={() => {
                department.value = "";
                search.organizationId = "";
              }}
            >
              重置
            </Button>
            <Button size="small" type="primary" onClick={searchStaff}>
              提交
            </Button>
          </div>
        </Popup>
      </Popup>
    );
  },
});
