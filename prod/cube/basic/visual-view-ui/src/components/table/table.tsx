import { defineComponent } from 'vue'
import { NTable,NThead,NTbody  } from 'naive-ui'

export interface ColumnOption {
  title: string;
  width: string;
  align: '1' | '2';
  customRender: () => JSX.Element;
}

export default defineComponent({
  props: ['size','bordered'],
  setup (props,{slots}) {
    return () => {
      return (
        <NTable {...props}><NThead>{slots['thead']?.()}</NThead><NTbody>{slots['tbody']?.()}</NTbody></NTable>
      )
    }
  }
})
