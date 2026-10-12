import { createStyles } from 'antd-style'
import React from 'react'
import { AgentProvider, getAgentTool } from './api/runtime' // 确保导入正确
import { ChatList } from './components/chat-list/chat-list'
import { AgentsList } from './components/agents-list/agents-list'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: rgba(250,252,255,0.80);
      width: 240px;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    `,
    chat: css`
      height: 100%;
      width: calc(100% - 240px);
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: rgba(21,120,255,0.06);
    `,
  }
})

const App: React.FC = () => {
  const { styles } = useStyle()
  const { mode } = getAgentTool()
  return (
    <div className={styles.layout}>
      <div className={styles.menu} style={{ display: mode === 'CHAT' ? 'block' : 'none' }}>
        <AgentsList />
      </div>
      <div className={styles.chat} style={{ width: mode === 'CHAT' ? 'calc(100% - 240px)' : '100%' }}>
        {/* 🌟 消息列表 */}
        <ChatList />
      </div>
    </div>
  )
}

export default (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AgentProvider>
          <App />
        </AgentProvider>
      </PersistGate>
    </Provider>
  )
}
