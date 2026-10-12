<template>
  <g-layout :title="type === 'detail' ? '巡检标准详情' : type === 'add' ? '巡检标准新增' : '巡检标准编辑'">
    <template #content-table>
      <a-tabs v-model:activeKey="panlActiveKey">
        <a-tab-pane key="1" tab="基础信息">
          <a-form ref="detailForm" :model="model" :rules="rules">
            <a-form-item label="名称" name="name">
              <a-input maxlength="60" v-if="type !== 'detail'" v-model:value="model.name" placeholder="名称"></a-input>
              <span v-else>{{ model.name ? model.name : "--" }}</span>
            </a-form-item>
            <a-form-item label="说明" name="remark">
              <a-textarea showCount maxlength="200" v-if="type !== 'detail'" v-model:value="model.remark" placeholder="请输入标准说明" />
              <span v-else>{{ model.remark ? model.remark : "--" }}</span>
            </a-form-item>
            <a-form-item label="关联" class="resultItemName">
              <a-tabs v-model:activeKey="activeKey">
                <a-tab-pane style="height: 350px; overflow-y: scroll" v-for="item in tabList" :key="item.key" :tab="item.name">
                  <template v-if="item.key === 'STALL'">
                    <a-table
                      :row-selection="type !== 'detail' ? stallSelection : null"
                      :columns="connectCol"
                      :dataSource="stallTable"
                      :rowKey="'id'"
                      :pagination="false"
                      :size="'small'"
                    ></a-table>
                  </template>
                  <template v-if="item.key === 'DEVICE'">
                    <a-tree
                      checkable
                      v-model:selectedKeys="deviceConnect.targetTypes"
                      v-model:checkedKeys="deviceConnect.targetTypes"
                      :tree-data="treeOptions"
                      :fieldNames="fieldNames"
                    >
                    </a-tree>
                  </template>
                  <template v-if="item.key === 'PROPERTY'">
                    <a-table
                      :columns="connectCol"
                      :row-selection="type !== 'detail' ? propertySelection : null"
                      :dataSource="propertyTable"
                      :rowKey="'id'"
                      :pagination="false"
                      :size="'small'"
                    ></a-table>
                  </template>
                  <template v-if="item.key === 'SITE_POINT'">
                    <a-table
                      :columns="connectCol"
                      :row-selection="type !== 'detail' ? sitePointSelection : null"
                      :dataSource="pointTable"
                      :rowKey="'id'"
                      :pagination="false"
                      :size="'small'"
                    ></a-table>
                  </template>
                  <template v-if="item.key === 'RISK_SOURCE'">
                    <a-tree
                      checkable
                      v-model:selectedKeys="riskConnect.targetTypes"
                      v-model:checkedKeys="riskConnect.targetTypes"
                      :tree-data="treeOptions"
                      :fieldNames="riskReplaceFields"
                    >
                    </a-tree>
                  </template>
                  <template v-if="item.key === 'SMALL_ENGINEERING'">
                    <a-table
                      :columns="connectCol"
                      :row-selection="type !== 'detail' ? smallConnectSelection : null"
                      :dataSource="smallTable"
                      :rowKey="'id'"
                      :pagination="false"
                      :size="'small'"
                    ></a-table>
                  </template>
                </a-tab-pane>
              </a-tabs>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2" tab="巡检项" class="inspection-item-pane">
          <div label="巡检项" class="resultItemName inspection-item-content">
            <div class="inspection-item-actions">
              <a-button type="primary" @click="add" :disabled="type === 'detail'">添加</a-button>
              <a-button type="primary" @click="openModel" :disabled="type === 'detail'" style="margin-left: 10px">调用</a-button>
            </div>
            <div class="inspection-item-table">
              <a-table :columns="inspectItemCol" :scroll="{ y: '100%' }" :dataSource="inspectItem" :rowKey="'id'" :pagination="false">
                <template
                  v-for="col in inspectItemCol.map((item) => {
                    if (item.dataIndex !== 'action') {
                      return item.dataIndex;
                    }
                  })"
                  #[col]="{ record, index }"
                  :key="col"
                >
                  <template v-if="col === 'name'">
                    <a-input
                      v-model:value="record.name"
                      :maxLength="200"
                      placeholder="巡检项内容描述"
                      :disabled="type === 'detail'"
                    ></a-input>
                  </template>
                  <template v-else-if="col === 'resultId'">
                    <g-select
                      style="width: 150px"
                      v-model:value="record.resultId"
                      :url="'inspectResultList'"
                      :placeholder="'请选择巡检结果'"
                      @change-check="(value) => checkResult(value, index)"
                      :disabled="type === 'detail' || record.isResultItem === false"
                    ></g-select>
                  </template>
                  <template v-else-if="col === 'imageFlag'">
                    <a-switch
                      v-model:checked="record.imageFlag"
                      checked-children="是"
                      un-checked-children="否"
                      :disabled="type === 'detail'"
                    ></a-switch>
                  </template>
                  <template v-else-if="col === 'resultItemValue'">
                    <a-popover title="存在异常点：" v-if="record.resultId && record.resultItemValueStatus === 'error'" placement="top">
                      <template #content>
                        <a-tag color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                          {{ option.itemName }}
                        </a-tag>
                      </template>
                      <g-select
                        v-model:value="record.resultItemValue"
                        :url="'inspectResultOptions'"
                        style="width: 100px"
                        :params="{ id: record.resultId }"
                        :placeholder="'请选择默认值'"
                        :field="{ itemName: 'label', itemValue: 'value' }"
                        :disabled="type === 'detail' || record.isResultItem === false"
                        :status="record.resultItemValueStatus"
                        @change="(value) => updateResultItemValueStatus(value, index)"
                      ></g-select>
                    </a-popover>
                    <g-select
                      v-else-if="record.resultId"
                      v-model:value="record.resultItemValue"
                      :url="'inspectResultOptions'"
                      style="width: 100px"
                      :params="{ id: record.resultId }"
                      :placeholder="'请选择默认值'"
                      :field="{ itemName: 'label', itemValue: 'value' }"
                      :disabled="type === 'detail' || record.isResultItem === false"
                      :status="record.resultItemValueStatus"
                      @change="(value) => updateResultItemValueStatus(value, index)"
                    ></g-select>
                    <g-select v-else :placeholder="'请选择默认值'" :disabled="true"></g-select>
                  </template>
                  <template v-else-if="col === 'imageResult'">
                    <template v-if="record.isResultItem === false">
                      <a-select
                        v-model:value="record.imageResult"
                        style="width: 100px"
                        :disabled="type === 'detail'"
                        @change="(value) => onRequireImageChange(value, index)"
                      >
                        <a-select-option :value="true">是</a-select-option>
                        <a-select-option :value="false">否</a-select-option>
                      </a-select>
                    </template>
                    <template v-else>
                      <a-popover title="存在异常点：" v-if="record.resultId && record.imageResultStatus === 'error'" placement="top">
                        <template #content>
                          <a-tag :bordered="false" color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                            {{ option.itemName }}
                          </a-tag>
                        </template>
                        <g-select
                          v-model:value="record.imageResult"
                          mode="multiple"
                          :url="'inspectResultOptions'"
                          style="width: 100px"
                          :params="{ id: record.resultId }"
                          :placeholder="'请选择默认值'"
                          :field="{ itemName: 'label', itemValue: 'value' }"
                          :disabled="type === 'detail'"
                          :status="record.imageResultStatus"
                          @change="(value) => updateImageResultStatus(value, index)"
                        ></g-select>
                      </a-popover>
                      <g-select
                        v-else-if="record.resultId"
                        v-model:value="record.imageResult"
                        mode="multiple"
                        :url="'inspectResultOptions'"
                        style="width: 100px"
                        :params="{ id: record.resultId }"
                        :placeholder="'请选择默认值'"
                        :field="{ itemName: 'label', itemValue: 'value' }"
                        :disabled="type === 'detail'"
                        :status="record.imageResultStatus"
                        @change="(value) => updateImageResultStatus(value, index)"
                      ></g-select>
                      <g-select v-else :placeholder="'请选择默认值'" :disabled="true"></g-select>
                    </template>
                  </template>
                  <template v-else-if="col === 'remarkResult'">
                    <template v-if="record.isResultItem === false">
                      <a-select
                        v-model:value="record.remarkResult"
                        style="width: 100px"
                        :disabled="type === 'detail'"
                        @change="(value) => onRequireRemarkChange(value, index)"
                      >
                        <a-select-option :value="true">是</a-select-option>
                        <a-select-option :value="false">否</a-select-option>
                      </a-select>
                    </template>
                    <template v-else>
                      <a-popover title="存在异常点：" v-if="record.resultId && record.remarkResultStatus === 'error'" placement="top">
                        <template #content>
                          <a-tag :bordered="false" color="error" v-for="option in getErrorOptions(record.resultId)" :key="option.itemValue">
                            {{ option.itemName }}
                          </a-tag>
                        </template>
                        <g-select
                          v-if="record.resultId"
                          v-model:value="record.remarkResult"
                          mode="multiple"
                          :url="'inspectResultOptions'"
                          style="width: 100px"
                          :params="{ id: record.resultId }"
                          :placeholder="'请选择默认值'"
                          :field="{ itemName: 'label', itemValue: 'value' }"
                          :disabled="type === 'detail'"
                          :status="record.remarkResultStatus"
                          @change="(value) => updateRemarkResultStatus(value, index)"
                        ></g-select>
                      </a-popover>
                      <g-select
                        v-else-if="record.resultId"
                        v-model:value="record.remarkResult"
                        mode="multiple"
                        :url="'inspectResultOptions'"
                        style="width: 100px"
                        :params="{ id: record.resultId }"
                        :placeholder="'请选择默认值'"
                        :field="{ itemName: 'label', itemValue: 'value' }"
                        :disabled="type === 'detail'"
                        :status="record.remarkResultStatus"
                        @change="(value) => updateRemarkResultStatus(value, index)"
                      ></g-select>
                      <g-select v-else :placeholder="'请选择默认值'" :disabled="true"></g-select>
                    </template>
                  </template>
                  <template v-else-if="col === 'itemTag'">
                    <a-select :disabled="disabled" ref="select" v-model:value="record.itemTag" style="width: 120px">
                      <a-select-option :value="item.itemValue" v-for="item in tagDefaultList" :key="item.value">{{
                        item.label
                      }}</a-select-option>
                    </a-select>
                  </template>
                  <template v-else-if="col === 'isResultItem'">
                    <a-switch
                      v-model:checked="record.isResultItem"
                      checked-children="开"
                      un-checked-children="关"
                      :disabled="type === 'detail'"
                      @change="(checked) => onToggleResultItem(checked, index)"
                    ></a-switch>
                  </template>
                </template>
                <template #action="{ record, index }">
                  <a-popconfirm v-if="type !== 'detail'" title="删除当前数据" @confirm="deleteInspectItem(record.id, index)">
                    <a-button type="link" danger> 删除 </a-button>
                  </a-popconfirm>
                  <a-button v-else type="link" danger disabled> 删除 </a-button>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
      <a-modal width="1000px" v-model:visible="visible" centered title="添加巡检项" @ok="setObj" @cancel="setObjCancel">
        <!-- <s-table1 ref="inspectionRefs" :api="stallApi" :scrollX="200" :search="search" :size="'small'" :btns="[]"
          :columns="addConnectCol"  :showPage="true" :allowSelect="true"></s-table1> -->

        <TableInModal1
          ref="inspectionRefs"
          :sly="390"
          :scrollX="200"
          :search="search"
          :searchLength="2"
          :api="stallApi"
          :rowSelection="true"
          :columns="addConnectCol"
          :selectedKeys="itemStanSelect"
          :rowKey="'id'"
          :size="'small'"
          :isInModal="true"
          :selectType="'checkbox'"
          :pagination="true"
        ></TableInModal1>
      </a-modal>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" v-if="type !== 'detail'" @click="save">保存</a-button>
    </template>
  </g-layout>
