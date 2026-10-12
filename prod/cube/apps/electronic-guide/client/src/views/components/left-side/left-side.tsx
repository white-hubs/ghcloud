import { defineComponent } from 'vue'
import styles from './index.module.less'
import { SupremeList } from './components/supreme-list/supreme-list'
import { getAssetsFile } from '@/utils'
import { SecondaryList } from './components/secondary-list/secondary-list'
import { LeafList } from './components/leaf-list/leaf-list'
import { LeftFooter } from './components/left-footer'
export const LeftSide = defineComponent({
  setup: () => {
    const codeImg = getAssetsFile('qr-code.jpg')
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.oneLevel}>
          <SupremeList />
          <div class={styles.qrCode}>
            <img src={codeImg} alt='' srcset='' />
            <div>扫码移动端导航</div>
          </div>
        </div>
        <SecondaryList />
        <LeafList />
        <LeftFooter />
      </div>
    )
  }
})
