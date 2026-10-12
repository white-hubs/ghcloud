import { defineComponent } from 'vue'
import { FormItem, PlusOutlined, Button } from '@ghcloud/cube-ui'
import { NotifySelectItem } from './components/notify-select-item'
export const AlarmNotifyConfig = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <>
        <FormItem label='报警通知'>
          <Button type='primary'>
            添加
            <PlusOutlined />
          </Button>
          <NotifySelectItem />
        </FormItem>
      </>
    )
  }
})
