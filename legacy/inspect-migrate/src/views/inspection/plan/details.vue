<template>
  <div ref="ctr">
    <g-layout
      :title="
        type === 'edit'
          ? '编辑巡检计划'
          : type === 'detail'
          ? '巡检计划详情'
          : '新增巡检计划'
      "
    >
      <template #content-table>
        <a-form ref="form" :model="model" :rules="rules" v-bind="layout">
          <template v-if="type !== 'detail'">
            <a-form-item label="名称" name="taskName">
              <a-input
                v-model:value="model.taskName"
                placeholder="请输入巡检计划名称"
              ></a-input>
            </a-form-item>
            <a-form-item label="类型" name="taskTypeId">
              <Select
                v-model:value="model.taskTypeId"
                :placeholder="'请选择巡检计划类型'"
                :dataMethod="'inspectPage'"
                :params="{ typeCategory: 'INSPECT_TASK' }"
                :field="{ label: 'typeName', value: 'id' }"
              ></Select>
            </a-form-item>
            <a-form-item label="级别" name="taskLevel">
              <Select
                v-model:value="model.taskLevel"
                :placeholder="'请选择巡检计划级别'"
                :dataMethod="'inspectPlanLevel'"
                :field="{ label: 'name', value: 'code' }"
              ></Select>
            </a-form-item>
            <a-form-item label="启用时间" name="startTime">
              <a-date-picker
                v-model:value="model.startTime"
                showTime="showTime"
                :format="format"
              ></a-date-picker>
            </a-form-item>
            <a-form-item label="过期时间" name="endTime">
              <a-date-picker
                v-model:value="model.endTime"
                showTime="showTime"
                :format="format"
              ></a-date-picker>
            </a-form-item>
            <a-form-item label="时限" name="taskTimeLimit">
              <a-form
                class="timeLimitForm"
                layout="inline"
                ref="timeLimitForm"
                :model="model.timeLimitModel"
                :rules="timeLimitRules"
                style="width: 100%"
              >
                <a-form-item label="" name="day" style="width: 100%">
                  <a-input
                    v-model:value="model.timeLimitModel.day"
                    :addonAfter="'天'"
                    placeholder="请输入天"
                  ></a-input>
                </a-form-item>
                <a-form-item label="" name="hour" style="width: 100%">
                  <a-input
                    v-model:value="model.timeLimitModel.hour"
                    :addonAfter="'时'"
                    placeholder="请输入时"
                  ></a-input>
                </a-form-item>
                <a-form-item label="" name="minute" style="width: 100%">
                  <a-input
                    v-model:value="model.timeLimitModel.minute"
                    :addonAfter="'分'"
                    placeholder="请输入分"
                  ></a-input>
                </a-form-item>
              </a-form>
            </a-form-item>
            <a-form-item label="周期" name="cycle">
              <a-input-group compact="compact">
                <div class="formBtnCtr">
                  <a-button
                    @click="cycleBtn(false)"
                    :type="model.cycle == false ? 'primary' : 'default'"
                    >单次</a-button
                  >
                  <a-button
                    @click="cycleBtn(true)"
                    :type="model.cycle == true ? 'primary' : 'default'"
                    >循环</a-button
                  >
                </div>
                <Select
                  class="cycle"
                  v-if="model.cycle"
                  v-model:value="model.cronExpression"
                  :placeholder="'请选择计划周期'"
                  :dataMethod="'inspectCycle'"
                  :field="{ label: 'name', value: 'cron' }"
                ></Select>
              </a-input-group>
            </a-form-item>
            <a-form-item label="接收人" name="receiveTypeRule">
              <a-input-group compact="compact">
                <div class="formBtnCtr">
                  <a-button
                    @click="receive('DEPT')"
                    :type="model.receiveType === 'DEPT' ? 'primary' : 'default'"
                    >部门</a-button
                  >
                  <a-button
                    @click="receive('PERSON')"
                    :type="
                      model.receiveType === 'PERSON' ? 'primary' : 'default'
                    "
                    >人员</a-button
                  >
                </div>
                <Select
                  class="single"
                  v-model:value="model.receiveIds"
                  v-if="model.receiveType === 'PERSON'"
                  :dataMethod="'tenantUsers'"
                  :mode="'multiple'"
                  :showSearch="true"
                  :placeholder="'请选择接收人'"
                  showArrow="showArrow"
                ></Select>
                <div class="single" v-else>
                  <Select
                    class="pl1"
                    v-model:value="model.receiveDeptIds"
                    style="width: 50%"
                    :dataMethod="'deptList'"
                  ></Select>
                  <Select
                    class="pl1"
                    v-model:value="model.receivePostIds"
                    style="width: 50%"
                    :dataMethod="'position'"
                  ></Select>
                </div>
              </a-input-group>
            </a-form-item>
            <a-form-item label="状态" name="taskStatus">
              <a-switch
                v-model:checked="model.taskStatus"
                un-checked-children="禁用"
                checked-children="启用"
              ></a-switch>
            </a-form-item>
            <a-form-item
              class="singleLine"
              label="备注"
              name="remark"
              v-bind="textLayout"
            >
              <a-textarea
                v-model:value="model.remark"
                placeholder="请输入备注"
                :maxlength="200"
                showCount="showCount"
              ></a-textarea>
            </a-form-item>
          </template>
          <template v-else>
            <a-form-item label="名称" name="taskName"
              ><span>{{
                model.taskName ? model.taskName : "--"
              }}</span></a-form-item
            >
            <a-form-item label="类型" name="taskTypeId"
              ><span>{{
                model.taskTypeId ? model.taskTypeId : "--"
              }}</span></a-form-item
            >
            <a-form-item label="启用时间" name="startTime"
              ><span>{{
                model.startTime ? timeFormat(model.startTime, true) : "--"
              }}</span></a-form-item
            >
            <a-form-item label="过期时间" name="endTime"
              ><span>{{
                model.endTime ? timeFormat(model.endTime, true) : "--"
              }}</span></a-form-item
            >
            <a-form-item label="时限" name="taskTimeLimit"
              ><span>{{
                model.timeLimitModel.day ? model.timeLimitModel.day : "--"
              }}</span
              ><span>天</span
              ><span>{{
                model.timeLimitModel.hour ? model.timeLimitModel.hour : "--"
              }}</span
              ><span>时</span
              ><span>{{
                model.timeLimitModel.minute ? model.timeLimitModel.minute : "--"
              }}</span
              ><span>分</span></a-form-item
            >
            <a-form-item label="周期" name="cycle"
              ><span>{{ model.cycle ? "循环" : "单次" }}</span></a-form-item
            >
            <a-form-item label="接收人" name="receiveType"
              ><span>{{
                model.receiveNames ? model.receiveNames : "--"
              }}</span></a-form-item
            >
            <a-form-item label="状态" name="taskStatus"
              ><span :class="model.taskStatus ? 'normalRow' : 'deleteRow'">{{
                model.taskStatus ? "启用" : "禁用"
              }}</span></a-form-item
            >
            <a-form-item
              class="singleLine"
              label="备注"
              name="remark"
              v-bind="textLayout"
              ><span>{{
                model.remark ? model.remark : "--"
              }}</span></a-form-item
            >
          </template>
          <div class="tabTop singleLine">
            <a-tabs v-model:activeKey="activeKey">
              <a-tab-pane key="point" tab="巡检点配置">
                <a-table
                  :columns="columns"
                  :dataSource="tableData"
                  :pagination="pagination"
                  :scroll="{ x: 1300 }"
                  :rowKey="'inspectObjectId'"
                >
                  <template #title>
                    <a-space :size="16">
                      <a-button
                        type="primary"
                        @click="openModal('ASSET')"
                        :disabled="type === 'detail'"
                        >添加资产巡检点</a-button
                      >
                      <a-button
                        type="primary"
                        @click="openModal('STALL')"
                        :disabled="type === 'detail'"
                        >添加档位巡检点</a-button
                      >
                      <a-button
                        type="primary"
                        @click="openModal('POINT')"
                        :disabled="type === 'detail'"
                        >添加现场巡检点</a-button
                      >
                    </a-space>
                  </template>
                  <template #action="{ record, index }">
                    <a-space :size="16">
                      <template v-if="type === 'detail'"
                        ><a disabled="disabled">关联资产</a
                        ><a disabled="disabled">关联档位</a
                        ><a disabled="disabled">更多</a></template
                      >
                      <template v-else
                        ><a @click="connect(record, 'ASSET', index)">关联资产</a
                        ><a @click="connect(record, 'STALL', index)"
                          >关联档位</a
                        >
                        <a-dropdown>
                          <a-button type="link" @click.prevent=""
                            >更多</a-button
                          >
                          <template #overlay>
                            <a-menu>
                              <a-menu-item
                                ><a @click="connect(record, 'POINT', index)"
                                  >关联现场</a
                                ></a-menu-item
                              >
                              <a-menu-item>
                                <a-popconfirm
                                  title="删除当前巡检点？"
                                  onText="确定"
                                  cancelText="取消"
                                  @confirm="deleteItem(record)"
                                >
                                  <a-button
                                    type="link"
                                    danger="danger"
                                    @click.stop=""
                                    >删除</a-button
                                  >
                                </a-popconfirm>
                              </a-menu-item>
                            </a-menu>
                          </template>
                        </a-dropdown>
                      </template>
                    </a-space>
                  </template>
                </a-table>
              </a-tab-pane>
              <a-tab-pane key="standard" tab="巡检标准配置">
                <div class="standard">
                  <div>
                    <div class="verticalLine pt2 pb2 treeData">
                      巡检对象列表
                    </div>
                    <a-tree
                      :tree-data="treeOptions"
                      :fieldNames="fieldNames"
                      @select="selectTree"
                    ></a-tree>
                  </div>
                  <div>
                    <a-table
                      v-if="nowSelectTree"
                      :columns="standardCol"
                      :dataSource="checkedStandard"
                      :pagination="itemStandardPagi"
                      :rowSelection="itemStandardSelect"
                      :rowKey="'id'"
                    >
                      <template #title>
                        <div class="flex justify-between">
                          <span class="verticalLine">巡检标准列表</span>
                          <div>
                            <a-space :size="16">
                              <a-button
                                type="primary"
                                @click="openStandard"
                                :disabled="type === 'detail'"
                                >新增</a-button
                              >
                              <template
                                v-if="type !== 'detail' &amp;&amp; tableStandardSelectKeys.length !== 0"
                              >
                                <a-popconfirm
                                  title="是否删除当前选中？"
                                  okType="确定"
                                  cancelText="取消"
                                  @confirm="deleBatchStandard"
                                >
                                  <a-button
                                    type="primary"
                                    danger="danger"
                                    @click.stop=""
                                    >批量删除</a-button
                                  >
                                </a-popconfirm>
                              </template>
                              <template v-else>
                                <a-button disabled="disabled"
                                  >批量删除</a-button
                                >
                              </template>
                            </a-space>
                          </div>
                        </div>
                      </template>
                      <template #action="{ record }">
                        <a-space :size="16">
                          <template v-if="type !== 'detail'">
                            <a-popconfirm
                              title="是否删除当前数据？"
                              cancelText="取消"
                              okText="确定"
                              @confirm.stop="cancelItem(record)"
                            >
                              <a-button
                                type="link"
                                danger="danger"
                                @click.stop=""
                                >删除</a-button
                              >
                            </a-popconfirm>
                          </template>
                          <template v-else>
                            <a disabled="disabled">删除</a></template
                          >
                        </a-space>
                      </template>
                    </a-table>
                    <a-empty
                      class="pt2"
                      v-else
                      description="请选择巡检点"
                    ></a-empty>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-form>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回 </a-button>
        <a-button type="primary" @click="submit">保存 </a-button>
      </template>
    </g-layout>
    <a-modal
      title="巡检标准"
      v-model:visible="standardVisi"
      centered="centered"
      @ok="saveStandard"
      @cancel="cancelStandard"
    >
      <a-table
        :columns="standardColModal"
        :dataSource="standardData"
        :pagination="standardPagi"
        :rowSelection="standardSelection"
        :rowKey="'id'"
        size="small"
        :customRow="modalCustomRow"
      ></a-table>
    </a-modal>
  </div>
