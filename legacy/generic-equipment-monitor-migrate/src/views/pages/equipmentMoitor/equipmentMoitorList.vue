<template>
  <g-layout :title="pageTitle">
    <template #header-btn>
      <div style="display: flex;align-items: center;gap: 10px;">
        <a-form layout="inline">
          <a-form-item label="设备名称">
            <a-input v-model:value="search.keyword" placeholder="请输入设备名称" />
          </a-form-item>
          <a-form-item>
            <a-space :size="16">
              <a-button type="primary" @click="handleQuery">查询</a-button>
              <a-button type="default" @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
        <a-button type="primary" @click="drawVisible=true">面板配置</a-button>
        <a-button type="primary" @click="fullScreen">全屏</a-button>
      </div>
    </template>
    <template #content-left>
      <a-tabs v-model:activeKey="activeKey" type="card" :destroyInactiveTabPane="true" @change="activeKeyChange">
        <a-tab-pane key="1" tab="设备区域">
          <div class="tab-pane-content">
            <checkTree 
              url="getComAreaTree" 
              :params="{applicationCode: applicationCode}" 
              :defaultExpandAll="true"
              :numType="'deviceNum'" 
              :nameType="'name'" 
              v-model:value="search.areaId" 
              @change="changePage(1, PAGE_SIZE)"
              :checkable="false" 
              :showIcon="true" 
              :disabled="spinning"
            />
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="设备状态">
          <div class="tab-pane-content">
            <checkTree 
              url="getComStatusList" 
              v-model:value="search.deviceStatus"
              :params="{applicationCode: applicationCode}" 
              :numType="'num'" 
              :nameType="'title'" 
              :checkable="false"
              :disabled="spinning"
              :useFilter="false" 
              :defaultProps="{
                children: 'children',
                key: 'name',
                label: 'title',
              }" 
              @change="changePage(1, PAGE_SIZE)" 
            />
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="产品品类">
          <div class="tab-pane-content">
            <checkTree 
              url="getComApplicationGenreVo" 
              :params="{applicationCode: applicationCode}" 
              :numType="'num'"
              :nameType="'deviceProdCategoryName'" 
              :checkable="false" 
              :disabled="spinning"
              :defaultProps="{
                children: 'children',
                key: 'deviceProdCategoryCodeConcat',
                label: 'deviceProdCategoryName',
              }" 
              v-model:value="search.deviceProdCategoryCodeConcat"
              @change="changePage(1, PAGE_SIZE)"
            />
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="我的收藏">
          <div class="tab-pane-content">
            <checkTree 
              url="getComDeviceCollection" 
              :params="{applicationCode: applicationCode}" 
              :numType="'num'"
              :nameType="'deviceName'" 
              :checkable="false" 
              :disabled="spinning"
              :defaultProps="{
                children: 'children',
                key: 'deviceId',
                label: 'deviceName',
              }" v-model:value="search.deviceId" 
              @change="changePage(1, PAGE_SIZE)" 
            />
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template #content-table>
      <a-spin :spinning="spinning">
        <div :class="['cardContent',fullScreenStatus?'full-screen':'']">
          <div v-if="fullScreenStatus" class='sysTitle'>{{sysTitle}}</div>
          <div id="pageTable" ref="pageTableRef" class="pageCard" :style="{ height: scrollY }">
            <div class="cardData" v-if="cardData&&cardData.length">
              <template v-for="item in cardData" :key="item.id" >
                <devicePanel :style="{width:`${fullScreenStatus?'100%':'380px'}`,fontSize:`${fullScreenStatus?'20px':'12px'}`}"  @getList="getEquipmentAccountList" :panelsConfig="panelConfigList" :itemProp="item" />
              </template>
            </div>
            <a-empty v-else/>
          </div>
        </div>
      </a-spin>
    </template>
    <template #footer-page>
      <a-pagination show-size-changer v-model:current="search.pageNumber" v-model:page-size="search.pageSize"
        :total="total" :pageSizeOptions="['24','36','48']" :show-total="total => `共 ${total} 条数据`"
        @change="changePage" @showSizeChange="changePage" />
    </template>
    <a-drawer placement="right" width="80%" rootClassName="custom-draw" :closable="false" v-model:visible="drawVisible"
      :get-container="false" maskClosable>
      <div class="drawer-content">
        <div class="preview">
          <Preview @updateConfig="getPanelConfigList" />
        </div>
        <div class="config">
          <PanelConfig v-model:visible="drawVisible" />
        </div>
      </div>
    </a-drawer>
  </g-layout>
</template>

