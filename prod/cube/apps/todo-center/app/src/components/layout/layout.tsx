import React from 'react'
import { VerticalLine } from '../vertical-line/vertical-line'
import styles from './layout.module.less'
import { Spin } from 'antd'

interface Props {
  title?: string;
  children: React.ReactNode | React.ReactNode[];
  loading?: boolean;
}

/** 布局组件 */
export const Layout = (props: Props): JSX.Element => {
  // 获取传递过来的插槽内容
  const children = React.Children.toArray(props?.children)
  const layoutHeader: React.ReactElement[] = []
  const layoutContent: React.ReactElement[] = []
  const layoutFooterBtn: React.ReactElement[] = []
  const layoutFooterPage: React.ReactElement[] = []
  const defaultSlot: React.ReactElement[] = []
  children.forEach(child => {
    // 传递过来的插槽内容，都是编译为虚拟DOM，故只要去虚拟DOM里的props拿到对应的标记即可
    const { props: childProps } = child as { props: { slotName: string; }; }

    // 判断slotName属于哪一个位置
    switch (childProps.slotName) {
      case 'header':
        layoutHeader.push(child as React.ReactElement)
        break
      case 'content':
        layoutContent.push(child as React.ReactElement)
        break
      case 'footer-btn':
        layoutFooterBtn.push(child as React.ReactElement)
        break
      case 'footer-page':
        layoutFooterPage.push(child as React.ReactElement)
        break
      default:
        defaultSlot.push(child as React.ReactElement)
        break
    }
  })

  return (
    <Spin spinning={props.loading ?? false} size='large' wrapperClassName={styles['spin-wrapper']}>
      <div className={`${styles['layout-container']} cube-todo-center-app-layout`}>
        <div className={styles['layout-header']}>
          <VerticalLine title={props.title} />
          {layoutHeader}
        </div>
        <div className={`${styles['layout-content']} todo-layout-content`} style={{ height: (layoutFooterBtn.length || layoutFooterPage.length) ? 'calc(100% - 125px)' : 'calc(100% - 55px)' }}>
          {layoutContent}
        </div>
        {
          !!(layoutFooterBtn.length || layoutFooterPage.length) &&
          <div className={styles['layout-footer']}>
            <div className={styles['footer-btn']}>{layoutFooterBtn}</div>
            <div className={styles['footer-page']}>{layoutFooterPage}</div>
          </div>
        }
      </div>
    </Spin>
  )
}
