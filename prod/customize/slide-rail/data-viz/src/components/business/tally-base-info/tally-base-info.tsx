import { defineComponent } from 'vue'
import styles from './tally-base-info.module.less'
import type { SupplierInfo } from '@ghcloud/cube-slide-rail-service'

function encryptPhoneNumber (phoneNumber: string | number, start = 3, end = 4): string {
  if (typeof phoneNumber !== 'string' || !/^\d{11}$/.test(phoneNumber)) {
    return `${phoneNumber}`;
  }

  const encryptedNumber = phoneNumber.slice(0, start) + '*'.repeat(phoneNumber.length - start - end) + phoneNumber.slice(-end)
  return encryptedNumber
}

function desensitizeChinese (str: string): string {
  // 提取中文字符
  const chineseChars = str.match(/[\u4e00-\u9fa5]+/g)

  if (!chineseChars || chineseChars.length === 0) {
    return str // 如果没有中文字符，返回原字符串
  }

  // 对每个中文字符进行脱敏
  const desensitized = chineseChars.map((word) => {
    const firstChar = word.charAt(0) // 获取第一个字符
    const stars = '*'.repeat(word.length - 1) // 剩余字符替换为 *
    return firstChar + stars
  })

  // 替换原字符串中的中文字符为脱敏后的字符
  let result = str
  chineseChars.forEach((word, index) => {
    result = result.replace(word, desensitized[index])
  })

  return result
}

interface Props {
  info?: SupplierInfo;
}
/** 理货基本信息 */
export const TallyBaseInfo = defineComponent({
  props: ['info'],
  setup: (props: Props) => {
    return (): JSX.Element => (
      <div class={styles.tallyBaseInfo}>
        <div class={styles.infoContent}>
          <div class={styles.infoItem}>
            <span class={styles.label}>商铺名称:</span>
            <span class={[styles.value, 'row-2']}>{props?.info?.name || '--'}</span>
          </div>

          <div class={styles.infoItem}>
            <span class={styles.label}>商户姓名:</span>
            <span class={[styles.value, 'row-2']}>{props?.info?.liaison ? desensitizeChinese(props.info.liaison) : '--'}</span>
          </div>

          <div class={[styles.infoItem, styles.phone]}>
            <span class={styles.label}>联系电话:</span>
            <span class={[styles.value, 'row-2']}>{props?.info?.phone ? encryptPhoneNumber(props?.info?.phone, 3, 4) : '--'}</span>
          </div>

          {/* <div class={styles.infoItem}>
            <span class={styles.label}>所在区域:</span>
            <span class={[styles.value, 'row-2']} style='white-space:normal'>{props?.info?.address || '--'}</span>
          </div> */}
        </div>
      </div>
    )
  }
})
