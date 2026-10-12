<template lang="pug">
div(style="height:100%")
  g-detail(
    title="提现审批"
    :formList="formList"
    :api="api"
  )
    template(v-slot:btn="item")
      a-button(type="primary" danger @click="()=>visible=true" v-if="item.record?item.record.form.status === 'AUDITING':false") 拒绝
      a-button(type="primary" @click="confirmPass" v-if="item.record?item.record.form.status === 'AUDITING':false") 通过
      a-button(type="primary" @click="confirmPay" v-if="item.record?item.record.form.status === 'PASSED':false") 确认已划账
a-modal(v-model:visible="visible" title="不通过" @cancel="closeModal" @ok="examine('REJECTED')" :maskClosable="false" centered)
   a-form(ref="remarkForm" :model="dataForm" :rules="rules" :bodyStyle="{padding: '0'}" labelAlign="right" )
      a-form-item(label="不通过原因：" name="remark")
        a-textarea.textarea(v-model:value="dataForm.remark" placeholder="请输入" showCount :maxlength="200")   
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  createVNode,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat, millennial } from "@/utils/common.js";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      formList: [
        {
          title: "基本信息",
          form: [
            { label: "提现单号", value: "id" },
            {
              label: "商家名称",
              value: "supplier",
              detailFun: (value) => {
                if (value) {
                  return value.name ? value.name : "--";
                }
              },
            },
            {
              label: "联系人姓名",
              value: "supplier",
              detailFun: (value) => {
                if (value) {
                  return value.liaison ? value.liaison : "--";
                }
              },
            },
            {
              label: "联系人电话",
              value: "supplier",
              detailFun: (value) => {
                if (value) {
                  return value.phone ? value.phone : "--";
                }
              },
            },
            { label: "金额", value: "amount" },
            { label: "申请人", value: "owner" },
            {
              label: "到账银行卡",
              value: "bankCard",
              detailFun: (value) => {
                if (value) {
                  if (value.bank === "BCM") {
                    return (
                      "交通银行" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  } else if (value.bank === "CCB") {
                    return (
                      "中国建设银行" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  } else if (value.bank === "ICBC") {
                    return (
                      "中国工商银行" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  } else if (value.bank === "PSBC") {
                    return (
                      "中国邮政储蓄银行" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  } else if (value.bank === "ABC") {
                    return (
                      "中国农业银行" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  } else if (value.bank === "HJXCT") {
                    return (
                      "海吉星超通卡" +
                      `/${value.issuer}/${value.owner}/${value.code}`
                    );
                  }
                }
              },
            },
            {
              label: "申请时间",
              value: "createTime",
              detailFun: (value) => {
                if (value) {
                  return timeFormat(value, false);
                }
              },
              showCondition: (form) => {
                return form.createTime;
              },
            },
            {
              label: "提现状态",
              value: "status",
              detailFun: (value) => {
                if (value) {
                  if (value === "AUDITING") {
                    return "待审核";
                  } else if (value === "PASSED") {
                    return "已通过";
                  } else if (value === "REJECTED") {
                    return "已拒绝";
                  } else if (value === "CANCELED") {
                    return "已取消";
                  } else if (value === "COMPLETED") {
                    return "已完成";
                  }
                }
              },
            },
            {
              label: "取消时间",
              value: "cancelTime",
              detailFun: (value) => {
                if (value) {
                  return timeFormat(value, false);
                }
              },
              showCondition: (form) => {
                return form.cancelTime;
              },
            },
            {
              label: "完成时间",
              value: "completeTime",
              detailFun: (value) => {
                if (value) {
                  return timeFormat(value, false);
                }
              },
              showCondition: (form) => {
                return form.completeTime;
              },
            },
            { label: "划账处理人", value: "completer" },
            { label: "备注原因", value: "remark" },
          ],
        },
      ],
      api: { detail: "rechargeDetails" },
      formData: null,
      data: null,
      loading: false,
      status: null,
      bankInfo: null,
    });
    const remarkForm = ref();

    const visible = ref(false);
    const dataForm = reactive({
      id: null,
      remark: null,
      status: null,
    });
    const rules = {
      remark: [
        {
          required: true,
          message: "请输入不通过原因",
        },
      ],
    };

    // 有id
    const id = route.query.id;

    if (id) {
      state.loading = true;
      proxy.$api
        .rechargeDetails({ id: id },`get`)
        .then((res) => {
          state.formData = res;
          dataForm.id = res.id;
        })
        .finally(() => {
          state.loading = false;
        });
    }

    const cancel = () => {
      state.data = null;
      router.back(-1);
    };

    const closeModal = () => {
      visible.value = false;
      remarkForm.value.clearValidate();
    };

    const confirmPay = () => {
      Modal.confirm({
        title: "划账确认",
        icon: createVNode(ExclamationCircleOutlined),
        content: "点击即提现处理完成，请确认已完成划账。",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: () => {
          examine("COMPLETED");
        },
        onCancel: () => {},
      });
    };

    const confirmPass = () => {
      Modal.confirm({
        title: "通过确认",
        icon: createVNode(ExclamationCircleOutlined),
        content: "是否确认通过该提现申请？（通过后不可撤销）",
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: () => {
          examine("PASSED");
        },
        onCancel: () => {},
      });
    };

    const examine = (status) => {
      dataForm.status = status;
      if (visible.value) {
        remarkForm.value.validate().then(() => {
          proxy.$api.exam(dataForm, "put").then(() => {
            router.back(-1);
            proxy.$message.success("操作成功");
          });
        });
      } else {
        proxy.$api.exam(dataForm, "put").then(() => {
          router.back(-1);
          proxy.$message.success("操作成功");
        });
      }
    };

    return {
      ...toRefs(state),
      dataForm,
      cancel,
      timeFormat,
      millennial,
      visible,
      closeModal,
      rules,
      confirmPay,
      confirmPass,
      examine,
      remarkForm,
    };
  },
});
</script>
<style lang="less" scoped>

.dataTitle {
  height: calc(100% - 122px);
}
</style>
