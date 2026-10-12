import { Button, Col, Form, Input, Modal, Row, Spin, message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { fetchLoginCode, loginByMainMode, setTenantSession, type TenantOption } from "@/application/auth/session";
import { dismissUe5BootLoader, showUe5BootLoader } from "@/application/bootstrap/boot-loader";
import { ConfigLoader, PROJECT_ID_SESSION_KEY, persistProjectIdFromQuery } from "@/application/config/config-loader";
import { initGlobalState } from "@/application/runtime/global-state";
import Crypto from "@/infrastructure/utils/crypto";

import styles from "./index.module.less";

const LoginPage = defineComponent({
  name: "loginContainer",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const formRef = ref();
    const formState = reactive({
      username: "",
      password: "",
      verify: "",
      loginKey: "",
    });
    const loadingBtn = ref(false);
    const codeLoading = ref(false);
    const loginCode = ref("");
    const dialogVisible = ref(false);
    const tenantList = ref<TenantOption[]>([]);
    const tenantLoading = ref(false);

    const rules = {
      username: [{ required: true, message: "请输入账号", trigger: "change" }],
      password: [{ required: true, message: "请填写密码", trigger: "change" }],
      verify: [{ required: true, message: "请输入验证码", trigger: "change" }],
    };

    const handleGetLoginCode = async (): Promise<void> => {
      codeLoading.value = true;
      try {
        const res = await fetchLoginCode();
        formState.loginKey = res.key;
        loginCode.value = res.code;
      } catch {
        message.error("验证码获取失败，请稍后重试");
      } finally {
        codeLoading.value = false;
      }
    };

    const enterSystem = async (tenantCode: string): Promise<void> => {
      showUe5BootLoader("viz");
      setTenantSession(tenantCode);
      sessionStorage.setItem("three-visualizations", "true");
      await initGlobalState();
      await ConfigLoader.loadConfig();
      const projectId =
        typeof route.query.projectId === "string" ? route.query.projectId : (sessionStorage.getItem(PROJECT_ID_SESSION_KEY) ?? "");
      await router.push({
        name: "home",
        ...(projectId ? { query: { projectId } } : {}),
      });
    };

    const clickTenant = async (item: TenantOption): Promise<void> => {
      if (tenantLoading.value) {
        return;
      }
      tenantLoading.value = true;
      try {
        await enterSystem(item.code);
      } catch {
        tenantLoading.value = false;
        dismissUe5BootLoader();
        message.error("进入系统失败，请重试");
      }
    };

    const handleFinish = async (): Promise<void> => {
      loadingBtn.value = true;
      try {
        const result = await loginByMainMode({
          username: formState.username,
          password: formState.password,
          code: formState.verify,
          key: formState.loginKey,
        });
        localStorage.setItem(
          "cube-login-info",
          JSON.stringify({
            username: formState.username,
            password: Crypto.encrypt(formState.password),
          }),
        );
        tenantList.value = result.tenants;
        if (result.tenants.length === 0) {
          message.warn("该用户未加入企业");
          return;
        }
        if (result.tenants.length === 1) {
          await clickTenant(result.tenants[0]);
          return;
        }
        dialogVisible.value = true;
      } catch (error: unknown) {
        await handleGetLoginCode();
        const err = error as { errorDescription?: string; error_description?: string; message?: string };
        message.error(err?.errorDescription || err?.error_description || err?.message || "登录失败，请检查账号或验证码");
      } finally {
        loadingBtn.value = false;
      }
    };

    onMounted(() => {
      // Two frames: login card paints under an opaque splash, then splash copy hides and the mask fades.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dismissUe5BootLoader();
        });
      });
      const projectId = typeof route.query.projectId === "string" ? route.query.projectId : "";
      sessionStorage.clear();
      persistProjectIdFromQuery(projectId);
      void handleGetLoginCode();
      const loginCache = localStorage.getItem("cube-login-info") ? JSON.parse(localStorage.getItem("cube-login-info")!) : {};
      if (loginCache.username && loginCache.password) {
        formState.username = loginCache.username;
        formState.password = Crypto.decrypt(loginCache.password);
      }
    });

    return () => (
      <div class={styles.loginCtr}>
        <div class={styles.proPanel}>
          <div class={styles["proPanel-title"]}>欢迎登录</div>
          <div class={styles["proPanel-form"]}>
            <Form
              ref={formRef}
              name="custom-validation"
              model={formState}
              rules={rules}
              layout="horizontal"
              labelAlign="right"
              onFinish={handleFinish}
            >
              <Row gutter={1}>
                <Col span={24}>
                  <Form.Item label="" name="username" wrapperCol={{ span: 24, offset: 0 }}>
                    <Input v-model:value={formState.username} type="text" placeholder="账号" allowClear />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="" name="password" wrapperCol={{ span: 24, offset: 0 }}>
                    <Input.Password v-model:value={formState.password} placeholder="密码" allowClear />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="" name="verify" wrapperCol={{ span: 24, offset: 0 }}>
                    <div class={styles.identify}>
                      <Input v-model:value={formState.verify} type="text" placeholder="验证码" allowClear />
                      {loginCode.value ? (
                        <button
                          type="button"
                          class={styles["code-image"]}
                          title="点击刷新验证码"
                          aria-label="点击刷新验证码"
                          onClick={() => void handleGetLoginCode()}
                        >
                          <img src={loginCode.value} alt="验证码" draggable={false} />
                        </button>
                      ) : (
                        <Button
                          type="link"
                          class={styles["code-fallback"]}
                          loading={codeLoading.value}
                          onClick={() => void handleGetLoginCode()}
                        >
                          获取验证码
                        </Button>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="" wrapperCol={{ span: 24, offset: 0 }}>
                    <Button loading={loadingBtn.value} type="primary" html-type="submit" class={styles["login-btn"]} block>
                      登录
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
        {dialogVisible.value ? (
          <Modal
            open
            title="请选择要登录的企业"
            centered
            width="40%"
            footer={null}
            maskClosable={!tenantLoading.value}
            closable={!tenantLoading.value}
            keyboard={!tenantLoading.value}
            onCancel={() => {
              if (!tenantLoading.value) {
                dialogVisible.value = false;
              }
            }}
          >
            <Spin spinning={tenantLoading.value} tip="正在进入系统...">
              <div class={styles.dialogContent}>
                {tenantList.value.map((item) => (
                  <div key={item.code} class={styles["tenant-item"]} onClick={() => void clickTenant(item)}>
                    {item.name}
                  </div>
                ))}
              </div>
            </Spin>
          </Modal>
        ) : null}
      </div>
    );
  },
});

export default LoginPage;
