import type { RouteRecordRaw } from 'vue-router'
import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
const routers: AppRoutes = [
  {
    name: 'todo-center',
    path: '/todo-center',
    meta: {
      title: '待办事项',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/todo-center/todo-center')).ToDoCenter
  },
  {
    name: 'done-center',
    path: '/done-center',
    meta: {
      title: '已办事项',
      barRightType: 'operate'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        pageType: 'done'
      }
    },
    component: async () => (await import('@/views/todo-center/todo-center')).ToDoCenter
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '工作中心',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/index')).Entry
  },
  {
    name: 'Entry',
    path: '/',
    redirect: '/index'
  },
  // 适配旧路由
  {
    name: 'todoList-old-route',
    path: '/todoTaskList?type=toDo',
    redirect: '/index',
  },
  {
    name: 'doneList-old-route',
    path: '/todoTaskList?type=done',
    redirect: '/index',
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        pageType: 'done'
      }
    },
  },
  {
    name: 'todo-task',
    path: '/todoTaskList',
    meta: {
      title: '',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/todo-center/todo-center')).ToDoCenter
  }
]

export const routes: RouteRecordRaw[] = [...routers]
