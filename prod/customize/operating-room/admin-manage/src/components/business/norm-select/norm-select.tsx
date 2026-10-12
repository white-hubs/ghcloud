import { OperateRoomDictionaryKey } from '@/api/dictionary-key'
import { cubeDeviceCenterService, cubeDictionaryService } from '@/api/service'
import type { PropNorm, SpecialNorm } from '@/types/special-norm-type'
import { Select, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
interface Props {
  value: string | string[];
  prodId: string;
  width: string;
  filterSpecial: {
    tenant: string | undefined;
    productId: string | undefined;
  };
  mode: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
  maxTagCount: number;
  hideAirconditioner: boolean;
}
/** 产品指标 */
export const NormSelect = defineComponent({
  props: ['value', 'prodId', 'width', 'filterSpecial', 'mode', 'maxTagCount', 'hideAirconditioner'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit }) => {
    const options = ref<PropNorm[]>([])

    // TODO 三期需求： 修正指标不包含特殊指标，需要过滤调对应租户下的特殊指标
    const filterSpecialOptions = ref<SpecialNorm[]>([])
    const getSpecialNorm = async (): Promise<SpecialNorm[]> => {
      return new Promise((resolve, reject) => {
        try {
          if (!props?.filterSpecial?.tenant) return
          cubeDictionaryService.getDictionaryByItem({ itemCode: OperateRoomDictionaryKey.OPERATING_ROOM_ADMIN_SPECIAL_NORM_SET, tenant: props.filterSpecial.tenant }).then(res => {
            if (res) {
              filterSpecialOptions.value = res.map(item => {
                return item.variable ? JSON.parse(item.variable) as SpecialNorm : {}
              })
              resolve(filterSpecialOptions.value)
            }
          })
        } catch (error) {
          resolve([])
          reject(error)
        }
      })
    }
    const getNormData = async (): Promise<void> => {
      const prodIds = Array.isArray(props.prodId) ? props.prodId : [props.prodId ?? '']
      cubeDeviceCenterService.getProdListDetail({ prodIds }).then(async result => {
        if (result[0].productPropVoList) {
          let specialNorms: (string | undefined)[] = []
          if (props?.filterSpecial?.tenant) {
            const special = await getSpecialNorm()
            specialNorms = special.map(e => e.normCode) ?? []
          }
          const data = specialNorms ? result[0]?.productPropVoList.filter(r => !specialNorms.includes(r.propCode)) : result[0]?.productPropVoList
          options.value = data.map(e => {
            return {
              name: `${e.propName ?? ''}`,
              code: e.propCode ?? '',
              unit: e.unitName ?? ''
            }
          })
          if (props.hideAirconditioner) {
            options.value = [...options.value].filter(e => e.code !== 'airconditioner')
          }
        }
      })
    }
    watch(() => props.prodId, (newValue) => {
      if (newValue) {
        getNormData()
      } else {
        options.value = []
      }
    }, { immediate: true })
    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择指标'
          field-names={{ value: 'code', label: 'name' }}
          show-search
          optionFilterProp='prodName'
          onChange={(e: string | string[]) => {
            emit('update:value', e)
            if (props.mode === 'multiple') {
              const selectValue = options.value.filter(ele => e.includes(ele.code))
              emit('change', selectValue)
            } else {
              const selectValue = options.value.find(ele => e === ele.code)
              emit('change', selectValue)
            }
          }}
          allowClear
          style={{ width: props.width || '180px' }}
          {...props}
        />
      </>
  }
})
