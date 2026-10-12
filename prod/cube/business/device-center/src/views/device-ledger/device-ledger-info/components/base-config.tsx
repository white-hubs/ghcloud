import type { BaseArchivesInfo, ExpandInfoType } from '@/types/device-type'
import { getDefaultImg } from '@/utils/tool'
import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'
import { Image, Tag } from '@ghcloud/cube-ui'
import dayjs from 'dayjs'
export const baseInfoState = [
  {
    label: '所属区域',
    name: 'baseArchivesInfo',
    render: (val: BaseArchivesInfo): string => {
      return val?.area?.name || '--'
    }
  },
  {
    label: '维护部门',
    name: 'baseArchivesInfo',
    render: (val: BaseArchivesInfo): string => {
      return val?.department?.name || '--'
    }
  },
  {
    label: '维护人员',
    name: 'baseArchivesInfo',
    render: (val: BaseArchivesInfo): string => {
      const name = val?.manager.length > 0 ? val?.manager?.map((item) => item.name).join('、') : ''
      return name || '--'
    }
  },
  {
    label: '生产日期',
    name: 'expandInfo',
    render: (val: ExpandInfoType): string => {
      const time = val?.factoryInfo?.productionDate ? dayjs(val?.factoryInfo?.productionDate).format('YYYY-MM-DD') : ''
      return time || '--'
    }
  },
  {
    label: '采购日期',
    name: 'expandInfo',
    render: (val: ExpandInfoType): string => {
      const time = val?.purchaseInfo?.purchaseDate ? dayjs(val?.purchaseInfo?.purchaseDate).format('YYYY-MM-DD') : ''
      return time || '--'
    }
  },
  {
    label: '采购单价（元）',
    name: 'expandInfo',
    render: (val: ExpandInfoType): string | number=> {
      return val?.purchaseInfo?.unitPrice || '--'
    }
  },
  {
    label: '使用寿命（月）',
    name: 'expandInfo',
    render: (val: ExpandInfoType): string | number => {
      return val?.factoryInfo?.usefulLife || '--'
    }
  },
  {
    label: '安装图片',
    name: 'baseArchivesInfo',
    render: (val: BaseArchivesInfo): JSX.Element=> {
      if (!val?.picturePath) return <span>暂无图片</span>
      return (
        <>
          <Image src={val?.picturePath || getDefaultImg()} width={100} height={100} key={val?.picturePath} fallback={getDefaultImg()} />
        </>
      )
    }
  },
  {
    label: '设备标签',
    name: 'deviceTagList',
    render: (val: DeviceTagDetail[]): JSX.Element => {
      if (val === null || val === undefined || !val || val.length === 0) {
        return <span>暂无数据</span>
      }
      return (
        <>
          {
            val.map((item: DeviceTagDetail, index: number) => {
              return (
                <Tag key={index} color='blue' style={{ marginBottom: '10px', padding: '2px 5px' }}>
                  {item.tagName}
                </Tag>
              )
            })
          }
        </>
      )
    }
  },
]
