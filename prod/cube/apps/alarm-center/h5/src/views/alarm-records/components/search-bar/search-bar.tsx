import { cubeAlarmCenterService } from "../../../../api/server";
import AreaSelect from "../../../../components/area-list-select/area-list-select.vue";
import "./search-bar.less";
import { useGlobalRouter } from "../../../../hook/use-global-router";
import "vue3-hash-calendar/es/index.css";
import type { AlarmType, AlarmLevel } from "@ghcloud/cube-alarm-center-service/src/types/alarm-center";
import { Button, PickerGroup, Popup, Search, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import VueHashCalendar from "vue3-hash-calendar";

/** 报警记录搜索组件 */
export const SearchBar = defineComponent({
  emits: ["confirm"],
  setup(props, { expose, emit }) {
    const { route } = useGlobalRouter();
    const formState = reactive<Record<string, string>>({
      keyword: "",
      alarmLevelId: "",
      alarmTypeId: "",
      period: (route.query?.period as string) ?? "",
      areaIds: "",
      alarmHandlerTimeoutStatus: "",
      applicationCode: "",
      alarmEventTypeId: "",
      assistConfirmResult: "",
    });
    const datePicker = reactive({
      start: "",
      end: "",
    });
    const showPop = ref(false);
    const showDatePicker = ref(false);
    const showAreaPicker = ref(false);
    const areaData = ref<{ id: string[]; name: string }>({
      id: [],
      name: "",
    });
    const alarmLevelsOptions = ref<AlarmLevel[]>([]);
    const alarmTypesOptions = ref<AlarmType[]>([]);
    const alarmAssistConfirmOptions = [
      {
        label: "确认告警",
        value: "CONFIRM_ALARM",
      },
      {
        label: "疑似告警",
        value: "SUSPECTED_ALARM",
      },
    ];

    const handleChange = (value: string, type: "start" | "end"): void => {
      datePicker[type] = value;
      if (datePicker.start === datePicker.end) {
        datePicker.end = "";
      }
    };

    const pickerConfirm = (): void => {
      if (datePicker.start === datePicker.end) {
        showNotify("开始时间不能等于结束时间");
      }
      if (datePicker.start === "") {
        showNotify("请选择开始时间");
        return;
      }
      if (datePicker.start === "" || datePicker.end === "") {
        showNotify("请选择结束时间");
        return;
      }
      if (new Date(datePicker.start).getTime() > new Date(datePicker.end).getTime()) {
        showNotify("开始时间不能大于结束时间");
        return;
      }
      showDatePicker.value = false;
      formState.period = `${datePicker.start} ~ ${datePicker.end}`;
    };

    const reset = (): void => {
      if (route.query?.sourceApp === "qrCodeTransfer") {
        for (const key in formState) {
          if (key !== "period") {
            formState[key] = "";
          }
        }
      } else {
        for (const key in formState) {
          formState[key] = "";
        }
      }
    };
    const confirm = (): void => {
      showPop.value = false;
      emit("confirm");
    };

    onMounted(async () => {
      handleQueryParams();
      handleCacheParams();
      alarmLevelsOptions.value = await cubeAlarmCenterService.getSatAlarmLevels();
      alarmTypesOptions.value = await cubeAlarmCenterService.getSatAlarmTypes();
      const queryParams = route.query as unknown as NormalRouteQuery;
      const id = alarmTypesOptions.value.find((x) => x.code === queryParams.applicationCode || x.code === queryParams.sourceApp)?.id;
      formState.alarmTypeId = id ?? "";
    });
    interface NormalRouteQuery {
      period: string;
      sourceApp: string;
      startTime: string;
      endTime: string;
      alarmTypeCode: string;
      alarmStatus: string;
      alarmLevelCode: string;
      userId: string;
      alarmLevelId: string;
      alarmEventTypeCode: string;
      applicationCode: string;
    }
    const handleCacheParams = (): void => {
      const cache = sessionStorage.getItem("searchParams");
      const searchParams = cache ? JSON.parse(cache) : cache;
      if (!searchParams) {
        return;
      }
      formState.keyword = searchParams.keyword;
      formState.alarmTypeId = searchParams.alarmTypeId;
      formState.alarmLevelId = searchParams.alarmLevelId;
      formState.alarmLevelCode = searchParams.alarmLevelCode;
      formState.applicationCode = searchParams.applicationCode;
      formState.alarmEventTypeId = searchParams.alarmEventTypeId;
      formState.period = searchParams.period;
      formState.areaId = searchParams.areaId;
      formState.alarmHandlerTimeoutStatus = searchParams.alarmHandlerTimeoutStatus;
      sessionStorage.removeItem("searchParams");
    };
    const handleQueryParams = (): void => {
      const queryParams = route.query as unknown as NormalRouteQuery;
      if (queryParams.sourceApp !== "qrCodeTransfer") {
        formState.period =
          queryParams.period ?? (queryParams.startTime && queryParams.endTime ? `${queryParams.startTime},${queryParams.endTime}` : "");
        formState.alarmTypeId = queryParams.alarmTypeCode ?? "";
        formState.alarmLevelId = queryParams.alarmLevelId ?? "";
        formState.alarmLevelCode = queryParams.alarmLevelCode ?? "";
        formState.applicationCode = queryParams.sourceApp ?? queryParams.applicationCode ?? "";
        formState.alarmEventTypeId = queryParams.alarmEventTypeCode ?? "";
        formState.userId = queryParams.userId ?? "";
      }
    };
    const getFormState = (): Record<string, string> => ({
      keyword: formState.keyword,
      alarmLevelId: formState.alarmLevelId,
      alarmLevelCode: formState.alarmLevelCode,
      applicationCode: formState.applicationCode,
      alarmTypeId: formState.alarmTypeId,
      userId: formState.userId,
      period: formState.period.split(" ~ ").join(","),
      alarmEventTypeId: formState.alarmEventTypeId,
      areaId: areaData.value.id.length ? (areaData.value.id.at(-1) as unknown as string) : "",
      alarmHandlerTimeoutStatus: formState.alarmHandlerTimeoutStatus,
    });
    expose({
      getFormState,
    });

    return (): JSX.Element => (
      <>
        <Search
          v-model={formState.keyword}
          show-action
          placeholder="事件名称/设备名称"
          onSearch={confirm}
          v-slots={{
            action: () => (
              <div style="display:flex">
                <div
                  onClick={() => {
                    showPop.value = true;
                  }}
                >
                  筛选
                </div>
              </div>
            ),
          }}
        />
        <Popup v-model:show={showPop.value} position="right" style={{ width: "80%", height: "100%" }}>
          <div class="pop-form">
            <div class="form-item" v-show={route.query?.sourceApp !== "qrCodeTransfer"}>
              <div class="label">时间范围</div>
              <input
                class="value-input"
                placeholder="开始时间 ~ 结束时间"
                onClick={() => {
                  showDatePicker.value = true;
                }}
                readonly
                value={formState.period}
              />
            </div>
            <div class="form-item">
              <div class="label">报警区域</div>
              <input
                class="value-input"
                placeholder="请选择区域"
                onClick={() => {
                  showAreaPicker.value = true;
                }}
                readonly
                value={areaData.value?.name}
              />
            </div>
            <div class="form-item">
              <div class="label">报警级别</div>
              <div class="radio-select">
                {alarmLevelsOptions.value.map((item) => (
                  <Button
                    size="mini"
                    plain
                    key={item.code}
                    class={formState.alarmLevelId === item.id ? "active" : ""}
                    onClick={() => {
                      if (formState.alarmLevelId === item.code) {
                        formState.alarmLevelId = "";
                        return;
                      }
                      formState.alarmLevelId = item.id;
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>
            <div class="form-item">
              <div class="label">超时状态</div>
              <div class="radio-select">
                <Button
                  size="mini"
                  plain
                  class={formState.alarmHandlerTimeoutStatus === "TIMED_OUT" ? "active" : ""}
                  onClick={() => {
                    if (formState.alarmHandlerTimeoutStatus === "TIMED_OUT") {
                      formState.alarmHandlerTimeoutStatus = "";
                      return;
                    }
                    formState.alarmHandlerTimeoutStatus = "TIMED_OUT";
                  }}
                >
                  超时
                </Button>
                <Button
                  size="mini"
                  plain
                  class={formState.alarmHandlerTimeoutStatus === "NORMAL" ? "active" : ""}
                  onClick={() => {
                    if (formState.alarmHandlerTimeoutStatus === "NORMAL") {
                      formState.alarmHandlerTimeoutStatus = "";
                      return;
                    }
                    formState.alarmHandlerTimeoutStatus = "NORMAL";
                  }}
                >
                  正常
                </Button>
              </div>
            </div>
            <div class="form-item" v-show={route.query?.sourceApp !== "qrCodeTransfer"}>
              <div class="label">报警类型</div>
              <div class="radio-select">
                {alarmTypesOptions.value.map((item) => (
                  <Button
                    size="mini"
                    plain
                    key={item.code}
                    class={formState.alarmTypeId === item.id ? "active" : ""}
                    onClick={() => {
                      if (item.id === formState.alarmTypeId) {
                        formState.alarmTypeId = "";
                        formState.applicationCode = "";
                        return;
                      }
                      formState.alarmTypeId = item.id;
                      formState.applicationCode = item.applicationCode;
                    }}
                  >
                    {item.applicationName}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div class="pop-footer">
            <span class="reset" onClick={reset}>
              重置
            </span>
            <Button type="primary" onClick={confirm}>
              确定
            </Button>
          </div>
        </Popup>
        <Popup v-model:show={showDatePicker.value} position="bottom" style={{ width: "100%" }}>
          <PickerGroup title="时间选择" tabs={["开始时间", "结束时间"]} onConfirm={pickerConfirm} key={new Date().getTime()}>
            <VueHashCalendar
              disabled-scroll="vertical"
              format="YY-MM-DD hh:mm"
              onChange={(e) => {
                handleChange(e, "start");
              }}
              show-today-button={false}
            />
            <VueHashCalendar
              disabled-scroll="vertical"
              format="YY-MM-DD hh:mm"
              onChange={(e) => {
                handleChange(e, "end");
              }}
              show-today-button={false}
            />
          </PickerGroup>
        </Popup>
        <AreaSelect v-model:showPicker={showAreaPicker.value} v-model={areaData.value} />
      </>
    );
  },
});
