import { AnswerType, getAgentTool } from '@/api/runtime'
import { DeleteOutlined, UserOutlined, MessageTwoTone, AudioOutlined, AudioMutedOutlined } from '@ant-design/icons'
import { Bubble, type BubbleProps, Prompts, Sender } from '@ant-design/x'
import type { GetProp } from 'antd'
import { createStyles } from 'antd-style'
import React, { useEffect, useState } from 'react'
const agentAvatar = '/resource/v1/ai-assistant/ai-avatar.png'
import { message, Typography } from 'antd'
import remarkGfm from 'remark-gfm'
import Title from 'antd/es/typography/Title'
import ReactMarkdown from 'react-markdown'
import Paragraph from 'antd/es/typography/Paragraph'
import { useChatUtils } from '@/hook/use-chat'
import './chat-list.module.less'
// 导入Redux相关
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { clearConversationMessages, setActiveConversation, setAddConversation, updateConversation } from '@/store/conversationSlice'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from '@/api/auth-store'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { PostMessageEvent } from '@/register'
const voiceOpen = '/resource/v1/ai-assistant/voice-open.mp3'
const voiceClose = '/resource/v1/ai-assistant/voice-close.mp3'
import { RAG_FLOW_CONFIG } from '@/api/dictionary-config'
import type { ConversationType } from '@/type'
import type { MessageInfo } from '@ant-design/x/es/use-x-chat'

const MarkdownRenderer = ({ markdown }: { markdown: string; }): React.JSX.Element => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
  )
}
const renderMarkdown: BubbleProps['messageRender'] = (content) => (
  <Typography>
    <MarkdownRenderer markdown={content} />
  </Typography>
)
const renderCommand: BubbleProps['messageRender'] = (content) => {
  const obj = JSON.parse(content)
  return (
    <Typography>
      {obj.executeResult === 'waiting' && <Title level={5}>下发成功</Title>}
      {obj.executeResult === 'success' && <Title level={5}>执行成功</Title>}
      {obj.executeResult === 'fail' && <Title level={5}>执行失败</Title>}
      {obj.executeResult === 'fail' && <Paragraph>错误原因：{obj.message ?? '--'}</Paragraph>}
    </Typography>
  )
}

