<template lang="pug">
g-layout(title="退租管理")
    template(#content-table)
        a-tabs(v-model:activeKey="activeKey")
            a-tab-pane(key="1" tab="单据信息")
                billInformation(ref="bRef")
            a-tab-pane(key="3" tab="处理进度" :disabled="!route.query.id")
                processingStep(businessType="stall_release")
    template(#footer-page)
        a-button(@click="goBack") 返回
        a-button(type="primary" danger @click="toAbolish" v-if="form.actions.indexOf('作废')>-1") 作废
        a-button(type="primary" danger @click="toAudit(false)" v-if="form.actions.indexOf('拒绝')>-1") 不通过
        a-button(type="primary" @click="toAudit(true)" v-if="form.actions.indexOf('同意')>-1") 通过
        a-button(type="primary" @click="saveRecord(true)" v-if="form.actions.indexOf('提交')>-1&&route.query.status !== 'STALL_LEASE_PENDING'") 提交
        template(v-if="route.query.type !=='detail'")
          a-button(type="primary" @click="saveRecord(false)" v-if="(route.query.status !== 'STALL_RELEASE_FINISHED'&&!route.query.progress)|| form.actions.indexOf('保存')>-1") 保存
          a-button(type="primary" @click="saveRecord(true)" v-if="(route.query.status !== 'STALL_RELEASE_FINISHED'&&!route.query.progress)|| form.actions.indexOf('保存')>-1") 保存并提交
    a-modal(v-model:visible="remarkVisible" title="不通过"  @ok="examine" :maskClosable="false" centered)
        a-form(ref="remarkForm" :model="dataForm" :rules="rules" :bodyStyle="{padding: '0'}" labelAlign="right" )
            a-form-item(label="不通过原因：" name="remark")
                a-textarea.textarea(v-model:value="dataForm.remark" placeholder="请输入" showCount :maxlength="200")
</template>

<script lang='jsx'>
import billInformation from "./components/billInformation.vue";
import processingStep from "../lease/components/processingStep.vue";

import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  createVNode,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
export default defineComponent({
  components: {
    billInformation,
    processingStep,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const activeKey = ref("1");
    const bRef = ref();
    const router = useRouter();
    const route = useRoute();
    const remarkForm = ref();
    const state = reactive({
      form: {
        contractId: null,
        code: null,
        actions: [],
      },
      dataForm: {
        remark: null,
      },
      remarkVisible: false,
      rules: {
        remark: [
          {
            required: true,
            message: "请输入不通过原因",
          },
        ],
      },
    });
    const goBack = () => {
      history.back()
    };
    const saveRecord = (boo) => {
      const data = bRef.value.form;
      if (!data.stallRelease.merchantId) {
        proxy.$message.warn("请选择商户");
        return;
      }
      if (!data.stallReleaseContract.releaseTime) {
        proxy.$message.warn("请选择退租时间");
        return;
      }
      if (!data.stallReleaseContract.remark) {
        proxy.$message.warn("请输入退租原因");
        return;
      }
      if (
        !data.stallRentContractTarget ||
        data.stallRentContractTarget.length === 0
      ) {
        proxy.$message.warn("请选择退租对象");
        return;
      }
      const stallRentContractTarget = data.stallRentContractTarget.map(
        (item) => {
          return {
            contractLeaseTargetId: item.contractLeaseTargetId,
            contractLeaseId: item.contractLeaseId,
            stallId: item.stallId,
            id: item.id,
            stallName: item.stallName,
            stallCode: item.stallCode,
            totalMoney: item.totalMoney,
            remark: item.remark,
            stallReleaseCostDetailModifyParam: item.detailVOS
              .map((m) => {
                return { ...m, stallReleaseContractTargetId: item.id };
              })
              .filter((d) => item.selectedRowKeys.indexOf(d.id) > -1),
          };
        }
      );
      const params = {
        stallReleaseBillParam: {
          merchantName: data.stallRelease.merchantName,
          merchantLiaison: data.stallRelease.merchantLiaison,
          merchantPhone: data.stallRelease.merchantPhone,
          merchantId: data.stallRelease.merchantId,
          code: data.stallRelease.code,
        },
        stallReleaseContractModifyParam: {
          contractId: data.stallReleaseContract.contractId,
          releaseTime: data.stallReleaseContract.releaseTime,
          totalMoney: data.stallReleaseContract.totalMoney,
          remark: data.stallReleaseContract.remark,
          id: data.stallReleaseContract.id,
        },
        stallReleaseContractTargetModifyParam: stallRentContractTarget,
        id: route.query.id ? route.query.id : null,
        outcome: boo ? "提交" : "保存",
      };
      if (boo) {
        proxy.$api
          .postStallRelease(params, route.query.id ? "put" : "post")
          .then((res) => {
            proxy.$api.putStallReleaseSubmit( params).then(() => {
              proxy.$message.success("操作成功");
              goBack();
            });
          });
      } else {
        proxy.$api
          .postStallRelease(params, route.query.id ? "put" : "post")
          .then(() => {
            proxy.$message.success("操作成功");
            goBack();
          });
      }
    };
    /*作废*/
    const toAbolish = () => {
      if (bRef.value.form && bRef.value.form.stallRelease.code) {
        Modal.confirm({
          title: () => "操作提醒！",
          icon: () => createVNode(ExclamationCircleOutlined),
          content: () =>
            createVNode(
              "div",
              {
                style: "color:red;",
              },
              "是否作废当前单据"
            ),

          onOk() {
            proxy.$api
              .getStallReleaseCodeVoided( bRef.value.form.stallRelease.code)
              .then((res) => {
                proxy.$message.success("操作成功");
                goBack();
              });
          },

          onCancel() {
          },

          class: "test",
        });
      }
    };
    /*审核*/
    const toAudit = (boo) => {
      if (boo) {
        if (bRef.value.form && bRef.value.form.stallRelease.code) {
          proxy.$api
            .getStallReleaseCodeAudit( {
              code: bRef.value.form.stallRelease.code,
              outcome: "同意",
            })
            .then((res) => {
              proxy.$message.success("操作成功");
              goBack();
            });
        }
      } else {
        state.remarkVisible = true;
      }
    };
    /*提交审核不通过*/
    const examine = () => {
      remarkForm.value.validate().then(() => {
        proxy.$api
          .getStallReleaseCodeAudit( {
            code: bRef.value.form.stallRelease.code,
            outcome: "拒绝",
            remark: state.dataForm.remark,
          })
          .then((res) => {
            proxy.$message.success("操作成功");
            goBack();
          });
      });
    };
    onMounted(() => {
      if (route.query.id) {
        proxy.$api.getStallReleaseId( route.query.id).then((res) => {
          state.form = res;
        });
      }
    });
    return {
      ...toRefs(state),
      activeKey,
      bRef,
      route,
      remarkForm,
      goBack,
      saveRecord,
      toAbolish,
      toAudit,
      examine,
    };
  },
});
</script>
