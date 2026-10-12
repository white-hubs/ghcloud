<template lang="pug">
div(:style="{ height:'100%'}")
    g-layout(
        title="合同信息"
    )
        template(#content-table)
            a-tabs(v-model:activeKey="activeKey")
                a-tab-pane(key="1" tab="合同信息" )
                    contractInfo(ref="contractInfoRef")
                a-tab-pane(key="2" tab="费用明细" v-if="route.query.id&&route.query.type!=='renewal'")
                    feeDetail(v-if="activeKey === '2'")
        template(#footer-page)
            a-button(@click="onBack") 返回
            a-button(type="primary"
                danger
                @click="onCancel('作废')"
                v-if="route.query.status &&(route.query.status === 'STATUS_DRAFT' ||route.query.status === 'STATUS_BE_SIGNED')") 作废
            a-button(type="primary"
                danger
                @click="onCancel('终止')"
                v-if="route.query.status &&(route.query.status === 'STATUS_BE_EFFECTIVE' || route.query.status === 'STATUS_EFFECTIVE')") 终止
            a-button(type="primary" @click="previewContract") 预览合同
            //- a-button( type="primary"
            //-     @click="updateFee"
            //-     v-if="route.query.status && route.query.status === 'STATUS_DRAFT'&&route.query.type !== 'detail'") 生成/更新费用明细
            a-button(  type="primary"
                @click="onSubmit"
                v-if="route.query.type && route.query.type === 'supplementary'") 保存
            a-button(  type="primary"
                @click="onSubmit('renewal')"
                v-if="route.query.type && route.query.type === 'renewal'") 续签
            a-button(  type="primary"
                @click="onSubmit"
                v-if="(route.query.type && route.query.type === 'add') || (route.query.status && route.query.status === 'STATUS_DRAFT'&&route.query.type !== 'detail')") 保存草稿
            a-button(  type="primary"
                @click="onSigned('保存并签订')"
                v-if="(route.query.type && route.query.type === 'add') ||(route.query.status && route.query.status === 'STATUS_DRAFT'&&route.query.type !== 'detail')") 保存并签订
            a-button(  type="primary"
                @click="onSigned('保存并签订')"
                v-else-if="route.query.status === 'STATUS_DRAFT'") 签订
            a-button(  type="primary"
                @click="onSigned('线下签订')"
                v-if="route.query.status && route.query.status === 'STATUS_BE_SIGNED'") 线下签订
    a-modal(
        v-model:visible.sync="cancelModal.visible"
        width="600px"
        :title="cancelModal.title"
        @ok="submitCancel"
    )
        a-form(:model="cancelModal.formState"
            :rules="cancelModal.rules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 17 }"
            ref="cancelFormRef")
            a-form-item(:label="cancelModal.title + '日期'")  {{ cancelModal.formState.date }}      
            a-form-item(:label="cancelModal.title + '原因'" name="reason")
                a-textarea(
                    v-model:value="cancelModal.formState.reason"
                        placeholder="请输入"
                        :rows="4"
                        maxlength="50"
                        showCount
                )
    a-modal(
        v-model:visible.sync="signedModal.visible"
            width="600px"
            :title="signedModal.title"
            @ok="submitSigned"
    )
        a-form( :model="signedModal.formState"
            :rules="signedModal.rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 17 }"
            ref="signedFormRef")
            a-form-item(label="签订日期" name="signTime")
                a-date-picker(
                    v-model:value="signedModal.formState.signTime"
                        placeholder="请选择签订日期"
                        style="width: 100%"
                )
            a-form-item(label="纸质合同编号" name="paperCode")
                a-input(
                    v-model:value="signedModal.formState.paperCode"
                        placeholder="请输入纸质合同编号"
                )
            a-form-item(label="合同附件" name="fileIds")
                g-upload(@changeFile="handleChange" v-if="signedModal.visible" :max="10")
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
</template>

<script lang="jsx">
import contractInfo from "./components/contractInfo.vue";
import feeDetail from "./components/feeDetail.vue";
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  createVNode,
  getCurrentInstance,
} from "vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { timeFormat } from "@/utils/common.js";
import {getToken, getNowEnterprise } from '@/utils/auth'
export default defineComponent({
  components: {
    contractInfo,
    feeDetail,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeKey = ref("1");
    const contractInfoRef = ref();
    const iframeRef = ref();
    const fileList = ref([]);
    const { proxy } = getCurrentInstance();
    const cancelFormRef = ref();
    const signedFormRef = ref();
    const headers = reactive({
      Authorization:
        "Bearer " + getToken().access_token,
      tenant: getNowEnterprise().code,
      terminal: window.config.terminal,
    });

    const modalReactive = reactive({
      cancelModal: {
        visible: false,
        title: "作废",
        formState: {
          date: timeFormat(new Date(), false),
          reason: "",
        },
        rules: {
          reason: [
            {
              required: true,
              message: "请输入原因",
              trigger: "blur",
            },
          ],
        },
      },
      signedModal: {
        visible: false,
        formState: {
          signTime: null,
          paperCode: null,
          fileIds: [],
        },
        rules: {
          signTime: [
            {
              required: true,
              message: "请选择签订日期",
              trigger: "change",
              type: "date",
            },
          ],
          fileIds: [
            {
              required: true,
              message: "请上传格式为.jpg/.jpeg/.png的合同附件",
              trigger: "change",
              type: "array",
            },
          ],
          paperCode: [
            {
              required: true,
              message: "请输入纸质合同编号",
              trigger: "blur",
            },
          ],
        },
      },
      fullModal: {
        visible: false,
        src: null,
      },
    });
    /*返回*/
    const onBack = () => {
      history.back()
    };
    /*生成费用明细*/
    const updateFee = () => {
      proxy.$api
        .postContractLeaseCostDetailId( route.query.id)
        .then((res) => {
          proxy.$message.success("更新成功");
        });
    };
    const onSubmit = (type) => {
      contractInfoRef.value.formRef.validate().then((res) => {
        const data = contractInfoRef.value.returnData();
        if (type === "renewal") {
          data["contractRenewalParam"] = data.contractCreateParam;
        }
        let errMsg = "";
        data.leaseTargetModifyParams.forEach((item) => {
          if (item.leaseCostProjectModifyParams.length === 0) {
            errMsg = "收费项目不能为空";
          } else {
            item.leaseCostProjectModifyParams.forEach((l) => {
              if (Number(l.unitPrice) <= 0) {
                errMsg = "请输入正确单价";
              }
            });
          }
        });
        if (errMsg) {
          proxy.$message.warn(errMsg);
          return;
        }
        if (route.query.type === "add") {
          proxy.$api.postContractLease( data).then((res) => {
            proxy.$message.success("操作成功");
            history.back()
          });
        } else if (route.query.status === "STATUS_DRAFT") {
          proxy.$api
            .putContractLease(
              Object.assign(data, {
                id: route.query.id,
              })
            )
            .then((res) => {
              proxy.$message.success("操作成功");
              history.back()
            });
        } else if (route.query.type === "supplementary") {
          proxy.$api.postContractLeaseSupplementary( data).then((res) => {
            proxy.$message.success("操作成功");
            history.back()
          });
        } else if (route.query.type === "renewal") {
          //续签
          data.contractRenewalParam.oldCode = data.contractRenewalParam.code;
          data.contractRenewalParam.code = null;
          proxy.$api.postContractLeaseRenewal( data).then((res) => {
            proxy.$message.success("操作成功");
            history.back();
          });
        }
      });
    };

    //作废操作
    const onCancel = (title) => {
      modalReactive.cancelModal.title = title;
      modalReactive.cancelModal.visible = true;
    };
    const submitCancel = () => {
      cancelFormRef.value.validate().then(() => {
        if (modalReactive.cancelModal.title === "作废") {
          proxy.$api
            .putContractLeaseAolish( {
              id: route.query.id,
              obsoleteReason: modalReactive.cancelModal.formState.reason,
            })
            .then((res) => {
              proxy.$message.success("操作成功!");
              modalReactive.cancelModal.visible = false;
              history.back();
            });
        } else if (modalReactive.cancelModal.title === "终止") {
          proxy.$api
            .putContractLeaseStop( {
              id: route.query.id,
              stopReason: modalReactive.cancelModal.formState.reason,
              stopTime: modalReactive.cancelModal.formState.date,
            })
            .then((res) => {
              proxy.$message.success("操作成功!");
              modalReactive.cancelModal.visible = false;
              history.back();
            });
        }
      });
    };
    /*保存并签订*/
    const onSigned = (title) => {
      contractInfoRef.value.formRef.validate().then((res) => {
        const data = contractInfoRef.value.returnData();
        let errMsg = "";
        data.leaseTargetModifyParams.forEach((item) => {
          if (item.leaseCostProjectModifyParams.length === 0) {
            errMsg = "收费项目不能为空";
          } else {
            item.leaseCostProjectModifyParams.forEach((l) => {
              if (Number(l.unitPrice) <= 0) {
                errMsg = "请输入正确单价";
              }
            });
          }
        });
        if (errMsg) {
          proxy.$message.warn(errMsg);
          return;
        }
        modalReactive.signedModal.formState = {
          signTime: null,
          paperCode: null,
          fileIds: [],
        };
        modalReactive.signedModal.title = title;
        modalReactive.signedModal.visible = true;
      });
    };
    const submitSigned = () => {
      if (modalReactive.signedModal.title === "保存并签订") {
        modalReactive.signedModal.formState.signTime = modalReactive.signedModal
          .formState.signTime
          ? timeFormat(modalReactive.signedModal.formState.signTime, false)
          : null;
        signedFormRef.value.validate().then((res) => {
          if (route.query.id) {
            proxy.$api
              .putContractLease( {
                ...contractInfoRef.value.returnData(),
                id: route.query.id,
              })
              .then((res) => {
                proxy.$api
                  .putContractLeaseSigned( {
                    source: "CREATE_MANUAL",
                    signConcludeType: "OFFLINE",
                    signTime: modalReactive.signedModal.formState.signTime,
                    paperCode: modalReactive.signedModal.formState.paperCode,
                    fileIds: modalReactive.signedModal.formState.fileIds,
                    id: route.query.id,
                  })
                  .then((res) => {
                    proxy.$message.success("操作成功!");
                    modalReactive.signedModal.visible = false;
                    history.back();
                  });
              });
          } else {
            proxy.$api
              .postContractLease( contractInfoRef.value.returnData())
              .then((res) => {
                proxy.$api
                  .putContractLeaseSigned( {
                    source: "CREATE_MANUAL",
                    signConcludeType: "OFFLINE",
                    signTime: modalReactive.signedModal.formState.signTime,
                    paperCode: modalReactive.signedModal.formState.paperCode,
                    fileIds: modalReactive.signedModal.formState.fileIds,
                    id: res,
                  })
                  .then((res) => {
                    proxy.$message.success("操作成功!");
                    modalReactive.signedModal.visible = false;
                    history.back();
                  });
              });
          }
        });
      } else {
        Modal.confirm({
          title: "签订确认",
          icon: createVNode(ExclamationCircleOutlined),
          content:
            " 确认合同已签订完成，合同附件已上传且正确。保存后合同信息不能再修改。",
          okText: "确认",
          cancelText: "取消",
          onCancel: () => {
          },
          onOk: () => {
            signedFormRef.value.validate().then((res) => {
              proxy.$api
                .putContractLeaseSigned( {
                  source: "CREATE_MANUAL",
                  signConcludeType: "OFFLINE",
                  signTime: modalReactive.signedModal.formState.signTime,
                  paperCode: modalReactive.signedModal.formState.paperCode,
                  fileIds: modalReactive.signedModal.formState.fileIds,
                  id: route.query.id,
                })
                .then(() => {
                  proxy.$message.success("操作成功!");
                  modalReactive.signedModal.visible = false;
                  history.back();
                });
            });
          },
        });
      }
    };

    //选择文件
    const handleChange = (info) => {
      modalReactive.signedModal.formState.fileIds = info;
    };
    //预览合同
    const previewContract = () => {
      contractInfoRef.value.formRef.validate().then((res) => {
        const data = contractInfoRef.value.returnData();
        const pramas = Object.assign(
          data.contractCreateParam.signInfoModifyParam,
          {
            id: data.contractCreateParam.contractTmpId,
          }
        );
        proxy.$api.postContractLeaseBrowse( pramas).then((res) => {
          if (res&&res.path) {
            modalReactive.fullModal.visible = true;
            modalReactive.fullModal.src = res.path;
          } else {
            proxy.$message.warn("当前模板未上传附件");
          }
        });
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
    return {
      ...toRefs(modalReactive),
      activeKey,
      contractInfoRef,
      route,
      router,
      cancelFormRef,
      signedFormRef,
      iframeRef,
      headers,
      handleChange,
      onBack,
      onSubmit,
      onCancel,
      submitCancel,
      updateFee,
      onSigned,
      submitSigned,
      previewContract,
      handleOk,
    };
  },
});
</script>

<style lang="less" scoped>

</style>
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
