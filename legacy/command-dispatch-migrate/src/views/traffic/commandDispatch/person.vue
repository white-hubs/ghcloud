<template>
  <div v-if="compact" class="compact-person-list flex-column">
    <div class="compact-search">
      <a-tree-select
        v-model:value="organizationId"
        allow-clear
        show-search
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        placeholder="部门"
        :replace-fields="{
          children: 'children',
          key: 'id',
          value: 'id',

          title: 'name',
        }"
        :tree-data="deptlist"
        @change="search"
      ></a-tree-select>
      <a-input v-model:value="keyword" allow-clear placeholder="请输入姓名查询" @keyup.enter="search"></a-input>
      <a-button class="searchBtn" @click="search">查询</a-button>
    </div>
    <div v-if="list.length" class="compact-list" @scroll.passive="handleCompactScroll">
      <div class="compact-person-card" v-for="item in list" :key="item.id" @click="handleCompactPersonClick(item)">
        <img v-if="item.file" :src="item.file.path" class="compact-avatar-img" alt="" />
        <img
          v-else
          src="/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png"
          class="compact-avatar-img"
          alt=""
        />
        <div class="compact-info">
          <div class="compact-main">
            <span class="compact-name">{{ item.name }}</span>
            <span v-if="onlineMode" class="compact-status" :class="{ online: item.isOnline, offline: !item.isOnline }">{{
              item.isOnline ? "在线" : "离线"
            }}</span>
            <span v-else class="compact-status" :class="item.workStatus">{{ getWorkStatusText(item.workStatus) }}</span>
          </div>
          <div class="compact-row">部门：{{ getPrimaryOrganization(item) }}</div>
          <div v-if="onlineMode" class="compact-actions">
            <img
              :class="['compact-action-icon', !item.isOnline && 'not-allowed']"
              src="/resource/v1/command-dispatch-migrate/commandDispatch/images/record-icon.png"
              alt="定位"
              @click.stop="handleCompactLocate(item)"
            />
            <img
              :class="['compact-action-icon', !item.isOnline && 'not-allowed']"
              src="/resource/v1/command-dispatch-migrate/commandDispatch/images/audio-call.png"
              alt="语音"
              @click.stop="handleCompactMakeCall(item, false)"
            />
            <img
              :class="['compact-action-icon', !item.isOnline && 'not-allowed']"
              src="/resource/v1/command-dispatch-migrate/commandDispatch/images/video-call.png"
              alt="视频"
              @click.stop="handleCompactMakeCall(item, true)"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="compact-empty">暂无人员数据</div>
    <div v-if="!onlineMode" class="compact-pagination">
      <a-pagination
        v-model:current="pageNumber"
        size="small"
        :pageSize="pageSize"
        :total="total"
        v-if="total > 0"
        @change="handlePageChange"
      />
    </div>
  </div>
  <div v-else class="alarmDetail-plan flex-column">
    <div class="search">
      <a-space :size="16">
        <div v-if="usePersonal">
          <span style="color: #fff">职位:</span>
          <a-select v-model:value="postId" style="width: 200px">
            <a-select-option v-for="item in posList" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </div>
        <a-input v-model:value="keyword" placeholder="请输入姓名"></a-input>

        <span style="color: #fff">部门:</span>

        <a-tree-select
          v-model:value="organizationId"
          show-search
          style="width: 200px"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择部门"
          :replace-fields="{
            children: 'children',
            key: 'id',
            value: 'id',
            title: 'name',
          }"
          :tree-data="deptlist"
        ></a-tree-select>
        <div>
          <span style="color: #fff">工作状态:</span>
          <a-select style="width: 200px" :options="workStatusOptions" v-model:value="onDuty"> </a-select>
        </div>
        <a-button class="searchBtn" @click="search">查询</a-button>
        <a-button class="reset" @click="reset">重置</a-button>
      </a-space>
    </div>
    <div class="alarmDetail-plan-header">
      <div>选择</div>
      <div>人员名称</div>
      <div>联系电话</div>
      <div>性别</div>
      <div>部门</div>
      <div>职位</div>
      <div>工作状态</div>
    </div>
    <div class="table-body">
      <a-checkbox-group v-model:value="value" @change="handleSelectionChange">
        <div class="alarmDetail-plan-item" v-for="item in list" :key="item.id">
          <div><a-checkbox :value="item"></a-checkbox></div>
          <div>{{ item.name }}</div>
          <div>{{ item.mobile }}</div>
          <div>{{ getGender(item?.gender) }}</div>
          <div>{{ item.organizations[0] ? item.organizations[0].name : "--" }}</div>
          <div>{{ item?.positions && item?.positions?.length ? item?.positions[0].name : "--" }}</div>
          <div>{{ item.workStatus ? workStatus[item.workStatus] : "--" }}</div>
        </div>
      </a-checkbox-group>
    </div>
    <div class="alarmDetail-pagination">
      <a-pagination v-model:current="pageNumber" size="small" :total="total" v-if="total > 0" @change="handlePageChange" />
      <!-- <a-button class="btn" size="small" @click="clickAssign" :loading="confirmLoading">
        确认
      </a-button> -->
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref, watch, computed } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
    personalList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    compact: {
      type: Boolean,
      default: false,
    },
    onlineMode: {
      type: Boolean,
      default: false,
    },
    onlinePersonList: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["submit", "focusPerson", "makeCall", "onlineCountChange", "openPersonQuery"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const compactPageSize = 10;
    const workStatus = {
      REST: "休息",
      WORKING: "在岗",
      LEAVE_POST: "离岗",
      AWAY_BUSINESS: "出差",
      ASK_LEAVE: "请假",
    };
    // 保存所有页面的选中数据
    const selectedAll = ref([]);
    const priorityDeptId = ref("");
    watch(
      () => props.personalList,
      (val) => {
        selectedAll.value = val;
        syncSelectedItems();
      },
    );
    const state = reactive({
      value: [],
      list: [],
      keyword: "",
      organizationId: null,
      onDuty: null,
      postId: null,
      deptlist: [],
      pageNumber: 1,
      pageSize: 10,
      onlineAllList: [],
      onlineDisplayCount: compactPageSize,
      confirmLoading: false,
      total: 0,
      workStatusOptions: Object.keys(workStatus).map((item) => {
        return {
          label: workStatus[item],
          value: item,
        };
      }),
    });
    const getdept = async () => {
      const data = await proxy.$api.getOrganizations();
      state.deptlist = data;
    };
    getdept();
    const search = () => {
      state.pageNumber = 1;
      state.onlineDisplayCount = compactPageSize;
      getData();
    };
    const reset = () => {
      state.keyword = "";
      state.onDuty = null;
      state.postId = "";
      state.organizationId = "";
      state.pageNumber = 1;
      state.onlineDisplayCount = compactPageSize;
      getData();
    };
    const getData = () => {
      if (props.onlineMode) {
        getOnlinePersonData();
        return;
      }
      const params = {
        positionId: state.postId,
        workStatus: state.onDuty,
        organizationId: state.organizationId,
        keyword: state.keyword,
        pageSize: state.pageSize,
        pageNumber: state.pageNumber,
      };
      if (priorityDeptId.value) {
        params.sortId = priorityDeptId.value;
      }
      proxy.$api.tenantUserList(params, "get").then((res) => {
        state.list = res.records;
        state.total = res.total;
        // 数据加载完成后，恢复当前页的选中状态
        syncSelectedItems();
      });
    };
    const getOnlinePersonData = () => {
      const keyword = state.keyword.trim().toLowerCase();
      const organizationId = state.organizationId;
      state.onlineAllList = (props.onlinePersonList || []).filter((item) => {
        const matchesKeyword =
          !keyword ||
          [item.name, item.mobile, item.account].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(keyword),
          );
        const organizationIds = [
          item.organization?.id,
          item.organizationId,
          ...(Array.isArray(item.organizations) ? item.organizations.map((organization) => organization.id) : []),
        ];
        const matchesOrganization =
          !organizationId || organizationIds.some((itemOrganizationId) => String(itemOrganizationId) === String(organizationId));
        return matchesKeyword && matchesOrganization;
      });
      state.total = state.onlineAllList.length;
      state.list = state.onlineAllList.slice(0, state.onlineDisplayCount);
    };
    watch(
      () => props.onlinePersonList,
      () => {
        if (props.onlineMode) {
          getOnlinePersonData();
        }
      },
      { immediate: true },
    );
    const handleCompactScroll = (event) => {
      if (!props.onlineMode || state.list.length >= state.onlineAllList.length) return;
      const { scrollTop, scrollHeight, clientHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 12) {
        state.onlineDisplayCount += compactPageSize;
        state.list = state.onlineAllList.slice(0, state.onlineDisplayCount);
      }
    };
    const handlePageChange = (page) => {
      state.pageNumber = page;
      getData();
    };

    /**
     * 同步当前页的选中状态
     * 根据selectedAll中保存的全局选中数据，恢复当前页面的选中状态
     */
    const syncSelectedItems = () => {
      // 清空当前value
      state.value = [];
      // 遍历当前页数据，如果在selectedAll中存在，则添加到value中
      state.list.forEach((item) => {
        const found = selectedAll.value.find((selected) => selected.id === item.id);
        if (found) {
          state.value.push(item);
        }
      });
    };

    /**
     * 处理选择变化
     * 更新全局选中数据集合
     */
    const handleSelectionChange = (checkedValues) => {
      // 先从selectedAll中移除当前页所有数据
      const currentPageIds = state.list.map((item) => item.id);
      selectedAll.value = selectedAll.value.filter((item) => !currentPageIds.includes(item.id));

      // 再将当前选中的数据添加到selectedAll中
      selectedAll.value = [...selectedAll.value, ...checkedValues];
      clickAssign();
    };

    const clickAssign = () => {
      // 使用selectedAll代替state.value
      if (selectedAll.value.length > 0) {
        // state.confirmLoading = true
        // const assignUsers = selectedAll.value.map(item => {
        //   return {
        //     userId: item.id,
        //     userName: item.name,
        //     departmentId: usePersonal.value ? item.organizationId : item.organizations[0]?.id,
        //     departmentName: usePersonal.value ? item.organizationName : item.organizations[0]?.name,
        //   }
        // })
        emit("submit", selectedAll.value);
        // proxy.$api
        //   .alarmHandelAssign({
        //     id: props.id,
        //     assignUsers: assignUsers,
        //   })
        //   .then((res) => {
        //     proxy.$emitter.emit('refreshAlarmList')
        //     proxy.$message.success("操作成功");
        //     emit("close");
        //   }).finally(() => {
        //     state.confirmLoading = false
        //   });
      } else {
        proxy.$message().warn("请选择人员");
      }
    };
    const getGender = (gender) => {
      switch (gender) {
        case "MALE":
          return "男";
          break;
        case "FEMALE":
          return "女";
          break;
        case "NONE":
          return "保密";
        default:
          return "--";
          break;
      }
    };
    const getPrimaryOrganization = (item) => item?.organization?.name || item?.organizations?.[0]?.name || item?.organizationName || "--";
    const getWorkStatusText = (status) => (status ? workStatus[status] || "--" : "--");
    const handleCompactPersonClick = (item) => {
      if (props.onlineMode) {
        emit("openPersonQuery", item);
        return;
      }
      emit("submit", [item]);
    };
    const onlineCount = computed(() => state.onlineAllList.filter((item) => item.isOnline).length);
    watch(
      onlineCount,
      (count) => {
        emit("onlineCountChange", count);
      },
      { immediate: true },
    );
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const handleCompactLocate = (item) => {
      if (!item.isOnline) return;
      emit("focusPerson", item);
    };
    const handleCompactMakeCall = (item, isVideo) => {
      if (!item.isOnline) return;
      if (!webrtcInstance.value) return;
      if (webrtcInstance.value.callState !== "IDLE") {
        proxy.$message.error("当前正在通话中，请先结束通话");
        return;
      }
      const callInfo = {
        isVideo,
        number: item.id,
        mobile: item.mobile,
        file: item.file,
        userName: item.name,
      };
      emit("makeCall", callInfo);
      const mediaControl = document.getElementById("local-make-call-video");
      webrtcInstance.value.makeCall(item.id, mediaControl, isVideo);
    };
    const loadPriorityDepartmentId = async () => {
      try {
        priorityDeptId.value = (await proxy.$api.getPriorityDepartmentId()) || "";
      } catch {
        priorityDeptId.value = "";
      }
    };
    const posList = ref([]);
    const usePersonal = ref(false);
    onMounted(async () => {
      if (!props.compact) {
        await loadPriorityDepartmentId();
        proxy.$api.positionList().then((res) => {
          posList.value = res;
        });
      }
      if (!props.onlineMode) {
        getData();
      }
      selectedAll.value = props.personalList;
      syncSelectedItems();
    });
    return {
      usePersonal,
      posList,
      workStatus,
      ...toRefs(state),
      getData,
      handlePageChange,
      // clickTransfer,
      clickAssign,
      search,
      reset,
      getdept,
      getGender,
      handleSelectionChange,
      getPrimaryOrganization,
      getWorkStatusText,
      handleCompactPersonClick,
      handleCompactLocate,
      handleCompactMakeCall,
      handleCompactScroll,
    };
  },
});
</script>

