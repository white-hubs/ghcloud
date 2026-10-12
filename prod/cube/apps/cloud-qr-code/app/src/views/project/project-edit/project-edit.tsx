import styles from "./project-edit.module.less";
import { cubeCloudQrCodeService } from "@/api/server";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, Button, message } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export const ProjectEdit = defineComponent({
  setup: () => {
    const route = useRoute();
    const projectId = route.query.id as string;
    const action = (route.query.action as string) || "add";
    const isDetail = action === "detail";
    const formRef = ref();
    const loading = ref(false);

    const formState = reactive<{
      id?: string;
      name: string;
      code: string;
      secret: string;
    }>({
      name: "",
      code: "",
      secret: "",
    });

    const rules = {
      name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
    };

    const initData = async (): Promise<void> => {
      if (action === "add") {
        return;
      }
      if (!projectId) {
        message.error("项目ID不存在");
        history.back();
        return;
      }
      try {
        loading.value = true;
        const detail = await cubeCloudQrCodeService.getProjectDetail(projectId);
        formState.id = detail.id;
        formState.name = detail.name;
        formState.code = detail.code;
        formState.secret = detail.secret;
      } catch {
        message.error("获取项目详情失败");
      } finally {
        loading.value = false;
      }
    };

    const handleSave = async (): Promise<void> => {
      try {
        loading.value = true;
        await formRef.value?.validate();

        if (action === "add") {
          await cubeCloudQrCodeService.createProject({
            name: formState.name,
          });
          message.success("新增成功");
        } else {
          await cubeCloudQrCodeService.updateProject({
            id: formState.id!,
            name: formState.name,
          });
          message.success("编辑成功");
        }
        history.back();
      } catch (error) {
        message.error("保存失败，请检查表单数据");
      } finally {
        loading.value = false;
      }
    };

    const handleBack = (): void => {
      history.back();
    };

    onMounted(() => {
      initData();
    });

    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <div class={styles.editContainer}>
          <Form ref={formRef} model={formState} rules={rules} labelCol={{ flex: "0 0 120px" }} wrapperCol={{ flex: "1" }}>
            <div class={styles.twoColumnRow}>
              <div class={styles.formItem}>
                <FormItem label="项目名称" name="name">
                  {isDetail ? (
                    <span>{formState.name || "--"}</span>
                  ) : (
                    <Input v-model:value={formState.name} placeholder="请输入项目名称" maxlength={50} showCount />
                  )}
                </FormItem>
              </div>
              {action !== "add" && (
                <div class={styles.formItem}>
                  <FormItem label="项目编号">
                    <span>{formState.code || "--"}</span>
                  </FormItem>
                </div>
              )}
            </div>

            {action !== "add" && (
              <div class={styles.twoColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="项目密钥">
                    <span style={{ wordBreak: "break-all" }}>{formState.secret || "--"}</span>
                  </FormItem>
                </div>
              </div>
            )}
          </Form>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div class={styles.footerActions}>
          <Button onClick={handleBack}>{isDetail ? "返回" : "取消"}</Button>
          {!isDetail && (
            <Button type="primary" loading={loading.value} onClick={handleSave} style={{ marginLeft: "16px" }}>
              保存
            </Button>
          )}
        </div>
      ),
    };

    return (): JSX.Element => {
      let title = "新增项目";
      if (action === "edit") {
        title = "编辑项目";
      } else if (action === "detail") {
        title = "项目详情";
      }
      return <CubeLayout title={title} v-slots={layoutSlots} />;
    };
  },
});
