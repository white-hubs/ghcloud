import { defineComponent, type PropType } from "vue";
import { Card, Form, FormItem, Input } from "@ghcloud/cube-ui";
import type { LayoutFormData } from "./mock";

export const LayoutInfoForm = defineComponent({
  props: {
    data: {
      type: Object as PropType<LayoutFormData>,
      required: true,
    },
  },
  setup(props) {
    return (): JSX.Element => {
      const { data } = props;

      return (
        <div style={{ padding: "20px" }}>
          <Form
            model={data}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 14 }}
          >
            <Card title="布局基本信息" bordered={false}>
              <FormItem label="布局名称" required>
                <Input
                  v-model:value={data.layoutName}
                  placeholder="请输入布局名称"
                />
              </FormItem>

            </Card>
          </Form>
        </div>
      );
    };
  },
});
