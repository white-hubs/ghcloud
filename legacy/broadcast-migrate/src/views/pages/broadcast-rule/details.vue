<template>
  <div class="board-rule-details">
    <div class="content">
      <div class="base-info">
        <g-vertical-line title="基础信息"></g-vertical-line>
        <div class="form">
          <a-form ref="formRef" :model="state.formState" :rules="rules">
            <a-row :gutter="32">
              <a-col :span="12">
                <a-form-item label="规则名称" name="name">
                  <a-input maxlength="20" :disabled="type==='info'" showCount allow-clear
                    v-model:value="state.formState.name" placeholder="请输入规则名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="说明" name="remark">
                  <a-textarea maxlength="200" :disabled="type==='info'" allow-clear
                    v-model:value="state.formState.remark" showCount placeholder="输入备注信息" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>
      <div class="rule-config">
        <g-vertical-line title="规则配置"></g-vertical-line>
        <div class="broadcast-template">
          <div class="top-operate">
            <div class="title">广播模板</div>
            <a-button type="primary" :disabled="type==='info'"
              @click="state.selectedTemplateModal.visible = true">添加</a-button>
          </div>
          <div class="template-table">
            <a-table :columns="checkedTemColumns" :pagination="false" :dataSource="state.templateDataSource"
              size="small">
              <template #action="{ record,index }">
                <a-popconfirm :disabled="type==='info'" title="删除当前选中？" @confirm="operationDelete(index)">
                  <a-button type="link" :disabled="type==='info'" danger>删除</a-button>
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </div>
        <div class="broadcast-template">
          <div class="top-operate">
            <div class="title">广播设备</div>
            <a-button type="primary" :disabled="type==='info'"
              @click="state.selectedDeviceModal.visible = true">添加</a-button>
            <a-button type="danger" :disabled="type==='info'" @click="batchDeleteDevice">批量删除</a-button>
          </div>
          <div class="template-table">
            <a-table :columns="checkedDeviceColumns" rowKey="deviceId" :row-selection="deviceRowSelection"
              :dataSource="state.deviceDataSource" size="small">
              <template #action="{ record,index }">
                <a-popconfirm :disabled="type==='info'" title="删除当前选中？" @confirm="operationDeleteDevice(index)">
                  <a-button type="link" :disabled="type==='info'" danger>删除</a-button>
                </a-popconfirm>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <a-button @click="handleBack">返回</a-button>
      <a-button type="primary" v-if="type!=='info'" :loading="state.loading" @click="handleSave">
        保存
      </a-button>
    </div>
    <modalSelectTable title="选择广播模板" url="getbroadcastPage" :columns="templateColumns"
      :selectedKeys="state.selectedTemplateModal.selectedIds" :disabledKeys="state.selectedTemplateModal.selectedIds"
      :search="state.selectedTemplateModal.search" :searchLength="3" :width="800" :enabled="true" :selectType="'radio'"
      @modal-save="changeTemplate" v-model:value="state.selectedTemplateModal.visible">
    </modalSelectTable>
    <modalSelectTable title="选择广播设备" rowKey="deviceId" :beforeGet="beforeGet" url="getSecurityDevicePage"
      :columns="deviceColumns" :selectedRows="state.deviceDataSource"
      :selectedKeys="state.selectedDeviceModal.selectedIds" :search="state.selectedDeviceModal.search" :searchLength="3"
      :width="800" :enabled="true" :selectType="'checkbox'" @modal-save="changeDevice"
      v-model:value="state.selectedDeviceModal.visible">
    </modalSelectTable>
  </div>
</template>


<script setup lang='jsx'>
import { reactive, toRefs, ref, onMounted, computed, getCurrentInstance } from 'vue';
import modalSelectTable from './components/modal-select-table.vue';
import { templateColumns, deviceColumns, checkedDeviceColumns, checkedTemColumns } from './config'
import _ from "lodash";
import { useRoute } from 'vue-router';
const { proxy } = getCurrentInstance();
const route = useRoute()
const formRef = ref(null)
const application = computed(() => {
  return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
});
const type = route.query.type || 'add'
const id = route.query.id || ''
/**
* 数据部分
*/
const state = reactive({
  selectedTemplateModal: {
    visible: false,
    selectedIds: [],
    search: [
      {
        label: "",
        value: "keyword",
        placeholder: "请输入模板名称",
      },
    ]
  },
  formState: {
    name: '',
    remark: ''
  },
  selectedDeviceModal: {
    visible: false,
    selectedIds: [],
    search: [
      {
        label: "",
        value: "keyword",
        placeholder: "请输入设备名称",
      },
    ]
  },
  selectedDeviceIds: [],
  deviceDataSource: [],
  loading: false,
  templateDataSource: []
})
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
  ],
}
const operationDelete = (index) => {
  state.templateDataSource.splice(index, 1)
  state.selectedTemplateModal.selectedIds.splice(index, 1)
}
const operationDeleteDevice = (index) => {
  state.deviceDataSource.splice(index, 1)
  state.selectedDeviceModal.selectedIds.splice(index, 1)
}

