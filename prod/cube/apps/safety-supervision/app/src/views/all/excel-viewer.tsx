import { defineComponent, onMounted } from 'vue'
import ExcelMarket from './components/excel-market.vue'
import ExcelHead from './components/excel-head.vue'
import { useRoute } from 'vue-router'

interface Props {
  type: 'market' | 'head';
}

export const ExcelViewer = defineComponent({
  props: ['type'],
  setup (props: Props) {
    const route = useRoute()
    const { type, title, readonly, id, download, from, monthDate } = route.query

    onMounted(() => {
    })

    return (): JSX.Element=> (
      <>
        {type === 'market' && <ExcelMarket title={title as string} showBtn={!readonly} id={id as string} download={!!download} from={from as string} />}
        {type === 'head' && <ExcelHead id={id as string} title={title as string} monthDate={monthDate as string} download={!!download} />}
      </>
    )
  },
})
