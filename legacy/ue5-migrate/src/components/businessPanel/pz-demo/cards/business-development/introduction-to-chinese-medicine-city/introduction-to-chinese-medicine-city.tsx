import { defineComponent, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import styles from './introduction-to-chinese-medicine-city.module.less'
import { getAssetsImage } from '@/utils/getImage';
import { BaseModal } from '@/pages/widget/modal/base-modal/base-modal'

export const IntroductionToChineseMedicineCity = defineComponent({
  name: 'IntroductionToChineseMedicineCity',
  setup () {
    const showMore = ref(false)

    return (): JSX.Element => (
      <SubPanelTemplate title="天府中药城介绍">
        <div class={styles['hospitalInfo']}>
          <img src={getAssetsImage('overViewPZ.png')} alt="" />
          <div class={styles['hospitalInfo-text']}>
            <div class={styles['hospitalInfo-title']}>
              <span>天府中药城</span>
              <a-button type="link" size="small" onClick={()=>{
                showMore.value = true
              }}>更多</a-button>
            </div>
            <div class={styles['scroll_box']}>
              <div class={styles['scroll-text']}>
                四川彭州经开区天府中药城面积15.25平方公里，是四川省起步最早、综合实力最强、三次产业链条最完整的中医药产业聚集地，聚焦现代中药创新，着力构建“种研制贸医养”的全产业链体系，努力打造全国一流的现代中医药研发制造基地和中医药传承创新发展示范区。已聚集四川新绿色药业等医药健康企业279家，拥有年销售过亿元中药单品10个，2023年医药制造业产值达100.05亿元，同比增长10.88%，中药制造规上产值稳居全省第一。全面建设“一带一路沿线国家医药贸易中心，已入驻商贸流通企业40余家，贵细中药材贸易商家380余家，2023年实现医药贸易流通额近48亿元。园区以创新驱动引领高质量发展，专注于中医药创新和大健康应用领域，引入成都中医药大学天府中医药创新港、四川中医药职业学院等科研创新及人才培养平台，努力打造成为中医药创新极核。目前，园区共有工业企业923家，其中规上企业122家。2023年全年累计实现规上企业产值188.07亿元，同比增长1.2%，税收13.41亿，同比增长26.4%；规上工业增加值增速5.6%。2024年 1-11月实现规上产值162.55亿元。
              </div>
            </div>
          </div>
        </div>
        <BaseModal title="天府中药城介绍" size={'small'} v-model:visible={showMore.value}>
          <img src={getAssetsImage('overViewPZ.png')} style={{ float: 'left', width: '20%', marginRight: '10px' }} />
          四川彭州经开区天府中药城面积15.25平方公里，是四川省起步最早、综合实力最强、三次产业链条最完整的中医药产业聚集地，聚焦现代中药创新，着力构建“种研制贸医养”的全产业链体系，努力打造全国一流的现代中医药研发制造基地和中医药传承创新发展示范区。已聚集四川新绿色药业等医药健康企业279家，拥有年销售过亿元中药单品10个，2023年医药制造业产值达100.05亿元，同比增长10.88%，中药制造规上产值稳居全省第一。全面建设“一带一路沿线国家医药贸易中心，已入驻商贸流通企业40余家，贵细中药材贸易商家380余家，2023年实现医药贸易流通额近48亿元。园区以创新驱动引领高质量发展，专注于中医药创新和大健康应用领域，引入成都中医药大学天府中医药创新港、四川中医药职业学院等科研创新及人才培养平台，努力打造成为中医药创新极核。目前，园区共有工业企业923家，其中规上企业122家。2023年全年累计实现规上企业产值188.07亿元，同比增长1.2%，税收13.41亿，同比增长26.4%；规上工业增加值增速5.6%。2024年 1-11月实现规上产值162.55亿元。
        </BaseModal>
      </SubPanelTemplate>
    )
  }
})