<template>
  <g-layout title="故障单详情">
    <template #header-btn>
      <a-button type="primary" @click="printRef.print()">打印</a-button>
    </template>
    <template #content-table>
      <g-detail-form ref="detailFormRef" :api="api" :formList="formList" :afterGet="afterGet">
        <template v-slot:edit-item>
          <div class="item-title">故障确认</div>
          <a-form-item label="确认人员">
            <span v-if="model?.confirmResult === 'CONFIRMED'">
              {{ model?.faultConfirmVO?.confirmUserName ? model?.faultConfirmVO?.confirmUserName : "--" }}
            </span>
            <span v-else>{{ model?.faultConfirmVO?.userNames?.length ? model?.faultConfirmVO?.userNames.join(",") : "--" }}</span>
          </a-form-item>
          <!-- 除待确认状态 -->
          <template v-if="model?.faultStatus !== 'WAITING_FOR_CONFIRM'">
            <a-form-item label="确认结果">
              <span>{{
                model?.faultConfirmVO?.confirmResult
                  ? model?.faultConfirmVO?.confirmResult === "CONFIRMED"
                    ? "确认故障"
                    : "暂不处理"
                  : "--"
              }}</span>
            </a-form-item>
            <a-form-item label="确认描述">
              <span>{{ model?.faultConfirmVO?.remark ? model?.faultConfirmVO?.remark : "--" }}</span>
            </a-form-item>
            <a-form-item label="确认时间">
              <span>
                {{ model?.faultConfirmVO?.confirmTime ? timeFormat(model?.faultConfirmVO?.confirmTime, true) : "--" }}
              </span>
            </a-form-item>
          </template>
          <template v-if="model && model?.faultStatus !== 'WAITING_FOR_CONFIRM'">
            <!-- 已结束,待关闭,待处理 -->
            <template v-if="model && model?.faultStatus !== 'WAITING_FOR_CONFIRM' && model?.confirmResult !== 'NO_PROCESS'">
              <div class="item-title">故障维修</div>
              <a-steps class="p1" :current="1" v-if="processInfo">
                <!-- 自定义图标 -->
                <template #progressDot="{ prefixCls }">
                  <span :class="`${prefixCls}-icon-dot`" />
                </template>
                <a-step
                  v-for="item in processInfo"
                  :key="item.id"
                  :title="`${item.taskId ? `【${item.createBy}】` : ''}${item.action}`"
                  :status="'finish'"
                >
                  <template #description>
                    <span>{{ item.createTime }}</span>
                    <a-button type="link" v-if="item.taskId" @click="detailFormId(item.id)">处理详情</a-button>
                  </template>
                </a-step>
              </a-steps>
              <a-empty v-else description="暂无流程"></a-empty>
            </template>

            <!-- 已结束,待关闭 -->
            <template
              v-if="
                model &&
                (model?.faultStatus === 'FINISHED' || model?.faultStatus === 'TO_BE_CLOSED') &&
                model?.faultConfirmVO.confirmResult !== 'NO_PROCESS'
              "
            >
              <div class="item-title">故障关闭</div>
              <!-- 待关闭,已结束 -->
              <a-form-item label="关闭人员">
                <span v-if="model?.faultStatus === 'FINISHED'">
                  {{ model?.faultClosedVO.closedUserName ? model?.faultClosedVO.closedUserName : "--" }}
                </span>
                <!-- 待关闭显示 -->
                <span v-else> {{ model?.faultClosedVO?.userNames?.length ? model?.faultClosedVO?.userNames.join("、") : "--" }}</span>
              </a-form-item>
              <a-form-item label="维修成本">{{ model.faultClosedVO ? (model.faultClosedVO?.cost ?? 0) : 0 }}元</a-form-item>
              <!-- 已结束 -->
              <template v-if="model?.faultStatus === 'FINISHED'">
                <a-form-item label="解决结果">
                  {{
                    model?.faultClosedVO?.result
                      ? model?.faultClosedVO?.result === "UNRESOLVED"
                        ? "未解决"
                        : model?.faultClosedVO?.result === "RESOLVED"
                          ? "已解决"
                          : ""
                      : "--"
                  }}
                </a-form-item>
                <a-form-item label="关闭时间">
                  {{ model?.faultClosedVO?.closedTime ? timeFormat(model?.faultClosedVO?.closedTime, true) : "--" }}
                </a-form-item>
                <a-form-item label="故障案例">
                  {{ model?.faultClosedVO.faultCaseName ? model?.faultClosedVO.faultCaseName : "--" }}
                </a-form-item>
                <a-form-item label="描述信息" class="a-form-item-100">
                  {{ model?.faultClosedVO.remark ? model?.faultClosedVO.remark : "--" }}
                </a-form-item>
                <a-form-item label="附件图片" class="a-form-item-100">
                  <template v-if="model?.faultClosedVO.files?.length">
                    <a-image-preview-group>
                      <a-image
                        v-for="item in model?.faultClosedVO.files"
                        :key="item.id"
                        :src="item.path"
                        :width="100"
                        :height="100"
                      ></a-image>
                    </a-image-preview-group>
                  </template>
                  <span v-else>--</span>
                </a-form-item>
              </template>
            </template>
          </template>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" v-if="model && model?.faultConfirmVO?.isConfirmButton" @click="openModal"> 确认故障 </a-button>
      <a-button type="primary" v-if="model && model?.faultTicketVO?.isTicketButton" @click="openOrderModal('deal')"> 故障处理 </a-button>
      <a-button type="primary" v-if="model && model?.faultClosedVO?.isClosedButton" @click="openOrderModal('close')"> 故障关闭 </a-button>
    </template>
    <!-- 故障确认 -->
    <a-modal v-model:visible="visible" title="确认故障报修" centered @ok="submit" @cancel="cancel" :confirmLoading="submitLoading">
      <a-form ref="modalForm" :model="confirmModel" :rules="rules">
        <a-form-item label="确认结果" name="confirmResult">
          <a-radio-group v-model:value="confirmModel.confirmResult">
            <a-radio :value="'CONFIRMED'">确认故障</a-radio>
            <a-radio :value="'NO_PROCESS'">暂不处理</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="业务流程" name="processInstanceId" v-if="confirmModel.confirmResult === 'CONFIRMED'">
          <!-- <a-input-group :style="{ width: '100%' }"> -->
          <g-select
            v-model:value="confirmModel.processInstanceId"
            :url="'processList'"
            :field="{ name: 'label', key: 'value' }"
            placeholder="请选择业务流程"
            :style="{ width: 'calc( 100% - 88px )' }"
          ></g-select>
          <a-button type="primary" @click="addProcess" :style="{ width: '88px' }">新增流程</a-button>
          <!-- </a-input-group> -->
        </a-form-item>
        <a-form-item label="确认描述">
          <a-textarea
            v-model:value="confirmModel.remark"
            placeholder="请输入确认描述"
            :maxlength="200"
            :autoSize="{ minRows: 2 }"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 流程详情 -->
    <a-modal v-model:visible="detailVisi" centered title="处理详情" :footer="null">
      <!-- <div class="title mb2">{{ detailForm?.formName }}</div> -->
      <a-form ref="detailInputForm">
        <a-form-item label="结果">
          <span>{{ detailForm?.operation ? detailForm.operation : "--" }}</span>
        </a-form-item>
        <a-form-item v-for="item in detailForm?.formValues" :label="item.formItemName" :name="formItemType" :key="item.formItemId">
          <span>{{ item.val }}</span>
        </a-form-item>
        <gDesignFormItem :formData="detailForm.formData" />
      </a-form>
    </a-modal>
    <!-- 故障关闭 -->
    <a-modal v-model:visible="orderVisi" centered title="故障关闭" @ok="save" @cancel="orderCancel" :confimLoading="saveLoading">
      <a-form ref="orderModalForm" :model="closeModel" :rules="modalRules">
        <a-form-item label="解决结果" name="result">
          <a-radio-group v-model:value="closeModel.result">
            <a-radio :value="'RESOLVED'">已解决</a-radio>
            <a-radio :value="'UNRESOLVED'">未解决</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="维修成本" name="cost">
          <a-input v-model:value="closeModel.cost" suffix="元" placeholder="请输入维修成本"></a-input>
        </a-form-item>
        <a-form-item label="故障类型" class="flex-start">
          <g-select
            ref="faultTypeRef"
            v-model:value="closeModel.faultTypeId"
            :style="{ width: 'calc(100% - 120px)' }"
            :url="'faultType'"
            @change-check="(value, option) => changeLabel(option, 'faultTypeName')"
            showSearch
          ></g-select>
          <a-button :style="{ width: '120px' }" type="primary" @click="drawerOpen('type')"> 新增故障类型 </a-button>
        </a-form-item>
        <a-form-item label="故障案例" class="flex-start">
          <g-select
            ref="faultCaseIdRef"
            v-model:value="closeModel.faultCaseId"
            :style="{ width: 'calc(100% - 120px)' }"
            :url="'faultCase'"
            @change-check="(value, option) => changeLabel(option, 'faultCaseName')"
            :disabled="!closeModel.faultTypeId"
            :params="{ faultTypeId: closeModel.faultTypeId }"
          ></g-select>
          <a-button :style="{ width: '120px' }" type="primary" @click="drawerOpen('case')"> 新增故障案例 </a-button>
        </a-form-item>
        <a-form-item label="描述信息">
          <a-textarea
            v-model:value="closeModel.remark"
            :maxlength="200"
            :autoSize="{
              minRows: 2,
            }"
            placeholder="描述信息"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="附件照片">
          <g-upload :file="closeModel.fileList" @changeFile="changeFile" :sceneCode="GLOBAL_SCENE_CODE.faultOrderCase"></g-upload>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 新增类型,案例 -->
    <a-drawer
      :visible="showDrawer"
      :destroyOnClose="true"
      @close="drawerClose"
      :body-style="{ paddingBottom: '55px' }"
      :title="drawerType === 'type' ? '新增故障类型' : '新增故障案例'"
      :width="drawerType === 'type' ? 350 : 700"
    >
      <a-form
        ref="drawerForm"
        :model="drawerModel"
        :rules="drawerType === 'case' ? drawerRules : drawerTypeRules"
        :labelCol="{ span: drawerType === 'type' ? 6 : 3 }"
      >
        <template v-if="drawerType === 'type'">
          <a-form-item label="类型名称" name="name">
            <a-input v-model:value="drawerModel.name" placeholder="类型名称" :maxlength="20"></a-input>
          </a-form-item>
        </template>
        <template v-else-if="drawerType === 'case'">
          <a-form-item label="案例名称" name="name">
            <a-input v-model:value="drawerModel.name" placeholder="案例名称" :maxlength="20"></a-input>
          </a-form-item>
          <a-form-item label="故障类型" name="faultTypeId">
            <g-select
              v-model:value="drawerModel.faultTypeId"
              :url="'faultType'"
              @change-check="(value, option) => getLabel(value, option, 'faultTypeName')"
            ></g-select>
          </a-form-item>
          <a-form-item label="设备类型" name="deviceTypeId">
            <g-select
              v-model:value="drawerModel.deviceTypeId"
              :url="'getGenreSearch'"
              @change-check="(value, option) => getLabel(value, option, 'deviceTypeName')"
            ></g-select>
          </a-form-item>
          <a-form-item label="故障现象" name="faultPhenomenon">
            <g-edit
              :id="'faultPhenomenon'"
              ref="faultPhenomenonInput"
              :text="drawerModel.faultPhenomenon"
              @get-html="(e) => getHtml('faultPhenomenon', e)"
              :height="200"
            ></g-edit>
          </a-form-item>
          <a-form-item label="故障原因" name="faultReason">
            <g-edit
              :id="'faultReason'"
              ref="faultReasonInput"
              :text="drawerModel.faultReason"
              @get-html="(e) => getHtml('faultReason', e)"
              :height="200"
            ></g-edit>
          </a-form-item>
          <a-form-item label="处理措施" name="treatmentMeasures">
            <g-edit
              :id="'treatmentMeasures'"
              ref="treatmentMeasuresInput"
              :text="drawerModel.treatmentMeasures"
              @get-html="(e) => getHtml('treatmentMeasures', e)"
              :height="200"
            ></g-edit>
          </a-form-item>
          <a-form-item label="附件" name="fileIds">
            <g-upload
              v-model:value="drawerModel.fileIds"
              :accept="'.jpg,.jpeg,.png,.svg,.doc'"
              :sceneCode="GLOBAL_SCENE_CODE.faultOrderCase"
            ></g-upload>
          </a-form-item>
        </template>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 3,
        }"
      >
        <a-button style="margin-right: 8px" @click="drawerClose">取消</a-button>
        <a-button type="primary" @click="drawerSubmit">保存</a-button>
      </div>
    </a-drawer>
    <a-modal
      v-model:visible="faltDealVisi"
      :model="dealModel"
      :rules="dealRules"
      centered
      title="故障处理"
      :width="520"
      @ok="faultDealSubmit"
      @cancel="faultDealCancel"
      :confirmLoading="dealLoading"
    >
      <a-spin :spinning="spinning">
        <a-form ref="newDealModelRef" :model="dealModel" :rules="dealRules">
          <template v-for="item in dealModel" :key="item.id">
            <a-form-item :label="item.label" :name="item.name" v-if="dealModel[item.name]?.type !== 'span'">
              <template v-if="dealModel[item.name]?.type === 'a-radio-group'">
                <a-radio-group v-model:value="dealModel[item.name].val">
                  <a-radio v-for="ele in dealModel[item.name]?.options" :value="ele" :key="ele">
                    {{ ele }}
                  </a-radio>
                </a-radio-group>
              </template>
            </a-form-item>
          </template>
        </a-form>
        <div style="max-height: 500px; overflow-y: scroll; overflow-y: scroll; overflow-y: overlay">
          <AntdGenerateForm
            :advanceFields="['richtext-editor', 'cascader']"
            v-if="dealInfo && dealInfo.definition"
            :data="dealInfo.definition"
            ref="generateForm"
          />
        </div>
      </a-spin>
    </a-modal>
  </g-layout>
  <PrintPage ref="printRef" />
