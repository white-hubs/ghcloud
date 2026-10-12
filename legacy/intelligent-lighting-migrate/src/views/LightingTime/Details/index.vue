<template>
  <gLayout
    :title="
      RouteInfo.type == 'add'
        ? '时控配置-新增'
        : RouteInfo.type == 'edit'
        ? '时控配置-编辑'
        : '时控配置-详情'
    "
  >
    <template #content-table>
      <div class="item-title">基本信息</div>

      <Form
        layout="inline"
        :model="TimeControlData"
        ref="gDetailForm"
        labelAlign="left"
      >
        <div class="formDiv">
          <FormItem label="计划名称:" v-bind="validateInfos.planName">
            <Input
              placeholder="请输入计划名称"
              style="width: 400px"
              :maxlength="30"
              allowClear
              :disabled="PathQuery.type == 'check' ? true : false"
              v-model:value.trim="TimeControlData.planName"
            ></Input>
          </FormItem>

          <FormItem label="有效期:">
            <RangePicker
              v-model:value="time"
              :placeholder="['开始时间', '结束时间']"
              :disabled-date="disabledDate"
              @change="timeChange"
              :disabled="PathQuery.type == 'check' ? true : false"
            />
          </FormItem>
          <FormItem
            label="执行周期:"
            v-bind="validateInfos.timeCycle"
            style="position: relative"
          >
            <span v-if="PathQuery.type !== 'check'">
              <span
                style="
                  font-size: 12px;
                  position: absolute;
                  top: 7px;
                  left: -16px;
                "
              >
                <Tooltip placement="topLeft">
                  <template #title>
                    <span>
                      开始和结束时间大于执行周期的时候，计划默认循环到结束日期
                    </span>
                  </template>
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
              <CheckboxGroup
                :disabled="PathQuery.type == 'check' ? true : false"
                v-model:value="TimeControlData.timeCycle"
                name="checkboxgroup"
                :options="plainOptions"
              />
            </span>
            <span v-else>{{ weekInfo }}</span>
          </FormItem>
        </div>
        <div class="formDiv">
          <FormItem
            style="width: 379px"
            label="是否启用:"
            v-bind="validateInfos.enabled"
          >
            <RadioGroup
              v-if="PathQuery.type !== 'check'"
              :disabled="PathQuery.type == 'check' ? true : false"
              v-model:value="TimeControlData.enabled"
              :options="radioplainOptions"
            />
            <span v-else>{{ TimeControlData.enabled ? "启用" : "禁用" }}</span>
          </FormItem>
        </div>
      </Form>
      <div class="contentTable">
        <div style="margin-right: 10px; font-weight: bold">计划规则</div>
        <Button
          size="small"
          type="primary"
          @click="addAdvice"
          v-if="PathQuery.type !== 'check'"
        >
          <template #icon><plus-outlined /></template>
          添加
        </Button>
      </div>
      <div style="height: calc(100vh - 500px)">
        <Table
          :columns="columns"
          :scroll="{ y: 380 }"
          :data-source="GroupControlDataList"
          bordered
          :pagination="false"
        >
          <template #objectType>
            <span class="required">对象类型</span>
          </template>
          <template #deviceObject>
            <span class="required">规则对象</span>
          </template>
          <template #controlTime>
            <span class="required">控制时间点</span>
          </template>
          <template #openGate>
            <span class="required">开关控制</span>
          </template>
          <template #bodyCell="{ column, text, record, index }">
            <template v-if="column.dataIndex === 'index'">
              {{ index + 1 }}
            </template>
            <template v-if="column.dataIndex === 'objectType'">
              <span v-if="PathQuery.type == 'check'">
                {{
                  TableChangeList.ObjectType.find(res => res.code == text)?.name
                }}
              </span>
              <Select
                v-else
                v-model:value="record.objectType"
                style="width: 100%; margin: -5px 0"
                :field-names="{ label: 'name', value: 'code' }"
                placeholder="请选择对象类型"
                @change="objectTypeChange($event, record)"
                :options="TableChangeList.ObjectType"
              ></Select>
            </template>
            <template v-if="column.dataIndex === 'deviceObject'">
              <span v-if="PathQuery.type == 'check'">
                {{ record.deviceName }}
                <!-- {{
                  record.objectType == "DEVICE_SINGLETON"
                    ? TableChangeList.DeviceDate.find(res => res.id == text)
                        ?.groupControlName
                    : TableChangeList.GroupData.find(res => res.id == text)
                        ?.groupControlName
                }} -->
              </span>
              <Select
                v-else
                v-model:value="record.deviceObject"
                :showSearch="true"
                :filter-option="filterOption"
                style="width: 100%; margin: -5px 0"
                :field-names="{ label: 'groupControlName', value: 'id' }"
                @change="deviceObjectChange($event, record)"
                placeholder="请选择规则对象"
                :options="
                  record.objectType == 'DEVICE_SINGLETON'
                    ? TableChangeList.DeviceDate
                    : TableChangeList.GroupData
                "
              ></Select>
            </template>
            <template v-if="column.dataIndex === 'areaName'">
              <span v-if="PathQuery.type == 'check'">{{ text }}</span>
              <span
                v-if="
                  PathQuery.type == 'edit' &&
                  record.objectType == 'DEVICE_SINGLETON'
                "
              >
                {{ text }}
              </span>

              <!-- <span
                v-if="
                  record.objectType == 'DEVICE_SINGLETON' &&
                  PathQuery.type !== 'check'
                "
              >
                {{
                  record.objectType == "DEVICE_SINGLETON"
                    ? TableChangeList.DeviceDate.find(
                        (res: any) => res.id == record.deviceObject,
                      )?.area
                    : ""
                }}
              </span> -->

              <Input
                v-if="
                  PathQuery.type !== 'check' &&
                  record.objectType !== 'DEVICE_SINGLETON'
                "
                :maxlength="20"
                style="margin: -5px 0"
                v-model:value="record.areaName"
              ></Input>
            </template>
            <template v-if="column.dataIndex === 'brightness'">
              <span v-if="PathQuery.type == 'check'">{{ text }}</span>
              <InputNumber
                v-else
                style="margin: -5px 0"
                v-model:value="record.brightness"
                :min="0"
                :max="100"
              />
            </template>
            <template v-if="column.dataIndex === 'controlTime'">
              <span v-if="PathQuery.type == 'check'">
                {{ dayjs(text).format("HH:mm") }}
              </span>
              <TimePicker
                v-else
                style="margin: -5px 0"
                v-model:value="record.controlTime"
                placeholder="请选择时间"
                format="HH:mm"
                value-format="HH:mm"
              />
            </template>
            <template v-if="column.dataIndex === 'openGate'">
              <span v-if="PathQuery.type == 'check'">
                {{ text == 1 ? "开" : "关" }}
              </span>
              <Select
                v-else
                v-model:value="record.openGate"
                style="width: 100%; margin: -5px 0"
                placeholder="请选择开关值"
                :options="[
                  {
                    label: '开',
                    value: 1,
                  },
                  {
                    label: '关',
                    value: 0,
                  },
                ]"
              ></Select>
            </template>
            <template
              v-if="column.dataIndex === 'handle' && PathQuery.type !== 'check'"
            >
              <Popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="deleteDevice(record)"
              >
                <a style="color: red">删除</a>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </div>
    </template>
    <template #footer-page>
      <Button @click="goBack">返回</Button>
      <Button
        type="primary"
        @click="SaveGroupControl"
        v-show="PathQuery.type !== 'check'"
      >
        保存
      </Button>
    </template>
  </gLayout>
