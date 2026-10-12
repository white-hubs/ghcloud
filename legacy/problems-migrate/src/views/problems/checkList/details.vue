<template>
  <g-layout title="排查工单详情">
    <template #content-table>
      <g-detail-form
        :api="api"
        :formList="formList"
        :afterGet="afterGet"
        ref="detailFormRef"
      >
        <template v-slot:edit-item>
          <div class="item-title">工单流程</div>
          <a-steps class="p1" :current="1" v-if="processInfo?.length">
            <!-- 自定义图标 -->
            <template #progressDot="{ prefixCls }">
              <!-- <a-popover> -->
              <!-- <template #content>
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
          <a-empty v-else description="暂无流程"></a-empty>
          <template v-if="formModel?.status !== 'PENDING'">
            <div class="item-title">工单关闭</div>
            <a-form-item label="关闭人员">
              <span>{{
                closeInfo?.userNames?.length
                  ? closeInfo?.userNames.join("，")
                  : "--"
              }}</span>
            </a-form-item>
            <template v-if="formModel?.status === 'COMPLETED'">
              <a-form-item label="解决结果">
                <span>{{
                  closeInfo?.result
                    ? closeInfo?.result === "RESOLVED"
                      ? "已解决"
                      : "未解决"
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
              <a-form-item label="附件图片" class="a-form-item-100">
                <!-- <g-upload :file="closeInfo?.files"></g-upload> -->
                <a-image-preview-group v-if="closeInfo?.files.length">
                  <a-image
                    v-for="(item, index) in closeInfo?.files"
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
        v-if="formModel?.isClosedButton"
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
          <a-form-item label="描述信息">
            <a-textarea
              v-model:value="model.remark"
              :maxLength="200"
              :autoSize="{
                minRows: 2,
              }"
              placeholder="描述信息"
            ></a-textarea>
          </a-form-item>
          <a-form-item label="附件照片">
            <g-upload
              v-model:value="model.fileIds"
              :file="model.fileList"
              :businessKey="'maintain'"
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
          <span>{{
            detailForm?.operation ? detailForm?.operation : "--"
          }}</span>
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
    const detailFormRef = ref();
    const state = reactive({
      api: {
        detail: "hiddenDangerOrderId",
      },
      formList: [
        {
          title: "隐患单信息",
          form: [
            { label: "排查工单编号", value: "ticketCode" },
            {
              label: "隐患单",
              value: "name",
              html: true,
              detailFun: (value, form) => {
                return `<a href="./problemsDetails?type=detail&id=${form.id}">${value}</a>`;
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
      formId: "",
      dealDetailRules: null,
      dealDetailForm: {},
      model: {
        result: "",
        remark: "",
        fileIds: [],
        fileList: [],
      },
      modalRules: {
        result: [{ required: true, message: "请选择解决结果" }],
      },
      userInfo: null,
      processInfo: null,
      detailForm: null,
      dealInfo: null,
      dealModel: {},
      dealRules: {},
    });

    const goBack = () => {
      history.go(-1)
    };

    const afterGet = (form) => {
      proxy.$api.hiddenDangerCloseInfo(hiddenDangerId, "get").then((res) => {
        state.closeInfo = res;
      });
      state.formModel = form;
      getProcess();
      if (form.taskId) {
        getProcessInputForm(form.taskId);
      }
      return form;
    };

    const getProcess = () => {
      const params = {
        businessType: "HIDDEN_DANGER",
        businessKey: route.query.id,
      };
      proxy.$api.process(params, "get").then((res) => {
        state.processInfo = res;
      });
    };

    const openModal = (type) => {
      state.modalType = type;
      if (type !== "close") {
        setForm();
      }
      state.visible = true;
    };

    const save = () => {
      modalForm.value.validate().then(() => {
        if (state.modalType === "close") {
          const params = {
            ...state.model,
            fileIds:
              typeof state.model.fileIds === "string"
                ? state.model.fileIds.split(",")
                : [],
            hiddenDangerId: hiddenDangerId,
          };
          proxy.$api.hiddenDangerClose(params, "put").then(() => {
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
      state.model.fileList = [];
      state.model.remark = "";
      state.visible = false;
      state.dealModel = {};
      state.dealRules = {};
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
      detailFormRef,
      ...toRefs(state),
      detailFormId,
      timeFormat,
      openModal,
      afterGet,
      goBack,
      cancel,
      save,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@ghcloud-legacy/bimops-fe-web-migrate-lib/styles/gComponents/gDetailform.less");
.title {
  font-size: 16px;
}
</style>
