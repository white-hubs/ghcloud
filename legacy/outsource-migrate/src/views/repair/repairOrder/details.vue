<template>
  <g-layout title="委外工单详情">
    <template #content-table>
      <g-detail-form
        ref="detailForm"
        :api="api"
        :formList="formList"
        :afterGet="afterGet"
      >
        <template v-slot:edit-item>
          <div class="item-title">工单流程</div>
          <div>
            <a-steps class="p1" :current="1">
              <!-- 自定义图标 -->
              <template #progressDot="{ prefixCls }">
                <span :class="`${prefixCls}-icon-dot`" />
              </template>
              <a-step
                v-for="item in model?.checkProcessEvent"
                :key="item.id"
                :title="`${
                  item.handleUserName ? '【' + item.handleUserName + '】' : ''
                }${item.action}`"
                :status="'finish'"
              >
                <template #description>
                  <span>{{ item.createTime }}</span>
                  <!-- <a-button type="link" @click="detailFormId(item.id)">
                    工单链接
                  </a-button> -->
                  <!-- outsourceRepairTicketId -->
                  <a-button type="link" @click="detailFormId(item.id)">
                    处理详情
                  </a-button>
                </template>
              </a-step>
            </a-steps>
          </div>
          <div
            class="item-title"
            v-if="
              model?.status === 'WAIT_ACCEPTANCE' ||
              model?.status === 'COMPLETED'
            "
          >
            工单验收
          </div>
        </template>
      </g-detail-form>
    </template>
    <template #footer-page>
      <a-button @click="goBack">返回</a-button>
      <a-button
        type="primary"
        v-if="model?.status === 'WAIT_ACCEPTANCE'"
        @click="openModal"
      >
        验收审批
      </a-button>
    </template>
    <a-modal
      v-model:visible="visible"
      centered
      title="验收审批"
      @ok="save"
      @cancel="cancel"
    >
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
          v-for="item in orderDetailForm?.formValues"
          :label="item.formItemName"
          :name="formItemType"
          :key="item.formItemId"
        >
          <span>{{ item.val }}</span>
        </a-form-item>
        <a-form-item label="结果">
          {{ orderDetailForm.operation }}
        </a-form-item>
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
export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const modalForm = ref();
    const detailForm = ref();
    const state = reactive({
      api: {
        detail: "repairOrderId",
      },
      model: null,
      formList: [
        {
          title: "委外维修单信息",
          form: [
            { label: "工单编号", value: "code" },
            {
              label: "委外维修单",
              value: "repairReceiptName",
              html: true,
              detailFun: (value, form) => {
                return `<a href='./repairListDetails?type=detail&id=${form.applicationReceiptId}'>${value}</a>`;
              },
            },
          ],
        },
      ],
      confirmPerson: "",
      visible: false,
      detailVisi: false,
      confirmModel: {
        faultId: "",
        confirmResult: "",
        processInstanceId: "31236485",
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
      orderDetailForm: {},
      confirmInfo: {},
      dealModel: {},
      dealRules: {},
      dealInfo: {},
    });

    const goBack = () => {
      history.go(-1);
    };

    const afterGet = (form) => {
      state.model = form;
      // if (form.taskId) {
      //   getProcessInputForm(form.taskId);
      // }
      return form;
    };

    const openModal = () => {
      if (state.model.taskId) {
        getProcessInputForm(state.model.taskId);
      }
      state.visible = true;
    };

    const goPage = () => {
      router.push({
        path: "/faultOrderDetails",
        query: {
          id: state.confirmInfo.ticketId,
          type: "detail",
          hiddenDangerId: state.confirmInfo.faultId,
        },
      });
    };

    const submit = () => {
      modalForm.value.validate().then(() => {
        proxy.$api.faultConfirm(state.confirmModel, "put").then(() => {
          proxy.$message.success("操作成功");
          goBack();
        });
      });
    };

    const cancel = () => {
      modalForm.value.resetFields();
      state.visible = false;
    };

    const detailFormId = async (record) => {
      state.formId = record;
      await getForm();
    };

    const getForm = () => {
      proxy.$api.processForm(state.formId, "get").then((res) => {
        state.orderDetailForm = res;
        state.detailVisi = true;
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

    const save = () => {
      modalForm.value.validate().then(() => {
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
          taskId: state.model.taskId,
          outcome: state.dealModel.actions.val,
          formValueModifyParam: {
            processId: state.model.taskId,
            formId: state.dealModel.formId.val,
            formValues: list,
          },
        };
        proxy.$api.processComplete(params, "post").then(() => {
          proxy.$message.success("操作成功");
          detailFormRef.value.getData();
          cancel();
        });
      });
    };

    onMounted(() => {
      state.confirmModel.faultId = route.query.id;
    });

    return {
      modalForm,
      detailForm,
      ...toRefs(state),
      detailFormId,
      timeFormat,
      openModal,
      afterGet,
      goPage,
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
:deep(.ant-timeline) {
  padding-top: 12px;
  // width: 30%;
  // margin: 0 auto;
}
.recordBtn {
  padding: 0;
}
</style>
