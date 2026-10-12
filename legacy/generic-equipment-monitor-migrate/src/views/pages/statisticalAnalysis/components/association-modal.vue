<template>
  <a-modal v-model:visible.sync="modalVisible" :confirmLoading="show" width="1300px" title="" @cancel="close"
    @ok="close('ok')">
    <a-form layout="inline" :model="searchForm" class="modal-form">
      <a-form-item label="所属产品" style="padding-right: 0; margin-right: 10px; margin-bottom: 10px;">
        <a-select 
         v-model:value="searchForm.productId"
         optionFilterProp='label' 
         placeholder="请选择所属产品"
         show-search
         style="width: 180px" :options="productOptions">
        </a-select>
      </a-form-item>
      <a-form-item label="产品品类" style="padding-right: 0; margin-right: 10px; margin-bottom: 10px;">
        <a-cascader v-model:value="searchForm.categoryCode" placeholder="请选择产品品类" change-on-select style="width: 180px"
          :field-names="{
            label: 'categoryName',
            value: 'categoryCode',
            children: 'children',
          }" 
          :options="options"
          show-search
        >
        </a-cascader>
      </a-form-item>
      <a-form-item label="所在区域:" style="padding-right: 0; margin-right: 10px; margin-bottom: 10px;">
        <a-cascader v-model:value="searchForm.anyMatchedAreaId" change-on-select placeholder="请选择所在区域"
          :field-names="{ label: 'name', value: 'id', children: 'children'  }" style="width: 200px" :options="areaOptions" show-search>
        </a-cascader>
      </a-form-item>
      <a-form-item label="维护部门:" style="padding-right: 0; margin-right: 10px; margin-bottom: 10px;">
        <a-cascader v-model:value="searchForm.anyMatchedDepartmentId" change-on-select placeholder="请选择维护部门"
          :field-names="{ label: 'name', value: 'id', children: 'children' }" style="width: 180px" :options="deptOptions" show-search>
        </a-cascader>
      </a-form-item>
      <a-form-item label="设备标签:">
        <a-select 
        v-model:value="searchForm.tagCodes" 
        change-on-select 
        mode="multiple" 
        optionFilterProp='label' 
        placeholder="请选择设备标签"
        :field-names="{ label: 'tagName', value: 'tagCode' }" :maxTagCount="1"
         style="width: 200px" :options="customerTagOptions">
        </a-select>
      </a-form-item>
      <a-form-item label="">
        <a-input v-model:value="searchForm.keyword" placeholder="请输入设备名称或编码" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch">查询</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">重置</a-button>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model:checked="selectAll">勾选当前所有</a-checkbox>
      </a-form-item>
    </a-form>
    <a-table rowKey="id" :dataSource="dataSource" :columns="columns" :row-selection="rowSelection"
      :pagination="pagination" :scroll="{ y: 450 }" size="middle" @change="pageChange" :loading="spinning">
    </a-table>
  </a-modal>
</template>

