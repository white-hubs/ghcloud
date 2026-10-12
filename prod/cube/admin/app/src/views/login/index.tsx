import { message, Input, Button } from "ant-design-vue";
import { defineComponent, ref, reactive } from "vue";

/** 登录背景图（MinIO） */
const backgroundImg = "/resource/v1/cube-admin/loginbackground.png";
import { authStore, cleanAuth } from "@/state/auth";
import { generateCode, loginOfSimpleCode } from "@ghcloud/cube-ouaa-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { PasswordEncoder } from "@ghcloud/cube-utils";
import { useRouter } from "vue-router";

export const Login = defineComponent({
  setup: () => {
    const form = reactive({
      username: "",
      password: "",
      captcha: "",
    });
    const loading = ref(false);
    const captchaImg = ref("");
    const captchaId = ref("");
    const router = useRouter();

    cleanAuth();

    // 获取验证码图片
    const fetchCaptcha = async (): Promise<void> => {
      // 这里替换为实际的后端接口
      try {
        const res = await generateCode();
        captchaImg.value = res.code;
        captchaId.value = res.key;
      } catch {
        message.error("获取验证码失败");
      }
    };

    const onLogin = async (): Promise<void> => {
      if (!form.username || !form.password || !form.captcha) {
        message.warning("请填写完整信息");
        return;
      }
      loading.value = true;
      try {
        // 这里替换为实际的后端登录接口
        const res = await loginOfSimpleCode({
          key: captchaId.value,
          code: form.captcha,
          username: form.username,
          password: PasswordEncoder.encode(form.password),
        });
        authStore.value = { ...res, tenant: 0, terminal: CubeTerminalEnum.ADMIN };
        message.success("登录成功");
        // 后续跳转逻辑
        router.push("/");
      } catch {
        message.error("登录失败");
      } finally {
        loading.value = false;
      }
    };

    fetchCaptcha();

    return (): JSX.Element => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "320px",
            margin: "auto",
            padding: "32px",
            borderRadius: "8px",
            background: "#fff",
            boxShadow: "0 2px 10px #eee",
          }}
        >
          <h2 style="margin-bottom:18px; text-align: center;">登录</h2>
          <Input v-model:value={form.username} placeholder="用户名" style="margin-bottom:16px;" />
          <Input.Password v-model:value={form.password} placeholder="密码" style="margin-bottom:16px;" />
          <div style="display:flex;align-items:center;margin-bottom:16px;">
            <Input v-model:value={form.captcha} style="flex:1;margin-right:8px;" placeholder="验证码" />
            <img
              src={captchaImg.value}
              style="height:32px;cursor:pointer;border-radius:4px;border:1px solid #e1e1e1;"
              alt="点击刷新验证码"
              onClick={fetchCaptcha}
            />
          </div>
          <Button type="primary" block loading={loading.value} onClick={onLogin}>
            登录
          </Button>
        </div>
      </div>
    );
  },
});
