import { Button, Form, Input, Modal, Spin, message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import {
  clearAuthSession,
  fetchLoginCode,
  getSessionTenantOptions,
  hasAuthSession,
  hasSessionToken,
  loginByMainMode,
  setTenantSession,
  type TenantOption,
} from "@/api/session";

import "./login.less";

export const LoginView = defineComponent({
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const codeLoading = ref(false);
    const tenantVisible = ref(false);
    const tenantLoading = ref(false);
    const tenantOptions = ref<TenantOption[]>([]);
    const form = reactive({ username: "", password: "", code: "", key: "", codeImg: "" });

    const loadCode = async (): Promise<void> => {
      codeLoading.value = true;
      try {
        const result = await fetchLoginCode();
        form.key = result.key;
        form.codeImg = result.code;
      } catch {
        message.error("验证码获取失败，请稍后重试");
      } finally {
        codeLoading.value = false;
      }
    };

    const onSubmit = async (): Promise<void> => {
      if (!form.username || !form.password || !form.code || !form.key) {
        message.warning("请填写完整登录信息");
        return;
      }
      loading.value = true;
      try {
        const result = await loginByMainMode({ username: form.username, password: form.password, code: form.code, key: form.key });
        const options = result.tenants;
        if (options.length === 0) {
          message.warning("该用户未加入企业");
          return;
        }
        if (options.length === 1) {
          setTenantSession(options[0].code);
          message.success("登录成功");
          router.replace({ name: "dashboard" }).catch(() => undefined);
          return;
        }
        tenantOptions.value = options;
        tenantVisible.value = true;
      } catch {
        message.error("登录失败，请检查账号或验证码");
        await loadCode();
      } finally {
        loading.value = false;
      }
    };

    const loadTenantOptionsFromSession = async (): Promise<void> => {
      if (!hasSessionToken() || hasAuthSession()) {
        return;
      }
      const options = await getSessionTenantOptions();
      if (options.length === 1) {
        setTenantSession(options[0].code);
        message.success("登录成功");
        router.replace({ name: "dashboard" }).catch(() => undefined);
        return;
      }
      if (options.length > 1) {
        tenantOptions.value = options;
        tenantVisible.value = true;
      }
    };

    onMounted(() => {
      if (!hasSessionToken()) {
        clearAuthSession();
      }
      loadTenantOptionsFromSession().catch(() => undefined);
      loadCode().catch(() => undefined);
    });

    const onSelectTenant = (tenant: TenantOption): void => {
      if (tenantLoading.value) {
        return;
      }
      tenantLoading.value = true;
      setTenantSession(tenant.code);
      message.success("登录成功");
      router.replace({ name: "dashboard" }).catch(() => undefined);
    };

    return () => (
      <div class="inspection-login">
        <div class="login-card">
          <h1>智慧巡检指挥</h1>
          <Form layout="vertical">
            <Form.Item label="账号">
              <Input v-model:value={form.username} placeholder="请输入账号" />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password v-model:value={form.password} placeholder="请输入密码" />
            </Form.Item>
            <Form.Item label="验证码">
              <div class="code-row">
                <Input v-model:value={form.code} placeholder="请输入验证码" />
                <button class="code-box" type="button" onClick={loadCode} disabled={codeLoading.value}>
                  {form.codeImg ? <img src={form.codeImg} alt="code" /> : <span>加载中</span>}
                </button>
              </div>
            </Form.Item>
            <Button type="primary" block loading={loading.value} onClick={onSubmit}>
              登录
            </Button>
          </Form>
        </div>

        <Modal
          open={tenantVisible.value}
          title="请选择要登录的企业"
          centered
          width="45%"
          footer={null}
          wrapClassName="inspection-login-tenant-modal"
          closable={!tenantLoading.value}
          maskClosable={!tenantLoading.value}
          keyboard={!tenantLoading.value}
          onCancel={() => {
            if (!tenantLoading.value) tenantVisible.value = false;
          }}
        >
          <Spin spinning={tenantLoading.value} tip="正在进入系统...">
            <div class="tenant-list">
              {tenantOptions.value.map((tenant) => (
                <div class="tenant-item" key={tenant.code} onClick={() => onSelectTenant(tenant)}>
                  {tenant.name}
                </div>
              ))}
            </div>
          </Spin>
        </Modal>
      </div>
    );
  },
});
