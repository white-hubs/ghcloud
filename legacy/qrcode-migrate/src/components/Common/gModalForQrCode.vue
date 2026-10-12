<template>
  <a-modal
    v-model:visible.sync="modalVisible"
    :confirmLoading="show"
    width="1000px"
    :title="title + '列表'"
    @cancel="close('cancel')"
    @ok="close('ok')"
    destroyOnClose
  >
    <a-form
      layout="inline"
      :model="form"
      class="modal-form"
      v-if="searchList.length > 0"
    >
      <a-form-item
        v-for="(item, index) in searchList"
        :label="item.label"
        :key="index"
      >
        <component
          v-model:value="form[item.value]"
          :is="item.component ? item.component : 'a-input'"
          :placeholder="item.placeholder ? item.placeholder : '请输入'"
          :options="item.options ? item.options : []"
          :field="item.field ? item.field : null"
          :url="item.url ? item.url : null"
          :style="{ width: '218px' }"
          :params="item?.params ? item.params : null"
          allowClear
        ></component>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="searchForm">查询</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :loading="isLoading"
      :rowKey="rowKey"
      :dataSource="dataSource"
      :columns="columns"
      :row-selection="rowSelection"
      :pagination="pagination"
      :scroll="{ y: 350 }"
      size="middle"
      @change="changePage"
    ></a-table>
  </a-modal>
</template>

<script>
import {
  defineComponent,
  ref,
  toRefs,
  computed,
  unref,
  reactive,
  watch,
  getCurrentInstance,
} from "vue";

