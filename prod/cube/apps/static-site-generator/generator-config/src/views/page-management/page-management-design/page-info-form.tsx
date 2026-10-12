import { defineComponent, type PropType } from "vue";

import { Card, Form, FormItem, Input, Select, SelectOption, Switch, Textarea } from "@ghcloud/cube-ui";

import type { PageFormData, LayoutOption } from "./mock";

export const PageInfoForm = defineComponent({
  props: {
    data: {
      type: Object as PropType<PageFormData>,
      required: true,
    },
    layoutOptions: {
      type: Array as PropType<LayoutOption[]>,
      default: () => [],
    },
    isBuiltin: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return (): JSX.Element => {
      const { data, layoutOptions } = props;

      return (
        <div style={{ padding: "20px" }}>
          <Form model={data} labelCol={{ span: 3 }} wrapperCol={{ span: 14 }}>
            <Card title="页面基本信息" bordered={false} style={{ marginBottom: "16px" }}>
              <FormItem label="页面名称" required>
                <Input v-model:value={data.pageName} placeholder="请输入页面名称" maxlength={100} />
              </FormItem>
              <FormItem label="页面路由" required>
                <Input v-model:value={data.pageRoute} placeholder="例如：/about" disabled={props.isBuiltin} maxlength={200} />
                {props.isBuiltin && <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>内置路由，不可编辑</div>}
              </FormItem>
              <FormItem label="绑定布局" required>
                <Select v-model:value={data.layout} placeholder="请选择布局" style={{ width: "200px" }}>
                  {layoutOptions.map((opt) => (
                    <SelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectOption>
                  ))}
                </Select>
              </FormItem>
              <FormItem label="导航样式">
                <Select v-model:value={data.meta.navStyle} placeholder="请选择导航样式" style={{ width: "200px" }}>
                  <SelectOption value="light">浅色</SelectOption>
                  <SelectOption value="dark">深色</SelectOption>
                </Select>
              </FormItem>
              <FormItem label="启用状态">
                <Switch
                  checked={data.status === 1}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                  disabled={props.isBuiltin}
                  onChange={(checked: boolean): void => {
                    data.status = checked ? 1 : 0;
                  }}
                />
                {props.isBuiltin && <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>内置路由，不可禁用</div>}
              </FormItem>
            </Card>

            <Card title="SEO Meta 配置" bordered={false}>
              <FormItem label="SEO 标题">
                <Input v-model:value={data.meta.title} placeholder="请输入 SEO 标题" maxlength={100} />
              </FormItem>
              <FormItem label="SEO 描述">
                <Textarea v-model:value={data.meta.description} rows={3} placeholder="请输入 SEO 描述" />
              </FormItem>
              <FormItem label="SEO 关键词">
                <Textarea v-model:value={data.meta.keywords} rows={2} placeholder="请输入 SEO 关键词，用逗号分隔" />
              </FormItem>
            </Card>
          </Form>
        </div>
      );
    };
  },
});
