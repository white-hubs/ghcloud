/**
 * 转义设备属性属性名称、属性code、状态、值 、单位、精度、上下限
 */
export class UseProps {
  constructor (config) {
    this.config = config
  }

  /** 获取当前设备的规则 */
  getCurRule () {
    const ruleList = this.config.ruleAll.map(rule => {
      // 过滤掉特殊指标
      const curSpecialNormCodes = this.config.specialList.filter(s => s.productId === rule.productId).map(s => s.normCode)
      const curRules = rule.ruleNormList.filter(r => !curSpecialNormCodes.includes(r.normCode))
      return {
        ...rule,
        ruleNormList: curRules
      }
    })
    const rule = ruleList.find((rule) => rule.deviceIds.includes(this.config.deviceId)) ?? { ruleNormList: [] }
    return rule
  }

  /** 检查设备属性的状态 */
  checkPropsStatus (propVal, ruleNorm) {
    if (typeof propVal === 'undefined') return 'NORMAL'
    if (!ruleNorm) return 'NORMAL'
    if (ruleNorm.lowerLimit !== undefined && ruleNorm.lowerLimit !== null && ruleNorm.lowerLimit > propVal) {
      return 'LOWER_LIMIT'
    }
    if (ruleNorm.upperLimit !== undefined && ruleNorm.upperLimit !== null && ruleNorm.upperLimit < propVal) {
      return 'UPPER_LIMIT'
    }
    return 'NORMAL'
  }

  /** 空调状态 */
  airconditionerStatus (propVal) {
    return propVal === 1 ? '开机' : propVal === 0 ? '正常停机' : null
  }

  /** 转义 */
  getProps () {
    const rule = this.getCurRule()
    const data = this.config.propsData?.map(p => {
      const ruleNorm = rule?.ruleNormList.find(r => r.normCode === p.propCode)
      const propItem = {
        propVal: p.propVal,
        propName: ruleNorm?.normName ?? null,
        // propCode: p.propCode,
        // status: p.propCode === 'airconditioner' ? this.airconditionerStatus(p.propVal) : this.checkPropsStatus(p.propVal, ruleNorm),
        // unit: ruleNorm?.unit ?? null,
        // precision: ruleNorm?.precision ?? null,
        // upperLimit: ruleNorm?.upperLimit ?? null,
        // lowerLimit: ruleNorm?.lowerLimit ?? null,
      }
      return propItem
    })
    return data
  }
}
