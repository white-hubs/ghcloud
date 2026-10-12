<template>
  <div ref="ctr" class="ctr">
    <g-layout :title="
      type === 'edit'
        ? '编辑巡检计划'
        : type === 'detail'
          ? '巡检计划详情'
          : '新增巡检计划'
    ">
      <template #content-table>
        <div class="detail-form">
          <a-form ref="form" :model="model" layout="inline" :rules="type !== 'detail' ? rules : null" id="mainForm">
            <div class="item-title">基础信息</div>
            <template v-if="type !== 'detail'">
              <a-form-item label="名称" name="name">
                <a-input v-model:value.trim="model.name" placeholder="请输入巡检计划名称"></a-input>
              </a-form-item>
              <a-form-item label="巡检类型" name="typeId">
                <g-select v-model:value="model.typeId" :placeholder="'请选择巡检类型'" :url="'inspectTypeList'"
                  :field="{ name: 'label', id: 'value' }" @change-check="changeLabel"></g-select>
              </a-form-item>
              <a-form-item label="生效时间" name="beginTime">
                <a-date-picker :style="{ width: '100%' }" v-model:value="model.beginTime" :showTime="true"
                  :format="format" :valueFormat="format"></a-date-picker>
              </a-form-item>
              <a-form-item label="失效时间" name="endTime">
                <a-date-picker :style="{ width: '100%' }" v-model:value="model.endTime" :showTime="true" :format="format"
                  :valueFormat="format"></a-date-picker>
              </a-form-item>
              <a-form-item label="时限" name="limitTimeJson">
                <a-form class="timeLimitForm" layout="inline" ref="timeLimitForm" :model="model.timeLimitModel"
                  :rules="timeLimitRules" :style="{ width: '100%', maxWidth: '300px' }">
                  <a-form-item label="" name="day">
                    <a-input v-model:value.trim="model.timeLimitModel.day" :style="{ width: '100% !important' }"
                      :addonAfter="'天'" placeholder="请输入天" :maxlength="3"></a-input>
                  </a-form-item>
                  <a-form-item label="" name="hour" class="pl1">
                    <a-input v-model:value.trim="model.timeLimitModel.hour" :style="{ width: '100% !important' }"
                      :addonAfter="'时'" placeholder="请输入时" :maxlength="2"></a-input>
                  </a-form-item>
                  <a-form-item label="" name="minute" class="pl1">
                    <a-input v-model:value.trim="model.timeLimitModel.minute" :style="{ width: '100% !important' }"
                      :addonAfter="'分'" placeholder="请输入分" :maxlength="2"></a-input>
                  </a-form-item>
                </a-form>
              </a-form-item>
              <a-form-item label="周期" name="cycle">
                <a-input-group compact="compact">
                  <div class="formBtnCtr">
                    <a-button @click="cycleBtn(false)" :type="model.cycle == false ? 'primary' : 'default'">单次</a-button>
                    <a-button @click="cycleBtn(true)" :type="model.cycle == true ? 'primary' : 'default'">循环</a-button>
                  </div>
                  <g-select class="cycle pl1" :style="{
                    width: 'calc(100% - 128px)',
                    maxWidth: 'calc(100% - 128px)',
                  }" v-if="model.cycle" v-model:value="model.cronExpression" :placeholder="'请选择计划周期'"
                    :url="'inspectCycle'" :field="{ name: 'label', cron: 'value' }"></g-select>
                </a-input-group>
              </a-form-item>
              <a-form-item label="责任人1" class="a-form-item-100"  name="receiveTypeRule">
                <a-input-group
                  compact="compact"
                  :style="{ width: '100% !important' ,maxWidth: '100% !important'}"
                >
                  <div class="formBtnCtr">
                    <a-button @click="receive('2')" :type="model.receiveType === '2' ? 'primary' : 'default'">部门
                    </a-button>
                    <a-button @click="receive('1')" :type="model.receiveType === '1' ? 'primary' : 'default'">人员
                    </a-button>
                  </div>
                  <div
                    v-if="model.receiveType === '1'"
                  >
                    <g-select
                      class="single pl1"
                      v-model:value="model.receiveIds"
                      :url="'tenantUsers'"
                      :mode="'multiple'"
                      :showSearch="true"
                      :placeholder="'责任人'"
                      :showArrow="true"
                      @change-check="recieveChange"
                      :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
                    ></g-select>
                  </div>

                  <div
                    class="single"
                    v-else
                  >
                    <g-select
                      class="pl1"
                      v-model:value="model.receiveDeptIds"
                      :url="'deptList'"
                      :placeholder="'部门'"
                      @change-check="recieveChange"
                      :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
                    ></g-select>
                    <g-select
                      class="pl1"
                      v-model:value="model.receivePostIds"
                      :url="'position'"
                      :placeholder="'岗位'"
                      @change-check="recieveChange"
                      :params="{ pageSize: 1000, pageNumber: 1, enabled: true }"
                    ></g-select>
                  </div>
                </a-input-group>
              </a-form-item>
              <a-form-item label="状态" name="enable">
                <a-switch v-model:checked="model.enable" un-checked-children="禁用" checked-children="启用"></a-switch>
              </a-form-item>
              <a-form-item class="a-form-item-100" label="备注" name="remark" v-bind="textLayout"
                :style="{ marginBottom: '20px' }">
                <a-textarea v-model:value="model.remark" placeholder="请输入备注" :maxlength="200" :showCount="true"
                  :autoSize="{ minRows: 2, maxRows: 8 }"></a-textarea>
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item label="名称" name="name"><span>{{ model.name ? model.name : "--" }}</span></a-form-item>
              <a-form-item label="巡检类型" name="typeName">
                <span>{{ model.typeName ? model.typeName : "--" }} </span>
              </a-form-item>
              <a-form-item label="生效时间" name="beginTime">
                <span>
                  {{
                    model.beginTime ? timeFormat(model.beginTime, true) : "--"
                  }}
                </span>
              </a-form-item>
              <a-form-item label="失效时间" name="endTime">
                <span>
                  {{ model.endTime ? timeFormat(model.endTime, true) : "--" }}
                </span>
              </a-form-item>
              <a-form-item label="时限" name="limitTimeJson">
                <span>
                  {{
                    model.timeLimitModel.day ? model.timeLimitModel.day : "--"
                  }}
                </span>
                <span>天</span>
                <span>
                  {{
                    model.timeLimitModel.hour ? model.timeLimitModel.hour : "--"
                  }}
                </span>
                <span>时</span>
                <span>{{
                  model.timeLimitModel.minute
                  ? model.timeLimitModel.minute
                  : "--"
                }}
                </span>
                <span>分</span>
              </a-form-item>
              <a-form-item label="周期" name="cycle">
                <span>{{ model.cycle ? "循环" : "单次" }}</span>
              </a-form-item>
              <a-form-item label="责任人" name="receiveType">
                <template v-if="model?.receiveType === '1'">
                  <span>
                    {{ model.receiveNames ? model.receiveNames : "--" }}
                  </span>
                </template>
                <template v-else>
                  <span v-if="model?.receivePostNames && model?.receiveDeptNames">
                    {{ model?.receiveDeptNames }}/{{ model?.receivePostNames }}
                  </span>
                  <span v-else-if="
                    model?.receivePostNames || model?.receiveDeptNames
                  ">
                    {{ model?.receivePostNames }}{{ model?.receiveDeptNames }}
                  </span>
                  <span v-else>--</span>
                </template>
              </a-form-item>
              <a-form-item label="状态" name="enable">
                <span :class="model.enable ? 'normalRow' : 'deleteRow'">
                  {{ model.enable ? "启用" : "禁用" }}
                </span>
              </a-form-item>
              <a-form-item class="a-form-item-100" label="备注" name="remark" v-bind="textLayout">
                <span>
                  {{ model.remark ? model.remark : "--" }}
                </span>
              </a-form-item>
            </template>
            <div class="item-title">巡检对象</div>
            <a-form-item class="a-form-item-100">
              <div class="tabTop singleLine mt2">
                <a-tabs v-model:activeKey="activeKey">
                  <a-tab-pane key="point" tab="巡检对象配置">
                    <a-table :columns="columns" :dataSource="tableData" :pagination="false" :scroll="{ x: 900 }"
                      :rowKey="'id'">
                      <template #title>
                        <a-button type="primary" @click="openModal" :disabled="type === 'detail'">
                          巡检对象
                        </a-button>
                      </template>
                      <template #action="{ record }">
                        <a-space :size="16">
                          <template v-if="type === 'detail'">
                            <a-button type="link" danger="danger" disabled @click.stop="">删除</a-button>
                          </template>
                          <template v-else>
                            <a-popconfirm title="删除当前巡检对象？" onText="确定" cancelText="取消" @confirm="deleteItem(record)">
                              <a-button type="link" danger="danger" @click.stop="">删除</a-button>
                            </a-popconfirm>
                          </template>
                        </a-space>
                      </template>
                    </a-table>
                  </a-tab-pane>
                  <a-tab-pane key="standard" tab="巡检标准配置">
                    <div class="standard" v-if="treeOptions.length">
                      <div class="treeCtr">
                        <gVerticalLine title="巡检对象" :style="{
                          height: '32px',
                          lineHeight: '32px',
                          paddingBottom: '16px',
                        }" />
                        <a-tree :tree-data="treeOptions" :fieldNames="fieldNames" @select="selectTree"></a-tree>
                      </div>
                      <div class="tableCtr pl2">
                        <a-table v-if="nowSelectTree" :columns="standardCol" :dataSource="checkedStandard"
                          :pagination="false" :rowSelection="itemStandardSelect" :rowKey="'id'">
                          <template #title>
                            <div class="flex justify-between">
                              <gVerticalLine title="巡检标准列表" />
                              <div>
                                <a-space :size="16">
                                  <a-button type="primary" @click="openStandard" :disabled="
                                    type === 'detail' ||
                                    nowSelectTree.length === 0
                                  ">
                                    配置
                                  </a-button>
                                  <template v-if="
                                    type !== 'detail' &&
                                    tableStandardSelectKeys.length !== 0
                                  ">
                                    <a-popconfirm title="是否删除当前选中？" @confirm="deleBatchStandard">
                                      <a-button type="primary" danger="danger" @click.stop="">
                                        批量删除
                                      </a-button>
                                    </a-popconfirm>
                                  </template>
                                  <template v-else>
                                    <a-button disabled="disabled">批量删除</a-button>
                                  </template>
                                </a-space>
                              </div>
                            </div>
                          </template>
                          <template #action="{ record }">
                            <a-space :size="16">
                              <template v-if="type !== 'detail'">
                                <a-popconfirm title="是否删除当前数据？" cancelText="取消" okText="确定"
                                  @confirm.stop="cancelItem(record)">
                                  <a-button type="link" danger="danger" @click.stop="">删除</a-button>
                                </a-popconfirm>
                              </template>
                              <template v-else>
                                <a disabled="disabled">删除</a></template>
                            </a-space>
                          </template>
                        </a-table>
                        <a-empty class="pt2" v-else description="请选择巡检对象"></a-empty>
                      </div>
                    </div>
                    <a-empty class="pt2 pb2" v-else description="请配置巡检对象"></a-empty>
                  </a-tab-pane>
                </a-tabs>
              </div>
            </a-form-item>
          </a-form>
        </div>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回 </a-button>
        <a-button type="primary" @click="submit" v-if="type !== 'detail'">保存
        </a-button>
      </template>
    </g-layout>
    <a-modal title="巡检标准" v-model:visible="standardVisi" centered="centered" @cancel="cancelStandard" @ok="saveStandard">
      <TableInModal ref="modalStandardRef" :sly="180" :scrollX="200" :search="search" :searchLength="2" :api="standardApi"
        :rowSelection="true" :columns="connectCol" :selectedKeys="stanSelect" :rowKey="'id'" :size="'small'"
        :isInModal="true" :selectType="'checkbox'" :pagination="true"></TableInModal>
      <!-- <s-table
        ref="modalStandardRef"
        :scrollX="200"
        :search="search"
        :api="standardApi"
        :columns="connectCol"
        :size="'small'"
        :showPage="true"
        :allowSelect="true"
        :btns="[]"
      ></s-table> -->
    </a-modal>
    <a-modal v-model:visible="visible" centered title="巡检对象配置" @ok="setObj" @cancel="setObjCancel">
      <a-tabs v-model:activeKey="modalActiveKey">
        <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.name">
          <s-table v-if="item.key === 'STALL'" ref="stallTableRef" :api="stallApi" :scrollX="200" :search="search"
            :size="'small'" :btns="[]" :columns="connectCol" :showPage="true" :allowSelect="true"></s-table>
          <s-table v-if="item.key === 'DEVICE'" ref="deviceTableRef" :api="deviceApi" :scrollX="200" :search="search"
            :size="'small'" :btns="[]" :columns="objCol" :showPage="true" :allowSelect="true"></s-table>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>
