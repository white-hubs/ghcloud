import { SCENE_SCOPE_KIND_LABELS } from "@cube-scada/core";
import { Drawer, Form, FormItem, Input, InputNumber, Divider, Tag } from "ant-design-vue";
import { defineComponent, ref, watch, type PropType } from "vue";

import { useEditorStore } from "../store/use-editor-store";
import { BackgroundImageField } from "./background-image-field";
import { GlobalStatePanel } from "./global-state-panel";
import { TagRegistryPanel } from "./tag-registry-panel";

export const PageSettingsDrawer = defineComponent({
  name: "PageSettingsDrawer",
  props: {
    open: { type: Boolean, default: false },
    onClose: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props) {
    const store = useEditorStore();
    const draftPageName = ref(store.pageName);

    const commitPageName = () => {
      store.pageName = draftPageName.value ?? "";
    };

    watch(
      () => props.open,
      (open) => {
        if (open) {
          draftPageName.value = store.pageName ?? "";
        }
      },
    );

    return () => (
      <Drawer title="页面设置" open={props.open} onClose={() => props.onClose?.()} width={360}>
        <Form layout="vertical" size="small">
          <Divider orientation="left">基本信息</Divider>

          <FormItem label="页面名称">
            <Input
              value={draftPageName.value}
              placeholder="未命名画面"
              onUpdate:value={(value: string) => {
                draftPageName.value = value ?? "";
              }}
              onPressEnter={() => {
                commitPageName();
              }}
              onBlur={() => {
                commitPageName();
              }}
            />
          </FormItem>

          <FormItem label="组态形态">
            <Tag color={store.pageSceneScope === "multiDevice" ? "blue" : "green"}>{SCENE_SCOPE_KIND_LABELS[store.pageSceneScope]}</Tag>
            <div style={{ color: "#666", fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
              根据画布中需要绑定设备的图元数量自动判断：0–1 个为单设备，2 个及以上为多设备。
            </div>
          </FormItem>

          <Divider orientation="left">画面尺寸</Divider>

          <FormItem label="宽度 (px)">
            <InputNumber
              value={store.pageWidth}
              min={100}
              max={9999}
              style="width: 100%"
              onChange={(v: any) => {
                if (v != null) store.pageWidth = Number(v);
              }}
            />
          </FormItem>

          <FormItem label="高度 (px)">
            <InputNumber
              value={store.pageHeight}
              min={100}
              max={9999}
              style="width: 100%"
              onChange={(v: any) => {
                if (v != null) store.pageHeight = Number(v);
              }}
            />
          </FormItem>

          <Divider orientation="left">画面背景</Divider>

          <FormItem label="背景色">
            <Input
              type="color"
              value={store.pageBackground}
              style="width: 60px; padding: 2px"
              onChange={(e: any) => (store.pageBackground = e.target?.value ?? e)}
            />
          </FormItem>

          <FormItem label="背景图">
            <BackgroundImageField
              modelValue={store.pageBackgroundImage}
              onUpdate:modelValue={(value) => {
                store.pageBackgroundImage = value;
              }}
            />
          </FormItem>

          <Divider orientation="left">页面变量</Divider>
          <p style="color: #666; font-size: 12px; margin-bottom: 8px">
            可在点位名或表达式中通过 <code>{"${global.xxx}"}</code> 引用
          </p>
        </Form>

        <GlobalStatePanel />

        <Divider orientation="left">数据点位</Divider>
        <TagRegistryPanel />
      </Drawer>
    );
  },
});
