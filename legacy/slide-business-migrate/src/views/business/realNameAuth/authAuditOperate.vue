<template lang="pug">
g-layout(:title="type === 'detail' ? '认证详情':'认证新增'")
  template(#content-table)
    g-detail-form(
      ref="detailForm"
      :api="api"
      :rules="rules"
      :formList="formList")
      template(v-slot:edit-item="{record}")
        .item-title 资料详情
        template(v-if="record.type !== 'PERSONAL'")
          template(v-if="type !== 'detail'")
            a-form-item(:label="record.type === 'ENTERPRISE'? '主体名称':'字号名称'" name="typeName")
              a-input(v-model:value="record.typeName" :placeholder="`请输入${record.type === 'ENTERPRISE'? '主体名称':'字号名称'}`")
            a-form-item(:label="record.type === 'ENTERPRISE'? '统一信用代码':'注册号'" name="typeCode")
              a-input(v-model:value="record.typeCode" :placeholder="`请输入${record.type === 'ENTERPRISE'? '统一信用代码':'注册号'}`")
            a-form-item(:label="record.type === 'ENTERPRISE'? '法定代表人':'经营者姓名'" name="delegateName")
              a-input(v-model:value="record.delegateName" :placeholder="`请输入${record.type === 'ENTERPRISE'? '法定代表人':'经营者姓名'}`")
            a-form-item(:label="record.type === 'ENTERPRISE'?'法人身份证号':'身份证号'" name="delegateIdentityCard")
              a-input(v-model:value="record.delegateIdentityCard" :placeholder="`请输入${record.type === 'ENTERPRISE'?'法人身份证号':'经营者身份证号'}`")
            a-form-item(label="营业执照" name="licenseId")
              g-upload(v-model:value="record.licenseId" :sceneCode="GLOBAL_SCENE_CODE.merchant") 
          template(v-else)    
            a-form-item(:label="record.type === 'ENTERPRISE'? '主体名称':'字号名称'" name="typeName")
              span {{record.typeName}}
            a-form-item(:label="record.type === 'ENTERPRISE'? '统一信用代码':'注册号'" name="typeCode")
              span {{record.typeCode}}
            a-form-item(:label="record.type === 'ENTERPRISE'? '法定代表人':'经营者姓名'" name="delegateName")
              span {{record.delegateName}}
            a-form-item(:label="record.type === 'ENTERPRISE'?'法人身份证号':'身份证号'" name="delegateIdentityCard")
              span {{record.delegateIdentityCard}}
            a-form-item(label="营业执照" name="licenseFile")
              a-image(:src="`${record.licenseFile?.path}`" :width="120" :height="100")
        template(v-else)
          template(v-if="type !== 'detail'")
            a-form-item(label="经营者姓名" name="delegateName")
              a-input(v-model:value="record.delegateName" placeholder="请输入经营者姓名")
            a-form-item(label="身份证号" name="delegateIdentityCard")
              a-input(v-model:value="record.delegateIdentityCard" placeholder="请输入经营者身份证号")
          template(v-else)  
            a-form-item(label="经营者姓名" name="delegateName")
              span {{record.delegateName}}
            a-form-item(label="身份证号" name="delegateIdentityCard")
              span {{record.delegateIdentityCard}}
        template(v-if="type !=='detail'")      
          a-form-item(label="身份证正面" name="frontIdentityCardId")
            g-upload(v-model:value="record.frontIdentityCardId" :sceneCode="GLOBAL_SCENE_CODE.merchant")
          a-form-item(label="身份证反面" name="backIdentityCardId")
            g-upload(v-model:value="record.backIdentityCardId" :sceneCode="GLOBAL_SCENE_CODE.merchant")
        template(v-else)      
          a-form-item(label="身份证正面" name="frontIdentityCardFile")
            a-image(:src="`${record.frontIdentityCardFile?.path}`"  :width="120" :height="100")
          a-form-item(label="身份证反面" name="backIdentityCardFile")
            a-image(:src="`${record.backIdentityCardFile?.path}`"  :width="120" :height="100")
          a-form-item(label="审核结果" name="status" v-if="record.status !== 'AUDITED'")
            span(:class="record.status==='FAILED'? 'deleteRow':'normalRow'") {{record.status? record.status==='FAILED'? '不通过':'已通过':'--'}}
          a-form-item(label="不通过原因" name="backIdentityCardFile" v-if="record.status === 'FAILED'")
            span {{record.remark}}

  template(#footer-page)  
    a-button(@click="goBack") 返回
    a-button(type="primary" @click="submit" v-if="status === 'AUDITED'") {{type === 'addAudit'? '保存':'审核'}}
a-modal(v-model:visible="visible" centered title="认证审核结果" @ok="save" @cancel="cancel") 
  a-form(ref="modalForm" :model="model" :rules="modalRules")
    a-form-item(label="审核结果" name="status")
      a-radio-group(v-model:value="model.status")
        a-radio(:value="'CERTIFIED'") 通过
        a-radio(:value="'FAILED'") 不通过
    a-form-item(label="不通过原因" name="remark" v-if="model.status==='FAILED'") 
      a-textarea(v-model:value="model.remark" showCount :maxlength="200")   
</template>
<script lang="jsx">
import { 
  defineComponent,
  reactive,
  toRefs,
  getCurrentInstance,
  createVNode,
  ref,
  watch,
  onMounted,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { timeFormat } from "@/utils/common";
import { isIdCardNum, isIdCreditCode, isRegisterCode } from "@/utils/validator";
import { checkedWholeSalerType } from "@/utils/enumerate";
import _ from "lodash";
import { getNowEnterprise } from '@/utils/auth'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const detailForm = ref();
    const modalForm = ref();
    const valiType = ref("INDIVIDUAL_BUSINESS");
    const visible = ref(false);

    const recordType = route.query.recordType;
    const status = route.query.status;
    const type = route.query.type;
    const id = route.query.id;

    const state = reactive({
      api: {
        detail: type !== "addAudit" ? "realNameDetail" : "wholeSalerId",
      },
      formList: [
        {
          title: "主体名称",
          form:
            recordType !== "ENTERPRISE"
              ? [
                  {
                    label: "姓名",
                    value: "liaison",
                    disabled: true,
                  },
                  {
                    label: "手机号",
                    value: "phone",
                    disabled: true,
                  },
                ]
              : [
                  {
                    label: "商家名称",
                    value: "supplierName",
                  },
                  { label: "联系人姓名", value: "liaison" },
                  {
                    label: "联系人手机号",
                    value: "phone",
                  },
                ],
        },
        {
          title: "认证资料",
          form: [
            {
              label: "认证类型",
              value: "type",
              component: "a-radio-group",
              options: checkedWholeSalerType,
              detailFun: (value) => {
                if (value) {
                  if (value === "PERSONAL") {
                    return "个人";
                  } else if (value === "ENTERPRISE") {
                    return "企业";
                  } else {
                    return "个体工商户";
                  }
                } else {
                  return "--";
                }
              },
            },
            {
              label: "主体名称",
              value: "typeName",
              showCondition: () => false,
            },
            {
              label: "统一信用代码",
              value: "typeCode",
              showCondition: () => false,
            },
            {
              label: "法定代表人",
              value: "delegateName",
              showCondition: () => false,
            },
            {
              label: "法人身份证号",
              value: "delegateIdentityCard",
              showCondition: () => false,
            },
            {
              label: "审核结果",
              value: "status",
              showCondition: () => false,
            },
            {
              label: "审核时间",
              value: "submitTime",
              showCondition: () => false,
            },
            {
              label: "营业执照",
              value: "licenseId",
              showCondition: () => false,
            },
            {
              label: "身份证正面",
              value: "frontIdentityCardId",
              showCondition: () => false,
            },
            {
              label: "身份证反面",
              value: "backIdentityCardId",
              showCondition: () => false,
            },
          ],
        },
      ],
      rules: {
        type: [{ required: true, message: "请选择认证类型" }],
        typeName: [{ required: true, message: "请输入主体名称" }],
        delegateName: [{ required: true, message: "请输入" }],
        delegateIdentityCard: [
          { required: true, message: "请输入身份证号" },
          { validator: isIdCardNum },
        ],
        typeCode: [
          { required: true, message: "请输入" },
          {
            validator:
              valiType.value === "INDIVIDUAL_BUSINESS"
                ? isRegisterCode
                : isIdCreditCode,
          },
        ],
        licenseId: [{ required: true, message: "请上传营业执照正面" }],
        frontIdentityCardId: [{ required: true, message: "请上传身份证正面" }],
        backIdentityCardId: [{ required: true, message: "请上传身份证反面" }],
      },
      model: {
        id: id,
        remark: "",
        status: "CERTIFIED",
      },
      modalRules: {
        status: [{ required: true, message: "请选择审核结果" }],
        remark: [{ required: true, message: "请输入不通过原因" }],
      },
      formData: null,
    });

    const goBack = () => {
      router.back(-1);
    };

    const submit = async () => {
      // 保存
      if (type === "addAudit") {
        const res = await detailForm.value.formValidate();
        // 校验成功
        if (res) {
          const supplierId = detailForm.value.form.id;
          await proxy.$api.wholeSalerAuthinfoAdd({
            supplierId: supplierId,
            ...detailForm.value.form,
            tenant: getNowEnterprise().code,
          },"post");
          proxy.$message.success("操作成功");
          goBack();
        }
      } else {
        visible.value = true;
      }
    };

    const save = async () => {
      modalForm.value.validate().then(async () => {
        await proxy.$api.realNameAudit(state.model,"put");
        proxy.$message.success("操作成功");
        detailForm.value?.getData();
        goBack();
      });
    };

    const cancel = async () => {
      state.model.status = null;
      state.model.remark = "";
      visible.value = false;
    };

    onMounted(() => {
    });

    watch(
      () => detailForm.value?.form,
      (n) => {
        valiType.value = n.type ? n.type : "INDIVIDUAL_BUSINESS";
        // if (detailForm.value?.form?.typeCode) {
        //   detailForm.value?.formRef?.clearValidate("typeCode");
        // }
        Object.assign(state.rules, {
          typeCode: [
            { required: true, message: "请输入" },
            {
              validator:
                valiType.value === "INDIVIDUAL_BUSINESS"
                  ? isRegisterCode
                  : isIdCreditCode,
            },
          ],
        });
      },
      {
        deep: true,
      }
    );
    watch(
      () => detailForm.value?.form?.type,
      (n) => {
        if (detailForm.value?.form?.typeCode) {
          detailForm.value?.formRef?.clearValidate("typeCode");
        }
      }
    );

    return {
      type,
      status,
      visible,
      modalForm,
      detailForm,
      recordType,
      ...toRefs(state),
      goBack,
      submit,
      cancel,
      save,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>
<style scoped lang="less">
@import url("@/styles/gComponents/gDetailform.less");
</style>