<style lang="less" scoped>
.compact-person-list {
  height: 100%;
  overflow: hidden;
  padding: 0 8px;
  box-sizing: border-box;
}

.compact-search {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 50px;
  gap: 6px;
  align-items: center;
  padding: 2px 0 8px;

  :deep(.ant-select),
  :deep(.ant-input-affix-wrapper) {
    width: 100%;
    min-width: 0;
  }

  :deep(.ant-select-single:not(.ant-select-customize-input) .ant-select-selector),
  :deep(.ant-input-affix-wrapper) {
    height: 28px;
    padding: 0 8px;
    color: #ffffff;
    background: rgba(5, 20, 48, 0.72);
    border-color: rgba(41, 137, 255, 0.68);
    border-radius: 2px;
    box-shadow: inset 0 0 10px rgba(41, 137, 255, 0.16);
  }

  :deep(.ant-select-single .ant-select-selector .ant-select-selection-search-input) {
    height: 26px;
  }

  :deep(.ant-select-single .ant-select-selector .ant-select-selection-placeholder),
  :deep(.ant-select-single .ant-select-selector .ant-select-selection-item) {
    padding-right: 14px;
    font-size: 12px;
    line-height: 26px;
  }

  :deep(.ant-select-selection-placeholder),
  :deep(.ant-select-selection-item),
  :deep(.ant-select-arrow),
  :deep(.ant-input-clear-icon) {
    color: rgba(191, 210, 232, 0.9);
  }

  :deep(.ant-input) {
    height: 26px;
    padding: 0;
    color: #ffffff;
    font-size: 12px;
    background: transparent;
    border: 0;
    box-shadow: none;

    &::placeholder {
      color: rgba(191, 210, 232, 0.68);
    }
  }

  .searchBtn {
    height: 28px;
    padding: 0 8px;
    background: #2989ff;
    color: #ffffff;
    border-color: #2989ff;
    border-radius: 2px;
    font-size: 12px;
    line-height: 26px;
  }
}

