<template>
  <g-layout title="更新改造单详情">
    <template #content-table>
      <g-renovation-details-form
        ref="detailFormRef"
        :api="api"
        :formList="formList"
        :afterGet="afterGet"
      >
        <template v-slot:attributeList="{ record }">
          <template v-if="record?.length">
            <div class="attributeList">
              <div
              class="attributeList-status"
              :class="model.deviceStatus === 'OFFLINE' ? 'abnormal' : 'normal'"
            >
              {{ model.deviceStatusName }}
            </div>
            <div v-for="item in record" :key="item.id" class="flex-start">
              <div>{{ item.name ? item.name : "--" }}：</div>
              <span :class="[item.isNormal ? 'normal' : 'abnormal', 'pr2']">
                {{ item.isNormal ? "正常" : "异常" }}
              </span>
              <div>{{ item.value ? item.value : "--" }}</div>
            </div>
            </div>
            
          </template>
          <span v-else>--</span>
        </template>
        <template v-slot:edit-item>
          <div class="item-title">改造确认</div>
          <a-form-item label="确认人员">
            <template v-if="model?.status !== 'WAITING_FOR_CONFIRM'">
              <span>
                {{
                  model?.confirmInfo?.confirmUser
                    ? model?.confirmInfo?.confirmUser
                    : "--"
                }}
              </span>
            </template>
            <template v-else>
              <span>
                {{
                  model?.waitConfirmUsers?.length
                    ? model.waitConfirmUsers.join(",")
                    : "--"
                }}
              </span>
            </template>
          </a-form-item>
          <template v-if="model?.status !== 'WAITING_FOR_CONFIRM'">
            <a-form-item label="确认结果">
              <span>
                {{
                  model?.confirmInfo?.confirmResult
                    ? model?.confirmInfo?.confirmResult
                    : "--"
                }}
              </span>
            </a-form-item>
            <a-form-item label="确认时间">
              <span>
                {{
                  model?.confirmInfo?.confirmTime
                    ? timeFormat(model?.confirmInfo.confirmTime, true)
                    : "--"
                }}
              </span>
            </a-form-item>
            <a-form-item label="确认描述">
              <span>
                {{
                  model?.confirmInfo?.description
                    ? model?.confirmInfo?.description
                    : "--"
                }}
              </span>
            </a-form-item>
          </template>
          <!-- <template> -->
          <div class="item-title" v-if="formModel?.processEventList">
            改造处理
          </div>
          <a-form-item class="a-form-item-100">
            <a-spin :spinning="spinning">
              <a-steps class="p1" :current="1">
                <!-- 自定义图标 -->
                <template #progressDot="{ prefixCls }">
                  <span :class="`${prefixCls}-icon-dot`" />
                </template>
                <a-step
                  v-for="item in formModel?.processEventList"
                  :key="item.id"
                  :title="`${item.taskId ? `【${item.createBy}】` : ''}${
                    item.action
                  }`"
                  :status="'finish'"
                >
                  <template #description>
                    <span>{{ item.createTime }}</span>
                    <a-button
                      type="link"
                      v-if="item.taskId"
                      @click="detailFormId(item.id)"
                      >处理详情</a-button
                    >
                  </template>
                </a-step>
              </a-steps>
            </a-spin>
          </a-form-item>
          <!-- </template> -->

          <!-- 评估 -->
          <template v-if="formModel?.retrofitTicketStatus === 'ASSESSMENTED'">
            <div class="item-title">改造评估</div>
            <a-form-item label="效果评估">
              <a-rate
                v-if="formModel?.assessment.score"
                :value="formModel?.assessment.score"
                disabled
              ></a-rate>
              <span v-else>--</span>
            </a-form-item>
            <a-form-item label="评估描述">
              <span>
                {{
                  formModel?.assessment?.description
                    ? formModel?.assessment?.description
                    : "--"
                }}
              </span>
            </a-form-item>
            <a-form-item label="评估附件" class="a-form-item-100">
              <a-image-preview-group
                v-if="formModel?.assessment.imageList?.length"
              >
                <a-image
                  v-for="item in formModel?.assessment.imageList"
                  :key="item.id"
                  :src="item.path"
                  :width="100"
                  :height="100"
                ></a-image>
              </a-image-preview-group>
              <span v-else>--</span>
            </a-form-item>
            <!-- <a-form-item label="改造前状态" class="a-form-item-100">
              <div v-if="formModel?.assessment.preAttribute">
                <template
                  v-for="item in formModel?.assessment.preAttribute"
                  :key="item.id"
                >
                  <div class="flex">
                    <span>{{ item.name ? item.name : "--" }}：</span>
                    <span
                      :class="[item.isNormal ? 'normal' : 'abnormal', 'pr2']"
                    >
                      {{ item.isNormal ? "正常" : "异常" }}
                    </span>
                    <span>{{ item.value ? item.value : "--" }}</span>
                  </div>
                </template>
              </div>
              <div v-else>--</div>
            </a-form-item> -->
            <a-form-item label="改造后状态" class="a-form-item-100">
              <div
                :class="
                  formModel?.assessment?.afterDeviceStatus === 'OFFLINE'
                    ? 'abnormal'
                    : 'normal'
                "
              >
                {{
                  formModel?.assessment?.afterDeviceStatus === "OFFLINE"
                    ? "离线"
                    : "在线"
                }}
              </div>
              <div v-if="formModel?.assessment.afterAttribute">
                <template
                  v-for="item in formModel?.assessment.afterAttribute"
                  :key="item.id"
                >
                  <div class="flex">
                    <span>{{ item.name ? item.name : "--" }}：</span>
                    <span
                      :class="[item.isNormal ? 'normal' : 'abnormal', 'pr2']"
                    >
                      {{ item.isNormal ? "正常" : "异常" }}
                    </span>
                    <span>{{ item.value ? item.value : "--" }}</span>
                  </div>
                </template>
              </div>
              <div v-else>--</div>
            </a-form-item>
          </template>
          <template v-if="model?.status === 'WAITING_FOR_ASSESSMENT'">
            <div class="item-title">改造评估</div>
            <a-form-item label="评估人员">
              <span>{{
                model?.waitConfirmUsers?.length
                  ? model?.waitConfirmUsers.join(",")
                  : "--"
              }}</span>
            </a-form-item>
          </template>
        </template>
      </g-renovation-details-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button type="primary" v-if="model?.isCanConfirm" @click="openModal">
        确认维修
      </a-button>
      <a-button
        type="primary"
        v-if="model?.isCanHandle"
        @click="openOrder"
        :loading="dealLoading"
      >
        改造处理
      </a-button>
      <a-button
        type="primary"
        v-if="model?.isCanAssessmented"
        @click="openOrder"
        :loading="dealLoading"
      >
        改造评估
      </a-button>
    </template>
    <a-modal
      v-model:visible="visible"
      title="确认更新改造"
      centered
      @ok="submit"
      @cancel="confirmCancel"
    >
      <a-form ref="modalForm" :model="confirmModel" :rules="rules">
        <a-form-item label="确认结果" name="result">
          <a-radio-group v-model:value="confirmModel.result">
            <a-radio :value="'CONFIRM_RETROFIT'">确认维修</a-radio>
            <a-radio :value="'NO_PROCESS'">暂不处理</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="业务流程"
          name="processDefinitionId"
          v-if="confirmModel.result === 'CONFIRM_RETROFIT'"
        >
          <g-select
            v-model:value="confirmModel.processDefinitionId"
            :url="'process'"
            :field="{ name: 'label', key: 'value' }"
            placeholder="请选择业务流程"
            @change-label="
              (option) => changeLabel(option, 'processInstanceName')
            "
          ></g-select>
        </a-form-item>
        <a-form-item label="确认描述">
          <a-textarea
            v-model:value="confirmModel.description"
            placeholder="请输入确认描述"
            :maxLength="200"
            :autoSize="{ minRows: 2 }"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="orderModalVisi"
      centered
      :title="model?.isCanHandle ? '改造处理' : '改造评估'"
      @ok="save"
      @cancel="cancel"
      :confirmLodaing="loading"
    >
      <a-spin :spinning="spinning">
        <template v-if="model?.isCanAssessmented">
          <a-form ref="modalForm" :model="asseModel" :rules="asseModelRules">
            <a-form-item label="效果评估" name="score">
              <a-rate v-model:value="asseModel.score" />
            </a-form-item>
            <a-form-item label="评估描述">
              <a-textarea
                v-model:value="asseModel.description"
                :maxLength="200"
                :autoSize="{
                  minRows: 2,
                }"
                placeholder="评估描述"
              ></a-textarea>
            </a-form-item>
            <a-form-item label="评估附件">
              <g-upload
                :file="asseModel.imageList"
                @changeFile="changeFile"
                :businessKey="'maintain'"
              ></g-upload>
            </a-form-item>
            <a-form-item label="评估设备">
              <span>
                {{
                  deviceInfo?.deviceInstanceName
                    ? deviceInfo?.deviceInstanceName
                    : "--"
                }}</span
              >
            </a-form-item>
            <a-form-item label="设备状态">
              <span
                :class="[
                  deviceInfo?.attributeStatus?.key === 'OFFLINE'
                    ? 'abnormal'
                    : 'normal',
                ]"
              >
                {{
                  deviceInfo?.attributeStatus?.value
                    ? deviceInfo?.attributeStatus?.value
                    : "--"
                }}
              </span>
            </a-form-item>
            <a-form-item label="设备属性">
              <div class="deviceAttrCtr">
                <template
                  v-for="item in deviceInfo.attributeValues"
                  :key="item.id"
                >
                  <div class="flex-start mb2">
                    <span>{{ item.name }}：</span>
                    <span>
                      <a-radio-group v-model:value="item.isNormal">
                        <a-radio :value="true">正常</a-radio>
                        <a-radio :value="false">异常</a-radio>
                      </a-radio-group>
                    </span>
                    <span :style="{ flex: 1 }">
                      <template
                        v-if="item?.selectAbleAttributeStatuses?.length"
                      >
                        <g-select
                          v-model:value="item.value"
                          :options="item.selectAbleAttributeStatuses"
                          :field="{ value: 'value' }"
                        ></g-select>
                      </template>
                      <a-input v-else v-model:value="item.value"></a-input>
                    </span>
                  </div>
                </template>
              </div>
            </a-form-item>
          </a-form>
        </template>
        <template v-else>
          <a-form ref="modalForm" :model="dealModel" :rules="dealRules">
            <template v-for="item in dealModel" :key="item.id">
              <a-form-item
                :label="item.label"
                :name="item.name"
                v-if="dealModel[item.name]?.type !== 'span'"
              >
                <template v-if="dealModel[item.name]?.type === 'a-radio-group'">
                  <a-radio-group v-model:value="dealModel[item.name].val">
                    <a-radio
                      v-for="ele in dealModel[item.name]?.options"
                      :value="ele"
                      :key="ele"
                      >{{ ele }}</a-radio
                    >
                  </a-radio-group>
                </template>
              </a-form-item>
            </template>
          </a-form>
          <div style="max-height:500px;overflow-y: scroll;overflow-y: scroll;overflow-y: overlay;">
            <AntdGenerateForm
            :advanceFields="['richtext-editor', 'cascader']"
            v-if="dealInfo && dealInfo.definition"
            :data="dealInfo.definition"
            ref="generateForm"
          />
          </div>
        </template>
      </a-spin>
    </a-modal>
    <a-modal
      v-model:visible="detailVisi"
      centered
      title="处理详情"
      :footer="null"
    >
      <!-- <div class="title mb2">{{ detailForm?.formName }}</div> -->
      <a-form ref="detailInputForm">
        <a-form-item
          v-for="item in detailForm?.formValues"
          :label="item.formItemName"
          :name="formItemType"
          :key="item.formItemId"
        >
          <span>{{ item.val }}</span>
        </a-form-item>
        <a-form-item label="结果">
          {{ detailForm?.operation }}
        </a-form-item>
        <gDesignFormItem :formData="detailForm.formData" />
      </a-form>
    </a-modal>
  </g-layout>
</template>
<script lang="jsx">
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import gRenovationDetailsForm from "../../../components/Common/gRenovationDetailsForm.vue";
export default defineComponent({
  components: { gRenovationDetailsForm },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const generateForm = ref();
    const detailFormRef = ref();
    const state = reactive({
      api: {
        detail: "renovationId",
      },
      model: null,
      formModel: null,
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "编号", value: "code" },
            { label: "改造单名称", value: "name" },
            { label: "改造对象", value: "retrofitObjectName" },
            { label: "期望解决日期", value: "expectSolveDate" },
            { label: "提交人", value: "submitUserName" },
            {
              label: "提交时间",
              value: "submitDate",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            { label: "状态", value: "statusName" },
            { label: "申报理由", value: "reason" },
            {
              label: "附件照片",
              value: "images",
              component: "a-upload",
              detailValue: "images",
              singleLine: true,
            },
            {
              label: "改造前状态",
              value: "attributeList",
              slot: true,
              singleLine: true,
            },
          ],
        },
      ],
      confirmPerson: "",
      visible: false,
      loading: false,
      spinning: false,
      detailVisi: false,
      dealLoading: false,
      orderModalVisi: false,
      confirmModel: {
        retrofitReceiptId: "",
        processDefinitionId: "",
        result: "",
        description: "",
      },
      rules: {
        result: [{ required: true, message: "请选择确认结果" }],
        processDefinitionId: [{ required: true, message: "请选择业务流程" }],
      },
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      confirmInfo: null,
      asseModel: {
        score: "",
        imageList: [],
        attributes: [],
        imageIdList: [],
      },
      asseModelRules: {
        score: [{ required: true, message: "请填写评估结果" }],
      },
      formId: "",
      detailForm: null,
      dealInfo: null,
      dealModel: {},
      dealRules: {},
      deviceInfo: {},
    });

    const goBack = () => {
      history.go(-1);
    };

    const afterGet = (res) => {
      state.model = res;
      // 获取流程信息
      if (res?.confirmInfo?.ticketId) {
        // 获取工单详情
        getOrderDetail(res?.confirmInfo?.ticketId);
      }
      return res;
    };

    const getOrderDetail = (id) => {
      state.spinning = true;
      state.dealLoading = true;
      proxy.$api.renovationOrderId(id, "get").then((res) => {
        state.formModel = res;
        state.spinning = false;
        state.dealLoading = false;
      });
    };

    const openModal = () => {
      state.visible = true;
    };

    const submit = () => {
      modalForm.value.validate().then(() => {
        proxy.$api.renovationConfirm(state.confirmModel, "post").then(() => {
          proxy.$message.success("操作成功");
          detailFormRef.value.getData();
          confirmCancel();
        });
      });
    };

    const confirmCancel = () => {
      state.confirmModel = {
        result: "",
        processDefinitionId: null,
        remark: "",
      };
      state.confirmModel.retrofitReceiptId = route.query.id;
      modalForm.value.resetFields();
      state.visible = false;
    };

    const changeLabel = (option, type) => {
      state.confirmModel[type] = option.label;
    };

    const openOrder = async () => {
      if (state?.model?.isCanHandle) {
        getProcessInputForm(
          state?.formModel.taskId
            ? state?.formModel.taskId
            : state.model.confirmInfo.taskId
        );
      } else if (state?.model?.isCanAssessmented) {
        proxy.$api
          .deviceRunInfo(state.formModel.deviceInstanceId)
          .then((res) => {
            state.deviceInfo = res;
            state.orderModalVisi = true;
          });
      } else {
        proxy.$api
          .deviceRunInfo(state.formModel.deviceInstanceId)
          .then((res) => {
            state.deviceInfo = res;
            state.orderModalVisi = true;
          });
      }
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        state.loading = true;
        // 评估
        if (state.model?.isCanAssessmented) {
          state.asseModel.attributes = [];
          for (let i of state.deviceInfo?.attributeValues) {
            state.asseModel.attributes.push({
              id: i.id,
              isNormal: i.isNormal,
              value: i.value,
              name: i.name,
            });
          }
          const params = {
            ...state.asseModel,
            deviceInstanceStatus: state.deviceInfo.attributeStatusEnum,
            retrofitTicketId: state.formModel?.id,
          };
          proxy.$api.renovationOrderAsse(params, "post").then(() => {
            proxy.$message.success("操作成功");
            goBack();
            state.loading = false;
          });
        } else {
          if (state.dealInfo.definition) {
            generateForm.value.generateForm.validate().then(() => {
              generateForm.value.getData().then((res) => {
                const list = [];
                generateForm.value.data.list.forEach((item) => {
                  let value = res[item.model] ? res[item.model] : "";
                  if (item.type === "date") {
                    value = timeFormat(value, false);
                  }
                  if (item.type === "rate") {
                    value = value ? value : 0;
                  }
                  list.push({
                    label: item.label,
                    key: item.model,
                    value:item.options.mode ==='multiple'|| item.type === 'checkbox'? JSON.stringify(value):(!value||value.length===0?'':value),
                    formItemType: item.type,
                    options: item.options.options
                      ? JSON.stringify(item.options.options)
                      : "",
                    mode: item.options.mode ? item.options.mode : "",
                    remoteFunc: item.options.remoteFunc
                      ? item.options.remoteFunc
                      : "",
                    remote: item.options.remoteFunc
                      ? item.options.remote
                      : false,
                    controlType: item.controlType
                      ? item.controlType
                      : "BUSINESS_CONTROL",
                  });
                });
                const params = {
                  taskId: state?.formModel.taskId
                    ? state?.formModel.taskId
                    : state.model.confirmInfo.taskId,
                  outcome: state.dealModel.actions.val,
                  formValueModifyParam: {
                    processId: state?.formModel.taskId
                      ? state?.formModel.taskId
                      : state.model.confirmInfo.taskId,
                    formId: state.dealModel.formId.val,
                    formData: list,
                  },
                };
                proxy.$api.processComplete(params, "post").then(() => {
                  proxy.$message.success("操作成功");
                  detailFormRef.value.getData();
                  cancel();
                  state.loading = false;
                });
              });
            });
          } else {
            const params = {
              taskId: state?.formModel.taskId
                ? state?.formModel.taskId
                : state.model.confirmInfo.taskId,
              outcome: state.dealModel.actions.val,
              formValueModifyParam: {
                processId: state?.formModel.taskId
                  ? state?.formModel.taskId
                  : state.model.confirmInfo.taskId,
                formId: state.dealModel.formId.val,
                formData: [],
              },
            };
            proxy.$api.processComplete(params, "post").then(() => {
              proxy.$message.success("操作成功");
              detailFormRef.value.getData();
              cancel();
              state.loading = false;
            });
          }
        }
      });
    };

    const cancel = async () => {
      await modalForm.value.resetFields();
      state.orderModalVisi = false;
      state.asseModel = {
        score: "",
        imageList: [],
        attributes: [],
        imageIdList: [],
      };
      state.dealModel = {};
      state.dealRules = {};
    };

    const detailFormId = (record) => {
      state.formId = record;
      getForm();
    };

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

    const getProcessInputForm = (id) => {
      state.spinning = true;
      state.loading = true;
      proxy.$api
        .processInputForm(id)
        .then((res) => {
          state.dealInfo = res;
          if (res) {
            setForm();
            state.orderModalVisi = true;
          } else {
            proxy.$message.warn("暂无处理表单");
          }
          state.spinning = false;
          state.loading = false;
        })
        .catch(() => {
          state.spinning = false;
          state.loading = false;
        });
    };

    const setForm = () => {
      state.dealInfo.definition = state.dealInfo.definition
        ? JSON.parse(state.dealInfo.definition)
        : "";
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

    const changeFile = (value) => {
      state.asseModel.imageIdList = value;
    };

    onMounted(() => {
      state.confirmModel.retrofitReceiptId = route.query.id;
    });

    return {
      modalForm,
      generateForm,
      detailFormRef,
      ...toRefs(state),
      confirmCancel,
      detailFormId,
      changeLabel,
      timeFormat,
      changeFile,
      openModal,
      openOrder,
      afterGet,
      goBack,
      submit,
      cancel,
      save,
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
.attributeList{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  >div{
    width: 200px;
  }
  .attributeList-status{
    margin-right: 10px;
  }
  .flex-start{
    margin-right: 10px;
  }
}
</style>
