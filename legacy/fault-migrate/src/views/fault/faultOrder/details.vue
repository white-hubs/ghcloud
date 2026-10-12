<template>
  <g-layout title="故障工单详情">
    <template #content-table>
      <g-detail-form
        :api="api"
        :formList="formList"
        :afterGet="afterGet"
        ref="detailFormRef"
      >
        <template v-slot:edit-item>
          <div class="item-title">工单流程</div>
          <a-steps class="p1" :current="1">
            <!-- 自定义图标 -->
            <template #progressDot="{ prefixCls }">
              <!-- <a-popover>
                <template #content>
                  <span>step {{ index }} status: {{ status }}</span>
                </template> -->
              <span :class="`${prefixCls}-icon-dot`" />
              <!-- </a-popover> -->
            </template>
            <a-step
              v-for="item in processInfo"
              :key="item.id"
              :title="`【${item.createBy}】${item.action}`"
              :status="'finish'"
            >
              <template #description>
                <span>{{ item.createTime }}</span>
                <a-button type="link" @click="detailFormId(item.id)"
                  >处理详情</a-button
                >
              </template>
            </a-step>
          </a-steps>
          <template v-if="formModel?.status !== 'PENDING'">
            <div class="item-title">工单关闭</div>
            <a-form-item label="关闭人员">
              <span>{{
                closeInfo?.closedUserName ? closeInfo?.closedUserName : "--"
              }}</span>
            </a-form-item>
            <template v-if="formModel?.status === 'COMPLETED'">
              <a-form-item label="解决结果">
                <span>{{
                  closeInfo?.result
                    ? closeInfo?.result === "UNRESOLVED"
                      ? "未解决"
                      : "已解决"
                    : "--"
                }}</span>
              </a-form-item>
              <a-form-item label="关闭时间">
                <span>{{
                  closeInfo?.closedTime
                    ? timeFormat(closeInfo?.closedTime, true)
                    : "--"
                }}</span>
              </a-form-item>
              <a-form-item label="描述信息">
                <span>{{ closeInfo?.remark ? closeInfo?.remark : "--" }}</span>
              </a-form-item>
              <a-form-item label="附件图片">
                <a-image-preview-group v-if="closeInfo?.files.length">
                  <a-image
                    v-for="(item, index) in closeInfo?.files"
                    :key="index"
                    :src="item.path"
                  ></a-image>
                </a-image-preview-group>
                <div v-else>--</div>
              </a-form-item>
            </template>
          </template>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        @click="openModal('deal')"
        v-if="formModel?.status === 'PENDING' && formModel.taskId"
        type="primary"
      >
        工单处理
      </a-button>
      <a-button
        @click="openModal('close')"
        v-if="formModel?.status === 'TO_BE_CLOSED'"
        type="primary"
      >
        工单关闭
      </a-button>
    </template>
    <a-modal
      v-model:visible="visible"
      centered
      :title="modalType === 'deal' ? '工单处理' : '工单关闭'"
      @ok="save"
      @cancel="cancel"
    >
      <a-form
        ref="modalForm"
        :model="modalType === 'close' ? model : dealModel"
        :rules="modalType === 'close' ? modalRules : dealRules"
      >
        <template v-if="modalType === 'close'">
          <a-form-item label="解决结果" name="result">
            <a-radio-group v-model:value="model.result">
              <a-radio :value="'RESOLVED'">未解决</a-radio>
              <a-radio :value="'UNRESOLVED'">已解决</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="故障类型" class="flex-start">
            <g-select
              ref="faultTypeRef"
              v-model:value="model.faultTypeId"
              style="width: calc(100% - 120px)"
              :url="'faultType'"
              showSearch
            ></g-select>
            <a-button
              style="width: 120px"
              type="primary"
              @click="drawerOpen('type')"
            >
              新增故障类型
            </a-button>
          </a-form-item>
          <a-form-item label="故障案例" class="flex-start">
            <g-select
              ref="faultCaseIdRef"
              v-model:value="model.faultCaseId"
              style="width: calc(100% - 120px)"
              :url="'faultCase'"
            ></g-select>
            <a-button
              style="width: 120px"
              type="primary"
              @click="drawerOpen('case')"
            >
              新增故障案例
            </a-button>
          </a-form-item>
          <a-form-item label="描述信息">
            <a-textarea
              v-model:value="model.remark"
              :maxlength="200"
              :autoSize="{
                minRows: 2,
              }"
              placeholder="描述信息"
            ></a-textarea>
          </a-form-item>
          <a-form-item label="附件照片">
            <g-upload
              :file="model.fileList"
              v-model:value="model.fileIds"
              :sceneCode="GLOBAL_SCENE_CODE.faultOrderCase"
            ></g-upload>
          </a-form-item>
        </template>
        <template v-else>
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
              <component
                v-else
                v-model:value="dealModel[item.name].val"
                v-model:checked="dealModel[item.name].val"
                :is="dealModel[item.name]?.type"
                :options="dealModel[item.name]?.options"
                :maxlength="dealModel[item.name]?.maxLength"
                :file="dealModel[item.name]?.file"
                :disabled="dealModel[item.name]?.disabled"
                :checked-children="dealModel[item.name]?.checkedValue"
                :un-checked-children="dealModel[item.name]?.unCheckedValue"
                :params="dealModel[item.name]?.params"
                :field="dealModel[item.name]?.field"
                :url="dealModel[item.name]?.url"
                :placeholder="dealModel[item.name]?.placeholder"
              ></component>
            </a-form-item>
          </template>
        </template>
      </a-form>
    </a-modal>
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
        :rules="drawerRules"
        :labelCol="{ span: drawerType === 'type' ? 6 : 3 }"
      >
        <template v-if="drawerType === 'type'">
          <a-form-item label="类型名称" name="name">
            <a-input
              v-model:value="drawerModel.name"
              placeholder="类型名称"
            ></a-input>
          </a-form-item>
        </template>
        <template v-else-if="drawerType === 'case'">
          <a-form-item label="案例名称" name="name">
            <a-input
              v-model:value="drawerModel.name"
              placeholder="案例名称"
              :maxlength="20"
            ></a-input>
          </a-form-item>
          <a-form-item label="故障类型" name="faultTypeId">
            <g-select
              v-model:value="drawerModel.faultTypeId"
              :url="'faultType'"
              @change-check="
                (value, option) => getLabel(value, option, 'faultTypeName')
              "
            ></g-select>
          </a-form-item>
          <a-form-item label="设备类型" name="deviceTypeId">
            <g-select
              v-model:value="drawerModel.deviceTypeId"
              :url="'getGenreSearch'"
              @change-check="
                (value, option) => getLabel(value, option, 'deviceTypeName')
              "
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
            :sceneCode="GLOBAL_SCENE_CODE.faultOrderCase"
              v-model:value="drawerModel.fileIds"
              :accept="'.jpg,.jpeg,.png,.svg,.doc'"
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
        <a-button type="primary" @click="submit">保存</a-button>
      </div>
    </a-drawer>
    <a-modal
      v-model:visible="detailVisi"
      centered
      title="处理详情"
      :footer="null"
    >
      <div class="title mb2">{{ detailForm?.formName }}</div>
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
          <span>{{ detailForm?.operation ? detailForm.operation : "--" }}</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </g-layout>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  createVNode,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import { timeFormat, millennial } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import { useRouter, useRoute } from "vue-router";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons-vue";
