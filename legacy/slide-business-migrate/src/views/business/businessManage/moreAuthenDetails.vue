<template lang="pug">
div
  g-layout(
    title="认证详情"
  )
    template(#content-table)
      .detail-form
        a-form(:model="formState.data" layout="inline")
          .item-title 认证详情
          a-form-item(label="商家名称") {{formState.data?.name? formState.data?.name:'--'}}
          a-form-item(label="联系人姓名") {{formState.data?.liaison? formState.data?.liaison:'--'}}
          a-form-item(label="联系人手机号") {{formState.data?.phone? formState.data?.phone:'--'}}
          .item-title 实名认证资料
          template(v-if="formState.data?.type === 'TYPE_PERSONAL'")
            a-form-item(label="经营性质") {{formState.data?.type === 'TYPE_PERSONAL'? '个人':'企业'}} 
            a-form-item(label="经营者姓名") {{formState.data?.name? formState.data?.name:'--'}} 
            a-form-item(label="身份证号") {{formState.data?.identityCard? formState.data?.identityCard:'--'}} 
            a-form-item(label="提交时间") {{formState.data?.submitTime? timeFormat(formState.data?.submitTime,true):'--'}} 
            a-form-item(label="认证状态") {{formState.data?.status === 'AUDITED'? '待审核':formState.data?.status==='CERTIFIED'? '已认证': '不通过'}} 
            a-form-item(label="不通过原因" v-if="formState.data?.reason") {{formState.data?.reason? formState.data?.reason:'--'}}  
            a-form-item(label="身份证图片" v-if="formState.data?.fileVOS?.length")
              a-image-preview-group
                  a-space(:size="16")
                    a-image(:src="formState.data?.fileVOS[0]?.path" :fallback="fallback") 
                    a-image(:src="formState.data?.fileVOS[1]?.path" :fallback="fallback") 
          template(v-else) 
            a-form-item(label="经营主体类型") {{formState.data?.subjectType === 'TYPE_PERSONAL'? '个体工商户':'企业'}} 
            a-form-item(label="主体名称") {{formState.data?.subjectName? formState.data?.subjectName:'--'}} 
            a-form-item(label="经营证照号") {{formState.data?.licenseNo? formState.data?.licenseNo:'--'}} 
            a-form-item(label="法人姓名") {{formState.data?.name? formState.data?.name:'--'}} 
            a-form-item(label="法人身份证号") {{formState.data?.identityCard? formState.data?.identityCard:'--'}} 
            a-form-item(label="营业执照正面")
              a-image(v-if="formState.data?.fileVOS?.length" :src="formState.data?.fileVOS[0]?.path" :fallback="fallback" :height="100" :width="100") 
              span(v-else) --
            a-form-item(label="身份证图1")
              a-image(v-if="formState.data?.fileVOS?.length" :src="formState.data?.fileVOS[1]?.path" :fallback="fallback" :height="100" :width="100") 
              span(v-else) --
            a-form-item(label="身份证图2")
              a-image(v-if="formState.data?.fileVOS?.length" :src="formState.data?.fileVOS[2]?.path" :fallback="fallback" :height="100" :width="100") 
              span(v-else) --
            a-form-item(label="提交时间") {{formState.data?.submitTime? timeFormat(formState.data?.submitTime,true):'--'}}
            a-form-item(label="认证状态") {{formState.data?.status === 'AUDITED'? '待审核':formState.data?.status==='CERTIFIED'? '已认证':formState.data?.status==='FAILED'? '不通过':'未认证' }}
            a-form-item(label="不通过原因" v-if="formState.data?.reason") {{formState.data?.reason? formState.data?.reason:'--'}}
          .item-title(v-if="formState.data.sellerStatus !== 'UNAUTHORIZED'") 商家认证资料
          a-form-item(label="提交时间") {{formState.data?.sellerSubmitTime? timeFormat(formState.data?.sellerSubmitTime,true):'--'}}
          a-form-item(label="认证状态") {{formState.data?.sellerStatus === 'AUDITED'? '待审核':formState.data?.sellerStatus==='CERTIFIED'? '已认证':formState.data?.sellerStatus==='FAILED'? '不通过': '未认证'}}
          a-form-item(label="不通过原因" v-if="formState.data?.sellerReason") {{formState.data?.sellerReason? formState.data?.sellerReason:'--'}}
          a-form-item(label="主营品种")
            span(v-if="formState.data?.goodsCategories?.length")
              span.varieties(v-for="item in formState.data.goodsCategories") {{item.name}}
            span.itemContent(v-else) --
    template(#footer-page)
      a-space(:size="16")
        a-button(@click="cancel") 返回
        a-button(v-if="formState.data.status==='AUDITED'||formState.data.sellerStatus==='AUDITED'" @click="openModal" type="primary") 审核
  a-modal(v-model:visible="visible" title="审核结果" @cancel="closeModal" @ok="access" centered)
    a-form(ref="resonkForm" :model="dataForm" :rules="rules" :bodyStyle="{padding: '0'}" :maskClosable="false" :label-col="labelCol" :wrapper-col="wrapperCol" labelAlign="right")
      a-form-item(label="实名认证" name="auditStatus" v-if="formState.data.status==='AUDITED'")
        a-radio-group(v-model:value="dataForm.auditStatus")
          a-radio(:value="'CERTIFIED'") 通过
          a-radio(:value="'FAILED'") 不通过
      a-form-item(label="不通过原因：" name="auditReason" v-if="dataForm.auditStatus === 'FAILED' ")
        a-textarea.textarea(v-model:value="dataForm.auditReason" placeholder="请输入" showCount :maxlength="200" :disabled="!rules.auditReason" :auto-size="{ minRows: 2, maxRows: 18 }")  
      a-form-item(label="卖家认证" name="sellerStatus" v-if="formState.data?.sellerStatus==='AUDITED' && dataForm.auditStatus==='CERTIFIED'")
        a-radio-group(v-model:value="dataForm.sellerStatus" :disabled="sellerRadio")
          a-radio(:value="'CERTIFIED'") 通过
          a-radio(:value="'FAILED'") 不通过
      a-form-item(label="不通过原因：" name="sellerReason" v-if="dataForm.sellerStatus==='FAILED' && dataForm.auditStatus==='CERTIFIED'")
        a-textarea.textarea(v-model:value="dataForm.sellerReason" placeholder="请输入" showCount :maxlength="200" :disabled="!rules.sellerReason" :auto-size="{ minRows: 2, maxRows: 18 }") 
</template>
<script lang="jsx">
import {
  defineComponent,
  reactive,
  getCurrentInstance,
  ref,
  watch,
  createVNode,
  toRefs,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@/utils/common";
import { Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
const  fallback="data:image/png;base64,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"
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const formState = reactive({
      data: {},
      spinning: false,
    });
    const resonkForm = ref();
    const visible = ref(false);
    const sellerRadio = ref(false);
    const reasonRules = reactive({
      rules: {
        auditStatus: [
          {
            required: true,
            message: "请输入",
          },
        ],
        sellerStatus: [
          {
            required: true,
            message: "请输入",
          },
        ],
      },
    });

    const dataForm = reactive({
      id: null,
      auditStatus: null,
      auditReason: null,
      sellerStatus: null,
      sellerReason: null,
    });

    watch(
      () => dataForm.auditStatus,
      () => {
        if (dataForm.auditStatus === "CERTIFIED") {
          sellerRadio.value = false;
          dataForm.auditReason = null;
          dataForm.sellerStatus = null;
          if (reasonRules.rules.auditReason) {
            delete reasonRules.rules.auditReason;
          }
          dataForm.sellerReason = "";
        } else if (dataForm.auditStatus === "FAILED") {
          dataForm.sellerStatus = "FAILED";
          sellerRadio.value = true;
          Object.assign(reasonRules.rules, {
            auditReason: [
              {
                required: true,
                message: "请输入不通过原因",
              },
            ],
            // sellerReason: [
            //   {
            //     required: true,
            //     message: "请输入不通过原因",
            //   },
            // ],
          });
          dataForm.sellerReason = "实名认证未通过";
        }
      }
    );
    watch(
      () => dataForm.sellerStatus,
      () => {
        if (dataForm.sellerStatus === "CERTIFIED") {
          dataForm.sellerReason = null;
          if (reasonRules.rules.sellerReason) {
            delete reasonRules.rules.sellerReason;
          }
        } else {
          Object.assign(reasonRules.rules, {
            sellerReason: [
              {
                required: true,
                message: "请输入不通过原因",
              },
            ],
          });
        }
      }
    );
    // 有id
    const id = route.query.id;
    if (id) {
      formState.spinning = true;
      proxy.$api
        .authenticationId({ id: id }, "get")
        .then((res) => {
          formState.data = res;
          dataForm.auditStatus = res.status;
        })
        .finally(() => {
          formState.spinning = false;
        });
    }

    const cancel = () => {
      router.back(-1);
    };

    const access = () => {
      resonkForm.value.validate().then(() => {
        dataForm.id = formState.data.id;
        // 审核通过
        Modal.confirm({
          title: "提示",
          content: "是否提交审核结果？",
          okText: "确定",
          cancelText: "取消",
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            // dataForm.auditStatus = "CERTIFIED";
            proxy.$api.authenticationReview(dataForm,"put" ).then(() => {
              router.back(-1);
            });
          },
        });
      });
    };

    const openModal = () => {
      visible.value = true;
    };

    const closeModal = () => {
      visible.value = false;
      resonkForm.value.resetFields();
    };

    return {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
      ...toRefs(reasonRules),
      // rules,
      visible,
      sellerRadio,
      resonkForm,
      formState,
      dataForm,
      cancel,
      access,
      timeFormat,
      openModal,
      closeModal,
      fallback,
    };
  },
});
</script>
<style lang="less" scoped>
@import url("@/styles/gComponents/gDetailform.less");
</style>
