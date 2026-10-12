import { createApp, h, ref, watch, type App } from 'vue'
import { MapComponent } from './map-component'
type DataList = {
  lng: number;
  lat: number;
  address: string;
}[]
type MapInstance = {
  open: (list: DataList) => Promise<DataList>;
}
let mapApp: App | null = null
let mapInstance: MapInstance | undefined;

export const createMapModal = async (list?: DataList): Promise<DataList>=>{
  if (mapInstance){
    return mapInstance.open(list ?? [])
  }
  return new Promise((resolve)=>{
    const root = document.createElement('div')
    document.body.append(root)
    mapApp = createApp({
      setup (){
        const mapRef = ref<MapInstance>()
        watch(()=>mapRef.value, ()=>{
          mapInstance = mapRef.value
          mapRef.value?.open(list ?? []).then(res=>{
            resolve(res)
          })
        })

        return (): JSX.Element => h(MapComponent, {
          ref: mapRef
        })
      }
    })
    mapApp.mount(root)
  })

}