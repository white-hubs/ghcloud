<template>
  <a-space :size="1">
    <a-button @click="goBack">返回</a-button>
    <a-button type="primary" @click="submit" :loading="isLoading" v-if="processType === ProcessType.ADD">{{ addAlias }}</a-button>
    <a-button
      v-for="(item, i) in operates"
      :key="i"
      :type="FormProcessOperateEnum[item.code as FormProcessOperate].btnType"
      @click="processHandle(item.code, item)"
      :loading="handlingName === item.code && !showSignModal"
    >
      {{ item.alias || item.name || "" }}
    </a-button>
  </a-space>
  <!--转交人员弹窗-->
  <transferModal :title="currentOperate?.alias || currentOperate?.name || ''" ref="transferModalRef" :taskId="currentTaskDetail?.id" />
  <!-- 评论弹窗 -->
  <commentModal :taskId="currentTaskDetail?.id" :processId="processId" :taskNodeKey="currentTaskDetail?.key" ref="commentModalRef" />
  <!--审批意见 手写签名-->
  <a-modal
    v-model:visible="showSignModal"
    :title="currentOperate?.alias || currentOperate?.name || ''"
    centered
    okText="保存"
    @ok="onConfirmSignModal"
    @cancel="closeSignModal"
    :confirmLoading="isLoading"
  >
    <a-form :model="formState" ref="signModelFormRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
      <a-form-item label="审批意见" name="opinion" v-if="showOpinion">
        <a-textarea v-model:value="formState.opinion" :auto-size="{ minRows: 5, maxRows: 5 }" />
      </a-form-item>
      <a-form-item label="手写签名" name="sign" :rules="[{ required: true, message: '请手写签名' }]" v-if="showSign">
        <img :src="signPicSrc" v-if="signPicSrc" alt="" width="392" height="200" srcset="" style="border: 1px solid #ccc" />
        <VueSignaturePad v-else="!signPicSrc" id="signature" width="100%" height="200px" ref="signaturePad" />
        <div class="sign-btn">
          <a-button type="link" @click="clearWriteSign">清除签名</a-button>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="tsx">
import { FormInstance, Popover, message } from "ant-design-vue";
import { computed, inject, onMounted, reactive, ref, Ref, nextTick, h, watch } from "vue";
import { useRoute } from "vue-router";
import { VueSignaturePad } from "vue-signature-pad";

