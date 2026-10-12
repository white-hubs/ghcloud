<template>
  <g-layout-no-footer title="客流量区域">
    <template v-slot:content-table>
      <a-form layout="inline" :model="formState" style="margin-bottom: 12px; display: flex; justify-content: space-between; width: 100%">
        <div style="display: flex">
          <a-form-item label="名称">
            <a-input v-model:value="formState.keyword" placeholder="输入名称" style="width: 220px" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleSearch">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="reset">重置</a-button>
          </a-form-item>
        </div>
        <div style="display: flex; gap: 8px">
          <a-button :loading="exportLoading" :disabled="dataCount === 0" @click="exportTable">导出</a-button>
          <a-button type="primary" @click="goCreate">新增</a-button>
        </div>
      </a-form>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        row-key="id"
        bordered
        :pagination="{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          current: formState.pageNumber,
          pageSize: formState.pageSize,
          total: formState.total,
          showSizeChanger: true,
        }"
        @change="pageChange"
      />
    </template>
    <template v-slot:footer-page>
      <!-- <a-pagination
        v-model:current="formState.pageNumber"
        v-model:pageSize="formState.pageSize"
        :total="formState.total"
        :show-total="total => `共 ${total} 条`"
        show-size-changer
        @change="pageChange"
      /> -->
    </template>
    <a-modal
      v-model:visible="bindModal.visible"
      title="关联信息"
      width="1000px"
      centered
      v-model:confirmLoading="bindModal.confirmLoading"
      @ok="handleBindOk"
      @cancel="bindModal.visible = false"
    >
      <div style="margin-bottom: 16px; display: flex; gap: 8px">
        <a-cascader
          v-model:value="bindModal.region"
          :options="areaTreeData"
          :field-names="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="所属区域"
          allow-clear
          change-on-select
          style="width: 200px"
        />
        <a-input v-model:value="bindModal.keyword" placeholder="请输入名称" style="width: 200px" />
        <a-button type="primary" @click="handleBindQuery">查询</a-button>
        <a-button @click="handleBindReset">重置</a-button>
      </div>
      <a-table
        :columns="bindColumns"
        :data-source="bindModal.dataSource"
        :loading="bindModal.loading"
        row-key="id"
        :scroll="{ y: 450 }"
        :pagination="{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          current: bindModal.pageNumber,
          pageSize: bindModal.pageSize,
          total: bindModal.total,
          showSizeChanger: true,
        }"
        :row-selection="{
          selectedRowKeys: bindModal.selectedRowKeys,
          onChange: (keys) => (bindModal.selectedRowKeys = keys),
        }"
        @change="handleBindPageChange"
      />
    </a-modal>
  </g-layout-no-footer>
</template>

<script lang="jsx">
import { message, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, computed, getCurrentInstance, onMounted } from "vue";

import { useListQueryCache } from "@ghcloud/cube-utils";

import { getInstanceList } from "../../../api/device";
import { trafficBindDevices, deleteTrafficView, exportTrafficAreas } from "../../../api/park";
import { cubeOuaaService } from "../../../api/service";

