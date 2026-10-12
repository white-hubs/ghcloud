<template lang="pug">
div
  g-layout(title="车辆管理详情")
      template(#content-table)
        g-detail-form(
            ref="detailForm"
            :formList="formList"
            :api="api"
        )
      template(#footer-page)
          a-button(@click="goBack") 返回
          a-button(v-if="status === 'WAIT_CHECK'" type="primary" @click="show") 审核
  a-modal(v-model:visible="visible" centered title="审核车辆" @ok="audit")
    a-form(ref="modalForm" :model="model" :rules="rules")
      a-form-item(label="审核结果" name="status")
        a-radio-group(v-model:value="model.status")
          a-radio(:value="'CHECK_PASS'") 通过
          a-radio(:value="'CHECK_NOT_PASS'") 不通过
      a-form-item(v-if="model.status === 'CHECK_NOT_PASS'" label="不通过原因" name="notPassReason")   
        a-textarea(
          v-model:value="model.notPassReason" 
          placeholder="请输入不通过原因" 
          showCount 
          :maxlength="200")

</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
  ref,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import { millennial } from "@/utils/common";
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();

    // const status = route.query.status;
    const id = route.query.id;

    const state = reactive({
      status: "",
      api: {
        detail: "carInfoId", //查询详情的方法
      },
      // 详情格式
      formList: [
        {
          title: "车辆信息",
          form: [
            { label: "车牌号", value: "carNo" },
            { label: "车型", value: "carTypeName" },
            { label: "车主姓名", value: "driverName" },
            { label: "手机号", value: "phone" },
            {
              label: "皮重",
              value: "carWeight",
              detailFun: (carWeight) => {
                return millennial(carWeight) + "kg";
              },
            },
            {
              label: "车长",
              value: "carLength",
              detailFun: (carLength) => {
                return millennial(carLength) + "m";
              },
            },
            {
              label: "载重",
              value: "carLoad",
              detailFun: (carLoad) => {
                return millennial(carLoad) + "kg";
              },
            },
            {
              label: "容积",
              value: "carVolume",
              detailFun: (carVolume) => {
                return millennial(carVolume) + "m³";
              },
            },
            {
              label: "审核状态",
              value: "status",
              // 方法判断值后返回对应结果
              detailFun: (status) => {
                state.status = status;
                // if (status === "WAIT_CHECK") {
                //   return "待审核";
                // } else {
                //   return "已审核";
                // }
                if (status === "WAIT_CHECK") {
                  return "--";
                } else {
                  return "已审核";
                }
              },
            },
            {
              label: "审核结果",
              value: "status",
              detailFun: (status) => {
                if (status === "WAIT_CHECK") {
                  return "--";
                } else if (status === "CHECK_PASS") {
                  return "已通过";
                } else if (status === "CHECK_NOT_PASS") {
                  return "不通过";
                } else if (status === "CANCEL_CHECK") {
                  return "已取消";
                }
                // if (status === "WAIT_CHECK") {
                //   return "待审核";
                // } else if (status === "CHECK_PASS") {
                //   return "已通过";
                // } else if (status === "CHECK_NOT_PASS") {
                //   return "不通过";
                // } else if (status === "CANCEL_CHECK") {
                //   return "已取消";
                // }
              },
            },
            {
              label: "不通过原因",
              value: "notPassReason",
              showCondition: (form) => {
                return form.status === "CHECK_NOT_PASS";
              },
            },
            {
              label: "车辆照片",
              value: "carImageFiles",
              component: "a-upload",
              singleLine: true,
              detailValue: "carImageFiles",
            },
            {
              label: "行驶证正面照片",
              value: "drivingLicenseImageFile1",
              component: "a-upload",
              singleLine: true,
              detailValue: "drivingLicenseImageFile1",
            },
            {
              label: "行驶证背面照片",
              value: "drivingLicenseImageFile2",
              component: "a-upload",
              singleLine: true,
              detailValue: "drivingLicenseImageFile2",
            },
          ],
        },
      ],
    });

    const visible = ref(false);
    const modalForm = ref();
    const detailForm = ref();
    const model = ref({
      status: "CHECK_PASS",
      notPassReason: "",
    });

    const rules = {
      status: [{ required: true, message: "请选择" }],
      notPassReason: [{ required: true, message: "请输入不通过原因" }],
    };

    const goBack = () => {
      history.back()
    };

    const show = () => {
      visible.value = true;
    };

    const audit = () => {
      modalForm.value.validate().then(async () => {
        const data = {
          id: id,
          ...model.value,
        };
        proxy.$api
          .carInfoAudit(data, "put")
          .then(() => {
            proxy.$message.success("操作成功");
            goBack();
          })
          .catch(() => {
            detailForm.value.getData();
          });
      });
    };

    onMounted(async () => {});

    return {
      visible,
      modalForm,
      detailForm,
      model,
      rules,
      ...toRefs(state),
      goBack,
      show,
      audit,
    };
  },
});
</script>
