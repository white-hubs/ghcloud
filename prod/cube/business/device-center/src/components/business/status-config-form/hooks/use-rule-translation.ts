import type { CompareType, ProductProp } from '@ghcloud/cube-iot-center-service'
import type { Rule } from '../types'

export function useRuleTranslation (): {
  generateRuleTranslation: (rule: Rule, propertyOptions: ProductProp[], operatorOptions: CompareType[]) => string;
  updateRuleTranslation: (rule: Rule, propertyOptions: ProductProp[], operatorOptions: CompareType[]) => void;
} {
  const generateRuleTranslation = (rule: Rule, propertyOptions: ProductProp[], operatorOptions: CompareType[]): string => {
    if (!rule.property || !rule.operator || (rule.value === undefined && !Array.isArray(rule.value))) {
      return '';
    }

    // 获取属性名称
    const propertyOption = propertyOptions.find(prop => prop.propCode === rule.property);
    const propertyName = propertyOption?.name || rule.property;

    // 获取操作符文本
    const operatorOption = operatorOptions.find(op => op.itemValue === rule.operator);
    const operatorText = operatorOption?.itemLabel || rule.operator;

    // 处理值的显示
    let valueText = '';
    if (rule.dataType === 'enum' && Array.isArray(rule.value)) {
      // 处理多选枚举
      const options = propertyOption ? JSON.parse(propertyOption.dataConfig || '[]') : [];
      valueText = rule.value.map(v => {
        const option = options.find((opt: any) => opt.value === v);
        return option ? option.label : v;
      }).join('、');
    } else if (rule.dataType === 'boolean' && !Array.isArray(rule.value)) {
      // 处理布尔值
      const options = propertyOption ? JSON.parse(propertyOption.dataConfig || '[]') : [];
      const option = options.find((opt: any) => opt.value === rule.value);
      valueText = option ? option.label : String(rule.value);
    } else {
      // 处理其他类型
      valueText = String(rule.value);
    }

    // 添加单位
    const unit = propertyOption?.unitName ? propertyOption.unitName.replace('-', '') : '';

    // 生成完整翻译
    return `${propertyName} ${operatorText} ${valueText}${unit}`;
  };

  const updateRuleTranslation = (rule: Rule, propertyOptions: ProductProp[], operatorOptions: CompareType[]): void=> {
    rule.translation = generateRuleTranslation(rule, propertyOptions, operatorOptions);
  };

  return {
    generateRuleTranslation,
    updateRuleTranslation
  };
}