</template>

<script lang="jsx">
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
} from "vue";
import { useRouter, useRoute } from "vue-router";
import _ from "lodash";
import { replaceObjectKeys } from "@pansy/utils";
import moment from "moment";
import { flattenTree, timeFormat } from "@/utils/common.js";
export default defineComponent({
  components: {},
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
          width: "98px",
        },
      },
      wrapperCol: {
        span: 20,
      },
    };
    const textLayout = {
      labelCol: {
        style: {
          width: "98px",
        },
      },
      wrapperCol: {
        flex: 1,
      },
    };

    const rules = {
      taskName: [
        { required: true, message: "请输入计划名称" },
        { message: "名称不超过32个字", pattern: new RegExp(/^.{1,32}$/, "g") },
      ],
      taskTypeId: [{ required: true, message: "请选择计划类型" }],
      startTime: [{ required: true, message: "请选择启用时间" }],
      taskTimeLimit: [{ required: true, message: "请填写计划时限" }],
      cycle: [{ required: true, message: "请选择计划周期" }],
      receiveTypeRule: [{ required: true, message: "请选择接收人" }],
      taskStatus: [{ required: true, message: "请选择计划状态" }],
      taskLevel: [{ required: true, message: "请选择计划级别" }],
    };

    const timeLimitRules = {
      day: [
        { required: false, message: "请输入天" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      hour: [
        { required: false, message: "请输入时" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
      minute: [
        { required: false, message: "请输入分" },
        {
          message: "请输入正整数(包含0)",
          pattern: new RegExp(/^[+]{0,1}(\d+)$/, "g"),
        },
      ],
    };

    const state = reactive({
      model: {
        taskName: "",
        taskTypeId: null,
        startTime: "",
        endTime: "",
        taskTimeLimit: "",
        cycle: false,
        receiveType: "PERSON",
        receiveTypeRule: null,
        receiveDeptIds: null,
        receivePostIds: null,
        receiveIds: [],
        taskStatus: true,
        taskLevel: null,
        remark: "",
        timeLimitModel: {
          day: 0,
          hour: 0,
          minute: 0,
        },
      },
      activeKey: "point",
      treeOptions: [],
      fieldNames: {
        children: "children",
        label: "inspectObjectName",
        key: "inspectObjectId",
      },
      standardData: [],
      checkedStandard: [],
      standardVisi: false,
      standardPagi: {
        total: 0,
        pageSize: 10,
        pageNumber: 1,
        size: "small",
      },
      standardCol: [
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
      nowSelectTree: "",
      nowSelectTreeNode: "",
      AllCheckStandardObj: {},
      unChecked: [],
    });

    const tableState = reactive({
      columns: [
        {
          dataIndex: "inspectObjectName",
          title: "对象名称",
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
          dataIndex: "inspectObjectCategory",
          title: "对象类型",
          slots: { customRender: "inspectObjectCategory" },
          customRender: ({ text }) => {
            if (text === "STALL") {
              return (
                <PopOver position="topLeft" content="档位">
                  档位
                </PopOver>
              );
            } else if (text === "POINT") {
              return (
                <PopOver position="topLeft" content="现场">
                  现场
                </PopOver>
              );
            } else if (text === "ASSET") {
              return (
                <PopOver position="topLeft" content="资产">
                  资产
                </PopOver>
              );
            }
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
          dataIndex: "addrDetail",
          title: "详细地址",
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
          dataIndex: "referObjects",
          title: "关联巡检对象",
          slots: { customRender: "referObjects" },
          ellipsis: true,
          customRender: ({ text }) => {
            if (text) {
              text = text.map((item) => item.inspectObjectName);
            } else {
              text = "";
            }
            return (
              <PopOver
                position="topLeft"
                content={text?.length ? text.join("、") : ""}
              >
                {text?.length ? text.join("、") : "--"}
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
      tableData: [],
      inspectPointType: "",
      visible: false,
      pagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      methodName: "",
      referObjectId: "",
      referObjectCategory: "",
      tableIndex: "",
      itemStandardPagi: {
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      tableStandardSelectKeys: [],
    });

    const modalState = reactive({
      modalColumns: null,
      modalTableData: null,
      modalPagination: {
        total: 0,
        pageNumber: 1,
        pageSize: 10,
        size: "small",
      },
      selectedRowKeys: [],
      connectRow: [], //关联数据集合
      modalType: "normal",
      selectedItem: [],
      preTreeFirstSelected: [],
    });

    const cycleBtn = (params) => {
      state.model.cycle = params;
    };

    const receive = (params) => {
      state.model.receiveType = params;
    };

    const openModal = (params, record) => {
      // 打开关联弹框
      if (record) {
        if (modalState.modalType === "connect") {
          // 无法关联本身
          state.unChecked = [record.inspectObjectId];
          // 当前已关联的数据的id
          const ids = record.referObjects.map((item) => item.inspectObjectId);
          modalState.selectedRowKeys = JSON.parse(JSON.stringify(ids));
          // 当前选中的关联项
          modalState.selectedItem = JSON.parse(
            JSON.stringify(record.referObjects)
          );
        }
      }
      // 打开普通弹框
      else {
        // 均可添加
        state.unChecked = [];
        // 当前已选择的普通数据
        modalState.selectedRowKeys = tableState.tableData.map(
          (item) => item.inspectObjectId
        );
        // 当前选中项的数据
        modalState.selectedItem = JSON.parse(
          JSON.stringify(tableState.tableData)
        );
      }
      tableState.inspectPointType = params;
      if (params === "POINT") {
        getinspectSpoint();
      } else if (params === "STALL") {
        getStallPoint();
      }
    };

    // 弹框表格数据--档位巡检点
    const getStallPoint = async () => {
      tableState.methodName = "getBooth";
      modalState.modalColumns = [
        { dataIndex: "name", title: "名称" },
        { dataIndex: "typeName", title: "类型" },
        { dataIndex: "areaNames", title: "所属区域" },
      ];
      tableState.visible = true;
    };

    // 弹框表格数据--现场点table
    const getinspectSpoint = async () => {
      tableState.methodName = "inspectSpoint";
      modalState.modalColumns = [
        { dataIndex: "sceneName", title: "名称" },
        { dataIndex: "sceneTypeName", title: "类型" },
        { dataIndex: "areaName", title: "所属区域" },
      ];
      tableState.visible = true;
    };

    /**
     * data 拍平分组后的表格数据
     */
    const createTreeData = async (groupTable) => {
      for (let i in groupTable) {
        const tree = { name: "", inspectObjectId: "", children: null };
        let standardIds;
        if (i === "STALL") {
          tree.inspectObjectName = "档位";
          tree.inspectObjectId = "STALL";
          tree.children = groupTable[i];
          // 给初始化的树形结构选中的标准赋值
          standardIds = await groupTable[i].map(
            (item) => item.inspectStandardIds
          );
          if (!state.AllCheckStandardObj[i]) {
            state.AllCheckStandardObj[i] = _.intersection(...standardIds);
          }
        } else if (i === "ASSET") {
          tree.inspectObjectName = "资产";
          tree.inspectObjectId = "ASSET";
          tree.children = groupTable[i];
          // 给初始化的树形结构选中的标准赋值
          standardIds = await groupTable[i].map(
            (item) => item.inspectStandardIds
          );
          if (!state.AllCheckStandardObj[i]) {
            state.AllCheckStandardObj[i] = _.intersection(...standardIds);
          }
        } else if (i === "POINT") {
          tree.inspectObjectName = "现场点";
          tree.inspectObjectId = "POINT";
          tree.children = groupTable[i];
          // 给初始化的树形结构选中的标准赋值
          standardIds = await groupTable[i].map(
            (item) => item.inspectStandardIds
          );
          if (!state.AllCheckStandardObj[i]) {
            state.AllCheckStandardObj[i] = _.intersection(...standardIds);
          }
        }
        state.treeOptions.push(tree);
      }
    };

    // 弹框确认选中--关联的数据不展示在tableState.tableData中
    const saveItem = async (item, type) => {
      // 当前选中为关联数据
      if (type === "connect") {
        // 当前点击表格已关联的当前类型的数据
        tableState.tableData[tableState.tableIndex].referObjects = item;

        // 可否重复关联-可以
        modalState.connectRow = modalState.connectRow.concat(item);
      }
      // 普通数据
      else {
        // tableState.tableData = _.cloneDeep(item);
        // 选中的id
        const checkedIds = item.map((item) => item.inspectObjectId);

        // 表格有数据
        if (tableState.tableData.length) {
          // 先将表格取消选中的数据去除
          tableState.tableData = await tableState.tableData.filter((ele) =>
            checkedIds.includes(ele.inspectObjectId)
          );
          // 表格的id
          const tableIds = tableState.tableData.map(
            (item) => item.inspectObjectId
          );
          for (let i of item) {
            // 当前选中没在表格中
            if (!tableIds.includes(i.inspectObjectId)) {
              tableState.tableData.push(i);
            }
          }
        } else {
          tableState.tableData = await _.cloneDeep(item);
        }
      }

      // 表格数据拍平--并去重(同个巡检点使用同种标准)
      const flatterData = flattenTree(tableState.tableData, "referObjects");
      const data = await _.uniqBy(flatterData, "inspectObjectId");

      // 表格数据分类--巡检点类型为标准
      const groupTable = _.groupBy(data, "inspectObjectCategory");

      // 用这表格数据拍平生成树形数据--初始化树形控件的数据
      if (!state.treeOptions.length) {
        createTreeData(groupTable);
      }
      // 更新树形控件数据
      else {
        // 获取当前数型控件一级
        const firstLevel = state.treeOptions.map(
          (item) => item.inspectObjectId
        );

        // 以表格分类为基础
        for (let i in groupTable) {
          // 一级树形已有当前分类--对比children的变化
          if (firstLevel.includes(i)) {
            // 当前分类在树形数据中的下标
            const index = state.treeOptions.findIndex(
              (item) => item.inspectObjectId === i
            );
            // 当前分类的表格选中
            const groupTableIds = groupTable[i].map(
              (item) => item.inspectObjectId
            );
            // 将树形数据中未被选中的数据去除
            for (let j of state.treeOptions[index].children) {
              // 当前树形数据没有被选中
              if (!groupTableIds.includes(j.inspectObjectId)) {
                state.treeOptions[index].children = state.treeOptions[
                  index
                ].children.filter(
                  (item) => item.inspectObjectId !== j.inspectObjectId
                );
              }
            }

            // 新树形的ids
            const newTreeChildIds = state.treeOptions[index].children.map(
              (item) => item.inspectObjectId
            );
            // 将没有的数据添加进树形数据--循环当前分类的表格选中
            for (let t of groupTable[i]) {
              // 如果当前数据不在当前分类的树形数据中,添加
              if (!newTreeChildIds.includes(t.inspectObjectId)) {
                state.treeOptions[index].children.push(t);
              }
            }
          }
          // 一级树形没有当前分类--将当前数据添加进树形结构
          else {
            const tree = { name: "", inspectObjectId: "", children: null };
            if (i === "STALL") {
              tree.inspectObjectName = "档位";
              tree.inspectObjectId = "STALL";
              tree.children = groupTable[i];
            } else if (i === "ASSET") {
              tree.inspectObjectName = "资产";
              tree.inspectObjectId = "ASSET";
              tree.children = groupTable[i];
            } else if (i === "POINT") {
              tree.inspectObjectName = "现场点";
              tree.inspectObjectId = "POINT";
              tree.children = groupTable[i];
            }
            state.treeOptions.push(tree);
          }
        }
      }

      cancelModal();
    };

    // 弹框取消,选中项还原
    const cancelModal = () => {
      modalState.modalType = "";
      tableState.tableIndex = "";
      tableState.visible = false;
    };

    // 关联巡检打开弹框
    const connect = (record, type, index) => {
      // 关联的table数据
      tableState.referObjectId = record.inspectObjectId;
      tableState.referObjectCategory = record.inspectObjectCategory;
      // 弹框的类别
      modalState.modalType = "connect";
      // 当前操作的表格下标
      tableState.tableIndex = index;
      openModal(type, record);
    };

    // 获取所有标准
    const getStandard = async (params) => {
      const getParams = {
        typeCategory: "INSPECT_STANDARD",
        ...params,
        pageNum: 1,
        pageSize: 1000,
      };
      const data = await proxy.$api.inspectStandard("get", getParams);
      if (data && data.records) {
        state.standardData = data.records;
      } else {
        state.standardData = data;
      }
    };

    const openStandard = () => {
      state.standardVisi = true;
    };

    // 标准弹框选择
    const modalSelected = (record, selectedRows) => {
      if (record instanceof Array) {
        state.standardSelectedKeys = record;
        return;
      }
      if (state.standardSelectedKeys) {
        const index = state.standardSelectedKeys.findIndex(
          (item) => item === record.id
        );

        if (index !== -1) {
          state.standardSelectedKeys.splice(index, 1);
        } else {
          state.standardSelectedKeys.push(record.id);
        }
      } else {
        state.standardSelectedKeys.push(record.id);
      }
    };

    const standardSelection = computed(() => {
      return {
        type: "checkbox",
        selectedRowKeys: unref(state.standardSelectedKeys),
        onChange: modalSelected,
      };
    });

    const modalCustomRow = (record) => {
      return {
        onClick: () => {
          modalSelected(record);
        },
      };
    };

    const selectTree = async (selectedKeys, { selected, selectedNodes, node }) => {
      // 选中当前数据
      if (selected) {
        modalState.preTreeFirstSelected = _.cloneDeep(
          state.AllCheckStandardObj[selectedKeys[0]]
        );
        // 赋值
        state.nowSelectTree = selectedKeys[0];
        state.nowSelectTreeNode = selectedNodes?.[0] ?? node;

        // 判断当前点击是否是一级树形数据
        const treeIndex = state.treeOptions.findIndex(
          (item) => item.inspectObjectId === selectedKeys[0]
        );

        // 是一级树形数据
        if (treeIndex !== -1) {
          // 判断是否为首次点击--state.AllCheckStandardObj
          // 不是首次点击
          if (_.has(state.AllCheckStandardObj, selectedKeys[0])) {
            // 当前标准数据
            state.checkedStandard = state.standardData.filter((item) =>
              state.AllCheckStandardObj[selectedKeys[0]].includes(item.id)
            );
            // 当前弹框选中
            state.standardSelectedKeys =
              state.AllCheckStandardObj[selectedKeys[0]];
          }
          // 首次点击
          else {
            state.checkedStandard = []; //选中标准为空
            state.standardSelectedKeys = []; //modal选中为空
          }
        }
        // 不是一级
        else {
          // 查询当前点击的树形数据
          const treeRow = selectedNodes?.[0] ?? node
          const checkType =
            treeRow?.props?.inspectObjectCategory ??
            treeRow?.inspectObjectCategory;
          // 获取当前类型的树形结构的子元素
          const checkedParent = state.treeOptions.filter(
            (item) => item.inspectObjectId === checkType
          );
          const checkedItem = checkedParent[0].children.filter(
            (item) => item.inspectObjectId === selectedKeys[0]
          );
          // 当前选中的子元素没有关联标准--获取公共元素赋值
          if (checkedItem[0].inspectStandardIds.length === 0) {
            checkedItem[0].inspectStandardIds =
              state.AllCheckStandardObj[checkType];
          }
          // 当前标准数据
          state.checkedStandard = await state.standardData.filter((item) =>
            checkedItem[0].inspectStandardIds.includes(item.id)
          );
          state.standardSelectedKeys = await _.cloneDeep(
            checkedItem[0].inspectStandardIds
          );
        }
      } else {
        state.nowSelectTree = "";
        state.nowSelectTreeNode = "";
      }
    };

    const saveStandard = async () => {
      state.standardVisi = false;
      // 判断当前点击是否是一级树形数据
      const treeIndex = state.treeOptions.findIndex(
        (item) => item.inspectObjectId === state.nowSelectTree
      );
      // 一级
      if (treeIndex !== -1) {
        // 当前标准数据
        state.checkedStandard = state.standardData.filter((item) =>
          state.standardSelectedKeys.includes(item.id)
        );
        // 判断当前一级下的children--并修改
        for (let i of state.treeOptions[treeIndex].children) {
          // 当前子选项没有标准
          if (!i.inspectStandardIds.length) {
            i.inspectStandardIds = _.cloneDeep(state.standardSelectedKeys);
          } else {
            // 当前子选项的标准与父级完全一致时, 修改子元素;
            // 提取当前分类下与父级标准相同的元素
            const sameArr = _.intersection(
              i.inspectStandardIds,
              modalState.preTreeFirstSelected
            );
            if (
              i.inspectStandardIds.length ===
              modalState.preTreeFirstSelected.length
            ) {
              if (
                i.inspectStandardIds.length === sameArr.length &&
                modalState.preTreeFirstSelected.length === sameArr.length
              ) {
                i.inspectStandardIds = state.standardSelectedKeys;
              }
            }
          }
        }
        // 给一级赋值
        state.AllCheckStandardObj[state.nowSelectTree] = await _.cloneDeep(
          state.standardSelectedKeys
        );
        modalState.preTreeFirstSelected = _.cloneDeep(
          state.AllCheckStandardObj[state.nowSelectTree]
        );
      }
      // 不是一级
      else {
        const parentIndex = await state.treeOptions.findIndex(
          (item) =>
            item.inspectObjectId ===
            state.nowSelectTreeNode.props.inspectObjectCategory
        );
        const childIndex = await state.treeOptions[
          parentIndex
        ].children.findIndex(
          (item) => item.inspectObjectId === state.nowSelectTree
        );

        // 树形数据赋值
        state.treeOptions[parentIndex].children[childIndex].inspectStandardIds =
          await _.cloneDeep(state.standardSelectedKeys);
        // 当前标准数据

        state.checkedStandard = state.standardData.filter((item) =>
          state.standardSelectedKeys.includes(item.id)
        );
      }
    };

    const cancelStandard = () => {};

    const goBack = () => {
      history.go(-1);
    };

    const getData = async (params) => {
      const data = await proxy.$api.inspectPlanId("get", params);
      const timeLimit = eval("(" + data.taskTimeLimit + ")");
      state.model.taskName = data.taskName; //名称
      state.model.taskTypeId = data.taskTypeId; //类型
      state.model.startTime = data.startTime; //启用时间
      state.model.endTime = data.endTime; //禁用时间
      state.model.taskTimeLimit = data.taskTimeLimit; //时限
      state.model.timeLimitModel.day = timeLimit.day; //天
      state.model.timeLimitModel.hour = timeLimit.hour; //时
      state.model.timeLimitModel.minute = timeLimit.minute; //分
      state.model.cycle = eval(data.cycle); //周期
      state.model.cronExpression = data.cronExpression; //周期
      state.model.receiveType = data.receiveType; //接收人类型
      state.model.receiveNames = data.receiveNames; //接收人
      state.model.receiveIds = data.receiveIds
        ? data.receiveIds.split(",")
        : null; //接收人类型
      state.model.receiveDeptIds = data.receiveDeptIds; //接收人部门
      state.model.receivePostIds = data.receivePostIds; //接收人岗位
      state.model.taskStatus = eval(data.taskStatus); //状态
      state.model.remark = data.remark; //备注
      if (state.model.endTime && !moment.isMoment(state.model.endTime)) {
        state.model.endTime = moment(state.model.endTime);
        moment(state.model.endTime, "YYYY-MM-DD HH:mm:ss");
      }
      if (state.model.startTime && !moment.isMoment(state.model.startTime)) {
        state.model.startTime = moment(state.model.startTime);
        moment(state.model.startTime, "YYYY-MM-DD HH:mm:ss");
      }
      if (type === "copy") {
        state.model.id = "";
        state.model.taskName += `-副本-${timeFormat(new Date())}`;
      }

      for (let i of data.objects) {
        tableState.tableData.push(i);
      }

      // 表格数据拍平--并去重(同个巡检点使用同种标准)
      const flatterData = flattenTree(tableState.tableData, "referObjects");
      const singleData = await _.uniqBy(flatterData, "inspectObjectId");

      // 表格数据构造
      const createDtable = _.groupBy(singleData, "inspectObjectCategory");

      createTreeData(createDtable);
    };

    const submit = async () => {
      if (
        state.model.timeLimitModel.day ||
        state.model.timeLimitModel.hour ||
        state.model.timeLimitModel.minute
      ) {
        state.model.taskTimeLimit = JSON.stringify(state.model.timeLimitModel);
      }
      if (
        state.model.receiveDeptIds ||
        state.model.receivePostIds ||
        state.model.receiveIds.length > 0
      ) {
        state.model.receiveTypeRule = "有值";
      }
      form.value.validate().then(async () => {
        // 将表格数据拍平
        const tableFlatten = await flattenTree(
          tableState.tableData,
          "referObjects"
        );
        for (let i in state.treeOptions) {
          // 循环树形结构的子元素--给表格数据赋值
          for (let t of state.treeOptions[i].children) {
            tableFlatten.map((item) => {
              if (item.inspectObjectId === t.inspectObjectId) {
                item.inspectStandardIds = t.inspectStandardIds;
                if (!t.inspectStandardIds.length) {
                  item.inspectStandardIds =
                    state.AllCheckStandardObj[t.inspectObjectCategory];
                }
              }
            });
          }
        }
        for (let i of tableFlatten) {
          i.inspectStandardIds = i.inspectStandardIds.join(",");
        }
        state.model["taskObjects"] = await tableFlatten;
        if (state.model.taskObjects.length === 0) {
          proxy.$message.warning("请选择巡检点配置");
          return;
        }
        await proxy.$api.addInspectPlan("post", state.model);
        proxy.$message.success("操作成功");
        goBack();
      });
    };

    const deleteItem = async (record) => {
      tableState.tableData = await tableState.tableData.filter(
        (item) => item.inspectObjectId !== record.inspectObjectId
      );
      // 拍平表格数据
      const data = flattenTree(tableState.tableData, "referObjects");
      // 表格数据分类
      const groupData = _.groupBy(data, "inspectObjectCategory");

      for (let i of state.treeOptions) {
        // 表格已无当前分组
        if (!groupData[i.inspectObjectId]) {
          // 筛选去除不需要的数据
          state.treeOptions.filter(
            (item) => item.inspectObjectId !== i.inspectObjectId
          );
          // 当前通用标准删除
          delete state.AllCheckStandardObj[i.inspectObjectId];
        }
        // 有当前分组--检查变化
        else {
          // 当前分类在表格中的元素的id合集
          const tableGroupIds = groupData[i.inspectObjectId].map(
            (item) => item.inspectObjectId
          );
          // 当前分类在树形结构的下标
          const tIndex = state.treeOptions.findIndex(
            (item) => item.inspectObjectId === i.inspectObjectId
          );
          for (let j of state.treeOptions[tIndex].children) {
            // 当前实行数据不在表格中
            if (!tableGroupIds.includes(j.inspectObjectId)) {
              state.treeOptions[tIndex].children = state.treeOptions[
                tIndex
              ].children.filter(
                (item) => item.inspectObjectId !== j.inspectObjectId
              );
            }
          }
        }
      }
    };

    const cancelItem = async (record) => {
      // 当前选中是否为一级树形数据
      const index = state.treeOptions.findIndex(
        (item) => item.inspectObjectId === state.nowSelectTree
      );
      // 当前选中一级
      if (index !== -1) {
        state.AllCheckStandardObj[state.nowSelectTree] =
          await state.AllCheckStandardObj[state.nowSelectTree].filter(
            (item) => item !== record.id
          );
        state.checkedStandard = state.standardData.filter((item) =>
          state.AllCheckStandardObj[state.nowSelectTree].includes(item.id)
        );
        for (let i of state.treeOptions[index].children) {
          // 当前子选项的标准与父级完全一致时, 修改子元素;
          // 提取当前分类下与父级标准相同的元素
          const sameArr = _.intersection(
            i.inspectStandardIds,
            modalState.preTreeFirstSelected
          );
          if (
            i.inspectStandardIds.length ===
            modalState.preTreeFirstSelected.length
          ) {
            if (
              i.inspectStandardIds.length === sameArr.length &&
              modalState.preTreeFirstSelected.length === sameArr.length
            ) {
              i.inspectStandardIds =
                state.AllCheckStandardObj[state.nowSelectTree];
            }
          }
        }
      }
      // 二级
      else {
        const parentIndex = await state.treeOptions.findIndex(
          (item) =>
            item.inspectObjectId ===
            state.nowSelectTreeNode.props.inspectObjectCategory
        );
        const childIndex = await state.treeOptions[
          parentIndex
        ].children.findIndex(
          (item) => item.inspectObjectId === state.nowSelectTree
        );
        state.treeOptions[parentIndex].children[childIndex].inspectStandardIds =
          await state.treeOptions[parentIndex].children[
            childIndex
          ].inspectStandardIds.filter((item) => item !== record.id);

        state.checkedStandard = state.standardData.filter((item) =>
          state.treeOptions[parentIndex].children[
            childIndex
          ].inspectStandardIds.includes(item.id)
        );
      }
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
      // 判断当前点击树形是否为一级
      // 当前选中是否为一级树形数据
      const index = state.treeOptions.findIndex(
        (item) => item.inspectObjectId === state.nowSelectTree
      );
      // 当前选中一级
      if (index !== -1) {
        state.AllCheckStandardObj[state.nowSelectTree] =
          await state.AllCheckStandardObj[state.nowSelectTree].filter(
            (item) => !tableState.tableStandardSelectKeys.includes(item)
          );
        state.checkedStandard = state.standardData.filter((item) =>
          state.AllCheckStandardObj[state.nowSelectTree].includes(item.id)
        );

        for await (let i of state.treeOptions[index].children) {
          // 当前子选项的标准与父级完全一致时, 修改子元素;
          // 提取当前分类下与父级标准相同的元素
          const sameArr = _.intersection(
            i.inspectStandardIds,
            modalState.preTreeFirstSelected
          );
          if (
            i.inspectStandardIds.length ===
            modalState.preTreeFirstSelected.length
          ) {
            if (
              i.inspectStandardIds.length === sameArr.length &&
              modalState.preTreeFirstSelected.length === sameArr.length
            ) {
              i.inspectStandardIds =
                state.AllCheckStandardObj[state.nowSelectTree];
            }
          }
        }
      }
      // 二级
      else {
        const parentIndex = await state.treeOptions.findIndex(
          (item) =>
            item.inspectObjectId ===
            state.nowSelectTreeNode.props.inspectObjectCategory
        );
        const childIndex = await state.treeOptions[
          parentIndex
        ].children.findIndex(
          (item) => item.inspectObjectId === state.nowSelectTree
        );
        state.treeOptions[parentIndex].children[childIndex].inspectStandardIds =
          await state.treeOptions[parentIndex].children[
            childIndex
          ].inspectStandardIds.filter(
            (item) => !tableState.tableStandardSelectKeys.includes(item)
          );

        state.checkedStandard = state.standardData.filter((item) =>
          state.treeOptions[parentIndex].children[
            childIndex
          ].inspectStandardIds.includes(item.id)
        );
      }

      tableState.tableStandardSelectKeys = [];
    };

    onMounted(() => {
      getStandard();
      if (id) {
        getData(id);
      }
    });

    return {
      ctr,
      form,
      type,
      rules,
      format,
      layout,
      timeFormat,
      textLayout,
      timeLimitRules,
      ...toRefs(state),
      ...toRefs(tableState),
      ...toRefs(modalState),
      submit,
      receive,
      cycleBtn,
      openModal,
      cancelItem,
      deleteItem,
      cancelModal,
      openStandard,
      standardSelection,
      itemStandardSelect,
      deleBatchStandard,
      modalCustomRow,
      cancelStandard,
      saveStandard,
      selectTree,
      saveItem,
      connect,
      goBack,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.content-table) {
  height: 100%;
  overflow-y: auto !important;
  padding-right: 15px;
  &::-webkit-scrollbar {
    width: 0.16rem;
    background: rgba(146, 146, 146, 0.2);
    // box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
    border-radius: 0.08rem;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(177, 177, 177);
    // box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
  }
  /*滚动条的上下两端的按钮*/
  &::-webkit-scrollbar-button {
    height: 0px;
  }
  > .ant-form.ant-form-horizontal {
    display: grid;
    @media (max-width: 1366px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1366px) and (max-width: 1600px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 1600px) {
      grid-template-columns: repeat(4, 1fr);
    }
    .ant-form {
      .ant-row.ant-form-item.ant-form-item-has-error.ant-form-item-with-help,
      .ant-row.ant-form-item.ant-form-item-has-success {
        height: 32px;
        margin: 0;
      }
    }
    .ant-form-item-control-input {
      // width: 90%;
      text-align: left;
      .ant-calendar-picker {
        width: 100%;
      }
      .formBtnCtr {
        width: 112px;
      }
      .single,
      .cycle {
        width: calc(100% - 112px);
      }
      button {
        width: 56px;
        padding: 0;
      }
      .ant-form-inline .ant-form-item {
        margin-right: 0;
      }
    }
    .ant-form-item-explain {
      text-align: left;
    }
    .ant-tree {
      text-align: left;
    }
  }
  .standard {
    display: grid;
    grid-template-columns: 1fr 3fr;
    background-color: @white;
  }
}
.timeLimitForm {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 8px;
}
.tabTop {
  background-color: #fafafa;
  font-family: @fontMedium;
  font-size: 14px;
  font-weight: 500;
}
:deep(.ant-table-title) {
  text-align: right;
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
</style>
