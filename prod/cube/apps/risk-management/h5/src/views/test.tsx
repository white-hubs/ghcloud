import { defineComponent, onMounted } from 'vue'
import { cubeMdataService, serviceIntercept } from '@/api/server'
export const test = defineComponent({
  setup () {
    onMounted(async () => {
      try {
        await serviceIntercept.service(cubeMdataService.getAreaTreeByTenant(1))
      } catch (err) {
      }
      const cc = await serviceIntercept.service(cubeMdataService.getAreaTree())
    })
    return (): JSX.Element =>
      <>34</>
  }
})
