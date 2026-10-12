import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 默认使用localStorage
// 导入您的reducer
import conversation from './conversationSlice';

// 持久化配置
const persistConfig = {
  key: 'root', // 存储的键名
  storage, // 存储引擎
  whitelist: ['conversation'], // 需要持久化的reducer名称列表
};

// 合并所有reducer
const rootReducer = combineReducers({
  conversation
  // yourReducer,
  // 添加其他reducer
});

// 创建持久化的reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略redux-persist的action类型检查
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 创建persistor
export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;