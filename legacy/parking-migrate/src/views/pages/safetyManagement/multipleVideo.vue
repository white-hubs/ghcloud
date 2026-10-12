<template>
  <g-layout-no-footer :title="pageTitle">
    <template #content-left>
      <div class="leftCtr pr2">
        <a-tabs v-model:activeKey="activeKey" @change="changeActiveKey">
          <a-tab-pane key="selfSet" :tab="isTraffic?'区域':`车场`">
            <a-space :size="8">
              <a-input v-model:value="search.keyword" placeholder="摄像机名称/区域" :allowClear="true" style="width: 250px" @change="searchVideo"></a-input>
              <a-button class="ml1" type="primary" @click="searchClick">
                查询
              </a-button>
            </a-space>
            <!-- <div style="margin-top:10px;">
              <span>隐藏无设备区域:</span> <a-switch v-model:checked="filterateChecked" @change="searchVideo" />
            </div> -->
            <div class="treeCtr">
              <div class="tree-container flex-column">
                <a-spin :spinning="spinning">
                  <a-tree :checkStrictly="true" v-model:selectedKeys="search.areaIds" :tree-data="treeData"
                    v-if="treeData.length" :fieldNames="fieldNames" :defaultExpandAll="true" @select="select">
                    <template v-slot:title="nodeData">
                      <div v-if="nodeData.type == 'area'">
                        <span class="AiTag" v-if="isAiTag(nodeData?.tags)">Ai</span>
                        <span>
                          {{ nodeData.name }} ({{ nodeData.deviceCount }})
                        </span>
                      </div>
                      <div v-else class="node-name-wrapper">
                        <span class="AiTag" v-if="isAiTag(nodeData?.tags)">Ai</span>
                        <span class="node-name">{{ nodeData.name }} </span>
                        <span 
                          class="status-indicator" 
                         
                          :title="nodeData?.status ? '在线' : '离线'">
                            <span class="pulse" v-if="nodeData?.status?.onlineState"></span>
                            <span class="offline" v-if="!nodeData?.status?.onlineState && !nodeData?.devices"></span>
                        </span>
                      </div>
                    </template>
                  </a-tree>
                </a-spin>
              </div>

            </div>
          </a-tab-pane>

        </a-tabs>
      </div>
    </template>
    <template #content-table>
      <div class="rightCtr pl2">
        <div class="flex-between">
          <div class="btns">
            <a-radio-group v-model:value="grid" @change="gridChange" buttonStyle="solid">
              <a-radio-button v-for="item in radioOptions" :key="item.label" :value="item.value">
                {{ item.label}}
              </a-radio-button>
            </a-radio-group>
          </div>
          <!-- <a-button @click="openModal">添加收藏</a-button> -->
        </div>
        <div class="videoPart">
          <PlayVideo ref="playVideoRef" @close-item="closeItem" :cameraList="cameraList" :grid="grid"></PlayVideo>
        </div>
      </div>
    </template>
  </g-layout-no-footer>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
  onUnmounted,
  computed
} from "vue";
import _ from "lodash";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import { cubeDictionaryService } from "@/api/service";
import PlayVideo from "./components/playVideo.vue";
import { usePageName } from "@ghcloud/cube-utils"
import { cubeDeviceCenterService } from "@/api/service";