</template>
<script>
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gLayout";
import _ from "lodash";
import { debounce } from "lodash-es"; // 防抖函数
import { defineComponent, getCurrentInstance, onMounted, computed, reactive, toRefs, watch, ref } from "vue";
import { useRoute } from "vue-router";

import { cubeDeviceCenterService } from "@/api/service";
import { cubeOuaaService } from "@/api/service";
import gSelect from "@/components/Common/gSelect.vue";
import TableInModal1 from "@/components/Common/TableInModal1.vue";
import { getNowEnterprise } from "@/utils/auth";
export default defineComponent({
  components: {
    gLayout,
    gSelect,
    TableInModal1,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const id = route.query.id;
    const type = route.query.type;
    const inspectionRefs = ref();
    const stallApi = {
      list: "inspectItemTemplatePage",
    };
    const tagDefaultList = ref([
      {
        value: "CHARGE",
        label: "违规充电",
      },
      {
        value: "PARKING",
        label: "违规停放",
      },
    ]);
    const search = [
      {
        label: "适用对象",
        value: "referType",
        component: "g-select",
        defaultValue: null,
        field: { name: "label", id: "value" },
        options: [
          {
            name: "全部",
            id: null,
          },
          {
            name: "设备",
            id: "DEVICE",
          },
          {
            name: "档位",
            id: "STALL",
          },
          {
            name: "资产",
            id: "PROPERTY",
          },
          {
            name: "现场点",
            id: "SITE_POINT",
          },
          {
            name: "风险源",
            id: "RISK_SOURCE",
          },
          {
            name: "小散工程",
            id: "SMALL_ENGINEERING",
          },
        ],
        placeholder: "",
      },
      { label: "", value: "keyword", placeholder: "名称" },
    ];
    const detailForm = ref();
    const state = reactive({
      selectedKeys: [],
      checkedKeys: [],
      treeOptions: [],
      fieldNames: {
        children: "children",
        title: "categoryName",
        key: "categoryCodeConcat",
      },
      riskReplaceFields: {
        children: "nextList",
        title: "name",
        key: "code",
      },
      itemStanSelect: [],
      visible: false,
      panlActiveKey: "1",
      model: {
        id: "",
        name: "",
        remark: "",
        code: "",
        enable: true,
      },
      rules: {
        name: [{ required: true, message: "请输入标准名称" }],
        // remark: [{ required: true, message: "请输入标准说明" }],
      },
      inspectItemCol: [
        {
          dataIndex: "name",
          title: "内容描述",
          slots: {
            customRender: "name",
          },
        },
        {
          dataIndex: "isResultItem",
          title: "结果巡检项",
          slots: {
            customRender: "isResultItem",
          },
        },
        {
          dataIndex: "resultId",
          title: "巡检结果",
          slots: {
            customRender: "resultId",
          },
        },
        {
          dataIndex: "resultItemValue",
          title: "巡检结果默认值",
          slots: {
            customRender: "resultItemValue",
          },
        },
        {
          dataIndex: "imageResult",
          title: "以下巡检结果必须拍照",
          slots: {
            customRender: "imageResult",
          },
        },
        {
          dataIndex: "remarkResult",
          title: "以下巡检结果必须备注",
          slots: {
            customRender: "remarkResult",
          },
        },
        {
          dataIndex: "itemTag",
          title: "标签",
          ellipsis: false,
          slots: {
            customRender: "itemTag",
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
        },
      ],
      inspectItem: [],
      tabList: [
        { key: "DEVICE", name: "设备", applicationCode: "DEVICECENTER" },
        { key: "STALL", name: "档位", applicationCode: "DWGL" },
        { key: "PROPERTY", name: "资产", applicationCode: "PROPERTY_MANAGEMENT" },
        { key: "SITE_POINT", name: "现场点", applicationCode: "INSPECTION" },
        { key: "RISK_SOURCE", name: "风险源", applicationCode: "RISK_SOURCE" },
        { key: "SMALL_ENGINEERING", name: "小散工程", applicationCode: "SMALLENFINEERING" },
      ],
      options: [
        { name: "是", id: true },
        { name: "否", id: false },
      ],
      connectCol: [{ dataIndex: "name", title: "名称" }],
      addConnectCol: [
        {
          dataIndex: "alias",
          title: "名称",
        },
        {
          dataIndex: "name",
          title: "巡检内容",
        },
        {
          dataIndex: "resultNames",
          title: "巡检结果项",
        },
        {
          dataIndex: "referTypeNames",
          title: "适用对象",
        },
      ],
      stallTable: [],
      deviceCol: [],
      deviceTable: [],
      propertyTable: [],
      pointTable: [],
      smallTable: [],
      standardTypeRefers: [],
      stallConnect: {
        targetCategory: "STALL",
        targetTypes: [],
      },
      deviceConnect: {
        targetCategory: "DEVICE",
        targetTypes: [],
      },
      propertyConnect: {
        targetCategory: "PROPERTY",
        targetTypes: [],
      },
      pointConnect: {
        targetCategory: "SITE_POINT",
        targetTypes: [],
      },
      riskConnect: {
        targetCategory: "RISK_SOURCE",
        targetTypes: [],
      },
      smallConnect: {
        targetCategory: "SMALL_ENGINEERING",
        targetTypes: [],
      },
      resultOptions: [],
    });
    const activeKey = ref("");
    const resultList = ref();

    const download = (record) => {};
    const goBack = () => {
      history.back();
    };
    const getResuleList = async () => {
      proxy.$api.inspectResultList().then((res) => {
        resultList.value = res;
      });
    };
    const checkResult = (value, index) => {
      if (state.inspectItem[index].isResultItem === false) {
        return;
      }
      const selectResult = resultList.value.find((item) => item.id === value);
      state.inspectItem[index].resultItemValue = "";
      state.inspectItem[index].imageResult = "";
      state.inspectItem[index].remarkResult = "";

      state.inspectItem[index].resultItemValue = selectResult.options[0].itemValue;
      state.inspectItem[index].imageResult = selectResult.options.filter((x) => x.errorFlag)?.map((x) => x.itemValue);
      state.inspectItem[index].remarkResult = selectResult.options.filter((x) => x.errorFlag)?.map((x) => x.itemValue);

      state.inspectItem[index].resultItemValueStatus = selectResult.options.find(
        (x) => x.itemValue === state.inspectItem[index].resultItemValue,
      ).errorFlag
        ? "error"
        : "";
      state.inspectItem[index].imageResultStatus = "error";
      state.inspectItem[index].remarkResultStatus = "error";
    };
    const onToggleResultItem = (checked, index) => {
      const record = state.inspectItem[index];
      record.isResultItem = checked;
      record.resultId = "";
      record.resultItemValue = "";
      record.imageResult = undefined;
      record.remarkResult = undefined;
      record.resultItemValueStatus = "";
      record.imageResultStatus = "";
      record.remarkResultStatus = "";
    };
    const normalizeBooleanValue = (value) => {
      if (value === true || value === "true") return true;
      if (value === false || value === "false") return false;
      return undefined;
    };
    const onRequireImageChange = (value, index) => {
      state.inspectItem[index].imageResult = normalizeBooleanValue(value);
    };
    const onRequireRemarkChange = (value, index) => {
      state.inspectItem[index].remarkResult = normalizeBooleanValue(value);
    };
    const setObj = () => {
      if (inspectionRefs.value.selectedItem.length > 0) {
        let arr = inspectionRefs.value.selectedItem.map((item) => {
          const isResultItem = item.isResultItem !== false;
          const newItem = {
            name: item.name,
            isResultItem,
            resultId: isResultItem ? item.resultId : "",
            resultItemValue: isResultItem ? item.resultItemValue : "",
            itemTag: item.itemTag,
            imageResult: isResultItem
              ? item.imageResult === ""
                ? undefined
                : item.imageResult.split(",")
              : item.imageResult === true || item.imageResult === "true"
                ? true
                : item.imageResult === false || item.imageResult === "false"
                  ? false
                  : undefined,
            remarkResult: isResultItem
              ? item.remarkResult === ""
                ? undefined
                : item.remarkResult?.split(",")
              : item.remarkResult === true || item.remarkResult === "true"
                ? true
                : item.remarkResult === false || item.remarkResult === "false"
                  ? false
                  : undefined,
          };

          // 设置status属性
          if (isResultItem && item.resultId) {
            const selectResult = resultList.value.find((r) => r.id === item.resultId);
            if (selectResult) {
              if (item.resultItemValue) {
                const option = selectResult.options.find((x) => x.itemValue === item.resultItemValue);
                if (option && option.errorFlag) {
                  newItem.resultItemValueStatus = "error";
                }
              }

              const hasErrorOptions = selectResult.options.some((x) => x.errorFlag);
              if (hasErrorOptions) {
                newItem.imageResultStatus = "error";
                newItem.remarkResultStatus = "error";
              }
            }
          }

          return newItem;
        });
        state.inspectItem.push(...arr);
      }
      state.visible = false;
      state.itemStanSelect = [];
    };
    const setObjCancel = () => {
      if (inspectionRefs.value) {
        inspectionRefs.value.resetSearch();
      }
      state.visible = false;
    };
    const openModel = () => {
      state.visible = true;
    };

    const add = () => {
      state.inspectItem.push({
        id: getRandomNumberByRange(),
        name: "",
        isResultItem: true,
        resultId: "",
        remarkResult: "",
        imageResult: "",
        resultItemValue: "",
        itemTag: undefined,
      });
    };

    const getResultOfInspectItem = () => {
      if (state.inspectItem.length === 0) {
        return "请添加巡检项";
      } else {
        const res = state.inspectItem.every(
          (item) =>
            item.name &&
            (item.isResultItem === false
              ? (item.imageResult === true || item.imageResult === false) && (item.remarkResult === true || item.remarkResult === false)
              : item.resultId && item.resultItemValue),
        );
        return res ? true : "请将巡检项补充完整";
      }
    };

    const getResultOfIConnectItem = () => {
      const connectList = state.stallConnect.targetTypes.concat(state.deviceConnect.targetTypes);
      if (connectList.length === 0) {
        return false;
      } else {
        return true;
      }
    };
    const getResultOfIpropertyConnect = () => {
      const connectList = state.propertyConnect.targetTypes.concat(state.propertyConnect.targetTypes);
      if (connectList.length === 0) {
        return false;
      } else {
        return true;
      }
    };

    const getPointConnectConnect = () => {
      const connectList = state.pointConnect.targetTypes.concat(state.pointConnect.targetTypes);
      if (connectList.length === 0) {
        return false;
      } else {
        return true;
      }
    };
    const getRiskConnectConnect = () => {
      const connectList = state.riskConnect.targetTypes.concat(state.riskConnect.targetTypes);
      if (connectList.length === 0) {
        return false;
      } else {
        return true;
      }
    };

    const save = debounce(() => {
      const res = getResultOfInspectItem();
      const resp = getResultOfIConnectItem();
      const resx = getResultOfIpropertyConnect();
      const ress = getPointConnectConnect();
      const risk = getRiskConnectConnect();
      detailForm.value
        .validate()
        .then(() => {
          if (typeof res === "boolean" && (res || resp || resx || ress || risk)) {
            const standardItems = state.inspectItem.map((item) => {
              if (item.isResultItem === false) {
                return {
                  ...item,
                  resultId: null,
                  resultItemValue: null,
                  imageResult: item.imageResult === true,
                  remarkResult: item.remarkResult === true,
                };
              }
              return {
                ...item,
                imageResult: Array.isArray(item.imageResult) ? item.imageResult.join(",") || undefined : undefined,
                remarkResult: Array.isArray(item.remarkResult) ? item.remarkResult.join(",") || undefined : undefined,
              };
            });
            // 请求
            const params = {
              ...state.model,
              standardItems,
              standardTypeRefers: [
                { ...state.stallConnect },
                { ...state.deviceConnect },
                { ...state.propertyConnect },
                { ...state.pointConnect },
                { ...state.riskConnect },
                { ...state.smallConnect },
              ],
            };
            state.model.id
              ? proxy.$api.inspectStandardId(params, "put").then(() => {
                  proxy.$message.success("操作成功");
                  goBack();
                })
              : proxy.$api.inspectStandardAdd(params).then(() => {
                  proxy.$message.success("操作成功");
                  goBack();
                });
          } else {
            if (typeof res === "string") {
              proxy.$message.warn(res);
            }
            if (!resp) {
              proxy.$message.warn("请添加关联项");
            }
          }
        })
        .catch(() => {
          if (typeof res === "string") {
            proxy.$message.warn(res);
          }
          if (!resp) {
            proxy.$message.warn("请添加关联项");
          }
        });
    }, 500);

    const deleteInspectItem = (id, index) => {
      // state.inspectItem = state.inspectItem.filter((item) => item.id !== id);
      state.inspectItem.splice(index, 1);
    };

    const getRandomNumberByRange = () => {
      const ids = state.inspectItem.map((item) => item.id);
      let id = Math.round(Math.random() * 10000);
      if (ids.includes(id)) {
        id = getRandomNumberByRange();
      } else {
        return id;
      }
      // return Math.round(Math.random() * 10000)
    };

    const getConnectTable = () => {
      switch (activeKey.value) {
        case "STALL":
          state.leftDataList = [];
          proxy.$api.getBoothTypeList({ keyword: state.keyword, pageSize: 1000, pageNum: 1 }, "get").then((res) => {
            state.stallTable = res;
            if (type === "detail") {
              state.stallTable = res.filter((item) => state.stallConnect.targetTypes.includes(item.id));
            }
          });
          break;
        case "DEVICE":
          getEquipmentCategory();
          break;
        case "PROPERTY":
          state.leftDataList = [];
          proxy.$api.getAssemblyClassifyPageType({ type: "assetType", pageSize: 1000, pageNum: 1 }, "get").then((res) => {
            state.propertyTable = res.records.map((e) => {
              return {
                ...e,
                id: String(e.id),
              };
            });
            if (type === "detail") {
              state.propertyTable = res.records.filter((item) => state.propertyConnect.targetTypes.includes(item.id));
            }
          });
          break;
        case "SITE_POINT":
          state.leftDataList = [];
          proxy.$api.geiSiteTypeList().then((res) => {
            state.pointTable = res;
            if (type === "detail") {
              state.pointTable = res.filter((item) => state.propertyConnect.targetTypes.includes(item.id));
            }
          });
          break;
        case "RISK_SOURCE":
          state.leftDataList = [];
          proxy.$api.getCascadeDictionaryItem({ itemCode: "risk-source-type", pageNumber: 1, pageSize: 999 }).then((res) => {
            state.treeOptions = res;
            state.spinning = false;
          });
          break;
        case "SMALL_ENGINEERING":
          state.leftDataList = [];
          proxy.$api.projectTypeList().then((res) => {
            state.smallTable = res;
            state.treeOptions = res;
            state.spinning = false;
          });
          break;
      }
    };

    const stallSelection = computed(() => {
      return {
        selectedRowKeys: state.stallConnect.targetTypes,
        onChange: (selectedRowKeys, selectedRows) => {
          state.stallConnect.targetTypes = selectedRowKeys;
        },
      };
    });
    const propertySelection = computed(() => {
      return {
        selectedRowKeys: state.propertyConnect.targetTypes,
        onChange: (selectedRowKeys, selectedRows) => {
          state.propertyConnect.targetTypes = selectedRowKeys;
        },
      };
    });
    const sitePointSelection = computed(() => {
      return {
        selectedRowKeys: state.pointConnect.targetTypes,
        onChange: (selectedRowKeys, selectedRows) => {
          state.pointConnect.targetTypes = selectedRowKeys;
        },
      };
    });
    const smallConnectSelection = computed(() => {
      return {
        selectedRowKeys: state.smallConnect.targetTypes,
        onChange: (selectedRowKeys, selectedRows) => {
          state.smallConnect.targetTypes = selectedRowKeys;
        },
      };
    });

    const getData = () => {
      proxy.$api.inspectStandardId(id).then(async (res) => {
        if (!res) return;

        // 解构响应数据
        const { standardItems = [], standardTypeRefers = [], ...restData } = res;

        // 处理基础数据
        state.model = { ...state.model, ...restData };

        // 处理检查项数据
        state.inspectItem = processInspectItems(standardItems);

        // 处理分类连接数据
        handleCategoryConnections(standardTypeRefers);

        // 特殊处理属性类型转换
        state.propertyConnect.targetTypes = state.propertyConnect.targetTypes.map(String);

        await getConnectTable();
      });
    };

    // 处理检查项数据转换
    const processInspectItems = (items) => {
      return items.map((item) => {
        // 处理基本数据转换
        const processedItem = {
          ...item,
          isResultItem: item.isResultItem !== false,
          imageResult:
            item.isResultItem === false
              ? item.imageResult === true || item.imageResult === "true"
                ? true
                : item.imageResult === false || item.imageResult === "false"
                  ? false
                  : undefined
              : item.imageResult?.trim()
                ? item.imageResult.split(",")
                : undefined,
          remarkResult:
            item.isResultItem === false
              ? item.remarkResult === true || item.remarkResult === "true"
                ? true
                : item.remarkResult === false || item.remarkResult === "false"
                  ? false
                  : undefined
              : item.remarkResult?.trim()
                ? item.remarkResult.split(",")
                : undefined,
          resultItemValueStatus: "",
          imageResultStatus: "",
          remarkResultStatus: "",
        };

        // 如果有resultId，需要设置status
        if (processedItem.isResultItem !== false && item.resultId) {
          const selectResult = resultList.value.find((r) => r.id === item.resultId);
          if (selectResult) {
            // 设置resultItemValueStatus
            if (item.resultItemValue) {
              const option = selectResult.options.find((x) => x.itemValue === item.resultItemValue);
              if (option && option.errorFlag) {
                processedItem.resultItemValueStatus = "error";
              }
            }

            // 如果选项中包含异常项，则标红
            const hasErrorOptions = selectResult.options.some((x) => x.errorFlag);
            if (hasErrorOptions) {
              processedItem.imageResultStatus = "error";
              processedItem.remarkResultStatus = "error";
            }
          }
        }

        return processedItem;
      });
    };

    // 统一处理分类连接逻辑
    const handleCategoryConnections = (standardTypeRefers) => {
      const categories = [
        {
          label: "STALL",
          value: "stallConnect",
        },
        {
          label: "DEVICE",
          value: "deviceConnect",
        },
        {
          label: "PROPERTY",
          value: "propertyConnect",
        },
        {
          label: "SITE_POINT",
          value: "pointConnect",
        },
        {
          label: "SMALL_ENGINEERING",
          value: "smallConnect",
        },
        {
          label: "RISK_SOURCE",
          value: "riskConnect",
        },
      ];

      categories.forEach((category) => {
        const connection = standardTypeRefers.find((item) => item.targetCategory === category.label) || {
          targetCategory: category.label,
          targetTypes: [],
        };

        state[category.value] = connection;
      });
    };

    const updateResultItemValueStatus = (value, index) => {
      if (state.inspectItem[index].resultId) {
        const selectResult = resultList.value.find((r) => r.id === state.inspectItem[index].resultId);
        if (selectResult) {
          const option = selectResult.options.find((x) => x.itemValue === value);
          state.inspectItem[index].resultItemValueStatus = option && option.errorFlag ? "error" : "";
        }
      }
    };

    const updateImageResultStatus = (value, index) => {
      if (state.inspectItem[index].resultId) {
        const selectResult = resultList.value.find((r) => r.id === state.inspectItem[index].resultId);
        if (selectResult) {
          // 检查选中的值中是否包含errorFlag为true的选项
          const hasErrorOption =
            value &&
            value.length > 0 &&
            value.some((v) => {
              const option = selectResult.options.find((x) => x.itemValue === v);
              return option && option.errorFlag;
            });
          state.inspectItem[index].imageResultStatus = hasErrorOption ? "error" : "";
        }
      }
    };

    const updateRemarkResultStatus = (value, index) => {
      if (state.inspectItem[index].resultId) {
        const selectResult = resultList.value.find((r) => r.id === state.inspectItem[index].resultId);
        if (selectResult) {
          // 检查选中的值中是否包含errorFlag为true的选项
          const hasErrorOption =
            value &&
            value.length > 0 &&
            value.some((v) => {
              const option = selectResult.options.find((x) => x.itemValue === v);
              return option && option.errorFlag;
            });
          state.inspectItem[index].remarkResultStatus = hasErrorOption ? "error" : "";
        }
      }
    };
    const getErrorOptions = (resultId) => {
      if (!resultId || !resultList.value) return [];
      const selectResult = resultList.value.find((r) => r.id === resultId);
      if (!selectResult) return [];
      return selectResult.options.filter((option) => option.errorFlag);
    };
    const getEquipmentCategory = async () => {
      const res = await cubeDeviceCenterService.getIotProductCategoryTree();
      state.treeOptions = res;
    };
    const getProductApplications = async () => {
      const res = await cubeOuaaService.productApplications(getNowEnterprise().code);
      state.tabList = state.tabList.filter((e) => res.find((ele) => ele.code === e.applicationCode));
    };
    onMounted(async () => {
      await getProductApplications();
      await getResuleList();
      activeKey.value = state.tabList[0].key;
      if (id) {
        getData();
      }
    });

    watch(
      () => activeKey.value,
      () => {
        getConnectTable();
      },
    );

    return {
      type,
      search,
      stallApi,
      activeKey,
      detailForm,
      tagDefaultList,
      inspectionRefs,
      stallSelection,
      propertySelection,
      sitePointSelection,
      smallConnectSelection,
      ...toRefs(state),
      deleteInspectItem,
      setObjCancel,
      openModel,
      download,
      setObj,
      goBack,
      checkResult,
      save,
      add,
      updateResultItemValueStatus,
      updateImageResultStatus,
      updateRemarkResultStatus,
      getErrorOptions,
      onToggleResultItem,
      onRequireImageChange,
      onRequireRemarkChange,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");

:deep(.content-left) {
  .baseLeft {
    width: 300px;
    height: 100%;
    padding-right: 16px;
    border-right: 1px solid @tableBottomLine;

    .title {
      width: 100%;
      height: 32px;
      line-height: 32px;
    }

    .list {
      width: 100%;
      height: calc(100% - 32px);
      overflow-y: auto;
      padding: 12px 0;

      ul {
        list-style: none;

        li {
          width: 100%;
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          cursor: pointer;

          &.primary-color-1-hover:hover {
            background-color: #001529;
            color: #fff;
          }

          .liName {
            flex: 1;
            // width: calc(100% - 65px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .liBtn {
            width: 90px;
            display: flex;
            justify-content: space-between;
            text-align: right;

            &.show {
              display: block;
            }

            &.hide {
              display: none;
            }

            .mt2 {
              height: 300px;
              overflow-y: scroll;
            }
          }
        }
      }
    }
  }
}

.content_table {
  width: 100%;
  height: 100%;
}

:deep(.inspection-item-pane) {
  height: 100%;
  min-height: 0;
}

.inspection-item-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.inspection-item-actions {
  flex: none;
}

.inspection-item-table {
  flex: 1;
  min-height: 0;
  margin-top: 16px;

  :deep(.ant-table-wrapper),
  :deep(.ant-spin-nested-loading),
  :deep(.ant-spin-container) {
    height: 100%;
    min-height: 0;
  }

  :deep(.ant-spin-container),
  :deep(.ant-table),
  :deep(.ant-table-container) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.ant-table),
  :deep(.ant-table-container),
  :deep(.ant-table-body) {
    flex: 1;
  }

  :deep(.ant-table-body) {
    min-height: 0;
    max-height: none !important;
  }
}

:deep(.ant-modal) {
  text-align: center;

  .ant-modal-content .ant-modal-body {
    max-height: 600px !important;
    overflow-y: auto;
  }
}

:deep(.resultItemName) {
  .ant-form-item-label label {
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #ff4d4f;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: "*";
    }
  }
}

:deep(.ant-tabs-bar) {
  background-color: #f3f3f3;
}

:deep(.ant-table) {
  .ant-table-content .ant-table-body .ant-select {
    width: 150px !important;
  }
}

:deep(.ant-select-arrow .anticon > svg) {
  display: none;
}
</style>
