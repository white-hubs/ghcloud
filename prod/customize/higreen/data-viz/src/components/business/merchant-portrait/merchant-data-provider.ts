import { cubeBiDataManagementService } from '@/api/service'
import type { AgeList, MerchantData } from '@ghcloud/cube-bi-data-management'
const initSexStat = {
  male: '0.00',
  female: '0.00'
}
export const initPieData = [
  {
    name: '0-3吨',
    value: 75
  }
]
export const initChartStat = {
  xData: ['广东', '宁夏', '湖北', '云南'],
  data: [80, 5, 5, 5]
}
class MerchantDataProvider {
  private static instance: MerchantDataProvider
  private static providerData: MerchantData
  public static getInstance (): MerchantDataProvider {
    if (!MerchantDataProvider.instance) {
      MerchantDataProvider.instance = new MerchantDataProvider()
    }
    return MerchantDataProvider.instance
  }

  //  获取数据
  public async getMerchantData (): Promise<void> {
    try {
      const data = await cubeBiDataManagementService.getMerchantStatistics()
      // 临时修改数据
      if (data){
        data.wholesaler.sexList = [
          { key: '男', value: '67.32' },
          { key: '女', value: '32.68' }
        ]
        data.wholesaler.ageList = [
          { key: '20-30岁', value: "7.19" },
          { key: '30-40岁', value: "43.14" },
          { key: '40-50岁', value: "38.56" },
          { key: '50岁以上', value: "11.11" },
        ]
        data.wholesaler.barChartOneList = [
          { key: '广东', value: '68.67' },
          { key: '广西', value: '10.67' },
          { key: '湖南', value: '8.67' },
          { key: '河南', value: '6' },
          { key: '四川', value: '4' },
          { key: '福建', value: '1.33' },
          { key: '贵州', value: '1.33' },
          { key: '江苏', value: '0.67' },
          { key: '江西', value: '0.67' },
          { key: '湖北', value: '0.67' },
        ]
        data.wholesaler.barChartTwoList = [
          { key: '广东', value: '73' },
          { key: '山东', value: '8' },
          { key: '云南', value: '7' },
          { key: '甘肃', value: '6' },
          { key: '湖北', value: '3' },
        ]
        data.wholesaler.pieChartList = [
          { key: '0-5吨', value: '46.15' },
          { key: '5-10吨', value: '29.67' },
          { key: '10-15吨', value: '10.99' },
          { key: '15吨以上', value: '13.19' },
        ]

        data.purchaser.sexList = [
          { key: '男', value: '88' },
          { key: '女', value: '12' }
        ]
        data.purchaser.ageList = [
          { key: '20-30岁', value: "42" },
          { key: '30-40岁', value: "35" },
          { key: '40-50岁', value: "13" },
          { key: '50岁以上', value: "10" },
        ]
        data.purchaser.barChartOneList = [
          { key: '光明', value: '33' },
          { key: '宝安', value: '30' },
          { key: '龙华', value: '19' },
          { key: '南山', value: '10' },
          { key: '其他', value: '8' },
        ]
        data.purchaser.barChartTwoList = [
          { key: '超市', value: '68' },
          { key: '集贸', value: '14' },
          { key: '配送', value: '10' },
          { key: '其他', value: '8' },
        ]
        data.purchaser.pieChartList = [
          { key: '4.2m', value: '53' },
          { key: '三轮车', value: '32' },
          { key: '面包车', value: '15' },
        ]
      }

      MerchantDataProvider.providerData = data
    } catch (error) {

    }
    new Promise<void>((resolve) => resolve())
  }

  /**
   * 获取头部统计卡片数据
   * @returns {
    *  wholesaler: number,批发商
    *  purchaser: number 采购商
   }
   */
  public getStatCardData (): {
    wholesalerTotal: number;
    purchaserTotal: number;
  } {
    if (MerchantDataProvider.providerData) {
      return {
        wholesalerTotal: MerchantDataProvider.providerData.wholesaler.total,
        purchaserTotal: MerchantDataProvider.providerData.purchaser.total
      }
    }
    return {
      wholesalerTotal: 0,
      purchaserTotal: 0
    }
  }

