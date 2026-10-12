import { defineComponent, onMounted, ref, type VNode } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, showNotify, Skeleton } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
const icon = '/resource/v1/knowledge-document/images/icon-doc.png'
import { Pie } from '../../components/echart/pie'
import { routes } from '@/router'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { getTypeColor } from './type'
import { cubeKnowledgeDocumentService } from '@/api/server'
interface TypeData {
  name: string;
  value: number;
  itemStyle: { normal: { color: string; }; };
}
/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const loading = ref(false)
    const total = ref(0)
    const typeData = ref<TypeData[]>([])

    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const response = await cubeKnowledgeDocumentService.getKnowledgeDocumentStatistics()
        total.value = response.total
        typeData.value = response.statList.map((x, index: number) => {
          return { name: x.key ?? '', value: x.value, itemStyle: { normal: { color: getTypeColor[index] ?? '' } } }
        })
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      getData()
      useMetaTitle()
    })

    const echart = (): VNode =>
      <Cell>
        <div class={styles.echart}>
          <Pie
            legend={{
              show: false,
            }}
            tooltipFormatter='{b0}: {c0}'
            data={typeData.value}
          />
          <div class={styles['pie-legend']}>
            <ul>
              {
                typeData.value.map(item =>
                  <li key={item.name}>
                    <span class={styles.dot} style={{ background: item.itemStyle.normal.color ?? 'green' }} />
                    <span>{item.name}</span><span>{item.value}</span>
                  </li>)
              }
            </ul>
          </div>
        </div>
      </Cell>

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='知识库' />
        <div class={styles.container}>
          <EntryMenu applicationCode='KNOWLEDGE_DOCUMENT' routes={routes} title='业务操作' />
          <CellGroup inset class={styles.group}>
            <Cell title='文档汇总' />
            <Cell>
              <div class={styles['doc-statistics-box']} v-show={!loading.value}>
                <div class={styles['doc-num']}>
                  <div class={styles['doc-icon']}>
                    <img src={icon} />
                  </div>
                  <span>文档汇总</span>
                </div>
                <div class={styles['doc-value']}>
                  <div class={styles['total-value']}>{total.value}</div>
                  <div class={styles['total-unit']}>条</div>
                </div>
              </div>
              <Skeleton row={3} animated v-show={loading.value} />
            </Cell>
            {typeData.value && typeData.value.length > 0 ? echart() : null}
          </CellGroup>
        </div>
      </>
  }
})
