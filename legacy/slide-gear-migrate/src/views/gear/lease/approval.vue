<template lang="pug">
div
    g-layout(title="租赁管理")
        template(#content-table)
            a-tabs(v-model:activeKey="activeKey")
                a-tab-pane(key="1" tab="单据信息" :forceRender="true")
                    billInformation(ref="bRef")
                a-tab-pane(key="2" tab="合同信息" :forceRender="true")
                    contractInfo(ref="cRef" :contractId="form.contractId" :byContractId="true")
                a-tab-pane(key="3" tab="处理进度" v-if="route.query.id" :forceRender="true")
                    processingStep
        template(#footer-page)
            a-button(@click="goBack") 返回
            a-button(type="primary" danger @click="toAbolish" v-if="form.actions.indexOf('作废')>-1") 作废
            a-button(type="primary" danger @click="toAudit(false)" v-if="form.actions.indexOf('拒绝')>-1") 不通过
            a-button(type="primary" @click="toAudit(true)" v-if="form.actions.indexOf('同意')>-1") 通过
            a-button(type="primary" @click="saveRecord(true)" v-if="form.actions.indexOf('提交')>-1&&route.query.status !== 'STALL_LEASE_PENDING'") 提交
            a-button(type="primary" @click="previewContract") 预览合同
            template(v-if="route.query.type !=='detail'")
                a-button(type="primary" @click="saveRecord(false)" v-if="(route.query.status !== 'STALL_LEASE_FINISHED'&&!route.query.progress) || form.actions.indexOf('保存')>-1") 保存
                a-button(type="primary" @click="saveRecord(true)" v-if="(route.query.status !== 'STALL_LEASE_FINISHED'&&!route.query.progress) || form.actions.indexOf('保存')>-1") 保存并提交
    a-modal(
        v-model:visible="fullModal.visible"
            title="文件预览"
            width="100%"
            wrapClassName="full-modal"
            okText="打印"
            @ok="handleOk"
    )
        iframe(:src="'/office-preview/index.html?file=' + fullModal.src"
            ref="iframeRef")
    a-modal(v-model:visible="remarkVisible" title="不通过"  @ok="examine" :maskClosable="false" centered)
        a-form(ref="remarkForm" :model="dataForm" :rules="rules" :bodyStyle="{padding: '0'}" labelAlign="right" )
            a-form-item(label="不通过原因：" name="remark")
                a-textarea.textarea(v-model:value="dataForm.remark" placeholder="请输入" showCount :maxlength="200")  
</template>

<script lang='jsx'>
import billInformation from "./components/billInformation.vue";
import processingStep from "./components/processingStep.vue";
import contractInfo from "./components/contractInfo.vue";

import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  createVNode,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
export default defineComponent({
  components: {
    billInformation,
    contractInfo,
    processingStep,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const bRef = ref();
    const cRef = ref();
    const remarkForm = ref();
    const state = reactive({
      form: {
        contractId: null,
        code: null,
        actions: [],
      },
      stallLeaseBillParam: null,
      leaseContractCreateParam: null,
      activeKey: "1",
      fullModal: {
        visible: false,
        src: null,
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
    const iframeRef = ref();
    const goBack = () => {
      history.back()
    };

    onMounted(() => {
      state.stallLeaseBillParam = bRef.value.form;
      if (route.query.id) {
        proxy.$api.getStallLeaseId( route.query.id).then((res) => {
          state.form = res;
        });
      }
    });
    /*提交保存*/
    const submitRecord = (boo) => {
      proxy.$api
        .postStallLease({
          stallLeaseBillParam: bRef.value.form,
          leaseContractCreateParam: cRef.value.returnData(),
          id: route.query.id ? route.query.id : null,
        },route.query.id ? "put" : "post")
        .then((res) => {
          if (boo) {
            proxy.$api
              .putStallLeaseSubmit({
                stallLeaseBillParam: bRef.value.form,
                leaseContractCreateParam: cRef.value.returnData(),
                id: route.query.id ? route.query.id : res,
                outcome: "提交",
              },"put")
              .then(() => {
                proxy.$message.success("操作成功");
                goBack();
              });
          } else {
            proxy.$message.success("操作成功");
            goBack();
          }
        });
    };
    /*点击保存*/
    const saveRecord = (boo) => {
      if (!cRef.value) {
        state.activeKey = "2";
        return;
      }
      if (state.activeKey === "1") {
        bRef.value.formRef.validate().then((res) => {
          cRef.value.formRef
            .validate()
            .then((res) => {
              submitRecord(boo);
            })
            .catch(() => {
              state.activeKey = "2";
            });
        });
      }

      if (state.activeKey === "2") {
        cRef.value.formRef.validate().then((res) => {
          bRef.value.formRef
            .validate()
            .then((res) => {
              submitRecord(boo);
            })
            .catch(() => {
              state.activeKey = "1";
            });
        });
      }

      if (state.activeKey === "3") {
        bRef.value.formRef
          .validate()
          .then((res) => {
            cRef.value.formRef
              .validate()
              .then((res) => {
                submitRecord(boo);
              })
              .catch(() => {
                state.activeKey = "2";
              });
          })
          .catch(() => {
            state.activeKey = "1";
          });
      }
    };

    /*预览合同*/
    const previewContract = () => {
      if (!cRef.value) {
        proxy.$message.warn("请完善合同信息");
        state.activeKey = "2";
        return;
      }
      cRef.value.formRef
        .validate()
        .then(() => {
          const data = cRef.value.returnData();
          const pramas = Object.assign(
            data.contractCreateParam.signInfoModifyParam,
            {
              id: data.contractCreateParam.contractTmpId,
            }
          );
          proxy.$api.postContractLeaseBrowse( pramas).then((res) => {
            if (res&&res.path) {
              state.fullModal.visible = true;
              state.fullModal.src = res.path;
            } else {
              proxy.$message.warn("当前模板未上传附件");
            }
          });
        })
        .catch(() => {
          proxy.$message.warn("请完善合同信息");
          state.activeKey = "2";
        });
    };
    const handleOk = () => {
      let prnHtml =
        iframeRef.value.contentWindow.document.getElementById("top").innerHTML; //需要打印的内容
      const newWin = window.open(); // 新打开一个空窗口
      newWin.document.body.innerHTML = prnHtml; //把需要打印的内容插入新窗口
      newWin.document.close(); //关闭文档输入流（window.close()和document.close()的区别）
      newWin.focus();
      setTimeout(() => {
        //定时器等待，JS单线程，异步执行此行代码
        newWin.print();
        newWin.close(); //打印完成或取消，关闭新窗口
      }, 300);
    };
    /*作废*/
    const toAbolish = () => {
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
            .getStallLeaseCodeVoided( state.form.code)
            .then((res) => {
              proxy.$message.success("操作成功");
              goBack();
            });
        },

        onCancel() {
        },

        class: "test",
      });
    };
    /*审核*/
    const toAudit = (boo) => {
      if (boo) {
        proxy.$api
          .getStallLeaseCodeAudit( {
            code: state.form.code,
            outcome: "同意",
          })
          .then((res) => {
            proxy.$message.success("操作成功");
            goBack();
          });
      } else {
        state.remarkVisible = true;
      }
    };
    /*提交审核不通过*/
    const examine = () => {
      remarkForm.value.validate().then(() => {
        proxy.$api
          .getStallLeaseCodeAudit( {
            code: state.form.code,
            outcome: "拒绝",
            remark: state.dataForm.remark,
          })
          .then((res) => {
            state.visible = false;
            proxy.$message.success("操作成功");
            goBack();
          });
      });
    };
    return {
      route,
      bRef,
      cRef,
      iframeRef,
      remarkForm,
      ...toRefs(state),
      goBack,
      saveRecord,
      previewContract,
      handleOk,
      toAbolish,
      toAudit,
      examine,
    };
  },
});
</script>
<style lang="less">
.full-modal {
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .ant-modal-body {
    flex: 1;
  }
}
</style>
