<template>
  <div class="alarmDetail-plan flex-column">
    <div class="search">
      <a-space :size="16">
        <div v-if="usePersonal">
          <span class="filter-label">职位:</span>
          <a-select v-model:value="postId" style="width: 200px">
            <a-select-option v-for="item in posList" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </div>
        <a-input v-model:value="keyword" placeholder="请输入姓名"></a-input>

        <span class="filter-label">部门:</span>

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
          <span class="filter-label">工作状态:</span>
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
      <a-pagination v-model:current="pageNumber" size="small" :total="total" v-if="total > 0" @change="getData" />
      <!-- <a-button class="btn" size="small" @click="clickAssign" :loading="confirmLoading">
        确认
      </a-button> -->
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, ref, watch } from "vue";
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
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const workStatus = {
      REST: "休息",
      WORKING: "在岗",
      LEAVE_POST: "离岗",
      AWAY_BUSINESS: "出差",
      ASK_LEAVE: "请假",
    };
    // 保存所有页面的选中数据
    const selectedAll = ref([]);
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
      getData();
    };
    const reset = () => {
      state.keyword = "";
      state.onDuty = null;
      state.postId = "";
      state.organizationId = "";
      getData();
    };
    const getData = () => {
      proxy.$api
        .tenantUserList(
          {
            positionId: state.postId,
            workStatus: state.onDuty,
            organizationId: state.organizationId,
            keyword: state.keyword,
            pageSize: state.pageSize,
            pageNumber: state.pageNumber,
          },
          "get",
        )
        .then((res) => {
          state.list = res.records;
          state.total = res.total;
          // 数据加载完成后，恢复当前页的选中状态
          syncSelectedItems();
        });
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
    const posList = ref([]);
    const usePersonal = ref(false);
    onMounted(() => {
      // usePersonal.value = window?.config?.feature == undefined ? false : window?.config?.feature?.usePersonal
      getData();
      proxy.$api.positionList().then((res) => {
        posList.value = res;
      });
      selectedAll.value = props.personalList;
      syncSelectedItems();
    });
    return {
      usePersonal,
      posList,
      workStatus,
      ...toRefs(state),
      getData,
      // clickTransfer,
      clickAssign,
      search,
      reset,
      getdept,
      getGender,
      handleSelectionChange,
    };
  },
});
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 16px;

  :deep(.ant-input) {
    color: #000000;
    background-color: var(--dispatch-input-bg, #ffffff);
    border-color: var(--dispatch-map-blue-border, #b9d5f4);

    &:hover {
      border-color: #216cc3;
    }
  }

  :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    background: var(--dispatch-input-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
    color: #000000;
  }

  :deep(.ant-input::placeholder),
  :deep(.ant-select-selection-placeholder) {
    color: #666666 !important;
  }

  :deep(.ant-select-selection-item),
  :deep(.ant-select-arrow) {
    color: #000000 !important;
  }

  .searchBtn {
    background: #216cc3;
    color: #ffffff;
    border-color: #216cc3;
  }

  .reset {
    color: #216cc3;
    background: var(--dispatch-panel-bg-solid, #ffffff);
    border-color: #216cc3;
  }
}

.alarmDetail-plan {
  padding-top: 10px;
  height: 100%;
  overflow: hidden;

  .alarmDetail-plan-header {
    height: 42px;
    background: #f6f9ff;
    font-size: 14px;
    font-family: PingFang SC-Medium;
    font-weight: 500;
    padding-left: 20px;
    color: #000000;
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
    color: #000000;
    align-items: center;
    padding-left: 20px;
    display: flex;
    border-bottom: 1px solid var(--dispatch-border-soft, #e7eff8);

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
    color: #000000 !important;
  }

  .ant-pagination-item-active {
    background: transparent !important;
  }

  .ant-pagination-item {
    border-color: #d1d1d1;
    color: #000000 !important;

    a {
      color: #000000 !important;
    }
  }

  .ant-pagination.mini .ant-pagination-prev,
  .ant-pagination.mini .ant-pagination-next {
    color: #000000 !important;
  }

  .ant-pagination-prev a,
  .ant-pagination-next a {
    color: #000000 !important;
  }
}

.alarmDetail-plan {
  .ant-radio-group {
    width: 100%;
  }

  .ant-radio-checked .ant-radio-inner {
    border-color: #216cc3 !important;
  }

  .ant-radio-inner::after {
    background-color: #216cc3;
  }
}
</style>