<script lang="jsx">
import { attributeType, comparator } from "@/utils/enumerate";
import {
  ref,
  toRefs,
  unref,
  reactive,
  defineComponent,
  computed,
  onMounted,
  getCurrentInstance,
  watch
} from "vue";
import { useStore } from "vuex";
import { cubeOuaaService,cubeDeviceCenterService } from '@/api/service'
export default defineComponent({
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const searchForm = reactive({
      productId: null,
      categoryCode: [],
      keyword: "",
      anyMatchedAreaId: [],
      anyMatchedDepartmentId: [],
      tagCodes: []
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
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <a-popover
                content={text}
              >
                {text}
              </a-popover>
            );
          },
          // width: 180,
        },
        {
          dataIndex: "name",
          title: "设备名称",
        },
        {
          dataIndex: "genreName",
          title: "产品品类",
          customRender: ({ record }) => {
            return record?.productInfo?.productCategory?.name;
          },
        },
        {
          dataIndex: "modelName",
          title: "产品名称",
          customRender: ({ record }) => {
            return record?.productInfo?.name;
          },
        },
        {
          dataIndex: "brandName",
          title: "设备品牌",
          customRender: ({ record }) => {
            return record?.productInfo?.brandName;
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
    watch(() => props.visible, () => {
      getData()
    })
    const options = ref([]);
    const customerTagOptions = ref([]);
    const areaOptions = ref([]);
    const deptOptions = ref([]);
    const productOptions = ref([]);
    let show = ref(false);
    const rowSelection = computed(() => {
      return {
        selectedRowKeys: unref(state.selectedRowKeys),
        onSelect: (record, selected) => {
          selected
            ? state.allList.push(record)
            : state.allList.splice(
              state.allList.findIndex(x => x.id === record.id),
              1
            )
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          state.allList = selected
            ? state.allList.concat(changeRows)
            : state.allList.filter(x => !changeRows.find(i => i.id === x.id))
        },
        // 选中
        onChange: (selectedRowKeys) => {
            state.selectedRowKeys = selectedRowKeys
        },

      };
    });
    const application = computed(() => {
      return JSON.parse(sessionStorage.getItem("GH-currentApplication"));
    });
    const close = (data) => {
      show.value = true;
      const obj = {
        selectAll: selectAll.value,
        applicationCode: application.value.code,
        ...searchForm,
    };
      if (data === "ok") {
        getFilter();
        emit("close", state.allList, obj, false);
        spinning.value = true;
      } else {
        emit("close", [], obj, true);
      }
      // reset();
    };
    const handleSearch = () => {
      state.pagination.current = 1;
      getData();
    }
    const reset = () => {
      Object.assign(searchForm, {
        productId: null,
        categoryCode: [],
        keyword: "",
        anyMatchedAreaId: [],
        anyMatchedDepartmentId: [],
        tagCodes: []
      });
      state.pagination.current = 1;
      getData();
    };
    const getData = () => {
      spinning.value = true;
      let productId = ''
      if(productOptions.value && searchForm.productId){
        const cur = productOptions.value.find(i => i.value === searchForm.productId)
        productId = cur ? cur.id : ''
      }
      const obj = {
        filterTagCodes: [`builtin.app::${application.value.code}`],
        applicationCode: application.value.code,
        pageNumber: state.pagination.current,
        pageSize: state.pagination.pageSize,
        ...searchForm,
        productId: searchForm.productId ?? '',
        tagCodes: searchForm.tagCodes ?? [],
        categoryCode: searchForm.categoryCode.join('-'),
        anyMatchedAreaId: searchForm.anyMatchedAreaId.join('-'),
        anyMatchedDepartmentId: searchForm.anyMatchedDepartmentId.join('-')
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
      cubeOuaaService.getDeptList({ enabled: true }).then((res) => {
        deptOptions.value = res;
      });
      cubeDeviceCenterService.getCustomerTagListAll({ status: 1 }).then((res) => {
        if(res.length > 0){
          res.forEach(item => {
            item.value = item.tagCode
            item.label = item.tagName
          })
          customerTagOptions.value = res.map(item => {
            return {
              value: item.tagCode,
              label: item.tagName
            }
          })
        }
      });
      cubeDeviceCenterService.getProductListAll().then((res) => {
        if(res.length > 0){
          productOptions.value = res.map(item => {
            return {
              value: item.id,
              label: item.prodName
            }
          })
        }
      });
      proxy.$api.getArea().then((res) => {
        areaOptions.value = res;
      })
      proxy.$api.getDeviceGenre().then((res) => {
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
      handleSearch,
      areaOptions,
      deptOptions,
      productOptions,
      ...toRefs(state),
      pageChange,
      customerTagOptions,
      attributeType: attributeType,
    };
  },
});
</script>
<style lang="less" scoped>
::deep(.ant-modal .ant-modal-body .ant-form .ant-form-item-label){
  width: inherit !important;
}
.ant-modal .ant-modal-body .ant-form .ant-form-item-label,
.ant-form-item-label,
:deep(.ant-form-item-label) {
  width: inherit !important;
}
:deep(.ant-select-selector):after{
  display: none;
}
</style>
