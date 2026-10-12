import { cubeMdataService, cubeMeetRoomService, cubeOuaaService } from "@/api/service";
import { DeviceModalTable } from "@/components/device-modal-table/device-modal-table";
import { PersonSelect, PersonType, type PersonSelectProps } from "@/components/person-select";
import { useFieldRequired } from "@/hook/use-field-required";
import type { ConferenceDeviceAddOrUpdateParam, ConferenceInfoVo } from "@ghcloud/cube-meet-room-service";
import {
  Button,
  Cascader,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  TimeRangePicker,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";
import { UserPickerModal } from "@ghcloud/generic-component";
import { debounce } from "lodash";
import { defineComponent, ref, reactive, computed, watch } from "vue";

interface Props {
  labelWidth: string;
  title: string;
}
type ActionType = "add" | "edit";
export const MeetRoomModal = defineComponent({
  props: {
    labelWidth: {
      type: String,
      default: "80px",
    },
    title: {
      type: String,
      default: "会议室",
    },
  },
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const action = ref<ActionType>("add");
    const submitLoading = ref(false);
    const modalVisible = ref(false);
    const deviceModalTableRef = ref<{ openModal: () => void }>();
    const deviceList = ref<{ deviceId: string; deviceName: string }[]>([]);
    const { checkFieldRequired, checkFieldHidden, loadFieldConfig, isFieldConfigLoaded } = useFieldRequired();
    loadFieldConfig();

    const isNameVisible = computed(() => !checkFieldHidden("name"));
    const isAreaNameVisible = computed(() => !checkFieldHidden("areaName"));
    const isCapacityVisible = computed(() => !checkFieldHidden("capacity"));
    const isAdministratorsVisible = computed(() => !checkFieldHidden("administrators"));
    const isPeriodVisible = computed(() => !checkFieldHidden("period"));
    const isBookPersonVisible = computed(() => !checkFieldHidden("participantIds"));
    const isConferenceRoomTypeIdVisible = computed(() => !checkFieldHidden("conferenceType"));

    const formRenderRef = ref<FormExpose>();
    const formState = reactive<{
      id: string | undefined;
      name: string | undefined;
      status: boolean | number | undefined;
      areaId: string | undefined;
      areaName: string[] | undefined;
      capacity: number | undefined;
      administrators: string[] | undefined;
      period: string | string[] | undefined;
      deviceIds: string[] | undefined;
      bookPerson: PersonSelectProps | undefined;
      conferenceRoomTypeId: string | undefined;
    }>({
      id: undefined,
      name: undefined,
      period: undefined,
      status: undefined,
      areaId: undefined,
      areaName: undefined,
      capacity: undefined,
      administrators: undefined,
      deviceIds: [],
      bookPerson: undefined,
      conferenceRoomTypeId: undefined,
    });
    const userPickerModalRef = ref<{ openModal: () => void }>();
    const users = ref<{ id: string; name: string }[]>([]);
    const addUser = (): void => {
      userPickerModalRef.value?.openModal();
    };
    const usersHandle = async (val: { id: string; name: string; organizations: { id: string; name: string }[] }[]): Promise<void> => {
      users.value = val?.map((e) => ({
        id: e.id,
        name: e.name,
      }));
      formState.administrators = val?.map((e) => e.id);
    };
    const checkBookPerson = async (): Promise<void> => {
      const isCheck = checkFieldRequired("bookPerson");
      if (!isCheck) {
        return Promise.resolve();
      }
      if (!formState.bookPerson || !formState.bookPerson?.ids || formState.bookPerson?.ids?.length === 0) {
        return Promise.reject(new Error("请选择可预约人员"));
      }
      return Promise.resolve();
    };

    const createModalRules = () => ({
      name: [{ required: checkFieldRequired("name"), message: "请输入会议室名称", trigger: "blur" }],
      areaName: [{ required: checkFieldRequired("areaName"), message: "请选择所属区域", trigger: "blur" }],
      capacity: [{ required: checkFieldRequired("capacity"), message: "请输入可容纳人数", trigger: "blur" }],
      administrators: [{ required: checkFieldRequired("administrators"), message: "请选择管理员", trigger: "blur" }],
      period: [{ required: checkFieldRequired("period"), message: "请选择可预约时间段", trigger: "blur" }],
      bookPerson: [
        { required: checkFieldRequired("participantIds"), validator: checkBookPerson, message: "请选择可预约人员", trigger: "blur" },
      ],
      conferenceRoomTypeId: [{ required: checkFieldRequired("conferenceType"), message: "请选择会议室类型", trigger: "blur" }],
    });

    const modalRules = reactive(createModalRules());

    watch(isFieldConfigLoaded, (loaded) => {
      if (loaded) {
        Object.assign(modalRules, createModalRules());
      }
    });

    const handleOk = async (): Promise<void> => {
      await formRenderRef.value?.validate();
      try {
        submitLoading.value = true;
        const devices = deviceList.value?.map((i) => ({
          deviceId: i.deviceId,
          name: i.deviceName,
        })) as unknown as ConferenceDeviceAddOrUpdateParam[];
        const params: Record<string, any> = {
          status: formState.status ? 0 : 1,
          devices: devices || null,
        };

        if (isNameVisible.value) {
          params.name = formState.name || null;
        }

        if (isAreaNameVisible.value) {
          params.areaName = Array.isArray(formState.areaName) ? formState.areaName.join("/") : null;
        }

        if (isCapacityVisible.value) {
          params.capacity = formState.capacity || null;
        }

        if (isPeriodVisible.value) {
          params.period = Array.isArray(formState.period) ? formState.period.join(",") : null;
        }

        if (isAdministratorsVisible.value) {
          params.administrators = formState.administrators?.join(",") || null;
        }

        if (isBookPersonVisible.value && formState.bookPerson) {
          params.bookPersonType = formState.bookPerson?.type || null;
          params.bookPerson = Array.isArray(formState.bookPerson?.ids)
            ? formState.bookPerson?.ids?.join(",")
            : (formState.bookPerson?.ids ?? null);
        }

        if (isConferenceRoomTypeIdVisible.value) {
          params.conferenceRoomTypeId = formState.conferenceRoomTypeId || null;
        }

        if (action.value === "add") {
          await cubeMeetRoomService.addConference(params);
        }
        if (action.value === "edit") {
          await cubeMeetRoomService.updateConference({ ...params, id: formState.id || null });
        }
        message.success("操作成功");
        modalVisible.value = false;
        emit("enter");
      } catch {
      } finally {
        submitLoading.value = false;
      }
    };
    const cancel = (): void => {
      modalVisible.value = false;
      emit("enter");
      formRenderRef.value?.resetFields();
    };
    const getUserList = async (): Promise<void> => {
      const res = await cubeOuaaService.getTenantUserList({ userIds: formState.administrators ?? [] }, "post");
      users.value = res?.map((item) => ({
        name: item.name as string,
        id: item.id as unknown as string,
      }));
    };
    const getConferenceDetail = async (id: string): Promise<void> => {
      const res = await cubeMeetRoomService.getConferenceInfo(id);
      Object.assign(formState, res);
      formState.administrators = res?.administrators?.split(",");
      formState.areaName = res?.areaName?.split("/");
      formState.period = res?.period?.split(",");
      formState.deviceIds = res?.devicesVos?.map((e) => `${e.deviceId}`);
      deviceList.value = res?.devicesVos?.map((e) => ({ deviceId: `${e.deviceId || ""}`, deviceName: e.name || "" })) ?? [];
      formState.status = !res?.status;
      formState.conferenceRoomTypeId = `${res?.conferenceRoomTypeId || ""}`;
      formState.bookPerson = {
        type: res.bookPersonType as unknown as PersonType,
        ids: res?.bookPersonList?.map((e) => `${e.id ?? ""}`) ?? [],
      };
      getUserList();
    };
    const areaOptions = ref();
    const getAreaOptions = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree();
      areaOptions.value = res;
    };
    const roomTypeList = ref<{ label: string; value: string }[]>([]);
    const getTypeOptions = async (keyword?: string): Promise<void> => {
      const res = await cubeMeetRoomService.getMeetRoomTypeList({ keyword: keyword ?? "", status: true });
      roomTypeList.value = res.map((e) => ({ value: e.id, label: e.name }));
    };
    const handleTypeSearch = debounce((value: string | undefined) => {
      getTypeOptions(value);
    }, 300);
    const openModal = async (record?: ConferenceInfoVo): Promise<void> => {
      action.value = "add";
      deviceList.value = [];
      formRenderRef.value?.resetFields();
      await Promise.all([getAreaOptions(), getTypeOptions()]);
      if (record?.id) {
        action.value = "edit";
        getConferenceDetail(`${record?.id || ""}`);
      } else {
        for (const key in formState) {
          (formState as Record<string, unknown>)[key] = undefined;
        }
        formState.bookPerson = { type: PersonType.DEPARTMENT, ids: [] };
      }
      modalVisible.value = true;
    };
    expose({
      openModal,
    });
    const title = computed(() => {
      const res = action.value === "add" ? `新增${props.title}` : action.value === "edit" ? `编辑${props.title}` : `${props.title}`;
      return res;
    });
    return (): JSX.Element => (
      <>
        <Modal
          visible={modalVisible.value}
          title={title.value}
          onOk={handleOk}
          onCancel={cancel}
          confirmLoading={submitLoading.value}
          width="700px"
        >
          <Form model={formState} ref={formRenderRef} rules={modalRules} label-col={{ style: { width: props.labelWidth } }}>
            {isNameVisible.value && (
              <FormItem label="会议室名称" name="name">
                <Input v-model:value={formState.name} placeholder="请输入会议室名称" />
              </FormItem>
            )}

            {isConferenceRoomTypeIdVisible.value && (
              <FormItem label="会议室类型" name="conferenceRoomTypeId">
                <Select
                  v-model:value={formState.conferenceRoomTypeId}
                  options={roomTypeList.value}
                  placeholder="请选择会议室类型"
                  allowClear
                  showSearch
                  onSearch={handleTypeSearch}
                  getPopupContainer={(e: { parentNode: unknown }) => e.parentNode}
                />
              </FormItem>
            )}

            {isAreaNameVisible.value && (
              <FormItem label="所属区域" name="areaName">
                <Cascader
                  v-model:value={formState.areaName}
                  changeOnSelect
                  options={areaOptions.value}
                  fieldNames={{ label: "name", value: "name", children: "children" }}
                  placeholder="请选择所属区域"
                  style={{ minWidth: "160px" }}
                />
              </FormItem>
            )}

            {isCapacityVisible.value && (
              <FormItem label="可容纳人数" name="capacity">
                <InputNumber v-model:value={formState.capacity} min={1} max={999} placeholder="请输入可容纳人数（支持1-999）" />
              </FormItem>
            )}

            {isAdministratorsVisible.value && (
              <FormItem label="管理员" name="administrators">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Select
                    style={{ minWidth: "360px" }}
                    v-model:value={formState.administrators}
                    placeholder="请选择管理员"
                    options={users.value}
                    open={false}
                    showArrow={false}
                    allowClear={false}
                    mode="multiple"
                    getPopupContainer={(e: { parentNode: unknown }) => e.parentNode}
                    fieldNames={{ label: "name", value: "id" }}
                    maxTagCount={2}
                    onChange={() => {
                      users.value = users.value.filter((i) => formState.administrators?.includes(i.id));
                    }}
                  />
                  <Button type="primary" onClick={addUser}>
                    选择人员
                  </Button>
                </div>
              </FormItem>
            )}

            {isPeriodVisible.value && (
              <FormItem label="可预约时间段" name="period">
                <TimeRangePicker
                  format="HH:mm"
                  v-model:value={formState.period}
                  placeholder={["开始时间", "结束时间"]}
                  style={{ width: "240px" }}
                />
              </FormItem>
            )}

            {isBookPersonVisible.value && (
              <FormItem label="可预约人员" name="bookPerson">
                <PersonSelect v-model={[formState.bookPerson, "value"]} />
              </FormItem>
            )}

            <FormItem label="使用状态" name="correctValue">
              <Switch v-model:checked={formState.status} checkedChildren="启用" unCheckedChildren="停用" />
            </FormItem>

            <FormItem label="会议室设备" name="deviceList">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Select
                  style={{ minWidth: "360px" }}
                  open={false}
                  showArrow={false}
                  mode="multiple"
                  options={deviceList.value}
                  v-model:value={formState.deviceIds}
                  placeholder="请选择会议室设备"
                  fieldNames={{ label: "deviceName", value: "deviceId" }}
                  getPopupContainer={(e: { parentNode: unknown }) => e.parentNode}
                  maxTagCount={2}
                  onChange={() => {
                    deviceList.value = deviceList.value.filter((i) => formState.deviceIds?.includes(i.deviceId));
                  }}
                />
                <Button type="primary" onClick={() => deviceModalTableRef.value?.openModal()}>
                  选择设备
                </Button>
              </div>
            </FormItem>
          </Form>
        </Modal>
        <DeviceModalTable
          ref={deviceModalTableRef}
          searchParams={{ applicationCode: __ENV__.applicationCode }}
          v-model:value={deviceList.value}
          title="添加设备"
          onOk={(values: { deviceName: string; deviceId: string }[]) => {
            formState.deviceIds = values.map((e) => e.deviceId);
            deviceList.value = values.map((e) => ({ deviceName: e.deviceName, deviceId: e.deviceId }));
          }}
        />
        <UserPickerModal multiple ref={userPickerModalRef} v-model:value={users.value} onUpdate:value={usersHandle} />
      </>
    );
  },
});
