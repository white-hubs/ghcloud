<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    :confirmLoading="show"
    width="1000px"
    title=""
    @cancel="close"
    @ok="close('ok')"
  >
    <a-form layout="inline" :model="searchForm" class="modal-form">
      <a-form-item label="品类品类">
        <a-cascader
        change-on-select
          v-model:value="searchForm.prodCategoryCode"
          placeholder="请输入"
          style="width: 200px"
          :field-names="{
            label: 'categoryName',
            value: 'categoryCode',
            children: 'children',
          }"
          :options="options"
        >
          <!-- <a-select-option v-for="item in options" :value="item.value">{{ item.label }}</a-select-option> -->
        </a-cascader>
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="searchForm.keyword" placeholder="请输入设备名称或编码" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="getData">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
    <a-table
      rowKey="id"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :scroll="{ y: 450 }"
      size="middle"
      @change="pageChange"
      :loading="spinning"
    >
    </a-table>
  </a-modal>
</template>

<script>
import {
  ref,
  toRefs,
  unref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const searchForm = reactive({
      prodCategoryCode: [],
      keyword: "",
    });
    const spinning = ref(false);
    const selectAll = ref(false);
    const state = reactive({
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      allList: [],
      pagination: {
        showTotal: (total) =>
          `共 ${total} 条   第${state.pagination.current}/${Math.ceil(
            total / state.pagination.pageSize
          )}页`,
        total: 0,
        position: "bottom",
        pageSize: 10,
        current: 1,
      },
      columns: [
        {
          dataIndex: "code",
          title: "设备编码",
        },
        {
          dataIndex: "name",
          title: "设备名称",
        },
        {
          dataIndex: "genreName",
          title: "产品品类",
          customRender: ({ record }) => {
            return record.productInfo.productCategory.name;
          },
        },
        // {
        //   dataIndex: "modelName",
        //   title: "设备型号",
        //   customRender: ({ record }) => {
        //     return record.productInfo?.modelName;
        //   },
        // },
        {
          dataIndex: "brandName",
          title: "设备品牌",
          customRender: ({ record }) => {
            return record.productInfo?.brandName;
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          width: 200,
          customRender: ({ record }) => {
            return record?.area?.pathName;
          },
        },
      ],
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const options = ref([]);
    let show = ref(false);
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
          // selectedRows.forEach((item) => {
          //   const index = state.selectedRows.findIndex((s) => s["id"] === item["id"]);
          //   if (index === -1) {
          //     state.selectedRows.push(item);
          //   }
          // });
        },
      };
    });

    const close = (data) => {
      show.value = true;
      reset();
      if (data === "ok") {
        getFilter();
        const obj = {
          selectAll: selectAll.value,
          ...searchForm,
        };
        emit("close", state.allList, selectAll.value, false);
        spinning.value = true;
      } else {
        emit("close", [], selectAll.value, true);
      }
    };
    const reset = () => {
      Object.assign(searchForm, {
        genreId: null,
        prodCategoryCode:[],
        keyword: "",
      });
      state.pagination.current = 1;
      getData();
    };
    const getData = () => {
      spinning.value = true;
      const obj = {
        filterTagCodes:[`builtin.app::OUTSOURCE_REPAIR`],
        applicationCode: 'OUTSOURCE_REPAIR',
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
        ...searchForm,
        categoryCode:searchForm.prodCategoryCode.join('-')
      };
      proxy.$api.getDevices(obj).then((res) => {
        state.dataSource = res.records;
        state.pagination.total = res.total;
        spinning.value = false;
      });
    };
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item["deviceId"]) > -1) {
          return item;
        }
      });
    };
    onMounted(() => {
      proxy.$api.getDeviceProduct().then((res) => {
        options.value = res;
      });
      getData();
    });

    const pageChange = (pageData) => {
      const { current, pageSize } = pageData;
      state.pagination.current = current;
      state.pagination.pageSize = pageSize;
      getData();
    };
    return {
      searchForm,
      options,
      close,
      spinning,
      reset,
      rowSelection,
      selectAll,
      getData,
      ...toRefs(state),
      pageChange,
    };
  },
});
</script>
<style lang="less" scoped>
.ant-table-body{

  &::-webkit-scrollbar {
    width: 10px !important; 
    height: 10px !important;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px !important;
    box-shadow: inset 0 0 5px rgba(97, 184, 179, 0.1) !important;
    background: #b2b2b2 !important;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(87, 175, 187, 0.1) !important;
    border-radius: 10px !important;
    background: #eaeaea !important;
  }


}


</style>