.compact-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 2px;
}

.compact-person-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 96px;
  padding: 10px 8px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;

  &:hover {
    border-color: rgba(41, 137, 255, 0.72);
    background: linear-gradient(90deg, rgba(25, 103, 191, 0.42), rgba(19, 78, 150, 0.24) 62%, rgba(9, 33, 76, 0.08));
    box-shadow:
      inset 0 0 18px rgba(41, 137, 255, 0.18),
      0 0 12px rgba(41, 137, 255, 0.16);
  }
}

.compact-avatar-img {
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  border: 1px solid rgba(41, 137, 255, 0.52);
  border-radius: 2px;
  background: rgba(8, 31, 68, 0.72);
  object-fit: cover;
}

.compact-info {
  min-width: 0;
  flex: 1;
  color: rgba(228, 228, 228, 0.92);
  font-size: 12px;
}

.compact-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.compact-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-status {
  flex: 0 0 auto;
  min-width: 38px;
  padding: 1px 5px;
  border: 1px solid rgba(41, 137, 255, 0.58);
  border-radius: 2px;
  color: #9fc8ff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;

  &.WORKING {
    border-color: rgba(51, 214, 143, 0.6);
    color: #33d68f;
  }

  &.online {
    border-color: rgba(30, 193, 56, 0.6);
    background: rgba(30, 193, 56, 0.18);
    color: #1ec138;
  }

  &.offline {
    border-color: rgba(255, 151, 55, 0.58);
    background: rgba(255, 151, 55, 0.18);
    color: #ff9737;
  }

  &.LEAVE_POST,
  &.ASK_LEAVE {
    border-color: rgba(255, 155, 80, 0.62);
    color: #ffb56e;
  }
}

