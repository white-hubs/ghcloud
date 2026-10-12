import { RAG_FLOW_CONFIG } from '@/api/dictionary-config'
import { getAgentTool } from '@/api/runtime'
import { Input, message } from 'antd'
import { createStyles } from 'antd-style'
import React, { useEffect } from 'react'
const agentAvatar = '/resource/v1/ai-assistant/ai-avatar.png'
import { SearchOutlined, CloseOutlined, RightOutlined } from '@ant-design/icons'
import type { ConversationType } from '@/type'
import { useDispatch, useSelector } from 'react-redux'
import { store, type RootState } from '@/store'
import {
  updateConversation,
  setActiveConversation,
  setCurrentModelId,
  deleteConversation
} from '@/store/conversationSlice'
import './agemts-list.module.less'
// interface TimerWindow extends Window {
//   // 使用 Record 类型替代索引签名，更好地表达定时器 ID 到数值的映射关系
//   timers: Record<`timer_${string}`, number>;
//   [key: `timer_${string}`]: number;
// }

const useStyle = createStyles(({ css }) => {
  return {
    searchInput: css`
      padding-top:19px;
      padding-bottom: 13px;
      padding-left: 12px;
      padding-right: 12px;
      box-sizing: border-box;
      position: relative;
      margin-bottom: 18px;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 220px;
        height: 1px;
        background-color: #eaebef;
      }
      .ant-input-outlined {
        border: 0 !important;
        width: 216px !important;
        border-radius: 4px !important;
        background: #e6eef7 !important;
        box-shadow:none;
      }
    `,
    agentItem: css`
      width: 220px;
      height: 48px;
      border-radius: 4px;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-sizing: border-box;
      padding: 8px;
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      margin: 0 auto;
      margin-top: 6px;
      // &:hover {
      //   background-color:rgba(0,0,0,0.06);
      // }
      img {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 8px;
        object-fit: cover;
      }
    `,
    deleteBtn: css`
      fontsize:'8px';
      cursor: pointer;
      color: transparent;
    `,
    conversationItem: css`
      width: 220px;
      height: 30px;
      border-radius: 4px;
      background-color: transparent;
      display: flex;
      align-items: center;
      cursor: pointer;
      box-sizing: border-box;
      padding: 0 8px;
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: Medium;
      margin: 0 auto;
      margin-top: 6px;
      &:hover {
        background-color:#ECF3FD;
         .anticon {
          color: #979797;
        }
        }
      }
    `,
    "active": css`
      background-color: #ECF3FD;
      box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.02);
    `,
    "conversationTitle": css`
      width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,

  }
})
export const AgentsList = (): React.JSX.Element => {
  const { styles } = useStyle()
  const [searchValue, setSearchValue] = React.useState('')
  const { setMessages, agent, changeChatAgent, mode } = getAgentTool()

  // 使用Redux
  const dispatch = useDispatch();
  // 从Redux中获取会话数据
  const persistedConversations = useSelector((state: RootState) => state.conversation.conversations);
  const currentModelId = useSelector((state: RootState) => state.conversation.currentModelId);
  const currentConversationId = useSelector((state: RootState) => state.conversation.currentConversationId);

  // 使用Redux中的会话数据
  const [conversationsItems, setConversationsItems] = React.useState<ConversationType[]>(
    persistedConversations.length > 0 ? [...persistedConversations].filter(conv => conv.mode === mode).reverse() : []
  )


  const [modelItems, setModelItems] = React.useState(RAG_FLOW_CONFIG.AGENT_LIST.map(e => ({
    key: e.id,
    label: e.name,
    avatar: e.avatar,
    message: [],
    modelItemsOpen: true
  })))

  // 使用Redux中的当前模型ID，如果没有则使用第一个模型
  const [activeKey, setActiveKey] = React.useState(currentModelId)
  const modelItemsOpenChange = (key: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>): void =>{
    event.stopPropagation()
    const newModelItems = modelItems.map(item => {
      if (item.key === key) {
        return {
          ...item,
          modelItemsOpen: !item.modelItemsOpen
        }
      }
      return item
    })
    setModelItems(newModelItems)
  }
  const modelItemsChange = (key: string): void =>{
    if (agent.isRequesting()){
      message.warning('请等待当前会话完成')
      return;
    }
    const newModelItems = modelItems.map(item => {
      if (item.key === key) {
        return {
          ...item,
          modelItemsOpen: true
        }
      }
      return item
    })
    setModelItems(newModelItems)
    setActiveKey(key)
    dispatch(setCurrentModelId(key))
    changeChatAgent(key)
    const currentModelItem: ConversationType[] = []
    conversationsItems.map((item) =>{
      if (item.modelId === key){
        currentModelItem.push(item)
      }
    })
    if (currentModelItem.length){
      onConversationClick(currentModelItem[0].conversation_id)
    }
  }
  useEffect(() => {
    enterMethod()
  }, [])

  const enterMethod = async (): Promise<void> =>{
    let newKey = activeKey
    const modelKay = modelItems.findIndex(item => item.key === activeKey)
    if (modelKay === -1){
      newKey = modelItems[0].key
      dispatch(setCurrentModelId(newKey))
      setActiveKey(newKey)
    }
    changeChatAgent(newKey)

    // 自动添加默认会话
    const newPersistedConversations = [...persistedConversations]
      .filter(conv => conv.mode === mode)
      .filter(conv => modelItems.some(item => item.key === conv.modelId))
    modelItems.map(async (modelItem)=>{
      let index = newPersistedConversations.filter(conv => modelItems.some(item => item.key === conv.modelId)).findIndex(conv => conv.modelId === modelItem.key)
      if (index === -1){
        await dispatch(updateConversation({
          conversationId: `default_${modelItem.key}`,
          name: '默认会话',
          message: [],
          modelId: modelItem.key,
          mode,
        }));
      }
    })

    // 当前选中的会话不存在
    const currentState = store.getState();
    const updatedConversations = currentState.conversation.conversations.filter(conv => modelItems.some(item => item.key === conv.modelId)).filter(conv => conv.mode === mode);
    const currentConversation = currentState.conversation.currentConversationId;
    let index = updatedConversations.findIndex(conv => conv.conversation_id === currentConversation);
    if (index === -1 || currentConversation === ''){
      let newCurrentConversation = updatedConversations.filter(conv => conv.mode === mode).find(conv => conv.modelId === newKey);
      if (newCurrentConversation){
        onConversationClick(newCurrentConversation.conversation_id)
      }
    }
  }

  // 当Redux中的会话数据变化时，更新本地状态
  useEffect(() => {
    setConversationsItems([...persistedConversations].filter(conv => conv.mode === mode).reverse());
  }, [persistedConversations]);


  // 删除选中的会话
  const handleDeleteConversation = async (conversationId: string, e?: React.MouseEvent<HTMLSpanElement>): Promise<void> => {
    e?.stopPropagation();
    await dispatch(deleteConversation(conversationId));
    if (currentConversationId === conversationId){
      setMessages([])
    }
    // 获取最新的 Redux 状态
    const currentState = store.getState();
    const updatedConversations = currentState.conversation.conversations;
    if (conversationId === currentConversationId){
    // 只在当前 agent 下寻找会话
      const currentAgentConversations = updatedConversations.filter(conv => modelItems.some(item => item.key === conv.modelId)).filter(
        conv => conv.modelId === currentModelId && conv.mode === mode
      );

      if (currentAgentConversations.length > 0){
        onConversationClick(currentAgentConversations[0].conversation_id);
      } else {
        onConversationClick('')
      }
    }
  }

  const onConversationClick = (conversationId: string): void => {
    if (agent.isRequesting()){
      message.warning('请等待当前会话完成')
      return;
    }


    // 设置当前活跃会话
    dispatch(setActiveConversation(conversationId));
    // 找到对应会话
    const currentState = store.getState();
    const currentConversationId = currentState.conversation.currentConversationId;
    const conversation = currentState.conversation.conversations.filter(conv => modelItems.some(item => item.key === conv.modelId)).filter(conv => conv.mode === mode).find(
      conv => conv.conversation_id === currentConversationId
    );;

    if (conversation) {
      // 加载会话消息
      setMessages(conversation.message);
      // 如果会话有关联的模型ID，切换到该模型
      if (conversation.modelId) {
        setActiveKey(conversation.modelId);
        changeChatAgent(conversation.modelId);
        dispatch(setCurrentModelId(conversation.modelId));
      }
    }
  };

  return <>
    <div className={styles.searchInput}>
      <Input
        placeholder='搜索'
        size='large'
        suffix={
          <SearchOutlined style={{ color: '#bac4d0' }} />
        }
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      >
      </Input>
    </div>
    {
      modelItems.map(e => (
        <div key={e.key}>
          <div
            className={`${styles.agentItem} ${activeKey === e.key ? styles.active : ''}`}
            onClick={()=> modelItemsChange(e.key)}
          >
            <img src={e.avatar.path ?? agentAvatar} alt={e.label} />
            <span style={{ color: '#000', width: '80%' }}>{e.label}</span>
            <span onClick={(event)=> modelItemsOpenChange(e.key, event)}> <RightOutlined style={{ color: '#979797', fontSize: '14px', cursor: 'pointer', transform: e.modelItemsOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease' }} /> </span>
          </div>
          {e.modelItemsOpen &&
            conversationsItems
              .filter(conv => conv.modelId === e.key || !conv.modelId)
              .filter(conv => modelItems.some(item => item.key === conv.modelId))
              .filter(conv => conv.name.includes(searchValue))
              .map(conv => (
                <div
                  className={`${styles.conversationItem} ${conv.active ? styles.active : ''}`}
                  key={conv.conversation_id}
                  onClick={() => onConversationClick(conv.conversation_id)}
                >
                  <span style={{ color: '#000' }} className={`${styles.conversationTitle}`}>{conv.name}</span>
                  <CloseOutlined onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                    handleDeleteConversation(conv.conversation_id, e)
                  }} className={`${styles.deleteBtn}`} />
                </div>
              ))
          }
        </div>
      ))
    }

  </>
}
