import { computed, defineComponent } from 'vue'
import styles from './num-digital.module.less'
import { CountTo } from 'vue3-count-to'

export interface NumDigitalProps {
  value: string | number;
  title: string;
  digits: number; // 显示位数
  decimal: number; // 小数位数
  unit: string; // 后缀单位（如 片、kg）
  prefix: string; // 前缀（如 第）
  activeColor: string; // 激活数字颜色（黄色 #ffd700）
  inactiveColor: string; // 非激活颜色（蓝色 #0066cc）
}

/** 理货数量信息 */
export const NumDigitalDisplay = defineComponent({
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    digits: {
      type: Number,
      default: 4
    },
    decimal: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: ''
    },
    prefix: {
      type: String,
      default: ''
    },
    activeColor: {
      type: String,
      default: 'rgba(255,171,16,1)'
    },
    inactiveColor: {
      type: String,
      default: 'rgba(194,201,221,0.5)'
    }
  },
  setup (props: NumDigitalProps) {
    // 处理数字格式化和补零
    const formattedValue = computed(() => {
      if (typeof props.value === 'string') {
        // 字符串类型直接返回，不做补零处理
        return {
          digits: props.value.split(''),
          isNumber: false
        }
      }

      // 数字类型处理
      const numStr = props.value.toFixed(props.decimal)
      const [intPart, decimalPart = ''] = numStr.split('.')

      // 计算需要补零的位数（考虑小数部分）
      const totalDigits = props.decimal > 0
        ? props.digits - decimalPart.length
        : props.digits

      // 补零处理
      const paddedInt = intPart.padStart(totalDigits, '0')

      // 合并整数和小数部分
      const allDigits = props.decimal > 0
        ? [...paddedInt.split(''), '.', ...decimalPart.split('')]
        : paddedInt.split('')

      return {
        digits: allDigits,
        isNumber: true
      }
    })

    // 判断是否是前导零
    const isLeadingZero = (digit: string, index: number): boolean => {
      if (!formattedValue.value.isNumber) return false
      if (digit === '.' || digit === ',') return false
      return digit === '0' && index < formattedValue.value.digits.findIndex(d => d !== '0')
    }

    // 获取数字显示颜色
    const getDigitColor = (digit: string, index: number): string => {
      if (digit === '.') return props.activeColor
      if (!formattedValue.value.isNumber) return props.activeColor
      return isLeadingZero(digit, index) ? props.inactiveColor : props.activeColor
    }

    return () => (
      <div class={styles.digitalDisplay}>
        <div class={styles.title}>{props.title}</div>
        <div class={styles.content}>
          {props.prefix && <span class={styles.prefix}>{props.prefix}</span>}
          <div class={styles.numberContainer}>
            {formattedValue.value.digits.map((digit, index) => {
              if (digit === '.') {
                return (
                  <span
                    class={styles.decimal}
                    key={`dec-${index}`}
                    style={{ color: props.activeColor }}
                  >
                    .
                  </span>
                )
              }
              return (
                <div
                  class={styles.digit}
                  key={index}
                  style={{ color: getDigitColor(digit, index) }}
                >
                  <CountTo startVal={0} endVal={+digit} duration={2000} />
                </div>
              )
            })}
          </div>
          {props.unit && <span class={styles.unit}>{props.unit}</span>}
        </div>
      </div>
    )
  }
})
