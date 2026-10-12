<template>
  <div>
    <a-form layout="inline">
      <a-form-item label="联动条件">
        <a-cascader
          change-on-select
          v-model:value="ruleData.deviceProdCategoryCodeConcat"
          :options="cascaderOptions"
          placeholder="请选择产品类型"
          style="width: 200px"
          :field-names="{
            label: 'categoryName',
            value: 'categoryCode',
            children: 'children',
          }"
          @change="changeDeviceType"
        />
        <!-- <g-select
          url="getDeviceTypsList"
          :showSearch="true"
          v-model:value="ruleData.deviceProdCategoryCodeConcat"
          placeholder="请选择设备类型"
          @changeCheck="changeDeviceType"
        ></g-select> -->
      </a-form-item>
      <a-form-item>
        <g-select
          :options="deviceModelList"
          v-model:value="ruleData.deviceProdId"
          placeholder="请选择产品名称"
          @changeCheck="changeModelType"
        ></g-select>
      </a-form-item>
      <a-form-item>
        <div class="flex-between">
          <a-input
            v-model:value="ruleData.name"
            placeholder="请选择设备"
            :disabled="true"
          ></a-input>
          <a-button type="primary" @click="openModal">添加</a-button>
        </div>
      </a-form-item>
      <a-form-item>
        <g-select
          :options="deviceAttribute"
          :field="{ code: 'value', name: 'label' }"
          v-model:value="ruleData.propCode"
          placeholder="选择属性"
          @changeCheck="changeAttribute"
        ></g-select>
      </a-form-item>
      <a-form-item>
        <g-select
          :options="comparator"
          :field="null"
          v-model:value="ruleData.op"
          placeholder="比较操作"
          @changeCheck="changeValue"
        ></g-select>
      </a-form-item>
      <a-form-item v-if="ruleData.dataType === 'enum'">
        <a-select 
          v-model:value="ruleData.oprand"
          :options="ruleData.dataConstraint"
          style="width: 180px;"
          placeholder="请选择具体值"
        >
        </a-select>
      </a-form-item>
      <a-form-item v-else>
        <a-input
          type="number"
          v-model:value="ruleData.oprand"
          placeholder="请输入具体值"
          @change="changeValue"
        ></a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          type="number"
          v-model:value="ruleData.delayTime"
          placeholder="请输入延续时间"
          addon-after="秒"
          @change="changeValue"
        ></a-input>
      </a-form-item>
    </a-form>
    <a-modal v-model:visible="visible" title="选择设备" @ok="handleOk" :width="1000">
      <a-form layout="inline">
        <a-form-item label="所属区域">
          <a-cascader
            v-model:value="search.areaId"
            :options="areaList"
            :fieldNames="{ label: 'name', value: 'id' }"
            change-on-select
            placeholder="请选择区域"
          />
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="search.keyword" placeholder="请输入关键字"></a-input>
        </a-form-item>
        <a-form-item>
          <a-space :size="16">
            <a-button type="primary" @click="getIotDeviceList">查询</a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <div class="table-body">
        <a-table
          :dataSource="tableData"
          :columns="tableColumns"
          rowKey="id"
          :pagination="false"
          size="small"
          bordered
          :row-selection="{
            type: 'radio',
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
          }"
        ></a-table>
      </div>
      <div class="page-body">
        <a-pagination
          v-model:current="search.pageNumber"
          v-model:page-size="search.pageSize"
          :total="total"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="changeTablePage"
        />
      </div>
    </a-modal>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
} from "vue";
import { deleteNullChi } from "@/utils/common";
import { comparator } from "@/utils/enumerate";
import { cloneDeep } from "lodash-es";
export default defineComponent({
  props: {
    ruleConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const initSearch = ref(null);
    const cascaderOptions = ref([]);
    const state = reactive({
      comparator: comparator,
      ruleData: {},
      deviceModelList: [],
      deviceModelEvent: [],
      deviceAttribute: [],
      selectedRowKeys: [],
      selectedRows: [],
    });
    const search=reactive({
        areaId: [],
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      })
    const modal = reactive({
      visible: false,
      areaList: [],
      total: 0,
    
      tableData: [],
      tableColumns: [
        {
          title: "设备编号",
          dataIndex: "code",
          key: "code",
        },
        {
          title: "设备名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "产品品类",
          dataIndex: "deviceProdCategoryName",
          key: "deviceProdCategoryName",
        },
        {
          title: "所属区域",
          dataIndex: "areaName",
          key: "areaName",
        },
      ],
    });
    // 获取设备型号
    const getDeviceModelList = async (value) => {
      const data = await proxy.$api.getDeviceModelList({
        genreId: value.join('-'),
      });
      if (data) {
        let info = data.map((item) => {
          return {
            attributeCount: 0,
            brandName: "",
            code: "",
            eventCount: 0,
            genreId: "",
            genreName: "",
            id: item.id,
            name: item.name,
          };
        });
        state.deviceModelList = info;
      }
    };
    const changeTablePage = (value, b) => {
      search.pageNumber = value;
      search.pageSize = b;
      getIotDeviceList();
    };
    // 选择设备类型
    const changeDeviceType = (value, record) => {
      if(value.length === 0) return;
      const info = value[value.length - 1];
      const label = record[record.length - 1];
      if (value) {
        getDeviceModelList(value);
        state.ruleData.deviceProdCategoryName = label.categoryName;
        state.ruleData.deviceProdId = null;
        state.ruleData.deviceProdName = null;
        state.ruleData.id = null;
        state.ruleData.code = null;
        state.ruleData.name = null;
        state.ruleData.areaId = null;
        state.ruleData.areaName = null;
        state.ruleData.propCode = null;
        state.ruleData.propName = null;
        state.ruleData.op = null;
        state.ruleData.oprand = null;
        state.ruleData.delayTime = null;
      }
    };
    // 获取设备型号事件
    const getModelEvent = async (value) => {
      const data = await proxy.$api.getModelEvent({ deviceProdId: value });
      if (data) {
        state.deviceModelEvent = data;
      }
    };
    // 获取设备型号下的属性
    const getModelAttribute = async (value) => {
      //   const data = await proxy.$api.getModelAttribute({ deviceProdId: value });
      const data = await proxy.$api.getDeviceAttribute({
        deviceId: value,

        withPropertySpec: true,
      });

      if (data) {
        state.deviceAttribute = data.productPropVoList.map((item) => {
          return {
            name: item.propName,
            code: item.propCode,
            attributeId: item.propCode,
            dataType: item.dataType,
            dataConstraint: item.dataConstraint,
          };
        });
      }
    };
    // 选择设备型号
    const changeModelType = (value, record) => {
      if (value) {
        state.ruleData.deviceProdName = record.label;
        // getModelEvent(value);
        state.ruleData.id = null;
        state.ruleData.code = null;
        state.ruleData.name = null;
        state.ruleData.areaId = null;
        state.ruleData.areaName = null;
        state.ruleData.propCode = null;
        state.ruleData.propName = null;
        state.ruleData.op = null;
        state.ruleData.oprand = null;
        state.ruleData.delayTime = null;
      }
    };
    const changeValue = () => {
      emit("update:ruleConfig", state.ruleData);
    };
    // 选择设备属性
    const changeAttribute = (value, record) => {
      state.ruleData.propName = record.label;
      const curAttr = state.deviceAttribute.find(e => e.attributeId === value)
      state.ruleData.dataType = curAttr.dataType;
      state.ruleData.dataConstraint = curAttr.dataConstraint;
    };
    // 获取设备实例列表
    const getIotDeviceList = async () => {
      const data = await proxy.$api.getIotDeviceList({
        ...search,
        anyMatchedAreaId:search?.areaId.join("-"),
        // lastAreaId: modal.search.areaId.length
        //   ? modal.search.areaId[modal.search.areaId.length - 1]
        //   : "",
        categoryCode:
          state.ruleData.deviceProdCategoryCodeConcat == ""
            ? ""
            : state?.ruleData?.deviceProdCategoryCodeConcat?.join("-"),
            productId: state.ruleData.deviceProdId,
      });
      if (data) {
        modal.tableData = data.records.map((item) => {
          return {
            ...item,
            areaName: item.area?.pathName,
            // code: item.deviceCode,
            // name: item.deviceName,
            deviceProdCategoryName: item.productInfo?.productCategory.name,
          };
        });
        modal.total = data.total;
      }
    };
    const reset = () => {
      Object.assign(search,{
        areaId: [],
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      })
      // search = cloneDeep(initSearch.value);
      getIotDeviceList();
    };
    const onSelectChange = (selectedRowKeys, selectedRows) => {
      state.selectedRows = selectedRows;
      state.selectedRowKeys = selectedRowKeys;
    };
    const handleOk = () => {
      if (state.selectedRows.length) {

        const { id, code, name, area, areaName } = state.selectedRows[0];
        state.ruleData.id = id;
        state.ruleData.code = code;
        state.ruleData.name = name;
        state.ruleData.areaId = area.id;
        state.ruleData.areaName = area.pathName;
        getModelAttribute(id);

        modal.visible = false;
      } else {
        proxy.$message.warning("请选择设备");
      }
    };
    // 获取区域
    const getAreaList = async () => {
      const data = await proxy.$api.getAreaList();
      if (data) {
        modal.areaList = deleteNullChi(data);
      }
    };
    const openModal = () => {
      modal.visible = true;
      // search = cloneDeep(initSearch.value);
      getIotDeviceList();
      getAreaList();
    };
    onMounted(async () => {
      const data = await proxy.$api.getProductionList();
      cascaderOptions.value = data;
      state.ruleData = props.ruleConfig;
      // initSearch.value = cloneDeep(search);
      if (state.ruleData.deviceProdCategoryCodeConcat) {
        getDeviceModelList(state.ruleData.deviceProdCategoryCodeConcat);
      }
      if (state.ruleData.deviceProdId) {
        getModelAttribute(state.ruleData.id);
        state.selectedRowKeys = [state.ruleData.id]
      }
    });
    return {
      search,
      cascaderOptions,
      changeTablePage,
      ...toRefs(state),
      ...toRefs(modal),
      getIotDeviceList,
      reset,
      onSelectChange,
      handleOk,
      openModal,
      changeAttribute,
      changeModelType,
      changeDeviceType,
      changeValue,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-form-inline .ant-form-item) {
  margin-top: 16px;
}
.page-body {
  margin-top: 10px;
  width: 100%;
  text-align: right;
}
</style>