const deviceRowSelection = computed(() => {
  return {
    selectedRowKeys: state.selectedDeviceIds,
    onChange: (selectedRowKeys, selectedRows) => {
      state.selectedDeviceIds = selectedRowKeys
    },
  };
})
const handleBack = () => {
  history.back();
}
const handleSave = async () => {
  try {
    state.loading = true
    await formRef.value?.validate()
    if (!state.templateDataSource.length) return proxy.$message.warning("请选择模板")
    if (!state.deviceDataSource.length) return proxy.$message.warning("请选择设备")
    const templates = state.templateDataSource.map(item => {
      return {
        templateId: item.id,
        templateName: item.name,
        templateContent: item.content
      }
    })
    const devices = state.deviceDataSource.map(item => {
      return {
        ...item,
        deviceAreaId: item.areaId,
        deviceAreaName: item.areaName,
      }
    })
    const params = {
      ...state.formState,
      enabled: true,
      templates,
      devices
    }
    type === 'add' && await proxy.$api.addBroadcastRule(params)
    type === 'edit' && await proxy.$api.updateBroadcastRule(id, params)
    proxy.$message.success("操作成功")
    handleBack()
  } catch (error) {

  } finally {
    state.loading = false
  }

}

const handleAddTemplate = () => {
  state.selectedTemplateModal.visible = true
}
const handleAddDevice = () => {
  state.selectedDeviceModal.visible = true
}
const handleTemplateOk = () => {
  state.selectedTemplateModal.visible = false
}
const handleDeviceOk = () => {
  state.selectedDeviceModal.visible = false
}
const handleTemplateCancel = () => {
}
const changeTemplate = (selectedIds, selectedRows) => {
  state.selectedTemplateModal.selectedIds = selectedIds
  state.templateDataSource = selectedRows
}
const batchDeleteDevice = () => {
  state.deviceDataSource = state.deviceDataSource.filter(item => !state.selectedDeviceIds.includes(item.deviceId))
  state.selectedDeviceModal.selectedIds = state.selectedDeviceModal.selectedIds.filter(item => !state.selectedDeviceIds.includes(item))
  state.selectedDeviceIds = []
}
const beforeGet = (value) => {
  return {
    ...value,
    applicationCode: JSON.parse(sessionStorage.getItem("GH-currentApplication")).code || '',
  };
}
const changeDevice = (selectedIds, selectedRows) => {
  state.selectedDeviceModal.selectedIds = selectedIds
  state.deviceDataSource = selectedRows
}
const getRuleInfo = async () => {
  const data = await proxy.$api.getBroadcastRuleInfo({ id })
  state.formState.name = data.name
  state.formState.remark = data.remark
  state.deviceDataSource = data.devices.map(item => {
    return {
      ...item,
      areaId: item.deviceAreaId,
      areaName: item.deviceAreaName,
    }
  })
  state.selectedDeviceModal.selectedIds = data.devices.map(item => item.deviceId)
  state.templateDataSource = data.templates.map(item => {
    return {
      id: item.templateId,
      name: item.templateName,
      content: item.templateContent
    }
  })
  state.selectedTemplateModal.selectedIds = data.templates.map(item => item.templateId)
}
onMounted(() => {
  type !== 'add' && getRuleInfo()
})
// 使用toRefs解构
// let { } = { ...toRefs(state) } 
defineExpose({
  ...toRefs(state)
})

</script>

<style scoped lang='less'>
.board-rule-details {
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    overflow-y: auto;

  }

  .form {
    width: 80%;
    padding: 24px;
    padding-bottom: 0;
  }

  .rule-config {
    .broadcast-template {
      padding: 24px;
      padding-bottom: 0;

      .top-operate {
        display: flex;
        align-items: center;
        gap: 20px;

        .title {
          font-size: 14px;
          font-weight: 500;
          color: #000;
        }
      }

      .template-table {
        margin-top: 12px;
      }
    }

  }

  .footer {
    padding: 12px 0;
    border-top: 1px solid #f3f3f3;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>