import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MessageInfo } from '@ant-design/x/es/use-x-chat';
import type { ConversationType } from '@/type';

interface ConversationState {
  conversations: ConversationType[];
  currentModelId: string;
  currentConversationId: string;
}

const initialState: ConversationState = {
  conversations: [],
  currentModelId: '',
  currentConversationId: '',
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // 添加或更新会话
    updateConversation: (state, action: PayloadAction<{
      conversationId: string;
      name: string;
      message: MessageInfo<string>[];
      modelId: string;
      mode: "CHAT" | "COMMAND";
    }>) => {
      const { conversationId, name, message, modelId, mode } = action.payload;

      let newModelId = modelId
      if (!modelId){
        newModelId = state.currentModelId
      }

      // 首先检查是否存在相同conversationId的会话
      const index = state.conversations.filter(conv => conv.mode === mode).findIndex(
        conv => conv.conversation_id === conversationId
      );

      if (index !== -1) {
        // 更新现有会话
        state.conversations[index].message = message;
      } else {
        // 如果是default_开头的会话ID，直接添加
        if (conversationId.startsWith("default_")){
          state.conversations.push({
            conversation_id: conversationId,
            name,
            message,
            active: false,
            modelId: newModelId,
            mode
          });
          if (!state.currentConversationId){
            // 重置所有会话的active状态
            state.conversations.forEach(conv => {
              conv.active = conv.conversation_id === conversationId;
            });
            state.currentConversationId = conversationId;
          }
        } else {
          // 如果是服务器返回的真实会话ID，需要找到对应的default会话并更新
          // 优先查找当前活跃的default会话
          let targetIndex = -1;

          if (state.currentConversationId.startsWith("default_")) {
            targetIndex = state.conversations.filter(conv => conv.mode === mode).findIndex(
              conv => conv.conversation_id === state.currentConversationId && conv.modelId === newModelId
            );
          }

          // 如果没找到当前活跃的，则查找同modelId的default会话
          if (targetIndex === -1) {
            targetIndex = state.conversations.filter(conv => conv.mode === mode).findIndex(
              conv => conv.conversation_id.startsWith("default_") && conv.modelId === newModelId
            );
          }

          if (targetIndex !== -1) {

            const realIndex = state.conversations.findIndex(
              conv => conv === state.conversations.filter(conv => conv.mode === mode)[targetIndex]
            );

            state.conversations[realIndex].conversation_id = conversationId;
            state.conversations[realIndex].name = name;
            state.conversations[realIndex].message = message;

            // 如果这是当前活跃的会话，更新currentConversationId
            if (state.currentConversationId.startsWith("default_") &&
                state.conversations[realIndex].modelId === newModelId) {
              state.currentConversationId = conversationId;
            }
          } else {
            // 如果没找到对应的default会话，直接添加新会话
            state.conversations.push({
              conversation_id: conversationId,
              name,
              message,
              active: false,
              modelId: newModelId,
              mode
            });
          }
        }
      }
    },

    // 设置当前活跃会话
    setActiveConversation: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      // 重置所有会话的active状态
      state.conversations.forEach(conv => {
        conv.active = conv.conversation_id === conversationId;
      });

      state.currentConversationId = conversationId;
    },

    // 开启新会话
    setAddConversation: (state, action: PayloadAction<{
      mode: "CHAT" | "COMMAND";
    }>) => {
      const { mode } = action.payload;
      const conversationId = `default_${state.currentModelId}`
      const modelIndex = state.conversations.filter(conv => conv.mode === mode).findIndex(
        conv => conv.conversation_id === conversationId
      );
      if (modelIndex !== -1){
        state.conversations[modelIndex].name = '新会话';


      } else {
        state.conversations.push({
          conversation_id: conversationId,
          name: '新会话',
          message: [],
          active: false,
          modelId: state.currentModelId,
          mode
        });

      }
      // 重置所有会话的active状态
      state.conversations.forEach(conv => {
        conv.active = conv.conversation_id === conversationId;
      });
      state.currentConversationId = conversationId;
    },
    // 设置当前模型ID
    setCurrentModelId: (state, action: PayloadAction<string>) => {
      state.currentModelId = action.payload;
    },

    // 清空当前会话的消息
    clearConversationMessages: (state) => {
      const index = state.conversations.findIndex(
        conv => conv.conversation_id === state.currentConversationId
      );

      if (index !== -1) {
        state.conversations[index].message = [];
      }
    },
    // 删除当前会话
    deleteConversation: (state, action: PayloadAction<string>) => {
      const conversationIdToDelete = action.payload;

      // 找到要删除的会话
      const conversationToDelete = state.conversations.find(
        conv => conv.conversation_id === conversationIdToDelete
      );

      if (!conversationToDelete) return;

      const { modelId, mode } = conversationToDelete;
      const isCurrentActiveConversation = state.currentConversationId === conversationIdToDelete;

      // 删除会话
      state.conversations = state.conversations.filter(
        conv => conv.conversation_id !== conversationIdToDelete
      );

      // 检查该agent(modelId)是否还有其他会话
      const remainingConversationsForAgent = state.conversations.filter(
        conv => conv.modelId === modelId && conv.mode === mode
      );

      let newActiveConversationId = state.currentConversationId;

      // 如果该agent没有会话了，自动添加一个默认会话
      if (remainingConversationsForAgent.length === 0) {
        const defaultConversationId = `default_${modelId}`;

        state.conversations.push({
          conversation_id: defaultConversationId,
          name: '新会话',
          message: [],
          active: false,
          modelId: modelId,
          mode: mode
        });

        // 如果删除的是当前活跃会话，则设置新添加的默认会话为活跃会话
        if (isCurrentActiveConversation) {
          newActiveConversationId = defaultConversationId;
        }
      } else if (isCurrentActiveConversation) {
        // 如果删除的是当前活跃会话，但该agent还有其他会话，则切换到第一个会话
        newActiveConversationId = remainingConversationsForAgent[0].conversation_id;
      }

      // 更新活跃会话
      if (isCurrentActiveConversation) {
        state.conversations.forEach(conv => {
          conv.active = conv.conversation_id === newActiveConversationId;
        });
        state.currentConversationId = newActiveConversationId;
      }
    },
    // 删除所有会话
    deleteAllConversations: (state) => {
      state.conversations = [];
      state.currentConversationId = '';
      state.currentModelId = '';
    },
  },
});

export const {
  updateConversation,
  setActiveConversation,
  setCurrentModelId,
  clearConversationMessages,
  deleteConversation,
  setAddConversation,
  deleteAllConversations
} = conversationSlice.actions;

export default conversationSlice.reducer;