const sessionMonitorKey = 'PRAKING_MONITORING_SEARCH'
const trafficSessionMonitorKey = 'TRAFFIC_MONITORING_SEARCH'
export default defineComponent({
  components: {
    PlayVideo,
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
   
    const { proxy } = getCurrentInstance();
    const defaultCameraList = computed(()  => {
      let index = 0
      switch (state.grid) {
        case "1X1":
         index = 1
         break;
        case "2X2":
         index = 4
         break;
        case "3X3":
         index = 9
         break;
        case "4X4":
         index = 16
         break;
          
      }
      var arr = [];
      for (var i = 0; i < index; i++) {
        arr.push(null);
      }
      return arr;
    });
    const router = useRouter();
    const route = useRoute();
    const isTraffic = ref(route.meta.isTraffic)
    const playVideoRef = ref();
    const modalForm = ref(null);
    const visible = ref(false);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      groupingEquipment:[],
      filterateChecked: false,
      currenItemId: "",
      title: "添加收藏",
      spinning: false,
      keyword: "",
      activeKey: "selfSet",
      search: {
        total: 0,
        pageSize: 20,
        pageNumber: 1,
        keyword: "",
        areaIds: [],
      },
      groupSearch: {
        total: 0,
        pageSize: 20,
        pageNumber: 1,
        keyword: "",
        areaIds: [],
      },
      radioOptions: [
        {
          label: '1X1',
          value: '1X1'
        },
        {
          label: '2X2',
          value: '2X2'
        },
        {
          label: '3X3',
          value: '3X3'
        },
        {
          label: '4X4',
          value: '4X4'
        }
      ],
      treeData: [],
      fieldNames: { label: "name", key: "id", children: "devices" },
      groupReplaceFields: { title: "name", key: "id", children: "devices" },
      expandedKeys: [],
      cameraList: [null, null, null, null],
      grid: "2X2",
      collectList: [],
      model: {
        id: "",
        name: "",
      },
      rules: {
        name: [{ required: true, message: "请输入收藏名称" }],
      },
      checkedCollectId: "",
    });
    const filterateTree = reactive({
      afterFiltering: [],
      beforeFiltering: [],
    })
    const getTreeData = async () => {
      state.spinning = true;
      let params = {
        ...state.search,
        areaId: state.search.areaIds.join(","),
      };
      Reflect.deleteProperty(params, "areaIds");
      let data  = null
      if(isTraffic.value){
          data = await proxy.$api.getTrafficMonitorDevices(params);
      }else{
          data = await proxy.$api.getMonitorDevices(params);
      }
    
      state.spinning = false;
      if (data) {
        filterateTree.afterFiltering = data;
        // filterateTree.beforeFiltering = removeEmptyChildren(JSON.parse(JSON.stringify(data)))
        filterateTree.beforeFiltering = data
        state.treeData = data

      }
    };
    const getMonitorLayoutConfig = async () => {
      const result = await cubeDictionaryService.getDictionaryByItem({
        itemCode: 'SERVICE_CONFIGURATION'
      })
      if (!result.length) return;
      if (!result[0]) return;
      let variable = {}
      try {
        variable = JSON.parse(result[0].variable || '{}')
      } catch (e) {
        variable = {}
      }
      const monitorLayout = (variable && variable.monitor_layout) || '4X4'
      const index = state.radioOptions.findIndex(item => item.value === monitorLayout)
      const radioOptions = state.radioOptions.slice(0, index + 1)
      state.grid = radioOptions.at(-1).value
      gridChange({
        target: {
          value: state.grid
        }
      })
    }
    // 过滤树形数据
    const removeEmptyChildren = (node) => {
      for (let i = node.length - 1; i >= 0; i--) {
        const item = node[i];
        if (item.deviceCount === 0) {
          node.splice(i, 1);
        } else if (item.children.length) {
          removeEmptyChildren(item.children)
        }
      }
      return node
    }
    // 缓存数据 后期实现页面组件缓存后去除此方法
    onUnmounted(() => {
      const payload = {
        search: state.search,
        grid: state.grid,
        cameraList: state.cameraList,
        activeKey: state.activeKey,
        checkedCollectId: state.checkedCollectId,
        model: {
          ...state.model
        }
      }
      sessionStorage.setItem(isTraffic.value?trafficSessionMonitorKey:sessionMonitorKey, JSON.stringify(payload))
    })
    //
    const addClass = id => {
      state.currenItemId = id;
    };
    const removeClass = id => {
      state.currenItemId = "";
    };
    const onShowSizeChange = (current, pageSize) => {
      state.search.pageNumber = current;
      state.search.pageSize = pageSize;
      getTreeData();
    };
    const searchClick = () => { 
      if (!state.search.keyword) {
        // 如果没有关键字，恢复原始数据
        getTreeData();
      }
      searchVideo()
    };

    const searchVideo = () => {
      
      if (state.filterateChecked) {
        state.treeData = JSON.parse(JSON.stringify(filterateTree.beforeFiltering))
      } else {
        state.treeData = JSON.parse(JSON.stringify(filterateTree.afterFiltering))
      }
      
      findNode(state.treeData, state.search.keyword??'');
    };
    const searchGroup = () => {
      const keyword = state.groupSearch.keyword.toLowerCase().trim();
      if (!keyword) {
        // 如果没有关键字，恢复原始数据
        getGroupingEquipment();
        state.expandedKeys = [];
        return;
      }
    
      // 收集需要展开的节点 key
      const expandedKeys = new Set();
      
      const filterGroupTree = (nodes) => {
        return nodes.filter(node => {
          // 创建节点的副本
          const newNode = { ...node };
          
          // 检查当前节点名称是否匹配关键字
          const nameMatch = node.name.toLowerCase().includes(keyword);
          
          // 如果有设备列表，过滤设备
          if (node.devices && node.devices.length) {
            newNode.devices = node.devices.filter(device => 
              device.name.toLowerCase().includes(keyword)
            );
            
            // 如果设备匹配，将父节点添加到展开列表
            if (newNode.devices.length > 0) {
              expandedKeys.add(node.id);
            }
          }
          
          // 如果当前节点名称匹配，也添加到展开列表
          if (nameMatch) {
            expandedKeys.add(node.id);
          }
          
          return nameMatch || (newNode.devices && newNode.devices.length > 0);
        });
      };
    
      // 过滤树形数据
      const filteredTree = filterGroupTree(JSON.parse(JSON.stringify(state.groupingEquipment)));
      state.groupingEquipment = filteredTree;
      // 更新展开的节点列表
      state.expandedKeys = Array.from(expandedKeys);
    };

    const findNode = (treeData, name) => {
      return treeData.filter(item => {
        return filterItem(item, name);
      });
    };

    const filterItem = (item, name) => {
      if (item.name.indexOf(name) !== -1) return true;

      if (item.children) {
        item.children = item.children.filter(sonEle => {
          return filterItem(sonEle, name);
        });

        if (item.children.length > 0) {
          return true;
        }
      }

      return false;
    };

  
    const select = (selectedKeys, info) => {
      // ant-design-vue 4：selectedNodes 为 DataNode[]，不再通过 VNode props.dataRef 取数
      const node = info.selectedNodes?.[0] ?? info.node
      if (!node) {
        return
      }
      if (!node.area) {
        proxy.$message.warning("请选择设备");
        return;
      }
      // debugger
      if (state.grid == "1X1") {
        // 1x1 下同步替换为仅包含当前选中监控，避免先置空再 setTimeout 导致中间态出现两个格子
        state.cameraList = [node];
      } else {
        state.cameraList = defaultCameraList.value;
        setTimeout(() => {      
 
          if (
            playVideoRef.value?.clickIndex ||
            playVideoRef.value.clickIndex == 0
          ) {
            
            state.cameraList.splice(playVideoRef.value?.clickIndex, 1, node);
          } else {
            const index = state.cameraList.findIndex(item => !item);
            state.cameraList[index] = node;
          }
         }, 0);
      }
      playVideoRef.value.clickIndex = null;
    };
    const handleExpand = (expandedKeys) => {
      state.expandedKeys = expandedKeys;
    };

    // 修改选择处理函数
    const groupingSelect = (selectedKeys, info) => {
      if (selectedKeys.length === 0) return;
      const node = info.selectedNodes?.[0] ?? info.node
      if (!node) return
      
      // 如果是分组节点（有devices属性），则不触发选择
      if (node.devices) {
        return;
      }
      const deviceNode = {
        ...node,
        id: node.id || node.key 
      };
    
      if (state.grid === "1X1") {
        // 1x1 下同步替换为仅包含当前选中监控，避免先置空再 setTimeout 导致中间态出现两个格子
        state.cameraList = [deviceNode];
      } else {
        // 确保设备总是填充到第一个空位置
        const emptyIndex = state.cameraList.findIndex(item => !item);
        if (emptyIndex !== -1) {
          state.cameraList[emptyIndex] = null;
          setTimeout(() => {       
            state.cameraList[emptyIndex] = deviceNode;
          }, 0);  
        } else {
          // 如果没有空位置，且用户点击了特定格子，则替换该格子
          if (playVideoRef.value?.clickIndex || playVideoRef.value.clickIndex === 0) {
            state.cameraList[playVideoRef.value.clickIndex] = null;
            setTimeout(() => {       
              state.cameraList[playVideoRef.value.clickIndex] = deviceNode;
            }, 0);
            // state.cameraList.splice(playVideoRef.value.clickIndex, 1, deviceNode);
          }
        }
      }
    };
    const gridChange = event => {
      const type = event.target.value
      state.grid = type;
      // 添加cameraList数据
      state.cameraList = state.cameraList.filter(item => item?.thirdPartyId);
      if (type === "1X1") {
        if (state.cameraList.length > 1) {
         const changeCameraList =  state.cameraList.slice(0,1)
          state.cameraList = defaultCameraList.value;
          setTimeout(() => {       
            state.cameraList = changeCameraList;
          }, 0);
          // state.cameraList = [state.cameraList[0]];
        }
        if (state.cameraList.length == 0) {
          state.cameraList = defaultCameraList.value;
        }
      } else if (type === "2X2") {
        if (state.cameraList.length > 4) {
          state.cameraList.splice(4);
        } else {
          const num = 4 - state.cameraList.length;
          for (let i = 0; i < num; i++) {
            state.cameraList.push(null);
          }
        }
      } else if (type === "2X3") {
        if (state.cameraList.length > 6) {
          state.cameraList.splice(6);
        } else {
          const num = 6 - state.cameraList.length;
          for (let i = 0; i < num; i++) {
            state.cameraList.push(null);
          }
        }
      } else if (type === "3X3") {
        if (state.cameraList.length > 9) {
          state.cameraList.splice(9);
        } else {
          const num = 9 - state.cameraList.length;
          for (let i = 0; i < num; i++) {
            state.cameraList.push(null);
          }
        }
      } else if (type === "4X4") {
        if (state.cameraList.length > 16) {
          state.cameraList.splice(16);
        } else {
          const num = 16 - state.cameraList.length;
          for (let i = 0; i < num; i++) {
            state.cameraList.push(null);
          }
        }
      }
    };

    const closeItem = index => {
      state.cameraList.splice(index, 1, null);
    };
    const openModal = () => {
      state.title = "添加收藏";
      const data = state.cameraList.filter(item => item !== null);
      if (data.length) {
        state.model.name = "";
        visible.value = true;
      } else {
        proxy.$message.warn("请选择收藏的设备!");
      }
    };
    const cancel = async () => {
      // 清除表单
      await modalForm.value.clearValidate();
      state.model.name = "";
      state.model.id = "";
      visible.value = false;
    };
  

    const changeActiveKey = activeKey => {
      if (activeKey === "selfSet") {
        state.checkedCollectId = "";
        state.model.id = "";
      }
    };
 
    onMounted(async () => {
      getTreeData();
      await getMonitorLayoutConfig()
      handleCache();
      isTraffic.value = route.meta.isTraffic
    });
    // 缓存数据 后期实现页面组件缓存后去除此方法
    const handleCache = () => {
      const payload = sessionStorage.getItem(isTraffic.value?trafficSessionMonitorKey:sessionMonitorKey);
      const cacheState = JSON.parse(payload)
      if (payload) {
        for (const key in cacheState) {
          state[key] = cacheState[key]
        }
      }
    }
    const isAiTag = (tags) => {
      let tagCodes = []
      if (Array.isArray(tags) && tags.length > 0) {
        tagCodes = tags.map(item => item.tagCode)
      }
      return tagCodes.includes('builtin.usage::artificial_intelligence')
    }
    return {
      playVideoRef,
      ...toRefs(state),
      visible,
      gridChange,
      closeItem,
      select,
      groupingSelect,
      modalForm,
      openModal,
      cancel,
      changeActiveKey,
      searchVideo,
      onShowSizeChange,
      addClass,
      removeClass,
      isAiTag,
      searchGroup,
      handleExpand,
      isTraffic
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

:deep(.content-left) {
  width: 400px;
  border-right: 1px solid #f3f3f3;

  .leftCtr {
    width: 100%;
    height: 100%;

    .treeCtr {
      padding-top: 8px;
      height: calc(100% - 32px);
      overflow-y: hidden;

      .tree-container {
        height: calc(100% - 72px);
        overflow: auto;
      }

      .camera-item {
        line-height: 36px;
        padding: 0 16px;
        cursor: pointer;

        &.itemBg {
          background: #f0f2f5;
        }
      }

      .footer-page {
        height: 72px;
        border-top: 1px solid #f3f3f3;
      }
    }

    .list {
      height: 100%;
      overflow: auto;
      padding-bottom: 16px;
    }
  }

  .AiTag {
    display: inline-block;
    background-color: var(--cube-theme-var--primary-2);
    color: var(--cube-theme-var--primary-color);
    height: 16px;
    line-height: 16px;
    padding: 0 4px;
    border-radius: 4px;
    text-align: center;
    margin: 0 4px;
    font-size: 12px;
    font-weight: 700;
  }

  .node-name-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .node-name {
    position: relative;
    padding-right: 14px;
  }

  .status-indicator {
    position: absolute;
    right: 0;
    top: 0px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #fff; /* 白色边框 */
  }

  .status-indicator.online {
    background: #52c41a;
  }


  /* 在线脉冲动画 */
  .pulse {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #52c41a;
    animation: pulse-animation 2s infinite;
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 4px rgba(82, 196, 26, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
    }
  }
  /* 离线脉冲动画 */
  .offline {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #d9d9d9;
  }

}

:deep(.content-table) {
  .rightCtr {
    width: 100%;
    height: 100%;
  }

  .videoPart {
    height: calc(100% - 42px);
  }

  .btns {
    width: 100%;
    height: 42px;
    // line-height: 50px;
  }
}
</style>
