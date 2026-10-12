import { useState } from 'react'
import styles from './client.module.less'
import { AllIcon } from './components/icons/all-icon'
import { ToDoIcon } from './components/icons/todo-icon'
import { DoneIcon } from './components/icons/done-icon'
import { Overview } from '../overview/overview'
import { WaitingList } from '../waiting-list/waiting-list'
import { DoneList } from '../done-list/done-list'

/** Client使用 */
export const Client = (): JSX.Element => {
  const [activeKey, setActiveKey] = useState<'ALL' | "DONE" | "TODO">('TODO')

  return (
    <div className={styles['page']}>
      <div className={styles['left']}>
        <div className={`${styles['item']} ${activeKey === 'TODO' ? styles['active'] : ""}`} onClick={()=>{
          setActiveKey('TODO')
        }}>
          <ToDoIcon active={activeKey === 'TODO'} />
          <span className={styles['label']}>待处理</span>
        </div>

        <div className={`${styles['item']} ${activeKey === 'DONE' ? styles['active'] : ""}`} onClick={()=>{
          setActiveKey('DONE')
        }}>
          <DoneIcon active={activeKey === 'DONE'} />
          <span className={styles['label']}>已处理</span>
        </div>
        <div className={`${styles['item']} ${activeKey === 'ALL' ? styles['active'] : ""}`} onClick={()=>{
          setActiveKey('ALL')
        }}>
          <AllIcon active={activeKey === 'ALL'} />
          <span className={styles['label']}>全部</span>
        </div>
      </div>


      <div className={`${styles['right']} ${styles[`todo-center-client-${activeKey}`]}`}>
        {activeKey === 'ALL' && <Overview />}
        {activeKey === 'TODO' && <WaitingList />}
        {activeKey === 'DONE' && <DoneList />}
      </div>
    </div>
  )
}