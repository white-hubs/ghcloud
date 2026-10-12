import styles from "./qrcode-type-edit.module.less";
import { cubeCloudQrCodeService } from "@/api/server";
import { GrantProjectSelect } from "@/components/project-select/project-select";
import { CubeLayout } from "@ghcloud/cube-app-design";
import type { QrCodeTypeEntity } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Form, FormItem, Input, Button, message, Textarea } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

export const QrCodeTypeEdit = defineComponent({
  setup: () => {
    const route = useRoute();
    const qrCodeId = route.query.id as string;
    const action = (route.query.action as string) || "add";
    const isDetail = action === "detail" || action === "view";
    const formRef = ref();
    const loading = ref(false);
    const qrCodeTypeData = ref<QrCodeTypeEntity>();

    // 表单数据
    const formState = reactive<{
      id: string | number;
      code: string;
      name: string;
      remark: string;
      grantClientId: string;
      grantClientName: string;
    }>({
      id: "",
      code: "",
      name: "",
      remark: "",
      grantClientId: "",
      grantClientName: "",
    });

    // 表单验证规则
    const rules = {
      code: [{ required: true, message: "请输入二维码类型编号", trigger: "blur" }],
      name: [{ required: true, message: "请输入二维码类型名称", trigger: "blur" }],
      grantClientId: [{ required: true, message: "请选择授权项目", trigger: "change" }],
      remark: [{ required: false, message: "请输入二维码类型备注", trigger: "blur" }],
    };

    // 初始化数据
    const initData = async (): Promise<void> => {
      if (action === "add") {
        return;
      }
      try {
        // 编辑或详情模式，调用接口获取详情
        const result = await cubeCloudQrCodeService.getQrCodeTypeDetail(qrCodeId);
        qrCodeTypeData.value = result;
        Object.assign(formState, result);
      } catch (error) {
        message.error("获取详情失败");
      }
    };

    // 处理授权项目选择
    const handleGrantClientChange = (id: string, client: any): void => {
      formState.grantClientId = id;
      formState.grantClientName = client?.name || "";
    };

    // 保存数据
    const handleSave = async (): Promise<void> => {
      try {
        loading.value = true;
        await formRef.value?.validate();

        if (action === "add") {
          // 新增
          await cubeCloudQrCodeService.createQrCodeType({
            code: formState.code,
            name: formState.name,
            remark: formState.remark,
            grantClientCode: formState.grantClientId,
          });
          message.success("新增成功");
        } else {
          // 编辑
          await cubeCloudQrCodeService.updateQrCodeType({
            id: formState.id,
            code: formState.code,
            name: formState.name,
            remark: formState.remark,
            grantClientCode: formState.grantClientId,
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

    // 返回上一页
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
            {/* 基本信息 */}
            <div class={styles.twoColumnRow}>
              <div class={styles.formItem}>
                <FormItem label="二维码类型编号" name="code">
                  {isDetail ? (
                    <span style={{ textAlign: "left", display: "block" }}>{formState.code || "--"}</span>
                  ) : (
                    <Input v-model:value={formState.code} placeholder="请输入二维码类型编号" showCount={false} />
                  )}
                </FormItem>
              </div>
              <div class={styles.formItem}>
                <FormItem label="二维码类型名称" name="name">
                  {isDetail ? (
                    <span style={{ textAlign: "left", display: "block" }}>{formState.name || "--"}</span>
                  ) : (
                    <Input v-model:value={formState.name} placeholder="请输入二维码类型名称" showCount={false} />
                  )}
                </FormItem>
              </div>
            </div>

            <div class={styles.twoColumnRow}>
              <div class={styles.formItem}>
                <FormItem label="授权项目" name="grantClientId">
                  {isDetail ? (
                    <span style={{ textAlign: "left", display: "block" }}>{formState.grantClientName || "--"}</span>
                  ) : (
                    <GrantProjectSelect
                      v-model:value={formState.grantClientId}
                      onChange={handleGrantClientChange}
                      readonly={action !== "add"}
                    />
                  )}
                </FormItem>
              </div>
            </div>
            <FormItem label="备注说明" name="remark" class={styles.formItem}>
              {isDetail ? (
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", textAlign: "left" }}>{formState.remark || "--"}</div>
              ) : (
                <Textarea maxlength={200} allowClear rows={3} v-model:value={formState.remark} showCount placeholder="输入备注信息" />
              )}
            </FormItem>
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
      let title = "新增二维码类型";
      if (action === "edit") {
        title = "编辑二维码类型";
      } else if (action === "detail") {
        title = "二维码类型详情";
      }
      return <CubeLayout title={title} v-slots={layoutSlots} />;
    };
  },
});
