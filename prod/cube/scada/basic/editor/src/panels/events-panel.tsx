import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons-vue";
import type { Action, EventHandler } from "@cube-scada/core";
import {
  Collapse,
  CollapsePanel,
  Select,
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  Empty,
  Space,
  Popconfirm,
  Card,
  Switch,
  message,
} from "ant-design-vue";
import { defineComponent, ref, computed, type PropType } from "vue";

import { TagSelectWithCreate } from "../components/tag-select-with-create";
import type { TagOption } from "../hooks/use-field-dictionary";
import { useFieldDictionary } from "../hooks/use-field-dictionary";
import { usePageList } from "../hooks/use-page-list";
import { useEditorStore } from "../store/use-editor-store";

const EVENT_OPTIONS = [
  { label: "单击", value: "click" },
  { label: "双击", value: "dblclick" },
  { label: "右键菜单", value: "contextmenu" },
  { label: "鼠标移入", value: "mouseenter" },
  { label: "鼠标移出", value: "mouseleave" },
];

const ACTION_TYPE_OPTIONS = [
  { label: "跳转页面", value: "navigate" },
  { label: "写入点位", value: "setTag" },
  { label: "切换点位", value: "toggleTag" },
  { label: "弹出窗口", value: "showPopup" },
  { label: "设置图元显示隐藏", value: "setElementVisibility" },
  { label: "调用接口", value: "callApi" },
];

function defaultParamsByActionType(type: string): Record<string, any> {
  switch (type) {
    case "toggleTag":
      return { onValue: "true", offValue: "false" };
    case "showPopup":
      return {
        title: "",
        contentId: "",
        content: "",
        contentStyle: { textAlign: "left", fontSize: 14, color: "#262626", fontWeight: 400, lineHeight: 1.6 },
        deviceStyle: {
          layout: "rows",
          textAlign: "left",
          labelFontSize: 13,
          labelColor: "#8c8c8c",
          labelFontWeight: 400,
          valueFontSize: 14,
          valueColor: "#262626",
          valueFontWeight: 500,
          rowGap: 10,
          columnGap: 16,
        },
      };
    case "setElementVisibility":
      return { targetElementId: "", visible: true };
    default:
      return {};
  }
}

const WriteValueField = defineComponent({
  props: {
    tag: { type: String, default: "" },
    value: { type: String, default: "" },
    tagOptions: { type: Array as () => TagOption[], required: true },
    onChange: { type: Function as PropType<(v: string) => void>, required: true },
  },
  setup(props) {
    return () => {
      const opt = props.tagOptions.find((o) => o.value === props.tag);
      if (opt?.valueType === "boolean") {
        return (
          <Select
            value={props.value}
            options={[
              { label: "是", value: "true" },
              { label: "否", value: "false" },
            ]}
            onChange={(v: any) => props.onChange(String(v))}
            style="width:100%"
          />
        );
      }
      if (opt?.valueType === "number") {
        return <InputNumber value={Number(props.value)} onChange={(v: any) => props.onChange(String(v ?? ""))} style="width:100%" />;
      }
      return <Input value={props.value} placeholder="输入值" onChange={(e: any) => props.onChange(e.target?.value ?? e)} />;
    };
  },
});