<script lang="jsx">
import { applicationCodeGroud } from "@/utils/enumerate.js";
import { ExclamationCircleOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import {
  computed, createVNode, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useStore } from "vuex";
import devicePanel from "./components/device-panel/index.vue";
import checkTree from "./checkTree.vue";
import Preview from './components/preview/index.vue'
import PanelConfig from './components/panel-config/index.vue'
import { usePageName } from "@ghcloud/cube-utils"

export default defineComponent({
  components: { checkTree, devicePanel, Preview, PanelConfig },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const applicationCode = ref(null);
    const activeKey = ref("1");
    const defaultProps = ref({
      children: "children",
      key: "id",
      label: "name",
    });
    const PAGE_SIZE=24
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      cardData: [],
      data: [],
      drawVisible: false,
      panelConfigList: [],
      search: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        keyword: null,
        areaId: null,
        deviceStatus: undefined,
        deviceId: null,
        deviceProdCategoryCodeConcat: null,
      },
      total: 0,
      selectedRowKeys: [],
      scrollY: 300,
      spinning: false,
      fullScreenStatus:false,
      startTimeOut:true
    });
    const modal = reactive({
      visible: false,
      tableData: [],

      form: {
        keyword: "",
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      },
      tableTotal: 0,
      selectedTableRowKeys: [],
      ids: [],
    });
    const pageTableRef = ref()
    const sysTitle=computed(()=>{
      return window.config.systemName+'-'+JSON.parse(sessionStorage.getItem("GH-currentApplication")).name
    })
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"))
      });
      applicationCode.value = application.value.code;
      // "会议室管理" 标题显示"设备管理”
      const isMeet = applicationCodeGroud[applicationCode.value]?.includes('会议')
      if (isMeet) state.title = '设备管理'
    })
    const getProductModels = async () => {
      const result = await proxy.$api.getApplicationProductModels({ applicationCode: applicationCode.value })
      return result
    }

    const getPanelConfigList = async () => {
      const modelsList = await getProductModels()
      const params = {
        businessKeys: modelsList.map(item => item.deviceProdId),
        applicationCode: applicationCode.value,
        sceneType: 'LIST_PANEL'
      }
      const configList = await proxy.$api.getDevicePanelConfigList(params)
      state.panelConfigList = configList
    }
    const handleFullscreenchange =()=>{
      if (!document.fullscreenElement) {  
        state.fullScreenStatus = false
      } else {  
        state.fullScreenStatus = true
      }  
    }

    onMounted(() => {
      getPanelConfigList()
      getEquipmentAccountList();
      // 监听全屏状态变化  
      document.addEventListener('fullscreenchange', handleFullscreenchange); 
    });
    onBeforeUnmount(()=>{
      state.startTimeOut = false
      document.removeEventListener('fullscreenchange', handleFullscreenchange); 
    })

    watch(pageTableRef, () => {
      if (!pageTableRef.value) {
        return
      }
      getScrollY();
      getEquipmentAccountList();
    })
    const handleQuery = () => {
      state.search.pageNumber = 1;
      getEquipmentAccountList()
    }
    const handleReset = () => {
      state.search.keyword = ""
      state.search.pageNumber = 1;
      getEquipmentAccountList()
    }
    let timer = null;
    // 获取设备台账列表
    const getEquipmentAccountList = async () => {
      try {
        timer && clearTimeout(timer)
        if (!timer) {
          state.spinning = true;
        }
        const data = await proxy.$api.getDeviceMonitoringPage({ ...state.search, deviceStatus: state.search.deviceStatus ? (state.search.deviceStatus === 'ONLINE' ? true : false) : undefined, applicationCode: applicationCode.value });
        if (data) {
          state.cardData = data.records;
          state.total = data.total;
        }
      } catch (error) {
        
      }finally{
        state.spinning = false;
        if(state.startTimeOut){
          timer = setTimeout(() => { getEquipmentAccountList() }, 5 * 1000);
        }
      }
    };
    const changePage = (current, pageSize) => {
      state.search.pageSize = pageSize || PAGE_SIZE;
      state.search.pageNumber = current || 1;
      getEquipmentAccountList();
    };

    const initModalData = () => {
      modal.form = {
        pageNumber: 1,
        pageSize: 12,
        keyword: "",
      };
      modal.selectedTableRowKeys = [];
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

    //监听tab切换 并把查询条件重置
    const activeKeyChange = () => {
      state.search.areaId = null;
      state.search.keyword = null;
      state.search.deviceStatus = undefined;
      state.search.deviceProdCategoryCodeConcat = null;
      state.search.deviceId = null;
      changePage()
    }

    const fullScreen = ()=>{
      const elem = document.querySelector(".g-layout-container");  
      if (elem.requestFullscreen) {  
        elem.requestFullscreen();  
      } else if (elem.mozRequestFullScreen) { /* Firefox */  
        elem.mozRequestFullScreen();  
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari 和 Opera */  
        elem.webkitRequestFullscreen();  
      } else if (elem.msRequestFullscreen) { /* IE/Edge */  
        elem.msRequestFullscreen();  
      } 
      state.fullScreenStatus = true
    }
    return {
      defaultProps,
      ...toRefs(state),
      ...toRefs(modal),
      applicationCode,
      sysTitle,
      handleQuery,
      handleReset,
      activeKey,
      changePage,
      batchRemove,
      getPanelConfigList,
      getEquipmentAccountList,
      activeKeyChange,
      pageTableRef,
      fullScreen,
      PAGE_SIZE
    };
  },
});
</script>
<style lang="less">
.custom-draw {
  .ant-drawer-body {
    height: 100% !important;

    .drawer-content {
      display: flex;
      height: 100%;

      .preview {
        flex: 1;
      }
    }
  }
}
</style>


<style lang="less" scoped>
.cardData {
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
  flex-wrap: wrap;
}

:deep(.content-left) {
  padding: 0 16px;
  border-right: 1px solid #f0f0f0;
}

:deep(.ant-tabs-content) {
  overflow: auto !important;
  display: block;
}

:deep(.content-right) {
  overflow: auto !important;
  padding: 0 0px;
}

:deep(.content-table) {
  overflow: auto !important;
}

:deep(.ant-tabs-bar) {
  margin: 0 !important;
  padding: 0px;
}

.tab-pane-content {
  height: 100%;
  padding-bottom: 10px;
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
}
.full-screen{
  background-color: #fff;
  box-sizing: border-box;
  padding: 20px 0;
  position: fixed;
  width: 100vw;
  top: 0;
  left: 0;
  height: calc(100vh - 72px);
  overflow: auto;
  .cardData{
    display: grid;  
    grid-template-columns: repeat(4, 1fr);
  }
}
.sysTitle{
  font-size: 20px;
  margin:10px 20px;
  font-weight: 500;
  text-align: center;
  font-size: 50px;
}
</style>
