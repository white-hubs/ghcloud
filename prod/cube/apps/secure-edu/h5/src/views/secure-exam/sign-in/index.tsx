import { useMetaTitle } from "../../hooks/use-meta-title-hook";
import { HandleExamType, useExamHandleStore } from "../exam-handle-hooks";
import styles from "./index.module.less";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { ExamTaskType, type UserInfoState } from "@ghcloud/cube-secure-edu-service";
import { Button, Field, Form, showNotify } from "vant";
import { defineComponent, reactive } from "vue";
import { useRoute } from "vue-router";

interface BaseFormState {
  userName: string;
  userPhone: string;
}

interface ExternalFormState extends BaseFormState {
  organizationName: string;
}

interface SubmitPayload {
  userName: string;
  userPhone: string;
  organizationName: string;
}

const nameValidator = (val: string): boolean => /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/.test(val);
const phonePattern = /^1[3456789]\d{9}$/;
const phoneValidator = (val: string): boolean => phonePattern.test(val.trim());
const organizationValidator = (val: string): boolean => {
  return /^[\u4e00-\u9fa5a-zA-Z0-9]{2,50}$/.test(val);
};

const getValidatedPayload = (payload: SubmitPayload): SubmitPayload | null => {
  const userName = payload.userName;
  const userPhone = payload.userPhone.trim();
  const organizationName = payload.organizationName;

  if (!nameValidator(userName)) {
    showNotify({ type: "warning", message: "请输入2-20位姓名，不包含特殊符号或空格" });
    return null;
  }
  if (!phoneValidator(userPhone)) {
    showNotify({ type: "warning", message: "请输入正确的手机号码" });
    return null;
  }
  if (!organizationValidator(organizationName)) {
    showNotify({ type: "warning", message: "请输入2-50位所属组织，不包含特殊符号或空格" });
    return null;
  }

  const validPayload: SubmitPayload = {
    ...payload,
    userName,
    userPhone,
    organizationName,
  };
  return validPayload;
};

const ExternalExamForm = defineComponent({
  name: "ExternalExamForm",
  emits: {
    submit: (_payload: SubmitPayload) => true,
  },
  setup: (_props, { emit }) => {
    const formState = reactive<ExternalFormState>({
      userName: "",
      userPhone: "",
      organizationName: "",
    });

    const handleSubmit = (): void => {
      emit("submit", {
        userName: formState.userName,
        userPhone: formState.userPhone.trim(),
        organizationName: formState.organizationName,
      });
    };

    return (): JSX.Element => (
      <div class={styles.examCard}>
        <Form onSubmit={handleSubmit}>
          <Field
            name="userName"
            label="姓名"
            v-model={formState.userName}
            placeholder="请输入您的姓名"
            rules={[
              { required: true, message: "请输入姓名" },
              { validator: nameValidator, message: "请输入2-20位姓名，不包含特殊符号或空格" },
            ]}
          />
          <Field
            name="organizationName"
            label="所属组织"
            v-model={formState.organizationName}
            placeholder="请输入所属组织"
            rules={[
              { required: true, message: "请输入所属组织" },
              { validator: organizationValidator, message: "请输入2-50位所属组织，不包含特殊符号或空格" },
            ]}
          />
          <Field
            name="userPhone"
            label="联系方式"
            type="tel"
            maxlength="11"
            v-model={formState.userPhone}
            placeholder="请输入手机号码"
            rules={[
              { required: true, message: "请输入手机号" },
              { validator: phoneValidator, message: "手机号码格式错误" },
            ]}
            onBlur={() => {
              formState.userPhone = formState.userPhone.trim();
            }}
          />
          <div class={styles.tip}>仅用于身份核对，不会对外泄露</div>
          <Button class={styles.submitButton} block type="primary" nativeType="button" onClick={handleSubmit}>
            进入考试
          </Button>
        </Form>
      </div>
    );
  },
});

export const SignIn = defineComponent({
  setup: () => {
    useMetaTitle();
    const route = useRoute();
    const examHandleStore = useExamHandleStore();

    const handleSubmit = (payload: SubmitPayload): void => {
      const validPayload = getValidatedPayload(payload);
      if (!validPayload) {
        return;
      }
      const userInfo: UserInfoState = {
        userIdentify: localStorage.getItem("browserId") ?? "",
        userName: validPayload.userName,
        userPhone: validPayload.userPhone,
        userDepartmentName: validPayload.organizationName,
        userPostName: "",
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      examHandleStore.goExamHandle({
        id: route.query.id as string,
        examPaperId: route.query.examPaperId as string,
        type: HandleExamType.STARTEXAM,
        examDuration: Number(route.query.examDuration as string),
        examTaskType: ExamTaskType.MERCHANT_EXAM,
      });
    };

    return (): JSX.Element => (
      <>
        <CubeNavBar title="商户考核" showBack />
        <div class={styles.container}>
          <ExternalExamForm onSubmit={handleSubmit} />
        </div>
      </>
    );
  },
});