const ActionParamsForm = defineComponent({
  props: {
    action: { type: Object as () => Action, required: true },
    tagOptions: { type: Array as () => Array<{ label: string; value: string }>, required: true },
    fullTagOptions: { type: Array as () => TagOption[], required: true },
    pageOptions: { type: Array as () => Array<{ label: string; value: string }>, required: true },
    targetOptions: { type: Array as () => Array<{ label: string; value: string }>, required: true },
    globals: { type: Object as () => Record<string, string>, required: true },
    getValuePlaceholder: { type: Function as PropType<(tag?: string) => string>, required: true },
  },
  emits: ["update"],
  setup(props, { emit }) {
    const toTagsValue = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
      if (typeof value === "string" && value.length > 0) return [value];
      return [];
    };

    const updateParam = (key: string, value: any) => {
      emit("update", { ...props.action, params: { ...props.action.params, [key]: value } });
    };

    const nestedParam = (section: "contentStyle" | "deviceStyle", key: string, fallback: unknown) => {
      const value = props.action.params[section];
      if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
      return (value as Record<string, unknown>)[key] ?? fallback;
    };

    const updateNestedParam = (section: "contentStyle" | "deviceStyle", key: string, value: unknown) => {
      const current = props.action.params[section];
      const sectionValue = current && typeof current === "object" && !Array.isArray(current) ? current : {};
      updateParam(section, { ...sectionValue, [key]: value });
    };

    const renderColorField = (section: "contentStyle" | "deviceStyle", key: string, fallback: string) => (
      <Input
        type="color"
        value={String(nestedParam(section, key, fallback))}
        style={{ width: "100%", height: "32px", padding: "2px 6px" }}
        onInput={(e: any) => updateNestedParam(section, key, e.target?.value ?? fallback)}
      />
    );

    const renderAlignmentField = (section: "contentStyle" | "deviceStyle", fallback = "left") => (
      <Select
        value={String(nestedParam(section, "textAlign", fallback))}
        options={[
          { label: "左对齐", value: "left" },
          { label: "居中", value: "center" },
          { label: "右对齐", value: "right" },
        ]}
        onChange={(value: any) => updateNestedParam(section, "textAlign", value)}
      />
    );

    const appendToken = (key: string, token: string) => {
      const current = String(props.action.params[key] ?? "");
      updateParam(key, current ? `${current}${token}` : token);
    };

    const renderTargetSelector = (required = false) => (
      <FormItem label={required ? "目标图元" : "作用目标图元 (可选)"} required={required}>
        <Select
          value={props.action.params.targetElementId}
          allowClear
          showSearch
          options={props.targetOptions}
          placeholder={required ? "请选择要显示或隐藏的图元" : "选择联动目标图元"}
          onChange={(v: any) => updateParam("targetElementId", v)}
        />
      </FormItem>
    );

    const renderGlobalTokenButtons = (targetKey: string) => (
      <FormItem label={`插入全局变量到 ${targetKey}`}>
        <Space wrap>
          {Object.keys(props.globals).length === 0 ? (
            <span style="color:#999">暂无可插入变量</span>
          ) : (
            Object.keys(props.globals).map((key) => {
              const token = `\${global.${key}}`;
              return (
                <Button size="small" key={`${targetKey}-${token}`} onClick={() => appendToken(targetKey, token)}>
                  {token}
                </Button>
              );
            })
          )}
        </Space>
      </FormItem>
    );

    return () => {
      switch (props.action.type) {
        case "navigate":
          return (
            <>
              <FormItem label="目标页面">
                <Select
                  value={props.action.params.pageId}
                  showSearch
                  allowClear
                  options={props.pageOptions}
                  placeholder="选择或输入页面 ID"
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase()) ||
                    (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(v: any) => updateParam("pageId", v ?? "")}
                  onSearch={(v: string) => {
                    if (!props.pageOptions.find((o) => o.value === v)) updateParam("pageId", v);
                  }}
                />
              </FormItem>
              {renderGlobalTokenButtons("pageId")}
              {renderTargetSelector()}
            </>
          );
        case "setTag":
          return (
            <>
              <FormItem label="点位名">
                <TagSelectWithCreate
                  value={props.action.params.tag ?? ""}
                  tagOptions={props.fullTagOptions}
                  onChange={(v) => updateParam("tag", v)}
                />
              </FormItem>
              <FormItem label="写入值">
                <WriteValueField
                  tag={props.action.params.tag}
                  value={props.action.params.value ?? ""}
                  tagOptions={props.fullTagOptions}
                  onChange={(v) => updateParam("value", v)}
                />
              </FormItem>
              {renderGlobalTokenButtons("tag")}
              {renderGlobalTokenButtons("value")}
              {renderTargetSelector()}
            </>
          );
        case "toggleTag":
          return (
            <>
              <FormItem label="点位名">
                <TagSelectWithCreate
                  value={props.action.params.tag ?? ""}
                  tagOptions={props.fullTagOptions}
                  onChange={(v) => updateParam("tag", v)}
                />
              </FormItem>
              <FormItem label="打开值 (ON)">
                <WriteValueField
                  tag={props.action.params.tag}
                  value={props.action.params.onValue ?? "true"}
                  tagOptions={props.fullTagOptions}
                  onChange={(v) => updateParam("onValue", v)}
                />
              </FormItem>
              <FormItem label="关闭值 (OFF)">
                <WriteValueField
                  tag={props.action.params.tag}
                  value={props.action.params.offValue ?? "false"}
                  tagOptions={props.fullTagOptions}
                  onChange={(v) => updateParam("offValue", v)}
                />
              </FormItem>
              {renderGlobalTokenButtons("tag")}
              {renderGlobalTokenButtons("onValue")}
              {renderGlobalTokenButtons("offValue")}
              {renderTargetSelector()}
            </>
          );
        case "showPopup":
          return (
            <>
              <FormItem label="弹窗标题 (可选)">
                <Input
                  value={props.action.params.title}
                  placeholder="默认：提示"
                  onChange={(e: any) => updateParam("title", e.target?.value ?? e)}
                />
              </FormItem>
              {renderGlobalTokenButtons("title")}
              <FormItem label="弹窗内容 ID">
                <Input
                  value={props.action.params.contentId}
                  placeholder="trend-chart"
                  onChange={(e: any) => updateParam("contentId", e.target?.value ?? e)}
                />
              </FormItem>
              {renderGlobalTokenButtons("contentId")}
              <FormItem label="纯文本内容 (可选)" tooltip="与内容 ID 可同时配置；运行端若按 contentId 自定义了弹窗，仍可把此处作为补充说明">
                <Input.TextArea
                  value={props.action.params.content ?? ""}
                  placeholder="直接显示的说明文字…"
                  rows={3}
                  onChange={(e: any) => updateParam("content", e.target?.value ?? e)}
                />
              </FormItem>
              {renderGlobalTokenButtons("content")}
              <Card size="small" title="自定义内容样式" style={{ marginBottom: "12px" }}>
                <FormItem label="文字对齐">{renderAlignmentField("contentStyle")}</FormItem>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "8px" }}>
                  <FormItem label="字号">
                    <InputNumber
                      value={Number(nestedParam("contentStyle", "fontSize", 14))}
                      min={1}
                      max={200}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("contentStyle", "fontSize", value ?? 14)}
                    />
                  </FormItem>
                  <FormItem label="行高">
                    <InputNumber
                      value={Number(nestedParam("contentStyle", "lineHeight", 1.6))}
                      min={0.8}
                      max={4}
                      step={0.1}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("contentStyle", "lineHeight", value ?? 1.6)}
                    />
                  </FormItem>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "8px" }}>
                  <FormItem label="文字颜色">{renderColorField("contentStyle", "color", "#262626")}</FormItem>
                  <FormItem label="加粗">
                    <Switch
                      checked={Number(nestedParam("contentStyle", "fontWeight", 400)) >= 700}
                      onChange={(checked: any) => updateNestedParam("contentStyle", "fontWeight", checked ? 700 : 400)}
                    />
                  </FormItem>
                </div>
              </Card>
              <Card size="small" title="设备数据样式（label / value）" style={{ marginBottom: "12px" }}>
                <FormItem label="数据排版">
                  <Select
                    value={String(nestedParam("deviceStyle", "layout", "rows"))}
                    options={[
                      { label: "逐行排列", value: "rows" },
                      { label: "多列排列", value: "columns" },
                    ]}
                    onChange={(value: any) => updateNestedParam("deviceStyle", "layout", value)}
                  />
                </FormItem>
                <FormItem label="文字对齐">{renderAlignmentField("deviceStyle")}</FormItem>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "8px" }}>
                  <FormItem label="Label 字号">
                    <InputNumber
                      value={Number(nestedParam("deviceStyle", "labelFontSize", 13))}
                      min={1}
                      max={200}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("deviceStyle", "labelFontSize", value ?? 13)}
                    />
                  </FormItem>
                  <FormItem label="Value 字号">
                    <InputNumber
                      value={Number(nestedParam("deviceStyle", "valueFontSize", 14))}
                      min={1}
                      max={200}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("deviceStyle", "valueFontSize", value ?? 14)}
                    />
                  </FormItem>
                  <FormItem label="Label 颜色">{renderColorField("deviceStyle", "labelColor", "#8c8c8c")}</FormItem>
                  <FormItem label="Value 颜色">{renderColorField("deviceStyle", "valueColor", "#262626")}</FormItem>
                  <FormItem label="Label 加粗">
                    <Switch
                      checked={Number(nestedParam("deviceStyle", "labelFontWeight", 400)) >= 700}
                      onChange={(checked: any) => updateNestedParam("deviceStyle", "labelFontWeight", checked ? 700 : 400)}
                    />
                  </FormItem>
                  <FormItem label="Value 加粗">
                    <Switch
                      checked={Number(nestedParam("deviceStyle", "valueFontWeight", 500)) >= 700}
                      onChange={(checked: any) => updateNestedParam("deviceStyle", "valueFontWeight", checked ? 700 : 400)}
                    />
                  </FormItem>
                  <FormItem label="行间距">
                    <InputNumber
                      value={Number(nestedParam("deviceStyle", "rowGap", 10))}
                      min={0}
                      max={100}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("deviceStyle", "rowGap", value ?? 10)}
                    />
                  </FormItem>
                  <FormItem label="列间距">
                    <InputNumber
                      value={Number(nestedParam("deviceStyle", "columnGap", 16))}
                      min={0}
                      max={100}
                      style={{ width: "100%" }}
                      onChange={(value: any) => updateNestedParam("deviceStyle", "columnGap", value ?? 16)}
                    />
                  </FormItem>
                </div>
              </Card>
              {renderTargetSelector()}
            </>
          );
        case "setElementVisibility":
          return (
            <>
              {renderTargetSelector(true)}
              <FormItem label="目标状态" required>
                <Select
                  value={props.action.params.visible !== false}
                  options={[
                    { label: "显示", value: true },
                    { label: "隐藏", value: false },
                  ]}
                  onChange={(value: any) => updateParam("visible", Boolean(value))}
                />
              </FormItem>
            </>
          );
        case "callApi":
          return (
            <>
              <FormItem label="URL">
                <Input
                  value={props.action.params.url}
                  placeholder="https://api.example.com/..."
                  onChange={(e: any) => updateParam("url", e.target?.value ?? e)}
                />
              </FormItem>
              {renderGlobalTokenButtons("url")}
              <FormItem label="请求方法">
                <Select
                  value={props.action.params.method ?? "GET"}
                  options={["GET", "POST", "PUT", "DELETE"].map((m) => ({ label: m, value: m }))}
                  onChange={(v: any) => updateParam("method", v)}
                />
              </FormItem>
              {renderTargetSelector()}
            </>
          );
        default:
          return null;
      }
    };
  },
});