const useStyle = createStyles(({ token, css }) => {
  return {
    title: css`
      width: 100%;
      height: 64px;
      background: #f7fbff;
      box-sizing: border-box;
      padding-left: 16px;
      display: flex;
      align-items: center;
      img{
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 8px;
        object-fit: cover;
      }
    `,
    titleInfo: css`
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    `,
    titleName: css`
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: 600;
      color: #121c32;
    `,
    titleDesc: css`
      font-size: 12px;
      font-family: Source Han Sans CN, Source Han Sans CN-Regular;
      font-weight: 500;
      color: #b5bbc9;
    `,
    messages: css`
      flex: 1;
      margin: 0 ${token.paddingLG}px;
      width: calc(100% - 2 * ${token.paddingLG}px);
    `,
    sender: css`
      margin: 0 ${token.paddingLG}px;
      width: calc(100% - 2 * ${token.paddingLG}px);
      margin-bottom: ${token.paddingLG}px;
      display: flex;
      align-items: center;
    `,
    promptsItem: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-right: ${token.paddingLG}px;
    `,
    prompts: css`
      margin-left: ${token.paddingSM}px;
      padding:0;
    `,
    welcome: css`
      .ant-welcome-icon {
        width: 58px;
        height: 58px;
        flex-shrink: 0;
      }
    `,
  }
})

export const ChatList: React.FC = () => {
  const { styles } = useStyle()
  const { scrollChatListToBottom, mode } = useChatUtils()
  const [voiceEnable, setVoiceEnable] = useState(false)
  const { onRequest, messages, agent, currentChatAgent, loading, setMessages, cancelChat } = getAgentTool()
  // 使用Redux
  const dispatch = useDispatch();
  const [modelItems] = React.useState(RAG_FLOW_CONFIG.AGENT_LIST.map(e => ({
    key: e.id,
    label: e.name,
    avatar: e.avatar,
    message: [],
    modelItemsOpen: true
  })))
  // 从Redux获取当前活跃的会话ID
  const currentConversationId = useSelector((state: RootState) => state.conversation.currentConversationId)
  const persistedConversations = useSelector((state: RootState) => state.conversation.conversations).filter(conv => modelItems.some(item => item.key === conv.modelId)).filter(conv => conv.mode === mode);
  const currentModelId = useSelector((state: RootState) => state.conversation.currentModelId);

  useEffect(() => {
    // 找到对应会话
    const conversation = persistedConversations.find(
      conv => conv.conversation_id === currentConversationId
    );

    if (conversation && conversation.mode === mode) {
      // 加载会话消息
      changeMessage(conversation)
    } else {
      // 找到对应会话
      const newConversation = persistedConversations.find(
        conv => conv.mode === mode
      );
      if (newConversation){
        changeMessage(newConversation)
      } else {
        setMessages([]);
      }
    }
    getUserLogo()
  }, [])
  // 刷新、切换租户时，会重置useXChat，但useXChat中记录message使用了自增的idRef，所以需要修改历史记录中的id
  const changeMessage = (conversation: ConversationType): void =>{
    const newMessage = conversation.message.map((message: MessageInfo<string>, key: number) => {
      let id = ''
      if (message && message.id && typeof message.id === 'string' && (parseInt(message.id.substring(3)) >= 10000)){
        id = message.id
      } else {
        id = `msg_${key + 10000}`
      }
      return {
        ...message,
        id: id
      }
    })
    dispatch(updateConversation({
      conversationId: conversation.conversation_id,
      message: newMessage,
      name: conversation.name,
      modelId: conversation.modelId ?? '',
      mode: conversation.mode
    }))
    setMessages(newMessage);
  }
  useEffect(() => {
  }, [messages])
  useEffect(() => {
    if (currentConversationId && messages.length){
      dispatch(updateConversation({
        conversationId: currentConversationId,
        name: '',
        message: messages,
        modelId: currentModelId,
        mode,
      }));
    }
  }, [messages])

  // 添加事件监听器，处理会话更新
  useEffect((): (() => void) => {
    const handleConversationUpdate = async (event: CustomEvent): Promise<void> => {
      const { conversation_id, message, modelId, name } = event.detail;
      dispatch(updateConversation({
        conversationId: conversation_id,
        name: name,
        message,
        modelId: modelId,
        mode
      }));
      // 设置当前活跃会话
      dispatch(setActiveConversation(conversation_id));
    };

    window.addEventListener('update_conversation', handleConversationUpdate as unknown as EventListener);

    return () => {
      window.removeEventListener('update_conversation', handleConversationUpdate as unknown as EventListener);
    };
  }, [dispatch]);
  const getUserLogo = async (): Promise<void>=>{
    const res = await new CubeOuaaService(authStore).getUserInfo()
    if (res && res.fileVO?.id){
      const logoRes = await new CubeAuthService(authStore.terminal, authStore.tenant, authStore.token).getImage(
        res.fileVO.id
      )
      if (logoRes) {
        setUserLogo(logoRes.data.path)
      }
    }
  }
  const [userLogo, setUserLogo] = React.useState('')
  const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
      placement: 'start',
      // typing: { step: 5, interval: 20 },
      avatar: { src: <img src={currentChatAgent?.avatar.path ?? agentAvatar} alt='avatar' />, style: { width: '46px', height: '46px' }, shape: "square" },
      messageRender (items) {
        try {
          const res = JSON.parse(items) as { type: AnswerType; value: string; }
          switch (res.type) {
            case AnswerType.COMMAND:
              return renderCommand(res.value)
            case AnswerType.MARKDOWN:
              return renderMarkdown(res.value)
            case AnswerType.TEXT:
              return res.value
            default:
              return res.value
          }
        } catch {

        }

        return items || undefined
      },
    },
    local: {
      placement: 'end',
      avatar: { icon: userLogo ? <img src={userLogo} alt="" /> : <UserOutlined />, style: { background: userLogo ? '' : '#1578ff', width: '46px', height: '46px' }, shape: "square" },
    },
  }
  const [content, setContent] = React.useState('')
  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }, index) => ({
    key: id,
    role: status === 'local' ? 'local' : 'ai',
    content: message,
    loading: index === messages.length - 1 && loading
  }))
  const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
    {
      key: 'clear-message',
      description: '清空会话内容',
      icon: <DeleteOutlined style={{ color: '#FF4D4F' }} />,
    }
  ]
  const senderAddPromptsItems: GetProp<typeof Prompts, 'items'> = [
    {
      key: 'add-message',
      description: '开启新会话',
      icon: <MessageTwoTone />,
    }
  ]

  const voiceTipsAudioMap = {
    'open': new Audio(voiceOpen),
    'close': new Audio(voiceClose)
  }

  const onSubmit = (nextContent: string): void => {
    if (!currentConversationId){
      // 防止意外导致没有选中任何一个会话
      message.info('请选择一个会话')
    }
    onRequest(nextContent)
    setContent('')
    scrollChatListToBottom()
  }
  const onCancel = (): void => {
    setContent('')
    scrollChatListToBottom()
    cancelChat()
  }
  const addNewConversation = (): void => {
    setMessages([])
    dispatch(setAddConversation({ mode }));

  }
  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    const { data } = info
    if (agent.isRequesting()){
      message.warning('请等待当前会话完成')
      return;
    }
    switch (data.key) {
      case 'clear-message':
        setMessages([])
        dispatch(clearConversationMessages());

        break
      case 'add-message':
        addNewConversation()
        break
      default:
        break
    }
  }

  return (
    <>
      <div className={styles.title}>
        <img src={currentChatAgent?.avatar.path ?? agentAvatar} alt='avatar' />
        <div className={styles.titleInfo}>
          <span className={styles.titleName}>{currentChatAgent?.name}</span>
          <span className={styles.titleDesc}>{mode === 'COMMAND' ? currentChatAgent?.description : '我是您的专属智能助理，支持写作、问答、翻译等多种场景。'}</span>
        </div>
      </div>
      <Bubble.List
        items={items.length ? items : []}
        roles={roles}
        className={`${styles.messages} chat-message-list`}
      />
      <div className={styles.promptsItem} >
        {mode !== 'COMMAND' && <Prompts items={senderAddPromptsItems} onItemClick={onPromptsItemClick} className={styles.prompts} />}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick} className={styles.prompts} />
      </div>
      <div className={styles.sender}>
        {
          mode === 'COMMAND' &&
          <div
            onClick={()=>{
              setVoiceEnable(!voiceEnable)
              window.parent.postMessage({
                type: PostMessageEvent.VOICE_ENABLE,
                data: voiceEnable
              }, '*')
              if (voiceEnable) {
                voiceTipsAudioMap['close'].play()
              } else {
                voiceTipsAudioMap['open'].play()
              }
            }}
          >
            { voiceEnable ? <AudioOutlined style={{ fontSize: 35, marginRight: 16, cursor: 'pointer' }} /> : <AudioMutedOutlined style={{ fontSize: 35, marginRight: 16, cursor: 'pointer' }} />}
          </div>
        }
        <Sender
          placeholder='请输入...'
          // disabled={!currentChatAgent?.sessionId}
          value={content}
          onSubmit={onSubmit}
          onChange={setContent}
          onCancel={onCancel}
          loading={agent.isRequesting()}
        />
      </div>
    </>
  )
}
