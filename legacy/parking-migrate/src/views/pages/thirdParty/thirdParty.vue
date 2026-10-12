<template>
  <g-layout-no-footer title="车场三方数据">
    <template v-slot:content-table>
      <a-form layout="inline" :model="formState" style="margin-bottom: 12px">
        <a-form-item label="名称">
          <a-input v-model:value="formState.keyword" placeholder="输入名称" style="width: 220px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="search">查询</a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="reset">重置</a-button>
        </a-form-item>
        <a-form-item style="margin-left: auto">
          <a-button type="primary" @click="openCreate">新增</a-button>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        bordered
        @change="handleTableChange"
      />
    </template>
  </g-layout-no-footer>

  <a-modal
    v-model:visible="edit.visible"
    :title="edit.readonly ? '详情' : edit.form.code ? '编辑' : '新增'"
    width="600px"
    :footer="null"
    destroy-on-close
  >
    <a-form :model="edit.form" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-form-item label="选择车场" required>
        <a-select
          v-model:value="edit.form.parkingCode"
          :options="parkingOptions"
          :disabled="edit.readonly"
          placeholder="选择所属车场"
          style="width: 100%"
          allowClear
          show-search
          :filter-option="(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())"
        />
      </a-form-item>
      <a-form-item label="三方数据接口" required>
        <a-input v-model:value="edit.form.interfaceKey" :disabled="edit.readonly" placeholder="如：某keyXXXXX" />
      </a-form-item>
    </a-form>
    <div class="footer-actions" style="margin-top: 12px">
      <a-space>
        <a-button v-if="!edit.readonly" type="primary" @click="confirmEdit">确定</a-button>
        <a-button @click="edit.visible = false">取 消</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="jsx">
import { message } from "ant-design-vue";
import { defineComponent, reactive, ref, getCurrentInstance, onMounted } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";

export default defineComponent({
  name: "ThirdParty",
  setup() {
    const { proxy } = getCurrentInstance();

    const queryState = useCubeQueryState({
      storage: "url",
      initialState: { keyword: "", pageNumber: 1, pageSize: 10, total: 0 },
      cacheFields: ["keyword", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") return Number(raw);
        return raw ?? "";
      },
    });

    const loading = ref(false);
    const dataSource = ref([]);
    const pagination = reactive({
      current: queryState.state.pageNumber,
      pageSize: queryState.state.pageSize,
      total: queryState.state.total,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    });

    const formState = reactive({ keyword: queryState.state.keyword });
    const columns = [
      {
        title: "编号",
        dataIndex: "code",
        key: "code",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "车场名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "所在区域",
        dataIndex: "region",
        key: "region",
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 160,
        customRender: ({ record }) => [
          <a-button type="link" onClick={() => openEdit(record)}>
            编辑
          </a-button>,
          <a-button type="link" onClick={() => openDetail(record)}>
            详情
          </a-button>,
        ],
      },
    ];

    const parkingOptions = ref([]);
    const edit = reactive({
      visible: false,
      readonly: false,
      form: { code: "", name: "", region: "", parkingCode: undefined, interfaceKey: "" },
    });

    /**
     * 查询三方数据列表
     */
    async function query() {
      try {
        loading.value = true;
        const params = {
          keyword: formState.keyword,
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
        };

        const res = await proxy.$api.getParkingListWithConfig(params);
        const records = res?.records || [];
        pagination.total = res?.total || 0;
        queryState.state.total = res?.total || 0;
        queryState.state.pageNumber = pagination.current;
        queryState.state.pageSize = pagination.pageSize;
        queryState.state.keyword = formState.keyword;
        queryState.writeCache();

        const listWithConfig = await Promise.all(
          records.map(async (record) => {
            let config = record.dockConfig?.config || record.config || "";

            if (!config) {
              try {
                const configRes = await proxy.$api.getDockConfig(record.id);
                config = configRes?.config || "";
              } catch (e) {}
            }

            return {
              ...record,
              region: record.areaName,
              sourceKey: config,
            };
          }),
        );

        dataSource.value = listWithConfig;
      } catch (e) {
        message.error("列表数据获取失败");
      } finally {
        loading.value = false;
      }
    }

    function search() {
      pagination.current = 1;
      queryState.state.pageNumber = 1;
      queryState.state.keyword = formState.keyword;
      queryState.writeCache();
      query();
    }

    function handleTableChange(pag) {
      pagination.current = pag.current;
      pagination.pageSize = pag.pageSize;
      queryState.state.pageNumber = pag.current;
      queryState.state.pageSize = pag.pageSize;
      query();
    }

    /**
     * 重置查询条件并刷新
     */
    function reset() {
      formState.keyword = "";
      queryState.update({ keyword: "", pageNumber: 1, pageSize: 10 });
      queryState.clearCache();
      pagination.current = 1;
      pagination.pageSize = 10;
      query();
    }

    /**
     * 打开新增弹窗
     */
    function openCreate() {
      edit.visible = true;
      edit.readonly = false;
      edit.form = { code: "", name: "", region: "", parkingCode: undefined, interfaceKey: "" };
    }

    /**
     * 打开编辑弹窗并回显所有字段
     * @param {Object} record 列表记录
     */
    function openEdit(record) {
      edit.visible = true;
      edit.readonly = false;
      edit.form = {
        code: record.code,
        name: record.name,
        region: record.region,
        parkingCode: record.id,
        interfaceKey: record.sourceKey,
      };
    }

    /**
     * 打开详情弹窗（只读）
     * @param {Object} record 列表记录
     */
    function openDetail(record) {
      edit.visible = true;
      edit.readonly = true;
      edit.form = {
        code: record.code,
        name: record.name,
        region: record.region,
        parkingCode: record.id,
        interfaceKey: record.sourceKey,
      };
    }

    /**
     * 确认新增/编辑
     */
    async function confirmEdit() {
      // 校验
      if (!edit.form.parkingCode) {
        message.warning("请选择车场");
        return;
      }
      // if (!edit.form.interfaceKey) { message.warning('请输入三方数据接口'); return } // config 可以为空吗？假设必填

      try {
        const payload = {
          id: edit.form.parkingCode, // parkingCode 实际存的是 id
          providerCode: "DEVICE_CENTER",
          config: edit.form.interfaceKey,
        };
        await proxy.$api.saveDockConfig(payload);
        message.success("保存成功");
        edit.visible = false;
        search(); // 刷新列表
      } catch (e) {
        message.error("保存失败");
      }
    }

    /**
     * 拉取车场选项
     */
    async function fetchParkingOptions() {
      try {
        const res = await proxy.$api.getParkingInfors({ source: "SELF_BUILT" }).catch(() => []);
        const list = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : res?.data?.records || [];
        parkingOptions.value = (list || []).map((r) => ({
          label: r.name,
          value: r.id,
        }));
      } catch (e) {}
    }

    onMounted(() => {
      fetchParkingOptions();
      if (queryState.state.keyword) formState.keyword = queryState.state.keyword;
      query();
    });

    return {
      columns,
      dataSource,
      loading,
      pagination,
      formState,
      parkingOptions,
      edit,
      search,
      query,
      handleTableChange,
      reset,
      openCreate,
      openEdit,
      openDetail,
      confirmEdit,
    };
  },
});
</script>

<style lang="less" scoped>
.footer-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
