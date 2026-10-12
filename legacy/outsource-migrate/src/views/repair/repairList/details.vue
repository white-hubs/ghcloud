<template>
  <div ref="ctr" class="ctr">
    <g-layout title="委外维修单详情">
      <template #content-table>
        <g-detail-form
          ref="detailFormRef"
          :api="api"
          :formList="formList"
          :afterGet="afterGet"
        >
          <template v-slot:edit-item>
            <div class="item-title">委外确认</div>
            <a-form-item label="确认人员">
              <template v-if="model?.status == 'WAITING_FOR_CONFIRM'">
                <span>{{
                  model?.waitConfirmUsers?.length
                    ? model?.waitConfirmUsers.map((item) => item.name).join(",")
                    : "--"
                }}</span>
              </template>
              <span v-else>{{
                model?.confirmInfo?.confirmUsername
                  ? model?.confirmInfo.confirmUsername
                  : "--"
              }}</span>
            </a-form-item>
            <template v-if="model?.status !== 'WAITING_FOR_CONFIRM'">
              <a-form-item label="确认结果">
                <span>
                  {{
                    model?.confirmInfo?.confirmResult
                      ? model?.confirmInfo?.confirmResult === "CONFIRM_REPAIR"
                        ? "确认维修"
                        : "暂不处理"
                      : "--"
                  }}
                </span>
              </a-form-item>
              <a-form-item label="确认时间">
                <span>
                  {{
                    model?.confirmInfo?.confirmTime
                      ? model?.confirmInfo?.confirmTime
                      : "--"
                  }}
                </span>
              </a-form-item>
              <template
                v-if="model?.confirmInfo?.confirmResult !== 'NO_PROCESS'"
              >
                <a-form-item label="委外单位">
                  <span>
                    {{
                      model?.confirmInfo?.outsourceCompanyName
                        ? model?.confirmInfo?.outsourceCompanyName
                        : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="委外模式">
                  <span>
                    {{
                      model?.confirmInfo?.outsourceModelName
                        ? model?.confirmInfo?.outsourceModelName
                        : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="申请流程">
                  <span>
                    {{
                      model?.confirmInfo?.applicationCheckProcessName
                        ? model?.confirmInfo?.applicationCheckProcessName
                        : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="验收流程">
                  <span>
                    {{
                      model?.confirmInfo?.acceptanceProcessName
                        ? model?.confirmInfo?.acceptanceProcessName
                        : "--"
                    }}
                  </span>
                </a-form-item>
              </template>
              <a-form-item label="描述信息" class="a-form-item-100">
                <span>
                  {{
                    model?.confirmInfo?.outsourceModelName
                      ? model?.confirmInfo?.outsourceModelName
                      : "--"
                  }}
                </span>
              </a-form-item>
            </template>

            <!-- 已结束,待评价,待验收,待处理 -->
            <template
              v-if="
                model?.status !== 'WAITING_FOR_CONFIRM' &&
                model?.confirmInfo?.confirmResult !== 'NO_PROCESS'
              "
            >
              <div class="item-title">维修申请</div>
              <a-steps v-if="checkProcessEvent?.length">
                <template #progressDot="{ index, status, prefixCls }">
                  <a-popover>
                    <template #content>
                      <span>step {{ index }} status: {{ status }}</span>
                    </template>
                    <span :class="`${prefixCls}-icon-dot`" />
                  </a-popover>
                </template>
                <template v-for="item in checkProcessEvent" :key="item.id">
                  <a-step
                    :title="`${item.taskId ? `${item.createBy}` : ''}【${
                      item.action
                    }】`"
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
                </template>
              </a-steps>
              <a-empty v-else description="暂无维修申请流程"></a-empty>
              <template v-if="model?.status !== 'WAITING_FOR_CHECK'">
                <div class="item-title">维修处理</div>
                <a-steps v-if="handleProcessEvent?.length">
                  <template #progressDot="{ prefixCls }">
                    <span :class="`${prefixCls}-icon-dot`" />
                  </template>
                  <template v-for="item in handleProcessEvent" :key="item.id">
                    <a-step
                      :title="`${item.taskId ? `${item.createBy}` : ''}【${
                        item.action
                      }】`"
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
                  </template>
                </a-steps>
                <a-empty v-else description="暂无维修处理流程"></a-empty>
                <template
                  v-if="
                    model?.status !== 'WAITING_FOR_RECEIVE' &&
                    model?.status !== 'WAITING_FOR_HANDLE'
                  "
                >
                  <div class="item-title">维修验收</div>
                  <a-steps v-if="acceptanceProcessEvent?.length">
                    <template #progressDot="{ prefixCls }">
                      <span :class="`${prefixCls}-icon-dot`" />
                    </template>
                    <template
                      v-for="item in acceptanceProcessEvent"
                      :key="item.id"
                    >
                      <a-step
                        :title="`${item.taskId ? `${item.createBy}` : ''}【${
                          item.action
                        }】`"
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
                    </template>
                  </a-steps>
                  <a-empty v-else description="暂无维修验收流程"></a-empty>
                  <template v-if="model?.status == 'FINISHED'">
                    <div class="item-title">维修评价</div>
                    <a-form-item label="服务评价">
                      <a-rate :value="assessModel.score" disabled></a-rate>
                    </a-form-item>
                    <a-form-item label="评价描述" class="a-form-item-100">
                      <span>{{
                        assessModel.description ? assessModel.description : "--"
                      }}</span>
                    </a-form-item>
                    <a-form-item label="评价照片" class="a-form-item-100">
                      <a-image-preview-group
                        v-if="assessModel.imageList?.length"
                      >
                        <a-image
                          v-for="item in assessModel.imageList"
                          :key="item.id"
                          :src="item.path"
                          :width="100"
                          :height="100"
                        ></a-image>
                      </a-image-preview-group>
                      <span v-else>--</span>
                    </a-form-item>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </g-detail-form>
      </template>
      <template #footer-page>
        <a-button @click="goBack">返回 </a-button>
        <a-button
          type="primary"
          @click="openModal('confirm')"
          v-if="model?.isCanConfirm"
          :loading="formBtnLoading"
        >
          维修确认
        </a-button>
        <a-button
          type="primary"
          @click="openModal('acceptance')"
          v-else-if="model?.isCanAcceptance"
          :loading="formBtnLoading"
        >
          验收审批
        </a-button>
        <a-button
          type="primary"
          @click="openModal('assessment')"
          v-else-if="model?.isCanAssessment"
          :loading="formBtnLoading"
        >
          维修评价
        </a-button>
        <a-button
          type="primary"
          @click="openModal('check')"
          v-else-if="model?.isCanCheck"
          :loading="formBtnLoading"
        >
          申请审批
        </a-button>
      </template>
    </g-layout>
    <a-modal
      :title="modelTitle"
      v-model:visible="visible"
      centered="centered"
      @ok="submit"
      @canccel="cancel"
      :confirmLoading="btnLoading"
    >
      <!-- 确认委外 -->
      <a-form
        ref="modalForm"
        :model="modalModel"
        :rules="rules"
        v-if="modalType === 'confirm'"
      >
        <a-form-item label="确认结果" name="confirmResult">
          <a-radio-group v-model:value="modalModel.confirmResult">
            <a-radio :value="'CONFIRM_REPAIR'">确认维修</a-radio>
            <a-radio :value="'NO_PROCESS'">暂不处理</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="modalModel.confirmResult === 'CONFIRM_REPAIR'">
          <a-form-item label="委外公司" name="outsourceCompanyId">
            <g-select
              v-model:value="modalModel.outsourceCompanyId"
              :placeholder="'委外公司'"
              :url="'repairCompany'"
              @change-check="changeConpany"
              :field="{ name: 'label', id: 'value', outsourceModel: 'title' }"
            ></g-select>
          </a-form-item>
          <a-form-item label="委外模式" name="outsourceModelId">
            <g-select
              v-model:value="modalModel.outsourceModelId"
              :placeholder="'委外模式'"
              :options="options"
            ></g-select>
            <!-- :url="'repairMode'" -->
          </a-form-item>
          <a-form-item label="申请流程" name="applicationCheckProcessKey">
            <g-select
              v-model:value="modalModel.applicationCheckProcessKey"
              :placeholder="'申请流程'"
              :url="'processList'"
              :field="{ name: 'label', key: 'value' }"
            ></g-select>
          </a-form-item>
          <a-form-item label="验收流程" name="acceptanceProcessKey">
            <g-select
              v-model:value="modalModel.acceptanceProcessKey"
              :placeholder="'验收流程'"
              :url="'processList'"
              :field="{ name: 'label', key: 'value' }"
            ></g-select>
          </a-form-item>
        </template>
        <a-form-item label="描述信息">
          <a-textarea
            v-model:value="modalModel.description"
            :maxlength="200"
            placeholder="描述信息"
            :autoSize="{ minRows: 2, maxRows: 8 }"
          ></a-textarea>
        </a-form-item>
        <a-form-item label="现场图片">
          <g-upload
            :max="3"
            :businessKey="'maintain'"
            :file="modalModel.imageList"
            v-model:value="modalModel.imageIdList"
          ></g-upload>
        </a-form-item>
      </a-form>
      <!-- 自定义表单 -->
      <template
        v-else-if="modalType !== 'confirm' && modalType !== 'assessment'"
      >
        <a-spin :spinning="spinning">
          <a-form ref="getFormRef" :model="dealModel" :rules="dealRules">
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
        </a-spin>
      </template>
      <template v-if="modalType === 'assessment'">
        <a-form ref="assessmentRef" :model="assessModel" :rules="assessRules">
          <a-form-item label="服务评价" name="score">
            <a-rate v-model:value="assessModel.score"></a-rate>
          </a-form-item>
          <a-form-item label="评价描述">
            <a-textarea
              v-model:value="assessModel.description"
              :maxlength="200"
              :autoSize="{ minRows: 2, maxRows: 8 }"
              placeholder="评价描述"
            ></a-textarea>
          </a-form-item>
          <a-form-item label="评价照片">
            <g-upload
              :file="assessModel.file"
              @changeFile="changeFile"
              :max="3"
            ></g-upload>
          </a-form-item>
        </a-form>
      </template>
    </a-modal>
    <!-- 处理详情 -->
    <a-modal
      class="detailModal"
      v-model:visible="detailVisi"
      centered
      :footer="null"
      title="处理详情"
    >
      <a-spin :spinning="spinning">
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
      </a-spin>
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
import { flattenTree, timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common.js";
export default defineComponent({
  components: {},
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const modalForm = ref();
    const getFormRef = ref();
    const detailFormRef = ref();
    const assessmentRef = ref();
    const generateForm = ref();

    const state = reactive({
      api: {
        detail: "repairListId",
      },
      formList: [
        {
          title: "基础信息",
          form: [
            { label: "维修单编号", value: "code" },
            { label: "维修单名称", value: "name" },
            { label: "维修对象", value: "deviceObjectName" },
            { label: "异常时间", value: "faultTime" },
            { label: "提交人员", value: "submitUserName" },
            { label: "提交时间", value: "createTime" },
            { label: "维修原因", value: "repairReason" },
            {
              label: "附件图片",
              value: "files",
              component: "a-upload",
              singleLine: true,
              detailValue: "files",
            },
          ],
        },
      ],
      formId: "",
      model: null,
      visible: false,
      spinning: false,
      btnLoading: false,
      detailVisi: false,
      formBtnLoading: true,
      modalModel: {
        imageList: [],
        description: "",
        imageIdList: "",
        confirmResult: "",
        outsourceModelId: "",
        outsourceCompanyId: "",
        acceptanceProcessKey: "",
        applicationReceiptId: "",
        applicationCheckProcessKey: "",
      },
      rules: {
        confirmResult: [{ required: true, message: "请选择确认结果" }],
        outsourceModelId: [{ required: true, message: "请选择委外模式" }],
        outsourceCompanyId: [{ required: true, message: "请选择委外公司" }],
        acceptanceProcessKey: [{ required: true, message: "请选择验收流程" }],
        applicationCheckProcessKey: [
          { required: true, message: "请选择申请流程" },
        ],
      },
      modalType: "",
      modelTitle: "",
      detailForm: {},
      dealInfo: [],
      dealModel: {},
      dealRules: {},
      assessModel: {
        outsourceRepairTicketId: "",
        score: "",
        description: "",
        imageIdList: [],
        file: [],
      },
      assessRules: {
        score: [{ required: true, message: "请填写服务评价" }],
      },
      checkProcessEvent: [],
      handleProcessEvent: [],
      acceptanceProcessEvent: [],
      options: [],
    });

    const openModal = async (type) => {
      switch (type) {
        case "confirm":
          state.modelTitle = "确认委外维修";
          break;
        case "acceptance":
          state.modelTitle = "验收委外维修";
          break;
        case "assessment":
          state.modelTitle = "委外维修评价";
          break;
        case "check":
          state.modelTitle = "审批委外维修";
          break;
      }
      state.modalType = type;
      // 获取表单信息
      if (type !== "confirm" && type !== "assessment") {
        // 获取表单信息
        await getProcessInputForm(
          state?.model.taskId
            ? state?.model.taskId
            : state.model.confirmInfo.taskId
        );
        if (state.dealInfo) {
          state.visible = true;
        } else {
          proxy.$message.warn("暂无处理表单信息");
        }
      }
      // 维修确认
      else {
        state.visible = true;
      }
    };

    // 弹框取消,选中项还原
    const cancel = async () => {
      await modalForm.value?.resetFields();
      await getFormRef.value?.resetFields();
      await getFormRef.value?.clearValidate("actions");
      state.modalType = "";
      state.modalModel.imageList = [];
      state.modalModel.description = "";
      state.modalModel.imageIdList = [];
      state.visible = false;
    };

    const submit = () => {
      //
      if (state.modalType !== "confirm" && state.modalType !== "assessment") {
        //审批委外维修

        state.btnLoading = true;
        if (state.dealInfo.definition) {
          generateForm.value.generateForm
            .validate()
            .then(() => {
              getFormRef.value
                .validate()
                .then(() => {
                  //自定义表单验证
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
                        //与app约定的传参内容
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
                      taskId: state?.model.taskId
                        ? state?.model.taskId
                        : state.model.confirmInfo.taskId,
                      outcome: state.dealModel.actions.val,
                      formValueModifyParam: {
                        processId: state?.model.taskId
                          ? state?.model.taskId
                          : state.model.confirmInfo.taskId,
                        formId: state.dealModel.formId.val,
                        formData: list,
                      },
                    };
                    proxy.$api
                      .processComplete(params, "post")
                      .then(() => {
                        proxy.$message.success("操作成功");
                        detailFormRef.value.getData();
                        cancel();
                        // state.loading = false;
                        state.btnLoading = false;
                      })
                      .catch(() => {
                        state.btnLoading = false;
                      });
                  });
                })
                .catch(() => {
                  state.btnLoading = false;
                });
            })
            .catch(() => {
              getFormRef.value.validate();
              state.btnLoading = false;
            });
        } else {
          const params = {
            taskId: state?.model.taskId
              ? state?.model.taskId
              : state.model.confirmInfo.taskId,
            outcome: state.dealModel.actions.val,
            formValueModifyParam: {
              processId: state?.model.taskId
                ? state?.model.taskId
                : state.model.confirmInfo.taskId,
              formId: state.dealModel.formId.val,
              formData: [],
            },
          };
          proxy.$api
            .processComplete(params, "post")
            .then(() => {
              proxy.$message.success("操作成功");
              detailFormRef.value.getData();
              cancel();
              // state.loading = false;
              state.btnLoading = false;
            })
            .catch(() => {
              state.btnLoading = false;
            });
        }
      }
      // 委外确认
      else if (state.modalType === "confirm") {
        state.btnLoading = true;
        modalForm.value
          .validate()
          .then(() => {
            const params = {
              ...state.modalModel,
              imageIdList: state.modalModel.imageIdList
                ? state.modalModel.imageIdList.split(",")
                : [],
            };
            proxy.$api
              .repairListConfirm(params, "post")
              .then(() => {
                proxy.$message.success("操作成功");
                detailFormRef.value.getData();
                cancel();
                state.btnLoading = false;
              })
              .catch(() => {
                state.btnLoading = false;
              });
          })
          .catch(() => {
            state.btnLoading = false;
          });
      } else if (state.modalType === "assessment") {
        state.btnLoading = true;
        assessmentRef.value.validate().then(() => {
          proxy.$api
            .repairOrderEval(state.assessModel, "post")
            .then(() => {
              proxy.$message.success("操作成功");
              detailFormRef.value.getData();
              cancel();
              state.btnLoading = false;
            })
            .catch(() => {
              state.btnLoading = false;
            });
        });
      }
    };

    const goBack = () => {
      history.go(-1);
    };

    const getAssessmentInfo = (id) => {
      proxy.$api.getAssessmentInfo({ ticketId: id }, "get").then((res) => {
        state.assessModel = res
          ? res
          : {
              outsourceRepairTicketId: id,
              score: "",
              description: "",
              imageIdList: [],
              file: [],
            };
      });
    };

    const afterGet = (form) => {
      state.model = form;
      state.assessModel.outsourceRepairTicketId = form.ticketId;
      getProcess();
      if (
        form.status === "FINISHED" &&
        form?.confirmInfo?.confirmResult !== "NO_PROCESS"
      ) {
        if(form.ticketId){getAssessmentInfo(form.ticketId); }
      }
      if (form?.confirmInfo?.taskId) {
        // getProcessInputForm(form?.confirmInfo?.taskId);
      }
      state.formBtnLoading = false;
      return form;
    };

    const getProcess = () => {
      proxy.$api
        .repairListIdPro({ receiptId: route.query.id }, "get")
        .then((res) => {
          state.checkProcessEvent = res.checkProcessEvent; //申请
          state.handleProcessEvent = res.handleProcessEvent; //处理
          state.acceptanceProcessEvent = res.acceptanceProcessEvent; //验收
        });
    };

    const getProcessInputForm = (id) => {
      state.spinning = true;
      state.btnLoading = true;
      id
        ? proxy.$api.processInputForm(id).then((res) => {
            state.dealInfo = res;
            if (res) {
              setForm();
            }
            state.spinning = false;
            state.btnLoading = false;
          })
        : null;
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

    const detailFormId = (id) => {
      state.formId = id;
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

    const changeFile = (data) => {
      state.assessModel.imageIdList = data;
    };

    const changeConpany = (value, option) => {
      state.options = option.title;
    };

    onMounted(() => {
      state.modalModel.applicationReceiptId = route.query.id;
    });

    watch(
      () => state.modalModel.outsourceCompanyId,
      () => {
        state.modalModel.outsourceModelId = null;
      }
    );

    return {
      modalForm,
      getFormRef,
      generateForm,
      assessmentRef,
      detailFormRef,
      ...toRefs(state),
      changeConpany,
      detailFormId,
      changeFile,
      openModal,
      afterGet,
      submit,
      cancel,
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
:deep(.detail-form) {
  padding-right: 16px;
}
:deep(.ant-spin-container) {
  max-height: 500px !important;
  overflow-y: auto;
  padding-right: 16px;
}
</style>
