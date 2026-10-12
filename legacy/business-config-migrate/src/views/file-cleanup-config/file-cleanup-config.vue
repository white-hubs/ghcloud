<template>
  <g-layout :title="pageTitle">
    <template #header-btn>
      <slot name="header-btns" :record="selectedRows" />
      <a-button type="primary" @click="operationRecord('add')"> 新增 </a-button>
    </template>
    <template #content-search>
      <a-form layout="inline" :model="queryState.state">
        <a-form-item>
          <a-input placeholder="请输入场景" v-model:value="queryState.state.sceneCode" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="searchRecord">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </template>
    <template #content-table>
      <a-table :columns="columns" :loading="loading" :dataSource="dataSource" :pagination="false" size="small" :scroll="{ y: 500 }">
        <template #action="{ record }">
          <a-button type="link" @click="operationRecord('edit', record)">编辑</a-button>
          <a-popconfirm title="确认是否删除配置?" ok-text="是" cancel-text="否" @confirm="delRecord(record.id)">
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </template>
    <template #footer-page>
      <a-pagination
        show-size-changer
        v-model:pageSize="queryState.state.pageSize"
        v-model:current="queryState.state.pageNumber"
        :total="queryState.state.total"
        :default-current="1"
        :show-total="(total) => `共 ${total} 条数据`"
        @change="onShowSizeChange"
        @showSizeChange="onShowSizeChange"
      ></a-pagination>
    </template>
    <a-modal v-model:visible.sync="modalVisible" width="600px" :title="modalName" @ok="submitModal" centered>
      <a-form :model="modalForm" :rules="rules" ref="formRef" :label-col="{ span: 5 }">
        <a-form-item name="sceneCode" label="场景">
          <a-select v-model:value="modalForm.sceneCode" placeholder="请选择场景">
            <a-select-option v-for="item in modal[0].options" :value="item.sceneCode">{{ item.sceneName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="expirationPolicy" label="文件过期策略">
          <a-select v-model:value="modalForm.expirationPolicy" placeholder="请选择文件过期策略">
            <a-select-option v-for="item in modal[1].options" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="multipleDays" label="保存天数">
          <a-input-number id="inputNumber" :precision="0" v-model:value="modalForm.multipleDays" :min="0" :max="99999" /> 天
        </a-form-item>
        <a-form-item label="延迟天数" name="delayDays">
          <a-input-number id="inputNumber" :precision="0" v-model:value="modalForm.delayDays" :min="0" :max="99999" /> 天
        </a-form-item>
      </a-form>
    </a-modal>
  </g-layout>
</template>
<script lang="jsx">
import gTable from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gTable.vue";
import { message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, toRefs } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeFileService } from "@/api/service";

export default defineComponent({
  components: { gTable },
  setup() {
    const { pageTitle } = usePageName();
    const queryState = useCubeQueryState({
      initialState: {
        sceneCode: "",
        pageNumber: 1,
        pageSize: 20,
        total: 0,
      },
      storage: "url",
      cacheFields: ["sceneCode", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });
    // 数据
    const state = reactive({
      modalVisible: false,
      formRef: "",
      loading: false,
      columns: [
        {
          dataIndex: "sceneName",
          title: "场景",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "expirationPolicy",
          title: "文件过期策略",
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? state.modal[1].options.find((x) => x.value === text)?.label : ""}>
                {text ? state.modal[1].options.find((x) => x.value === text)?.label : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "multipleDays",
          title: "保存天数",
          customRender: ({ record }) => {
            const info = JSON.parse(record.configInfo);
            return (
              <PopOver position="topLeft" content={info.multipleDays ? info.multipleDays : ""}>
                {info.multipleDays ? info.multipleDays : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "delayDays",
          title: "延迟天数",
          customRender: ({ record }) => {
            const info = JSON.parse(record.configInfo);
            return (
              <PopOver position="topLeft" content={info.delayDays ? info.delayDays : ""}>
                {info.delayDays ? info.delayDays : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          fixed: "right",
          slots: {
            customRender: "action",
          },
        },
      ],
      dataSource: [],
      modalForm: {
        expirationPolicy: "",
        sceneCode: "",
        multipleDays: 0,
        delayDays: 0,
      },
      modalName: "新增",
      modal: [
        {
          label: "场景",
          options: [],
          value: "sceneCode",
        },
        {
          label: "文件过期策略",
          options: [{ label: "基于时间过期", value: "BASED_ON_TIME_EXPIRATION" }],
          value: "expirationPolicy",
        },
      ],
      rules: {
        sceneCode: [{ required: true, message: "请选择场景" }],
        expirationPolicy: [{ required: true, message: "请选择文件过期策略" }],
        multipleDays: [{ required: true, message: "请输入天数" }],
        delayDays: [{ required: true, message: "请输入天数" }],
      },
    });
    const operationRecord = (type, record) => {
      if (type === "edit") {
        state.modalName = "编辑";
        state.modalForm.id = record.id;
        state.modalForm.expirationPolicy = record.expirationPolicy;
        state.modalForm.sceneCode = record.sceneCode;
        state.modalForm.multipleDays = JSON.parse(record.configInfo)?.multipleDays;
        state.modalForm.delayDays = JSON.parse(record.configInfo)?.delayDays;
      } else {
        state.modalName = "新增";
        state.modalForm.expirationPolicy = "";
        state.modalForm.sceneCode = "";
        state.modalForm.multipleDays = undefined;
        state.modalForm.delayDays = undefined;
      }
      state.modalVisible = true;
    };
    // 删除
    const delRecord = async (id) => {
      try {
        await cubeFileService.delExpirationPolicy(id);
        tableList();
        message.success("删除成功");
      } catch (err) {
        message.error("删除失败");
      }
    };
    const tableList = async () => {
      try {
        state.loading = true;
        const { records, total } = await cubeFileService.getExpirationPolicyPage(queryState.state);
        queryState.update({ total });
        state.dataSource = records;
        queryState.writeCache();
      } catch (err) {
      } finally {
        state.loading = false;
      }
    };
    const searchRecord = () => {
      queryState.resetPage();
      queryState.writeCache();
      tableList();
    };
    const reset = () => {
      queryState.update({ sceneCode: "" });
      queryState.resetPage();
      queryState.clearCache();
      tableList();
    };
    const onShowSizeChange = (page, pageSize) => {
      queryState.setPage(page, pageSize);
      tableList();
    };
    // 提交
    const submitModal = async () => {
      await state.formRef.validate();
      const query = {
        id: state.modalForm.id,
        sceneCode: state.modalForm.sceneCode,
        expirationPolicy: state.modalForm.expirationPolicy,
        configInfo: JSON.stringify({ delayDays: state.modalForm.delayDays, multipleDays: state.modalForm.multipleDays }),
      };
      try {
        if (state.modalName === "编辑") {
          await cubeFileService.editExpirationPolicy(query);
        } else {
          await cubeFileService.addExpirationPolicy(query);
        }
        tableList();
        message.success("保存成功");
      } catch (err) {
        message.error(err?.errorMessage ?? "保存失败");
      } finally {
        state.modalVisible = false;
      }
    };
    onMounted(async () => {
      tableList();
      state.modal[0].options = await cubeFileService.getSceneInfo();
    });

    return {
      ...toRefs(state),
      queryState,
      reset,
      operationRecord,
      delRecord,
      searchRecord,
      submitModal,
      onShowSizeChange,
      pageTitle,
    };
  },
});
</script>
<style lang="less" scoped>
.a {
  display: none;
}
</style>
