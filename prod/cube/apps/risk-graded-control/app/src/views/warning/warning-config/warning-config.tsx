import { defineComponent, onMounted, ref, type Ref } from "vue";

import { UserFusionSelect } from "@ghcloud/cube-app-design";
import { Button, CheckboxGroup, Form, FormItem, message, Spin, type FormExpose } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeMessageCenterService } from "@/api/message-center-service";
import { PageShell } from "@/components/page-shell/page-shell";
import { showApiError } from "@/utils/api-error";

import styles from "./warning-config.module.less";

interface NoticeOption {
  label: string;
  value: string;
}

interface NoticeUserItem {
  type: string;
  ids?: string[];
}

interface NoticeWayDTO {
  noticeWay?: string | null;
}

interface NoticeObjDTO {
  objId?: string | null;
  objType?: string | null;
}

interface SceneConfigDTO {
  label?: string;
  sceneCode?: string;
  value?: string;
  config?: string;
  noticeWays?: NoticeWayDTO[] | null;
  noticeObjs?: NoticeObjDTO[] | null;
}

const WARNING_BUSINESS_TYPE = "RISK_WARNING";
const LEVEL_UPGRADE_WARNING_SCENE = "RISK_LEVEL_UPGRADE_WARNING";

function parseNoticeItems(raw?: NoticeObjDTO[] | null): NoticeUserItem {
  if (!raw?.length) {
    return { type: "USER", ids: [] };
  }
  return {
    type: raw[0]?.objType || "USER",
    ids: raw[0]?.objId?.split(",").filter(Boolean) ?? [],
  };
}

function toNoticeWaysDTO(ways?: string[]): Array<{ noticeWay: string }> {
  return (ways ?? []).map((noticeWay) => ({ noticeWay }));
}

function toNoticeObjsDTO(item: NoticeUserItem): Array<{ objType: string; objId: string; objInfo: string }> {
  return [
    {
      objType: item.type || "USER",
      objId: item.ids?.join(",") ?? "",
      objInfo: JSON.stringify(item.ids ?? []),
    },
  ];
}

export const WarningConfigPage = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const formRef = ref<FormExpose>();
    const userSelectRef = ref<{ checkFormData: () => Promise<unknown>; isValid: Ref<boolean> }>();
    const loading = ref(false);
    const saving = ref(false);
    const channelOptions = ref<NoticeOption[]>([]);
    const config = ref({
      label: "等级升级预警",
      sceneCode: LEVEL_UPGRADE_WARNING_SCENE,
      noticeWays: [] as string[],
      noticeItems: { type: "USER", ids: [] } as NoticeUserItem,
    });

    const rules = {
      noticeWays: [{ required: true, message: "请选择通知方式", trigger: "blur" }],
      noticeItems: [{ validator: async (): Promise<unknown> => userSelectRef.value?.checkFormData(), trigger: "blur" }],
    };

    const loadConfig = async (): Promise<void> => {
      loading.value = true;
      try {
        const [configs, options] = await Promise.all([
          cubeMessageCenterService.getMessageConfig({ businessType: WARNING_BUSINESS_TYPE }),
          cubeMessageCenterService.sceneNotificationMethod(LEVEL_UPGRADE_WARNING_SCENE),
        ]);
        const sceneConfig = (configs as SceneConfigDTO[]).find((item) => item.sceneCode === LEVEL_UPGRADE_WARNING_SCENE);
        if (sceneConfig) {
          config.value.label = sceneConfig.label || "等级升级预警";
          config.value.sceneCode = sceneConfig.sceneCode || LEVEL_UPGRADE_WARNING_SCENE;
          config.value.noticeWays = (sceneConfig.noticeWays ?? []).map((way) => way.noticeWay ?? "").filter(Boolean);
          config.value.noticeItems = parseNoticeItems(sceneConfig.noticeObjs);
        }
        channelOptions.value = options;
      } catch (e) {
        showApiError(e);
      } finally {
        loading.value = false;
      }
    };

    const save = async (): Promise<void> => {
      try {
        await formRef.value?.validate();
      } catch {
        return;
      }
      saving.value = true;
      try {
        await cubeMessageCenterService.addMessageConfig({
          businessType: WARNING_BUSINESS_TYPE,
          sceneConfigDTOS: [
            {
              label: config.value.label,
              sceneCode: LEVEL_UPGRADE_WARNING_SCENE,
              value: "",
              config: "",
              noticeWays: toNoticeWaysDTO(config.value.noticeWays),
              noticeObjs: toNoticeObjsDTO(config.value.noticeItems),
            },
          ],
        });
        await loadConfig();
        message.success("保存成功");
      } catch (e) {
        showApiError(e);
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      void loadConfig();
    });

    return (): JSX.Element => (
      <PageShell
        title={pageTitle || "预警消息配置"}
        v-slots={{
          "layout-content": (): JSX.Element => (
            <Spin spinning={loading.value}>
              <div class={styles.configPanel}>
                <Form model={config.value} ref={formRef} rules={rules} labelCol={{ style: { width: "96px" } }}>
                  <FormItem label="通知方式" name="noticeWays">
                    {channelOptions.value.length > 0 ? (
                      <CheckboxGroup v-model:value={config.value.noticeWays} options={channelOptions.value} />
                    ) : (
                      <span>当前场景未配置可用通知方式</span>
                    )}
                  </FormItem>
                  <FormItem label="通知内容">
                    <div class={styles.noticeContent}>
                      「等级升级预警」&#123;单元名称&#125;中&quot;&#123;对象名称&#125;&quot;从&#123;原等级&#125;→&#123;新等级&#125;
                    </div>
                  </FormItem>
                  <FormItem label="通知人员" name="noticeItems">
                    <UserFusionSelect ref={userSelectRef} v-model:typeValue={config.value.noticeItems} />
                  </FormItem>
                </Form>
              </div>
            </Spin>
          ),
          "footer-page": (): JSX.Element => (
            <Button
              type="primary"
              loading={saving.value}
              onClick={() => {
                void save();
              }}
            >
              保存
            </Button>
          ),
        }}
      />
    );
  },
});
