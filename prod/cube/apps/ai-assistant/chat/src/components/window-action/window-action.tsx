import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons'
import { createStyles } from 'antd-style'
import { useState } from 'react'

const useStyle = createStyles(({ token, css }) => {
  return {
    actionLayout: css`
      height: ${token.paddingLG * 2}px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 ${token.paddingLG}px;
      box-sizing: border-box;
      box-shadow: 0px 1px 13px -12px #000;
    `,
    actionContainer: css`
      display: flex;
      justify-content: flex-end;
      align-items: center;
      &:hover{
        .anticon{
          opacity: 1;
        }
      }
    `,
    actionItem: css`
      border-radius: 50px;
      width: 0.8vw;
      height: 0.8vw;
      background-color: red;  
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 15px;
      cursor: pointer;
      min-width: 15px;
      min-height: 15px;
      .anticon{
        transition: all 0.3s ease;
        opacity: 0;
      }
    `,
  }
})
export const WindowAction = (): React.JSX.Element => {
  const { styles } = useStyle()
  const [fullScreen, setFullScreen] = useState(false)
  const handelClick = (action: 'close' | 'maximize' | 'minimize'): void => {
    setFullScreen(action === 'maximize')
    window.parent.postMessage({ type: `cube-ai-assistant-${action}` }, '*')
  }
  return (
    <div className={styles.actionLayout}>
      <div className={styles.actionContainer}>
        <div className={styles.actionItem} style={{ background: '#52C41A' }} onClick={() => {
          handelClick(fullScreen ? 'minimize' : 'maximize')
        }}>
          {
            fullScreen ? <ShrinkOutlined style={{ fontSize: '10px', fontWeight: 600 }} /> : <ArrowsAltOutlined style={{ fontSize: '10px', fontWeight: 600 }} />
          }

        </div>
        {/* <div className={styles.actionItem} style={{ background: '#FADB14' }} onClick={() => {
          handelClick('minimize')
        }}><MinusOutlined style={{ fontSize: '10px', fontWeight: 600 }} /></div> */}
        <div className={styles.actionItem} style={{ background: '#F5222D' }} onClick={() => {
          handelClick('close')
        }}><CloseOutlined style={{ fontSize: '10px', fontWeight: 600 }} /></div>
      </div>
    </div>
  )
}
