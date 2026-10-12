<template>
  <g-layout :title="title">
    <template #content-table>
      <a-form ref="formRef" :model="line" :rules="rules">
        <a-row>
          <a-col :span="8">
            <a-form-item label="路线名称" name="name">
              <a-input oninput="value=value.replace(/[, ]/g,'')" onkeyup="value=value.replace(/[, ]/g,'')"
                v-model:value="line.name" placeholder="输入路线名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8" :offset="2">
            <a-form-item label="建议巡逻时间" name="patrolProposalTime">
              <a-input oninput="value=value.replace(/[, ]/g,'')" onkeyup="value=value.replace(/[, ]/g,'')"
                v-model:value="line.patrolProposalTime" placeholder="输入巡逻时间"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="10">
            <!-- <span style="
                display: inline-block;
                margin-right: 4px;
                color: #ff4d4f;
                font-size: 14px;
                font-family: SimSun, sans-serif;
                position: absolute;
                top: 6px;
              ">
              *
            </span> -->
            <a-form-item label="巡逻人员" name="personModifyParams">
              <a-button type="primary" @click="addPerson">
                添加
                <PlusOutlined />
              </a-button>
            </a-form-item>
            <a-form-item v-for="(item, index) in line.personModifyParams" :key="item.id">
              <g-notice-select :config="item"></g-notice-select>
              <a-button type="link" danger @click="deleteRow(item, index)">
                删除
              </a-button>
              <!-- <g-select
                url="deptList"
                v-model:value="item.departmentId"
                placeholder="请选择部门"
                style="width: 40%"
              ></g-select>
              <g-select
                url="position"
                v-model:value="item.postId"
                placeholder="请选择岗位"
                style="width: 40%"
              ></g-select>
              <a-button
                v-if="index > 0"
                type="link"
                danger
                @click="deleteRow(index)"
              >
                删除
              </a-button> -->
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="视频巡逻点" name="deviceModifyParams">
              <a-button type="primary" @click="addCameraPoint"> 添加巡逻点 </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-table :pagination="true" :columns="dataColumns" :data-source="line.deviceModifyParams" bordered size="small"
        :scroll="{ y: 300 }">
        <template #action="{ record }">
          <a-popconfirm title="是否移除当前选中？" cancelText="取消" okText="确定" @confirm.stop="remove(record)">
            <a-button type="link" danger>移除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </template>
    <template #footer-btn>
      <a-button @click="back">返回</a-button>
      <a-button type="primary" @click="save" :loading="saveLoading"> 保存 </a-button>
    </template>
    <g-modal ref="modalRef" :visible="visible" rowKey="deviceId" title="摄像机" :search="search" :columns="columns"
      :url="url" @close="close" @recodes="recodes" :activeId="activeId"></g-modal>
  </g-layout>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { PlusOutlined } from "@ant-design/icons-vue";
