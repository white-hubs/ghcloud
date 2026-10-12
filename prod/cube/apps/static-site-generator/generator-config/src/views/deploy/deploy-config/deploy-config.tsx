import { defineComponent, onMounted, reactive, ref } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Form, FormItem, Input, Select, SelectOption, Switch, message, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeSiteGeneratorService } from "@/api/service";

interface QiniuConfig {
  accessKey: string;
  secretKey: string;
  bucket: string;
  zone: string;
  domain: string;
}

interface DeployConfigForm {
  provider: string;
  providerConfig: QiniuConfig;
  downloadStatic: boolean;
  excludeHosts: string;
}

/** 部署配置 */
export const DeployConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const formRenderRef = ref<FormExpose>();
    const submitting = ref(false);

    const formState = reactive<DeployConfigForm>({
      provider: "qiniu",
      providerConfig: {
        accessKey: "",
        secretKey: "",
        bucket: "",
        zone: "",
        domain: "",
      },
      downloadStatic: false,
      excludeHosts: "",
    });

    const loadConfig = async (): Promise<void> => {
      try {
        const config = await cubeSiteGeneratorService.getPublishConfig();
        formState.provider = config.provider ?? "qiniu";
        formState.downloadStatic = (config.downloadStatic as unknown as string) === "true";
        formState.excludeHosts = config.excludeHosts ?? "";
        try {
          const parsed = JSON.parse(config.providerConfig ?? "{}") as QiniuConfig;
          formState.providerConfig = {
            accessKey: parsed.accessKey ?? "",
            secretKey: parsed.secretKey ?? "",
            bucket: parsed.bucket ?? "",
            zone: parsed.zone ?? "",
            domain: parsed.domain ?? "",
          };
        } catch {
          formState.providerConfig = {
            accessKey: "",
            secretKey: "",
            bucket: "",
            zone: "",
            domain: "",
          };
        }
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "加载失败");
      }
    };

    onMounted(() => {
      loadConfig();
    });

    const isQiniu = (): boolean => formState.provider === "qiniu";

    const handleSubmit = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate();
      } catch {
        return;
      }
      submitting.value = true;
      try {
        await cubeSiteGeneratorService.savePublishConfig({
          provider: formState.provider,
          providerConfig: JSON.stringify(formState.providerConfig),
          downloadStatic: formState.downloadStatic,
          excludeHosts: formState.excludeHosts.trim(),
        });
        message.success("保存成功");
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "保存失败");
      } finally {
        submitting.value = false;
      }
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div style={{ padding: "20px" }}>
          <Form model={formState} ref={formRenderRef} labelCol={{ span: 2 }} wrapperCol={{ span: 6 }}>
            <FormItem label="部署目标" name="provider">
              <Select v-model:value={formState.provider}>
                <SelectOption value="qiniu">七牛云</SelectOption>
                <SelectOption value="sftp" disabled>
                  SFTP
                </SelectOption>
                <SelectOption value="ftp" disabled>
                  FTP
                </SelectOption>
              </Select>
            </FormItem>
            {isQiniu() && (
              <>
                <FormItem label="AccessKey" name="providerConfig.accessKey">
                  <Input v-model:value={formState.providerConfig.accessKey} show-count={false} maxlength={99_999} />
                </FormItem>
                <FormItem label="SecretKey" name="providerConfig.secretKey">
                  <Input v-model:value={formState.providerConfig.secretKey} show-count={false} maxlength={99_999} />
                </FormItem>
                <FormItem label="Bucket" name="providerConfig.bucket">
                  <Input v-model:value={formState.providerConfig.bucket} show-count={false} maxlength={99_999} />
                </FormItem>
                <FormItem label="Zone" name="providerConfig.zone">
                  <Input v-model:value={formState.providerConfig.zone} show-count={false} maxlength={99_999} />
                </FormItem>
                <FormItem label="Domain" name="providerConfig.domain">
                  <Input v-model:value={formState.providerConfig.domain} show-count={false} maxlength={99_999} />
                </FormItem>
              </>
            )}
            <FormItem label="下载外部静态资源" name="downloadStatic">
              <Switch v-model:checked={formState.downloadStatic} />
            </FormItem>
            <FormItem label="排除域名" name="excludeHosts">
              <Input
                v-model:value={formState.excludeHosts}
                placeholder="逗号分隔，如 qiniu.xxx.com,cdn.foo.com"
                disabled={!formState.downloadStatic}
                show-count={false}
                maxlength={99_999}
              />
            </FormItem>
          </Form>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" loading={submitting.value} onClick={handleSubmit}>
            保存
          </Button>
        </div>
      ),
    };
    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={slots}></CubeLayout>;
  },
});
