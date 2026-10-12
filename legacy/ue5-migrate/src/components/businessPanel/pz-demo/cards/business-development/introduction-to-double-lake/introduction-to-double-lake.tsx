import { defineComponent, reactive } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import { CountTo } from 'vue3-count-to'
import styles from './introduction-to-double-lake.module.less'

export const IntroductionToDoubleLake = defineComponent({
  name: 'IntroductionToDoubleLake',
  setup () {
    const callStatisticsData = reactive({
      totalNum: 34563,
      list: [
        { name: "入驻企业", value: 120, unit: '个' },
        { name: "招商项目", value: 76, unit: '个' },
        { name: "发展案例", value: 4, unit: '个' },
        { name: "周边配套", value: 12, unit: '个' },
      ]
    })


    return (): JSX.Element => (
      <SubPanelTemplate title="双湖片区介绍">
        <div class={styles['total-num']}>
          <img src={getAssetsImage('circel-halo4.png')} class={styles['bg-img']} />
          <img src={getAssetsImage('circel-halo3.png')} class={`${styles['img2']} ${styles['rotate']} ${styles['reverse']}`} />
          <img src={getAssetsImage('overView46.png')} class={`${styles['img3']} ${styles['rotate']} ${styles['reverse']}`} />
          {/* <a-progress stroke-color={{ '0%': '#2C8BFF', '100%': '#B2D4FF' }} percent={30} type="circle" strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" /> */}
          <img src={getAssetsImage('bubble.png')} class={`${styles['img3']} ${styles['rotate']}`} />
          <div class={styles['value']}>
            <img src={getAssetsImage('overView44.png')} class={styles['img3']} />
          </div>
          <div class={styles['list']}>
            {
              callStatisticsData.list.map((item, index) => {
                return (
                  <div class={`${styles['item']} ${styles['item' + index]}`} key={item.name}>
                    <div>
                      <CountTo startVal={0} endVal={item.value} duration={2000} separator="" />
                      <span class={styles['fs12']}>{ item.unit }</span>
                    </div>
                    <div class={styles['fs12']}>{ item.name }</div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <p class={styles['intro']}>
          双湖片区位于彭州市南部，紧邻彭州城区和成都市区，是彭州“南连北接”战略的重要节点。交通便利，可通过成彭高速、第二绕城高速、S1成德大道等快速路网连接成都主城区，地理优势明显。

          规划定位

          该片区以“双湖”命名，可能因规划中的湖泊或水系资源而突出生态特色，目标是打造宜居、宜业的现代化新城。主要方向包括：

          生态居住区：围绕水域和绿化空间，发展高品质住宅，营造滨水生活氛围。
          产城融合：结合相邻的天府中药城（国家级产业园区），完善商业、教育、医疗等配套，吸引产业人口落户。
          城市扩容：承接彭州城区向南扩展需求，分担主城功能，成为新兴城市副中心。
          配套设施

          交通：成彭快铁、公交线路覆盖，未来可能规划轨道交通（如S11线延伸段）。

          教育：规划或建设中优质学校（如彭州中学分校）及幼儿园，解决教育资源需求。

          医疗：临近彭州市人民医院、妇幼保健院等机构，片区内部可能新增社区卫生设施。

          商业：社区商业、餐饮服务逐步完善，未来或引入大型商超和综合体。

          发展优势

          产业支撑：天府中药城提供就业机会，带动人口聚集和经济活力。

          政策支持：纳入成都“北改”及彭州向南发展战略，享受政策和基建投入倾斜。

          环境资源：靠近龙门山旅游带，内部规划绿道、公园等生态空间，宜居性高。
        </p>
      </SubPanelTemplate>
    )
  }
})