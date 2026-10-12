<template>
  <div class="alarmDetail-plan flex-column">
    <div class="search">
      <a-space :size="16">
       <div v-if="usePersonal">
        <span style="color: #fff">岗位:</span>
        <a-select v-model:value="postId" style="width: 200px">
          <a-select-option
            v-for="item in posList"
            :value="item.id"
            :key="item.id"
            >{{ item.name }}</a-select-option
          >
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
      <div v-if="usePersonal" >
        <span style="color: #fff">是否在岗:</span>
        <a-select style="width: 200px" v-model:value="onDuty">
          <a-select-option :value="true">是</a-select-option>
          <a-select-option :value="false">否</a-select-option>
        </a-select>
      </div>
        <a-button class="searchBtn" @click="search">查询</a-button>
        <a-button class="searchBtn" @click="reset">重置</a-button>
      </a-space>
    </div>
    <div class="alarmDetail-plan-header">
      <div>选择</div>
      <div>人员名称</div>
      <div>联系电话</div>
      <div>性别</div>
      <div>部门</div>
      <div v-if="usePersonal">岗位</div>
      <div v-if="usePersonal">是否在岗</div>
    </div>
    <div class="table-body">
      <a-radio-group v-model:value="value">
        <div class="alarmDetail-plan-item" v-for="item in list" :key="item.id">
          <div><a-radio :value="item"></a-radio></div>
          <div>{{ item.name }}</div>
          <div>{{ item.mobile }}</div>
          <div v-if="usePersonal">{{ item?.gender ?? "--" }}</div>
          <div v-else>{{ item?.gender=='MALE'?'男':'女' }}</div>
          <div v-if="usePersonal">{{ item.organizationName }}</div>
          <div v-else>{{ item.organizations[0].name }}</div>
       
          <div v-if="usePersonal">{{ item?.postNames ? item?.postNames : "--" }}</div>
          <div v-if="usePersonal">{{ item?.onDuty ? "是" : "否" }}</div>
        </div>
      </a-radio-group>
    </div>
    <div class="alarmDetail-pagination">
      <a-pagination
        v-model:current="pageNumber"
        size="small"
        :total="total"
        v-if="total > 0"
        @change="getData"
      />
      <!-- <a-button
        v-if="operationType === 'transfer'"
        class="btn"
        size="small"
        @click="clickTransfer"
      >
        移交
      </a-button> -->
      <a-button
        v-if="operationType === 'assign'"
        class="btn"
        size="small"
        @click="clickAssign"
      >
        指派
      </a-button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  onMounted,
  ref,
} from "vue";
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
    operationType: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      value: "",
      list: [],
      keyword: "",
      organizationId: null,
      onDuty: null,
      postId: null,
      deptlist: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
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
      // Object.assign(state.keyword, "");
      getData();
    };
    const getData = () => {
     
      proxy.$api
        .tenantUserList(
          {
            postId: state.postId,
            onDuty: state.onDuty,
            organizationId: state.organizationId,
            keyword: state.keyword,
            pageSize: state.pageSize,
            pageNumber: state.pageNumber,
          },
          "get"
        )
        .then((res) => {
          state.list = res.records;
          state.total = res.total;
        });
    };
    const clickTransfer = () => {
      if (state.value) {
        proxy.$api
          .postAlarmTransfer({
            id: props.id,
            userId: selectedItems[0].userId,
            userName: selectedItems[0].name,
            departmentId: selectedItems[0].organizationId,
            departmentName: selectedItems[0].organizationName,
          })
          .then((res) => {
            proxy.$message.success("操作成功");
            emit("close");
          });
      } else {
        proxy.$message.warn("请选择人员");
      }
    };
    const clickAssign = () => {
   
      if (state.value) {
        proxy.$api
          .alarmHandelAssign({
            id: props.id,
            assignUsers: [
              {
                userId: state.value.id,
                userName: state.value.name,
                departmentId:usePersonal.value? state.value.organizationId:state.value.organizations[0]?.id,
                departmentName: usePersonal.value?state.value.organizationName:state.value.organizations[0]?.name,
              },
            ],
          })
          .then((res) => {
            proxy.$message.success("操作成功");
            emit("close");
          });
      } else {
        proxy.$message().warn("请选择人员");
      }
    };
    const posList = ref([]);
    const usePersonal=ref(false)
    onMounted(() => {
      usePersonal.value=window?.config?.feature==undefined?false: window?.config?.feature?.usePersonal
      getData();
      proxy.$api.positionList().then((res) => {
        posList.value = res;
      });
    });
    return {
      usePersonal,
      posList,
      ...toRefs(state),
      getData,
      clickTransfer,
      clickAssign,
      search,
      reset,
      getdept,
    };
  },
});
</script>

<style lang="less" scoped>
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

  .alarmDetail-plan-item {
    height: 48px;
    font-size: 14px;
    font-family: PingFang SC-Regular;
    font-weight: 400;
    color: #e4e4e4;
    padding-left: 20px;
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    > div {
      flex: 1;
      height: 100%;
      line-height: 48px;
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
