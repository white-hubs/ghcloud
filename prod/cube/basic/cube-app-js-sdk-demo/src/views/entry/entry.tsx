import { defineComponent } from 'vue'
import styles from './entry.module.less'
import { Button, Cell, CellGroup, showDialog, Space } from 'vant'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { bridgeList } from './bridge-test'

/** 入口页面 */
export const Entry = defineComponent({
  setup: () => {
    const buttonClick = (e: any): void => {
      if (e.params) {
        e.action(e.params)
      } else {
        e.action()
      }
    }

    return () =>
      <div class={styles.container}>
        <CellGroup inset>
          <Cell
            title='环境判断' value={getEnvironment()} v-slots={{
              label: () => {
                return (
                  <>
                    <p>cubeApp ==== 开河协议webview</p>
                    <p>browser ==== 普通浏览器</p>
                    <p>iframe==== 嵌套网页</p>
                    <p>wxMini  ==== 微信小程序webview</p>
                  </>
                )
              }
            }}
          />

          <Cell title='浏览器UA' value='' label={navigator.userAgent} class={styles['block-cell']} />
        </CellGroup>
        <Space wrap>
          {
            bridgeList.map(e => {
              return <Button type='primary' size='small' key={e.desc} onClick={() => {
                buttonClick(e)
              }}>{e.desc}</Button>
            })
          }
        </Space>
        <Space wrap>
          <Button block type='warning' size='small' onClick={() => {
            showDialog({ title: '当前环境', message: getEnvironment() })
          }}>获取当前环境</Button>
          <Button block type='success' size='small' onClick={() => {
            location.reload()
          }}>刷新</Button>
        </Space>
      </div>
  }
})
