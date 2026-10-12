import styles from "./qrcode-edit.module.less";
import { cubeCloudQrCodeService } from "@/api/server";
import { GrantProjectSelect } from "@/components/project-select/project-select";
import { CubeLayout } from "@ghcloud/cube-app-design";
import {
  type QrCodeEntity,
  QrCodeContentTypeOptions,
  type QrCodeTypeEntity,
  getQrCodeContentTypeLabel,
  QrCodeModeOptions,
  getQrCodeModeLabel,
} from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { Form, FormItem, Input, Button, message, RadioGroup, Select, Space, Textarea } from "@ghcloud/cube-ui";
import { defineComponent, reactive, ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";

export const QrCodeEdit = defineComponent({
  setup: () => {
    const route = useRoute();
    const qrCodeId = route.query.id as string;
    const action = (route.query.action as string) || "add";
    const isDetail = action === "detail" || action === "view";
    const formRef = ref();
    const loading = ref(false);
    const qrCodeData = ref<QrCodeEntity>();
    const qrCodeTypeList = ref<QrCodeTypeEntity[]>([]); // 二维码类型列表

    // 跳转参数键值对类型
    interface ParamItem {
      key: string;
      value: string;
    }

    // 表单数据
    const formState = reactive<{
      id: string | number;
      name: string;
      qrTypeId: string | number | undefined;
      qrContentType: string;
      qrContent: string;
      grantClientId: string;
      enabled: boolean;
      mode: string;
      modeContent: string;
      targetUrl: string;
      targetParams: string;
    }>({
      id: "",
      name: "",
      qrTypeId: undefined,
      qrContentType: QrCodeContentTypeOptions[0].value,
      qrContent: "",
      grantClientId: "",
      enabled: true,
      mode: QrCodeModeOptions[0].value,
      modeContent: "",
      targetUrl: "",
      targetParams: "",
    });

    // 跳转参数键值对列表
    const paramsList = ref<ParamItem[]>([]);

    // 二维码类型选项列表
    const qrCodeTypeOptions = computed(() => {
      const options = qrCodeTypeList.value.map((type) => ({
        label: type.name,
        value: type.id,
      }));
      return options;
    });

    // 是否为链接类型
    const isLinkType = computed(() => formState.qrContentType === "LINK");

    // 是否为跳转行为
    const isRouteMode = computed(() => formState.mode === "ROUTE");

    // URL验证规则
    const urlValidator = (_rule: unknown, value: string): Promise<void> => {
      if (!value) {
        return Promise.resolve();
      }
      // 支持域名、IP地址、localhost、端口号、路径、查询参数
      const urlPattern =
        /^(https?:\/\/)([a-zA-Z0-9.-]+|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|localhost)(:[0-9]{1,5})?(\/.*)?$/;

      if (!urlPattern.test(value)) {
        return Promise.reject("请输入有效的URL地址");
      }
      return Promise.resolve();
    };

    // 表单验证规则
    const rules = {
      name: [{ required: true, message: "请输入二维码名称", trigger: "blur" }],
      qrTypeId: [{ required: action === "add", message: "请选择二维码类型", trigger: "change" }],
      qrContentType: [{ required: true, message: "请选择内容类型", trigger: "change" }],
      qrContent: [
        {
          validator: (_rule: unknown, value: string): Promise<void> => {
            if (!isLinkType.value && !value) {
              return Promise.reject("请输入二维码内容");
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      grantClientId: [{ required: action === "add", message: "请选择授权项目", trigger: "change" }],
      targetUrl: [
        {
          validator: (_rule: unknown, value: string): Promise<void> => {
            if (isLinkType.value && isRouteMode.value && !value) {
              return Promise.reject("请输入目标URL");
            }
            if (value) {
              return urlValidator(_rule, value);
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      mode: [
        {
          validator: (_rule: unknown, value: string): Promise<void> => {
            if (isLinkType.value && !value) {
              return Promise.reject("请选择行为");
            }
            return Promise.resolve();
          },
          trigger: "change",
        },
      ],
      modeContent: [
        {
          validator: (_rule: unknown, value: string): Promise<void> => {
            if (isLinkType.value && !isRouteMode.value && !value) {
              return Promise.reject("请输入文本内容");
            }
            return Promise.resolve();
          },
          trigger: "blur",
        },
      ],
      enabled: [{ required: true, message: "请选择启用状态", trigger: "change" }],
    };

    // 监听内容类型变化，清空相关字段（仅在用户手动切换时）
    watch(
      () => formState.qrContentType,
      (newVal, oldVal) => {
        // 初始化时 oldVal 为 undefined，不执行清空逻辑
        if (!oldVal) {
          return;
        }

        if (oldVal === "LINK" && newVal !== "LINK") {
          // 从链接切换到其他类型，清空路由配置和行为相关
          formState.mode = QrCodeModeOptions[0].value;
          formState.modeContent = "";
          formState.targetUrl = "";
          formState.targetParams = "";
          paramsList.value = [];
          formRef.value?.clearValidate(["mode", "modeContent", "targetUrl", "targetParams"]);
        } else if (oldVal !== "LINK" && newVal === "LINK") {
          // 从其他类型切换到链接，清空二维码内容
          formState.qrContent = "";
          formState.mode = QrCodeModeOptions[0].value;
          formState.modeContent = "";
          formRef.value?.clearValidate(["qrContent", "mode", "modeContent"]);
        }
      },
    );

    // 监听行为变化，清空相关字段
    watch(
      () => formState.mode,
      (newVal, oldVal) => {
        if (!oldVal) {
          return;
        }

        if (oldVal === "ROUTE" && newVal === "TEXT") {
          // 从跳转切换到纯文本，清空路由信息
          formState.targetUrl = "";
          formState.targetParams = "";
          paramsList.value = [];
          formRef.value?.clearValidate(["targetUrl", "targetParams"]);
        } else if (oldVal === "TEXT" && newVal === "ROUTE") {
          // 从纯文本切换到跳转，清空文本内容
          formState.modeContent = "";
          formRef.value?.clearValidate("modeContent");
        }
      },
    );

    // 序列化键值对为JSON字符串
    const serializeParams = (): string => {
      if (paramsList.value.length === 0) {
        return "";
      }
      const obj: Record<string, string> = {};
      paramsList.value.forEach((item) => {
        if (item.key.trim()) {
          obj[item.key.trim()] = item.value;
        }
      });
      return Object.keys(obj).length > 0 ? JSON.stringify(obj) : "";
    };

    // 反序列化JSON字符串为键值对
    const deserializeParams = (jsonStr: string): void => {
      if (!jsonStr || jsonStr.trim() === "") {
        paramsList.value = [];
        return;
      }
      try {
        const obj = JSON.parse(jsonStr);
        if (typeof obj === "object" && obj !== null) {
          paramsList.value = Object.entries(obj).map(([key, value]) => ({
            key,
            value: String(value),
          }));
        } else {
          paramsList.value = [];
        }
      } catch {
        paramsList.value = [];
      }
    };

    // 添加键值对
    const addParam = (): void => {
      paramsList.value.push({ key: "", value: "" });
    };

    // 删除键值对
    const removeParam = (index: number): void => {
      paramsList.value.splice(index, 1);
    };

    // 获取二维码类型列表
    const getQrCodeTypeList = async (): Promise<void> => {
      try {
        const result = await cubeCloudQrCodeService.getQrCodeTypes({
          pageNumber: 1,
          pageSize: 1000,
          grantClientId: formState.grantClientId,
        });
        qrCodeTypeList.value = result.records || [];
      } catch (error) {
        message.error("获取二维码类型列表失败");
      }
    };

    // 初始化数据
    const initData = async (): Promise<void> => {
      if (action === "add") {
        // 新增模式，设置默认值
        formState.enabled = true;
        formState.qrContentType = QrCodeContentTypeOptions[0].value;
        return;
      }
      // 编辑模式，获取详情
      try {
        loading.value = true;
        const detail = await cubeCloudQrCodeService.getQrCodeDetail(qrCodeId);
        qrCodeData.value = detail;

        // 填充表单数据
        formState.id = detail.id;
        formState.name = detail.name;
        formState.qrTypeId = detail.qrTypeId;
        formState.qrContentType = detail.qrContentType;
        formState.qrContent = detail.qrContent;
        formState.grantClientId = detail.grantClientId;
        formState.enabled = detail.enabled;
        formState.mode = detail.mode || QrCodeModeOptions[0].value;
        formState.modeContent = detail.modeContent || "";
        formState.targetUrl = detail.route?.targetUrl || "";
        formState.targetParams = detail.route?.targetParams || "";

        // 反序列化跳转参数
        deserializeParams(detail.route?.targetParams || "");

        // 获取二维码类型列表
        await getQrCodeTypeList();
      } catch {
        message.error("获取二维码详情失败");
      } finally {
        loading.value = false;
      }
    };

    // 处理授权项目选择
    const handleGrantClientChange = async (id: string): Promise<void> => {
      formState.grantClientId = id;
      formState.qrTypeId = undefined;
      qrCodeTypeList.value = [];
      if (id) {
        await getQrCodeTypeList();
      }
    };

    // 保存数据
    const handleSave = async (): Promise<void> => {
      try {
        loading.value = true;
        await formRef.value?.validate();

        if (action === "add") {
          // 序列化跳转参数
          const serializedParams = serializeParams();

          // 新增
          const route =
            isLinkType.value && isRouteMode.value && (formState.targetUrl || serializedParams)
              ? {
                  targetUrl: formState.targetUrl,
                  targetParams: serializedParams,
                }
              : undefined;

          const payload: Record<string, unknown> = {
            name: formState.name,
            qrTypeId: formState.qrTypeId,
            qrContentType: formState.qrContentType,
            qrContent: isLinkType.value ? formState.targetUrl : formState.qrContent,
            grantClientId: formState.grantClientId,
            enabled: formState.enabled,
            mode: isLinkType.value ? formState.mode : undefined,
            modeContent: isLinkType.value && !isRouteMode.value ? formState.modeContent : undefined,
          };

          if (route) {
            payload.route = route;
          }

          await cubeCloudQrCodeService.createQrCode(payload as any);
          message.success("新增成功");
        } else {
          // 序列化跳转参数
          const serializedParams = serializeParams();

          // 编辑
          const route =
            isLinkType.value && isRouteMode.value && (formState.targetUrl || serializedParams)
              ? {
                  targetUrl: formState.targetUrl,
                  targetParams: serializedParams,
                }
              : undefined;

          const payload: Record<string, unknown> = {
            id: formState.id,
            name: formState.name,
            qrContentType: formState.qrContentType,
            qrContent: isLinkType.value ? formState.targetUrl : formState.qrContent,
            enabled: formState.enabled,
            mode: isLinkType.value ? formState.mode : undefined,
            modeContent: isLinkType.value && !isRouteMode.value ? formState.modeContent : undefined,
          };

          if (route) {
            payload.route = route;
          }

          await cubeCloudQrCodeService.updateQrCode(payload as any);
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
                <FormItem label="二维码名称" name="name">
                  {isDetail ? (
                    <span style={{ textAlign: "left", display: "block" }}>{formState.name || "--"}</span>
                  ) : (
                    <Input v-model:value={formState.name} placeholder="请输入二维码名称" maxlength={100} showCount />
                  )}
                </FormItem>
              </div>
              <div class={styles.formItem}>
                <FormItem label="内容类型" name="qrContentType">
                  {isDetail ? (
                    <span style={{ textAlign: "left", display: "block" }}>{getQrCodeContentTypeLabel(formState.qrContentType)}</span>
                  ) : (
                    <Select
                      v-model:value={formState.qrContentType}
                      placeholder="请选择内容类型"
                      options={QrCodeContentTypeOptions}
                      fieldNames={{ label: "label", value: "value" }}
                    />
                  )}
                </FormItem>
              </div>
            </div>

            {/* 非链接类型才显示二维码内容 */}
            {!isLinkType.value && (
              <div class={styles.twoColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="二维码内容" name="qrContent">
                    {isDetail ? (
                      <span style={{ textAlign: "left", display: "block" }}>{formState.qrContent || "--"}</span>
                    ) : (
                      <Input v-model:value={formState.qrContent} placeholder="请输入二维码内容" maxlength={500} showCount />
                    )}
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="授权项目" name="grantClientId">
                    {isDetail ? (
                      <span style={{ textAlign: "left", display: "block" }}>{qrCodeData.value?.grantClientName || "--"}</span>
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
            )}

            {/* 链接类型显示授权项目和二维码类型 */}
            {isLinkType.value && (
              <>
                <div class={styles.twoColumnRow}>
                  <div class={styles.formItem}>
                    <FormItem label="授权项目" name="grantClientId">
                      {isDetail ? (
                        <span style={{ textAlign: "left", display: "block" }}>{qrCodeData.value?.grantClientName || "--"}</span>
                      ) : (
                        <GrantProjectSelect
                          v-model:value={formState.grantClientId}
                          onChange={handleGrantClientChange}
                          readonly={action !== "add"}
                        />
                      )}
                    </FormItem>
                  </div>
                  {action === "add" && (
                    <div class={styles.formItem}>
                      <FormItem label="二维码类型" name="qrTypeId">
                        <Select
                          v-model:value={formState.qrTypeId}
                          placeholder="请选择二维码类型"
                          disabled={!formState.grantClientId}
                          showSearch
                          allowClear
                          options={qrCodeTypeOptions.value}
                          fieldNames={{ label: "label", value: "value" }}
                          filterOption={(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        />
                      </FormItem>
                    </div>
                  )}
                  {isDetail && (
                    <div class={styles.formItem}>
                      <FormItem label="二维码类型" name="qrTypeId">
                        <span style={{ textAlign: "left", display: "block" }}>{qrCodeTypeList.value.find((t) => t.id === formState.qrTypeId)?.name || "--"}</span>
                      </FormItem>
                    </div>
                  )}
                  {action === "edit" && <div class={styles.formItem}></div>}
                </div>
                {/* 行为选择 */}
                <div class={styles.twoColumnRow}>
                  <div class={styles.formItem}>
                    <FormItem label="行为" name="mode">
                      {isDetail ? (
                        <span style={{ textAlign: "left", display: "block" }}>{getQrCodeModeLabel(formState.mode)}</span>
                      ) : (
                        <Select
                          v-model:value={formState.mode}
                          placeholder="请选择行为"
                          options={QrCodeModeOptions}
                          fieldNames={{ label: "label", value: "value" }}
                        />
                      )}
                    </FormItem>
                  </div>
                  <div class={styles.formItem}></div>
                </div>
              </>
            )}

            {/* 非链接类型的二维码类型和启用状态 */}
            {!isLinkType.value && (action === "add" || isDetail) && (
              <div class={styles.twoColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="二维码类型" name="qrTypeId">
                    {isDetail ? (
                      <span style={{ textAlign: "left", display: "block" }}>{qrCodeTypeList.value.find((t) => t.id === formState.qrTypeId)?.name || "--"}</span>
                    ) : (
                      <Select
                        v-model:value={formState.qrTypeId}
                        placeholder="请选择二维码类型"
                        disabled={!formState.grantClientId}
                        showSearch
                        allowClear
                        options={qrCodeTypeOptions.value}
                        fieldNames={{ label: "label", value: "value" }}
                        filterOption={(input: string, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      />
                    )}
                  </FormItem>
                </div>
                <div class={styles.formItem}>
                  <FormItem label="是否启用" name="enabled">
                    {isDetail ? (
                      <span style={{ textAlign: "left", display: "block" }}>{formState.enabled ? "是" : "否"}</span>
                    ) : (
                      <RadioGroup
                        v-model:value={formState.enabled}
                        options={[
                          { label: "是", value: true },
                          { label: "否", value: false },
                        ]}
                      />
                    )}
                  </FormItem>
                </div>
              </div>
            )}

            {!isLinkType.value && action === "edit" && (
              <div class={styles.twoColumnRow}>
                <div class={styles.formItem}>
                  <FormItem label="是否启用" name="enabled">
                    <RadioGroup
                      v-model:value={formState.enabled}
                      options={[
                        { label: "是", value: true },
                        { label: "否", value: false },
                      ]}
                    />
                  </FormItem>
                </div>
                <div class={styles.formItem}></div>
              </div>
            )}

            {/* 链接类型的启用状态、目标URL和文本内容 */}
            {isLinkType.value && (
              <>
                <div class={styles.twoColumnRow}>
                  <div class={styles.formItem}>
                    <FormItem label="是否启用" name="enabled">
                      {isDetail ? (
                        <span style={{ textAlign: "left", display: "block" }}>{formState.enabled ? "是" : "否"}</span>
                      ) : (
                        <RadioGroup
                          v-model:value={formState.enabled}
                          options={[
                            { label: "是", value: true },
                            { label: "否", value: false },
                          ]}
                        />
                      )}
                    </FormItem>
                  </div>
                  <div class={styles.formItem}></div>
                </div>
                {/* 纯文本行为时显示文本内容 */}
                {!isRouteMode.value && (
                  <div class={styles.twoColumnRow}>
                    <div class={styles.formItem} style={{ flex: "0 0 100%" }}>
                      <FormItem label="文本内容" name="modeContent">
                        {isDetail ? (
                          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", textAlign: "left" }}>{formState.modeContent || "--"}</div>
                        ) : (
                          <Textarea
                            maxlength={200}
                            allowClear
                            rows={3}
                            v-model:value={formState.modeContent}
                            showCount
                            placeholder="请输入文本内容"
                          />
                        )}
                      </FormItem>
                    </div>
                  </div>
                )}
                {/* 跳转行为时显示目标URL */}
                {isRouteMode.value && (
                  <div class={styles.twoColumnRow}>
                    <div class={styles.formItem} style={{ flex: 1 }}>
                      <FormItem label="目标URL" name="targetUrl">
                        {isDetail ? (
                          <div style={{ wordBreak: "break-all", textAlign: "left" }}>{formState.targetUrl || "--"}</div>
                        ) : (
                          <Input v-model:value={formState.targetUrl} placeholder="请输入目标URL" maxlength={500} showCount />
                        )}
                      </FormItem>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 链接类型且跳转行为时的跳转参数 */}
            {isLinkType.value && isRouteMode.value && (
              <div class={styles.twoColumnRow}>
                <div class={styles.formItem} style={{ flex: 1 }}>
                  <FormItem label="跳转参数">
                    <div>
                      {paramsList.value.map((param, index) => (
                        <Space key={index} style={{ display: "flex", marginBottom: "8px" }} align="baseline">
                          {isDetail ? (
                            <>
                              <span style={{ minWidth: "100px", color: "rgba(0,0,0,0.45)" }}>参数名:</span>
                              <span style={{ marginRight: "24px" }}>{param.key || "--"}</span>
                              <span style={{ minWidth: "100px", color: "rgba(0,0,0,0.45)" }}>参数值:</span>
                              <span>{param.value || "--"}</span>
                            </>
                          ) : (
                            <>
                              <Input v-model:value={param.key} placeholder="参数名" style={{ width: "200px" }} />
                              <Input v-model:value={param.value} placeholder="参数值" style={{ width: "300px" }} />
                              <Button type="link" danger onClick={() => removeParam(index)}>
                                删除
                              </Button>
                            </>
                          )}
                        </Space>
                      ))}
                      {!isDetail && (
                        <Button type="dashed" onClick={addParam} style={{ width: "100%" }}>
                          + 添加参数
                        </Button>
                      )}
                      {isDetail && paramsList.value.length === 0 && <span>--</span>}
                    </div>
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
      let title = "新增二维码";
      if (action === "edit") {
        title = "编辑二维码";
      } else if (action === "detail") {
        title = "二维码详情";
      }
      return <CubeLayout title={title} v-slots={layoutSlots} />;
    };
  },
});
