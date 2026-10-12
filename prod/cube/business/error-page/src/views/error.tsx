import { defineComponent } from 'vue'
import '@/styles/error.less'

export const Error = defineComponent({
  setup: () => {
    const errorImg = '/resource/v1/error-page/images/error.png'
    return () =>
      <>
        <div class='wscn-http404-container'>
          <div class='wscn-http404'>
            <img src={errorImg} />
            <div class='msg'>
              <p>对不起，没有访问权限</p>
              {/* <Button type='primary' onClick={() => { goHome() }}>返回首页</Button> */}
            </div>
          </div>
        </div>
      </>
  }
})
