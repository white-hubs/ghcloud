/**
 * 权限列表搜索表单组件
 */
import { defineComponent } from 'vue'
import { Button, Form, Input, Space } from 'ant-design-vue'

interface Props {
  keyword: string;
  onSearch: () => void;
  onReset: () => void;
  onUpdateKeyword: (value: string) => void;
}

export const PermissionSearchForm = defineComponent<Props>({
  name: 'PermissionSearchForm',
  props: {
    keyword: {
      type: String,
      required: true
    },
    onSearch: {
      type: Function,
      required: true
    },
    onReset: {
      type: Function,
      required: true
    },
    onUpdateKeyword: {
      type: Function,
      required: true
    }
  },
  setup (props) {
    return () => (
      <Form layout="inline">
        <Form.Item label="监控范围">
          <Input
            allowClear
            placeholder="请输入范围或权限归属关键字"
            value={props.keyword}
            onUpdate:value={(val: string) => {
              props.onUpdateKeyword(val)
            }}
            onPressEnter={props.onSearch}
            style="width: 260px"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" onClick={props.onSearch}>查询</Button>
            <Button onClick={props.onReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
    )
  }
})

