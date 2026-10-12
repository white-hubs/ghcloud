import { loginAndGetTenantList, resolveTenant, type LoginContext, type TenantItem } from "./api/login";
import { authSession } from "./auth-session";
import styles from "./login-page.module.less";
import { Button, CellGroup, Field, Form, NavBar, Picker, Popup, showNotify } from "vant";
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export const LoginPage = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const showTenantPicker = ref(false);
    const tenantList = ref<TenantItem[]>([]);
    const pendingLoginContext = ref<LoginContext | null>(null);
    const formState = reactive({
      userName: "",
      password: "",
    });

    const finishLogin = async (token: string, tenant: string, terminal?: string): Promise<void> => {
      authSession.saveAuthInfo({
        token,
        tenant,
        terminal,
      });
      const redirectFromQuery = route.query.redirect ? decodeURIComponent(route.query.redirect as string) : "";
      const redirect = redirectFromQuery || authSession.consumeRedirectFullPath() || authSession.getDefaultRedirectPath();
      await router.replace(redirect);
    };

    const handleGuestEnter = async (): Promise<void> => {
      authSession.clearAuthInfo();
      authSession.enableGuestMode();
      const redirectFromQuery = route.query.redirect ? decodeURIComponent(route.query.redirect as string) : "";
      const redirect = redirectFromQuery || authSession.consumeRedirectFullPath() || authSession.getDefaultRedirectPath();
      await router.replace(redirect);
    };

    const handleLocalLogin = async (): Promise<void> => {
      const loginContext = await loginAndGetTenantList(formState.userName, formState.password);
      const tenantResult = resolveTenant(loginContext.tenantList);
      if (tenantResult.type === "empty") {
        throw new Error("您尚未加入企业，请联系管理员添加");
      }
      if (tenantResult.type === "manual") {
        pendingLoginContext.value = loginContext;
        tenantList.value = tenantResult.tenantList.map((tenant) => ({
          ...tenant,
          name: tenant.name ?? tenant.code,
        }));
        showTenantPicker.value = true;
        return;
      }
      await finishLogin(loginContext.token, tenantResult.tenant.code, loginContext.terminal);
    };

    const handleTenantConfirm = async ({ selectedOptions }: { selectedOptions: TenantItem[] }): Promise<void> => {
      const selectedTenant = selectedOptions[0];
      if (!pendingLoginContext.value || !selectedTenant) {
        return;
      }
      showTenantPicker.value = false;
      await finishLogin(pendingLoginContext.value.token, selectedTenant.code, pendingLoginContext.value.terminal);
      pendingLoginContext.value = null;
    };

    const showGuestEnterButton = authSession.getConfig().showGuestEnter !== false;

    const handleSubmit = async (): Promise<void> => {
      try {
        loading.value = true;
        const runtime = await authSession.resolveRuntime();
        if (runtime?.login) {
          const result = await runtime.login(formState.userName, formState.password);
          await finishLogin(result.token, result.tenant, result.terminal);
        } else {
          await handleLocalLogin();
        }
      } catch (error) {
        showNotify({ type: "danger", message: (error as Error).message || "登录失败" });
      } finally {
        loading.value = false;
      }
    };

    return (): JSX.Element => (
      <>
        <NavBar title="登录" />
        <div class={styles.container}>
          <div class={styles.card}>
            <div class={styles.title}>请先登录后继续操作</div>
            <Form onSubmit={handleSubmit}>
              <CellGroup inset>
                <Field
                  v-model={formState.userName}
                  name="userName"
                  label="用户名"
                  placeholder="请输入用户名"
                  left-icon="user-o"
                  rules={[{ required: true, message: "请填写用户名" }]}
                />
                <Field
                  v-model={formState.password}
                  name="password"
                  label="密码"
                  type="password"
                  autocomplete="off"
                  placeholder="请输入密码"
                  left-icon="closed-eye"
                  rules={[{ required: true, message: "请填写密码" }]}
                />
              </CellGroup>
              <div class={styles.submit}>
                <Button type="primary" block loading={loading.value} native-type="submit">
                  登录
                </Button>
              </div>
              {showGuestEnterButton && (
                <div class={styles.guestSubmit}>
                  <Button plain block type="primary" onClick={handleGuestEnter}>
                    游客进入
                  </Button>
                </div>
              )}
            </Form>
          </div>
        </div>
        <Popup v-model:show={showTenantPicker.value} round position="bottom">
          <Picker
            title="请选择企业"
            columns={tenantList.value}
            columns-field-names={{
              text: "name",
              value: "code",
            }}
            onConfirm={handleTenantConfirm}
            onCancel={() => {
              pendingLoginContext.value = null;
              showTenantPicker.value = false;
            }}
          />
        </Popup>
      </>
    );
  },
});