</template>

<script setup lang="ts">
import {
  Button,
  Form,
  FormItem,
  Input,
  CheckboxGroup,
  RadioGroup,
  Select,
  Pagination,
  Popconfirm,
  Table,
  TableColumnsType,
  Modal,
  RangePicker,
  message,
  TimePicker,
  PaginationProps,
  InputNumber,
  Tooltip,
} from "ant-design-vue";

import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";
import gLayout from "@/components/common/gLayout.vue";
import { reactive, ref, UnwrapRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs, { Dayjs } from "dayjs";
import { Rule } from "ant-design-vue/lib/form/interface";
import {
  GetObjectType,
  GetGroupObjectType,
  AddTimeControl,
  CheckTimeControl,
  PutGroupControl,
} from "~/src/api/timeControl";
import { GetSecurityDevice } from "~/src/api/gruopControl";
import { SelectValue } from "ant-design-vue/lib/select";
const router = useRouter();
const route = useRoute();
type RangeValue = [Dayjs?, Dayjs?] | [string?, string?] | undefined;
const disabledDate = (current: Dayjs) => {
  // Can not select days before today and today

  return current && current <= dayjs().subtract(1, "days").endOf("day");
};

const time = ref<any>([]);
let PathQuery = reactive({
  id: route?.query?.id,
  type: route?.query?.type,
});
const filterOption = (input: string, option: any) => {

  return (
    option.groupControlName.toLowerCase().indexOf(input.toLowerCase()) >= 0
  );
};
let weekInfo = ref<string | undefined>("");
let currentCheckout = ref<number[]>([]);
const getDetiles = () => {
  CheckTimeControl(PathQuery.id).then(({ data }) => {
    if (PathQuery.type == "edit") {
      timeChange([data.planStartTime, data.planEndTime]);
    }
    let newData = JSON.parse(JSON.stringify(data));

    let newtimeCycle = newData.timeCycle.split(",");
    newData.timeCycle = newtimeCycle.map((timeCyc: string) => {
      return parseInt(timeCyc);
    });
    currentCheckout.value = newData.timeCycle;
    GroupControlDataList.value = newData.deviceDetails.map(
      (res: {
        controlTime: string | number | dayjs.Dayjs | Date | null | undefined;
        openGate: any;
      }) => {
        res.controlTime = dayjs(res.controlTime, "HH:mm");
        res.openGate = parseInt(res.openGate);
        return res;
      },
    );

    weekInfo.value = changeWeek(data.timeCycle);
    time.value =
      newData.planStartTime == null
        ? []
        : [dayjs(newData.planStartTime), dayjs(newData.planEndTime)];
    Object.assign(TimeControlData, newData);
  });
};

/**获取表格选择数据 */
let TableChangeList = reactive<{
  ObjectType: { name: string; code: string }[];
  GroupData: {
    id: string;
    groupControlName: string;
    areaName: string;
    deviceName: any;
  }[];
  DeviceDate: {
    id: string;
    groupControlName: string;
    area: string;
    areaName: string;
    deviceName: any;
  }[];
  newSave: any;
}>({
  ObjectType: [],
  GroupData: [],
  DeviceDate: [],
  newSave: [],
});

const objectTypeChange = async (
  value: SelectValue,
  data: {
    deviceObject: string;
    areaName: string;
  },
) => {
  data.deviceObject = "";
  data.areaName = "";

  if (value == "DEVICE_SINGLETON") {
    let { data: GroupData } = await GetSecurityDevice();

    let groupData = GroupData.map(
      (res: { deviceId: string; deviceName: string; areaName: string }) => {
        return {
          id: res.deviceId,
          groupControlName: res.deviceName,
          area: res.areaName,
        };
      },
    );

    TableChangeList.DeviceDate = groupData;
  } else {
    let { data: GroupData } = await GetGroupObjectType();
    TableChangeList.GroupData = GroupData;
    TableChangeList.newSave = GroupData;
  }
};
const deviceObjectChange = (
  value: SelectValue,
  index: {
    deviceName: string | undefined;
    areaName: string | undefined;
  },
) => {
  index.deviceName = TableChangeList.GroupData.find(res => {
    return value == res.id;
  })?.groupControlName;

  index.areaName = TableChangeList.DeviceDate.find(res => {
    return value == res.id;
  })?.area;
};
const getTableChangeList = async () => {
  if (PathQuery.type == "check" || PathQuery.type == "edit") {
    getDetiles();
  }
  let { data } = await GetObjectType();

  TableChangeList.ObjectType = data;
  if (PathQuery.type == "edit") {
    let { data: GroupData } = await GetGroupObjectType();
    TableChangeList.GroupData = GroupData;
    TableChangeList.newSave = GroupData;
  }
  if (PathQuery.type !== "check") {
    let { data: DaviceData } = await GetSecurityDevice();

    TableChangeList.DeviceDate = DaviceData.map(
      (res: { deviceId: string; deviceName: string; areaName: string }) => {
        return {
          id: res.deviceId,
          groupControlName: res.deviceName,
          area: res.areaName,
        };
      },
    );
  }
};
getTableChangeList();
/**新增群控组数据字典 */
let TimeControlData = reactive<Details.AddDetails>({
  planName: "",
  planStartTime: "",
  planEndTime: "",
  enabled: true,
  timeCycle: null,
  deviceDetails: [],
});
const useForm = Form.useForm;

const { resetFields, validate, validateInfos } = useForm(
  TimeControlData,
  reactive({
    planName: [
      {
        required: true,
        message: "请输入计划名称",
      },
    ],
    timeCycle: [
      {
        required: true,
        message: "请选择执行周期",
      },
    ],
    enabled: [
      {
        required: true,
        message: "请选择是否启用",
      },
    ],
  }),
);
/**
 * 保存新增群控组
 */
let flag = ref<boolean>(true);
const SaveGroupControl = () => {
  validate().then(async () => {
    flag.value = true;
    let newTimeControlData = JSON.parse(JSON.stringify(TimeControlData));

    if (time.value != null || time.value != undefined) {
      newTimeControlData.planStartTime = dayjs(time.value[0]).format(
        "YYYY-MM-DD",
      );
      newTimeControlData.planEndTime = dayjs(time.value[1]).format(
        "YYYY-MM-DD",
      );
    }
    if (time.value instanceof Array && time.value.length == 0) {
      newTimeControlData.planStartTime = null;
      newTimeControlData.planEndTime = null;
    }
    if (time.value == null) {
      newTimeControlData.planStartTime = null;
      newTimeControlData.planEndTime = null;
    }

    newTimeControlData.timeCycle =
      typeof newTimeControlData.timeCycle == "string"
        ? newTimeControlData.timeCycle
        : newTimeControlData.timeCycle.join(",");
    let messageData: string[] = [];
    GroupControlDataList.value.forEach((element: Details.deviceDetailsType) => {
      if (element.controlTime !== null) {
        element.controlTime =
          typeof element.controlTime == "string"
            ? element.controlTime
            : dayjs(element.controlTime).format("HH:mm");
      } else {
        element.controlTime = "";
      }
      if (element.objectType == "DEVICE_SINGLETON") {

        element.areaName = TableChangeList.DeviceDate.find((res: any) => {
          return res.id == element.deviceObject;
        })?.area;

        element.deviceName = TableChangeList.DeviceDate.find((res: any) => {
          return res.id == element.deviceObject;
        })?.groupControlName;
      }

      if (element.objectType == "DEVICE_GROUP") {

        element.deviceName = TableChangeList.newSave.find((res: any) => {
          return res.id == element.deviceObject;
        })?.groupControlName;
      }
      if (element.objectType == "") {
        messageData.push("对象类型不能为空");
        flag.value = false;
        return;
      }
      if (element.deviceObject == "") {
        messageData.push("规则对象不能为空");
        flag.value = false;
        return;
      }
      if (element.openGate !== 0 && element.openGate !== 1) {
        messageData.push("开关不能为空");
        flag.value = false;
        return;
      }

      if (element.controlTime == "" || element.controlTime == null) {
        messageData.push("控制时间点不能为空");
        flag.value = false;
        return;
      }
    });

    if (flag.value) {
      newTimeControlData.deviceDetails = GroupControlDataList.value;

      if (PathQuery.type == "edit") {
        let { data } = await PutGroupControl(newTimeControlData, PathQuery.id);
        if (data.code == 406 || data.code == 500) {
          message.error(data.message);
          return;
        }
        message.success("修改时控成功");
        history.back()
      } else {
        let { data } = await AddTimeControl(newTimeControlData);
        if (data.code == 406 || data.code == 500) {
          message.error(data.message);
          return;
        }
        history.back()
        GroupControlDataList.value = [];
        Object.assign(TimeControlData, {
          planName: "",
          planStartTime: null,
          planEndTime: null,
          enabled: true,
          timeCycle: null,
          deviceDetails: [],
        });

        message.success("添加时控成功");
      }
    } else {
      let messageinfo = new Set(messageData);
      messageinfo.forEach(element => {
        message.error(element);
      });
    }
  });
};

const columns: TableColumnsType =
  PathQuery.type == "check"
    ? [
        {
          title: "序号",
          dataIndex: "index",
          align: "center",
          width: "80px",
        },
        {
          dataIndex: "objectType",
          align: "center",
          slots: {
            title: "objectType",
          },
        },
        {
          dataIndex: "deviceObject",
          align: "center",

          slots: {
            title: "deviceObject",
          },
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          align: "center",
          key: "areaName",
        },
        {
          dataIndex: "controlTime",
          align: "center",
          key: "controlTime",
          slots: {
            title: "controlTime",
          },
        },
        {
          dataIndex: "openGate",
          align: "center",
          key: "openGate",
          slots: {
            title: "openGate",
          },
        },
        {
          title: "光照度(%)",
          dataIndex: "brightness",
          align: "center",
          key: "brightness",
        },
      ]
    : [
        {
          title: "序号",
          dataIndex: "index",
          align: "center",
          width: "80px",
        },
        {
          dataIndex: "objectType",
          align: "center",
          slots: {
            title: "objectType",
          },
        },
        {
          dataIndex: "deviceObject",
          align: "center",

          slots: {
            title: "deviceObject",
          },
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          align: "center",
          key: "areaName",
        },
        {
          dataIndex: "controlTime",
          align: "center",
          key: "controlTime",
          slots: {
            title: "controlTime",
          },
        },
        {
          dataIndex: "openGate",
          align: "center",
          key: "openGate",
          slots: {
            title: "openGate",
          },
        },
        {
          title: "光照度(%)",
          dataIndex: "brightness",
          align: "center",
          key: "brightness",
        },

        {
          title: "操作",
          dataIndex: "handle",
          align: "center",
          key: "handle",
        },
      ];

const GroupControlDataList = ref<Details.deviceDetailsType[]>([]);

/**删除设备 */
const deleteDevice = (data: Details.deviceDetailsType) => {
  GroupControlDataList.value = GroupControlDataList.value.filter((res: any) => {
    return res.id !== data.id;
  });
};
const guid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
/**添加数据 */
const addAdvice = () => {
  GroupControlDataList.value.push({
    objectType: "",
    deviceObject: "",
    areaName: "",
    controlTime: "",
    openGate: 0,
    brightness: 0,
    deviceName: "",
    id: guid(),
  });
};

/**时间改变了 */
let week = ref<number[]>([]);

const timeChange = (value: any) => {

  week.value = [];
  TimeControlData.timeCycle = null;
  if (value == null) {
    plainOptions.value = plainOptions.value.map(
      (data: { value: number; disabled?: boolean; label: string }) => {
        data.disabled = false;

        return data;
      },
    );
    return;
  }
  if (value[0] == null) {
    plainOptions.value = plainOptions.value.map(
      (data: { value: number; disabled?: boolean; label: string }) => {
        data.disabled = false;

        return data;
      },
    );
    return;
  }

  let firstWeek = new Date(value[0]).getDay();
  let days = new Date(value[1]).getTime() - new Date(value[0]).getTime();
  let daynums: number = days / (1000 * 60 * 60 * 24);
  if (daynums + 1 >= 7) {
    plainOptions.value = plainOptions.value.map(
      (data: { value: number; disabled?: boolean; label: string }) => {
        data.disabled = false;

        return data;
      },
    );
  } else {
    for (let i = 0; i < daynums + 1; i++) {
      if (firstWeek + i > 6) {
        week.value.push(firstWeek + i - 7 + 1);
      } else {
        week.value.push(firstWeek + 1 + i);
      }
    }
  }
  if (week.value.length >= 1) {
    plainOptions.value = plainOptions.value.map(
      (data: { value: number; disabled?: boolean; label: string }) => {
        let index = week.value.findIndex(res => res == data.value);

        if (index == -1) {
          data.disabled = true;
        } else {
          data.disabled = false;
        }
        return data;
      },
    );
  }

};
/**地址栏字段 */
let RouteInfo = reactive<{
  type: string;
}>({
  type: "",
});
Object.assign(RouteInfo, useRoute().query);
const goBack = () => {
  history.back()
};
const plainOptions = ref<
  {
    value: number;
    disabled?: boolean;
    label: string;
  }[]
>([
  { label: "周一", value: 2, disabled: false },
  { label: "周二", value: 3, disabled: false },
  { label: "周三", value: 4, disabled: false },
  { label: "周四", value: 5, disabled: false },
  { label: "周五", value: 6, disabled: false },
  { label: "周六", value: 7, disabled: false },
  { label: "周天", value: 1, disabled: false },
]);
const radioplainOptions = [
  { label: "启用", value: true },
  { label: "禁用", value: false },
];
const changeWeek = (info: string) => {
  if (info == "") return;
  let newarr = info.split(",").map((element: string | number) => {
    element =
      element == 2
        ? "周一"
        : element == 3
        ? "周二"
        : element == 4
        ? "周三"
        : element == 5
        ? "周四"
        : element == 6
        ? "周五"
        : element == 7
        ? "周六"
        : element == 1
        ? "周天"
        : "";
    return element;
  });
  return newarr.join(",");
};
</script>

<style scoped lang="less">
.queryCondition {
  width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.formDiv {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 53px;
}
.contentTable {
  display: flex;
  justify-content: space-between;
  width: 160px;
  align-items: center;
  margin-bottom: 10px;
}
.required::before {
  content: "*";
  display: inline-block;
  font-family: SimSun, sans-serif;
  font-size: 14px;
  line-height: 1;
  margin-right: 4px;
  color: red;
}
</style>
