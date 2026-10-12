<template>
  <g-layout-no-footer :title="pageTitle">
    <template #content-left>
      <div class="leftCtr pr2">
        <a-tabs v-model:activeKey="activeKey" @change="changeActiveKey">
          <a-tab-pane key="selfSet" :tab="`空间`">
            <a-space :size="8">
              <a-input
                v-model:value="search.keyword"
                placeholder="摄像机名称/区域"
                :allowClear="true"
                style="width: 250px"
                @change="searchVideo"
              ></a-input>
              <a-button class="ml1" type="primary" @click="searchClick"> 查询 </a-button>
            </a-space>
            <div style="margin-top: 10px">
              <span>隐藏无设备区域:</span> <a-switch v-model:checked="filterateChecked" @change="searchVideo" />
            </div>
            <div class="treeCtr">
              <div class="tree-container flex-column">
                <a-spin :spinning="spinning">
                  <a-tree
                    :checkStrictly="true"
                    v-model:selectedKeys="search.areaIds"
                    :tree-data="treeData"
                    v-if="treeData.length"
                    :fieldNames="fieldNames"
                    :defaultExpandAll="true"
                    @select="select"
                  >
                    <template v-slot:title="nodeData">
                      <div v-if="nodeData.type == 'area'">
                        <span class="AiTag" v-if="isAiTag(nodeData?.tags)">Ai</span>
                        <span> {{ nodeData.name }} ({{ nodeData.deviceCount }}) </span>
                      </div>
                      <div v-else class="node-name-wrapper">
                        <span class="AiTag" v-if="isAiTag(nodeData?.tags)">Ai</span>
                        <span class="node-name">{{ nodeData.name }}</span>
                        <span
                          class="status-indicator"
                          :class="{
                            online: nodeData?.status,
                            offline: !nodeData?.status,
                          }"
                          :title="nodeData?.status ? '在线' : '离线'"
                        >
                          <span class="pulse" v-if="nodeData?.status"></span>
                        </span>
                      </div>
                    </template>
                  </a-tree>
                </a-spin>
              </div>
              <div class="footer-page flex-center">
                <a-pagination
                  v-if="search.total > 0"
                  v-model:pageSize="search.pageSize"
                  v-model:current="search.pageNumber"
                  :total="search.total"
                  :default-current="1"
                  :show-total="(total) => `共 ${total} 条数据`"
                  @change="onShowSizeChange"
                  @showSizeChange="onShowSizeChange"
                ></a-pagination>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="grouping" tab="监控分组">
            <a-space :size="8">
              <a-input
                v-model:value="groupSearch.keyword"
                placeholder="监控名称/分组"
                style="width: 250px"
                :allowClear="true"
                @change="searchGroup"
              />
              <a-button class="ml1" type="primary" @click="searchGroup">查询</a-button>
            </a-space>
            <div class="treeCtr">
              <div class="tree-container flex-column">
                <a-tree
                  v-if="groupingEquipment.length"
                  :checkStrictly="true"
                  :tree-data="groupingEquipment"
                  :expandedKeys="expandedKeys"
                  :defaultExpandAll="groupSearch.keyword.trim().length > 0"
                  :fieldNames="groupReplaceFields"
                  @select="groupingSelect"
                  @expand="handleExpand"
                >
                  <template v-slot:title="title">
                    <div class="node-name-wrapper">
                      <span class="node-name" v-if="title?.name.toLowerCase().indexOf(groupSearch.keyword.toLowerCase()) > -1">
                        {{ title?.name.substr(0, title?.name.toLowerCase().indexOf(groupSearch.keyword.toLowerCase())) }}
                        <span style="color: #f50">{{
                          title?.name.substr(
                            title?.name.toLowerCase().indexOf(groupSearch.keyword.toLowerCase()),
                            groupSearch.keyword.length,
                          )
                        }}</span>
                        {{
                          title?.name.substr(
                            title?.name.toLowerCase().indexOf(groupSearch.keyword.toLowerCase()) + groupSearch.keyword.length,
                          )
                        }}
                      </span>
                      <span class="node-name" v-else>{{ title?.name }}</span>
                      <span
                        v-if="!title.devices"
                        class="status-indicator"
                        :class="{
                          online: title?.status?.onlineState,
                          offline: !title?.status?.onlineState,
                        }"
                        :title="title?.status?.onlineState ? '在线' : '离线'"
                      >
                        <span class="pulse" v-if="title?.status?.onlineState"></span>
                      </span>
                    </div>
                  </template>
                </a-tree>
                <a-empty v-else class="p2" :description="'暂无监控分组'"></a-empty>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="collect" tab="我的收藏">
            <ul class="list" v-if="collectList.length">
              <li
                class="primary-color-1-hover flex-between"
                v-for="item in collectList"
                :key="item.id"
                @click="checkedCollect(item)"
                :class="checkedCollectId === item.id ? 'primary-color-1' : ''"
              >
                <span>{{ item.name }}</span>
                <span>
                  <a-space :size="16">
                    <EditOutlined @click="editCollectionName(item)" />
                    <DeleteOutlined class="deleteRow" @click.stop="deleteCollection(item)" />
                  </a-space>
                </span>
              </li>
            </ul>
            <a-empty v-else class="p2" :description="'暂无收藏'"></a-empty>
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
                {{ item.label }}
              </a-radio-button>
            </a-radio-group>
          </div>
          <a-button @click="openModal">添加收藏</a-button>
        </div>
        <div class="videoPart">
          <PlayVideo
            ref="playVideoRef"
            @close-item="closeItem"
            @refresh-video="refreshVideo"
            :cameraList="cameraList"
            :grid="grid"
            :refresh-loading-map="refreshVideoLoadingMap"
          ></PlayVideo>
        </div>
      </div>
    </template>
  </g-layout-no-footer>
  <a-modal v-model:visible="visible" centered @ok="saveCollect" @cancel="cancel" :title="title">
    <a-form ref="modalForm" :model="model" :rules="rules">
      <a-form-item label="收藏名称" name="name">
        <a-input v-model:value="model.name" placeholder="请输入收藏名称" :maxlength="20"></a-input>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="jsx">
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { message, Modal } from "ant-design-vue";
import _ from "lodash";
import { getCurrentInstance, defineComponent, createVNode, onMounted, reactive, toRefs, ref, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { usePageName } from "@ghcloud/cube-utils";

import PlayVideo from "./components/playVideo.vue";
import { cubeDictionaryService } from "@/api/service";
import { cubeDeviceCenterService } from "@/api/service";

const sessionMonitorKey = "SECURITY_MONITORING_SEARCH";
const monitorLayoutDictionary = {
  itemCode: "VIDEO_MONITOR_GROUP_MAX_LIMIT",
  code: "MAX_LAYOUT",
};

export default defineComponent({
  components: {
    PlayVideo,
    EditOutlined,
    DeleteOutlined,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const defaultCameraList = computed(() => {
      let index = 0;
      switch (state.grid) {
        case "1X1":
          index = 1;
          break;
        case "2X2":
          index = 4;
          break;
        case "3X3":
          index = 9;
          break;
        case "4X4":
          index = 16;
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
    const playVideoRef = ref();
    const modalForm = ref(null);
    const visible = ref(false);
    const { pageTitle } = usePageName();
    const state = reactive({
      pageTitle: pageTitle,
      groupingEquipment: [],
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
          label: "1X1",
          value: "1X1",
        },
        {
          label: "2X2",
          value: "2X2",
        },
        {
          label: "3X3",
          value: "3X3",
        },
        {
          label: "4X4",
          value: "4X4",
        },
      ],
      treeData: [],
      fieldNames: { label: "name", key: "id", children: "children" },
      groupReplaceFields: { label: "name", key: "id", children: "devices" },
      expandedKeys: [],
      cameraList: [null, null, null, null],
      grid: "2X2",
      collectList: [],
      model: {
        id: "",
        name: "",
      },
      refreshVideoLoadingMap: {},
      rules: {
        name: [{ required: true, message: "请输入收藏名称" }],
      },
      checkedCollectId: "",
      monitorNum: 0,
    });
    const filterateTree = reactive({
      afterFiltering: [],
      beforeFiltering: [],
    });
    const getTreeData = async () => {
      state.spinning = true;
      let params = {
        ...state.search,
        areaId: state.search.areaIds.join(","),
      };
      Reflect.deleteProperty(params, "areaIds");
      Reflect.deleteProperty(params, "total");
      const data = await proxy.$api.monitorEquiptreeList(params);
      state.spinning = false;
      if (data) {
        filterateTree.afterFiltering = data;
        filterateTree.beforeFiltering = removeEmptyChildren(JSON.parse(JSON.stringify(data)));
        state.treeData = data;
        state.search.total = data.total;
        for (let i = 0; i < data.length; i++) {
          state.monitorNum += data[i].deviceCount;
        }
      }
    };
    const getMonitorLayoutConfig = async () => {
      const result = await cubeDictionaryService.getDictionaryByItem({
        ...monitorLayoutDictionary,
      });
      const maxLayout = Number(result[0]?.variable);
      const maxLayoutIndex =
        Number.isInteger(maxLayout) && maxLayout >= 1 && maxLayout <= state.radioOptions.length
          ? maxLayout - 1
          : state.radioOptions.length - 1;
      state.radioOptions = state.radioOptions.slice(0, maxLayoutIndex + 1);
      state.grid = state.radioOptions.at(-1).value;
      gridChange({
        target: {
          value: state.grid,
        },
      });
    };
    // 过滤树形数据
    const removeEmptyChildren = (node) => {
      for (let i = node.length - 1; i >= 0; i--) {
        const item = node[i];
        if (item.deviceCount === 0) {
          node.splice(i, 1);
        } else if (item.children.length) {
          removeEmptyChildren(item.children);
        }
      }
      return node;
    };
    // 缓存数据 后期实现页面组件缓存后去除此方法
    onUnmounted(() => {
      const payload = {
        search: state.search,
        grid: state.grid,
        cameraList: state.cameraList,
        activeKey: state.activeKey,
        checkedCollectId: state.checkedCollectId,
        model: {
          ...state.model,
        },
      };
      sessionStorage.setItem(sessionMonitorKey, JSON.stringify(payload));
    });
    //
    const addClass = (id) => {
      state.currenItemId = id;
    };
    const removeClass = (id) => {
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
      searchVideo();
    };

    const searchVideo = () => {
      if (state.filterateChecked) {
        state.treeData = JSON.parse(JSON.stringify(filterateTree.beforeFiltering));
      } else {
        state.treeData = JSON.parse(JSON.stringify(filterateTree.afterFiltering));
      }

      findNode(state.treeData, state.search.keyword ?? "");
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
        return nodes.filter((node) => {
          // 创建节点的副本
          const newNode = { ...node };

          // 检查当前节点名称是否匹配关键字
          const nameMatch = node.name.toLowerCase().includes(keyword);

          // 如果有设备列表，过滤设备
          if (node.devices && node.devices.length) {
            newNode.devices = node.devices.filter((device) => device.name.toLowerCase().includes(keyword));

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
      return treeData.filter((item) => {
        return filterItem(item, name);
      });
    };

    const filterItem = (item, name) => {
      if (item.name.indexOf(name) !== -1) return true;

      if (item.children) {
        item.children = item.children.filter((sonEle) => {
          return filterItem(sonEle, name);
        });

        if (item.children.length > 0) {
          return true;
        }
      }

      return false;
    };

    const getCollection = async () => {
      const data = await proxy.$api.collectVideo("get", {
        pageSize: 1000,
        pageNumber: 1,
      });
      state.collectList = data.records;
    };
    const getVideoToken = (cameraItem) => {
      return cameraItem?.token || cameraItem?.thirdPartyId || "";
    };
    const getCameraIdentityList = (cameraItem = {}) => {
      return [cameraItem.id, cameraItem.deviceId, cameraItem.key, cameraItem.thirdPartyId, cameraItem.token].filter(
        (item) => item !== undefined && item !== null && item !== "",
      );
    };
    const isSameCamera = (target, candidate) => {
      if (!target || !candidate) return false;
      const targetIds = getCameraIdentityList(target).map((item) => String(item));
      const candidateIds = getCameraIdentityList(candidate).map((item) => String(item));
      return targetIds.some((id) => candidateIds.includes(id));
    };
    const getGridSize = (grid = state.grid) => {
      const [row, col] = String(grid)
        .split("X")
        .map((item) => Number(item));
      return row && col ? row * col : defaultCameraList.value.length;
    };
    const normalizeCameraListSize = (grid = state.grid) => {
      const size = getGridSize(grid);
      if (state.cameraList.length > size) {
        state.cameraList.splice(size);
      }
      while (state.cameraList.length < size) {
        state.cameraList.push(null);
      }
    };
    const getSelectedVideoIndex = () => {
      const index = playVideoRef.value?.clickIndex;
      return index === 0 || index ? index : -1;
    };
    const getTargetSlotIndex = () => {
      if (state.grid === "1X1") {
        return 0;
      }
      const selectedIndex = getSelectedVideoIndex();
      if (selectedIndex >= 0 && selectedIndex < state.cameraList.length) {
        return selectedIndex;
      }
      const emptyIndex = state.cameraList.findIndex((item) => !item);
      return emptyIndex >= 0 ? emptyIndex : 0;
    };
    const sortCameraVOS = (cameraVOS = []) => {
      return [...cameraVOS].sort((prev, next) => Number(prev.sort || 0) - Number(next.sort || 0));
    };
    const putCameraIntoSlot = (cameraItem) => {
      normalizeCameraListSize();
      const targetIndex = getTargetSlotIndex();
      if (state.grid === "1X1") {
        state.cameraList = [cameraItem];
      } else {
        state.cameraList.splice(targetIndex, 1, cameraItem);
      }
      if (playVideoRef.value) {
        playVideoRef.value.clickIndex = null;
      }
    };
    const findCameraInTree = (nodes = [], cameraItem) => {
      for (const node of nodes || []) {
        if (node && node.type !== "area" && isSameCamera(cameraItem, node)) {
          return node;
        }
        const children = node?.children || node?.devices || [];
        const matched = findCameraInTree(children, cameraItem);
        if (matched) return matched;
      }
      return null;
    };
    const fetchCameraFromCollect = async (cameraItem) => {
      if (!state.checkedCollectId) return null;
      const data = await proxy.$api.collectVideoId("get", { id: state.checkedCollectId });
      return findCameraInTree(data?.cameraVOS || [], cameraItem);
    };
    const fetchCameraFromGroup = async (cameraItem) => {
      const currentApplication = sessionStorage.getItem("GH-currentApplication");
      if (!currentApplication) return null;
      const application = JSON.parse(currentApplication);
      const groupList = await cubeDeviceCenterService.deviceGroupDevicesAll("builtin.app::" + application.code);
      return findCameraInTree(groupList || [], cameraItem);
    };
    const fetchCameraFromAreaTree = async (cameraItem) => {
      const params = {
        ...state.search,
        areaId: state.search.areaIds.join(","),
      };
      Reflect.deleteProperty(params, "areaIds");
      Reflect.deleteProperty(params, "total");
      const data = await proxy.$api.monitorEquiptreeList(params);
      return findCameraInTree(data || [], cameraItem);
    };
    const fetchLatestCamera = async (cameraItem) => {
      if (state.checkedCollectId) {
        return fetchCameraFromCollect(cameraItem);
      }
      if (state.activeKey === "grouping") {
        return fetchCameraFromGroup(cameraItem);
      }
      return fetchCameraFromAreaTree(cameraItem);
    };
    const refreshVideo = async ({ index, cameraItem }) => {
      if (index === undefined || !cameraItem) return;
      if (state.refreshVideoLoadingMap[index]) return;
      state.refreshVideoLoadingMap[index] = true;
      try {
        const latestCamera = await fetchLatestCamera(cameraItem);
        if (!latestCamera) {
          proxy.$message.warning("未找到该摄像机，请稍后重试");
          return;
        }
        if (!getVideoToken(latestCamera)) {
          proxy.$message.warning("播放地址仍为空，请稍后重试");
          state.cameraList.splice(index, 1, {
            ...cameraItem,
            ...latestCamera,
          });
          return;
        }
        state.cameraList.splice(index, 1, {
          ...cameraItem,
          ...latestCamera,
        });
      } catch (error) {
        proxy.$message.error("刷新播放地址失败，请稍后重试");
      } finally {
        state.refreshVideoLoadingMap[index] = false;
      }
    };
    const select = (selectedKeys, info) => {
      // ant-design-vue 4：selectedNodes 为 DataNode[]，不再通过 VNode props.dataRef 取数
      const node = info.selectedNodes?.[0] ?? info.node;
      if (!node) {
        return;
      }
      if (node.type == "area") {
        proxy.$message.warning("请选择区域设备");
        return;
      }
      // debugger
      putCameraIntoSlot(node);
    };
    const handleExpand = (expandedKeys) => {
      state.expandedKeys = expandedKeys;
    };

    // 修改选择处理函数
    const groupingSelect = (selectedKeys, info) => {
      if (selectedKeys.length === 0) return;
      const node = info.selectedNodes?.[0] ?? info.node;
      if (!node) return;

      // 如果是分组节点（有devices属性），则不触发选择
      if (node.devices) {
        return;
      }
      const deviceNode = {
        ...node,
        id: node.id || node.key,
      };

      putCameraIntoSlot(deviceNode);
    };
    const gridChange = (event) => {
      const requestedGrid = event.target.value;
      const type = state.radioOptions.some((item) => item.value === requestedGrid) ? requestedGrid : state.radioOptions.at(-1).value;
      state.grid = type;
      // 添加cameraList数据
      state.cameraList = state.cameraList.filter((item) => item?.id || item?.deviceId);
      if (type === "1X1") {
        if (state.cameraList.length > 1) {
          state.cameraList = state.cameraList.slice(0, 1);
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

    const closeItem = (index) => {
      state.cameraList.splice(index, 1, null);
    };
    const openModal = () => {
      state.title = "添加收藏";
      const data = state.cameraList.filter((item) => item !== null);
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
    // 保存收藏
    const saveCollect = () => {
      modalForm.value.validate().then(async () => {
        let cameraArray = state.cameraList.map((item, index) => {
          if (item) {
            return { deviceId: item.id, sort: index };
          }
        });
        const params = {
          name: state.model.name,
          row: state.grid.split("X")[0],
          col: state.grid.split("X")[1],
          cameraParams: cameraArray.filter((element) => {
            return element != null;
          }),
        };
        if (state.model.id) {
          const data = await proxy.$api.editCollectVideo({
            ...params,
            id: state.model.id,
          });
          if (data) {
            visible.value = false;
            proxy.$message.success("修改成功！");
            getCollection();
          }
        } else {
          const data = await proxy.$api.addCollectVideo("post", params);
          if (data) {
            visible.value = false;
            proxy.$message.success("收藏成功！");
            getCollection();
          }
        }
      });
    };
    // 点击收藏列表项回显视频布局
    const checkedCollect = async (item) => {
      state.checkedCollectId = item.id;
      let grid = `${item.row}X${item.col}`;
      state.cameraList = new Array(item.row * item.col).fill(null);
      const data = await proxy.$api.collectVideoId("get", item);
      if (data && data.cameraVOS) {
        let cameraVOS = sortCameraVOS(data.cameraVOS);
        for (let i = 0; i < cameraVOS.length; i++) {
          state.cameraList[cameraVOS[i].sort] = cameraVOS[i];
        }
        gridChange({
          target: {
            value: grid,
          },
        });
      }
    };
    const changeActiveKey = (activeKey) => {
      if (activeKey === "selfSet") {
        state.checkedCollectId = "";
        state.model.id = "";
      }
    };
    // 编辑
    const editCollectionName = (item) => {
      state.title = "编辑收藏";
      state.model.id = item.id;
      state.model.name = item.name;
      visible.value = true;
    };
    // 删除
    const deleteCollection = (item) => {
      Modal.confirm({
        title: "提示",
        okText: "确认",
        cancelText: "取消",
        icon: () => createVNode(ExclamationCircleOutlined),
        content: "是否确认删除该条收藏",
        async onOk() {
          const data = await proxy.$api.collectVideoId("delete", item.id);
          if (data) {
            proxy.$message.success("删除成功！");
            getCollection();
          }
        },
      });
    };
    // 获取分组下的设备
    const getGroupingEquipment = async () => {
      let params = {
        ...state.groupSearch,
      };
      const currentApplication = sessionStorage.getItem("GH-currentApplication");
      let res = await cubeDeviceCenterService.deviceGroupDevicesAll("builtin.app::" + JSON.parse(currentApplication).code);
      state.groupingEquipment = res?.map((e) => {
        e.id = `${e.name}-${e.id}`;
        return e;
      });
    };
    onMounted(async () => {
      getGroupingEquipment();
      getTreeData();
      await getMonitorLayoutConfig();
      getCollection();
      handleCache();
    });
    // 缓存数据 后期实现页面组件缓存后去除此方法
    const handleCache = () => {
      const payload = sessionStorage.getItem(sessionMonitorKey);
      if (payload) {
        const cacheState = JSON.parse(payload);
        for (const key in cacheState) {
          state[key] = cacheState[key];
        }
        gridChange({
          target: {
            value: state.grid,
          },
        });
      }
    };
    const isAiTag = (tags) => {
      let tagCodes = [];
      if (Array.isArray(tags) && tags.length > 0) {
        tagCodes = tags.map((item) => item.tagCode);
      }
      return tagCodes.includes("builtin.usage::artificial_intelligence");
    };
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
      saveCollect,
      checkedCollect,
      changeActiveKey,
      editCollectionName,
      deleteCollection,
      refreshVideo,
      searchVideo,
      onShowSizeChange,
      addClass,
      removeClass,
      isAiTag,
      searchGroup,
      handleExpand,
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

  .status-indicator.offline {
    background: #d9d9d9;
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
