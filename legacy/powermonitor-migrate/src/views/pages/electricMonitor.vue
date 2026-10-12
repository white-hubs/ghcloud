<template>
  <a-config-provider>
    <g-layout :title="pageTitle">
      <template #header-btn>
        <a-button type="primary" @click="batchRemove">切换二维</a-button>
      </template>
      <template #content-left>
        <a-tabs v-model:activeKey="activeKey" type="card" :destroyInactiveTabPane="true">
          <a-tab-pane key="1" tab="设备区域">
            <div class="tab-pane-content">
              <checkTree url="getComAreaTree" :params="{
                  applicationCode: 'ELECTRICAL',
                }" :defaultExpandAll="true" :numType="'num'" :nameType="'name'" v-model:value="search.areaId"
                @change="changePage(1, 10)" :checkable="false" :showIcon="true"></checkTree>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="设备状态">
            <div class="tab-pane-content">
              <checkTree url="getComStatusList" v-model:value="search.status" :params="{
                  applicationCode: 'ELECTRICAL',
                }" :numType="'num'" :nameType="'title'" :checkable="false" :defaultProps="{
                  children: 'children',
                  key: 'name',
                  label: 'title',
                }" @change="changePage(1, 10)"></checkTree>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="产品分类">
            <div class="tab-pane-content">
              <checkTree url="getComApplicationGenreVo" :params="{
                  applicationCode: 'ELECTRICAL',
                }" :numType="'num'" :nameType="'genreName'" :checkable="false" :defaultProps="{
                  children: 'children',
                  key: 'genre',
                  label: 'genreName',
                }" v-model:value="search.genre" @change="changePage(1, 10)"></checkTree>
            </div>
          </a-tab-pane>
          <a-tab-pane key="4" tab="我的收藏">
            <div class="tab-pane-content">
              <checkTree url="getComDeviceCollection" :params="{
                  applicationCode: 'ELECTRICAL',
                }" :numType="'num'" :nameType="'deviceName'" :checkable="false" :defaultProps="{
                  children: 'children',
                  key: 'deviceId',
                  label: 'deviceName',
                }" v-model:value="search.deviceId" @change="changePage(1, 10)"></checkTree>
            </div>
          </a-tab-pane>
        </a-tabs>
      </template>
      <!-- 预留搜索查询位置 -->
      <!-- <template #content-search>
          <a-form layout="inline">
            <a-form-item>
              <a-input
                v-model:value="search.keyword"
                placeholder="输入设备名称搜索"
              ></a-input>
            </a-form-item>
            <a-form-item>
              <a-space :size="16">
                <a-button type="primary" @click="getEquipmentAccountList">
                  查询
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </template> -->
      <template #content-table>
        <a-spin :spinning="spinning">
          <div class="cardContent">
            <div>
              <div id="pageTable" class="pageCard" :style="{ height: scrollY }">
                <div class="cardData" v-if="cardData">
                  <devicePanel ref="devicePanel" :cardData="cardData" :deilPath="'/electricMonitorDeil'"
                    @updata="getEquipmentAccountList()"></devicePanel>
                </div>

                <div v-else>
                  <a-empty />
                </div>
              </div>
            </div>

            <div style="text-align: right"></div>
          </div>
        </a-spin>
      </template>

      <template #footer-page>
        <a-pagination show-size-changer v-model:current="search.pageNumber" v-model:page-size="search.pageSize"
          :total="total" :show-total="total => `共 ${total} 条数据`" @change="changePage" @showSizeChange="changePage" />
      </template>
    </g-layout>
  </a-config-provider>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  getCurrentInstance,
  createVNode,
} from "vue";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import checkTree from "./components/checkTree.vue";
import devicePanel from "./components/devicePanel.vue";
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { checkTree, devicePanel },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const activeKey = ref("1");
    const defaultProps = ref({
      children: "children",
      key: "id",
      title: "name",
    });
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      cardData: [
        {
          deviceName: "消防水泵",
          areaName: "南区综合大楼1号",
          status: "正常",
          collection: true,
          images: [],
        },
        {
          deviceName: "消防水泵",
          areaName: "南区综合大楼1号",
          status: "正常",
          collection: true,
          images: [],
        },
      ],
      data: [],
      search: {
        pageNumber: 1,
        pageSize: 10,
        keyword: null,
        // areaId: null,
        status: null,
        genreId: "",
      },
      areaNewId: null,
      total: 0,
      selectedRowKeys: [],
      scrollY: 300,
      spinning: false,
    });
    const modal = reactive({
      visible: false,
      tableData: [],

      form: {
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      tableTotal: 0,
      selectedTableRowKeys: [],
      ids: [],
    });
    onMounted(() => {
      getEquipmentAccountList();
      getScrollY();
    });

    // 获取设备台账列表
    const getEquipmentAccountList = async () => {
      if (!state.search.areaId) {
        state.search.areaId = [];
      }
      state.spinning = true;
      const data = await proxy.$api.getDeviceMonitoringPage(state.search);
      if (data) {
        state.cardData = data.records;
        state.total = data.total;
      }
      state.spinning = false;
    };
    const changePage = (current, pageSize) => {
      state.search.pageSize = pageSize;
      state.search.pageNumber = current;
      getEquipmentAccountList();
    };

    const initModalData = () => {
      modal.form = {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      };
      modal.selectedTableRowKeys = [];
    };
    // 导入设备
    const handelOk = async () => {
      const data = await proxy.$api.addEquipmentAccount(
        modal.selectedTableRowKeys,
      );
      if (data) {
        modal.visible = false;
        getEquipmentAccountList();
        initModalData();
      }
    };

    // 切换
    const batchRemove = () => {
      if (state.selectedRowKeys.length) {
        Modal.confirm({
          title: "是否确认移除选中的设备？",
          icon: createVNode(ExclamationCircleOutlined),
          async onOk() {
            const data = await proxy.$api.batchDeleteEquipment({
              ids: state.selectedRowKeys.join(","),
            });
            if (data) {
              getEquipmentAccountList();
              state.selectedRowKeys = [];
            }
          },
        });
      } else {
        proxy.$message("请选择设备");
      }
    };

    const getScrollY = () => {
      const dome = document.getElementById("pageTable");
      state.scrollY = dome.offsetHeight - 60;
    };
    return {
      defaultProps,
      ...toRefs(state),
      ...toRefs(modal),
      activeKey,
      handelOk,
      changePage,
      batchRemove,
      getEquipmentAccountList,
    };
  },
});
</script>

<style lang="less" scoped>
.cardData {
  height: 700px;
  overflow: auto;
}

:deep(.content-left) {
  padding: 0 16px;
  border-right: 1px solid #f0f0f0;
}

:deep(.content-right) {
  overflow: auto !important;
  padding: 0 0px;
}

:deep(.ant-tabs-bar) {
  margin: 0 !important;
  padding: 0px;
}

.tab-pane-content {
  height: 100%;
  overflow: auto;
}

.table-body {
  margin: 16px 0;
}

.page-body {
  width: 100%;
  text-align: right;
}

#pageTable {
  height: 100%;
}

.cardContent {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // height: 700px;
  overflow-y: auto;
}
</style>