import { BUSINESS_KEY_TO_SCENE_CODE, GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import { embeddedFlowDetailBackKey, performFlowDetailBack } from "./embedded-navigation";
import { getNode } from "./units";
import { postClassesChangeCheck, postClockRepairCheck } from "@/api/attendance";
import { attendanceApprovalSubmit } from "@/api/attendance";
import {
  firstTaskActive,
  postFormFlowsFirst,
  postProcessTaskBack,
  postProcessTaskComplete,
  postProcessTaskReject,
  postProcessTaskRepeat,
  postProcessTaskUndo,
  postProcessTransfer,
  getLastWriteSign,
  postProcessWidthDraw,
} from "@/api/flow";
import { getTaskNodes } from "@/api/flow";
import {
  cubeFileService,
  cubeParkingLotService,
  cubeVisitorManagementService,
  cubePersonnelManagementService,
  cubeHotelManagementService,
} from "@/api/service";
import commentModal from "@/components/form/components/commentModal.vue";
import transferModal from "@/components/form/components/transferModal.vue";
import {
  ApprovalOpinion,
  FlowForm,
  OperateAlias,
  PostProcessTaskBack,
  PostProcessTaskComplete,
  PostProcessTaskReject,
} from "@/domain/form-flow";
import { StaffUser } from "@/domain/staff";
import { FormProcessInstance, FormProcessInstanceStatus, FormProcessOperate, FormProcessOperateEnum, ProcessType } from "@/typings/process";
import { getNowEnterprise } from "@/utils/auth";

const route = useRoute();
const repeatFlag = route.query.repeat;
const processType = inject("processType");
const businessType = inject("businessType") as string;
const currentTaskDetail = inject("currentTaskDetail") as Ref;
const currentUser = inject("currentUser") as Ref;
const processId = inject("processId") as string;
const flowForm = inject("flowForm") as Ref<FlowForm>;
const onEmbeddedBack = inject(embeddedFlowDetailBackKey, undefined);
const signPicSrc = ref("");
const nodeOptions = ref<any[]>([]);
const sceneCode = BUSINESS_KEY_TO_SCENE_CODE.get((route.query.businessType as string) ?? "") ?? GLOBAL_SCENE_CODE.approvalCenter;

const props = withDefaults(
  defineProps<{
    formRenderRef: { formRef: FormInstance; formData: Record<string, any> };
    formProcess: { selfSelectApproveUsers: Record<string, any[]> };
    notOperates?: boolean;
  }>(),
  {
    notOperates: false,
  },
);
const emits = defineEmits(["changeTab"]);
const isLoading = ref(false); //按钮loading
let lastSignId = ""; //上一次签名的id
const goBack = () => {
  performFlowDetailBack({
    onEmbeddedBack,
    repeat: Boolean(repeatFlag),
    historyApi: history,
    removeRepeatData: () => sessionStorage.removeItem("flow-repeat-data"),
  });
};

const addAlias = JSON.parse(flowForm.value.flowJson)?.props?.operateAlias?.[0]?.alias || "发起";
const approveUsers = computed(() => {
  if (!(props.formProcess && props.formProcess.selfSelectApproveUsers)) {
    return {};
  }
  const approveUsers: Record<string, string> = {};
  for (const key in props.formProcess.selfSelectApproveUsers) {
    const item = props.formProcess.selfSelectApproveUsers[key];
    approveUsers[key] = item.map((item: { id: string }) => item.id).join(",");
  }
  return approveUsers;
});

type BackLogTitleFormItem = {
  id: string;
  name: string;
  props?: {
    useAsBackLogTitle?: boolean;
    items?: BackLogTitleFormItem[];
  };
};

const getDefaultBackLogTitle = () => {
  try {
    const userInfo = sessionStorage.getItem("GH-UserInfo");
    const userName = userInfo ? JSON.parse(userInfo).name : "";
    return userName ? userName + "发起的" + flowForm.value.businessTypeName : "";
  } catch {
    return "";
  }
};

const findBackLogTitleFormItem = (items: BackLogTitleFormItem[] = []): BackLogTitleFormItem | undefined => {
  for (const item of items) {
    if (item.name === "TextInput" && item.props?.useAsBackLogTitle) {
      return item;
    }

    if (Array.isArray(item.props?.items)) {
      const found = findBackLogTitleFormItem(item.props.items);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

const getBackLogTitle = () => {
  const defaultTitle = getDefaultBackLogTitle();
  try {
    const formItems = flowForm.value.formJson ? JSON.parse(flowForm.value.formJson) : [];
    const titleFormItem = findBackLogTitleFormItem(Array.isArray(formItems) ? formItems : []);
    if (!titleFormItem) {
      return defaultTitle;
    }

    const value = props.formRenderRef.formData?.[titleFormItem.id];
    const title = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
    return title;
  } catch {
    return defaultTitle;
  }
};
//权限处理
const operates = computed(() => {
  if (!currentTaskDetail.value || props.notOperates) {
    return [];
  }
  const res = [...(currentTaskDetail.value.processInstanceRunningInfo?.operateAlias ?? [])];
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

//新增流程提交
const submit = async () => {
  props.formRenderRef.formRef.validate().then(async () => {
    let checkRes = true;
    //考勤校验
    try {
      isLoading.value = true;
      const CheckParams = {
        formId: flowForm.value.formDefinitionId,
        formData: JSON.stringify(props.formRenderRef.formData),
      };
      if (businessType === "CHANGE_CLASSES") {
        await postClassesChangeCheck(CheckParams).then((res) => {
          checkRes = res;
        });
      } else if (businessType === "REPAIR_CLOCK") {
        await postClockRepairCheck({ businessType, flowData: CheckParams }).then((res) => {
          checkRes = res;
        });
      }
    } catch (error) {
      checkRes = false;
    } finally {
      isLoading.value = false;
    }

    if (checkRes) {
      postSubmit();
    }
  });
};

//获取审批节点
function getApprovaAndCClNode(obj: any, arr: any[] = []): any[] {
  if (!obj) return [];
  if (obj.type === "APPROVAL" || obj.type === "CC") {
    arr.push(obj);
  }
  if (typeof obj.branchs !== "undefined" && obj.branchs.length > 0) {
    for (const key in obj.branchs) {
      if (obj.branchs[key].type === "APPROVAL" || obj.type === "CC") {
        arr.push(obj.branchs[key]);
      }
      if (typeof obj.branchs[key].children !== "undefined") {
        getApprovaAndCClNode(obj.branchs[key].children, arr);
      }
    }
  }
  if (typeof obj.children !== "undefined") {
    getApprovaAndCClNode(obj.children, arr);
  }
  return arr;
}

function getBranchs(obj: any, arr = []): any[] {
  if (!obj) return [];
  if (typeof obj.branchs !== "undefined" && obj.branchs.length > 0) {
    for (const key in obj.branchs) {
      // @ts-expect-error
      arr.push(obj.branchs[key]);
      if (typeof obj.branchs[key].children !== "undefined") {
        getBranchs(obj.branchs[key].children, arr);
      }
    }
  }
  if (typeof obj.children !== "undefined") {
    getBranchs(obj.children, arr);
  }
  return arr;
}
function getConditions(arr: any): any[] {
  let res: any[] = [];
  arr.forEach((e: any) => {
    const groups = e?.props?.groups;
    if (!Array.isArray(groups)) {
      return;
    }
    groups.forEach((ele: any) => {
      if (Array.isArray(ele?.conditions)) {
        res = [...res, ...ele.conditions];
      }
    });
  });
  return res;
}
function convertConditions(arr: any[], formData: any): Record<string, any> {
  const obj: Record<string, any> = {};
  arr.forEach((e) => {
    const key = e.id;
    let value = formData[key];
    obj[key] = value;
    if (key !== "root") {
      obj[key] = value ?? "";
    }
    // 值需要转换
    if (e.name === "OvertimeLength") {
      // 加班时长，目前单位都是小时 需要转换成天
      value = Math.floor((formData[key].name / 8) * 100) / 100;
      obj[key] = parseFloat(value);
    }
    if (e.name === "VacationLength") {
      // 请假时长，DAY 天 HOUR 小时 HALF_DAY半天
      value = Math.floor((formData[key] / 8) * 100) / 100;
      obj[key] = parseFloat(value);
    }
    if (e.name === "DepartureTimeLength") {
      value = Math.floor((formData[key] / 8) * 100) / 100;
      obj[key] = parseFloat(value);
    }
    if (e.name === "DeptPicker") {
      if (formData[key].length) {
        value = formData[key].map((item: any) => item.id);
      } else {
        value = [];
      }
      obj[key] = value;
    }
  });
  return obj;
}

const postSubmit = async () => {
  try {
    isLoading.value = true;
    // 条件变量获取与转换
    const branchArr = getBranchs(JSON.parse(flowForm.value.flowJson));

    const conditions = getConditions(branchArr);
    const variables = convertConditions(conditions, props.formRenderRef.formData);
    // 隐藏排查、故障报修传参
    if (["FAULT", "HIDDENDANGER"].includes(businessType)) {
      variables["resource"] = "MANUAL_SUBMISSION";
    }
    //表单内联系人
    const appRovalNodes = getApprovaAndCClNode(JSON.parse(flowForm.value.flowJson));
    appRovalNodes.forEach((e) => {
      if (e.props.assignedType === "FORM_USER" && e.props.formUser && props.formRenderRef.formData[e.props.formUser]) {
        const formUserValue = JSON.parse(JSON.stringify(props.formRenderRef.formData[e.props.formUser])) ?? "";
        if (formUserValue) {
          variables[e.props.formUser] = formUserValue;
        }
      }
    });
    //卡片标题
    const backLogTitle = getBackLogTitle();

    const submitParams = {
      type: flowForm.value.type,
      application: flowForm.value.application,
      applicationName: flowForm.value.applicationName,
      businessType: businessType,
      flowKey: flowForm.value.flowKey,
      formKey: flowForm.value.formKey,
      formDefinitionId: flowForm.value.formDefinitionId,
      formDefinitionVersion: flowForm.value.formDefinitionVersion,
      data: JSON.stringify(props.formRenderRef.formData),
      variables: variables,
      backLogTitle: backLogTitle,
      approveUsers: approveUsers.value,
    };

    //考勤走考勤统一接口
    if (["LEAVE", "CANCEL_LEAVE", "OVERTIME", "LEAVE_THE_POST", "AWAY_BUSINESS"].includes(businessType)) {
      await attendanceApprovalSubmit(submitParams);
    } else if (["HOTEL_RESERVATION"].includes(businessType)) {
      await cubeHotelManagementService.hotelApprovalSubmit(submitParams);
    } else if (["VECHICLE_INSERT", "VECHICLE_UPDATE", "VECHICLE_DELETE"].includes(businessType)) {
      await cubeParkingLotService.vehicleApprovalSubmit(submitParams);
    } else if (["VISITOR_INVITE"].includes(businessType)) {
      await cubeVisitorManagementService.visitorApprovalSubmit(submitParams);
    } else if (["PERSONNEL_INDUCTION"].includes(businessType)) {
      await cubePersonnelManagementService.personnelFlowSubmit(submitParams);
    } else if (["ILLEGAL_PARKING"].includes(businessType)) {
      await cubeParkingLotService.addIllegalParking(submitParams);
    } else {
      await postFormFlowsFirst(submitParams);
    }

    message.success("操作成功");
    goBack();
  } catch (error) {
    //message.error("表单提交出错");
  } finally {
    isLoading.value = false;
  }
};
//处理流程
const handlingName = ref("");
const currentOperate = ref();
const processHandle = async (operateItem: FormProcessOperate, item: OperateAlias) => {
  currentOperate.value = item;
  emits("changeTab", 1);
  if (FormProcessOperate.BACK === operateItem && isfirstTaskActive.value) {
    message.error("第一个审批节点不支持回退");
    return;
  }
  if (handlingName.value) {
    return;
  }
  handlingName.value = operateItem;
  try {
    // 审批流程加一层校验
    if (operateItem === FormProcessOperate.PASS) {
      await props.formRenderRef.formRef.validate();
    }
    if ([FormProcessOperate.PASS, FormProcessOperate.REJECT, FormProcessOperate.BACK].includes(operateItem)) {
      //查看流程配置 是否开启审批意见或者手写签名
      const flowObj = JSON.parse(currentTaskDetail.value.properties.processJson);
      const nowNode = getNode(flowObj, currentTaskDetail.value.key);
      if (isUndefined(nowNode.props.sign)) {
        nowNode.props.sign = true;
      }
      if (isUndefined(nowNode.props.opinion)) {
        nowNode.props.opinion = true;
      }
      if (nowNode.props.sign || nowNode.props.opinion) {
        let imageSign: any = null;
        showSignModal.value = true;
        signModelFormRef.value?.resetFields();
        showSign.value = nowNode.props.sign;
        showOpinion.value = nowNode.props.opinion;
        if (nowNode.props?.signConfig?.useLastSign) {
          imageSign = await getUserLastWriteSign();
        } else {
          lastSignId = "";
        }
        if (imageSign && imageSign.data) {
          lastSignId = imageSign.data.id;
          signPicSrc.value = imageSign.data.path;
        }
        return;
      }
    }

    if (operateItem === FormProcessOperate.PASS) {
      //通过
      await clickComplete();
    } else if (operateItem === FormProcessOperate.REJECT) {
      //拒绝
      await clickRefuse();
    } else if (operateItem === FormProcessOperate.REPEAT) {
      //再次发起
      await clickRepeat();
    } else if (operateItem === FormProcessOperate.UNDO) {
      //撤销
      await clickUno();
    } else if (operateItem === FormProcessOperate.BACK) {
      //退回
      await clickBack();
    } else if (operateItem === FormProcessOperate.TRANSFER) {
      //转交
      await clickTransfer();
    } else if (operateItem === FormProcessOperate.WITHDRAW) {
      //撤回
      await clickWidthDraw();
    } else if (operateItem === FormProcessOperate.COMMENT) {
      //评论
      await clickComment();
    }
  } catch (error) {
    handlingName.value = "";
  }
  setTimeout(() => {
    handlingName.value = "";
  }, 0);

  function isUndefined(obj: any) {
    return typeof obj === "undefined";
  }
};
const clearWriteSign = () => {
  signaturePad.value?.clearSignature();
  signPicSrc.value = "";
  lastSignId = "";
};
const getUserLastWriteSign = async () => {
  const result = await getLastWriteSign();
  return result;
};

/*完成*/
const clickComplete = async (approvalOpinion: ApprovalOpinion | null = null) => {
  //表单内联系人
  const branchArr = getBranchs(JSON.parse(currentTaskDetail.value.properties.processJson));
  const conditions = getConditions(branchArr);
  const variables = convertConditions(conditions, props.formRenderRef.formData);

  const appRovalNodes = getApprovaAndCClNode(JSON.parse(currentTaskDetail.value.properties.processJson));
  appRovalNodes.forEach((e) => {
    if (e.props.assignedType === "FORM_USER" && e.props.formUser && props.formRenderRef.formData[e.props.formUser]) {
      const formUserValue = JSON.parse(JSON.stringify(props.formRenderRef.formData[e.props.formUser])) ?? "";
      if (formUserValue) {
        variables[e.props.formUser] = formUserValue;
      }
    }
  });

  const params: PostProcessTaskComplete = {
    taskId: currentTaskDetail.value.id,
    account: null,
    data: JSON.stringify(props.formRenderRef.formData),
    result: "PASS",
    variables,
  };
  if (approvalOpinion !== null) {
    params.approvalOpinion = approvalOpinion;
  }
  await postProcessTaskComplete(params).then(() => {
    message.success("操作成功");
    goBack();
  });
};

/*拒绝*/
const clickRefuse = async (approvalOpinion: ApprovalOpinion | null = null) => {
  const params: PostProcessTaskReject = {
    taskId: currentTaskDetail.value.id,
    account: null,
    comment: null,
    data: JSON.stringify(props.formRenderRef.formData),
  };
  if (approvalOpinion !== null) {
    params.approvalOpinion = approvalOpinion;
  }
  await postProcessTaskReject(params).then((res) => {
    message.success("操作成功");
    goBack();
  });
};
/*再次发起*/
const clickRepeat = async () => {
  const repeatData: Record<string, any> = {};
  for (const key in props.formRenderRef.formData) {
    if (key.includes("field")) {
      repeatData[key] = props.formRenderRef.formData[key];
    }
  }
  sessionStorage.setItem("flow-repeat-data", JSON.stringify(repeatData));
  history.pushState(
    { current: location.pathname + location.search },
    "",
    `/portal/stream-engine-render/repeat?businessType=${businessType}&title=${flowForm.value.businessTypeName}`,
  );
};
/*撤销*/
const clickUno = async () => {
  await postProcessTaskUndo({
    processInstanceId: processId,
    comment: null,
  }).then(() => {
    message.success("操作成功");
    goBack();
  });
};
/*退回*/
const clickBack = async (approvalOpinion: ApprovalOpinion | null = null) => {
  const params: PostProcessTaskBack = {
    taskId: currentTaskDetail.value.id,
    account: null,
    comment: null,
    variables: null,
  };
  if (approvalOpinion !== null) {
    params.approvalOpinion = approvalOpinion;
  }
  await postProcessTaskBack(params).then(() => {
    message.success("操作成功");
    goBack();
  });
};
const clickWidthDraw = async () => {
  const params: PostProcessTaskBack = {
    taskId: currentTaskDetail.value.id,
    account: null,
    comment: null,
    variables: null,
  };
  await postProcessWidthDraw(params).then(() => {
    message.success("操作成功");
    goBack();
  });
};
/*转交*/
const transferModalRef = ref();
const clickTransfer = async () => {
  transferModalRef.value?.open();
};

/*评论*/
const commentModalRef = ref();
const clickComment = async () => {
  commentModalRef.value?.open();
};

/*审批意见 手写签名 */
const signModelFormRef = ref<FormInstance>();
const showSignModal = ref(false);
const showSign = ref(false);
const showOpinion = ref(false);
const formState = reactive({
  sign: "",
  opinion: "",
  rejectStrategyEnum: "",
  selectNode: "",
  terminate: false,
});
const signaturePad = ref();
const onConfirmSignModal = async () => {
  try {
    isLoading.value = true;

    // 手写签名处理 获取签名并上传到oss
    if (showSign.value && !lastSignId) {
      const { isEmpty, data } = signaturePad.value.saveSignature();
      if (!isEmpty) {
        let fileObj = dataURLtoFile(data, "sign-" + new Date().valueOf() + ".png");
        const formData = new FormData();
        formData.append("file", fileObj);
        formData.append("tenant", getNowEnterprise().code);
        const res = await cubeFileService.uploadFile({
          file: fileObj,
          businessKey: "maintain",
          sceneCode: sceneCode,
        });
        try {
          sceneCode && (await cubeFileService.persistFile(sceneCode, [res.id]));
        } catch (error) {}
        formState.sign = res.id ?? "";
      }
    }
    if (lastSignId) {
      formState.sign = lastSignId;
    }
    // 弹窗表单验证
    await signModelFormRef.value?.validate();
    showSignModal.value = false;
    const params: { [key: string]: any } = {};
    if (showOpinion.value) {
      params.text = formState.opinion;
    }
    if (showSign.value) {
      params.sign = formState.sign;
    }
    try {
      if (handlingName.value === FormProcessOperate.PASS) {
        await clickComplete(params);
      }
      if (handlingName.value === FormProcessOperate.REJECT) {
        await clickRefuse(params);
      }
      if (handlingName.value === FormProcessOperate.BACK) {
        await clickBack(params);
      }
    } catch (error) {
    } finally {
      closeSignModal();
    }
  } catch (error) {
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  }

  //将base64转换为文件对象
  function dataURLtoFile(dataurl: string, filename: string) {
    let arr = dataurl.split(",");
    //@ts-ignore
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    //转换成file对象
    return new File([u8arr], filename, { type: mime });
    //转换成成blob对象
    //return new Blob([u8arr],{type:mime});
  }
};
const closeSignModal = () => {
  formState.sign = "";
  formState.opinion = "";
  if (signaturePad.value) {
    signaturePad.value.clearSignature();
  }
  handlingName.value = "";
};
//当前是否是第一个审批节点
const isfirstTaskActive = ref(false);
onMounted(async () => {
  if (processType === ProcessType.DETAIL) {
    const res = await firstTaskActive({ processInstanceId: processId });
    isfirstTaskActive.value = res;
  }
});
</script>
<style scoped lang="less">
#signature {
  border: 1px solid #d9d9d9;
}

.sign-btn {
  display: flex;
  flex-direction: row-reverse;
}

.transfer-user-picker {
  display: none;
}
</style>