.compact-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.compact-action-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &.not-allowed {
    cursor: not-allowed;
    opacity: 0.36;
    filter: grayscale(1);

    &:hover {
      transform: none;
    }
  }
}

.compact-row {
  overflow: hidden;
  line-height: 18px;
  color: rgba(183, 197, 211, 0.92);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 40px);
  color: rgba(183, 197, 211, 0.78);
}

.compact-pagination {
  height: 42px;
  padding-top: 9px;
  text-align: center;
}

.search {
  margin-bottom: 16px;

  :deep(.ant-input) {
    color: #ffffff;
    background-color: transparent;
    border-color: #2989ff;

    &:hover {
      border-color: #2989ff;
    }
  }

  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .searchBtn {
    background: #2989ff;
    color: #ffffff;
    border-color: #2989ff;
  }

  .reset {
    color: #2989ff;
    background: #000000;
    border-color: #2989ff;
  }
}

.alarmDetail-plan {
  padding-top: 10px;
  height: 100%;
  overflow: hidden;

  .alarmDetail-plan-header {
    height: 42px;
    background: #285487;
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    padding-left: 20px;
    color: white;
    display: flex;

    > div {
      flex: 1;
      height: 100%;
      line-height: 42px;
      text-align: left;
    }
  }

  .table-body {
    flex: 1;
    overflow: auto;
  }
  .ant-checkbox-group {
    width: 100%;
  }
  .alarmDetail-plan-item {
    width: 100%;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    min-height: 42px;
    font-weight: 400;
    color: #e4e4e4;
    align-items: center;
    padding-left: 20px;
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    > div {
      flex: 1;
      text-align: left;

      > span {
        color: rgba(41, 137, 255, 1);
        cursor: pointer;
      }
    }
  }

  .alarmDetail-pagination {
    padding: 23px 0;
    text-align: center;
    position: relative;
  }

  .btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(41, 137, 255, 1);
    border-color: rgba(41, 137, 255, 1);
    color: #ffffff;
    z-index: 10;

    &.ant-btn:hover {
      color: #ffffff;
      border-color: rgba(41, 137, 255, 1);
      background: rgba(41, 137, 255, 1);
    }
  }
}
</style>
<style lang="less">
.alarmDetail-pagination {
  .ant-pagination {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: rgba(228, 228, 228, 1) !important;

    a {
      color: rgba(228, 228, 228, 1) !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: rgba(228, 228, 228, 1) !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: rgba(228, 228, 228, 1) !important;
  }
}

.alarmDetail-plan {
  .ant-radio-group {
    width: 100%;
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #2989ff !important;
  }

  .ant-radio-inner::after {
    background-color: #2989ff;
  }
}
</style>
