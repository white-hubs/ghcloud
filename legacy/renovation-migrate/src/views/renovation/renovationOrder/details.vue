<template>
  <g-layout title="改造工单详情">
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
              v-for="item in formModel?.processEventList"
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
          <!-- 评估 -->
          <template v-if="formModel?.retrofitTicketStatus === 'ASSESSMENTED'">
            <div class="item-title">效果评估</div>
            <a-form-item label="效果评估">
              <a-rate
                v-if="formModel?.assessment.score"
                :value="formModel?.assessment.score"
                disabled
              ></a-rate>
              <span v-else>--</span>
            </a-form-item>
            <a-form-item label="评估描述">
              <span>{{
                formModel?.assessment?.description
                  ? formModel?.assessment?.description
                  : "--"
              }}</span>
            </a-form-item>
            <a-form-item label="评估附件" class="a-form-item-100">
              <a-image-preview-group
                v-if="formModel?.assessment.imageList.length"
              >
                <a-image
                  v-for="item in formModel?.assessment.imageList"
                  :key="item.id"
                  :src="item.path"
                ></a-image>
              </a-image-preview-group>
              <span v-else>--</span>
            </a-form-item>
            <a-form-item label="改造前状态" class="a-form-item-100">
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
            </a-form-item>
            <a-form-item label="改造后状态" class="a-form-item-100">
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
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        @click="openModal('deal')"
        v-if="formModel?.isCanHandle"
        type="primary"
      >
        工单处理
      </a-button>
      <a-button
        @click="openModal('close')"
        v-if="formModel?.isCanAssessmented"
        type="primary"
      >
        效果评估
      </a-button>
    </template>
    <a-modal
      v-model:visible="visible"
      centered
      :title="modalType === 'deal' ? '工单处理' : '效果评估'"
      @ok="save"
      @cancel="cancel"
    >
      <a-form
        ref="modalForm"
        :model="modalType === 'close' ? model : dealModel"
        :rules="modalType === 'close' ? modalRules : dealRules"
      >
        <template v-if="modalType === 'close'">
          <a-form-item label="效果评估" name="score">
            <a-rate v-model:value="model.score" />
          </a-form-item>
          <a-form-item label="评估描述">
            <a-textarea
              v-model:value="model.description"
              :maxLength="200"
              :autoSize="{
                minRows: 2,
              }"
              placeholder="评估描述"
            ></a-textarea>
          </a-form-item>
          <a-form-item label="评估附件">
            <!-- v-model:value="model.imageIdList" -->
            <g-upload
              :file="model.imageList"
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
              :style="{
                color:
                  deviceInfo?.attributeStatus?.key === 'OFFLINE'
                    ? 'red'
                    : deviceInfo?.attributeStatus?.key === 'ONLINE'
                    ? 'green'
                    : '#000',
              }"
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
                    <template v-if="item?.selectAbleAttributeStatuses.length">
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
          {{ detailForm.operation }}
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
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const hiddenDangerId = route.query.hiddenDangerId;
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
        detail: "renovationOrderId",
      },
      formList: [
        {
          title: "更新改造信息",
          form: [
            { label: "改造工单编号", value: "code" },
            {
              label: "改造单",
              value: "retrofitReceiptName",
              html: true,
              detailFun: (value, form) => {
                return `<a href="${window.location.origin}/renovationDetails?type=detail&id=${form.retrofitReceiptId}">${value}</a>`;
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
      model: {
        score: "",
        imageList: [],
        attributes: [],
        imageIdList: [],
      },
      modalRules: {
        score: [{ required: true, message: "请填写评估结果" }],
      },
      userInfo: null,
      detailForm: null,
      dealInfo: null,
      dealModel: {},
      dealRules: {},
      deviceInfo: {},
    });

    const goBack = () => {
      history.go(-1);
    };

    const changeFile = (value) => {
      state.model.imageIdList = value;
    };

    const afterGet = (form) => {
      state.formModel = form;
      if (form.taskId) {
        getProcessInputForm(form.taskId);
      }
      return form;
    };

    const openModal = (type) => {
      state.modalType = type;
      // 获取
      if (state.modalType === "close") {
        proxy.$api
          .deviceRunInfo(state.formModel.deviceInstanceId)
          .then((res) => {
            state.deviceInfo = res;
          });
      } else {
        getProcessInputForm(state.formModel.taskId);
      }
      state.visible = true;
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        // 评估
        if (state.modalType === "close") {
          state.model.attributes = [];
          for (let i of state.deviceInfo?.attributeValues) {
            state.model.attributes.push({
              id: i.id,
              normal: i.isNormal,
              value: i.value,
            });
          }
          const params = {
            ...state.model,
            retrofitTicketId: hiddenDangerId,
          };
          proxy.$api.renovationOrderAsse(params, "post").then(() => {
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
      state.visible = false;
      state.model = {
        score: "",
        imageList: [],
        attributes: [],
        imageIdList: [],
      };
      state.dealModel = {};
      state.dealRules = {};
    };

    const getLabel = (value, option, key) => {
      state.drawerModel[key] = option.label;
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
            if (res) {
              setForm();
            }
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
      timeFormat,
      changeFile,
      openModal,
      afterGet,
      getLabel,
      cancel,
      goBack,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
// :deep(.ant-steps-item-title) {
//   width: 200px;
// }
.deviceAttrCtr {
  max-height: 100px;
  overflow-y: auto;
}
</style>
