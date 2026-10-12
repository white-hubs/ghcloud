<template>
  <div class="option" v-if="operates?.length">
    <!--同意和不同意按钮-->
    <VanPopover :actions="actions" @select="onSelect" v-if="actions?.length" placement="top-start" class="more-pop">
      <template #reference>
        <div class="more"><span>更多</span><van-icon name="arrow" /></div>
      </template>
    </VanPopover>
    <span v-else data-mean="空占位"></span>

    <div class="btns">
      <template v-for="(item, i) in operates.slice(-2)">
        <VanButton
          color="var(--van-primary-color)"
          :plain="i === 0"
          :loading="handling && handlingType === item.code"
          @click="processHandle(item.code)"
        >
          {{ item?.alias || item?.name || "" }}
        </VanButton>
      </template>
    </div>
  </div>
  <!-- 评论弹窗 -->
  <comment-modal
    :taskId="props.formFlowProcess?.id"
    :processId="processId"
    :taskNodeKey="props.formFlowProcess?.key"
    :flowKey="props.formFlowProcess?.key"
    ref="commentModalRef"
    @onCommentSuccess="onCommentSuccess"
  />
  <!--审批意见&手写签名-->
  <Opinion
    :process-id="props.processId"
    :form-data="props.formData"
    :form-flow-process="props.formFlowProcess"
    :handling-type="handlingType!"
    ref="OpinionRef"
    :typeName="typeName"
    @loading="(val) => (handling = val)"
  />
  <!--转交操作-->
  <ProcessTransfer :typeName="typeName" :task-id="props.formFlowProcess.id" ref="ProcessTransferRef" />
</template>

<script setup lang="ts">
import { PopoverAction, showToast } from "vant";
import { computed, inject, ref } from "vue";
import { useRoute } from "vue-router";

import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";

import { FormFlowInstance, FormProcessOperate } from "../../domain/form-flow";
import bus from "../../infrastructure/bus";
import { closePage, endTask, handleWxProcess } from "../../infrastructure/close";
import { formFlowService } from "../../service/form-flow/form-flow.service";
import { useCurrentUser } from "../../service/staff/staff.hook";
import { OUTSOURCING_BUSINESS_TYPE } from "../business-type";
import commentModal from "./component/comment-modal.vue";
import Opinion from "./component/opinion.vue";
import ProcessTransfer from "./component/processTransfer.vue";
import { FormItemComponent } from "./form-item";

const props = defineProps<{
  processId: string;
  formData: Record<string, unknown>;
  formFlowProcess: FormFlowInstance;
  formItemComponentRef?: FormItemComponent[] | null;
  businessType: string;
  operateAlias: any;
  addFileIds: string[];
}>();
const emit = defineEmits<{
  (e: "processSuccess"): void;
}>();
const notOperates = inject("notOperates") as Boolean;
const isChildrenComponent = inject("isChildrenComponent") as boolean;
const currentUser = useCurrentUser();
const handling = ref(false);
const route = useRoute();
const handlingType = ref<FormProcessOperate>();
const actions = computed<PopoverAction[]>((): PopoverAction[] => {
  //更多弹层内容
  const res: PopoverAction[] = [];
  operates.value.slice(0, operates.value.length - 2).forEach((e) => {
    res.push({ text: e?.alias || e?.name || "", operate: e?.code });
  });
  return res;
});
const onSelect = (action: any) => {
  processHandle(action.operate);
};
const OpinionRef = ref(); //审批意见手写签名 组件
const commentModalRef = ref(); //评论弹窗 组件
const ProcessTransferRef = ref(); //转交 组件

const onCommentSuccess = (isSuccess: boolean) => {};

/** 当前是否是委外维修外链 */
const OUTSOURCING_OUTER_URL = computed(() => {
  return OUTSOURCING_BUSINESS_TYPE.includes(props.businessType) && getEnvironment() === "browser";
});

