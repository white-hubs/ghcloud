import { defineComponent } from 'vue'
import '@/styles/error.less'

export const Building = defineComponent({
  setup: () => {
    const errorImg = '/resource/v1/error-page/images/icon.png'
    return () =>
      <>
        <div class='wscn-http404-container'>
          <div class='wscn-http404'>
            <img src={errorImg} />
            <div class='msg'>
              <p>页面建设中...</p>
              {/* <Button type='primary' onClick={() => { goHome() }}>返回首页</Button> */}
            </div>
          </div>
        </div>
      </>
  }
})
