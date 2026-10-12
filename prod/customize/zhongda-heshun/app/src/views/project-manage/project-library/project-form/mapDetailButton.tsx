import { Button } from 'ant-design-vue'
import { defineComponent, ref, watch } from 'vue';
import { createDetailMapModal } from '@/components/map/map-detail'
type DataList = {
  lng: number;
  lat: number;
  address: string;
}[]
export default defineComponent({
  name: 'MapDetailButton',
  props: {
    value: {
      type: String,
      required: true
    },
  },

  setup (props) {
    const aMapData = ref<DataList>()
    watch(()=> props.value, (newValue) => {
      if (newValue)
        aMapData.value = newValue?.split(';').map(item=>{
          const [lng, lat, address] = item.split(',')
          return {
            lng: Number(lng),
            lat: Number(lat),
            address: address
          }
        })
    })
    const AMapClick = (): void => {
      createDetailMapModal({ list: aMapData.value }).then(res=>{
        aMapData.value = res
      })
    }
    return (): JSX.Element => (
      <div>
        {(aMapData.value && aMapData.value.length) ? <Button type='link' onClick={AMapClick}>点击查看</Button> : '--'}
      </div>
    );
  },
});