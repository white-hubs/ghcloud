import { Button } from '@ghcloud/cube-ui'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import '@/styles/error.less'

export const NotFound = defineComponent({
  setup: () => {
    const errorImg = '/resource/v1/iot-configure/images/404.png'
    const router = useRouter()
    const goHome = (): void => {
      router.push('/access')
    }
    return (): JSX.Element =>
      <>
        <div class='wscn-http404-container'>
          <div class='wscn-http404'>
            <img src={errorImg} />
            <div class='msg'>
              <p>对不起，您访问的页面不存在</p>
              <Button type='primary' onClick={() => {
                goHome()
              }}>返回首页</Button>
            </div>
          </div>
        </div>
      </>
  }
})