export default defineComponent({
  name: "ParkingManagement",
  setup() {
    const { proxy } = getCurrentInstance();

    const loading = ref(false);
    const exportLoading = ref(false);
    const dataSource = ref([]);
    const formState = reactive({ keyword: "", pageNumber: 1, pageSize: 10, total: 0 });
    const dataCount = computed(() => formState.total || 0);

    // 绑定弹窗相关状态
    const bindModal = reactive({
      visible: false,
      confirmLoading: false,
      loading: false,
      currentParkingId: null,
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
      pageNumber: 1,
      pageSize: 10,
      keyword: "",
      region: undefined,
    });

    const areaTreeData = ref([]);
    const queryCache = useListQueryCache({
      defaults: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        keyword: formState.keyword,
        pageNumber: formState.pageNumber,
        pageSize: formState.pageSize,
      }),
      setState: (next) => {
        formState.keyword = (next.keyword ?? "")?.toString();
        formState.pageNumber = Number(next.pageNumber ?? 1);
        formState.pageSize = Number(next.pageSize ?? 10);
      },
      decode: (query) => ({
        keyword: typeof query.keyword === "string" ? query.keyword : "",
        pageNumber: typeof query.pageNumber === "string" ? Number(query.pageNumber) : 1,
        pageSize: typeof query.pageSize === "string" ? Number(query.pageSize) : 10,
      }),
      encode: (state) => ({
        keyword: state.keyword || undefined,
        pageNumber: Number(state.pageNumber) === 1 ? undefined : String(state.pageNumber),
        pageSize: Number(state.pageSize) === 10 ? undefined : String(state.pageSize),
      }),
    });

    const columns = [
      {
        title: "区域名称",
        dataIndex: "name",
        key: "name",
        customRender: ({ text }) => (
          <a-popover position="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "区域描述",
        dataIndex: "remark",
        key: "remark",
        customRender: ({ text }) => (
          <a-popover position="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "区域客流量个数",
        dataIndex: "personFlowCount",
        key: "personFlowCount",
        customRender: ({ text }) => <span>{text ?? "--"}</span>,
      },
      {
        title: "编辑时间",
        dataIndex: "updateTime",
        key: "updateTime",
        customRender: ({ text }) => (
          <a-popover position="topLeft" content={dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "--"}>
            {dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "--"}
          </a-popover>
        ),
      },
      {
        title: "操作",
        key: "action",
        width: 330,
        customRender: ({ record }) => [
          <a-button type="link" onClick={() => goEdit(record)}>
            编辑
          </a-button>,
          <a-button type="link" onClick={() => goDetail(record)}>
            详情
          </a-button>,
          <a-button type="link" onClick={() => openBindModal(record)}>
            关联设备
          </a-button>,
          <a-button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </a-button>,
        ],
      },
    ];

    const bindColumns = [
      {
        title: "设备编号",
        dataIndex: "code",
        key: "code",
        ellipsis: true,
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "设备名称",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        customRender: ({ text }) => (
          <a-popover placement="topLeft" content={text || "--"}>
            {text || "--"}
          </a-popover>
        ),
      },
      {
        title: "所属产品",
        dataIndex: ["productInfo", "name"],
        key: "productInfo.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.productInfo?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "产品品类",
        dataIndex: ["productInfo", "productCategory", "name"],
        key: "productInfo.productCategory.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.productInfo?.productCategory?.name || record.productCategory?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "维护部门",
        dataIndex: ["department", "name"],
        key: "department.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.department?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
      {
        title: "所在区域",
        dataIndex: ["area", "name"],
        key: "area.name",
        ellipsis: true,
        customRender: ({ record }) => {
          const text = record.area?.name || "--";
          return (
            <a-popover placement="topLeft" content={text}>
              {text}
            </a-popover>
          );
        },
      },
    ];

    // functions: 查询列表数据
    async function query() {
      try {
        loading.value = true;
        const params = { keyword: formState.keyword, source: "SELF_BUILT", pageNumber: formState.pageNumber, pageSize: formState.pageSize };
        const res = await proxy.$api.getTrafficAreasList(params);
        const list = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : res?.data?.records || [];
        const total = res?.total ?? res?.data?.total ?? list.length;
        dataSource.value = list;
        formState.total = total;
        await queryCache.sync();
      } catch (err) {
        message.error("列表数据获取失败");
      } finally {
        loading.value = false;
      }
    }

    // functions: 查询（重置到第一页）
    function handleSearch() {
      formState.pageNumber = 1;
      query();
    }
    // functions: 重置并查询
    async function reset() {
      await queryCache.reset();
      await query();
    }

    // functions: 分页变化
    function pageChange(page) {
      formState.pageNumber = page.current;
      formState.pageSize = page.pageSize;
      query();
    }

    // functions: 跳转到新增页面
    function buildTargetPath(page, query = {}) {
      const segments = window.location.pathname.split("/");
      segments[segments.length - 1] = page;
      const pathname = segments.join("/").replace(/\/{2,}/g, "/");
      const queryString = Object.keys(query)
        .filter((key) => query[key] !== undefined && query[key] !== null && query[key] !== "")
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
        .join("&");
      return `${pathname}${queryString ? `?${queryString}` : ""}`;
    }
    function goCreate() {
      history.pushState({ current: location.pathname + location.search }, "", buildTargetPath("trafficAreaCreate"));
    }

    // functions: 导出列表
    async function exportTable() {
      exportLoading.value = true;
      try {
        const result = await exportTrafficAreas({
          keyword: formState.keyword,
          source: "SELF_BUILT",
        });
        const link = document.createElement("a");
        const fileBlob = new Blob([result?.data || result], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(fileBlob);
        link.setAttribute("download", "客流量区域.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        exportLoading.value = false;
      } catch (error) {
        proxy?.$message?.error ? proxy.$message.error("导出失败") : message.error("导出失败");
        exportLoading.value = false;
      }
    }

    // functions: 跳转到编辑页面
    function goEdit(record) {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        buildTargetPath("trafficAreaCreate", { id: record.id, mode: "edit" }),
      );
    }

    // functions: 跳转到详情页面
    function goDetail(record) {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        buildTargetPath("trafficAreaDetail", { id: record.id, mode: "detail" }),
      );
    }

    // functions: 获取区域树
    async function fetchAreaTree() {
      try {
        const res = await cubeOuaaService.getAreaTree();
        areaTreeData.value = res;
      } catch (error) {}
    }

    // functions: 打开关联设备弹窗
    function openBindModal(record) {
      bindModal.currentParkingId = record.id;
      bindModal.visible = true;
      bindModal.pageNumber = 1;
      bindModal.keyword = "";
      bindModal.region = undefined;
      bindModal.selectedRowKeys = []; // Reset selection
      loadDetailDevice(record.id);
      fetchBindDevices();
    }
    async function loadDetailDevice(id) {
      try {
        let res = null;
        if (proxy.$api.getTrafficAreasDevices) {
          const query = {
            pageNumber: 1,
            pageSize: 1000,
            keyword: "",
            id,
          };
          res = await proxy.$api.getTrafficAreasDevices(query);
        }
        const data = res?.data || res || {};
        bindModal.selectedRowKeys = data.records.map((t) => t.id);
      } catch {}
    }
    // functions: 获取可关联设备列表
    async function fetchBindDevices() {
      bindModal.loading = true;
      try {
        const params = {
          pageNumber: bindModal.pageNumber,
          pageSize: bindModal.pageSize,
          keyword: bindModal.keyword,
          anyMatchedAreaId: bindModal.region && bindModal.region.length ? bindModal.region.join("-") : undefined,
          tagCodes: ["builtin.app::TRAFFIC_DETECTION"],
        };
        const res = await getInstanceList(params);
        bindModal.dataSource = res?.records || [];
        bindModal.total = res?.total || 0;
      } catch (error) {
        message.error("获取设备列表失败");
      } finally {
        bindModal.loading = false;
      }
    }

    // functions: 弹窗查询
    function handleBindQuery() {
      bindModal.pageNumber = 1;
      fetchBindDevices();
    }

    // functions: 弹窗重置
    function handleBindReset() {
      bindModal.keyword = "";
      bindModal.region = undefined;
      bindModal.pageNumber = 1;
      fetchBindDevices();
    }

    // functions: 弹窗分页
    function handleBindPageChange(pagination) {
      bindModal.pageNumber = pagination.current;
      bindModal.pageSize = pagination.pageSize;
      fetchBindDevices();
    }

    // functions: 确认关联
    async function handleBindOk() {
      bindModal.confirmLoading = true;
      // if (bindModal.selectedRowKeys.length === 0) {
      //   message.warning('请选择要关联的设备')
      //   return
      // }
      try {
        await trafficBindDevices({
          parkingId: bindModal.currentParkingId,
          deviceIds: bindModal.selectedRowKeys,
        });
        message.success("关联设备成功");
        bindModal.visible = false;
      } catch (error) {
        message.error("关联设备失败");
      } finally {
        bindModal.confirmLoading = false;
      }
    }

    // functions: 删除车场
    function handleDelete(record) {
      Modal.confirm({
        title: "确认删除",
        content: `是否确认删除车场 "${record.name}"？`,
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        onOk: async () => {
          try {
            await deleteTrafficView(record.id);
            message.success("删除成功");
            // 如果当前页只有一条数据且不是第一页，则向前翻页
            if (dataSource.value.length === 1 && formState.pageNumber > 1) {
              formState.pageNumber -= 1;
            }
            query();
          } catch (error) {
            message.error("删除失败");
          }
        },
      });
    }

    onMounted(() => {
      queryCache.hydrateAndQuery(query);
      fetchAreaTree();
    });

    return {
      columns,
      dataSource,
      formState,
      loading,
      exportLoading,
      dataCount,
      query,
      handleSearch,
      reset,
      pageChange,
      goCreate,
      goEdit,
      goDetail,
      handleDelete,
      bindModal,
      areaTreeData,
      bindColumns,
      exportTable,
      openBindModal,
      handleBindQuery,
      handleBindReset,
      handleBindPageChange,
      handleBindOk,
    };
  },
});
</script>

<style lang="less" scoped>
.page-container {
  background: #fff;
}
</style>
