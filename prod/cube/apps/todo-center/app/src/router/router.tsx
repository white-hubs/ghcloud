import type { RouteObject } from 'react-router-dom'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { Overview } from '@/pages/overview/overview'
import { WaitingList } from '@/pages/waiting-list/waiting-list'
import { DoneList } from '@/pages/done-list/done-list'
import { Client } from '@/pages/client/client'

const base = qiankunWindow.__POWERED_BY_QIANKUN__ ? '/portal/agencyCenter' : ''

const Router: RouteObject[] = [
  {
    path: base + '/',
    element: <Client />
  },
  {
    path: base + '/waitingOverview',
    element: <Overview />
  },
  {
    path: base + '/waitingList',
    element: <WaitingList />
  },
  {
    path: base + '/doneList',
    element: <DoneList />
  },
  {
    path: base + '/handover-record',
    element: <DoneList />
  }
]

export default Router
