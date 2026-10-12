<template>
  <g-layout :title="pageTitle">
    <template #content-table>
      <div>
        <a-form ref="panelRef" :model="panelModel" :rules="panelRules">
          <a-row :gutter="[32]">
            <a-col :span="6">
              <a-form-item label="配电采集周期" name="timeCycle">
                <a-select style="width: 100%" v-model:value="panelModel.timeCycle" placeholder="请选择配电采集周期"
                  :options="options"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="用电抄表时间" name="readeTime">
                <a-time-picker style="width: 100%" v-model:value="panelModel.readeTime" show-time placeholder="请选择"
                  value-format="HH:mm:ss" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="6">
              <a-form-item label="变压器关联">
                <a-button type="primary" @click="addTransformer">添加</a-button>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-table ref="tableRef" :columns="columnsDevice" :data-source="tableDataDevice" :pagination="true"
              :scroll="{ y: 420 }">
              <template #pm="{ index }">
                <div class="table-item1">
                  {{ index + 1 }}
                </div>
              </template>
              <template #operation="{ index }">
                <a-popconfirm title="确定删除?" @confirm="deleteItem(index)">
                  <a-button type="link" danger>删除</a-button>
                </a-popconfirm>
              </template>
            </a-table>
          </a-row>
        </a-form>
      </div>
    </template>
    <template #footer-page>
      <div class="buttom-btn" style="text-align: right">
        <div>
          <a-button type="primary" :loading="panelLoading" @click="save">
            修改/保存
          </a-button>
        </div>
      </div>
    </template>

    <a-modal v-model:visible="transformerlVisi" centered :title="'新增变压器'" @ok="saveTransformer"
      @cancel="transformerlCancel" :confirmLoading="transformerlLoading">
      <a-form ref="transformerlRef" :model="transformerlModel" :rules="transformerlRules"
        :label-col="{ style: { width: '100px !important' } }"> 
        <a-form-item label="变压器设备" name="transformer">
          <a-select v-model:value="transformerlModel.transformer" style="width: 90%" placeholder="请选择变压设备"
            :options="bysbOptions" @change="handleChangetransformer"></a-select>
        </a-form-item>
        <a-form-item label="高压进线设备" name="highDistribution">
          <a-select v-model:value="transformerlModel.highDistribution" style="width: 90%" placeholder="请选择高压进线设备"
            :options="bysbOptions" @change="handleChangehighDistribution"></a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </g-layout>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
  nextTick,
} from "vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  name: "",
  components: {},
  setup() {
    const bysbOptions = ref([]);

    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      disabled: true,
      transformerlVisi: false,
      transformerlLoading: false,
      tableDataDeviceObj: {},
      transformerlModel: {
        transformer: "",
        transformerName: "",
        highDistribution: "",
        highDistributionName: "",
      },
      transformerlRules: {
        transformer: [{ required: true, message: "设备不能为空" }],
        highDistribution: [{ required: true, message: "设备不能为空" }],
      },
      panelLoading: false,
      panelModel: {
        timeCycle: null,
        readeTime: null,
        applicationCode: "ELECTRICAL",
        transformers: [],
      },
      panelRules: {
        timeCycle: [{ required: true, message: "配电采集周期不能为空" }],
        readeTime: [{ required: true, message: "用电抄表时间不能为空" }],
      },
      options: [
        { value: 1, label: "1小时" },
        { value: 2, label: "2小时" },
        { value: 3, label: "3小时" },
        { value: 4, label: "4小时" },
        { value: 6, label: "6小时" },
        { value: 8, label: "8小时" },
        { value: 12, label: "12小时" },
      ],
    });
    const { proxy } = getCurrentInstance();
    const panelRef = ref();
    const transformerlRef = ref();

    const columnsDevice = ref([
      {
        title: "序号",
        dataIndex: "pm",
        key: "pm",
        slots: { customRender: "pm" },
      },
      {
        title: "变压器名称",
        dataIndex: "transformerName",
        key: "transformerName",
      },
      {
        title: "高压配电",
        dataIndex: "highDistributionName",
        key: "highDistributionName",
      },
      {
        title: "操作",
        dataIndex: "operation",
        key: "operation",
        slots: { customRender: "operation" },
      },
    ]);
    const tableDataDevice = ref([]);

    const getTableData = () => {
      proxy.$api
        .getCollectConfigure(state.panelModel)
        .then(res => {
          tableDataDevice.value = res;
        })
        .catch(() => { });
    };
    const deleteItem = index => {
      tableDataDevice.value.splice(index, 1);
    };
    const addTransformer = () => {
      proxy.$api.getapplicationdevice().then(res => {
        bysbOptions.value = res.map(data => {
          data.label = data.deviceName;
          data.value = data.deviceId;
          return data;
        });
      });
      state.transformerlVisi = true;
    };
    const transformerlCancel = () => {
      state.transformerlVisi = false;
      transformerlRef.value.resetFields();
      getData();
    };
    const saveTransformer = async () => {
      transformerlRef.value
        .validate()
        .then(() => {
          Object.assign(state.transformerlModel, {
            transformer: transformer.value,
            highDistribution: highDistribution.value,
          });
          tableDataDevice.value.push(transforData.value);

          state.transformerlVisi = false;
          transformerlRef.value.resetFields();
        })
        .catch(() => { });
    };
    const getData = () => {
      proxy.$api
        .getCollectConfigure()
        .then(res => {
          if (Object.keys(res).length > 0) {
            state.panelModel = res;
            tableDataDevice.value = res.transformerDistributionVos;
          }
        })
        .catch(() => { });
    };
    const editSave = () => {
      state.disabled = false;
    };
    const cancel = () => {
      state.disabled = true;
      panelRef.value.resetFields();
      getData();
    };
    const save = async () => {
      panelRef.value
        .validate()
        .then(() => {
          state.panelLoading = true;
          state.panelModel.transformers = tableDataDevice.value;
          proxy.$api
            .addCollectConfigure(state.panelModel)
            .then(() => {
              proxy.$message.success("操作成功");
              state.disabled = true;
              state.panelLoading = false;
              getData();
            })
            .catch(() => {
              state.panelLoading = false;
            });
        })
        .catch(() => { });
    };
    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
      getData();
    });
    const transformer = ref();
    const transformerName = ref();
    const transforData = ref({
      transformer: "",
      transformerName: "",
      highDistribution: "",
      highDistributionName: "",
    });
    const handleChangetransformer = res => {
      transformer.value = res;
      transforData.value.transformer = res;
      transforData.value.transformerName = bysbOptions.value.find(
        data => data.deviceId == res,
      )?.deviceName;
      transformerName.value = bysbOptions.value.find(
        data => data.deviceId == res,
      )?.deviceName;
    };
    const highDistribution = ref();
    const highDistributionName = ref();
    const handleChangehighDistribution = res => {
      highDistribution.value = res;
      transforData.value.highDistribution = res;
      transforData.value.highDistributionName = bysbOptions.value.find(
        data => data.deviceId == res,
      )?.deviceName;
      highDistributionName.value = bysbOptions.value.find(
        data => data.deviceId == res,
      )?.deviceName;
    };
    return {
      ...toRefs(state),
      highDistribution,
      transformer,
      bysbOptions,
      transformerName,
      highDistributionName,
      transforData,
      save,
      cancel,
      panelRef,
      editSave,
      getData,
      columnsDevice,
      tableDataDevice,
      saveTransformer,
      transformerlCancel,
      transformerlRef,
      addTransformer,
      getTableData,

      handleChangetransformer,
      handleChangehighDistribution,
      deleteItem,
    };
  },
});
</script>
<style scoped lang="less">
:deep(.content-table) {
  overflow-y: auto !important;
}


::-webkit-scrollbar {
  width: 0 !important;
}

</style>

<style lang="less">
.ant-modal {
  .ant-modal-body {
    .ant-tabs-nav-wrap {
      background-color: #fafafa !important;
    }
    .ant-form {
      .ant-form-item {
        margin-bottom: 10px !important;
      }
      .ant-form-item-label {
        width: 100px !important;
        margin-right: 10px;
      }
      .g-select.ant-select {
        width: 100%;
      }
    }
  }
}</style>