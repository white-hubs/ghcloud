import { Button, Checkbox, CheckboxGroup, Empty, List, Popup, Search } from "vant";
import { defineComponent, ref, watch } from "vue";

import type { PersonItem } from "@ghcloud/cube-ouaa-service";

import { cubeOuaaService } from "@/api/server";

const PAGE_SIZE = 20;

export const WorkerSelectPopup = defineComponent({
  name: "WorkerSelectPopup",
  props: {
    show: { type: Boolean, required: true },
    selectedIds: { type: Array as () => string[], default: () => [] },
  },
  emits: ["update:show", "confirm"],
  setup: (props, { emit }) => {
    const keyword = ref("");
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(0);
    const dataSource = ref<PersonItem[]>([]);
    const checkedIds = ref<string[]>([]);
    const selectedPersonMap = ref<Record<string, PersonItem>>({});

    const resetList = (): void => {
      pageNumber.value = 0;
      finished.value = false;
      dataSource.value = [];
    };

    const cachePersons = (records: PersonItem[]): void => {
      const next = { ...selectedPersonMap.value };
      records.forEach((person) => {
        next[person.id] = person;
      });
      selectedPersonMap.value = next;
    };

    const loadPage = async (): Promise<void> => {
      if (loading.value || finished.value) {
        return;
      }
      loading.value = true;
      try {
        pageNumber.value += 1;
        const resp = await cubeOuaaService.getStaffPage({
          pageNumber: pageNumber.value,
          pageSize: PAGE_SIZE,
          keyword: keyword.value.trim(),
          enabled: true,
        });
        const records = resp.records ?? [];
        cachePersons(records);
        dataSource.value = pageNumber.value === 1 ? records : [...dataSource.value, ...records];
        finished.value = dataSource.value.length >= Number(resp.total ?? 0) || records.length < PAGE_SIZE;
      } catch {
        finished.value = true;
      } finally {
        loading.value = false;
      }
    };

    const syncFromProps = (): void => {
      checkedIds.value = [...props.selectedIds];
      props.selectedIds.forEach((id) => {
        if (selectedPersonMap.value[id] == null) {
          selectedPersonMap.value[id] = { id, name: id, mobile: "", organizations: [], positions: [] } as PersonItem;
        }
      });
    };

    watch(
      () => props.show,
      (visible) => {
        if (!visible) {
          return;
        }
        keyword.value = "";
        syncFromProps();
        resetList();
        void loadPage();
      },
    );

    const onSearch = (): void => {
      resetList();
      void loadPage();
    };

    const togglePerson = (person: PersonItem): void => {
      cachePersons([person]);
      if (checkedIds.value.includes(person.id)) {
        checkedIds.value = checkedIds.value.filter((id) => id !== person.id);
        return;
      }
      checkedIds.value = [...checkedIds.value, person.id];
    };

    const handleConfirm = (): void => {
      const people = checkedIds.value.map((id) => selectedPersonMap.value[id]).filter((item): item is PersonItem => item != null);
      emit("confirm", people);
      emit("update:show", false);
    };

    return (): JSX.Element => (
      <Popup
        show={props.show}
        position="bottom"
        round
        style={{ height: "82vh" }}
        onUpdate:show={(value: boolean) => {
          emit("update:show", value);
        }}
      >
        <div class="fz-h5-picker-popup">
          <div class="fz-h5-picker-popup__head">
            <strong>选择作业人员</strong>
            <span>至少 2 人</span>
          </div>
          <Search v-model={keyword.value} placeholder="搜索姓名、手机号" shape="round" onSearch={onSearch} onClear={onSearch} />
          <div class="fz-h5-picker-popup__body">
            <List
              class="fz-h5-picker-popup__scroll"
              v-model:loading={loading.value}
              finished={finished.value}
              finishedText={dataSource.value.length ? "没有更多了" : ""}
              immediateCheck={false}
              onLoad={() => void loadPage()}
            >
              {dataSource.value.length === 0 && !loading.value ? (
                <Empty image-size={72} description="暂无人员" />
              ) : (
                <CheckboxGroup v-model={checkedIds.value}>
                  {dataSource.value.map((person) => (
                    <div
                      class="fz-h5-picker-item"
                      key={person.id}
                      onClick={() => {
                        togglePerson(person);
                      }}
                    >
                      <div class="fz-h5-picker-item__main">
                        <strong>{person.name}</strong>
                        <span>
                          {person.organizations?.map((item) => item.name).join(" / ") || "未分配部门"}
                          {person.mobile ? ` · ${person.mobile}` : ""}
                        </span>
                      </div>
                      <Checkbox
                        name={person.id}
                        shape="square"
                        onClick={(event: Event) => {
                          event.stopPropagation();
                        }}
                      />
                    </div>
                  ))}
                </CheckboxGroup>
              )}
            </List>
          </div>
          <div class="fz-h5-picker-popup__foot">
            <span>已选 {checkedIds.value.length} 人</span>
            <div class="fz-h5-picker-popup__actions">
              <Button
                size="small"
                onClick={() => {
                  emit("update:show", false);
                }}
              >
                取消
              </Button>
              <Button size="small" type="primary" onClick={handleConfirm}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </Popup>
    );
  },
});