</template>
<script lang="jsx">
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { Modal } from "ant-design-vue";
import { defineComponent, getCurrentInstance, onMounted, reactive, toRefs, watch, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import PrintPage from "./PrintPage.vue";
import { getCurrentApplicationCode } from "@/hooks/useCurrentApplication";
export default defineComponent({
  components: { PrintPage },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const drawerForm = ref();
    const printRef = ref();
    const faultTypeRef = ref();
    const generateForm = ref();
    const detailFormRef = ref();
    const newDealModelRef = ref();
    const orderModalForm = ref();
    const faultCaseIdRef = ref();
    const faultReasonInput = ref();
    const faultPhenomenonInput = ref();
    const treatmentMeasuresInput = ref();
    const state = reactive({
      api: {
        // detail: "faultId",
        detail: "faultDetailId",
      },
      model: null,
      formList: [
        {
          title: "故障信息",
          form: [
            { label: "故障单编号", value: "code" },
            { label: "故障单名称", value: "name" },
            { label: "故障对象", value: "objName" },
            { label: "故障类型", value: "faultTypeName" },
            { label: "提交人员", value: "submitter" },
            {
              label: "提交时间",
              value: "submitTime",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            {
              label: "故障时间",
              value: "faultTime",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            { label: "故障描述", value: "remark" },
            {
              label: "附件照片",
              value: "files",
              component: "a-upload",
              detailValue: "files",
              singleLine: true,
            },
          ],
        },
      ],
      confirmPerson: "",
      modalType: "",
      visible: false,
      spinning: false,
      orderVisi: false,
      showDrawer: false,
      detailVisi: false,
      faltDealVisi: false,
      dealLoading: false,
      confirmModel: {
        faultId: "",
        confirmResult: "",
        processInstanceId: "",
        remark: "",
      },
      rules: {
        confirmResult: [{ required: true, message: "请选择确认结果" }],
        processInstanceId: [{ required: true, message: "请选择业务流程" }],
      },
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      closeModel: {
        cost: "",
        result: "",
        remark: "",
        faultCaseId: "",
        faultCaseName: "",
        faultTypeId: "",
        faultTypeName: "",
        fileIds: [],
        fileList: [],
      },
      modalRules: {
        result: [{ required: true, message: "请选择解决结果" }],
        cost: [
          { required: true, message: "请输入维修成本" },
          {
            pattern: new RegExp(/^[0-9]+\d*(\.\d{0,2})?$|^0?\.\d{0,2}$/, "g"),
            message: "请输入数据为保留两位小数的正数",
          },
        ],
      },
      drawerModel: {
        name: "",
        faultTypeId: "",
        faultTypeName: "",
        deviceTypeId: "",
        deviceTypeName: "",
        // faultPhenomenon: "",
        faultPhenomenon: null,
        // faultReason: "",
        faultReason: null,
        // treatmentMeasures: "",
        treatmentMeasures: null,
        fileIds: [],
        applicationCode: getCurrentApplicationCode(),
      },
      drawerRules: {
        name: [{ required: true, message: "请输入案例名称" }],
        faultTypeId: [{ required: true, message: "请选择故障类型" }],
        deviceTypeId: [{ required: true, message: "请选择设备类型" }],
        faultPhenomenon: [{ required: true, message: "请输入故障现象" }],
        faultReason: [{ required: true, message: "请输入故障原因" }],
        treatmentMeasures: [{ required: true, message: "请输入处理措施" }],
        fileIds: [{ required: true, message: "请上传附件" }],
      },
      drawerTypeRules: {
        name: [{ required: true, message: "请输入类型名称" }],
      },
      drawerType: "",
      confirmInfo: null,
      // 流程
      processInfo: null,
      // 处理详情
      detailForm: null,
      // 生成表单的基础信息
      dealInfo: [],
      // 表单
      dealModel: {},
      // 规则
      dealRules: {},
      formId: "",
      saveLoading: false,
      submitLoading: false,
      t: null,
    });

    const goBack = () => {
      // router.push('/faultList')
      history.go(-1);
    };

    const addProcess = () => {
      history.pushState({ current: location.pathname + location.search }, "", "/portal/legacy-business-config/flowConfig");
    };

    const afterGet = (res) => {
      state.model = res;
      if (state.model.faultClosedVO && state.model.faultClosedVO.cost) {
        state.model.faultClosedVO.cost = Number(state.model.faultClosedVO.cost).toFixed(2);
      }
      if (res?.faultTicketVO?.id) {
        getProcess(res?.faultTicketVO?.id);
      }
      // // 获取表单
      // if (res?.faultTicketVO?.taskId) {
      //   getProcessInputForm(res?.faultTicketVO?.taskId);
      // }
      return res;
    };

    const openModal = () => {
      state.visible = true;
    };

    const openOrderModal = async (type) => {
      state.modalType = type;
      if (type === "close") {
        state.orderVisi = true;
      } else {
        // 获取表单
        await getProcessInputForm(state?.model?.faultTicketVO?.taskId);
        if (state.dealInfo) {
          state.faltDealVisi = true;
        }
      }
    };

    const goPage = () => {
      router.push({
        path: "/faultOrderDetails",
        query: {
          id: state.confirmInfo.ticketId,
          type: "detail",
          faultId: state.confirmInfo.faultId,
        },
      });
    };

    // 故障单确认 {

    // 故障单确认
    const submit = () => {
      modalForm.value.validate().then(() => {
        state.submitLoading = true;
        proxy.$api
          .faultConfirm(state.confirmModel, "put")
          .then(() => {
            proxy.$message.success("操作成功");
            detailFormRef.value.getData();
            cancel();
            state.submitLoading = false;
          })
          .catch(() => {
            state.submitLoading = false;
          });
      });
    };
    // 故障单取消
    const cancel = () => {
      state.confirmModel = {
        hiddenDangerCategoryId: "",
        hiddenDangerCategoryName: "",
        hiddenDangerTypeId: "",
        hiddenDangerTypeName: "",
        hiddenDangerLevelId: "",
        hiddenDangerLevelName: "",
        confirmResult: "",
        limitTime: "",
        limitTimeType: "hour",
        processInstanceId: "",
        processInstanceName: "",
        remark: "",
      };
      state.confirmModel.faultId = route.query.id;
      modalForm.value.resetFields();
      state.visible = false;
    };

    const changeUnit = () => {
      const base = state.confirmModel.limitTimeType;
      state.confirmModel.limitTimeType = base === "hour" ? "day" : "hour";
    };

    const changeLabel = (option, type) => {
      // state.confirmModel[type] = option.label;
      state.closeModel[type] = option.label;
    };

    //}

    // 工单处理 {

    const detailFormId = async (record) => {
      state.formId = record;
      getForm();
    };

    // 获取工单流程
    const getProcess = (id) => {
      const params = {
        businessType: "FAULT",
        businessKey: id,
      };
      proxy.$api.process(params, "get").then((res) => {
        state.processInfo = res;
      });
    };

    // 获取工单处理详情
    const getForm = () => {
      proxy.$api.processForm(state.formId, "get").then((res) => {
        state.detailForm = res;
        if (res) {
          state.detailVisi = true;
        } else {
          proxy.$message.warn("暂无详情");
        }
      });
    };

    // 获取表单数据
    const getProcessInputForm = (id) => {
      state.spinning = true;
      id
        ? proxy.$api.processInputForm(id).then((res) => {
            state.dealInfo = res;
            if (res) {
              setForm();
            }
            state.spinning = false;
          })
        : null;
    };
    // 生成表单
    const setForm = () => {
      state.dealInfo.definition = state.dealInfo.definition ? JSON.parse(state.dealInfo.definition) : "";
      Object.assign(state.dealModel, {
        actions: {
          type: "a-radio-group",
          options: state.dealInfo.actions,
          // val: state.dealInfo.actions[0],
          val: "",
          label: "处理结果",
          name: "actions",
        },
        formId: { val: state.dealInfo.id, type: "span", name: "formId" },
      });
      Object.assign(state.dealRules, {
        actions: [
          {
            required: true,
            message: "",
          },
          {
            validator(rule, value) {
              if (value.val) {
                return Promise.resolve();
              } else {
                return Promise.reject("请选择处理结果");
              }
            },
          },
        ],
      });
    };

    const save = () => {
      orderModalForm.value.validate().then(() => {
        state.saveLoading = true;
        const params = {
          ...state.closeModel,
          faultId: route.query.id,
        };
        proxy.$api
          .faultOrderClose(params, "put")
          .then(() => {
            proxy.$message.success("操作成功");
            goBack();
            state.saveLoading = false;
          })
          .catch(() => {
            state.saveLoading = false;
          });
      });
    };

    const orderCancel = async () => {
      await newDealModelRef.value?.resetFields();
      await orderModalForm.value?.resetFields();
      state.closeModel.cost = "";
      state.closeModel.remark = "";
      state.closeModel.faultCaseId = null;
      state.closeModel.faultCaseName = "";
      state.closeModel.faultTypeId = null;
      state.closeModel.faultTypeName = "";
      state.closeModel.fileIds = [];
      state.closeModel.fileList = [];
      state.orderVisi = false;
      state.dealModel = {};
      state.dealRules = {};
    };

    // 新工单处理
    const faultDealCancel = async () => {
      await newDealModelRef.value.resetFields();
      state.faltDealVisi = false;
    };

    const faultDealSubmit = () => {
      if (state.dealInfo.definition) {
        generateForm.value.generateForm
          .validate()
          .then(() => {
            newDealModelRef.value.validate().then(() => {
              //自定义表单验证
              generateForm.value.getData().then((res) => {
                const list = [];
                // for (let i in state.dealModel) {
                //   if (i !== "actions" && i !== "formId") {
                //     const param = {
                //       formItemId: state.dealModel[i].formItemId,
                //       val: state.dealModel[i].val,
                //     };
                //     list.push(param);
                //   }
                // }
                generateForm.value.data.list.forEach((item) => {
                  let value = res[item.model] ? res[item.model] : "";
                  if (item.type === "date") {
                    value = timeFormat(value, false);
                  }
                  if (item.type === "rate") {
                    value = value ? value : 0;
                  }
                  list.push({
                    //与app约定的传参内容
                    label: item.label,
                    key: item.model,
                    value:
                      item.options.mode === "multiple" || item.type === "checkbox"
                        ? JSON.stringify(value)
                        : !value || value.length === 0
                          ? ""
                          : value,
                    formItemType: item.type,
                    options: item.options.options ? JSON.stringify(item.options.options) : "",
                    mode: item.options.mode ? item.options.mode : "",
                    remoteFunc: item.options.remoteFunc ? item.options.remoteFunc : "",
                    remote: item.options.remoteFunc ? item.options.remote : false,
                    controlType: item.controlType ? item.controlType : "BUSINESS_CONTROL",
                  });
                });
                const params = {
                  taskId: state.model.faultTicketVO?.taskId,
                  outcome: state.dealModel.actions.val,
                  formValueModifyParam: {
                    processId: state.model.faultTicketVO?.taskId,
                    formId: state.dealModel.formId.val,
                    // formValues: list,
                    formData: list,
                  },
                };
                proxy.$api.processComplete(params, "post").then(() => {
                  proxy.$message.success("操作成功");
                  detailFormRef.value.getData();
                  faultDealCancel();
                });
              });
            });
          })
          .catch(() => {
            newDealModelRef.value.validate();
          });
      } else {
        const params = {
          taskId: state.model.faultTicketVO?.taskId,
          outcome: state.dealModel.actions.val,
          formValueModifyParam: {
            processId: state.model.faultTicketVO?.taskId,
            formId: state.dealModel.formId.val,
            formData: [],
          },
        };
        proxy.$api.processComplete(params, "post").then(() => {
          proxy.$message.success("操作成功");
          detailFormRef.value.getData();
          faultDealCancel();
        });
      }
    };

    //}

    // 侧边弹窗操作 {
    const drawerOpen = (type) => {
      state.drawerType = type;
      state.showDrawer = true;
    };

    const drawerClose = async () => {
      drawerForm.value.resetFields();
      state.showDrawer = false;
    };

    const drawerSubmit = () => {
      drawerForm.value.validate().then(() => {
        state.drawerType === "type"
          ? proxy.$api.faultTypeAdd(state.drawerModel, "post").then(async () => {
              proxy.$message.success("操作成功");
              await faultTypeRef.value.getData();
              drawerClose();
            })
          : proxy.$api
              .faultCaseAdd(
                {
                  ...state.drawerModel,
                  fileIds: state.drawerModel.fileIds.split(","),
                },
                "post",
              )
              .then(async () => {
                proxy.$message.success("操作成功");
                await faultCaseIdRef.value.getData();
                drawerClose();
              });
      });
    };

    const getHtml = (key, e) => {
      state.drawerModel[key] = e;
      drawerForm.value.validateFields(key);
    };
    const getLabel = (value, option, key) => {
      state.drawerModel[key] = option.label;
    };

    // }

    const changeFile = (data) => {
      state.closeModel.fileIds = data;
    };

    onMounted(() => {
      state.confirmModel.faultId = route.query.id;
    });

    watch(
      () => state.closeModel.faultTypeId,
      (n) => {
        if (state.t) {
          clearTimeout(state.t);
        }
        state.t = setTimeout(() => {
          faultCaseIdRef.value.getData({
            faultTypeId: state.closeModel.faultTypeId,
          });
        }, 400);
      },
    );

    return {
      modalForm,
      drawerForm,
      faultTypeRef,
      generateForm,
      detailFormRef,
      orderModalForm,
      faultCaseIdRef,
      newDealModelRef,
      faultReasonInput,
      faultPhenomenonInput,
      treatmentMeasuresInput,
      ...toRefs(state),
      faultDealCancel,
      faultDealSubmit,
      openOrderModal,
      detailFormId,
      drawerSubmit,
      drawerClose,
      changeLabel,
      orderCancel,
      changeFile,
      drawerOpen,
      changeUnit,
      timeFormat,
      addProcess,
      openModal,
      printRef,
      afterGet,
      getLabel,
      getHtml,
      goPage,
      goBack,
      submit,
      cancel,
      save,
      GLOBAL_SCENE_CODE,
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

:deep(.ant-spin-container) {
  max-height: 500px !important;
  overflow-y: auto;
  padding-right: 16px;
}
</style>
