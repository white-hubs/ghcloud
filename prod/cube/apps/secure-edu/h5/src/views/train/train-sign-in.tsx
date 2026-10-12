import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { authStore } from "@/api/auth-store";
import { cubeOuaaService, cubeSecureEduPublicService, cubeSecureEduService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { Form, Field, Button, showNotify } from "vant";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
interface FormState {
  userIdentify: string;
  userName: string;
  userPhone: string;
  userDepartmentName: string;
  userPostName: string;
  id: string;
}

/** 培训签到页面 */
export const TrainSignIn = defineComponent({
  setup: () => {
    const route = useRoute();
    useMetaTitle();
    onMounted(async () => {
      const authenticated = Boolean(authStore.token);
      if (authenticated) {
        const user = await cubeOuaaService.getUserInfo();
        formState.userName = user.name;
        formState.userPhone = user.mobile;
        formState.userDepartmentName = user.organizations ? user.organizations[0]?.name : "";
        formState.userPostName = user.positions ? user.positions[0]?.name : "";
      }
    });

    const formState = reactive<FormState>({
      userIdentify: localStorage.getItem("browserId") ?? "",
      userName: "",
      userPhone: "",
      userDepartmentName: "",
      userPostName: "",
      id: "",
    });
    const subLoading = ref(false);
    const onSubmit = async (): Promise<void> => {
      Object.assign(formState, {
        id: route.query.id as string,
      });
      try {
        subLoading.value = true;
        const authenticated = Boolean(authStore.token);
        authenticated ? await cubeSecureEduService.trainSignInApp(formState) : await cubeSecureEduPublicService.trainSignIn(formState);
        showNotify({ message: "提交成功", type: "success" });
        setTimeout(() => {
          history.go(-1);
        }, 1000);
      } catch (error) {
        showNotify({ type: "danger", message: (error as { errorMessage?: string })?.errorMessage || "提交失败" });
        return;
      } finally {
        subLoading.value = false;
      }
    };
    const nameValidator = (val: string): boolean => /^[\u4e00-\u9fa5a-zA-Z]{0,}$/.test(val);
    const textValidator = (val: string): boolean => /^[\u4e00-\u9fa5a-zA-Z0-9]{0,}$/.test(val);
    return (): JSX.Element => (
      <>
        <CubeNavBar title="签到" showBack />
        <Form onSubmit={onSubmit}>
          <Field
            name="trainTheme"
            label="姓名"
            placeholder="请输入"
            rules={[
              { required: true, message: "请输入姓名" },
              { validator: nameValidator, message: "请输入中、英文" },
            ]}
            maxlength="10"
            v-model={formState.userName}
            required
          />
          <Field
            name="number"
            label="电话"
            placeholder="请输入"
            type="digit"
            maxlength="11"
            rules={[{ required: true, message: "请输入电话" }]}
            v-model={formState.userPhone}
            required
          />
          <Field
            name="trainDuration"
            label="部门"
            placeholder="请输入"
            maxlength="10"
            rules={[
              { required: true, message: "请输入部门" },
              { validator: textValidator, message: "请输入中、英文、数字" },
            ]}
            v-model={formState.userDepartmentName}
            required
          />
          <Field
            name="trainTheme"
            label="岗位"
            placeholder="请输入"
            maxlength="10"
            rules={[{ validator: textValidator, message: "请输入中、英文、数字" }]}
            v-model={formState.userPostName}
          />
          <div style="margin: 16px;">
            <Button round block type="primary" native-type="submit" loading={subLoading.value}>
              提交
            </Button>
          </div>
        </Form>
      </>
    );
  },
});
