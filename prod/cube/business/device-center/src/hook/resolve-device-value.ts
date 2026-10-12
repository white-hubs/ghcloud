interface DataSourceType {
  propCode: string;
  name: string;
  dataTypeName: string;
  newValue: string;
  newValueText?: string;
  dataConfig: string;
  updateTimeFormat: number | undefined;
}
interface PropValueType {
  key: string;
  value: string;
  ts?: number;
}
/**
 * 解析属性值
 * @param dataSource
 * @param newValList
 */
export const resolvePropValue = async (dataSource: DataSourceType[], newValList: PropValueType[]): Promise<void> => {
  if (newValList) {
    dataSource.map((item: DataSourceType) => {
      const current = newValList.filter((p) => {
        return p.key === item.propCode
      })[0]
      if (current) {
        item.newValue = current.value
        item.updateTimeFormat = current.ts
      }
      return item
    })
  }
  if (dataSource.length > 0) {
    dataSource.map((item: DataSourceType) => {
      const dataConfig = JSON.parse(item.dataConfig)
      if (dataConfig && item.newValue !== undefined) {
        if (Array.isArray(dataConfig)) {
          const config = dataConfig.filter((c) => {
            return c.value + '' === item.newValue + ''
          })[0]
          item.newValueText = config?.label ?? config
        } else {
          item.newValueText = dataConfig[item.newValue]
        }
      }
      return item
    })
  }
}