export default defineComponent({
  props: {
    visible: {
      default: false,
      type: Boolean,
    },
    activeId: {
      default: () => [],
      type: Array,
    },
    title: {
      default: "",
      type: String,
    },
		entityType: {
      default: "",
      type: String,
    },
    url: {
      default: "",
      type: String,
    },
    selectionType: {
      default: "checkbox",
      type: String,
    },
    search: {
      default: () => [],
      type: Array,
    },
    columns: {
      default: () => [],
      type: Array,
    },
    rowKey: {
      type: [String, Number],
      default: "id",
    },
    defaultParams: {
      default: () => {},
      type: Object,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const searchList=ref([])
    const state = reactive({
      allList: [],
      dataSource: [],
      isLoading: false,
      selectedRows: [],
      selectedRowKeys: props.activeId,
      selected: null,
      form: {},
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
    });
    const modalVisible = computed(() => {
      return props.visible;
    });
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        type: props.selectionType,
        onChange: (keys, selectedRows) => {
          state.selectedRowKeys = keys;
          state.allList = selectedRows;
          selectedRows.forEach((item) => {
            const index = state.selectedRows.findIndex(
              (s) => s[props.rowKey] === item[props.rowKey]
            );
            if (index === -1) {
              state.selectedRows.push(item);
            }
          });
        },
      };
    });
    watch(()=>props.search,()=>{
      searchList.value= props.search
    },{deep:true,immediate:true})
    watch(modalVisible, (n) => {
      if (n) {
        state.selectedRowKeys = props.activeId;
        if (n) {
          show.value = false;
        }
        let api=''
        switch(props.entityType){
          case 'DEVICE':
          api='getDeviceTypeList'
          break;
          case 'PROPERTY':
          api='getAssemblyClassifyPage'
          break;
          case 'STALL':
          api='getStallList'
          break;
          case 'SITE_POINT':
          api='getSceneTypeList'
          break;
        }
        searchList.value.forEach(item=>{
          if(item.value==='typeId'||item.value==='type'||item.value==='genreId'){
            item.url=api
            if(api==='getDeviceTypeList'){
              item.component='g-tree-select'
              item.label='产品品类'
              item.field={categoryCodeConcat: 'value', categoryName: 'label'}
              delete item.params
            }else if(api==='getAssemblyClassifyPage'){
              item.params={type:'assetType'}
              item.field={id: 'value', name: 'label'}
              item.component='g-select'
              item.label='设备类型'
            }else{
              item.component='g-select'
              item.field={id: 'value', name: 'label'}
              item.label='设备类型'
              delete item.params
            }
          }
        })
        getData();
      }
    });
    const getFilter = () => {
      state.selected = [];
      state.selected = state.selectedRows.filter((item) => {
        if (state.selectedRowKeys.indexOf(item[props.rowKey]) > -1) {
          return item;
        }
      });
    };
    const getData = () => {
      try {
        searchList.value.forEach((item) => {
          if (item.component === "a-range-picker") {
            if (item.defaultDate) {
              const date =
                state.form.date && state.form.date.length > 0
                  ? [
                      timeFormat(state.form.date[0], false),
                      timeFormat(state.form.date[1], false),
                    ]
                  : [];
              if (date.length > 0) {
                state.form[item.defaultDate] = date.join(",");
              } else {
                state.form[item.defaultDate] = null;
              }
            }
          }
          if (item.component === "span") {
            if (item.defaultValue) {
              state.form[item.value] = item.defaultValue;
            }
          }
        });
        const formParams = {
          ...state.form,
          ...props.defaultParams,
          date: null,
          pageNumber: state.pagination.current,
          pageSize: state.pagination.pageSize,
        };
        if(props.entityType==='DEVICE'){
          formParams.categoryCode=formParams.typeId  
          if(formParams.areaId)formParams.anyMatchedAreaId=formParams.areaId.join('-')
          delete formParams.typeId
        }
        if(Array.isArray(formParams.areaId)){
            formParams.areaId=formParams.areaId[formParams.areaId.length-1]
        }
        if(props.entityType==='STALL'){
          formParams.type=formParams.typeId 
          delete formParams.typeId
        }
        if(props.entityType==='SITE_POINT'){
          formParams.pointName=formParams.keyword
          delete formParams.keyword
        }
        if (props.url) {
          state.isLoading = true;
          proxy.$api[props.url](formParams).then((res) => {
            emit("recodes", Array.isArray(res) ? res : res.records );
            if (props.url === 'patrolLocationPage') {
              state.dataSource =  Array.isArray(res) ? res : res.records.map(item=>{
                return{
                  ...item,
                  name:item.patrolLocationName
                }
              });
            }else{
              state.dataSource =  Array.isArray(res) ? res : res.records;
            }
            state.pagination.total = res.total;
            state.isLoading = false;
            // state.pagination.showTotal = `共${res.total}条`;
            getFilter();
          });
        }
      } catch (e) {
        state.isLoading = false;
      }

    };
    let show = ref(false);
    const close = (data) => {
      if(data==='cancel'){
        reset();
        emit("close");
        return
      }
      if(state.selectedRowKeys.length===0){
        proxy.$message.warn('请选择一个实体')
        return
      }
      show.value = true;
      reset();
      if (data === "ok") {
        getFilter();
        emit("close", state.selected, state.selectedRowKeys);
      } else {
        emit("close");
      }
    };
    const changePage = (e) => {
      state.pagination.current = e.current;
      state.pagination.pageSize = e.pageSize;
      getData();
    };
    const searchForm = () => {
      state.pagination.current = 1;
      getData();
    };
    const reset = () => {
      searchList.value.forEach((item) => {
        state.form[item.value] = item.defaultValue ? item.defaultValue : null;
      });
      state.pagination.current = 1;
      getData();
    };
    return {
      ...toRefs(state),
      modalVisible,
      searchList,
      show,
      rowSelection,
      close,
      getData,
      changePage,
      reset,
      searchForm,
    };
  },
});
</script>

<style lang="less" scoped>
.modal-form {
  margin-bottom: 20px;
}
:deep(.ant-form-inline .ant-form-item) {
  margin-bottom: 10px;
}
</style>
<style lang="less">
.modal-form {
  .ant-form-item {
    margin-bottom: 10px !important;
  }
}
</style>