import { cloneDeep } from "lodash-es";
export default defineComponent({
  components: { PlusOutlined },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const { id } = route.query;
    const formRef = ref(null);
    const validatePass = (rule, value, callback) => {
      if (value.length) {
        const emptyPerson = value.filter(item => !item.targetConfig.length)
        if (emptyPerson.length) {
          callback(new Error("请添加巡更人员"))
        } else {
          callback()
        }
      }
      callback()
    }
    const state = reactive({
      title: "新增巡逻路线",
      saveLoading: false,
      line: {
        name: "",
        patrolProposalTime: "",
        enabled: true,
        deviceModifyParams: [],
        personModifyParams: [],
      },
      initLine: null,
      rules: {
        name: [
          { required: true, message: "请输入路线名称" },
          { max: 20, message: "最多输入20字" },
        ],
        s: [{ required: true, message: "请输入路线名称" }],
        patrolProposalTime: [
          { required: true, message: "请输入建议巡逻时间" },
          { max: 20, message: "最多输入20字" },
        ],
        deviceModifyParams: [{ required: true, message: "请添加巡逻点" }],
        personModifyParams: [
          { required: true, message: "请添加巡更人员" },
          { validator: validatePass }
        ],
      },
      url: "getSecurityDevicePage1",
      visible: false,
      search: [
        {
          label: "",
          value: "keyword",
          placeholder: "摄像机名称",
        },
      ],
      columns: [
        {
          dataIndex: "deviceName",
          title: "设备名称",
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          slots: {
            customRender: "areaName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
      ],
      activeId: [],
      dataColumns: [
        {
          dataIndex: "deviceName",
          title: "巡逻序号",
          slots: {
            customRender: "deviceName",
          },
          customRender: ({ text, index, record }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "deviceName",
          title: "视频巡逻点",
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          slots: {
            customRender: "areaName",
          },
          customRender: ({ text }) => {
            return text ? text : "--";
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
        },
      ],
    });
    const deviceList = ref([]);
    onMounted(async () => {
      // const device = await proxy.$api.getSecurityDevicePage1({
      //     pageNumber:1,
      //     pageSize:1000000
      //   });
      // =device.records
      state.initLine = cloneDeep(state.line);
      if (id) {
        state.title = "编辑巡逻路线";
        const data = await proxy.$api.patrolLineId({ id: id }, "get");

        if (data) {
          state.line = {
            id: data.id,
            name: data.name,
            patrolProposalTime: data.patrolProposalTime,
            enabled: data.enabled,
            deviceModifyParams: data.cameraPatrolDeviceVOS.map((item, index) => {
              return {
                sort: item.sort,
                deviceCode: item.deviceCode,
                deviceName: item.deviceName,
                deviceId: item.deviceId,
                area: item.area,
                areaName: item.areaNames,
              };
            }),
            personModifyParams: data.cameraPatrolPersonVOS.map((item) => {
              return {
                id: item.id,
                messageTargetNotify: item.authType,
                targetConfig: item.authConfig,
              };
            }),
          };
        }
      }
    });
    const addPerson = () => {
      // state.line.personModifyParams.push({ departmentId: "", postId: "" });
      state.line.personModifyParams.push({
        id: guid(),
        messageTargetNotify: "USER",
        targetConfig: [],
      });
    };
    const deleteRow = (item, index) => {
      let inx = state.line.personModifyParams.findIndex((res) => res.id == item.id);
      state.line.personModifyParams.splice(inx, 1);
    };
    const addCameraPoint = () => {
      state.visible = true;
      state.activeId = state.line.deviceModifyParams.map((item) => item.deviceId);
    };
    const close = (data, list) => {
      if (list != undefined) {
        let newarr = [];
        list.forEach((element) => {
          let device = deviceList.value.find((res) => {
            return res.deviceId == element;
          });
          if (device) {
            newarr.push(device);
          }
        });
        state.visible = false;

        let newdata = newarr.map((item, index) => {
          return {
            sort: index + 1,
            deviceCode: item.code,
            deviceName: item.deviceName,
            deviceId: item.deviceId,
            area: item.areaId,
            areaName: item.areaName,
          };
        });
        let data = JSON.parse(
          JSON.stringify([...state.line.deviceModifyParams, ...newdata])
        );

        state.line.deviceModifyParams = uniqueFunc(data, "deviceId");
      } else {
        state.visible = false;
      }

      // state.line.deviceModifyParams=[...  state.line.deviceModifyParams,...newData]
    };
    const uniqueFunc = (arr, uniId) => {
      const res = new Map();
      return arr.filter((item) => !res.has(item[uniId]) && res.set(item[uniId], 1));
    };
    const remove = (record) => {
      state.line.deviceModifyParams = state.line.deviceModifyParams.filter(
        (item) => item.deviceId !== record.deviceId
      );
    };
    const back = () => {
      history.go(-1);
    };
    const save = () => {

      formRef.value.validate().then(async () => {
        const params = cloneDeep(state.line)
        params.personModifyParams = params.personModifyParams.map((data) => {
          return {
            id: data.id,
            authType: data.messageTargetNotify,
            authConfig: data.targetConfig,
          };
        });
        state.saveLoading = true;
        if (id) {
          const data = await proxy.$api.editPatrolLine(params, "put");
          if (data) {
            proxy.$message.success("修改成功");
            back();
          }
        } else {
          const data = await proxy.$api.addPatrolLine(params, "post");
          if (data) {
            proxy.$message.success("添加成功");
            back();
          }
        }
        state.saveLoading = false;
      });
    };
    const guid = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const personData = ref({
      alarmNoticeConfig: {
        actionType: "ALARM_NOTIFY_ACTION",
        enabled: true,
        actionConfig: {
          dutyUser: false,
          targetModifyParams: [],
        },
      },
    });
    const recodes = (data) => {
      deviceList.value = [...deviceList.value, ...data];
    };
    return {
      uniqueFunc,
      recodes,
      deviceList,
      personData,
      guid,
      ...toRefs(state),
      addCameraPoint,
      close,
      remove,
      back,
      save,
      addPerson,
      deleteRow,
      formRef,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.footer-btn) {
  width: 100%;
  text-align: right;
}
</style>