export const EventsPanel = defineComponent({
  name: "EventsPanel",
  props: {
    onPreviewPopup: { type: Function as PropType<(action: Action) => void>, default: undefined },
  },
  setup(props) {
    const store = useEditorStore();
    const { options: tagOptions, getValuePlaceholder } = useFieldDictionary();
    const { options: pageOptions } = usePageList();

    function getHandlers(): EventHandler[] {
      return store.selectedInstance?.eventHandlers ?? [];
    }

    function setHandlers(handlers: EventHandler[]) {
      const inst = store.selectedInstance;
      if (!inst) return;
      store.updateEventHandlers(inst.id, handlers);
    }

    function addEventHandler() {
      const handlers = [...getHandlers()];
      const defaultEvent = "click";
      if (handlers.some((h) => h.event === defaultEvent)) {
        void message.warning("已存在相同事件，建议合并动作而非重复添加");
      }
      handlers.push({ id: `eh-${Date.now()}`, event: defaultEvent, actions: [] });
      setHandlers(handlers);
    }

    function removeEventHandler(index: number) {
      const handlers = getHandlers().filter((_, i) => i !== index);
      setHandlers(handlers);
    }

    function updateEvent(index: number, event: string) {
      const handlers = [...getHandlers()];
      handlers[index] = { ...handlers[index], event };
      setHandlers(handlers);
    }

    function addAction(handlerIndex: number) {
      const handlers = [...getHandlers()];
      const actions = [...handlers[handlerIndex].actions];
      actions.push({ type: "navigate", params: {} });
      handlers[handlerIndex] = { ...handlers[handlerIndex], actions };
      setHandlers(handlers);
    }

    function updateAction(handlerIndex: number, actionIndex: number, action: Action) {
      const handlers = [...getHandlers()];
      const actions = [...handlers[handlerIndex].actions];
      actions[actionIndex] = action;
      handlers[handlerIndex] = { ...handlers[handlerIndex], actions };
      setHandlers(handlers);
    }

    function removeAction(handlerIndex: number, actionIndex: number) {
      const handlers = [...getHandlers()];
      const actions = handlers[handlerIndex].actions.filter((_, i) => i !== actionIndex);
      handlers[handlerIndex] = { ...handlers[handlerIndex], actions };
      setHandlers(handlers);
    }

    return () => {
      const inst = store.selectedInstance;
      if (!inst) {
        return <Empty description="未选中图元" style="padding: 24px" />;
      }

      const handlers = getHandlers();

      return (
        <div style="padding: 12px">
          <Button type="dashed" block onClick={addEventHandler} style="margin-bottom: 12px">
            <PlusOutlined /> 添加事件
          </Button>

          {handlers.length === 0 ? (
            <Empty description="无事件配置" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Collapse accordion>
              {handlers.map((handler, hIdx) => (
                <CollapsePanel
                  key={handler.id ?? hIdx}
                  header={
                    <Space>
                      <span>{EVENT_OPTIONS.find((e) => e.value === handler.event)?.label ?? handler.event}</span>
                      <span style="color: #999">({handler.actions.length} 个动作)</span>
                    </Space>
                  }
                  extra={
                    <Popconfirm title="删除此事件？" onConfirm={() => removeEventHandler(hIdx)}>
                      <Button type="link" size="small" danger onClick={(e: Event) => e.stopPropagation()}>
                        <DeleteOutlined />
                      </Button>
                    </Popconfirm>
                  }
                >
                  <Form layout="vertical" size="small">
                    <FormItem label="事件类型">
                      <Select value={handler.event} options={EVENT_OPTIONS} onChange={(v: any) => updateEvent(hIdx, v)} />
                    </FormItem>

                    {handler.actions.map((action, aIdx) => (
                      <Card
                        key={aIdx}
                        size="small"
                        title={`动作 ${aIdx + 1}`}
                        style="margin-bottom: 8px"
                        extra={
                          <Popconfirm title="删除此动作？" onConfirm={() => removeAction(hIdx, aIdx)}>
                            <Button type="link" size="small" danger>
                              <DeleteOutlined />
                            </Button>
                          </Popconfirm>
                        }
                      >
                        <Form layout="vertical" size="small">
                          <FormItem label="动作类型">
                            <Select
                              value={action.type}
                              options={ACTION_TYPE_OPTIONS}
                              onChange={(v: any) =>
                                updateAction(hIdx, aIdx, {
                                  type: v,
                                  params: defaultParamsByActionType(v),
                                  requireConfirm: action.requireConfirm,
                                })
                              }
                            />
                          </FormItem>
                          <ActionParamsForm
                            action={action}
                            tagOptions={tagOptions.value.map((item) => ({
                              label: item.label,
                              value: item.value,
                            }))}
                            fullTagOptions={tagOptions.value}
                            pageOptions={pageOptions.value}
                            targetOptions={store.elementOptions}
                            globals={store.globalState}
                            getValuePlaceholder={getValuePlaceholder}
                            onUpdate={(a: Action) => updateAction(hIdx, aIdx, a)}
                          />
                          {action.type === "showPopup" && props.onPreviewPopup ? (
                            <FormItem>
                              <Button block onClick={() => props.onPreviewPopup?.(action)}>
                                <EyeOutlined /> 预览弹窗内容
                              </Button>
                            </FormItem>
                          ) : null}
                          <FormItem label="需要确认" tooltip="开启后，运行时执行该动作前将弹出二次确认对话框，防止误操作">
                            <Switch
                              checked={action.requireConfirm ?? false}
                              size="small"
                              onChange={(v: boolean) => updateAction(hIdx, aIdx, { ...action, requireConfirm: v })}
                            />
                          </FormItem>
                        </Form>
                      </Card>
                    ))}

                    <Button type="dashed" block size="small" onClick={() => addAction(hIdx)}>
                      <PlusOutlined /> 添加动作
                    </Button>
                  </Form>
                </CollapsePanel>
              ))}
            </Collapse>
          )}
        </div>
      );
    };
  },
});
