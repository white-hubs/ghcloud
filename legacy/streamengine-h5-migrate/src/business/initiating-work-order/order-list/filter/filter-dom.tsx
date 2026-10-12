import dayjs from "dayjs";
import { DatePicker, Field, Form, Popup, Radio, RadioGroup, showNotify } from "vant";
import { defineComponent, computed, ref, watch, type PropType, type VNode } from "vue";

import type { FaultType } from "../../../../service/work-report/work-report";

import styles from "../order-list.module.less";

interface SearchForm {
  pageNumber: number;
  total: number;
  pageSize: number;
  status: string;
  faultTypeId?: string;
  submitTime?: string;
  startTime?: string;
  endTime?: string;
}

export const FilterDom = defineComponent({
  emits: ["searchForm"],
  props: {
    searchForm: {
      type: Object,
      default: () => {
        return {
          pageNumber: 0,
          total: 1,
          pageSize: 10,
          status: "",
        };
      },
    },
    faultTypeList: {
      type: Array as PropType<FaultType[]>,
      default: () => [],
    },
  },
  setup: (props, { emit }) => {
    const showStartPicker = ref(false);
    const showEndPicker = ref(false);
    const startPickerKey = ref(0);
    const endPickerKey = ref(0);
    const startPickerValue = ref<string[]>([]);
    const endPickerValue = ref<string[]>([]);
    const minPickerDate = new Date(2010, 0, 1);
    const maxPickerDate = new Date(2035, 11, 31);
    const toPickerValue = (time?: string): string[] => {
      const date = time ? dayjs(time) : dayjs();
      return [date.format("YYYY"), date.format("MM"), date.format("DD")];
    };
    const openStartPicker = (): void => {
      startPickerValue.value = toPickerValue(search.value.startTime);
      startPickerKey.value += 1;
      showStartPicker.value = true;
    };
    const openEndPicker = (): void => {
      endPickerValue.value = toPickerValue(search.value.endTime);
      endPickerKey.value += 1;
      showEndPicker.value = true;
    };
    const search = ref<SearchForm>({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      status: "",
      faultTypeId: "",
      submitTime: "",
      startTime: "",
      endTime: "",
    });
    const statusList = [
      { title: "处理中", name: "ACTIVE" },
      { title: "已完成", name: "FINISHED" },
      { title: "已撤销", name: "UNDO" },
      { title: "已驳回", name: "REJECT" },
    ];
    const changeStatus = (value: string): void => {
      search.value.status = value;
    };
    const changeFaultType = (value: string): void => {
      search.value.faultTypeId = value;
    };
    const formatStartTime = (selectedOptions: { text: string }[]): string => {
      return dayjs(selectedOptions.map((item) => item.text).join("/"))
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
    };
    const formatEndTime = (selectedOptions: { text: string }[]): string => {
      return dayjs(selectedOptions.map((item) => item.text).join("/"))
        .endOf("day")
        .format("YYYY-MM-DD HH:mm:ss");
    };
    const beginTimeDisplay = computed(() => {
      return search.value.startTime ? dayjs(search.value.startTime).format("YYYY-MM-DD") : "";
    });
    const endTimeDisplay = computed(() => {
      return search.value.endTime ? dayjs(search.value.endTime).format("YYYY-MM-DD") : "";
    });
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string }[] }): void => {
      showStartPicker.value = false;
      const time = formatStartTime(selectedOptions);
      const endTime = dayjs(search.value.endTime).valueOf();
      const startTime = dayjs(time).valueOf();
      if (search.value.endTime && endTime < startTime) {
        showNotify({ type: "warning", message: "开始时间不能大于结束时间" });
        search.value.startTime = "";
        return;
      }
      search.value.startTime = time;
    };
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string }[] }): void => {
      showEndPicker.value = false;
      const time = formatEndTime(selectedOptions);
      const endTime = dayjs(time).valueOf();
      const startTime = dayjs(search.value.startTime).valueOf();
      if (search.value.startTime && endTime < startTime) {
        showNotify({ type: "warning", message: "开始时间不能大于结束时间" });
        search.value.endTime = "";
        return;
      }
      search.value.endTime = time;
    };
    const statusDom = (): VNode => (
      <RadioGroup v-model={search.value.status} direction="horizontal" icon-size="14px" onChange={changeStatus}>
        {statusList.map((item) => (
          <Radio
            key={item.name}
            class={styles.checkbox}
            name={item.name}
            style={{
              color: `${search.value.status === item.name ? "#1D66FF" : "#1F3140"}`,
              backgroundColor: `${search.value.status === item.name ? "#E6EFFF" : "#F8F9F9"}`,
            }}
            v-slots={{ icon: () => <div style={{ width: "90px" }}>{item.title}</div> }}
          />
        ))}
      </RadioGroup>
    );
    const faultTypeDom = (): VNode => (
      <div class={styles["fault-type-list"]}>
        {props.faultTypeList.map((item) => (
          <div
            key={item.id}
            class={[styles["fault-type-tag"], search.value.faultTypeId === item.id && styles["fault-type-tag-active"]]}
            onClick={() => {
              changeFaultType(item.id);
            }}
          >
            <span class={styles["fault-type-text"]}>{item.name}</span>
          </div>
        ))}
      </div>
    );
    watch(
      () => props.searchForm,
      () => {
        search.value = props.searchForm as SearchForm;
      },
      { immediate: true, deep: true },
    );
    watch(
      () => search.value,
      () => {
        emit("searchForm", search.value);
      },
      { immediate: true, deep: true },
    );
    return () => (
      <div class={styles.filter}>
        <Form>
          <p>处理状态</p>
          <Field style={{ padding: "0px" }} name="status" v-slots={{ input: statusDom() }} />
          <p>提交时间</p>
          <div class={styles["time-range"]}>
            <Field
              model-value={beginTimeDisplay.value}
              is-link
              readonly
              name="startTime"
              placeholder="开始时间"
              onClick={openStartPicker}
            />
            <Field model-value={endTimeDisplay.value} is-link readonly name="endTime" placeholder="结束时间" onClick={openEndPicker} />
            <Popup v-model:show={showStartPicker.value} position="bottom">
              <DatePicker
                key={startPickerKey.value}
                v-model={startPickerValue.value}
                columnsType={["year", "month", "day"]}
                minDate={minPickerDate}
                maxDate={maxPickerDate}
                onConfirm={handleStartPicker}
                onCancel={() => {
                  showStartPicker.value = false;
                }}
              />
            </Popup>
            <Popup v-model:show={showEndPicker.value} position="bottom">
              <DatePicker
                key={endPickerKey.value}
                v-model={endPickerValue.value}
                columnsType={["year", "month", "day"]}
                minDate={minPickerDate}
                maxDate={maxPickerDate}
                onConfirm={handleEndPicker}
                onCancel={() => {
                  showEndPicker.value = false;
                }}
              />
            </Popup>
          </div>
          {props.faultTypeList.length > 0 && (
            <>
              <p>故障类型</p>
              <Field style={{ padding: "0px" }} name="faultTypeId" v-slots={{ input: faultTypeDom() }} />
            </>
          )}
        </Form>
      </div>
    );
  },
});
