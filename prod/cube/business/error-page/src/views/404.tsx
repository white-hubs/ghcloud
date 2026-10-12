import { defineComponent } from 'vue'
import '@/styles/error.less'

export const NotFound = defineComponent({
  setup: () => {
    const errorImg = '/resource/v1/error-page/images/404.png'
    return () =>
      <>
        <div class='wscn-http404-container'>
          <div class='wscn-http404'>
            <img src={errorImg} />
            <div class='msg'>
              <p>对不起，您访问的页面不存在</p>
              {/* <Button type='primary' onClick={() => { goHome() }}>返回首页</Button> */}
            </div>
          </div>
        </div>
      </>
  }
})