<script>
//
import {
  defineComponent,
  getCurrentInstance,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed,
  unref,
  watch,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import _ from "lodash";
import { replaceObjectKeys } from "@pansy/utils";
import moment from "moment";
import InspectPlanModal from "./InspectPlanModal.vue";
import { flattenTree, timeFormat } from "@/utils/common.js";
export default defineComponent({
  components: {
    InspectPlanModal,
  },
  setup() {
    const format = "YYYY-MM-DD HH:mm:ss";
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const ctr = ref();
    const form = ref();

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
      name: [
        { required: true, message: "请输入计划名称" },
        { message: "名称不超过32个字", pattern: new RegExp(/^.{1,32}$/, "g") },
      ],
      typeId: [{ required: true, message: "请选择巡检类型" }],
      beginTime: [
        { required: true, message: "请选择生效时间" },
        {
          validator(rule, value) {
            if (state.model.endTime) {
              if (state.model.endTime <= value) {
                return Promise.reject("生效时间应小于失效时间");
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
      endTime: [
        { required: false, message: "" },
        {
          validator(rule, value) {
            if (state.model.beginTime) {
              if (!value) {
                return Promise.resolve();
              } else if (state.model.beginTime > value) {
                return Promise.reject("失效时间应大于生效时间");
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
      limitTimeJson: [
        // 请填写任务时限
        { required: true, message: "" },
        // {
        //   validator() {
        //     const res = formVali();
        //     if (res) {
        //       return Promise.resolve();
        //     } else {
        //       return Promise.reject("");
        //     }
        //   },
        // },
      ],
      cycle: [
        { required: true, message: "" },
        {
          validator(rule, value) {
            if (value === false) {
              return Promise.resolve();
            } else {
              if (state.model.cronId) {
                return Promise.resolve();
              } else {
                return Promise.reject("请选择计划周期");
              }
            }
          },
        },
      ],
      receiveTypeRule: [{ required: true, message: "请选择责任人" }],
      enable: [{ required: true, message: "请选择计划状态" }],
      taskLevel: [{ required: true, message: "请选择计划级别" }],
    };

    const timeLimitForm = ref();

    const timeLimitRules = {
      day: [
        { required: true, message: "请输入天" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      hour: [
        { required: true, message: "请输入时" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      minute: [
        { required: true, message: "请输入分" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
    };

    const formVali = async () => {
      let res;
      await timeLimitForm.value
        .validate()
        .then(() => {
          res = true;
        })
        .catch(() => {
          res = false;
        });
      return res;
    };

    const state = reactive({
      model: {
        name: "",
        typeId: null,
        cronId: null,
        typeName: null,
        beginTime: "",
        endTime: "",
        limitTimeJson: "",
        cycle: false,
        receiveType: "",
        receiveTypeRule: null,
        receiveDeptIds: [],
        receivePostIds: [],
        receiveIds: [],
        enable: true,
        taskLevel: null,
        remark: "",
        timeLimitModel: {
          day: "0",
          hour: "0",
          minute: "0",
        },
      },
      activeKey: "point",
      treeOptions: [],
      nowSelectTree: [],
      fieldNames: {
        children: "children",
        label: "targetName",
        key: "id",
      },
      standardData: [],
      standardVisi: false,
      standardPagi: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
        size: "small",
      },
      standardCol: [
        {
          dataIndex: "name",
          title: "标准名称",
          slots: {
            customRender: "name",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "code",
          title: "标准编号",
          slots: {
            customRender: "code",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        // {
        // 	dataIndex: 'inspectStandardTypeName',
        // 	title: '标准类型',
        // 	slots: {
        // 		customRender: 'inspectStandardTypeName'
        // 	},
        // 	ellipsis: true
        // customRender: ({ text }) => {
        // 	return (
        // 		<PopOver position="topLeft" content={text}>
        // 			{text ? text : '--'}
        // 		</PopOver>
        // 	)
        // }
        // },
        {
          dataIndex: "standardItemNames",
          title: "标准详情",
          slots: {
            customRender: "standardItemNames",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
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
        },
      ],
      standardColModal: [
        {
          dataIndex: "inspectStandardName",
          title: "标准名称",
          slots: {
            customRender: "inspectStandardName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "inspectStandardCode",
          title: "标准编号",
          slots: {
            customRender: "inspectStandardCode",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "inspectStandardTypeName",
          title: "标准类型",
          slots: {
            customRender: "inspectStandardTypeName",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
        {
          dataIndex: "remark",
          title: "标准详情",
          slots: {
            customRender: "remark",
          },
          ellipsis: true,
          customRender: ({ text }) => {
            return (
              <PopOver position="topLeft" content={text}>
                {text ? text : "--"}
              </PopOver>
            );
          },
        },
      ],
      standardSelectedKeys: [],
      AllCheckStandardObj: {},
      unChecked: [],
      tabList: [
        { key: "DEVICE", name: "设备" },
        { key: "STALL", name: "档位" },
      ],
    });

    const tableState = reactive({
      columns: [
        {
          dataIndex: "targetName",
          title: "巡检对象",
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
        // {
        //   dataIndex: "address",
        //   title: "安装地址",
        //   ellipsis: true,
        //   customRender: ({ text }) => {
        //     return (
        //       <PopOver position="topLeft" content={text ? text : ""}>
        //         {text ? text : "--"}
        //       </PopOver>
        //     );
        //   },
        // },
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
      tableData: [],
      inspectPointType: "",
      visible: false,
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      tableStandardSelectKeys: [],
      connectCol: [
        {
          dataIndex: "name",
          title: "名称",
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
      objCol: [
        {
          dataIndex: "sort",
          title: "序号",
          customRender: ({ index }) => {
            return index + 1;
          },
        },
        {
          dataIndex: "name",
          title: "名称",
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
          dataIndex: "genreName",
          title: "类型",
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
      ],
      stallTable: [],
      deviceCol: [],
      deviceTable: [],
    });

    const modalState = reactive({
      stallApi: {
        list: "getBoothList",
      },
      standardApi: {
        list: "inspectStandard",
      },
      deviceApi: {
        list: "getInstanceList",
      },
      search: [{ label: "", value: "keyword", placeholder: "名称" }],
      // deviceSearch: [{ label: "", value: "keyword", placeholder: "名称" }],
      objSelect: [],
      stanSelect: [],
      checkedStandard: [],
    });

    const stallTableRef = ref();
    const deviceTableRef = ref();
    const modalActiveKey = ref("");
    const modalStandardRef = ref();

    // 巡检周期选择
    const cycleBtn = (params) => {
      state.model.cycle = params;
    };

    // 打开巡检对象配置弹框
    const openModal = async (params, record) => {
      modalActiveKey.value = state.tabList[0].key;
      tableState.visible = await true;
      modalState.objSelect = tableState.tableData.map((item) => item.id);
      nextTick(() => {
        if (deviceTableRef.value) {
          deviceTableRef.value[0]?.getData();
          deviceTableRef.value[0].selectedKeys = tableState.tableData.map(
            (item) => item.id
          );
        }
      });
    };

    // 巡检对象配置保存
    const setObj = async () => {
      let nowSaveStallItems = [],
        nowSaveDeviceItems = [];
      if (stallTableRef.value) {
        nowSaveStallItems = stallTableRef.value
          ? stallTableRef.value[0].selectedItems.filter((item) => {
            // Object.assign((item.targetCategory = "STALL"));
            Object.assign(item, { targetCategory: "STALL" });
            return item;
          })
          : [];
      }
      if (deviceTableRef.value) {
        nowSaveDeviceItems = deviceTableRef.value
          ? deviceTableRef.value[0].selectedItems.filter((item) => {
            // Object.assign((item.targetCategory = "DEVICE"));
            Object.assign(item, { targetCategory: "DEVICE" });
            return item;
          })
          : [];
      }
      const saveItems = nowSaveStallItems.concat(
        nowSaveDeviceItems ? nowSaveDeviceItems : []
      );
      // 构造表格数据
      const intersectionData = _.intersectionBy(
        tableState.tableData,
        saveItems,
        "id"
      );
      const addItems = _.differenceBy(saveItems, intersectionData, "id");
      tableState.tableData = replaceObjectKeys(
        [...intersectionData, ...addItems],
        {
          id: "id",
          name: "targetName",
          type: "targetType",
          typeName: "typeName",
          areaName: "areaName",
          genreName: "typeName",
          genreId: "targetType",
          targetType: "targetType",
          targetName: "targetName",
          targetCategory: "targetCategory",
        }
      );
      modalState.objSelect = tableState.tableData.map((item) => item.id);
      setObjCancel();
    };

    // 巡检对象配置关闭弹框
    const setObjCancel = async (params) => {
      if (stallTableRef.value) {
        stallTableRef.value[0].reset();
      }
      if (deviceTableRef.value) {
        deviceTableRef.value[0].reset();
      }
      setTreeData();
      tableState.visible = false;
    };

    const deleteItem = async (record) => {
      tableState.tableData = tableState.tableData.filter(
        (item) => item.id !== record.id
      );
      modalState.objSelect = tableState.tableData.map((item) => item.id);
      setTreeData();
    };

    const setTreeData = async () => {
      if (tableState.tableData.length) {
        const tableGroup = _.groupBy(tableState.tableData, "typeName");
        // 添加
        if (state.treeOptions.length) {
          const tableKeys = _.uniq(
            tableState.tableData.map((item) => item.typeName)
          );
          for (let j in tableGroup) {
            const targetNames = state.treeOptions.map(
              (item) => item.targetName
            );
            if (targetNames.includes(j)) {
              const index = state.treeOptions.findIndex(
                (item) => item.targetName === j
              );
              const addItems = _.differenceBy(
                tableGroup[j],
                state.treeOptions[index].children,
                "id"
              );
              const deleteIds = _.differenceBy(
                state.treeOptions[index].children,
                tableGroup[j],
                "id"
              ).map((item) => item.id);
              const addList = addItems.filter((item) => {
                Object.assign(item, {
                  standardItems: state.treeOptions[index].standardItems,
                  standardIds: state.treeOptions[index].standardIds,
                });
                return item;
              });
              state.treeOptions[index].children = state.treeOptions[
                index
              ].children
                .concat(addList)
                .filter((ele) => !deleteIds.includes(ele.id));
            } else {
              proxy.$api
                .inspectStandardList({
                  targetType: tableGroup[j][0].targetType,
                })
                .then((res) => {
                  state.treeOptions.push({
                    targetName: j,
                    id: `parent${j}`,
                    standardItems: res,
                    standardIds: res.map((item) => item.id),
                    children: tableGroup[j].filter((item) => {
                      Object.assign(item, {
                        standardItems: res,
                        standardIds: res.map((item) => item.id),
                      });
                      return item;
                    }),
                  });
                });
            }

            state.treeOptions = state.treeOptions.filter((item) =>
              tableKeys.includes(item.targetName)
            );
          }
        } else {
          // 表格数据分组--typeName
          for (let i in tableGroup) {
            proxy.$api
              .inspectStandardList({ targetType: tableGroup[i][0].targetType })
              .then((res) => {
                state.treeOptions.push({
                  targetName: i,
                  id: `parent${i}`,
                  standardItems: res,
                  standardIds: res.map((item) => item.id),
                  children: tableGroup[i].filter((item) => {
                    Object.assign(item, {
                      standardItems: res,
                      standardIds: res.map((item) => item.id),
                    });
                    return item;
                  }),
                });
              });
          }
        }
      } else {
        state.treeOptions = [];
      }
    };

    // 获取详情后设置树形
    const detailTreeSet = async () => {
      const tableGroup = _.groupBy(tableState.tableData, "typeName");
      // 表格数据分组--typeName
      for (let i in tableGroup) {
        proxy.$api
          .inspectStandardList({ targetType: tableGroup[i][0].targetType })
          .then((res) => {
            state.treeOptions.push({
              targetName: i,
              id: `parent${i}`,
              standardItems: res,
              standardIds: res.map((item) => item.id),
              children: tableGroup[i].filter((item) => {
                Object.assign(item, {
                  standardItems: state.standardData.filter((ele) =>
                    item.standardIds.includes(ele.id)
                  ),
                });
                return item;
              }),
            });
          });
      }
    };

    // 巡检计划接收对象
    const receive = (params) => {
      state.model.receiveType = params;
    };

    // 获取所有标准
    const getStandard = async (params) => {
      const getParams = {
        ...params,
        pageNum: 1,
        pageSize: 2000,
      };
      const data = await proxy.$api.inspectStandard(getParams, "get");
      if (data && data.records) {
        state.standardData = data.records;
      } else {
        state.standardData = data;
      }
    };

    // 标准弹窗
    const openStandard = async () => {
      modalState.stanSelect = state.nowSelectTree?.standardIds
        ? state.nowSelectTree?.standardIds
        : [];
      state.standardVisi = await true;
      nextTick(() => {
        modalStandardRef.value?.getData();
      });
    };

    // 标准弹框选择
    const modalSelected = (record, selectedRows) => { };

    const selectTree = async (selectedKeys, { selected, selectedNodes, node }) => {
      if (selected) {
        const raw = selectedNodes?.[0] ?? node
        const row = raw?.props?.dataRef ?? raw?.dataRef ?? raw
        // 树形一级
        if (selectedKeys[0].includes("parent")) {
          const treeNode = { ...row, firstLevel: true };
          state.nowSelectTree = treeNode;
        }
        // 树形二级
        else {
          const treeNode = { ...row, firstLevel: false };
          state.nowSelectTree = treeNode;
        }
      } else {
        state.nowSelectTree = [];
      }
      modalState.checkedStandard = state.nowSelectTree?.standardItems
        ? _.cloneDeep(state.nowSelectTree?.standardItems)
        : [];
    };

    // 绑定标准
    const saveStandard = async () => {
      const preIds = await _.cloneDeep(
        modalState.checkedStandard.map((item) => item.id).sort()
      );
      if (modalStandardRef.value.alreadySelected.length) {
        Object.assign(state.nowSelectTree, {
          standardIds: _.cloneDeep(modalStandardRef.value.alreadySelected),
          standardItems: _.cloneDeep(
            state.standardData.filter((item) =>
              modalStandardRef.value.alreadySelected.includes(item.id)
            )
          ),
        });
        // 一级树形选择
        if (state.nowSelectTree.firstLevel) {
          const index = state.treeOptions.findIndex(
            (item) => item.targetName === state.nowSelectTree.targetName
          );
          state.treeOptions[index].standardIds = _.cloneDeep(
            modalStandardRef.value.alreadySelected
          );
          state.treeOptions[index].standardItems = _.cloneDeep(
            state.standardData.filter((item) =>
              modalStandardRef.value.alreadySelected.includes(item.id)
            )
          );
          // 判断children是否绑定标准
          for (let i of state.treeOptions[index].children) {
            if (_.has(i, "standardIds")) {
              const diff1 = JSON.stringify(preIds);
              const diff2 = JSON.stringify(_.cloneDeep(i.standardIds.sort()));
              if (diff1 === diff2) {
                i.standardItems = _.cloneDeep(
                  state.treeOptions[index].standardItems
                );
                i.standardIds = _.cloneDeep(
                  state.treeOptions[index].standardIds
                );
              }
            } else {
              Object.assign(i, {
                standardIds: _.cloneDeep(state.treeOptions[index].standardIds),
                standardItems: _.cloneDeep(
                  state.treeOptions[index].standardItems
                ),
              });
            }
          }
        } else {
          for (let i of state.treeOptions) {
            if (i.targetName === state.nowSelectTree.typeName) {
              for (let j of i.children) {
                if (j.targetName === state.nowSelectTree.targetName) {
                  Object.assign(j, {
                    standardIds: modalStandardRef.value.alreadySelected,
                    standardItems: _.cloneDeep(
                      state.standardData.filter((item) =>
                        modalStandardRef.value.alreadySelected.includes(item.id)
                      )
                    ),
                  });
                }
              }
            }
          }
        }
        cancelStandard();
      } else {
        proxy.$message.warn("请选择绑定的标准");
      }
    };

    const cancelStandard = () => {
      modalState.checkedStandard = state.nowSelectTree?.standardItems
        ? state.nowSelectTree?.standardItems
        : [];
      modalState.stanSelect = [];
      state.standardVisi = false;
    };

    const goBack = () => {
      history.go(-1);
    };

    const getData = async (params) => {
      const data = await proxy.$api.inspectPlanId(params, "get");
      const timeLimit = eval("(" + data.limitTimeJson + ")");
      state.model.name = data.name; //名称
      state.model.typeId = data.typeId; //类型
      state.model.typeName = data.typeName; //类型
      state.model.beginTime = data.beginTime; //启用时间
      state.model.endTime = data.endTime; //禁用时间
      state.model.limitTimeJson = data.limitTimeJson; //时限
      state.model.timeLimitModel.day = timeLimit.day; //天
      state.model.timeLimitModel.hour = timeLimit.hour; //时
      state.model.timeLimitModel.minute = timeLimit.minute; //分
      state.model.cycle = eval(data.cycle); //周期
      state.model.cronExpression = data.cronExpression; //周期
      state.model.cronId = data.cronId; //周期
      state.model.receiveType = data.receiveType; //接收人类型
      state.model.receiveTypeRule =
        data.receiveType === "1"
          ? data.receiveIds.length
            ? "true"
            : null
          : data.receiveDeptIds && data.receivePostIds
            ? "true"
            : null; //接收人校验
      state.model.receiveNames = data.receiveNames; //接收人
      state.model.receivePostNames = data.receivePostNames; //接收人
      state.model.receiveDeptNames = data.receiveDeptNames; //接收人
      state.model.receiveIds = data.receiveIds
        ? data.receiveIds.split(",")
        : []; //接收人类型
      state.model.receiveDeptIds = data.receiveDeptIds; //接收人部门
      state.model.receivePostIds = data.receivePostIds; //接收人岗位
      state.model.enable = eval(data.enable); //状态
      state.model.remark = data.remark; //备注
      tableState.tableData = replaceObjectKeys(data.planTargets, {
        areaId: "areaId",
        address: "address",
        areaName: "areaName",
        standardIds: "standardIds",
        targetCategory: "targetCategory",
        targetId: "id",
        targetName: "targetName",
        targetType: "targetType",
        targetTypeName: "typeName",
      });
      if (type !== "add") {
        detailTreeSet();
      }
      if (state.model.endTime && !moment.isMoment(state.model.endTime)) {
        state.model.endTime = moment(state.model.endTime);
        moment(state.model.endTime, "YYYY-MM-DD HH:mm:ss");
      }
      if (state.model.beginTime && !moment.isMoment(state.model.beginTime)) {
        state.model.beginTime = moment(state.model.beginTime);
        moment(state.model.beginTime, "YYYY-MM-DD HH:mm:ss");
      }
      if (type === "copy") {
        state.model.id = "";
        state.model.name += `-副本-${timeFormat(new Date())}`;
      }
    };

    const createTreeParams = async () => {
      let params = [];
      for (let i of state.treeOptions) {
        const replaceItems = replaceObjectKeys(i.children, {
          id: "targetId",
          targetType: "targetType",
          targetName: "targetName",
          standardIds: "standardIds",
          targetCategory: "targetCategory",
        });
        params = await params.concat(replaceItems);
      }
      return params;
    };

    const submit = async () => {
      await timeLimitForm.value
        .validate()
        .then(() => {
          state.model.limitTimeJson = JSON.stringify(
            state.model.timeLimitModel
          );
        })
        .catch(() => {
          form.value.validate();
        });
      form.value
        .validate()
        .then(async () => {
          if (tableState.tableData.length) {
            const planTargets = await createTreeParams();
            const params = {
              ...state.model,
              planTargets: planTargets,
              receiveIds: state.model.receiveIds.join(","),
              receiveDeptIds:
                typeof state.model.receiveDeptIds === "string"
                  ? state.model.receiveDeptIds
                  : state.model.receiveDeptIds.join(","),
              receivePostIds:
                typeof state.model.receivePostIds === "string"
                  ? state.model.receivePostIds
                  : state.model.receivePostIds.join(","),
            };
            delete params.receiveTypeRule;
            delete params.timeLimitModel;
            proxy.$api.inspectPlanAdd(params, "post").then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
          } else {
            proxy.$message.warn("请配置巡检对象");
          }
        })
        .catch(() => {
          if (!tableState.tableData.length) {
            proxy.$message.warn("请配置巡检对象");
          }
        });
    };

    // 删除绑定的标准
    const cancelItem = async (record) => {
      const preIds = await _.cloneDeep(
        modalState.checkedStandard.map((item) => item.id).sort()
      );
      if (state.nowSelectTree.firstLevel) {
        const index = state.treeOptions.findIndex(
          (item) => item.targetName === state.nowSelectTree.targetName
        );
        state.treeOptions[index].standardIds = _.cloneDeep(
          state.treeOptions[index].standardIds.filter(
            (item) => item.id !== record.id
          )
        );
        state.treeOptions[index].standardItems = _.cloneDeep(
          state.treeOptions[index].standardItems.filter(
            (item) => item.id !== record.id
          )
        );
        Object.assign(state.nowSelectTree, {
          standardIds: _.cloneDeep(state.treeOptions[index].standardIds),
          standardItems: _.cloneDeep(state.treeOptions[index].standardItems),
        });
        // 判断children是否绑定标准
        for (let i of state.treeOptions[index].children) {
          if (_.has(i, "standardIds")) {
            const diff1 = JSON.stringify(preIds);
            const diff2 = JSON.stringify(_.cloneDeep(i.standardIds.sort()));
            if (diff1 === diff2) {
              i.standardItems = _.cloneDeep(
                state.treeOptions[index].standardItems
              );
              i.standardIds = _.cloneDeep(state.treeOptions[index].standardIds);
            }
          } else {
            Object.assign(i, {
              standardIds: _.cloneDeep(state.treeOptions[index].standardIds),
              standardItems: _.cloneDeep(
                state.treeOptions[index].standardItems
              ),
            });
          }
        }
      } else {
        const index = state.treeOptions.findIndex(
          (item) => item.targetName === state.nowSelectTree.typeName
        );
        for (let i of state.treeOptions[index].children) {
          if (i.targetName === state.nowSelectTree.targetName) {
            i.standardItems = _.cloneDeep(
              i.standardItems.filter((item) => item.id !== record.id)
            );
            i.standardIds = _.cloneDeep(
              i.standardIds.filter((item) => item !== record.id)
            );
            Object.assign(state.nowSelectTree, {
              standardItems: _.cloneDeep(i.standardItems),
              standardIds: _.cloneDeep(i.standardIds),
            });
          }
        }
      }
      cancelStandard();
    };

    const itemStandardSelect = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(tableState.tableStandardSelectKeys),
        onChange: checkedBatchStandard,
      };
    });

    const checkedBatchStandard = (record) => {
      tableState.tableStandardSelectKeys = record;
    };

    const deleBatchStandard = async () => {
      const preIds = await _.cloneDeep(
        modalState.checkedStandard.map((item) => item.id).sort()
      );
      // 判断当前点击层级
      if (state.nowSelectTree.firstLevel) {
        const index = state.treeOptions.findIndex(
          (item) => item.targetName === state.nowSelectTree.targetName
        );
        state.treeOptions[index].standardIds = _.cloneDeep(
          _.difference(
            state.treeOptions[index].standardIds,
            tableState.tableStandardSelectKeys
          )
        );
        state.treeOptions[index].standardItems = _.cloneDeep(
          state.standardData.filter((item) =>
            state.treeOptions[index].standardIds.includes(item.id)
          )
        );
        Object.assign(state.nowSelectTree, {
          standardIds: _.cloneDeep(state.treeOptions[index].standardIds),
          standardItems: _.cloneDeep(state.treeOptions[index].standardItems),
        });
        // 判断children是否绑定标准
        for (let i of state.treeOptions[index].children) {
          if (_.has(i, "standardIds")) {
            const diff1 = JSON.stringify(preIds);
            const diff2 = JSON.stringify(_.cloneDeep(i.standardIds.sort()));
            if (diff1 === diff2) {
              i.standardItems = _.cloneDeep(
                state.treeOptions[index].standardItems
              );
              i.standardIds = _.cloneDeep(state.treeOptions[index].standardIds);
            }
          }
        }
      } else {
        const index = state.treeOptions.findIndex(
          (item) => item.targetName === state.nowSelectTree.typeName
        );
        for (let i of state.treeOptions[index].children) {
          if (i.targetName === state.nowSelectTree.targetName) {
            i.standardItems = _.cloneDeep(
              i.standardItems.filter(
                (item) => !tableState.tableStandardSelectKeys.includes(item.id)
              )
            );
            i.standardIds = _.cloneDeep(
              i.standardIds.filter(
                (item) => !tableState.tableStandardSelectKeys.includes(item)
              )
            );
            Object.assign(state.nowSelectTree, {
              standardItems: _.cloneDeep(i.standardItems),
              standardIds: _.cloneDeep(i.standardIds),
            });
          }
        }
      }
      modalState.checkedStandard = state.nowSelectTree.standardItems;
      tableState.tableStandardSelectKeys = [];
    };

    const recieveChange = () => {
      if (state.model.receiveType === "1") {
        state.model.receiveTypeRule = state.model.receiveIds.length
          ? "true"
          : null;
      } else {
        state.model.receiveTypeRule =
          state.model.receiveDeptIds?.length &&
            state.model.receivePostIds?.length
            ? "true"
            : null;
      }
      form.value.validateFields("receiveTypeRule");
    };

    const changeLabel = (value, option) => {
      state.model.typeName = option.label;
    };

    onMounted(() => {
      getStandard();
      if (id) {
        getData(id);
      }
      state.model.receiveType = "1";
    });

    watch(
      () => state.model.timeLimitModel,
      (n) => {
        if (
          state.model.timeLimitModel.day &&
          state.model.timeLimitModel.hour &&
          state.model.timeLimitModel.minute
        ) {
          state.model.limitTimeJson = JSON.stringify(n);
        } else {
          state.model.limitTimeJson = "";
        }
        form.value.validateFields("limitTimeJson");
      },
      { deep: true }
    );

    watch(
      () => state.model.receiveType,
      (n) => {
        // 个人
        if (n == "1") {
          state.model.receiveDeptIds = [];
          state.model.receivePostIds = [];
          state.model.receiveTypeRule = null;
        } else {
          state.model.receiveIds = [];
          state.model.receiveTypeRule = null;
        }
      }
    );
    // watch(
    //   () => state.model.receiveIds,
    //   (n, o) => {
    //     if (n !== o && o) {
    //       form.value.validateFields("receiveTypeRule");
    //     }
    //   }
    // );
    // watch(
    //   () => state.model.receivePostIds,
    //   (n, o) => {
    //     if (n !== o && o) {
    //       form.value.validateFields("receiveTypeRule");
    //     }
    //   }
    // );

    watch(
      () => state.model.beginTime,
      (n) => {
        form.value.validateFields("beginTime");
        form.value.validateFields("endTime");
      }
    );

    watch(
      () => state.model.endTime,
      (n) => {
        form.value.validateFields("beginTime");
        form.value.validateFields("endTime");
      }
    );

    watch(
      () => state.model.cycle,
      (n, o) => {
        if (n !== o) {
          form.value.validateFields("cycle");
        }
      }
    );

    watch(
      () => state.model.cronId,
      () => {
        form.value.validateFields("cycle");
      }
    );

    watch(
      () => modalActiveKey.value,
      (n) => {
        if (n === "STALL") {
          nextTick(() => {
            if (stallTableRef.value) {
              stallTableRef.value[0]?.getData();
              stallTableRef.value[0].selectedKeys = tableState.tableData.map(
                (item) => item.id
              );
            }
          });
        }
      }
    );
    return {
      ctr,
      form,
      type,
      rules,
      format,
      layout,
      timeFormat,
      textLayout,
      stallTableRef,
      timeLimitForm,
      timeLimitRules,
      deviceTableRef,
      modalActiveKey,
      modalStandardRef,
      ...toRefs(state),
      ...toRefs(tableState),
      ...toRefs(modalState),
      itemStandardSelect,
      deleBatchStandard,
      cancelStandard,
      recieveChange,
      openStandard,
      saveStandard,
      setObjCancel,
      changeLabel,
      deleteItem,
      cancelItem,
      selectTree,
      openModal,
      cycleBtn,
      receive,
      setObj,
      submit,
      goBack,
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

:deep(.ant-tabs-tabpane) {
  width: 100%;
  height: 100%;
}

.standard {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #fff;

  .treeCtr {
    width: 200px;
    border-right: 1px solid #f3f3f3;
  }

  .tableCtr {
    flex: 1;
  }
}

.timeLimitForm {
  height: 32px !important;

  // display: grid;
  // grid-template-columns: repeat(3, 1fr);
  // grid-column-gap: 4px;
  .ant-form-item {
    margin-bottom: 0;
  }
}

.tabTop {
  // background-color: #fafafa;
  font-family: @fontMedium;
  font-size: 14px;
  font-weight: 500;
}

:deep(.ant-tabs-top-bar) {
  background-color: #fafafa;
  // background-color: #f3f3f3;
  margin-bottom: 8px;
}

:deep(.ant-table-title) {
  text-align: right;
  padding: 0;
  padding-bottom: 16px;
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

:deep(.ant-modal-body) {
  padding: 16px !important;
}

:deep(.ant-select-selection-search) {
  overflow: hidden;
}

</style>