import {GLOBAL_SCENE_CODE} from "@ghcloud/cube-file-service"
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const faultId = route.query.faultId;
    const modalForm = ref();
    const drawerForm = ref();
    const faultTypeRef = ref();
    const detailFormRef = ref();
    const faultCaseIdRef = ref();
    const faultReasonInput = ref();
    const faultPhenomenonInput = ref();
    const treatmentMeasuresInput = ref();
    const state = reactive({
      api: {
        detail: "faultOrderDetail",
      },
      formList: [
        {
          title: "故障单信息",
          form: [
            { label: "排查工单编号", value: "ticketCode" },
            {
              label: "故障单",
              value: "name",
              html: true,
              detailFun: (value, form) => {
                return `<a href="./faultDetails?type=detail&id=${form.id}">${value}</a>`;
              },
            },
          ],
        },
      ],
      formModel: null,
      closeInfo: null,
      modalType: "",
      visible: false,
      detailVisi: false,
      showDrawer: false,
      model: {
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
      },
      userInfo: null,
      drawerModel: {
        name: "",
        faultTypeId: "",
        faultTypeName: "",
        deviceTypeId: "",
        deviceTypeName: "",
        faultPhenomenon: "",
        faultReason: "",
        treatmentMeasures: "",
        fileIds: [],
      },
      drawerRules: {
        name: [{ required: true, message: "请输入类型名称" }],
        faultTypeId: [{ required: true, message: "请选择故障类型" }],
        deviceTypeId: [{ required: true, message: "请选择设备类型" }],
        faultPhenomenon: [{ required: true, message: "请输入故障现象" }],
        faultReason: [{ required: true, message: "请输入故障原因" }],
        treatmentMeasures: [{ required: true, message: "请输入处理措施" }],
        fileIds: [{ required: true, message: "请上传附件" }],
      },
      drawerType: "",
      processInfo: null,
      detailForm: null,
      dealInfo: null,
      dealModel: {},
      dealRules: {},
    });

    const goBack = () => {
      history.go(-1);
    };

    const afterGet = (form) => {
      proxy.$api.faultOrderCloInfo(faultId, "get").then((res) => {
        state.closeInfo = res;
      });
      state.formModel = form;
      getProcess();
      if (form.taskId) {
        getProcessInputForm(form.taskId);
      }
      return form;
    };

    const openModal = (type) => {
      state.modalType = type;
      if (state.formModel.taskId) {
        getProcessInputForm(state.formModel.taskId);
      }
      state.visible = true;
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        if (state.modalType === "close") {
          const params = {
            ...state.model,
            faultId: faultId,
          };
          proxy.$api.faultOrderClose(params, "put").then(() => {
            proxy.$message.success("操作成功");
            goBack();
          });
        } else {
          const list = [];
          for (let i in state.dealModel) {
            if (i !== "actions" && i !== "formId") {
              const param = {
                formItemId: state.dealModel[i].formItemId,
                val: state.dealModel[i].val,
              };
              list.push(param);
            }
          }
          const params = {
            taskId: state.formModel.taskId,
            outcome: state.dealModel.actions.val,
            formValueModifyParam: {
              processId: state.formModel.taskId,
              formId: state.dealModel.formId.val,
              formValues: list,
            },
          };
          proxy.$api.processComplete(params, "post").then(() => {
            proxy.$message.success("操作成功");
            detailFormRef.value.getData();
            cancel();
          });
        }
      });
    };

    const cancel = async () => {
      await modalForm.value.resetFields();
      state.model.remark = "";
      state.model.faultCaseId = null;
      state.model.faultCaseName = "";
      state.model.faultTypeId = null;
      state.model.faultTypeName = "";
      state.model.fileIds = [];
      state.model.fileList = [];
      state.visible = false;
      state.dealModel = {};
      state.dealRules = {};
    };

    const drawerClose = async () => {
      drawerForm.value.resetFields();
      state.showDrawer = false;
    };

    const drawerOpen = (type) => {
      state.drawerType = type;
      state.showDrawer = true;
    };

    const submit = () => {
      faultReasonInput.value?.getHtml();
      faultPhenomenonInput.value?.getHtml();
      treatmentMeasuresInput.value?.getHtml();
      drawerForm.value.validate().then(() => {
        state.drawerType === "type"
          ? proxy.$api
              .faultTypeAdd(state.drawerModel, "post")
              .then(async () => {
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
                "post"
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
    };

    const getLabel = (value, option, key) => {
      state.drawerModel[key] = option.label;
    };

    // 获取工单流程
    const getProcess = () => {
      const params = {
        businessType: "FAULT",
        businessKey: route.query.id,
      };
      proxy.$api.process(params, "get").then((res) => {
        state.processInfo = res;
      });
    };

    const detailFormId = async (record) => {
      state.formId = record;
      await getForm();
      state.detailVisi = true;
    };

    const getForm = () => {
      proxy.$api.processForm(state.formId, "get").then((res) => {
        state.detailForm = res;
      });
    };

    const getProcessInputForm = (id) => {
      id
        ? proxy.$api.processInputForm(id).then((res) => {
            state.dealInfo = res;
            setForm();
          })
        : null;
    };

    const setForm = () => {
      Object.assign(state.dealModel, {
        actions: {
          type: "a-radio-group",
          options: state.dealInfo.actions,
          val: state.dealInfo.actions[0],
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

      for (let i of state.dealInfo.formItemVOS) {
        Object.assign(state.dealModel, {
          [i.id]: {
            formItemId: i.id,
            type: "a-input",
            val: i.defaultValue,
            name: i.id,
            label: i.name,
            placeholder: i.name,
          },
        });
        Object.assign(state.dealRules, {
          [i.id]: [
            {
              required: true,
              message: "",
            },
            {
              validator(rule, value) {
                if (value.val) {
                  return Promise.resolve();
                } else {
                  return Promise.reject(
                    `${i.type === "input" ? "请选择" : "请输入"}${i.name}`
                  );
                }
              },
            },
          ],
        });
      }
    };

    onMounted(function(){});

    return {
      modalForm,
      drawerForm,
      faultTypeRef,
      detailFormRef,
      faultCaseIdRef,
      faultReasonInput,
      faultPhenomenonInput,
      treatmentMeasuresInput,
      ...toRefs(state),
      detailFormId,
      drawerClose,
      drawerOpen,
      timeFormat,
      openModal,
      afterGet,
      getLabel,
      getHtml,
      submit,
      cancel,
      goBack,
      save,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
</style>