  /**
   * 获取批发商性别统计数据
   * @returns {
    *  male: string,
    *  female: string,
    * }
   */
  public geWholesalerGenderStat (): typeof initSexStat {
    if (MerchantDataProvider.providerData) {
      const sexStat = MerchantDataProvider.providerData.wholesaler.sexList.reduce((prev, cur) => {
        if (cur.key === '男') {
          prev.male = cur.value
        } else if (cur.key === '女') {
          prev.female = cur.value
        }
        return prev
      }, {
        male: '0.00',
        female: '0.00'
      })
      return sexStat
    }
    return initSexStat
  }

  /**
   * 获取批发商年龄统计数据
   */
  public geWholesalerAgeStat (): AgeList[] {
    if (MerchantDataProvider.providerData) {
      return MerchantDataProvider.providerData.wholesaler.ageList
    }
    return []
  }

  /**
   * 获取批发商籍贯统计
   */
  public geWholesalerNativePlaceStat (): typeof initChartStat {
    if (MerchantDataProvider.providerData) {
      return {
        xData: MerchantDataProvider.providerData.wholesaler.barChartOneList.map(item => item.key),
        data: MerchantDataProvider.providerData.wholesaler.barChartOneList.map(item => Number(item.value))
      }
    }
    return initChartStat
  }

  /**
   * 获取批发商上游来源统计
   */
  public getWholesalerSourceStat (): typeof initChartStat {
    if (MerchantDataProvider.providerData) {
      return {
        xData: MerchantDataProvider.providerData.wholesaler.barChartTwoList.map(item => item.key),
        data: MerchantDataProvider.providerData.wholesaler.barChartTwoList.map(item => Number(item.value))
      }
    }
    return initChartStat
  }

  /**
   * 获取批发商经营规模统计
   */
  public getWholesalerBusinessScaleStat (): typeof initPieData {
    if (MerchantDataProvider.providerData) {
      return MerchantDataProvider.providerData.wholesaler.pieChartList.map(item => {
        return {
          name: item.key,
          value: Number(item.value)
        }
      })
    }
    return initPieData
  }

  /**
   * 获取采购商性别统计数据
   * @returns {
 *  male: string,
 *  female: string,
 * }
*/
  public getPurchaserGenderState (): typeof initSexStat {
    if (MerchantDataProvider.providerData) {
      const sexStat = MerchantDataProvider.providerData.purchaser.sexList.reduce((prev, cur) => {
        if (cur.key === '男') {
          prev.male = cur.value
        } else if (cur.key === '女') {
          prev.female = cur.value
        }
        return prev
      }, {
        male: '0.00',
        female: '0.00'
      })
      return sexStat
    }
    return initSexStat
  }

  /**
   * 获取采购商年龄统计数据
   */
  public getPurchaserAgeStat (): AgeList[] {
    if (MerchantDataProvider.providerData) {
      return MerchantDataProvider.providerData.purchaser.ageList
    }
    return []
  }

  /**
   * 获取采购商区域统计
   */
  public getPurchaserRegionStat (): typeof initChartStat {
    if (MerchantDataProvider.providerData) {
      return {
        xData: MerchantDataProvider.providerData.purchaser.barChartOneList.map(item => item.key),
        data: MerchantDataProvider.providerData.purchaser.barChartOneList.map(item => Number(item.value))
      }
    }
    return initChartStat
  }

  /**
   * 获取采购商经营类型
   */
  public getPurchaserBusinessType (): typeof initChartStat {
    if (MerchantDataProvider.providerData) {
      return {
        xData: MerchantDataProvider.providerData.purchaser.barChartTwoList.map(item => item.key),
        data: MerchantDataProvider.providerData.purchaser.barChartTwoList.map(item => Number(item.value))
      }
    }
    return initChartStat
  }

  /**
   * 获取采购商采购车类型
   */
  public getPurchaserCarType (): typeof initPieData {
    if (MerchantDataProvider.providerData) {
      return MerchantDataProvider.providerData.purchaser.pieChartList.map(item => {
        return {
          name: item.key,
          value: Number(item.value)
        }
      })
    }
    return initPieData
  }
}
export const merchantDataProvider = MerchantDataProvider.getInstance()