// 按钮权限处理
const operates = computed<{ code: FormProcessOperate; name: string; alias: string }[]>(() => {
  if (notOperates) {
    return [];
  }
  // 委外维修外链处理
  if (OUTSOURCING_OUTER_URL.value) {
    return [
      {
        code: FormProcessOperate.PASS,
        name: "同意",
        alias: "",
      },
    ];
  }
  const res = [...(props.operateAlias ?? props.formFlowProcess.processInstanceRunningInfo?.operateAlias ?? [])];
  // 遍历res 把code为PASS的方法到最后
  for (let i = 0; i < res.length; i++) {
    if (res[i].code === FormProcessOperate.REJECT) {
      res.push(res.splice(i, 1)[0]);
      break;
    }
  }
  for (let i = 0; i < res.length; i++) {
    if (res[i].code === FormProcessOperate.PASS) {
      res.push(res.splice(i, 1)[0]);
      break;
    }
  }
  return res;
});
const typeName = ref("");
async function processHandle(type: FormProcessOperate) {
  const operate = operates.value.find((x) => x.code === type);
  typeName.value = operate?.alias || operate?.name || "";
  handlingType.value = type;
  // 审批加一层表单校验
  if (type === FormProcessOperate.PASS && props.formItemComponentRef) {
    if (!validateForm()) {
      showToast("请检查必填项");
      return;
    }
  }
  // 同意 拒绝 退回
  if ([FormProcessOperate.PASS, FormProcessOperate.REJECT, FormProcessOperate.BACK, FormProcessOperate.WITHDRAW].includes(type)) {
    OpinionRef.value.processHandle(type);
    if (getEnvironment() === "wxMini") {
      handleWxProcess(operate);
    }
    return;
  }
  if (type === FormProcessOperate.COMMENT) {
    commentModalRef.value.open();
    return;
  }

  // 转交
  if (type === FormProcessOperate.TRANSFER) {
    ProcessTransferRef.value.showPicker();
    return;
  }

  if (handling.value) {
    return;
  }
  handling.value = true;

  try {
    // 再次发起
    if (type === FormProcessOperate.REPEAT) {
      const repeatData: Record<string, any> = {};
      for (const key in props.formData) {
        if (key.includes("field")) {
          repeatData[key] = props.formData[key];
        }
      }
      const flowProcessReapplyData = {
        businessType: props.businessType,
        flowRepeatFormData: repeatData,
      };
      sessionStorage.setItem("flowProcessReapplyData", JSON.stringify(flowProcessReapplyData));
      history.replaceState(null, "", window.location.href.replace("HANDLING", "ADD"));
      bus.emit("handelRepeat", props.businessType);
      return;
    } else if (type === FormProcessOperate.UNDO) {
      await formFlowService.processUndo(props.processId);
      showToast("操作成功");
    }
    //如果为外联调用外部的返回事件
    if (getEnvironment() !== "cubeApp") {
      const en = getEnvironment();
      window.parent.postMessage(en, "*");
      handling.value = false;
      return;
    }
    closePage("", isChildrenComponent);
    emit("processSuccess");
  } catch (error) {
  } finally {
    endTask();
  }
  handling.value = false;
}

function validateForm() {
  let result = true;
  props.formItemComponentRef?.forEach((item) => {
    const res = item.validate?.();
    if (typeof res === "string" || res === false) {
      result = false;
    }
  });
  return result;
}
</script>

<style scoped lang="less">
.option {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  height: 66px;
  box-sizing: border-box;
  background-color: #fff;
  box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.07);

  .btns {
    width: 100%;
    display: flex;
    .van-button {
      flex: 1;
      margin: 0 3vw;
      margin-right: 0;
      font-size: 4vw;
    }

    .van-button--plain {
      border: 1px solid;
    }
  }

  .more {
    font-size: 3vw;
    color: #666666;
    width: 9vw;
    white-space: nowrap;
  }
}

.cube-input-textarea {
  flex-flow: column;

  :deep(.van-field__value) {
    background-color: #fafafa;
    padding: 10px 12px;
  }
}

.cube-input-signPad {
  flex-flow: column;
}
</style>
<style lang="less">
.more-pop {
  .van-hairline--bottom:after {
    border-bottom: 1px solid #d9d9d2;
  }
}
#signature {
  background-color: #fafafa;
}
</style>
