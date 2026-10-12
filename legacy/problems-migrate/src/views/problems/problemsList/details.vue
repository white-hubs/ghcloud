<template>
  <g-layout title="隐患单详情">
    <template #content-table>
      <g-detail-form
        ref="detailFormRef"
        :api="api"
        :formList="formList"
        :afterGet="afterGet"
      >
        <template v-slot:edit-item>
          <div class="item-title">隐患确认</div>
          <a-form-item label="确认人员">
            <span>
              {{
                model?.hiddenDangerConfirmVO?.userNames?.length
                  ? model?.hiddenDangerConfirmVO?.userNames.join(",")
                  : "--"
              }}
            </span>
          </a-form-item>
          <template v-if="model?.hiddenDangerStatus !== 'WAITING_FOR_CONFIRM'">
            <a-form-item label="确认结果">
              <span>{{
                model?.hiddenDangerConfirmVO?.confirmResult
                  ? model?.hiddenDangerConfirmVO?.confirmResult === "CONFIRMED"
                    ? "确认隐患"
                    : "暂不处理"
                  : "--"
              }}</span>
            </a-form-item>
            <a-form-item label="确认时间">
              <span>
                {{
                  model?.hiddenDangerConfirmVO?.confirmTime
                    ? timeFormat(model?.hiddenDangerConfirmVO.confirmTime, true)
                    : "--"
                }}
              </span>
            </a-form-item>
            <!-- 确认处理 -->
            <template v-if="model?.confirmResult === 'CONFIRMED'">
              <a-form-item label="隐患级别">
                <span>
                  {{
                    model?.hiddenDangerConfirmVO?.hiddenDangerLevelName
                      ? model?.hiddenDangerConfirmVO?.hiddenDangerLevelName
                      : "--"
                  }}
                </span>
              </a-form-item>
              <a-form-item label="隐患分类">
                <span>
                  {{
                    model?.hiddenDangerConfirmVO?.hiddenDangerCategoryName
                      ? model?.hiddenDangerConfirmVO?.hiddenDangerCategoryName
                      : "--"
                  }}
                </span>
              </a-form-item>
              <a-form-item label="隐患类型">
                <span>{{
                  model?.hiddenDangerConfirmVO?.hiddenDangerTypeName
                    ? model?.hiddenDangerConfirmVO?.hiddenDangerTypeName
                    : "--"
                }}</span>
              </a-form-item>
              <a-form-item label="排查时限">
                <span
                  >{{ model?.hiddenDangerConfirmVO?.limitTime
                  }}{{
                    model?.hiddenDangerConfirmVO?.limitTimeType
                      ? model?.hiddenDangerConfirmVO?.limitTimeType === "hour"
                        ? "小时"
                        : "天"
                      : "--"
                  }}</span
                >
              </a-form-item>
            </template>
            <a-form-item label="确认描述" class="a-form-item-100">
              <span>{{
                model?.hiddenDangerConfirmVO?.remark
                  ? model?.hiddenDangerConfirmVO?.remark
                  : "--"
              }}</span>
            </a-form-item>
          </template>

          <template
            v-if="
              model &&
              model?.hiddenDangerStatus !== 'WAITING_FOR_CONFIRM' &&
              model.confirmResult !== 'NO_PROCESS'
            "
          >
            <div class="item-title">隐患排查</div>
            <a-steps class="p1" :current="1" v-if="processInfo?.length">
              <!-- 自定义图标 -->
              <template #progressDot="{ prefixCls }">
                <span :class="`${prefixCls}-icon-dot`" />
              </template>
              <a-step
                v-for="item in processInfo"
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
                    @click="detailFormId(item.id)"
                    v-if="item.taskId"
                    >处理详情</a-button
                  >
                </template>
              </a-step>
            </a-steps>
            <a-empty v-else description="暂无流程"></a-empty>
            <template
              v-if="
                model &&
                model?.hiddenDangerStatus !== 'WAITING_FOR_HANDLE' &&
                model.confirmResult !== 'NO_PROCESS'
              "
            >
              <div class="item-title">隐患关闭</div>
              <a-form-item label="关闭人员">
                <span>{{
                  model?.closedByHiddenDanger?.userNames?.length
                    ? model?.closedByHiddenDanger?.userNames.join("，")
                    : "--"
                }}</span>
              </a-form-item>
              <template v-if="model?.hiddenDangerStatus === 'FINISHED'">
                <a-form-item label="解决结果">
                  <span>
                    <!-- {{
                      model?.closedByHiddenDanger?.result
                        ? model?.closedByHiddenDanger?.result === "RESOLVED"
                          ? "处理成功"
                          : "处理失败"
                        : "--"
                    }} -->
                    {{
                      model?.closedByHiddenDanger?.result
                        ? model?.closedByHiddenDanger?.result === "RESOLVED"
                          ? "已解决"
                          : "未解决"
                        : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="关闭时间">
                  <span>{{
                    model?.closedByHiddenDanger?.closedTime
                      ? timeFormat(
                          model?.closedByHiddenDanger?.closedTime,
                          true
                        )
                      : "--"
                  }}</span>
                </a-form-item>
                <a-form-item label="描述信息">
                  <span>
                    {{
                      model?.closedByHiddenDanger?.remark
                        ? model?.closedByHiddenDanger?.remark
                        : "--"
                    }}
                  </span>
                </a-form-item>
                <a-form-item label="附件图片" class="a-form-item-100">
                  <!-- <g-upload :file="closeInfo?.files"></g-upload> -->
                  <a-image-preview-group
                    v-if="model?.closedByHiddenDanger?.files.length"
                  >
                    <a-image
                      v-for="(item, index) in model?.closedByHiddenDanger
                        ?.files"
                      :key="index"
                      :src="item.path"
                      :width="100"
                      :height="100"
                    ></a-image>
                  </a-image-preview-group>
                  <div v-else>--</div>
                </a-form-item>
              </template>
            </template>
          </template>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        type="primary"
        v-if="model?.hiddenDangerConfirmVO?.isButton"
        @click="openModal"
      >
        确认隐患
      </a-button>
      <a-button
        type="primary"
        v-if="model?.ticketVO?.isTicketButton"
        @click="openOrderModal('deal')"
      >
        隐患处理
      </a-button>
      <a-button
        type="primary"
        v-if="
          model?.hiddenDangerStatus === 'TO_BE_CLOSED' &&
          model?.closedByHiddenDanger?.isColsedButton
        "
        @click="openOrderModal('close')"
      >
        隐患关闭
      </a-button>
    </template>
    <a-modal
      v-model:visible="visible"
      title="确认隐患排查"
      centered
      @ok="submit"
      @cancel="cancel"
      :confirmLoading="confirmBtnLoading"
    >
      <a-form ref="modalForm" :model="confirmModel" :rules="rules">
        <a-form-item label="确认结果" name="confirmResult">
          <a-radio-group v-model:value="confirmModel.confirmResult">
            <a-radio :value="'CONFIRMED'">确认隐患</a-radio>
            <a-radio :value="'NO_PROCESS'">暂不处理</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="confirmModel.confirmResult === 'CONFIRMED'">
          <a-form-item label="隐患分类" name="hiddenDangerCategoryId">
            <g-select
              v-model:value="confirmModel.hiddenDangerCategoryId"
              :url="'dangerCategory'"
              :field="{ name: 'label', id: 'value' }"
              placeholder="请选择隐患分类"
              @change-check="
                (value, option) =>
                  changeLabel(option, 'hiddenDangerCategoryName')
              "
              :showSearch="true"
            ></g-select>
          </a-form-item>
          <a-form-item label="隐患类型" name="hiddenDangerTypeId">
            <g-select
              ref="dangerTypeRef"
              :url="'dangerType'"
              v-if="confirmModel.hiddenDangerCategoryId"
              v-model:value="confirmModel.hiddenDangerTypeId"
              :field="{ name: 'label', id: 'value' }"
              placeholder="请选择隐患类型"
              @change-check="
                (value, option) => changeLabel(option, 'hiddenDangerTypeName')
              "
              :params="{
                hiddenDangerCategoryId: confirmModel.hiddenDangerCategoryId,
              }"
            ></g-select>
            <g-select v-else disabled placeholder="请选择隐患类型"></g-select>
          </a-form-item>
          <a-form-item label="隐患级别" name="hiddenDangerLevelId">
            <g-select
              v-model:value="confirmModel.hiddenDangerLevelId"
              :url="'dangerDegree'"
              :field="{ name: 'label', id: 'value' }"
              placeholder="请选择隐患级别"
              @change-check="
                (value, option) => changeLabel(option, 'hiddenDangerLevelName')
              "
            ></g-select>
          </a-form-item>
          <a-form-item label="业务流程" name="processInstanceId">
            <g-select
              v-model:value="confirmModel.processInstanceId"
              :url="'processList'"
              :field="{ name: 'label', key: 'value' }"
              placeholder="请选择业务流程"
              @change-check="
                (value, option) => changeLabel(option, 'processInstanceName')
              "
            ></g-select>
          </a-form-item>
          <a-form-item label="排查时限" name="limitTime">
            <a-input
              :style="{ width: 'calc(100% - 100px)' }"
              v-model:value="confirmModel.limitTime"
              placeholder="请输入时限"
              :maxLength="6"
              allowClear
            ></a-input>
            <a-button
              type="primary"
              :style="{ width: '100px', border: 'none' }"
              @click="changeUnit"
            >
              {{ confirmModel.limitTimeType === "hour" ? "时" : "天" }}
            </a-button>
          </a-form-item>
        </template>
        <a-form-item label="确认信息">
          <a-textarea
            v-model:value="confirmModel.remark"
            placeholder="请输入确认信息"
            :maxLength="200"
            :autoSize="{ minRows: 2 }"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="orderVisi"
      centered
      :title="modalType === 'deal' ? '处理隐患排查' : '关闭隐患排查'"
      @ok="save"
      @cancel="orderCancel"
      :confirmLoading="btnLoading"
    >
      <template v-if="modalType === 'close'">
        <a-form ref="orderModalForm" :model="orderModel" :rules="modalRules">
          <a-form-item label="解决结果" name="result">
            <a-radio-group v-model:value="orderModel.result">
              <a-radio :value="'UNRESOLVED'">未解决</a-radio>
              <a-radio :value="'RESOLVED'">已解决</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="描述信息">
            <a-textarea
              v-model:value="orderModel.remark"
              :maxLength="200"
              :autoSize="{
                minRows: 2,
              }"
              placeholder="描述信息"
            ></a-textarea>
          </a-form-item>
          <a-form-item label="附件照片">
            <g-upload
              v-model:value="orderModel.fileIds"
              :file="orderModel.fileList"
              :businessKey="'maintain'"
            ></g-upload>
          </a-form-item>
        </a-form>
      </template>
      <template v-else>
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
            <div style="max-height:500px;overflow-y: scroll;overflow-y: scroll;overflow-y: overlay;">
              <AntdGenerateForm
              :advanceFields="['richtext-editor', 'cascader']"
              v-if="dealInfo && dealInfo.definition"
              :data="dealInfo.definition"
              ref="generateForm"
            />
            </div>
          </a-form>
        </a-spin>
      </template>
    </a-modal>
    <!-- 处理详情 -->
    <a-modal
      v-model:visible="detailVisi"
      centered
      title="处理详情"
      :footer="null"
    >
      <!-- <div class="title mb2">{{ detailForm?.formName }}</div> -->
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
            <span>
              {{ detailForm?.operation ? detailForm?.operation : "--" }}
            </span>
          </a-form-item>
          <gDesignFormItem :formData="detailForm.formData" />
        </a-form>
      </a-spin>
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
  watch,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const getFormRef = ref();
    const modalForm = ref();
    const generateForm = ref();
    const detailFormRef = ref();
    const dangerTypeRef = ref();
    const orderModalForm = ref();
    const state = reactive({
      api: {
        detail: "hiddenDangerId",
      },
      model: null,
      windowLoad: window,
      formList: [
        {
          title: "隐患信息",
          form: [
            { label: "隐患编号", value: "code" },
            { label: "隐患单名称", value: "name" },
            { label: "隐患对象", value: "hiddenObjName" },
            { label: "提交人员", value: "submitter" },
            {
              label: "提交时间",
              value: "submitTime",
              detailFun: (value) => {
                return timeFormat(value, true);
              },
            },
            { label: "隐患描述", value: "remark" },
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
      visible: false,
      spinning: false,
      orderVisi: false,
      btnLoading: false,
      detailVisi: false,
      confirmBtnLoading: false,
      modalType: "",
      confirmModel: {
        hiddenDangerId: "",
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
      },
      rules: {
        confirmResult: [{ required: true, message: "请选择确认结果" }],
        hiddenDangerCategoryId: [{ required: true, message: "请选择隐患分类" }],
        hiddenDangerTypeId: [{ required: true, message: "请选择隐患类型" }],
        hiddenDangerLevelId: [{ required: true, message: "请选择隐患级别" }],
        processInstanceId: [{ required: true, message: "请选择业务流程" }],
        limitTime: [
          { required: true, message: "请输入时限" },
          {
            pattern: new RegExp(
              /^((0{1}\.\d{1,2})|([1-9]\d*\.{1}\d{1,2})|([1-9]+\d*))$/,
              "g"
            ),
            message: "请输入正确的时限(大于0且最多两位小数)",
          },
        ],
      },
      options: [
        { name: "时", id: "hour" },
        { name: "天", id: "day" },
      ],
      confirmInfo: null,
      formModel: null,
      orderModel: {
        result: "",
        remark: "",
        fileIds: [],
        fileList: [],
      },
      modalRules: {
        result: [{ required: true, message: "请选择解决结果" }],
      },
      processInfo: null,
      detailForm: null,
      dealInfo: null,
      dealModel: {},
      dealRules: {},
      t: null,
    });

    const goBack = () => {
      history.go(-1);
    };

    const afterGet = (res) => {
      state.model = res;
      if (res.ticketVO?.ticketId) {
        getProcess(res.ticketVO?.ticketId);
      }
      if (res?.ticketVO?.taskId) {
        getProcessInputForm(state?.model.ticketVO?.taskId);
      }
      return res;
    };

    const openModal = () => {
      state.visible = true;
    };

    const submit = () => {
      modalForm.value.validate().then(() => {
        state.confirmBtnLoading = true;
        proxy.$api
          .hiddenDangerConfirm(state.confirmModel, "put")
          .then(() => {
            proxy.$message.success("操作成功");
            detailFormRef.value.getData();
            // state.visible = false;
            cancel();
            state.confirmBtnLoading = false;
          })
          .catch(() => {
            state.confirmBtnLoading = false;
          });
      });
    };

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
      state.confirmModel.hiddenDangerId = route.query.id;
      modalForm.value.resetFields();
      state.visible = false;
    };

    const changeUnit = () => {
      const base = state.confirmModel.limitTimeType;
      state.confirmModel.limitTimeType = base === "hour" ? "day" : "hour";
    };

    const changeLabel = (option, type) => {
      state.confirmModel[type] = option ? option.label : "";
    };

    const getProcess = (id) => {
      const params = {
        businessType: "HIDDEN_DANGER",
        businessKey: id,
      };
      proxy.$api.process(params, "get").then((res) => {
        state.processInfo = res;
      });
    };

    const openOrderModal = (type) => {
      state.modalType = type;
      if (type !== "close") {
        if (state?.model.ticketVO?.taskId) {
          getProcessInputForm(state?.model.ticketVO?.taskId);
        } else {
          proxy.$message.warn("暂无表单信息");
        }
        // setForm();
      }
      state.orderVisi = true;
    };

    const save = () => {
      if (state.modalType === "close") {
        state.btnLoading = true;
        orderModalForm.value
          .validate()
          .then(() => {
            const params = {
              ...state.orderModel,
              fileIds:
                typeof state.orderModel.fileIds === "string"
                  ? state.orderModel.fileIds.split(",")
                  : [],
              hiddenDangerId: route.query.id,
            };
            proxy.$api
              .hiddenDangerClose(params, "put")
              .then(() => {
                proxy.$message.success("操作成功");
                goBack();
                state.btnLoading = false;
              })
              .catch(() => {
                state.btnLoading = false;
              });
          })
          .catch(() => {
            state.btnLoading = false;
          });
      } else {
        state.btnLoading = true;
        if (state.dealInfo.definition) {
          generateForm.value.generateForm
            .validate()
            .then(() => {
              getFormRef.value
                .validate()
                .then(() => {
                  const list = [];
                  generateForm.value.getData().then((res) => {
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
                      taskId: state.model?.ticketVO?.taskId,
                      outcome: state.dealModel.actions.val,
                      formValueModifyParam: {
                        processId: state.model?.ticketVO?.taskId,
                        formId: state.dealModel.formId.val,
                        // formValues: list,
                        formData: list,
                      },
                    };
                    proxy.$api
                      .processComplete(params, "post")
                      .then(() => {
                        proxy.$message.success("操作成功");
                        detailFormRef.value.getData();
                        orderCancel();
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
            });
        } else {
          const params = {
            taskId: state.model?.ticketVO?.taskId,
            outcome: state.dealModel.actions.val,
            formValueModifyParam: {
              processId: state.model?.ticketVO?.taskId,
              formId: state.dealModel.formId.val,
              // formValues: list,
              formData: [],
            },
          };
          proxy.$api
            .processComplete(params, "post")
            .then(() => {
              proxy.$message.success("操作成功");
              detailFormRef.value.getData();
              orderCancel();
              state.btnLoading = false;
            })
            .catch(() => {
              state.btnLoading = false;
            });
        }
      }
    };

    const orderCancel = async () => {
      await getFormRef.value?.resetFields();
      await orderModalForm.value?.resetFields();
      await getFormRef.value?.clearValidate("actions");
      state.orderModel.fileList = [];
      state.orderModel.remark = "";
      state.orderVisi = false;
      state.dealModel = {};
      state.dealRules = {};
    };

    const detailFormId = (record) => {
      state.formId = record;
      getForm();
    };

    const getForm = () => {
      state.spinning = true;
      proxy.$api.processForm(state.formId, "get").then((res) => {
        state.detailForm = res;
        state.detailVisi = true;
        state.spinning = false;
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
            } else {
              proxy.$message.warn("暂无表单信息");
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

    onMounted(() => {
      state.confirmModel.hiddenDangerId = route.query.id;
    });

    watch(
      () => state.confirmModel.hiddenDangerCategoryId,
      (n, o) => {
        if (n !== o) {
          state.confirmModel.hiddenDangerTypeId = null;
          if (state.t) {
            clearTimeout(state.t);
          }
          state.t = setTimeout(() => {
            dangerTypeRef.value?.getData({ hiddenDangerCategoryId: n });
          }, 400);
        }
      }
    );

    watch(
      () => state.orderVisi,
      (n) => {
        if (!n) {
          orderCancel();
        }
      }
    );

    return {
      getFormRef,
      modalForm,
      generateForm,
      detailFormRef,
      dangerTypeRef,
      orderModalForm,
      ...toRefs(state),
      openOrderModal,
      detailFormId,
      orderCancel,
      changeLabel,
      changeUnit,
      timeFormat,
      openModal,
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
:deep(.ant-spin-container) {
  max-height: 500px !important;
  overflow-y: auto;
  padding-right: 16px;
}
</style>
