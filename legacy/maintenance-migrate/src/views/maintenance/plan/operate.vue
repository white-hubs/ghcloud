<template>
  <div ref="ctr" class="ctr">
    <g-layout :title="type === 'edit' ? '编辑维保计划' : type === 'detail' ? '维保计划详情' : '新增维保计划'">
      <template #content-table>
        <div class="detail-form">
          <a-form ref="form" :model="model" :rules="type === 'detail' ? null : rules" id="mainForm" layout="inline">
            <div class="item-title">基础信息</div>
            <template v-if="type !== 'detail'">
              <a-form-item label="计划名称" name="maintenancePlanName">
                <a-input v-model:value.trim="model.maintenancePlanName" placeholder="请输入维保计划名称" :maxlength="20"></a-input>
              </a-form-item>
              <a-form-item label="计划生效时间" name="planStartTime">
                <a-date-picker
                  :style="{ width: '100%' }"
                  v-model:value="model.planStartTime"
                  :format="format"
                  :valueFormat="format"
                ></a-date-picker>
              </a-form-item>
              <a-form-item label="计划失效时间" name="planEndTime">
                <a-date-picker
                  :style="{ width: '100%' }"
                  v-model:value="model.planEndTime"
                  :format="format"
                  :valueFormat="format"
                ></a-date-picker>
              </a-form-item>
              <a-form-item label="计划状态" name="status">
                <a-switch v-model:checked="model.status" un-checked-children="禁用" checked-children="启用"></a-switch>
              </a-form-item>
              <a-form-item label="维保责任人" name="responsibilityType" class="a-form-item-100">
                <a-input-group compact="compact" class="responsibilityType-input-group">
                  <div class="formBtnCtr">
                    <a-button @click="receive('dep')" :type="model.responsibilityType === 'dep' ? 'primary' : 'default'">部门 </a-button>
                    <a-button @click="receive('per')" :type="model.responsibilityType === 'per' ? 'primary' : 'default'">人员 </a-button>
                  </div>
                  <div v-if="model.responsibilityType === 'per'" :style="{ width: 'calc(100% - 128px)' }">
                    <userSelect
                      class="single pl1"
                      :style="{ width: '300px !important' }"
                      v-model:value="model.receiveIds"
                      :url="'tenantUsers'"
                      :mode="'multiple'"
                      :showSearch="true"
                      :placeholder="'接收人'"
                      :showArrow="true"
                      :params="{ pageSize: 100, pageNumber: 1, enabled: true }"
                      @change-check="recieveChange"
                    ></userSelect>
                  </div>
                  <div class="single responsibility-dept-selects" v-else :style="{ width: 'calc(100% - 128px)' }">
                    <g-select
                      class="pl1"
                      v-model:value="model.receiveDeptIds"
                      :style="{ width: '50% !important' }"
                      :url="'deptList'"
                      :mode="'multiple'"
                      :placeholder="'部门'"
                      @change-check="recieveChange"
                      :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
                    ></g-select>
                    <a-select
                      class="pl1"
                      v-model:value="model.receivePostIds"
                      :style="{ width: '50% !important' }"
                      mode="multiple"
                      placeholder="岗位"
                      @change="recieveChange"
                      :options="appointmentOptions"
                      :loading="appointmentLoading"
                    >
                    </a-select>
                    <!-- <g-select
                      class="pl1"
                      ref="postRef"
                      v-model:value="model.receivePostIds"
                      :style="{ width: '50% !important' }"
                      :url="'appointmentList'"
                      :mode="'multiple'"
                      :placeholder="'岗位'"
                      @change-check="recieveChange"
                      :params="{ enabled: true }"
                    ></g-select> -->
                  </div>
                </a-input-group>
              </a-form-item>
              <a-form-item class="a-form-item-100" label="描述" name="remark" v-bind="textLayout">
                <a-textarea
                  v-model:value="model.remark"
                  placeholder="请输入描述"
                  :maxlength="200"
                  :autoSize="{ minRows: 2, maxRows: 8 }"
                ></a-textarea>
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item label="计划名称" name="maintenancePlanName">
                <span>
                  {{ model.maintenancePlanName ? model.maintenancePlanName : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="计划生效时间" name="planStartTime">
                <span>
                  {{ model.planStartTime ? timeFormat(model.planStartTime, false) : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="计划失效时间" name="planEndTime">
                <span>
                  {{ model.planEndTime ? timeFormat(model.planEndTime, false) : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="任务生成周期" name="maintenanceCycle">
                <!-- :labelCol="{ span: 6 }" -->
                <span
                  >{{ model.maintenanceCycle ? millennial(model.maintenanceCycle, false) : "--"
                  }}{{
                    model.timeUnit
                      ? model.timeUnit === "p-day"
                        ? "天"
                        : model.timeUnit === "p-week"
                          ? "周"
                          : model.timeUnit === "p-month"
                            ? "月"
                            : "--"
                      : "--"
                  }}</span
                >
              </a-form-item>
              <a-form-item label="任务生成时间" name="maintenanceTimePoint">
                <!-- :labelCol="{ span: 6 }" -->
                <span>
                  {{ model.maintenanceTimePoint ? model.maintenanceTimePoint + "时" : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="维保责任人" name="responsibilityType">
                <span>
                  {{ model.responsibilityPersonName ? model.responsibilityPersonName : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="计划状态" name="status">
                <span :class="[model.status ? (model.status === 'ENABLED' ? 'normal' : 'abnormal') : '']">{{
                  model.status ? (model.status === "ENABLED" ? "已启用" : model.status === "DEACTIVATED" ? "已停用" : "已过期") : "--"
                }}</span>
              </a-form-item>
              <!-- class="a-form-item-100" -->
              <a-form-item label="描述" name="remark">
                <span>
                  {{ model.remark ? model.remark : "--" }}
                </span>
              </a-form-item>
            </template>
            <div class="item-title">任务生成</div>
            <a-form-item label="" name="way">
              <a-radio-group name="radioGroup" v-model:value="model.way" :disabled="type === 'detail'">
                <a-radio value="JOB">定时生成</a-radio>
                <a-radio value="RULE">规则触发</a-radio>
              </a-radio-group>
            </a-form-item>
            <div style="width: 100%">
              <template v-if="model.way === 'JOB'">
                <template v-if="type !== 'detail'">
                  <a-form-item label="任务生成周期" name="maintenanceCycle">
                    <a-input-group compact="compact">
                      <a-input
                        v-model:value="model.maintenanceCycle"
                        :style="{ width: '70% !important' }"
                        placeholder="维保任务生成周期"
                        :maxlength="3"
                        @change="cycleChange"
                      />
                      <g-select
                        v-model:value="model.timeUnit"
                        :style="{ width: '30% !important' }"
                        :placeholder="'单位'"
                        :options="unitList"
                        @change="cycleChange"
                      />
                    </a-input-group>
                  </a-form-item>
                  <a-form-item label="任务生成时间" name="maintenanceTimePoint">
                    <a-input
                      v-model:value.trim="model.maintenanceTimePoint"
                      :addonAfter="'时'"
                      placeholder="维保任务生成时间"
                      :maxlength="2"
                    ></a-input>
                  </a-form-item>
                </template>
                <template v-else>
                  <a-form-item label="任务生成周期" name="maintenanceCycle">
                    <span>
                      {{ model.maintenanceCycle ? model.maintenanceCycle : "--" }}
                    </span>
                  </a-form-item>
                  <a-form-item label="任务生成时间" name="maintenanceTimePoint">
                    <span>
                      {{ model.maintenanceTimePoint ? model.maintenanceTimePoint + "时" : "--" }}
                    </span>
                  </a-form-item>
                </template>
              </template>
              <template v-else-if="model.way === 'RULE'">
                <div style="margin-bottom: 10px; font-size: 14px">
                  <span style="margin-right: 10px">触发条件</span>
                  <a-button
                    v-if="type !== 'detail'"
                    type="primary"
                    @click="
                      () => {
                        addRule();
                      }
                    "
                  >
                    <template #icon> <PlusOutlined /> </template>
                    添加</a-button
                  >
                </div>
                <div style="overflow: auto; max-height: 200px">
                  <RuleTrigger
                    v-for="(item, index) in emergencyRuleConditions"
                    :key="item.id"
                    :ruleData="item"
                    :attrIndex="index"
                    @deleteAttr="deleteRule(item.id)"
                  />
                </div>
              </template>
            </div>
            <div class="item-title flex-between">
              <span>维保设备</span>
              <a-button v-if="type !== 'detail'" type="primary" @click="addDevice"> 添加维保对象 </a-button>
            </div>
            <a-form-item class="a-form-item-100">
              <a-table
                :columns="type !== 'detail' ? columns : detailCol"
                :dataSource="tableData"
                :pagination="false"
                :scroll="{ x: 900 }"
                :rowKey="'id'"
              >
                <template #action="{ record }">
                  <a-space :size="16">
                    <template v-if="type === 'detail'">
                      <a-button type="link" @click="openItemModal(record)"> 维保项 </a-button>
                      <a-button type="link" danger="danger" disabled @click.stop="">删除</a-button>
                    </template>
                    <template v-else>
                      <a-button type="link" @click="openItemModal(record)"> 编辑维保项 </a-button>
                      <a-popconfirm title="删除当前维保对象？" onText="确定" cancelText="取消" @confirm="deleteItem(record)">
                        <a-button type="link" danger="danger" @click.stop=""> 删除 </a-button>
                      </a-popconfirm>
                    </template>
                  </a-space>
                </template>
              </a-table>
            </a-form-item>
          </a-form>
        </div>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回 </a-button>
        <a-button type="primary" @click="submit" v-if="type !== 'detail'">保存 </a-button>
      </template>
    </g-layout>
    <a-modal
      v-model:visible="visible"
      centered
      :title="type === 'detail' ? '维保项' : '编辑维保项'"
      @ok="setObj"
      @cancel="setObjCancel"
      :ok-button-props="{ disabled: type !== 'detail' ? false : true }"
    >
      <s-table
        ref="mainTableRef"
        :api="maintApi"
        :params="{ categoryCode: categoryCode }"
        :allowSelect="type === 'detail' ? false : true"
        :columns="connectCol"
        :size="'small'"
        :scrollX="200"
        :btns="[]"
        :showPage="false"
        :showFooter="false"
      ></s-table>
    </a-modal>
    <a-modal v-model:visible="objVisi" centered title="维保对象配置" @ok="handleOk" @cancel="handleCancel" :width="800">
      <a-spin :spinning="spinning">
        <s-transfer ref="transfer" :api="transferApi" :field="transferField"></s-transfer>
      </a-spin>
    </a-modal>
  </div>
  <device-modal
    ref="deviceModalRef"
    title="添加维保对象"
    v-model:value="deviceModalValue"
    @ok="
      (values) => {
        deviceList = [...values];
        deviceModalValue = values.map((e) => {
          return { name: e.name, id: e.id };
        });
        handleOk();
      }
    "
  ></device-modal>
</template>
<script lang="jsx">
//
import { PlusOutlined } from "@ant-design/icons-vue";
import { flattenTree, timeFormat, checkBroData, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common.js";
import { replaceObjectKeys } from "@pansy/utils";
import _ from "lodash";
import { defineComponent, getCurrentInstance, reactive, toRefs, ref, onMounted, computed, unref, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

import userSelect from "../../../components/Common/userSelect.vue";
import deviceModal from "./components/device-modal.vue";
import RuleTrigger from "./components/rule-trigger.vue";
import { appointmentList } from "@/api/index";
import { guid } from "@/utils/common";
export default defineComponent({
  components: {
    deviceModal,
    RuleTrigger,
    PlusOutlined,
    userSelect,
  },
  setup() {
    const format = "YYYY-MM-DD";
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const ctr = ref();
    const form = ref();
    const transfer = ref();
    const treeCheckedKeys = ref([]);

    const id = route.query.id;
    const type = route.query.type;

    const layout = {
      labelCol: {
        style: {
          width: "100px",
        },
      },
      wrapperCol: {
        span: 20,
      },
    };
    const textLayout = {
      labelCol: {
        style: {
          width: "100px",
        },
      },
      wrapperCol: {
        flex: 1,
      },
    };

    const rules = {
      maintenancePlanName: [
        { required: true, message: "请输入计划名称" },
        { message: "名称不超过20个字", pattern: new RegExp(/^.{1,20}$/, "g") },
      ],
      planStartTime: [
        { required: true, message: "" },
        // {
        //   validator(rule, value) {
        //     const nowTime = timeFormat(new Date());
        //     if (value) {
        //       if (value < nowTime) {
        //         return Promise.reject("计划生效时间应大于等于当前时间");
        //       } else {
        //         if (state.model.planEndTime) {
        //           if (value >= state.model.planEndTime) {
        //             return Promise.reject("计划生效时间应小于失效时间");
        //           } else {
        //             return Promise.resolve();
        //           }
        //         } else {
        //           return Promise.resolve();
        //         }
        //       }
        //     } else {
        //       return Promise.reject("请选择计划生效时间");
        //     }
        //   },
        // },
      ],
      planEndTime: [
        { required: true, message: "" },
        // {
        //   validator(rule, value) {
        //     const nowTime = timeFormat(new Date());
        //     if (value) {
        //       if (value < nowTime) {
        //         return Promise.reject("计划失效时间应大于当前时间");
        //       } else {
        //         if (state.model.planStartTime) {
        //           if (value <= state.model.planStartTime) {
        //             return Promise.reject("计划失效时间应大于生效时间");
        //           } else {
        //             return Promise.resolve();
        //           }
        //         }
        //       }
        //     } else {
        //       return Promise.reject("请选择计划失效时间");
        //     }
        //   },
        // },
      ],
      way: [{ required: true, message: "请选择任务生成方式" }],
      maintenanceTimePoint: [
        { required: true, message: "请选择维保任务生成时间" },
        {
          pattern: new RegExp(/^[0-9]$|^[0][0-9]$|^[1][0-9]$|^[0-2][0-3]$/, "g"),
          message: "请输入正整数(小于24)",
        },
      ],
      maintenanceCycle: [
        { required: true, message: "" },
        {
          pattern: new RegExp(/^[1-9]$|^[1-9][0-9]$|^[1][0][0]$/, "g"),
          message: "请输入大于0且小于等于100的正整数",
        },
        // {
        //   pattern: new RegExp(
        //     /^[1-9]$|^[0][1-9]$|^[0][0][1-9]$|^[1-9][0-9]$|^[1][0][0]$/,
        //     "g"
        //   ),
        //   message: "请输入正整数(小于等于100)",
        // },
        {
          validator(rule, value) {
            if (value && state.model.timeUnit) {
              return Promise.resolve();
            } else {
              if (!value && !state.model.timeUnit) {
                return Promise.reject("请输入维保任务生成周期");
              } else if (!value) {
                return Promise.reject("请输入维保任务生成周期");
              } else if (!state.model.timeUnit) {
                return Promise.reject("请选择周期单位");
              }
            }
          },
        },
      ],
      responsibilityType: [
        { required: true, message: "请选择维保责任人" },
        {
          validator(rule, value) {
            if (value === "per") {
              if (state.model.receiveIds?.length) {
                return Promise.resolve();
              } else {
                return Promise.reject("请选择维保责任人");
              }
            } else {
              if (state.model.receiveDeptIds?.length && state.model.receivePostIds?.length) {
                return Promise.resolve();
              } else {
                if (!state.model.receiveDeptIds?.length && !state.model.receivePostIds?.length) {
                  return Promise.reject("请选择维保责任人");
                } else if (!state.model.receiveDeptIds?.length) {
                  return Promise.reject("请选择部门");
                } else if (!state.model.receivePostIds?.length) {
                  return Promise.reject("请选择岗位");
                }
              }
            }
          },
        },
      ],
      status: [{ required: true, message: "请选择计划状态" }],
    };

    const state = reactive({
      deviceModalValue: [],
      deviceList: [],
      model: {
        maintenancePlanName: "",
        planStartTime: "",
        planEndTime: "",
        maintenanceTimePoint: "",
        maintenanceCycle: null,
        timeUnit: "p-day",
        responsibilityType: "per",
        way: "",
        receiveDeptIds: [],
        receivePostIds: [],
        receiveIds: [],
        status: true,
        taskLevel: null,
        remark: "",
      },
      activeKey: "point",
      fieldNames: {
        children: "children",
        label: "targetName",
        key: "id",
      },
      tabList: [
        { key: "STALL", name: "档位" },
        { key: "DEVICE", name: "设备" },
      ],
      transData: [],
      allAttrTable: [],
      targetKeys: [],
      spinning: false,
      showSearch: false,
      clickDevice: null,
      categoryCode: "",
    });

    const tableState = reactive({
      columns: [
        {
          dataIndex: "name",
          title: "维保对象",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record.name || record.objectName || "";
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "productCategoryName",
          title: "产品品类",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record.productInfo?.productCategory?.name || record.categoryName || "";
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "area",
          title: "所属区域",
          ellipsis: true,
          customRender: ({ record }) => {
            const text = record?.area?.pathName || record?.areaName || "";
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "itemNum",
          title: "维保项",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "action",
          title: "操作",
          slots: {
            customRender: "action",
          },
          fixed: "right",
          width: 240,
        },
      ],
      detailCol: [
        {
          dataIndex: "objectName",
          title: "维保对象",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "categoryName",
          title: "产品品类",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "areaName",
          title: "所属区域",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "objectProjects",
          title: "维保项",
          ellipsis: true,
          customRender: ({ text }) => {
            let res = text.length ? text.map((item) => item.maintenanceContent).join(",") : "";
            return (
              <PopOver position="topLeft" content={res ? res : ""}>
                {res ? res : "--"}
              </PopOver>
            );
          },
        },
      ],
      tableData: [],
      inspectPointType: "",
      visible: false,
      objVisi: false,
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      tableStandardSelectKeys: [],
      connectCol: [
        {
          dataIndex: "code",
          title: "编号",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "maintenanceContent",
          title: "维保内容",
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text ? text : ""}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      stallTable: [],
      deviceCol: [],
      deviceTable: [],
      nowCheckDeviceKey: "",
    });

    const modalState = reactive({
      maintApi: {
        list: "maintenanceTermDetail",
      },
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      deviceSearch: [{ label: "", value: "name", placeholder: "名称" }],
      objSelect: [],
      unitList: [
        { name: "天", id: "p-day" },
        { name: "周", id: "p-week" },
        { name: "月", id: "p-month" },
      ],
    });

    const mainTableRef = ref();
    const deviceTableRef = ref();
    const modalActiveKey = ref("");
    const modalStandardRef = ref();

    const transferConfig = reactive({
      transferField: {
        id: "key",
        code: "code",
        areaId: "areaId",
        deviceId: "key",
        genreName: "title",
        areaName: "areaName",
        parentId: "parentId",
        deviceGenreName: "objectType",
        instanceList: "children",
        deviceInstanceName: "title",
      },
      transferApi: {
        list: "generDevice",
      },
    });

    // 维保周期选择
    const cycleBtn = (params) => {
      state.model.cycle = params;
    };
    //任务生成=========================================================================
    const emergencyRuleConditions = ref([]);
    const addRule = () => {
      emergencyRuleConditions.value.push({
        id: guid(),
        deviceProdCategoryCodeConcat: "",
        deviceProdId: undefined,
        conditionType: null,
        deviceEventCode: undefined,
        deviceEventName: "",
        deviceEventType: "",
        deviceProdCategoryName: "",
        deviceProdName: "",
        emergencyRuleConditionExps: [
          {
            id: guid(),
            propCode: "",
            op: null,
            oprand: "",
            delayTime: 0,
            propName: "",
            propUnit: "",
            emergencyRuleConditionId: "",
            emergencyRuleId: "",
            startDelayTime: 0,
            endDelayTime: 0,
          },
        ],
      });
    };
    const deleteRule = (id) => {
      emergencyRuleConditions.value = emergencyRuleConditions.value.filter((item) => item.id !== id);
    };
    const deviceModalRef = ref();
    const addDevice = () => {
      deviceModalRef.value?.openModal();
      state.deviceModalValue = tableState.tableData.map((e) => {
        return { name: e.name || e.objectName, id: e.keyId || e.id };
      });
    };
    // 打开维保对象配置弹框
    const openModal = async (params, record) => {
      tableState.objVisi = true;
      nextTick(() => {
        transfer.value.getData();
        transfer.value.targetKeys = tableState.tableData.map((item) => item.id);
      });
    };
    const handleOk = async () => {
      const baseData = _.cloneDeep(tableState.tableData);
      const baseKeys = _.cloneDeep(tableState.tableData).map((item) => item.keyId);
      if (tableState.tableData.length || state.deviceList.length) {
        let list = state.deviceList.map((item) => {
          if (!baseKeys.includes(item.id)) {
            Object.assign(item, {
              itemNum: 0,
              projectIds: [],
            });
          } else {
            const cur = baseData.find((f) => f.keyId === item.id);
            Object.assign(item, {
              itemNum: cur.itemNum,
              projectIds: cur.projectIds,
            });
          }
          return item;
        });
        tableState.tableData = list;
      } else {
        const res = _.cloneDeep(allSaveItems).filter((item) => {
          Object.assign(item, { projectIds: [], itemNum: 0 });
          return item;
        });
        tableState.tableData = _.cloneDeep(res);
        tableState.tableData = replaceObjectKeys(_.cloneDeep(res));
      }
      // handleCancel();
    };

    const handleCancel = (sourceSelectedKeys, targetSelectedKeys) => {
      transfer.value.reset();
      tableState.objVisi = false;
    };

    const openItemModal = async (record) => {
      let code = record?.categoryCode || record?.productInfo?.productCategory?.code || "";
      if (code.includes("-")) {
        let arr = code.split("-");
        code = arr[arr.length - 1];
      }
      state.categoryCode = code;
      tableState.nowCheckDeviceKey = record.id;
      state.clickDevice = _.cloneDeep(record);
      tableState.visible = await true;
      nextTick(() => {
        mainTableRef.value?.reset();
        mainTableRef.value.selectedKeys = record.projectIds ? record.projectIds : [];
      });
    };

    // 编辑维保项保存
    const setObj = async () => {
      const index = tableState.tableData.findIndex((item) => item.id === tableState.nowCheckDeviceKey);
      Object.assign(tableState.tableData[index], {
        projectIds: mainTableRef.value.selectedKeys,
        itemNum: mainTableRef.value.selectedKeys.length,
      });
      setObjCancel();
    };

    // 编辑维保项关闭弹框
    const setObjCancel = async () => {
      mainTableRef.value.selectedKeys = [];
      tableState.visible = false;
    };

    const isChecked = (selectedKeys, eventKey) => {
      return selectedKeys.indexOf(eventKey) !== -1;
    };

    const onChecked = (i, e, checkedKeys, onItemSelect) => {
      if (e?.event) {
        const rawNode = e.node?.dataRef ?? e.node;
        // 当前点击不为一级
        if (rawNode?.parentKey) {
          const { eventKey } = e.node;
          onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
          // 查询兄弟节点
          const data = checkBroData(state.allAttrTable, rawNode.parentKey);
          const broDataIds = data.filter((item) => item.key !== eventKey).map((item) => item.key);
          // 选中
          if (e.checked) {
            treeCheckedKeys.value = i.checked;
            if (!treeCheckedKeys.value.includes(rawNode.parentKey)) {
              treeCheckedKeys.value.push(rawNode.parentKey);
              onItemSelect(
                rawNode.parentKey,
                // !isChecked(checkedKeys, rawNode.parentKey)
                treeCheckedKeys.value.length ? true : false,
              );
            }
          } else {
            // 选中的有没有兄弟
            const exclude = _.intersection(treeCheckedKeys.value, broDataIds);
            // 有兄弟--只删除自身
            if (exclude?.length) {
              treeCheckedKeys.value = i.checked;
            }
            // 删除父级
            else {
              treeCheckedKeys.value = i.checked.filter((item) => item !== rawNode.parentKey);
              onItemSelect(
                rawNode.parentKey,
                // !isChecked(checkedKeys, rawNode.parentKey)
                treeCheckedKeys.value.length ? true : false,
              );
            }
          }
        }
        // 当前点击为一级
        else {
          const { eventKey } = e.node;
          const childIns = rawNode?.children?.length ? rawNode.children.map((item) => item.key) : [];
          if (e?.checked) {
            treeCheckedKeys.value = treeCheckedKeys.value.concat([...childIns]);
            treeCheckedKeys.value.push(eventKey);
            childIns.forEach((item) => {
              onItemSelect(item, !isChecked(checkedKeys, true));
            });
            // onItemSelect(eventKey, true)
          } else if (e?.checked === false) {
            treeCheckedKeys.value = _.difference(treeCheckedKeys.value, [...childIns, eventKey]);
            childIns.forEach((item) => {
              onItemSelect(item, false);
            });
          }
          onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
        }
      }
    };

    const deleteItem = async (record) => {
      tableState.tableData = tableState.tableData.filter((item) => item.id !== record.id);
    };

    // 维保计划接收对象
    const receive = (params) => {
      state.model.responsibilityType = params;
    };

    const goBack = () => {
      history.back();
    };

    const getData = async (params) => {
      const data = await proxy.$api.maintenancePlanId(params, "get");
      state.model.maintenancePlanName = data.maintenancePlanName; //名称
      state.model.planStartTime = timeFormat(data.planStartTime, false); //启用时间
      state.model.planEndTime = timeFormat(data.planEndTime, false); //禁用时间
      state.model.maintenanceTimePoint = data.maintenanceTimePoint; //维保任务生成时间
      state.model.maintenanceCycle = data.maintenanceCycle; //周期
      state.model.cronExpression = data.cronExpression; //周期
      state.model.responsibilityType = data.responsibilityType; //接收人类型
      state.model.responsibilityPersonName = data.responsibilityPersonName; //接收人
      state.model.receiveIds = data.receiveIds; //接收人
      state.model.receiveDeptIds = data.receiveDeptIds; //接收人部门
      state.model.receivePostIds = data.receivePostIds; //接收人岗位
      state.model.status = data.status; //状态
      state.model.timeUnit = data.timeUnit; //维保周期
      state.model.way = data.way; //生成方式
      // state.model.status = eval(data.status); //状态
      state.model.remark = data.remark; //备注
      tableState.tableData = data.maintenaceObjectsList.filter((item) => {
        Object.assign(item, {
          projectIds: item.objectProjects.map((ele) => ele.id),
          itemNum: item.objectProjects.length,
        });
        return item;
      });
      state.targetKeys = tableState.tableData.map((item) => item.id);
      // if (data.planEndTime && !moment.isMoment(data.planEndTime)) {
      //   state.model.planEndTime = moment(data.planEndTime);
      //   moment(state.model.planEndTime, "YYYY-MM-DD HH:mm:ss");
      // }
      // if (data.planStartTime && !moment.isMoment(data.planStartTime)) {
      //   state.model.planStartTime = moment(data.planStartTime);
      //   moment(data.planStartTime, "YYYY-MM-DD HH:mm:ss");
      // }
      if (type === "copy") {
        state.model.id = "";
        state.model.maintenancePlanName += `-副本-${timeFormat(new Date())}`;
        state.model.status = true;
        emergencyRuleConditions.value = data.ruleDetails;
      }
      if (type === "detail") {
        emergencyRuleConditions.value = data.ruleDetails;
      }
    };

    const submit = async () => {
      form.value
        .validate()
        .then(async () => {
          if (state.model.way === "RULE" && emergencyRuleConditions.value.length === 0) {
            proxy.$message.warn("请至少配置一项任务生成触发条件");
            return;
          }
          if (tableState.tableData.length) {
            const res = tableState.tableData.every((item) => item.itemNum !== 0);
            if (res) {
              const ruleConditions = emergencyRuleConditions.value?.map((x) => {
                const { id, ...args } = x;
                return args;
              });
              const list = _.cloneDeep(tableState.tableData).map((item) => {
                item.objectName = item.name ?? item.objectName;
                item.areaName = item.area?.pathName ?? item.areaName;
                item.area = item.area?.pathId ?? item.area;
                item.categoryName = item.productInfo?.productCategory?.name ?? item.categoryName;
                item.categoryCode = item.productInfo?.productCategory?.pathCode ?? item.categoryCode;
                item.keyId = item.keyId ?? item.id;
                return item;
              });
              const params = {
                ...state.model,
                maintenanceObjectCommands: list,
                way: state.model.way,
                ruleDetails: ruleConditions ?? [],
                status: state.model.status ? "ENABLED" : "DEACTIVATED",
                receiveDeptIds: state.model.receiveDeptIds,
              };
              proxy.$api.maintenancePlanAdd(params, "post").then(() => {
                proxy.$message.success("操作成功");
                goBack();
              });
            } else {
              proxy.$message.warn("请为每一个维保设备添加维保项");
            }
          } else {
            proxy.$message.warn("请配置维保对象");
          }
        })
        .catch(() => {
          if (!tableState.tableData.length) {
            proxy.$message.warn("请配置维保对象");
          }
        });
    };

    const recieveChange = () => {
      form.value.validateFields("responsibilityType");
    };

    const getRowSelection = ({ disabled, selectedKeys, onItemSelectAll, onItemSelect }) => {
      return {
        getCheckboxProps: (item) => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
          const diffKeys = selected ? _.difference(treeSelectedKeys, selectedKeys) : _.difference(selectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },

        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    };

    const cycleChange = () => {
      form.value.validateFields("maintenanceCycle");
    };

    const appointmentOptions = ref([]);
    const appointmentLoading = ref(false);
    // 获取岗位列表
    const fetchAppointmentList = async () => {
      appointmentLoading.value = true;
      try {
        const res = await appointmentList({ enabled: true });
        if (res) {
          appointmentOptions.value = res.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        }
      } catch (error) {
      } finally {
        appointmentLoading.value = false;
      }
    };

    onMounted(() => {
      fetchAppointmentList();
      if (id) {
        getData(id);
      }
      // state.model.responsibilityType = "per";
    });

    watch(
      () => state.model.responsibilityType,
      (n) => {
        // 个人
        if (n == "per") {
          state.model.receiveDeptIds = [];
          state.model.receivePostIds = [];
          // form.value.validateFields("responsibilityType");
        } else {
          state.model.receiveIds = [];
          // form.value.validateFields("responsibilityType");
        }
      },
    );
    watch(
      () => state.model.receiveDeptIds,
      () => {
        // 部门变更时清空岗位；岗位选项由 fetchAppointmentList 预加载，无需 g-select 的 getData
        state.model.receivePostIds = [];
      },
    );

    watch(
      () => state.model.timeUnit,
      (n) => {
        form.value.validateFields("maintenanceCycle");
      },
    );
    watch(
      () => mainTableRef.value,
      (n) => {
        if (n) {
          mainTableRef.value.selectedKeys = state.clickDevice?.projectIds;
        }
      },
    );
    watch(
      () => state.model.planStartTime,
      () => {
        if (state.model.planEndTime && type !== "detail") {
          form.value.validateFields("planEndTime");
        }
      },
    );
    watch(
      () => state.model.planEndTime,
      () => {
        if (state.model.planStartTime && type !== "detail") {
          form.value.validateFields("planStartTime");
        }
      },
    );

    return {
      ctr,
      form,
      type,
      rules,
      format,
      layout,
      transfer,
      timeFormat,
      textLayout,
      mainTableRef,
      deviceTableRef,
      modalActiveKey,
      treeCheckedKeys,
      modalStandardRef,
      emergencyRuleConditions,
      ...toRefs(state),
      ...toRefs(tableState),
      ...toRefs(modalState),
      ...toRefs(transferConfig),
      getRowSelection,
      recieveChange,
      openItemModal,
      setObjCancel,
      handleCancel,
      cycleChange,
      deleteItem,
      millennial,
      openModal,
      onChecked,
      cycleBtn,
      handleOk,
      receive,
      setObj,
      submit,
      goBack,
      deviceModalRef,
      addDevice,
      addRule,
      deleteRule,
      appointmentOptions,
      appointmentLoading,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.ctr {
  width: 100%;
  height: 100%;
}
:deep(.ant-table-tbody) {
  text-align: left;
  font-family: @fontRegular;
}

:deep(.ant-modal) {
  text-align: left;
  .ant-modal-content .ant-modal-body {
    max-height: 600px !important;
    overflow-y: auto;
  }
}
:deep(.ant-transfer-list) {
  width: 360px !important;
}
:deep(.ant-transfer-list-content),
:deep(.ant-tree) {
  max-height: 400px;
  overflow-y: auto;
}
:deep(.ant-select-single .ant-select-selection-search) {
  overflow: hidden;
}
.responsibilityType-input-group {
  display: flex;
  align-items: flex-start;
  width: 100%;
  :deep(.single) {
    flex: 1;
    min-width: 0;
  }
  :deep(.responsibility-dept-selects) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    > .pl1 {
      flex: 1 1 calc(50% - 4px);
      min-width: 0;
      width: auto !important;
    }
    > .ant-select-multiple,
    > .g-select.ant-select-multiple {
      height: auto !important;
      min-height: 32px;
    }
    > .ant-select-multiple .ant-select-selector,
    > .g-select.ant-select-multiple .ant-select-selector {
      height: auto !important;
      min-height: 32px;
      padding-top: 1px;
      padding-bottom: 1px;
    }
  }
}
.formBtnCtr {
  display: flex;
}
</style>
